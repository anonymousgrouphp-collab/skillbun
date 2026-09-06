import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import {
  apiError,
  enforceEmployeeRateLimit,
  requireWorkforceAdmin,
  validateEmployeeId,
} from '@/utils/server/workforceEmployees';
import { generateExtensionLetterPdf } from '@/utils/server/pdf/extensionLetterGenerator';

export const runtime = 'nodejs';
export const maxDuration = 30;

function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function POST(request) {
  try {
    const admin = await requireWorkforceAdmin(request);
    if (admin.response) return admin.response;

    const limited = await enforceEmployeeRateLimit(request, admin.uid);
    if (limited) return limited;

    let body = {};
    try {
      body = await request.json();
    } catch {
      return apiError('Payload must be valid JSON.', 400, 'BAD_REQUEST');
    }

    const { employeeId, new_contract_end_date, original_reference_id } = body;
    if (!employeeId || typeof employeeId !== 'string') {
      return apiError('employeeId is required.', 400, 'VALIDATION_ERROR');
    }

    const idCheck = validateEmployeeId(employeeId);
    if (!idCheck.isValid) return apiError(idCheck.error, 400, 'VALIDATION_ERROR');
    if (!isValidDateOnly(new_contract_end_date)) {
      return apiError('new_contract_end_date must be a valid YYYY-MM-DD date.', 400, 'VALIDATION_ERROR');
    }

    const db = getFirebaseAdminFirestore();
    const doc = await db.collection('employees').doc(employeeId).get();

    if (!doc.exists) {
      return apiError('Employee record not found.', 404, 'NOT_FOUND');
    }

    const employeeData = doc.data();
    const { buffer, filename, referenceId, metadataSnapshot } = await generateExtensionLetterPdf(
      {
        ...employeeData,
        id: doc.id,
      },
      {
        newContractEndDate: new_contract_end_date,
        originalReferenceId: original_reference_id,
      }
    );

    // An extension is an issued legal document, not merely a preview download.
    // Keep the immutable render snapshot in the workforce audit trail and align
    // the active contract record with the letter that was issued.
    const now = new Date();
    const batch = db.batch();
    batch.create(db.collection('workforce_docs').doc(referenceId), {
      id: referenceId,
      employee_id: doc.id,
      doc_type: 'EXTENSION_LETTER',
      title: 'Extension of Internship Tenure',
      metadata_snapshot: metadataSnapshot,
      issued_by: admin.email || admin.uid || 'admin',
      issued_at: now,
    });
    batch.update(doc.ref, {
      contract_end_date: new Date(`${new_contract_end_date}T00:00:00.000Z`),
      status: 'EXTENDED',
      updated_at: now,
    });
    await batch.commit();

    const url = new URL(request.url);
    const format = url.searchParams.get('format');

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        referenceId,
        filename,
        pdfBase64: buffer.toString('base64'),
        metadataSnapshot,
      });
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-SkillBun-Reference-Id': referenceId,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[Workforce PDF Extension Generation Error]', error);
    return apiError(error?.message || 'Unable to generate Extension Letter PDF.', 500, 'INTERNAL_ERROR');
  }
}
