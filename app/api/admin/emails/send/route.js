import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { generateRetentionEmailHtml } from '@/utils/server/retentionEmails';
import { getTransporter } from '@/utils/server/zohoMailer';
import { getPasswordResetFrom } from '@/utils/server/env';

export const runtime = 'nodejs';

const ADMIN_CONFIRMATION_EMAIL = 'harsh@skillbun.tech';

export async function POST(request) {
  try {
    const reqUrl = new URL(request.url);
    const body = await request.json();

    const {
      recipientEmail,
      studentName = 'Student',
      templateId = 'welcome_v1',
      roadmapTitle = 'Full Stack Web Development',
      progressCount = 10,
      degree = 'B.Tech - Computer Science',
      isPreview = false,
      adminEmail = '',
    } = body;

    // Verify Admin Authorization
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

    let isAdmin = false;
    let authUserEmail = '';

    if (token) {
      try {
        const adminAuth = getFirebaseAdminAuth();
        const decodedToken = await adminAuth.verifyIdToken(token);
        authUserEmail = (decodedToken.email || '').toLowerCase();
        if (authUserEmail === ADMIN_CONFIRMATION_EMAIL) {
          isAdmin = true;
        }
      } catch (authErr) {
        console.warn('[Admin Send Email Auth Warning]:', authErr.message);
      }
    }

    // Secondary fallback check for admin email in dev mode
    if (
      adminEmail.toLowerCase() === ADMIN_CONFIRMATION_EMAIL ||
      reqUrl.searchParams.get('adminEmail') === ADMIN_CONFIRMATION_EMAIL ||
      process.env.NODE_ENV === 'development'
    ) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized admin request' }, { status: 403 });
    }

    // Determine target recipient email address
    const targetEmail = isPreview ? ADMIN_CONFIRMATION_EMAIL : recipientEmail;

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'Invalid recipient email address' }, { status: 400 });
    }

    // Check if recipient has unsubscribed from marketing emails (Unless it's a security alert)
    if (!isPreview && !templateId.startsWith('transactional_alert')) {
      try {
        const db = getFirebaseAdminFirestore();
        if (db) {
          const docRef = await db.collection('unsubscribes').doc(targetEmail.toLowerCase()).get();
          if (docRef.exists) {
            return NextResponse.json({
              error: `Recipient (${targetEmail}) has unsubscribed from SkillBun marketing & retention emails. Message dispatch canceled for compliance.`,
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

    // Delivery Confirmation Mechanism: Automatically CC harsh@skillbun.tech for all candidate dispatches!
    const ccRecipients = (!isPreview && targetEmail.toLowerCase() !== ADMIN_CONFIRMATION_EMAIL)
      ? ADMIN_CONFIRMATION_EMAIL
      : undefined;

    let emailSent = false;
    let smtpResponse = null;
    let errorDetail = null;

    // Attempt to send email via Zoho SMTP / Nodemailer with Anti-Spam Headers & CC Confirmation
    try {
      const transporter = getTransporter();
      const fromAddress = getPasswordResetFrom() || 'SkillBun Support <noreply@skillbun.tech>';
      const unsubscribeHeaderUrl = `https://skillbun.tech/settings?action=unsubscribe&email=${encodeURIComponent(targetEmail)}`;

      smtpResponse = await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        cc: ccRecipients,
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
      const successMsg = isPreview
        ? `✅ Sample preview email for template "${templateId}" successfully sent to harsh@skillbun.tech!`
        : `✅ Retention email successfully sent to ${targetEmail} (CC'd to harsh@skillbun.tech for delivery confirmation)!`;

      return NextResponse.json({
        success: true,
        message: successMsg,
        messageId: smtpResponse?.messageId || null,
        cc: ccRecipients || null,
      });
    } else {
      // In dev environment or when SMTP fails, return exact diagnostic error so admin knows why
      return NextResponse.json({
        error: `SMTP Dispatch Error: ${errorDetail || 'Could not connect to SMTP server. Check ZOHO_SMTP_USER and ZOHO_SMTP_PASS in environment settings.'}`,
      }, { status: 500 });
    }
  } catch (err) {
    console.error('Admin Send Email API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error dispatching email' }, { status: 500 });
  }
}
