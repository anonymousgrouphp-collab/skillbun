import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { validateEmail, validateSchema } from '@/utils/server/inputValidator';
import { checkServerRateLimit } from '@/utils/server/rateLimitStore';
import { getClientAddress } from '@/utils/server/requestUtils';

export const runtime = 'nodejs';

const UNSUBSCRIBE_RATE_LIMITS = [
  { name: 'ipMinute', windowMs: 60 * 1000, maxRequests: 10, getSubject: ({ address }) => `ip:${address}` },
  { name: 'ipHour', windowMs: 60 * 60 * 1000, maxRequests: 60, getSubject: ({ address }) => `ip:${address}` },
  { name: 'emailHour', windowMs: 60 * 60 * 1000, maxRequests: 5, getSubject: ({ email }) => `email:${email}` },
];

export async function GET(request) {
  try {
    const address = getClientAddress(request);
    const ipRateLimit = await checkServerRateLimit({
      namespace: 'unsubscribeGet',
      subject: { address },
      limits: [{ name: 'ipMinute', windowMs: 60 * 1000, maxRequests: 30, getSubject: ({ address }) => `ip:${address}` }],
      increment: true,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const rawEmail = searchParams.get('email');

    if (!rawEmail) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const emailCheck = validateEmail(rawEmail);
    if (!emailCheck.isValid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    const email = emailCheck.normalizedEmail;
    const db = getFirebaseAdminFirestore();
    if (db) {
      const docRef = await db.collection('unsubscribes').doc(email).get();
      if (docRef.exists) {
        return NextResponse.json({ unsubscribed: true, date: docRef.data()?.unsubscribedAt || null });
      }
    }

    return NextResponse.json({ unsubscribed: false });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch subscription status.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const address = getClientAddress(request);

    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 });
    }

    const schemaCheck = validateSchema(rawBody, {
      email: { type: 'email', required: true, label: 'Email address' },
      action: {
        type: 'enum',
        required: false,
        allowedValues: ['unsubscribe', 'resubscribe'],
        defaultValue: 'unsubscribe',
        label: 'Action',
      },
    }, {
      fieldName: 'Unsubscribe payload',
      allowUnknown: false,
      maxKeys: 2,
    });

    if (!schemaCheck.isValid) {
      return NextResponse.json({ error: schemaCheck.error }, { status: 400 });
    }

    const { email, action } = schemaCheck.value;

    const rateLimit = await checkServerRateLimit({
      namespace: 'unsubscribePost',
      subject: { address, email },
      limits: UNSUBSCRIBE_RATE_LIMITS,
      increment: true,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many preference update requests. Please wait a moment.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))) },
        }
      );
    }

    const db = getFirebaseAdminFirestore();
    if (db) {
      if (action === 'unsubscribe') {
        await db.collection('unsubscribes').doc(email).set({
          email,
          unsubscribedAt: new Date().toISOString(),
          source: 'email_footer_link',
        }, { merge: true });
      } else {
        await db.collection('unsubscribes').doc(email).delete();
      }
    }

    return NextResponse.json({
      success: true,
      email,
      unsubscribed: action === 'unsubscribe',
      message: action === 'unsubscribe'
        ? `✅ You have been successfully unsubscribed from SkillBun marketing & retention emails.`
        : `✅ Email notifications re-enabled for ${email}.`,
    });
  } catch (err) {
    console.error('[Unsubscribe API Error]:', err);
    return NextResponse.json({ error: 'Failed to update email preferences.' }, { status: 500 });
  }
}
