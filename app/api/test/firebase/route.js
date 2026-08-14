import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const steps = [];
  try {
    const { getFirebaseAdminProjectId, getFirebaseAdminClientEmail, getFirebaseAdminPrivateKey } = await import('@/utils/server/env');
    steps.push({ step: 'env_module_loaded' });
    
    const projectId = getFirebaseAdminProjectId();
    const clientEmail = getFirebaseAdminClientEmail();
    const privateKey = getFirebaseAdminPrivateKey();

    steps.push({
      step: 'env_values',
      hasProjectId: Boolean(projectId),
      hasClientEmail: Boolean(clientEmail),
      hasPrivateKey: Boolean(privateKey),
      keyLength: privateKey ? privateKey.length : 0,
      hasBegin: privateKey ? privateKey.includes('-----BEGIN PRIVATE KEY-----') : false,
      hasEnd: privateKey ? privateKey.includes('-----END PRIVATE KEY-----') : false,
    });

    let adminAppModule, adminAuthModule, adminFirestoreModule;
    try {
      adminAppModule = await import('firebase-admin/app');
      steps.push({ step: 'firebase_admin_app_loaded' });
    } catch (e) {
      steps.push({ step: 'firebase_admin_app_load_failed', error: e.message });
    }

    try {
      adminAuthModule = await import('firebase-admin/auth');
      steps.push({ step: 'firebase_admin_auth_loaded' });
    } catch (e) {
      steps.push({ step: 'firebase_admin_auth_load_failed', error: e.message });
    }

    try {
      adminFirestoreModule = await import('firebase-admin/firestore');
      steps.push({ step: 'firebase_admin_firestore_loaded' });
    } catch (e) {
      steps.push({ step: 'firebase_admin_firestore_load_failed', error: e.message });
    }

    if (!adminAppModule || !projectId || !clientEmail || !privateKey) {
      return NextResponse.json({ success: false, message: 'Setup incomplete', steps }, { status: 200 });
    }

    const { cert, initializeApp, getApps } = adminAppModule;
    let app = getApps().find((a) => a.name === 'skillbun-test-diag');
    if (!app) {
      try {
        const credential = cert({ projectId, clientEmail, privateKey });
        steps.push({ step: 'cert_created' });
        app = initializeApp({ credential }, 'skillbun-test-diag');
        steps.push({ step: 'app_initialized' });
      } catch (e) {
        steps.push({ step: 'app_init_failed', error: e.message, stack: e.stack });
        return NextResponse.json({ success: false, error: e.message, steps }, { status: 200 });
      }
    }

    if (adminAuthModule) {
      try {
        const auth = adminAuthModule.getAuth(app);
        steps.push({ step: 'auth_success', ok: Boolean(auth) });
      } catch (e) {
        steps.push({ step: 'auth_failed', error: e.message });
      }
    }

    if (adminFirestoreModule) {
      try {
        const db = adminFirestoreModule.getFirestore(app);
        steps.push({ step: 'firestore_instance_obtained' });
        try {
          const snap = await db.collection('unsubscribes').limit(1).get();
          steps.push({ step: 'firestore_query_success', count: snap.size });
        } catch (qe) {
          steps.push({ step: 'firestore_query_failed', error: qe.message });
        }
      } catch (e) {
        steps.push({ step: 'firestore_init_failed', error: e.message });
      }
    }

    return NextResponse.json({ success: true, message: 'Diagnostic finished', steps }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack, steps }, { status: 200 });
  }
}
