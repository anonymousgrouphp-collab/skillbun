import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore, getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin';
import {
  apiError,
  enforceEmployeeRateLimit,
  requireWorkforceAdmin,
  validateEmployeeId,
} from '@/utils/server/workforceEmployees';
import { generateWorkforceId } from '@/utils/server/workforceId';
import { sendMailWithAttachment } from '@/utils/server/zohoMailer';
import { buildTerminationDispatchEmail } from '@/utils/server/workforceEmailTemplates';

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

    const { employeeId, reason, sendEmail = true } = body;
    if (!employeeId || typeof employeeId !== 'string') {
      return apiError('employeeId is required.', 400, 'VALIDATION_ERROR');
    }

    const idCheck = validateEmployeeId(employeeId);
    if (!idCheck.isValid) return apiError(idCheck.error, 400, 'VALIDATION_ERROR');

    const db = getFirebaseAdminFirestore();
    const adminAuth = getFirebaseAdminAuth();

    const employeeRef = db.collection('employees').doc(employeeId);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return apiError('Employee record not found.', 404, 'NOT_FOUND');
    }

    const employeeData = employeeDoc.data();
    const now = new Date();
    const referenceId = generateWorkforceId('SB-TERM');

    // 1. Update Employee Record to TERMINATED & mark portal access revoked
    await employeeRef.update({
      status: 'TERMINATED',
      terminated_at: now,
      terminated_by: admin.email || admin.uid || 'admin',
      termination_reason: reason || 'Administrative conclusion of tenure.',
      portal_access_revoked: true,
      portal_access_revoked_at: now,
      updated_at: now,
    });

    // 2. Revoke all certificates/credentials linked to this employee
    let revokedCertsCount = 0;
    try {
      const [byEmpIdSnap, byEmailSnap] = await Promise.all([
        db.collection('certificates').where('employee_id', '==', employeeId).get(),
        employeeData.personal_email
          ? db.collection('certificates').where('email', '==', employeeData.personal_email.trim().toLowerCase()).get()
          : { empty: true, docs: [] },
      ]);

      const certsToRevoke = new Map();
      byEmpIdSnap.docs?.forEach((doc) => certsToRevoke.set(doc.id, doc.ref));
      byEmailSnap.docs?.forEach((doc) => certsToRevoke.set(doc.id, doc.ref));

      if (certsToRevoke.size > 0) {
        const batch = db.batch();
        certsToRevoke.forEach((ref) => {
          batch.update(ref, {
            is_revoked: true,
            revoked_at: now,
            revoked_by: admin.email || admin.uid || 'admin',
            revocation_reason: 'Employment Terminated - Offboarded',
            updatedAt: now,
          });
        });
        await batch.commit();
        revokedCertsCount = certsToRevoke.size;
      }
    } catch (certRevokeErr) {
      console.warn('[Workforce Terminate] Certificate revocation warning:', certRevokeErr);
    }

    // 3. Revoke Firebase Auth session tokens & user portal flags
    let authRevoked = false;
    if (employeeData.personal_email) {
      try {
        const userRecord = await adminAuth.getUserByEmail(employeeData.personal_email.trim().toLowerCase());
        if (userRecord?.uid) {
          await adminAuth.revokeRefreshTokens(userRecord.uid);
          const userDocRef = db.collection('users').doc(userRecord.uid);
          await userDocRef.set(
            {
              workforce_access: false,
              portal_access_revoked: true,
              portal_access_revoked_at: now,
              updated_at: now,
            },
            { merge: true }
          );
          authRevoked = true;
        }
      } catch (authErr) {
        // Non-blocking if candidate didn't have an auth user account yet
        console.log('[Workforce Terminate] No active Firebase Auth user account to revoke:', authErr?.message);
      }
    }

    // 4. Send Formal Termination Email Notice (if enabled)
    let emailDispatched = false;
    let emailError = null;

    if (sendEmail && employeeData.personal_email) {
      try {
        const emailPayload = buildTerminationDispatchEmail({
          employee: employeeData,
          reason,
          effectiveDate: now.toISOString().slice(0, 10),
        });

        await sendMailWithAttachment({
          to: employeeData.personal_email,
          cc: emailPayload.cc,
          replyTo: emailPayload.replyTo,
          subject: emailPayload.subject,
          html: emailPayload.html,
          text: emailPayload.text,
        });

        emailDispatched = true;

        // Record in workforce_docs
        await db.collection('workforce_docs').doc(referenceId).set({
          id: referenceId,
          employee_id: employeeId,
          doc_type: 'TERMINATION_NOTICE',
          title: 'Notice of Engagement Conclusion & Access Revocation',
          status: 'DISPATCHED',
          metadata_snapshot: {
            reference_id: referenceId,
            full_name: employeeData.full_name,
            personal_email: employeeData.personal_email,
            department: employeeData.department,
            designation: employeeData.designation,
            reason: reason || '',
            effective_date: now.toISOString().slice(0, 10),
          },
          dispatched_to: employeeData.personal_email,
          issued_by: admin.email || admin.uid || 'admin',
          issued_at: now,
        });
      } catch (smtpErr) {
        console.error('[Zoho SMTP Termination Dispatch Failed]', smtpErr);
        emailError = smtpErr?.message || 'SMTP Dispatch failed';
      }
    }

    return NextResponse.json({
      success: true,
      referenceId,
      employeeId,
      revokedCertsCount,
      authRevoked,
      emailDispatched,
      emailError,
      message: emailDispatched
        ? `Employment terminated, portal access revoked, and termination notice email dispatched to ${employeeData.personal_email}.`
        : `Employment terminated and portal access revoked.${emailError ? ` (Email failed: ${emailError})` : ''}`,
    });
  } catch (error) {
    console.error('[Workforce Terminate Error]', error);
    return apiError(error?.message || 'Unable to process termination and access revocation.', 500, 'INTERNAL_ERROR');
  }
}
