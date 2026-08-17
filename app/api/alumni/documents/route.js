import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore, getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin';
import { formatWorkforceDisplayId } from '@/utils/server/workforceId';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const rawQuery = (url.searchParams.get('query') || '').trim();

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    let userEmail = '';
    if (token) {
      try {
        const adminAuth = getFirebaseAdminAuth();
        const decoded = await adminAuth.verifyIdToken(token);
        userEmail = (decoded.email || '').trim().toLowerCase();
      } catch {
        // Fallback to query
      }
    }

    const searchQuery = (rawQuery || userEmail).toLowerCase();
    if (!searchQuery) {
      return NextResponse.json({
        success: false,
        documents: [],
        message: 'Search query (email or reference code) is required.',
      }, { status: 400 });
    }

    const db = getFirebaseAdminFirestore();
    const isEmail = searchQuery.includes('@');
    const isRefCode = searchQuery.startsWith('sb-') || searchQuery.startsWith('skb-') || searchQuery.startsWith('skb/') || searchQuery.includes('/');
    const normalizedRef = searchQuery.toUpperCase().replace(/\//g, '-');

    const results = [];

    // 1. Query certificates collection
    try {
      let certSnap;
      if (isEmail) {
        certSnap = await db.collection('certificates').where('email', '==', searchQuery).get();
      } else if (isRefCode) {
        let docSnap = await db.collection('certificates').doc(normalizedRef).get();
        if (!docSnap.exists && normalizedRef !== searchQuery.toUpperCase()) {
          try {
            docSnap = await db.collection('certificates').doc(searchQuery.toUpperCase()).get();
          } catch {}
        }
        certSnap = { docs: docSnap && docSnap.exists ? [docSnap] : [] };
      } else {
        certSnap = await db.collection('certificates').where('employee_id', '==', searchQuery).get();
      }

      certSnap?.docs?.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          display_id: data.display_id || (data.cert_type === 'ROADMAP' ? doc.id : formatWorkforceDisplayId(doc.id)),
          category: 'CERTIFICATE',
          type: data.cert_type || 'ROADMAP',
          title: data.stream_or_track || data.roadmapTitle || 'Internship Certificate of Completion',
          recipient_name: data.name || '',
          recipient_email: data.email || '',
          department: data.department || '',
          designation: data.designation || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          issued_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || '',
          is_revoked: Boolean(data.is_revoked),
          verification_url: `/certificate/${doc.id}`,
        });
      });
    } catch (certErr) {
      console.warn('[Alumni Cert Query Warning]:', certErr);
    }

    // 2. Query workforce_docs collection
    try {
      let docsSnap;
      if (isEmail) {
        docsSnap = await db.collection('workforce_docs').where('dispatched_to', '==', searchQuery).get();
      } else if (isRefCode) {
        let docSnap = await db.collection('workforce_docs').doc(normalizedRef).get();
        if (!docSnap.exists && normalizedRef !== searchQuery.toUpperCase()) {
          try {
            docSnap = await db.collection('workforce_docs').doc(searchQuery.toUpperCase()).get();
          } catch {}
        }
        docsSnap = { docs: docSnap && docSnap.exists ? [docSnap] : [] };
      } else {
        docsSnap = await db.collection('workforce_docs').where('employee_id', '==', searchQuery).get();
      }

      docsSnap?.docs?.forEach((doc) => {
        const data = doc.data();
        const meta = data.metadata_snapshot || {};
        results.push({
          id: doc.id,
          display_id: data.display_id || formatWorkforceDisplayId(doc.id),
          category: 'WORKFORCE_DOCUMENT',
          type: data.doc_type || 'OFFER_LETTER',
          title: data.title || 'Workforce Document',
          recipient_name: meta.full_name || '',
          recipient_email: data.dispatched_to || meta.personal_email || '',
          department: meta.department || '',
          designation: meta.designation || '',
          start_date: meta.joining_date || '',
          end_date: meta.extended_contract_end_date || meta.contract_end_date || '',
          issued_at: data.issued_at?.toDate ? data.issued_at.toDate().toISOString() : data.issued_at || '',
          is_revoked: Boolean(data.is_revoked),
          verification_url: null,
          pdf_base64: data.pdf_base64 || null,
        });
      });
    } catch (docsErr) {
      console.warn('[Alumni Docs Query Warning]:', docsErr);
    }

    // Sort newest first
    results.sort((a, b) => (b.issued_at || '').localeCompare(a.issued_at || ''));

    return NextResponse.json({
      success: true,
      query: searchQuery,
      count: results.length,
      documents: results,
    });
  } catch (error) {
    console.error('[Alumni Documents API Error]:', error);
    return NextResponse.json({
      success: false,
      error: 'Unable to retrieve alumni records.',
    }, { status: 500 });
  }
}
