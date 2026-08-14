import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { validateEmail, validateEnum, validatePlainObject } from '@/utils/server/inputValidator';

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

    const objectCheck = validatePlainObject(rawBody, { fieldName: 'Unsubscribe payload', maxKeys: 4 });
    if (!objectCheck.isValid) {
      return NextResponse.json({ error: objectCheck.error }, { status: 400 });
    }

    const emailCheck = validateEmail(rawBody.email);
    if (!emailCheck.isValid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    const actionCheck = validateEnum(rawBody.action, ['unsubscribe', 'resubscribe'], {
      fieldName: 'action',
      defaultValue: 'unsubscribe',
    });
    if (!actionCheck.isValid) {
      return NextResponse.json({ error: actionCheck.error }, { status: 400 });
    }

    const email = emailCheck.normalizedEmail;
    const action = actionCheck.value;

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
