import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { isUserAuthorizedAdmin } from '@/utils/server/workforceEmployees';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    // 0. Verify Admin Authorization
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Authentication required for admin access' }, { status: 401 });
    }

    try {
      const adminAuth = getFirebaseAdminAuth();
      if (!adminAuth) {
        return NextResponse.json({ error: 'Server authentication configuration error' }, { status: 500 });
      }
      const decodedToken = await adminAuth.verifyIdToken(token);
      const isAdmin = await isUserAuthorizedAdmin(decodedToken);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
      }
    } catch (authErr) {
      return NextResponse.json({ error: 'Invalid or expired authentication token' }, { status: 401 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional if caller is doing a bulk reset
    }

    const { resetAll = true, targetEmail, targetUid } = body;
    const db = getFirebaseAdminFirestore();
    if (!db) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // 1. Single User Reset
    if (!resetAll && (targetUid || targetEmail)) {
      let userDocRef = null;

      if (targetUid) {
        const docRef = db.collection('users').doc(targetUid);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          userDocRef = docRef;
        }
      }

      if (!userDocRef && targetEmail) {
        const emailSnap = await db.collection('users').where('email', '==', targetEmail.trim().toLowerCase()).limit(1).get();
        if (!emailSnap.empty) {
          userDocRef = emailSnap.docs[0].ref;
        }
      }

      if (!userDocRef) {
        return NextResponse.json({ error: 'Student document not found in Firestore' }, { status: 404 });
      }

      await userDocRef.set({ sentEmailHistory: [] }, { merge: true });
      return NextResponse.json({
        success: true,
        message: `Sent email counter reset to 0 for ${targetEmail || targetUid}.`,
        resetCount: 1,
      });
    }

    // 2. Bulk Reset: Clear sentEmailHistory for all users in Firestore
    const usersSnap = await db.collection('users').get();
    if (usersSnap.empty) {
      return NextResponse.json({
        success: true,
        message: 'No student records found to reset.',
        resetCount: 0,
      });
    }

    // Firestore batch writes limit is 500 ops per batch
    const docs = usersSnap.docs;
    const batchSize = 400;
    let totalUpdated = 0;

    for (let i = 0; i < docs.length; i += batchSize) {
      const chunk = docs.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach((docSnap) => {
        batch.set(docSnap.ref, { sentEmailHistory: [] }, { merge: true });
        totalUpdated++;
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Sent email counters successfully reset to 0 for all ${totalUpdated} students.`,
      resetCount: totalUpdated,
    });
  } catch (err) {
    console.error('Reset Sent Email Counter API Error:', err);
    return NextResponse.json({
      error: 'Internal server error while resetting sent email counters.',
      details: err?.message,
    }, { status: 500 });
  }
}
