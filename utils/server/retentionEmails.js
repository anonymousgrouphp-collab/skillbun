import { escapeHtml } from './zohoMailer';

/**
 * SkillBun Ultra-Premium User Retention & Lifecycle Email System
 * Features:
 * - Automatic System Dark/Light Mode Theme Support (prefers-color-scheme)
 * - High-Psychology "Chul Mache" Curiosity & Urgency Copywriting
 * - Dynamic Candidate Auto-Fill ({name}, {email}, {roadmapTitle}, {progressCount}, {degree})
 * - CAN-SPAM Compliance & Functional Unsubscribe Link Integration
 */

export const RETENTION_TEMPLATES = {
  reengagement: {
    id: 'reengagement',
    name: '🐰 1. Re-Engagement Streak Nudge (Inactive User)',
    subject: '🔥 Your {roadmapTitle} streak is cooling down, {name}! 3 mins to rank up',
    description: 'Triggers FOMO and learning streak decay to bring inactive students back.',
    isMarketing: true,
  },
  exam_nudge: {
    id: 'exam_nudge',
    name: '🎓 2. Certification Exam Ready (60%+ Progress)',
    subject: '🏆 You are in the top 7% eligible candidates, {name}! Claim your {roadmapTitle} Cert',
    description: 'High-status invitation for students with 60%+ progress to take the cert exam.',
    isMarketing: true,
  },
  welcome: {
    id: 'welcome',
    name: '🚀 3. Onboarding & Activation (New Signup)',
    subject: '🚀 Don’t stay behind 93% of tech hires, {name}! Activate your 2026 SkillBun roadmap',
    description: 'High-urgency onboarding email pushing candidates to take the 1-min AI quiz.',
    isMarketing: true,
  },
  exam_failed: {
    id: 'exam_failed',
    name: '📚 4. Cooldown Encouragement (Failed Attempt)',
    subject: '⚡ You were so close, {name}! Retake your {roadmapTitle} Exam (100% Free)',
    description: 'Encourages students in 1-hr cooldown with study tips for a guaranteed retake pass.',
    isMarketing: true,
  },
  cert_congrats: {
    id: 'cert_congrats',
    name: '🏆 5. Certificate Achieved (Alumni Upsell)',
    subject: '🎉 Verified Specialist Status Unlocked! Next steps for {name}',
    description: 'Congratulates cert earners & recommends next high-value career tracks.',
    isMarketing: true,
  },
  transactional_alert: {
    id: 'transactional_alert',
    name: '🔒 6. Security & Account Alert (Transactional)',
    subject: '🔒 SkillBun Account Security & Authentication Notice for {name}',
    description: 'Critical account alert. Omits marketing unsubscribe per compliance guidelines.',
    isMarketing: false,
  },
};

