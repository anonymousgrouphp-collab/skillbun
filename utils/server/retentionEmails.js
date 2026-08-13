import { escapeHtml } from './zohoMailer';

/**
 * SkillBun Ultra-Premium User Retention & Lifecycle Email System
 * Features:
 * - SkillBun Dark/Green Brand Theme
 * - Dynamic Candidate Auto-Fill ({name}, {email}, {roadmapTitle}, {completedNodes}, {degree})
 * - Compliance Rules: Unsubscribe footer on marketing/retention nudges; omitted on transactional emails
 */

export const RETENTION_TEMPLATES = {
  reengagement: {
    id: 'reengagement',
    name: '🐰 1. Re-Engagement Nudge (Inactive User)',
    subject: '🐰 We miss you on SkillBun, {name}! Resume your {roadmapTitle} roadmap',
    description: 'Sent to students inactive for 2+ days to resume their active roadmap nodes.',
    isMarketing: true,
  },
  exam_nudge: {
    id: 'exam_nudge',
    name: '🎓 2. Certification Exam Ready (60%+ Progress)',
    subject: '🎓 You are eligible for your {roadmapTitle} Certificate, {name}!',
    description: 'Nudges students with high progress to take the 50-question cert exam.',
    isMarketing: true,
  },
  welcome: {
    id: 'welcome',
    name: '🚀 3. Onboarding & Activation (New Signup)',
    subject: '🚀 Welcome to SkillBun, {name}! Pick your tech career track',
    description: 'Welcomes new signups and guides them to take the 1-min AI quiz.',
    isMarketing: true,
  },
  exam_failed: {
    id: 'exam_failed',
    name: '📚 4. Cooldown Encouragement (Failed Attempt)',
    subject: '📚 Don’t give up, {name}! Your {roadmapTitle} Retake is 100% Free',
    description: 'Encourages students in 1-hr cooldown to review guides and retake test.',
    isMarketing: true,
  },
  cert_congrats: {
    id: 'cert_congrats',
    name: '🏆 5. Certificate Achieved (Alumni Upsell)',
    subject: '🏆 Congratulations {name}! Claim your verified {roadmapTitle} Certificate',
    description: 'Congratulates cert earners and recommends next skill tracks.',
    isMarketing: true,
  },
  transactional_alert: {
    id: 'transactional_alert',
    name: '🔒 6. Security & Account Alert (Transactional)',
    subject: '🔒 SkillBun Account Security & Activity Alert for {name}',
    description: 'Critical account notification. Omits marketing unsubscribe per compliance rules.',
    isMarketing: false,
  },
};

