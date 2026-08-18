import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { isUserAuthorizedAdmin } from '@/utils/server/workforceEmployees';

export const runtime = 'nodejs';

const ADMIN_CONFIRMATION_EMAIL = 'harsh@skillbun.tech';

async function verifyAdminAuth(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

  if (token) {
    try {
      const adminAuth = getFirebaseAdminAuth();
      if (adminAuth) {
        const decoded = await adminAuth.verifyIdToken(token);
        const isAdmin = await isUserAuthorizedAdmin(decoded);
        if (isAdmin) {
          return { authorized: true, email: (decoded.email || '').toLowerCase(), uid: decoded.uid };
        }
      }
    } catch (e) {
      console.warn('[Admin Certificate [id] Auth Warning]:', e.message);
    }
  }

  // Fallback for local development or founder email
  const url = new URL(request.url);
  const adminEmail = (url.searchParams.get('adminEmail') || '').toLowerCase();
  if (adminEmail === ADMIN_CONFIRMATION_EMAIL || process.env.NODE_ENV === 'development') {
    return { authorized: true, email: ADMIN_CONFIRMATION_EMAIL, uid: 'admin_dev' };
  }

  return { authorized: false, response: NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 }) };
}

export async function GET(request, { params }) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Certificate ID is required.' }, { status: 400 });

    const db = getFirebaseAdminFirestore();
    const certRef = db.collection('certificates').doc(id.trim());
    const certDoc = await certRef.get();

    if (!certDoc.exists) {
      return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: { id: certDoc.id, ...certDoc.data() },
    });
  } catch (err) {
    console.error('[Admin Certificate GET Error]:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Certificate ID is required.' }, { status: 400 });

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 });
    }

    const db = getFirebaseAdminFirestore();
    const certRef = db.collection('certificates').doc(id.trim());
    const certDoc = await certRef.get();

    if (!certDoc.exists) {
      return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
    }

    const updates = {
      updatedAt: new Date(),
    };

    if (typeof body.is_revoked === 'boolean') {
      updates.is_revoked = body.is_revoked;
      updates.revoked_at = body.is_revoked ? new Date() : null;
      updates.revoked_by = body.is_revoked ? auth.email : null;
    }

    if (body.name) updates.name = String(body.name).trim();
    if (body.email) updates.email = String(body.email).trim().toLowerCase();
    if (body.stream_or_track || body.roadmapTitle) {
      updates.stream_or_track = String(body.stream_or_track || body.roadmapTitle).trim();
      updates.roadmapTitle = updates.stream_or_track;
    }
    if (body.score !== undefined) updates.score = Number(body.score);

    await certRef.update(updates);

    return NextResponse.json({
      success: true,
      id,
      updates,
      message: updates.is_revoked !== undefined
        ? (updates.is_revoked ? '🚫 Certificate revoked.' : '✅ Certificate reinstated.')
        : '✅ Certificate updated successfully.',
    });
  } catch (err) {
    console.error('[Admin Certificate PATCH Error]:', err);
    return NextResponse.json({ error: `Update failed: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Certificate ID is required.' }, { status: 400 });

    const db = getFirebaseAdminFirestore();
    const certRef = db.collection('certificates').doc(id.trim());
    const certDoc = await certRef.get();

    if (!certDoc.exists) {
      return NextResponse.json({ error: 'Certificate not found.' }, { status: 404 });
    }

    await certRef.delete();

    return NextResponse.json({
      success: true,
      id,
      message: `🗑️ Certificate (${id}) permanently deleted.`,
    });
  } catch (err) {
    console.error('[Admin Certificate DELETE Error]:', err);
    return NextResponse.json({ error: `Deletion failed: ${err.message}` }, { status: 500 });
  }
}
