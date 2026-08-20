import { NextResponse } from 'next/server';
import { getFirebaseAdminFirestore, getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin';
import {
  apiError,
  enforceEmployeeRateLimit,
  requireWorkforceAdmin,
  validateEmployeeId,
} from '@/utils/server/workforceEmployees';
import { generateWorkforceId, formatWorkforceDisplayId, WORKFORCE_PREFIXES } from '@/utils/server/workforceId';
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

    const {
      employeeId,
      reasonCode = 'COMPLETED',
      reason = '',
      grantInternshipCert = false,
      grantTrainingCert = false,
      grantLor = false,
      revokeAccess = true,
      sendEmail = true,
    } = body;

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
    const referenceId = generateWorkforceId(WORKFORCE_PREFIXES.TERMINATION);

    const grantedCredentials = [];

    // Helper date format
    const toIsoDate = (val) => {
      if (!val) return '';
      if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString().slice(0, 10);
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      return String(val).slice(0, 10);
    };

    const startDate = toIsoDate(employeeData.joining_date);
    const endDate = toIsoDate(employeeData.contract_end_date) || now.toISOString().slice(0, 10);

    // 1. Grant requested verified credentials
    const certBatch = db.batch();

    if (grantInternshipCert) {
      const certId = generateWorkforceId(WORKFORCE_PREFIXES.INTERNSHIP);
      const displayId = formatWorkforceDisplayId(certId);
      const certRef = db.collection('certificates').doc(certId);
      certBatch.set(certRef, {
        id: certId,
        display_id: displayId,
        cert_type: 'INTERNSHIP',
        employee_id: employeeId,
        name: employeeData.full_name,
        email: (employeeData.personal_email || '').trim().toLowerCase(),
        department: employeeData.department,
        designation: employeeData.designation,
        stream_or_track: `${employeeData.designation} (${employeeData.department})`,
        start_date: startDate,
        end_date: endDate,
        issued_by: admin.email || admin.uid || 'SkillBun Admin',
        is_revoked: false,
        createdAt: now,
      });
      grantedCredentials.push(`Certificate of Internship Completion (${displayId})`);
    }

    if (grantTrainingCert) {
      const certId = generateWorkforceId(WORKFORCE_PREFIXES.TRAINING);
      const displayId = formatWorkforceDisplayId(certId);
      const certRef = db.collection('certificates').doc(certId);
      certBatch.set(certRef, {
        id: certId,
        display_id: displayId,
        cert_type: 'TRAINING',
        employee_id: employeeId,
        name: employeeData.full_name,
        email: (employeeData.personal_email || '').trim().toLowerCase(),
        department: employeeData.department,
        designation: employeeData.designation,
        stream_or_track: `Advanced Industry Training: ${employeeData.department}`,
        start_date: startDate,
        end_date: endDate,
        issued_by: admin.email || admin.uid || 'SkillBun Admin',
        is_revoked: false,
        createdAt: now,
      });
      grantedCredentials.push(`Practical Training Completion Certificate (${displayId})`);
    }

    if (grantLor) {
      const certId = generateWorkforceId(WORKFORCE_PREFIXES.LOR);
      const displayId = formatWorkforceDisplayId(certId);
      const certRef = db.collection('certificates').doc(certId);
      certBatch.set(certRef, {
        id: certId,
        display_id: displayId,
        cert_type: 'LOR',
        employee_id: employeeId,
        name: employeeData.full_name,
        email: (employeeData.personal_email || '').trim().toLowerCase(),
        department: employeeData.department,
        designation: employeeData.designation,
        stream_or_track: `Letter of Recommendation - ${employeeData.full_name}`,
        recommendation_text: `During their tenure at SkillBun as ${employeeData.designation}, ${employeeData.full_name} demonstrated exceptional dedication, technical agility, and collaborative problem-solving skills.`,
        start_date: startDate,
        end_date: endDate,
        issued_by: 'Harsh Patel',
        is_revoked: false,
        createdAt: now,
      });
      grantedCredentials.push(`Official Letter of Recommendation (${displayId})`);
    }

    if (grantedCredentials.length > 0) {
      await certBatch.commit();
    }

    // 2. Update Employee Record to TERMINATED
    await employeeRef.update({
      status: 'TERMINATED',
      terminated_at: now,
      terminated_by: admin.email || admin.uid || 'admin',
      termination_reason_code: reasonCode,
      termination_reason: reason || '',
      granted_credentials: grantedCredentials,
      portal_access_revoked: Boolean(revokeAccess),
      portal_access_revoked_at: revokeAccess ? now : null,
      updated_at: now,
    });

    // 3. Revoke Firebase Auth session tokens & user portal flags (if requested)
    let authRevoked = false;
    if (revokeAccess && employeeData.personal_email) {
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
        console.log('[Workforce Terminate] No active Firebase Auth user account to revoke:', authErr?.message);
      }
    }

    // 4. Send Formal Offboarding & Documents Email Notice (if enabled)
    let emailDispatched = false;
    let emailError = null;

    if (sendEmail && employeeData.personal_email) {
      try {
        const emailPayload = buildTerminationDispatchEmail({
          employee: employeeData,
          reasonCode,
          reason,
          grantedCredentials,
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
          title: reasonCode === 'COMPLETED' ? 'Internship Completion & Offboarding Record' : 'Notice of Engagement Conclusion',
          status: 'DISPATCHED',
          metadata_snapshot: {
            reference_id: referenceId,
            full_name: employeeData.full_name,
            personal_email: employeeData.personal_email,
            department: employeeData.department,
            designation: employeeData.designation,
            reason_code: reasonCode,
            reason: reason || '',
            granted_credentials: grantedCredentials,
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
      grantedCredentials,
      authRevoked,
      emailDispatched,
      emailError,
      message: `Offboarding processed successfully. ${grantedCredentials.length} credentials granted. ${emailDispatched ? 'Confirmation email dispatched to candidate.' : ''}`,
    });
  } catch (error) {
    console.error('[Workforce Terminate Error]', error);
    return apiError(error?.message || 'Unable to process offboarding and access update.', 500, 'INTERNAL_ERROR');
  }
}
