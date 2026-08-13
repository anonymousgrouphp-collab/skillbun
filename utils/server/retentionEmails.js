import { getTransporter, escapeHtml } from './zohoMailer';
import { getPasswordResetFrom } from './env';

/**
 * SkillBun User Retention Email Templates & Generator
 */

export const RETENTION_TEMPLATES = {
  reengagement: {
    id: 'reengagement',
    name: '🐰 Re-Engagement Nudge (Inactive User)',
    subject: '🐰 We miss you on SkillBun, {name}! Resume your {roadmapTitle} roadmap',
    description: 'Sent to students who haven’t logged in for 3+ days to bring them back to their active roadmap.',
  },
  exam_nudge: {
    id: 'exam_nudge',
    name: '🎓 Certification Exam Ready (60%+ Progress)',
    subject: '🎓 You are eligible for your {roadmapTitle} Certificate, {name}!',
    description: 'Sent to students who completed 60%+ nodes to nudge them to take the 50-question cert exam.',
  },
  welcome: {
    id: 'welcome',
    name: '🚀 Onboarding & Activation (New Signup)',
    subject: '🚀 Welcome to SkillBun, {name}! Pick your tech career track',
    description: 'Sent to newly registered students to guide them to complete their profile & pick a roadmap.',
  },
  exam_failed: {
    id: 'exam_failed',
    name: '📚 Cooldown Encouragement (Failed Attempt)',
    subject: '📚 Don’t give up, {name}! Your {roadmapTitle} Retake is 100% Free',
    description: 'Sent to students in 1-hour cooldown to encourage study guide review and retaking the exam.',
  },
  cert_congrats: {
    id: 'cert_congrats',
    name: '🏆 Certificate Achieved (Alumni Upsell)',
    subject: '🏆 Congratulations {name}! Claim your verified {roadmapTitle} Certificate',
    description: 'Sent to students who passed the cert exam with next career track recommendations.',
  },
};

