import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import {
  getFirebaseAdminProjectId,
  getFirebaseAdminClientEmail,
  getFirebaseAdminPrivateKey,
} from '@/utils/server/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps = [];
  try {
    const projectId = getFirebaseAdminProjectId();
    const clientEmail = getFirebaseAdminClientEmail();
    const privateKey = getFirebaseAdminPrivateKey();

    steps.push({
      step: 'env_check',
      hasProjectId: Boolean(projectId),
      projectIdValue: projectId ? `${projectId.slice(0, 4)}...` : null,
      hasClientEmail: Boolean(clientEmail),
      clientEmailValue: clientEmail ? `${clientEmail.slice(0, 6)}...` : null,
      hasPrivateKey: Boolean(privateKey),
      keyLength: privateKey ? privateKey.length : 0,
      hasBegin: privateKey ? privateKey.includes('-----BEGIN PRIVATE KEY-----') : false,
      hasEnd: privateKey ? privateKey.includes('-----END PRIVATE KEY-----') : false,
    });

    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json({
        success: false,
        message: 'Missing Firebase Admin environment variables on Vercel',
        steps,
      }, { status: 200 });
    }

    let app;
    const existing = getApps().find((a) => a.name === 'skillbun-test-diag');
    if (existing) {
      app = existing;
      steps.push({ step: 'app_reused', name: app.name });
    } else {
      const credential = cert({
        projectId,
        clientEmail,
        privateKey,
      });
      steps.push({ step: 'cert_created' });

      app = initializeApp({ credential }, 'skillbun-test-diag');
      steps.push({ step: 'app_initialized' });
    }

    const auth = getAuth(app);
    steps.push({ step: 'auth_obtained', ok: Boolean(auth) });

    const db = getFirestore(app);
    try {
      db.settings({ preferRest: true });
      steps.push({ step: 'firestore_preferRest_set' });
    } catch (se) {
      steps.push({ step: 'firestore_settings_skipped', note: se.message });
    }

    try {
      const snap = await db.collection('unsubscribes').limit(1).get();
      steps.push({ step: 'firestore_query_success', count: snap.size });
    } catch (qe) {
      steps.push({ step: 'firestore_query_error', error: qe.message });
    }

    return NextResponse.json({
      success: true,
      message: 'Diagnostic completed',
      steps,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
      steps,
    }, { status: 200 });
  }
}
