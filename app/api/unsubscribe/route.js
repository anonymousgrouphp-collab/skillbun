import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = (searchParams.get('email') || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ unsubscribed: false });
    }

    const db = getFirebaseAdminFirestore();
    if (db) {
      const docRef = await db.collection('unsubscribes').doc(email).get();
      if (docRef.exists) {
        return NextResponse.json({ unsubscribed: true, date: docRef.data()?.unsubscribedAt || null });
      }
    }

    return NextResponse.json({ unsubscribed: false });
  } catch (err) {
    return NextResponse.json({ unsubscribed: false });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const action = body.action || 'unsubscribe'; // 'unsubscribe' | 'resubscribe'

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to update email preferences' }, { status: 500 });
  }
}
