import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import {
  apiError,
  enforceEmployeeRateLimit,
  requireWorkforceAdmin,
  validateEmployeeId,
} from '@/utils/server/workforceEmployees';
import {
  buildOfferDispatchEmail,
  buildExtensionDispatchEmail,
  buildTerminationDispatchEmail,
} from '@/utils/server/workforceEmailTemplates';

export const runtime = 'nodejs';

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

    const { employeeId, type, new_contract_end_date, reason, employeeOverride } = body;

    let employeeData = employeeOverride || null;

    if (!employeeData) {
      if (!employeeId || typeof employeeId !== 'string') {
        return apiError('employeeId or employeeOverride is required.', 400, 'VALIDATION_ERROR');
      }

      const idCheck = validateEmployeeId(employeeId);
      if (!idCheck.isValid) return apiError(idCheck.error, 400, 'VALIDATION_ERROR');

      const db = getFirebaseAdminFirestore();
      const employeeDoc = await db.collection('employees').doc(employeeId).get();

      if (!employeeDoc.exists) {
        return apiError('Employee record not found.', 404, 'NOT_FOUND');
      }

      employeeData = { ...employeeDoc.data(), id: employeeDoc.id };
    }

    let payload = null;

    switch (type) {
      case 'OFFER_EMAIL': {
        const referenceId = employeeData.offer_reference_id || 'SB-OFF-2026-PREVIEW';
        payload = buildOfferDispatchEmail({ employee: employeeData, referenceId });
        break;
      }
      case 'EXTENSION_EMAIL': {
        const referenceId = employeeData.extension_reference_id || 'SB-EXT-2026-PREVIEW';
        payload = buildExtensionDispatchEmail({
          employee: employeeData,
          referenceId,
          newContractEndDate: new_contract_end_date,
        });
        break;
      }
      case 'TERMINATION_EMAIL': {
        payload = buildTerminationDispatchEmail({
          employee: employeeData,
          reason,
          effectiveDate: new Date().toISOString().slice(0, 10),
        });
        break;
      }
      default:
        return apiError('Invalid preview type. Must be OFFER_EMAIL, EXTENSION_EMAIL, or TERMINATION_EMAIL.', 400, 'VALIDATION_ERROR');
    }

    return NextResponse.json({
      success: true,
      type,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      recipient: employeeData.personal_email || 'candidate@example.com',
      cc: payload.cc || 'harsh@skillbun.tech',
      replyTo: payload.replyTo || 'harsh@skillbun.tech',
    });
  } catch (error) {
    console.error('[Workforce Email Preview Error]', error);
    return apiError(error?.message || 'Unable to generate email preview.', 500, 'INTERNAL_ERROR');
  }
}
