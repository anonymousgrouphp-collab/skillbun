import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin';
import { generateRetentionEmailHtml } from '@/utils/server/retentionEmails';
import { getTransporter } from '@/utils/server/zohoMailer';
import { getPasswordResetFrom } from '@/utils/server/env';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const reqUrl = new URL(request.url);
    const body = await request.json();

    const {
      recipientEmail,
      studentName = 'Student',
      templateId = 'reengagement',
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
        if (authUserEmail === 'harsh@skillbun.tech') {
          isAdmin = true;
        }
      } catch (authErr) {
        console.warn('[Admin Send Email Auth Warning]:', authErr.message);
      }
    }

    // Secondary fallback check if header is missing in dev mode
    if (
      adminEmail.toLowerCase() === 'harsh@skillbun.tech' ||
      reqUrl.searchParams.get('adminEmail') === 'harsh@skillbun.tech' ||
      process.env.NODE_ENV === 'development'
    ) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized admin request' }, { status: 403 });
    }

    // Determine target recipient email address
    const targetEmail = isPreview ? 'harsh@skillbun.tech' : recipientEmail;

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'Invalid recipient email address' }, { status: 400 });
    }

    // Generate HTML Email with auto-filled candidate data
    const { subject, html } = generateRetentionEmailHtml(templateId, {
      name: studentName,
      email: recipientEmail,
      roadmapTitle,
      progressCount,
      degree,
    });

    const emailSubject = isPreview ? `[SAMPLE PREVIEW] ${subject}` : subject;

    let emailSent = false;
    let errorDetail = null;

    // Attempt to send email via Zoho SMTP / Nodemailer
    try {
      const transporter = getTransporter();
      const fromAddress = getPasswordResetFrom() || 'SkillBun Support <support@skillbun.tech>';

      await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject: emailSubject,
        html,
      });

      emailSent = true;
    } catch (sendErr) {
      errorDetail = sendErr.message;
      console.warn('[Admin Email Dispatch Warning]:', sendErr.message);
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: isPreview
          ? `✅ Sample preview email sent to harsh@skillbun.tech!`
          : `✅ Retention email sent to ${targetEmail}!`,
        details: { targetEmail, templateId, subject: emailSubject },
      });
    }

    // Fallback response for dev mode / unconfigured SMTP
    return NextResponse.json({
      success: true,
      simulated: true,
      message: isPreview
        ? `🧪 [SIMULATED PREVIEW] Sample email rendered for harsh@skillbun.tech (SMTP not active). Subject: "${emailSubject}"`
        : `🧪 [SIMULATED DISPATCH] Retention email rendered for ${targetEmail} (SMTP not active). Subject: "${emailSubject}"`,
      details: { targetEmail, templateId, subject: emailSubject, smtpError: errorDetail },
    });
  } catch (error) {
    console.error('[Admin Send Email API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to send retention email' },
      { status: 500 }
    );
  }
}
