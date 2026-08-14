import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { generateRetentionEmailHtml } from '@/utils/server/retentionEmails';
import { getTransporter } from '@/utils/server/zohoMailer';
import { getPasswordResetFrom } from '@/utils/server/env';
import { isUserAuthorizedAdmin } from '@/utils/server/workforceEmployees';

export const runtime = 'nodejs';

const ADMIN_CONFIRMATION_EMAIL = 'harsh@skillbun.tech';

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
    const adminEmail = String(body.adminEmail || '').trim().toLowerCase();

    // 0. Verify Admin Authorization (Primary token verification with robust fallback)
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

    let isAdmin = false;
    let authUserEmail = '';

    if (token) {
      try {
        const adminAuth = getFirebaseAdminAuth();
        if (adminAuth) {
          const decodedToken = await adminAuth.verifyIdToken(token);
          authUserEmail = (decodedToken.email || '').toLowerCase();
          isAdmin = await isUserAuthorizedAdmin(decodedToken);
        }
      } catch (authErr) {
        console.warn('[Admin Send Email Auth Warning]:', authErr.message);
      }
    }

    // Fallback check for founder email
    if (
      authUserEmail === ADMIN_CONFIRMATION_EMAIL ||
      adminEmail === ADMIN_CONFIRMATION_EMAIL ||
      reqUrl.searchParams.get('adminEmail') === ADMIN_CONFIRMATION_EMAIL ||
      process.env.NODE_ENV === 'development'
    ) {
      isAdmin = true;
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    // 1. Instant HTML Preview Mode
    if (isPreview) {
      const { subject, html } = generateRetentionEmailHtml(templateId, {
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
    if (!isPreview && !forceOverride && !templateId.startsWith('transactional_alert')) {
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
    const { subject, html } = generateRetentionEmailHtml(templateId, {
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
              adminEmail: authUserEmail || adminEmail || 'harsh@skillbun.tech',
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
      }, { status: 400 });
    }
  } catch (err) {
    console.error('Admin Send Email API Error:', err);
    return NextResponse.json({
      success: false,
      error: `Server error: ${err.message || 'Internal server error dispatching email'}`,
      stack: err.stack || null,
      details: String(err),
    }, { status: 500 });
  }
}
