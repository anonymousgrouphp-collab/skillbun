import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { generateRetentionEmailHtml, buildBaseEmailWrapper } from '@/utils/server/retentionEmails';
import {
  buildOfferDispatchEmail,
  buildActivationWelcomeEmail,
  buildExtensionDispatchEmail,
  buildTerminationDispatchEmail,
} from '@/utils/server/workforceEmailTemplates';
import { getTransporter } from '@/utils/server/zohoMailer';
import { getPasswordResetFrom } from '@/utils/server/env';
import { isUserAuthorizedAdmin } from '@/utils/server/workforceEmployees';
import { checkServerRateLimit } from '@/utils/server/rateLimitStore';
import { getClientAddress } from '@/utils/server/requestUtils';

export const runtime = 'nodejs';

const ADMIN_CONFIRMATION_EMAIL = 'harsh@skillbun.tech';

const EMAIL_RATE_LIMITS = [
  { name: 'emailMinute', windowMs: 60 * 1000, maxRequests: 10, getSubject: ({ uid }) => `user:${uid}` },
  { name: 'emailIpHour', windowMs: 60 * 60 * 1000, maxRequests: 60, getSubject: ({ address }) => `ip:${address}` },
];

export async function POST(request) {
  try {
    const reqUrl = new URL(request.url);
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 });
    }

    const targetUser = body.targetUser || {};
    const isPreview = Boolean(body.isPreview);
    const forceOverride = Boolean(body.forceOverride);
    const templateId = String(body.templateId || 'welcome_v1').trim();
    const studentName = String(body.studentName || targetUser.name || 'Student').trim();
    const recipientEmail = String(body.recipientEmail || targetUser.email || '').trim().toLowerCase();
    const roadmapTitle = String(body.roadmapTitle || targetUser.roadmapTitle || 'Full Stack Web Development').trim();
    const progressCount = Number(body.progressCount || targetUser.completedNodesCount || 10) || 0;
    const degree = String(body.degree || targetUser.degree || 'B.Tech - Computer Science').trim();

    // 0. Verify Admin Authorization — Bearer token required, no fallbacks
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Authentication required: Bearer token missing.' }, { status: 401 });
    }

    let authUserEmail = '';

    try {
      const adminAuth = getFirebaseAdminAuth();
      if (!adminAuth) {
        return NextResponse.json({ error: 'Server authentication configuration error.' }, { status: 500 });
      }
      const decodedToken = await adminAuth.verifyIdToken(token);
      authUserEmail = (decodedToken.email || '').toLowerCase();
      const isAdmin = await isUserAuthorizedAdmin(decodedToken);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
      }

      // Rate limiting
      const address = getClientAddress(request);
      const rateLimit = await checkServerRateLimit({ namespace: 'adminEmail', subject: { uid: decodedToken.uid, address }, limits: EMAIL_RATE_LIMITS, increment: true });
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many email requests. Please wait.' }, { status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))) } });
      }
    } catch (authErr) {
      console.warn('[Admin Send Email Auth Warning]:', authErr.message);
      return NextResponse.json({ error: 'Invalid or expired authentication token.' }, { status: 401 });
    }


    const customSubject = typeof body.customSubject === 'string' ? body.customSubject.trim() : '';
    const customHtml = typeof body.customHtml === 'string' ? body.customHtml.trim() : '';

    // Helper to resolve email subject & html based on template or custom override
    const resolveEmailContent = (tId, data) => {
      if (customHtml) {
        const sub = customSubject || `SkillBun Notification for ${data.name}`;
        return {
          subject: sub,
          html: customHtml.includes('<html') ? customHtml : buildBaseEmailWrapper(customHtml, sub, !tId.startsWith('transactional') && !tId.startsWith('workforce'), data.email),
          isMarketing: !tId.startsWith('transactional') && !tId.startsWith('workforce'),
        };
      }

      if (tId === 'workforce_offer') {
        const payload = buildOfferDispatchEmail({
          employee: {
            salutation: 'Mr./Ms.',
            full_name: data.name,
            designation: 'Engineering Intern',
            department: 'Technology & Engineering',
            course_degree: data.degree,
            joining_date: new Date(),
            contract_end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            stipend_amount: 0,
            personal_email: data.email,
            work_email: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'intern'}@skillbun.tech`,
          },
          referenceId: 'SB-OFF-2026-DEMO01',
          credentials: {
            work_email: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'intern'}@skillbun.tech`,
            password: 'TempPassword#2026',
            access_notes: 'Initial Zoho Mail Enterprise Provisioning',
          },
        });
        return { subject: customSubject || payload.subject, html: payload.html, isMarketing: false };
      }

      if (tId === 'workforce_activation') {
        const payload = buildActivationWelcomeEmail({
          employee: {
            salutation: 'Mr./Ms.',
            full_name: data.name,
            designation: 'Software Engineering Intern',
            department: 'Core Platform Engineering',
            joining_date: new Date(),
            personal_email: data.email,
            work_email: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'intern'}@skillbun.tech`,
          },
          credentials: {
            work_email: `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'intern'}@skillbun.tech`,
            password: 'TempPassword#2026',
            access_notes: 'Active Zoho Mail Enterprise Account',
          },
        });
        return { subject: customSubject || payload.subject, html: payload.html, isMarketing: false };
      }

      if (tId === 'workforce_extension') {
        const payload = buildExtensionDispatchEmail({
          employee: {
            salutation: 'Mr./Ms.',
            full_name: data.name,
            designation: 'Engineering Intern',
            department: 'Tech Team',
            joining_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            contract_end_date: new Date(),
            personal_email: data.email,
          },
          referenceId: 'SB-EXT-2026-DEMO01',
          newContractEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        });
        return { subject: customSubject || payload.subject, html: payload.html, isMarketing: false };
      }

      if (tId === 'workforce_termination') {
        const payload = buildTerminationDispatchEmail({
          employee: {
            salutation: 'Mr./Ms.',
            full_name: data.name,
            designation: 'Engineering Intern',
            department: 'Tech Team',
            joining_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            contract_end_date: new Date(),
            personal_email: data.email,
          },
          reasonCode: 'COMPLETED',
          reason: 'Successful completion of internship tenure and deliverables.',
          grantedCredentials: [
            'Certificate of Internship Completion (SB-INT-2026-DEMO01)',
            'Practical Training Completion Certificate (SB-TRN-2026-DEMO01)',
            'Official Letter of Recommendation (SB-LOR-2026-DEMO01)',
          ],
          effectiveDate: new Date().toISOString().slice(0, 10),
        });
        return { subject: customSubject || payload.subject, html: payload.html, isMarketing: false };
      }

      const res = generateRetentionEmailHtml(templateId, data);
      return {
        subject: customSubject || res.subject,
        html: res.html,
        isMarketing: !templateId.startsWith('transactional_alert'),
      };
    };

    // 1. Instant HTML Preview Mode
    if (isPreview) {
      const { subject, html } = resolveEmailContent(templateId, {
        name: studentName,
        email: recipientEmail || ADMIN_CONFIRMATION_EMAIL,
        roadmapTitle,
        progressCount,
        degree,
      });

      const plainTextBody = `Hi ${studentName},\n\n${subject}\n\nVisit SkillBun at https://skillbun.tech to check your interactive tech career roadmaps, encrypted study guides, and verified certificates.`;

      return NextResponse.json({
        success: true,
        isPreview: true,
        preview: {
          templateId,
          subject,
          html,
          plainTextBody,
          to: recipientEmail || ADMIN_CONFIRMATION_EMAIL,
          studentName,
        },
      });
    }

    // 2. Production Send Mode
    const targetEmail = isPreview ? ADMIN_CONFIRMATION_EMAIL : (recipientEmail || ADMIN_CONFIRMATION_EMAIL);
    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid recipient email address is required.' }, { status: 400 });
    }

    // Check if recipient has unsubscribed from marketing emails
    if (!isPreview && !forceOverride && !templateId.startsWith('transactional_alert') && !templateId.startsWith('workforce')) {
      try {
        const db = getFirebaseAdminFirestore();
        if (db) {
          const docRef = await db.collection('unsubscribes').doc(targetEmail.toLowerCase()).get();
          if (docRef.exists) {
            return NextResponse.json({
              error: `Recipient (${targetEmail}) has unsubscribed from SkillBun marketing emails. Use "⚡ Force Send" to override if necessary.`,
              isUnsubscribed: true,
            }, { status: 400 });
          }
        }
      } catch (unsubErr) {
        console.warn('[Unsubscribe Check Warning]:', unsubErr.message);
      }
    }

    // Generate HTML Email
    const { subject, html } = resolveEmailContent(templateId, {
      name: studentName,
      email: targetEmail,
      roadmapTitle,
      progressCount,
      degree,
    });

    const plainTextBody = `Hi ${studentName},\n\n${subject}\n\nVisit SkillBun at https://skillbun.tech to check your interactive tech career roadmaps, encrypted study guides, and verified certificates.\n\nTo manage notification preferences or unsubscribe: https://skillbun.tech/settings?action=unsubscribe&email=${encodeURIComponent(targetEmail)}\n\nSkillBun Platform • MSME Registered`;

    const bccRecipients = targetEmail.toLowerCase() !== ADMIN_CONFIRMATION_EMAIL
      ? ADMIN_CONFIRMATION_EMAIL
      : undefined;

    let emailSent = false;
    let smtpResponse = null;
    let errorDetail = null;

    try {
      const transporter = getTransporter();
      const fromAddress = getPasswordResetFrom() || 'SkillBun Support <noreply@skillbun.tech>';
      const unsubscribeHeaderUrl = `https://skillbun.tech/settings?action=unsubscribe&email=${encodeURIComponent(targetEmail)}`;

      smtpResponse = await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        bcc: bccRecipients,
        subject,
        text: plainTextBody,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeHeaderUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Entity-Ref-ID': `sb-email-${Date.now()}`,
        },
      });

      emailSent = true;
    } catch (sendErr) {
      errorDetail = sendErr.message || 'SMTP transmission failure';
      console.warn('[Admin Email Dispatch Warning]:', sendErr);
    }

    if (emailSent) {
      // Record Sent Email Log in Candidate's Firestore Document
      try {
        const db = getFirebaseAdminFirestore();
        if (db) {
          const usersSnap = await db.collection('users').where('email', '==', targetEmail.toLowerCase()).get();
          if (!usersSnap.empty) {
            const userDoc = usersSnap.docs[0];
            const existingLogs = Array.isArray(userDoc.data().sentEmailHistory) ? userDoc.data().sentEmailHistory : [];
            const newLog = {
              templateId,
              subject,
              sentAt: new Date().toISOString(),
              adminEmail: authUserEmail || 'harsh@skillbun.tech',
              forceOverride: Boolean(forceOverride),
            };
            await userDoc.ref.set({
              sentEmailHistory: [...existingLogs, newLog],
            }, { merge: true });
          }
        }
      } catch (logErr) {
        console.warn('[Sent Email History Log Warning]:', logErr.message);
      }

      return NextResponse.json({
        success: true,
        message: `✅ Retention email successfully sent to ${targetEmail}${forceOverride ? ' (FORCE OVERRIDDEN)' : ''}!`,
        messageId: smtpResponse?.messageId || null,
        sentTemplateId: templateId,
        bcc: bccRecipients || null,
      });
    } else {
      return NextResponse.json({
        error: `Zoho SMTP Dispatch Error: ${errorDetail || 'Could not connect to Zoho SMTP server.'}`,
      }, { status: 200 });
    }
  } catch (err) {
    console.error('Admin Send Email API Error:', err);
    return NextResponse.json({
      success: false,
      error: 'Internal server error dispatching email.',
    }, { status: 500 });
  }
}