function buildBaseEmailWrapper(contentHtml, titleText, isMarketing = true, email = '') {
  const safeEmail = escapeHtml(email);
  const unsubscribeUrl = `https://skillbun.com/settings?action=unsubscribe&email=${encodeURIComponent(email)}`;

  const unsubscribeFooter = isMarketing
    ? `
      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #21262d; font-size: 11px; color: #8b949e; line-height: 1.6;">
        You are receiving this lifecycle notification because you registered on SkillBun. 
        <br>
        To manage email notifications or unsubscribe from marketing updates, 
        <a href="${unsubscribeUrl}" target="_blank" style="color: #00e599; font-weight: 700; text-decoration: underline;">
          Click here to Unsubscribe / Change Preferences
        </a>.
      </div>
    `
    : `
      <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #21262d; font-size: 11px; color: #8b949e;">
        This is an essential security/account alert for ${safeEmail || 'your account'}. Unsubscribe is disabled for transactional security messages.
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(titleText)}</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    /* Auto Dark/Light System Theme Switching */
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #0b0f17 !important; }
      .email-card { background-color: #161b22 !important; border-color: #30363d !important; color: #e6edf3 !important; }
      .email-header { background-color: #0d1117 !important; }
      .text-title { color: #ffffff !important; }
      .text-body { color: #c9d1d9 !important; }
      .text-subtle { color: #8b949e !important; }
      .box-dark { background-color: #0d1117 !important; border-color: #30363d !important; }
    }
    @media (prefers-color-scheme: light) {
      .email-bg { background-color: #f4f6f8 !important; }
      .email-card { background-color: #ffffff !important; border-color: #d0d7de !important; color: #1f2328 !important; }
      .email-header { background-color: #0d1117 !important; }
      .text-title { color: #1f2328 !important; }
      .text-body { color: #24292f !important; }
      .text-subtle { color: #57606a !important; }
      .box-dark { background-color: #f6f8fa !important; border-color: #d0d7de !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #0b0f17; color: #e6edf3;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-bg" style="background-color: #0b0f17; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" class="email-card" style="max-width: 600px; background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Branded Top Banner Header -->
          <tr>
            <td class="email-header" style="background-color: #0d1117; padding: 24px 32px; border-bottom: 2px solid #00e599; text-align: center;">
              <div style="font-family: 'Fredoka', 'Comic Sans MS', cursive, sans-serif; font-size: 28px; font-weight: 800; color: #00e599; letter-spacing: -0.5px;">
                ꌗꀘꀤ꒒꒒ꌃꀎꈤ
              </div>
              <div style="color: #8b949e; font-size: 11px; margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;">
                Hop Into The Right Tech Career • 100% Free Platform
              </div>
            </td>
          </tr>

          <!-- Main Body Canvas -->
          <tr>
            <td class="text-body" style="padding: 34px 32px; font-size: 15px; line-height: 1.65; color: #c9d1d9;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Compliance Footer -->
          <tr>
            <td style="background-color: #0d1117; padding: 24px 32px; border-top: 1px solid #21262d; text-align: center; font-size: 12px; color: #8b949e; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; color: #e6edf3; font-weight: 700; font-size: 13px;">
                SkillBun Interactive Tech Career Platform
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #8b949e;">
                MSME Registered Educational Platform • 100+ Free Roadmaps & Verified QR Certifications.
              </p>
              ${unsubscribeFooter}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateRetentionEmailHtml(templateId, data = {}) {
  const name = escapeHtml(data.name || 'Student');
  const email = escapeHtml(data.email || '');
  const roadmapTitle = escapeHtml(data.roadmapTitle || 'Full Stack Web Development');
  const progressCount = data.progressCount || 12;
  const degree = escapeHtml(data.degree || 'B.Tech - Computer Science');
  const siteUrl = 'https://skillbun.com';

  const templateConfig = RETENTION_TEMPLATES[templateId] || RETENTION_TEMPLATES.reengagement;
  const isMarketing = templateConfig.isMarketing;

  let contentHtml = '';
  let subject = '';

  switch (templateId) {
    case 'welcome':
      subject = `🚀 Don’t stay behind 93% of tech hires, ${name}! Activate your 2026 SkillBun roadmap`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            ⚡ 2026 Tech Hiring Alert
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Hey ${name}, competition isn't waiting. Are you ready?
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            93% of top tech candidates in 2026 start building their skill roadmaps early.
          </p>
        </div>

        <p>While other students waste hundreds of hours scrolling through unstructured YouTube playlists, your <strong>personalized 2026 SkillBun Tech Roadmap</strong> is already generated and unlocked!</p>

        <!-- High-Impact Urgency Box -->
        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #00e599; font-size: 14px; text-transform: uppercase; margin-bottom: 8px;">
            🔥 Unlocked Candidates Dashboard (${degree})
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            ✔ <strong>100+ High-Demand Tech Tracks</strong> (AI/ML, Backend, Full-Stack, DevOps)<br>
            ✔ <strong>SkillBun Vault (SBV1)</strong> encrypted study guides<br>
            ✔ <strong>Bun-Bot AI 24/7</strong> for instant doubts & career counselling<br>
            ✔ <strong>Verified QR Certificate</strong> upon 70%+ score
          </div>
        </div>

        <p style="font-weight: 700; color: #ffffff;">Your first topic node takes less than 3 minutes to complete. Don’t fall behind your batchmates!</p>

        <!-- High-Curiosity CTA -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/quiz" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ⚡ Launch My Career Benchmark & Quiz →
          </a>
        </div>
      `;
      break;

    case 'reengagement':
      subject = `🔥 Your ${roadmapTitle} streak is cooling down, ${name}! 3 mins to rank up`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(239,68,68,0.15); color: #ef4444; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            ⚠️ Learning Streak At Risk
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, don’t let your hard work go to waste!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Your learning momentum on ${roadmapTitle} is about to freeze.
          </p>
        </div>

        <p>You’ve already finished <strong style="color: #00e599;">${progressCount} topic nodes</strong> on <strong>${roadmapTitle}</strong>. Every day you pause, your retention drops and your peers move ahead.</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: #00e599; text-transform: uppercase;">Active Roadmap Progress</span>
            <span style="font-size: 12px; background-color: #21262d; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${progressCount} Nodes Done</span>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
            ${roadmapTitle}
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            🎯 Reaching 60% unlocks your <strong>Official Proctored Exam</strong> & Verified Certificate!
          </div>
        </div>

        <p>It takes only 3 minutes to complete your next topic node. Jump back in now!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ▶️ Resume ${roadmapTitle} & Maintain Streak →
          </a>
        </div>
      `;
      break;

    case 'exam_nudge':
      subject = `🏆 You are in the top 7% eligible candidates, ${name}! Claim your ${roadmapTitle} Cert`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🏆 60%+ Mastery Reached
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Congratulations ${name}! You qualified for certification.
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Only 7% of tech candidates complete enough roadmap nodes to reach this milestone.
          </p>
        </div>

        <div class="box-dark" style="background-color: rgba(0, 229, 153, 0.1); border: 2px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0; text-align: center;">
          <div style="font-size: 13px; font-weight: 800; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            🎉 Exam Unlocked: ${roadmapTitle}
          </div>
          <div style="font-size: 15px; color: #ffffff; font-weight: 700; margin-bottom: 8px;">
            Score 70%+ to mint your Verified SkillBun Certificate!
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            Includes unique QR authenticity verification link & LinkedIn post template.
          </div>
        </div>

        <p>Tech recruiters actively verify candidates via SkillBun QR IDs. Don’t leave your certificate unclaimed!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            🎓 Start Certification Exam Now →
          </a>
        </div>
      `;
      break;

    case 'exam_failed':
      subject = `⚡ You were so close, ${name}! Retake your ${roadmapTitle} Exam (100% Free)`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(239,68,68,0.15); color: #ef4444; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            ⚡ Retake Unlocked
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            You were only a few points away, ${name}!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Every top engineer faces test retakes. The key is reviewing your weak areas.
          </p>
        </div>

        <p>We saw your recent attempt on the <strong>${roadmapTitle} Exam</strong>. Remember: retakes on SkillBun are <strong>100% Free forever</strong>!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #00e599; font-size: 14px; margin-bottom: 8px;">💡 3-Step Strategy to Guarantee 100% Pass:</div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            1️⃣ Open your roadmap tree and read the <strong>SkillBun Vault (SBV1)</strong> guides.<br>
            2️⃣ Ask <strong>Bun-Bot AI</strong> to clarify tricky questions.<br>
            3️⃣ Retake the test once your 1-hour cooldown expires!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📖 Review SBV1 Guides & Retake →
          </a>
        </div>
      `;
      break;

    case 'cert_congrats':
      subject = `🎉 Verified Specialist Status Unlocked! Next steps for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🏆 Verified Alumni Credentials
          </div>
          <h1 class="text-title" style="font-size: 26px; font-weight: 800; color: #00e599; margin: 0 0 8px 0;">
            Congratulations ${name}!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            You have officially earned your verified SkillBun Certificate!
          </p>
        </div>

        <div class="box-dark" style="background-color: rgba(0, 229, 153, 0.12); border: 2px solid #00e599; border-radius: 16px; padding: 24px; text-align: center; margin: 22px 0;">
          <div style="font-size: 12px; font-weight: 800; color: #00e599; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            SkillBun Official Credentials
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">
            ${roadmapTitle} Certified Specialist
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            Tamper-proof public QR verification & printable PDF document.
          </div>
        </div>

        <p style="margin-bottom: 24px;">
          84% of certified candidates post their badge on LinkedIn and add their QR link to their resume. Claim your PDF document now!
        </p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/dashboard/certifications" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📜 View & Share Certificate →
          </a>
        </div>
      `;
      break;

    case 'transactional_alert':
      subject = `🔒 SkillBun Account Security & Authentication Notice for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🔒 Security Notice
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Account Security Alert
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Important authentication alert for ${name}.
          </p>
        </div>

        <p>Hi ${name}, this is an automated security notification regarding your account associated with <strong>${email}</strong>.</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 20px; margin: 22px 0;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 6px;">Account Details:</div>
          <div style="color: #8b949e; font-size: 14px; line-height: 1.6;">
            Email: ${email}<br>
            Academic Track: ${degree}<br>
            Status: Active Secured
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(59,130,246,0.45);">
            🔒 Go to Dashboard Security →
          </a>
        </div>
      `;
      break;

    default:
      subject = `🐰 Important Update from SkillBun for ${name}`;
      contentHtml = `<p>Hi ${name}, resume your learning journey on SkillBun!</p>`;
  }

  const html = buildBaseEmailWrapper(contentHtml, subject, isMarketing, email);

  return { subject, html };
}
