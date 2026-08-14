import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { validateEmail, validateSchema } from '@/utils/server/inputValidator';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
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