function buildBaseEmailWrapper(contentHtml, titleText) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(titleText)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #e6edf3;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f17; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Bar -->
          <tr>
            <td style="background-color: #0d1117; padding: 24px 32px; border-bottom: 2px solid #00e599; text-align: center;">
              <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                <span style="font-family: 'Comic Sans MS', cursive, sans-serif; font-size: 26px; font-weight: 800; color: #00e599; letter-spacing: -0.5px;">
                  ꌗꀘꀤ꒒꒒ꌃꀎꈤ
                </span>
              </div>
              <div style="color: #8b949e; font-size: 12px; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                Hop Into The Right Tech Career • 100% Free Forever
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #c9d1d9;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0d1117; padding: 24px 32px; border-top: 1px solid #21262d; text-align: center; font-size: 12px; color: #8b949e; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; color: #e6edf3; font-weight: 600;">
                SkillBun Learning Platform • Free Interactive Tech Roadmaps & Certificates
              </p>
              <p style="margin: 0 0 12px 0;">
                Empowering tech students across India. MSME Registered Educational Platform.
              </p>
              <div style="margin-top: 12px; font-size: 11px; color: #6e7681;">
                Sent directly by SkillBun Admin Console • <a href="https://skillbun.com/dashboard" style="color: #00e599; text-decoration: none;">My Account Dashboard</a>
              </div>
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
  const roadmapTitle = escapeHtml(data.roadmapTitle || 'Full Stack Web Development');
  const progressCount = data.progressCount || 10;
  const siteUrl = 'https://skillbun.com';

  let contentHtml = '';
  let subject = '';

  switch (templateId) {
    case 'reengagement':
      subject = `🐰 We miss you on SkillBun, ${name}! Resume your ${roadmapTitle} roadmap`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🐰</div>
          <h1 style="font-size: 22px; color: #ffffff; margin: 0 0 8px 0;">Hey ${name}, your learning streak is waiting!</h1>
          <p style="color: #8b949e; margin: 0;">We noticed you haven’t logged in to SkillBun recently.</p>
        </div>

        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <div style="font-size: 14px; font-weight: 700; color: #00e599; text-transform: uppercase; margin-bottom: 8px;">
            Your Active Track Progress
          </div>
          <div style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
            ${roadmapTitle}
          </div>
          <div style="font-size: 14px; color: #8b949e;">
            ✅ You have completed <strong>${progressCount} nodes</strong> so far! Don’t let your momentum fade away.
          </div>
        </div>

        <p>Every small topic you complete brings you one step closer to unlocking your official <strong>Industry Certificate</strong> and job-ready portfolio projects.</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(0,229,153,0.4);">
            ▶️ Resume ${roadmapTitle} Roadmap
          </a>
        </div>
      `;
      break;

    case 'exam_nudge':
      subject = `🎓 You are eligible for your ${roadmapTitle} Certificate, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🎓</div>
          <h1 style="font-size: 22px; color: #ffffff; margin: 0 0 8px 0;">Awesome progress, ${name}!</h1>
          <p style="color: #8b949e; margin: 0;">You have unlocked 60%+ of the ${roadmapTitle} curriculum.</p>
        </div>

        <div style="background-color: rgba(0, 229, 153, 0.1); border: 1px solid #00e599; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <div style="font-size: 14px; font-weight: 700; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            🎉 Certification Exam Unlocked!
          </div>
          <div style="font-size: 15px; color: #e6edf3;">
            Take the 50-question timed proctored exam and score 70%+ to earn your official, QR-verifiable SkillBun Certificate.
          </div>
        </div>

        <ul style="padding-left: 20px; margin-bottom: 24px; color: #8b949e; line-height: 1.8;">
          <li>⏱️ <strong>Format:</strong> 10 randomized adaptive questions per test session</li>
          <li>🛡️ <strong>Verification:</strong> Instant QR-code public verification link & PDF download</li>
          <li>💚 <strong>Cost:</strong> 100% Free forever (No hidden fees)</li>
        </ul>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(0,229,153,0.4);">
            🎓 Start Certification Exam Now
          </a>
        </div>
      `;
      break;

    case 'welcome':
      subject = `🚀 Welcome to SkillBun, ${name}! Pick your tech career track`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🚀</div>
          <h1 style="font-size: 22px; color: #ffffff; margin: 0 0 8px 0;">Welcome to SkillBun, ${name}!</h1>
          <p style="color: #8b949e; margin: 0;">Your free interactive learning journey starts today.</p>
        </div>

        <p>Whether you want to become a <strong>Full-Stack Developer, AI/ML Engineer, DevOps Specialist, or Data Analyst</strong>, SkillBun gives you step-by-step interactive roadmaps, free encrypted study guides, and proctored certification exams.</p>

        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <div style="font-weight: 700; color: #ffffff; margin-bottom: 8px;">🌟 Quick 3-Step Setup:</div>
          <div style="color: #8b949e; font-size: 14px; line-height: 1.7;">
            1️⃣ Take our 1-Minute AI Career Quiz to get personalized recommendations.<br>
            2️⃣ Explore over 100+ interactive tech roadmaps.<br>
            3️⃣ Chat with Bun-Bot, your AI career counsellor available 24/7.
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/quiz" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(0,229,153,0.4);">
            ⚡ Take AI Career Quiz
          </a>
        </div>
      `;
      break;

    case 'exam_failed':
      subject = `📚 Don’t give up, ${name}! Your ${roadmapTitle} Retake is 100% Free`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">📚</div>
          <h1 style="font-size: 22px; color: #ffffff; margin: 0 0 8px 0;">Keep pushing forward, ${name}!</h1>
          <p style="color: #8b949e; margin: 0;">Every master was once a beginner. Failure is just a step towards mastery.</p>
        </div>

        <p>We saw your recent attempt on the <strong>${roadmapTitle} Certification Exam</strong>. While you didn’t hit the 70% passing threshold this time, don’t be discouraged!</p>

        <div style="background-color: #0d1117; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <div style="font-weight: 700; color: #00e599; margin-bottom: 6px;">💡 How to ace your retake:</div>
          <div style="color: #8b949e; font-size: 14px; line-height: 1.7;">
            • Review our encrypted <strong>SkillBun Vault Study Guides</strong> for weak topics.<br>
            • Retakes are <strong>100% Free</strong> with no extra fees.<br>
            • Once your 1-hour cooldown expires, you can attempt again!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(0,229,153,0.4);">
            📖 Review Study Guides & Practice
          </a>
        </div>
      `;
      break;

    case 'cert_congrats':
      subject = `🏆 Congratulations ${name}! Claim your verified ${roadmapTitle} Certificate`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">🏆</div>
          <h1 style="font-size: 24px; color: #00e599; margin: 0 0 8px 0;">Congratulations ${name}!</h1>
          <p style="color: #8b949e; margin: 0;">You have officially earned your SkillBun Certificate!</p>
        </div>

        <div style="background-color: rgba(0, 229, 153, 0.12); border: 2px solid #00e599; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 13px; font-weight: 800; color: #00e599; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            Official SkillBun Credentials
          </div>
          <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">
            ${roadmapTitle} Certified Specialist
          </div>
          <div style="font-size: 14px; color: #8b949e;">
            Your achievement is now publicly verified with a unique QR ID and tamper-proof canvas template.
          </div>
        </div>

        <p>Share your certificate on LinkedIn, add it to your resume, or start your next complementary skill track on SkillBun!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${siteUrl}/dashboard/certifications" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 14px rgba(0,229,153,0.4);">
            📜 View & Share Certificate
          </a>
        </div>
      `;
      break;

    default:
      subject = `🐰 Important Update from SkillBun for ${name}`;
      contentHtml = `<p>Hi ${name}, resume your learning journey on SkillBun!</p>`;
  }

  const html = buildBaseEmailWrapper(contentHtml, subject);

  return { subject, html };
}
