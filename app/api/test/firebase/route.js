import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminFirestore();

    let queryStatus = 'Not executed';
    let docCount = 0;
    if (db) {
      try {
        const snap = await db.collection('unsubscribes').limit(1).get();
        queryStatus = 'Success';
        docCount = snap.size;
      } catch (err) {
        queryStatus = `Query error: ${err.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin & Auth operational on Vercel',
      authConfigured: Boolean(auth),
      firestoreConfigured: Boolean(db),
      firestoreQueryStatus: queryStatus,
      docCount,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    }, { status: 200 });
  }
}