function buildBaseEmailWrapper(contentHtml, titleText, isMarketing = true) {
  const unsubscribeFooter = isMarketing
    ? `
      <div style="margin-top: 16px; pt: 12px; border-top: 1px solid #21262d; font-size: 11px; color: #6e7681;">
        You received this notification because you registered on SkillBun. 
        <br>
        To manage email notifications or unsubscribe from career updates, <a href="https://skillbun.com/settings?action=unsubscribe" style="color: #00e599; text-decoration: underline;">click here to unsubscribe</a>.
      </div>
    `
    : `
      <div style="margin-top: 16px; pt: 12px; border-top: 1px solid #21262d; font-size: 11px; color: #6e7681;">
        This is an important transactional/security update regarding your SkillBun account. Unsubscribe is disabled for critical alerts.
      </div>
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(titleText)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e6edf3; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f17; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container Card -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Branded Top Banner Header -->
          <tr>
            <td style="background-color: #0d1117; padding: 26px 32px; border-bottom: 2px solid #00e599; text-align: center;">
              <table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <span style="font-family: 'Fredoka', 'Comic Sans MS', cursive, sans-serif; font-size: 28px; font-weight: 800; color: #00e599; letter-spacing: -0.5px;">
                      ꌗꀘꀤ꒒꒒ꌃꀎꈤ
                    </span>
                  </td>
                </tr>
              </table>
              <div style="color: #8b949e; font-size: 11px; margin-top: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;">
                Hop Into The Right Tech Career • 100% Free Platform
              </div>
            </td>
          </tr>

          <!-- Main Body Canvas -->
          <tr>
            <td style="padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #c9d1d9;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Compliance Footer -->
          <tr>
            <td style="background-color: #0d1117; padding: 24px 32px; border-top: 1px solid #21262d; text-align: center; font-size: 12px; color: #8b949e; line-height: 1.5;">
              <p style="margin: 0 0 6px 0; color: #e6edf3; font-weight: 700; font-size: 13px;">
                SkillBun Interactive Tech Career Platform
              </p>
              <p style="margin: 0 0 10px 0;">
                MSME Registered Educational Platform • 100+ Free Roadmaps, AI Quiz & Proctored Certifications.
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
  const progressCount = data.progressCount || 10;
  const degree = escapeHtml(data.degree || 'B.Tech - Computer Science');
  const siteUrl = 'https://skillbun.com';

  const templateConfig = RETENTION_TEMPLATES[templateId] || RETENTION_TEMPLATES.reengagement;
  const isMarketing = templateConfig.isMarketing;

  let contentHtml = '';
  let subject = '';

  switch (templateId) {
    case 'reengagement':
      subject = `🐰 We miss you on SkillBun, ${name}! Resume your ${roadmapTitle} roadmap`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.12); color: #00e599; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🐰 Learning Streak Nudge
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Hey ${name}, your roadmap is waiting!
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 14px;">
            We noticed you haven’t checked off any roadmap nodes recently.
          </p>
        </div>

        <!-- Stat Card -->
        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 14px; padding: 22px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 12px; font-weight: 700; color: #00e599; text-transform: uppercase;">Current Track</span>
            <span style="font-size: 12px; background-color: #21262d; color: #e6edf3; padding: 2px 8px; border-radius: 6px;">${degree}</span>
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
            ${roadmapTitle}
          </div>
          <div style="font-size: 14px; color: #8b949e; line-height: 1.5;">
            ✅ You have finished <strong style="color: #00e599;">${progressCount} nodes</strong> so far! Keep up the momentum to reach 60% and unlock your free certification exam.
          </div>
        </div>

        <p style="margin-bottom: 24px;">
          SkillBun roadmaps are 100% free and structured by industry experts. Jump back in today and complete your next topic node in under 5 minutes!
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ▶️ Resume ${roadmapTitle} Roadmap
          </a>
        </div>
      `;
      break;

    case 'exam_nudge':
      subject = `🎓 You are eligible for your ${roadmapTitle} Certificate, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.12); color: #00e599; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🎓 60%+ Milestone Reached
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Awesome job, ${name}!
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 14px;">
            You have unlocked 60%+ of the ${roadmapTitle} curriculum.
          </p>
        </div>

        <div style="background-color: rgba(0, 229, 153, 0.1); border: 1.5px solid #00e599; border-radius: 14px; padding: 22px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 13px; font-weight: 800; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            🎉 Certification Exam Unlocked!
          </div>
          <div style="font-size: 15px; color: #ffffff; font-weight: 600; margin-bottom: 8px;">
            Score 70%+ on the proctored quiz to earn your official certificate.
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            Includes unique QR ID verification link & Canva overlay template for LinkedIn.
          </div>
        </div>

        <!-- Specs Grid -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px; font-size: 14px; color: #c9d1d9;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #21262d;">⏱️ <strong>Format:</strong> 10 randomized adaptive questions</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #21262d;">🛡️ <strong>Verification:</strong> Public URL & downloadable PDF</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">💚 <strong>Cost:</strong> 100% Free forever</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            🎓 Take Certification Exam
          </a>
        </div>
      `;
      break;

    case 'welcome':
      subject = `🚀 Welcome to SkillBun, ${name}! Pick your tech career track`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.12); color: #00e599; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🚀 Welcome to SkillBun
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Welcome aboard, ${name}!
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 14px;">
            Your interactive learning & career journey starts now.
          </p>
        </div>

        <p style="margin-bottom: 20px;">
          SkillBun is designed to help students master tech careers like <strong>Full-Stack Web Development, AI/ML, Cloud & DevOps, and Data Science</strong> with zero cost.
        </p>

        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 10px;">🌟 What you get with SkillBun:</div>
          <div style="color: #8b949e; font-size: 14px; line-height: 1.8;">
            ✔ <strong>100+ Interactive Roadmaps</strong> with checkable topic nodes<br>
            ✔ <strong>SkillBun Vault (SBV1)</strong> encrypted study guides<br>
            ✔ <strong>Bun-Bot 24/7 AI Counsellor</strong> for instant doubts & guidance<br>
            ✔ <strong>Verified Industry Certificates</strong> with QR authenticity
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/quiz" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ⚡ Take 1-Min AI Career Quiz
          </a>
        </div>
      `;
      break;

    case 'exam_failed':
      subject = `📚 Don’t give up, ${name}! Your ${roadmapTitle} Retake is 100% Free`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="display: inline-block; background-color: rgba(239,68,68,0.15); color: #ef4444; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            📚 Exam Cooldown Encouragement
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Keep your head up, ${name}!
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 14px;">
            Every tech expert faced setbacks before reaching mastery.
          </p>
        </div>

        <p>We saw your recent attempt on the <strong>${roadmapTitle} Exam</strong>. Don't worry—retakes on SkillBun are 100% free and un-capped!</p>

        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 14px; padding: 22px; margin: 20px 0;">
          <div style="font-weight: 700; color: #00e599; margin-bottom: 8px;">💡 Pro Tips for your Retake:</div>
          <div style="color: #8b949e; font-size: 14px; line-height: 1.8;">
            1️⃣ Open the roadmap tree and read the <strong>SkillBun Vault Study Guides</strong> for topics you struggled with.<br>
            2️⃣ Ask <strong>Bun-Bot AI</strong> to explain difficult concepts.<br>
            3️⃣ Once your 1-hour cooldown finishes, attempt the test again!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📖 Read Study Guides & Retake Test
          </a>
        </div>
      `;
      break;

    case 'cert_congrats':
      subject = `🏆 Congratulations ${name}! Claim your verified ${roadmapTitle} Certificate`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🏆 Verified Certification Achieved
          </div>
          <h1 style="font-size: 26px; font-weight: 800; color: #00e599; margin: 0 0 8px 0;">
            Congratulations ${name}!
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 14px;">
            You have officially earned your verified SkillBun Certificate.
          </p>
        </div>

        <div style="background-color: rgba(0, 229, 153, 0.12); border: 2px solid #00e599; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 800; color: #00e599; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            SkillBun Official Credentials
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">
            ${roadmapTitle} Certified Specialist
          </div>
          <div style="font-size: 14px; color: #8b949e;">
            Tamper-proof public QR verification & printable PDF document.
          </div>
        </div>

        <p style="margin-bottom: 24px;">
          Add this certificate to your LinkedIn profile and resume to showcase your verified technical competency to employers!
        </p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/dashboard/certifications" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📜 View & Share Certificate
          </a>
        </div>
      `;
      break;

    case 'transactional_alert':
      subject = `🔒 SkillBun Account Security & Activity Alert for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 26px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            🔒 Security Notice
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Account Activity Notification
          </h1>
          <p style="color: #8b949e; margin: 0; font-size: 14px;">
            Important security and authentication alert for ${name}.
          </p>
        </div>

        <p style="margin-bottom: 20px;">
          Hi ${name}, this is an automated system notification regarding your account associated with <strong>${email}</strong>.
        </p>

        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 6px;">Account Details:</div>
          <div style="color: #8b949e; font-size: 14px; line-height: 1.6;">
            Email: ${email}<br>
            Academic Track: ${degree}<br>
            Status: Active Secured
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(59,130,246,0.45);">
            🔒 Go to Dashboard Security
          </a>
        </div>
      `;
      break;

    default:
      subject = `🐰 Important Update from SkillBun for ${name}`;
      contentHtml = `<p>Hi ${name}, resume your learning journey on SkillBun!</p>`;
  }

  const html = buildBaseEmailWrapper(contentHtml, subject, isMarketing);

  return { subject, html };
}
