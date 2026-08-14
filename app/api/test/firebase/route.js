import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminFirestore();
    
    let dbStatus = 'Not Initialized';
    
    if (db) {
      try {
        await db.collection('unsubscribes').limit(1).get();
        dbStatus = 'Connected and Queried';
      } catch (err) {
        dbStatus = `Failed to query: ${err.message}`;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin Checked',
      auth: auth ? 'Initialized' : 'Failed',
      db: dbStatus,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: `Firebase Verification Failed: ${err.message}`,
      stack: err.stack,
    }, { status: 200 }); // 200 so Vercel doesn't intercept it
  }
}
