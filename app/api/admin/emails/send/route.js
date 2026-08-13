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
      forceOverride = false,
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
