import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import {
  apiError,
  enforceEmployeeRateLimit,
  requireWorkforceAdmin,
  validateEmployeeId,
} from '@/utils/server/workforceEmployees';
import { generateOfferLetterPdf } from '@/utils/server/pdf/offerLetterGenerator';
import { generateWorkforceId } from '@/utils/server/workforceId';
import { sendMailWithAttachment } from '@/utils/server/zohoMailer';
import { buildOfferDispatchEmail } from '@/utils/server/workforceEmailTemplates';

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

    const { employeeId } = body;
    if (!employeeId || typeof employeeId !== 'string') {
      return apiError('employeeId is required.', 400, 'VALIDATION_ERROR');
    }

    const idCheck = validateEmployeeId(employeeId);
    if (!idCheck.isValid) return apiError(idCheck.error, 400, 'VALIDATION_ERROR');

    const db = getFirebaseAdminFirestore();
    const employeeRef = db.collection('employees').doc(employeeId);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return apiError('Employee record not found.', 404, 'NOT_FOUND');
    }

    const employeeData = employeeDoc.data();

    // 1. Generate unique reference ID
    const referenceId = generateWorkforceId('SB-OFF');

    // 2. Generate 4-page Offer Letter PDF in-memory buffer
    const { buffer, filename, metadataSnapshot } = await generateOfferLetterPdf(
      {
        ...employeeData,
        id: employeeDoc.id,
      },
      { referenceId }
    );

    // 3. Build email payload
    const emailPayload = buildOfferDispatchEmail({
      employee: employeeData,
      referenceId,
    });

    const now = new Date();

    // 4. Attempt Email Dispatch via Zoho SMTP
    try {
      await sendMailWithAttachment({
        to: employeeData.personal_email,
        cc: emailPayload.cc,
        replyTo: emailPayload.replyTo,
        subject: emailPayload.subject,
        html: emailPayload.html,
        text: emailPayload.text,
        attachments: [
          {
            filename,
            content: buffer,
            contentType: 'application/pdf',
          },
        ],
      });

      // 5. Successful Dispatch -> Record in /workforce_docs and update /employees
      const workforceDocs = db.collection('workforce_docs');
      const docRef = workforceDocs.doc(referenceId);

      const batch = db.batch();

      batch.create(docRef, {
        id: referenceId,
        employee_id: employeeId,
        doc_type: 'OFFER_PACK',
        title: 'Internship Offer Letter & Terms of Engagement',
        status: 'DISPATCHED',
        metadata_snapshot: metadataSnapshot,
        dispatched_to: employeeData.personal_email,
        issued_by: admin.email || admin.uid,
        issued_at: now,
      });

      batch.update(employeeRef, {
        status: 'OFFER_SENT',
        offer_reference_id: referenceId,
        offer_dispatched_at: now,
        updated_at: now,
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        referenceId,
        filename,
        message: `Offer Letter (${referenceId}) dispatched successfully to ${employeeData.personal_email}.`,
      });
    } catch (smtpError) {
      console.error('[Zoho SMTP Dispatch Failed]', smtpError);

      // Record dispatch failure in employee status for admin visibility
      try {
        await employeeRef.update({
          status: 'DISPATCH_FAILED',
          last_dispatch_error: smtpError?.message || 'SMTP transmission failure',
          updated_at: now,
        });
      } catch (updateErr) {
        console.error('[Failed to update employee status to DISPATCH_FAILED]', updateErr);
      }

      // Return fallback download payload with base64 PDF
      return NextResponse.json(
        {
          success: false,
          fallbackDownload: true,
          referenceId,
          filename,
          pdfBase64: buffer.toString('base64'),
          recipient: employeeData.personal_email,
          subject: emailPayload.subject,
          error: `SMTP Dispatch failed: ${smtpError?.message || 'Unknown network error'}. Manual PDF download ready.`,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[Workforce Offer Dispatch Error]', error);
    return apiError('Unable to process offer letter dispatch.', 500, 'INTERNAL_ERROR');
  }
}
