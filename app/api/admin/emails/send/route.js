import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { generateRetentionEmailHtml } from '@/utils/server/retentionEmails';
import { getTransporter } from '@/utils/server/zohoMailer';
import { getPasswordResetFrom } from '@/utils/server/env';
import { isUserAuthorizedAdmin } from '@/utils/server/workforceEmployees';
import { validateSchema } from '@/utils/server/inputValidator';

export const runtime = 'nodejs';

const ADMIN_CONFIRMATION_EMAIL = 'harsh@skillbun.tech';

export async function POST(request) {
  try {
    // 0. Verify Admin Authorization
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    if (!token) {
      return NextResponse.json({ error: 'Authentication required for admin access' }, { status: 401 });
    }

    let authUserEmail = '';
    try {
      const adminAuth = getFirebaseAdminAuth();
      if (!adminAuth) {
        return NextResponse.json({ error: 'Server authentication configuration error' }, { status: 500 });
      }
      const decodedToken = await adminAuth.verifyIdToken(token);
      authUserEmail = (decodedToken.email || '').toLowerCase();
      const isAdmin = await isUserAuthorizedAdmin(decodedToken);
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
      }
    } catch (authErr) {
      return NextResponse.json({ error: 'Invalid or expired authentication token' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 });
    }

    const schemaCheck = validateSchema(body, {
      isPreview: { type: 'boolean', defaultValue: false },
      forceOverride: { type: 'boolean', defaultValue: false },
      studentName: { type: 'string', minLength: 1, maxLength: 100, defaultValue: 'Student' },
      templateId: { type: 'string', minLength: 1, maxLength: 64, pattern: /^[a-zA-Z0-9_-]+$/, defaultValue: 'welcome_v1' },
      roadmapTitle: { type: 'string', minLength: 1, maxLength: 150, defaultValue: 'Full Stack Web Development' },
      progressCount: { type: 'integer', min: 0, max: 10000, defaultValue: 10 },
      degree: { type: 'string', minLength: 1, maxLength: 120, defaultValue: 'B.Tech - Computer Science' },
      recipientEmail: { type: 'email', required: false },
    }, {
      fieldName: 'Email dispatch payload',
      allowUnknown: false,
      maxKeys: 10,
    });

    if (!schemaCheck.isValid) {
      return NextResponse.json({ error: schemaCheck.error }, { status: 400 });
    }

    const {
      isPreview,
      forceOverride,
      studentName,
      templateId,
      roadmapTitle,
      progressCount,
      degree,
      recipientEmail,
    } = schemaCheck.value;

    let targetEmail = ADMIN_CONFIRMATION_EMAIL;
    if (!isPreview) {
      if (!recipientEmail) {
        return NextResponse.json({ error: 'recipientEmail is required for production email dispatch.' }, { status: 400 });
      }
      targetEmail = recipientEmail;
    }

    // Check if recipient has unsubscribed from marketing emails (Unless forceOverride is true or it's a security alert)
    if (!isPreview && !forceOverride && !templateId.startsWith('transactional_alert')) {
      try {
        const db = getFirebaseAdminFirestore();
        if (db) {
          const docRef = await db.collection('unsubscribes').doc(targetEmail.toLowerCase()).get();
          if (docRef.exists) {
            return NextResponse.json({
              error: `Recipient (${targetEmail}) has unsubscribed from SkillBun marketing emails. To force dispatch anyway, use the "⚡ Force Send (Override Unsubscribe)" control.`,
              isUnsubscribed: true,
            }, { status: 400 });
          }
        }
      } catch (unsubErr) {
        console.warn('[Unsubscribe Check Warning]:', unsubErr.message);
      }
    }

    // Generate HTML Email with auto-filled candidate data
    const { subject, html } = generateRetentionEmailHtml(templateId, {
      name: studentName,
      email: targetEmail,
      roadmapTitle,
      progressCount,
      degree,
    });

    const emailSubject = isPreview ? `[SAMPLE PREVIEW] ${subject}` : subject;

    // Plain text version to pass spam filter checks
    const plainTextBody = `Hi ${studentName},\n\n${subject}\n\nVisit SkillBun at https://skillbun.tech to check your interactive tech career roadmaps, encrypted study guides, and verified certificates.\n\nTo manage notification preferences or unsubscribe: https://skillbun.tech/settings?action=unsubscribe&email=${encodeURIComponent(targetEmail)}\n\nSkillBun Platform • MSME Registered`;

    // Delivery Confirmation Mechanism: Automatically BCC harsh@skillbun.tech for all candidate dispatches!
    const bccRecipients = (!isPreview && targetEmail.toLowerCase() !== ADMIN_CONFIRMATION_EMAIL)
      ? ADMIN_CONFIRMATION_EMAIL
      : undefined;

    let emailSent = false;
    let smtpResponse = null;
    let errorDetail = null;

    // Attempt to send email via Zoho SMTP / Nodemailer with Anti-Spam Headers & BCC Confirmation
    try {
      const transporter = getTransporter();
      const fromAddress = getPasswordResetFrom() || 'SkillBun Support <noreply@skillbun.tech>';
      const unsubscribeHeaderUrl = `https://skillbun.tech/settings?action=unsubscribe&email=${encodeURIComponent(targetEmail)}`;

      smtpResponse = await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        bcc: bccRecipients,
        subject: emailSubject,
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
      errorDetail = sendErr.message;
      console.warn('[Admin Email Dispatch Warning]:', sendErr.message);
    }

    if (emailSent) {
      // Record Sent Email Log in Candidate's Firestore Document to prevent duplicate suggestions!
      if (!isPreview && recipientEmail) {
        try {
          const db = getFirebaseAdminFirestore();
          if (db) {
            const usersSnap = await db.collection('users').where('email', '==', recipientEmail.toLowerCase()).get();
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
      }

      const successMsg = isPreview
        ? `✅ Sample preview email for template "${templateId}" successfully sent to harsh@skillbun.tech!`
        : `✅ Retention email successfully sent to ${targetEmail}${forceOverride ? ' (FORCE OVERRIDDEN)' : ''} (BCC'd to harsh@skillbun.tech for delivery confirmation)!`;

      return NextResponse.json({
        success: true,
        message: successMsg,
        messageId: smtpResponse?.messageId || null,
        sentTemplateId: templateId,
        bcc: bccRecipients || null,
      });
    } else {
      return NextResponse.json({
        error: `SMTP Dispatch Error: ${errorDetail || 'Could not connect to SMTP server. Check ZOHO_SMTP_USER and ZOHO_SMTP_PASS in environment settings.'}`,
      }, { status: 500 });
    }
  } catch (err) {
    console.error('Admin Send Email API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error dispatching email' }, { status: 500 });
  }
}
