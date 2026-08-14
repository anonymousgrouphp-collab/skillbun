/**
 * SkillBun Retention & Lifecycle Email Templates (18 Variations)
 * Metadata definitions and HTML body content generators.
 */

const SITE_URL = 'https://skillbun.tech';

export const RETENTION_TEMPLATES = {
  // CATEGORY 1: ONBOARDING & ACTIVATION (NEW SIGNUP)
  welcome_v1: {
    id: 'welcome_v1',
    category: '1. Onboarding',
    name: '🚀 Onboarding V1: ₹35,000 Course Value Unlocked Free (Greed Angle)',
    subject: '🚨 ₹35,000 Tech Curriculum Unlocked 100% Free for {name} (Limited Access)',
    description: 'Emphasizes ₹35,000 worth of free roadmaps & SBV1 study guides.',
    isMarketing: true,
  },
  welcome_v2: {
    id: 'welcome_v2',
    category: '1. Onboarding',
    name: '🚀 Onboarding V2: 2026 Tech Salary Benchmark (Competitive Angle)',
    subject: '🚀 Don’t stay behind 93% of tech hires, {name}! Activate your 2026 roadmap',
    description: 'Triggers competitive urgency against other student applicants.',
    isMarketing: true,
  },
  welcome_v3: {
    id: 'welcome_v3',
    category: '1. Onboarding',
    name: '🚀 Onboarding V3: $500 Encrypted SBV1 Study Vault (Privilege Angle)',
    subject: '🎁 You unlocked $500 worth of Encrypted SBV1 Study Vault access, {name}!',
    description: 'Focuses on exclusive access to SkillBun Vault study guides.',
    isMarketing: true,
  },

  // CATEGORY 2: RE-ENGAGEMENT STREAK NUDGE (INACTIVE USER)
  reengagement_v1: {
    id: 'reengagement_v1',
    category: '2. Re-engagement',
    name: '🐰 Re-engage V1: Rank & Streak Decaying Alert (Loss Aversion)',
    subject: '⚠️ Your {roadmapTitle} streak & candidate rank is decaying, {name}!',
    description: 'Warns student about streak loss and ranking decay.',
    isMarketing: true,
  },
  reengagement_v2: {
    id: 'reengagement_v2',
    category: '2. Re-engagement',
    name: '🐰 Re-engage V2: 3-Minute Quick Win to Exam Ticket (Quick Progress)',
    subject: '🔥 3 Minutes to unlock your Free {roadmapTitle} Cert Exam Ticket, {name}!',
    description: 'Encourages completing just 1 quick topic node.',
    isMarketing: true,
  },
  reengagement_v3: {
    id: 'reengagement_v3',
    category: '2. Re-engagement',
    name: '🐰 Re-engage V3: Recruiter Queue Visibility Alert (Placement Angle)',
    subject: '💡 Recruiter Queue Alert: Complete your {roadmapTitle} track, {name}!',
    description: 'Highlights priority recruiter discovery for active candidates.',
    isMarketing: true,
  },

  // CATEGORY 3: CERTIFICATION EXAM READY (60%+ PROGRESS)
  exam_nudge_v1: {
    id: 'exam_nudge_v1',
    category: '3. Exam Ready',
    name: '🎓 Exam Ready V1: Top 7% Elite Candidate Invitation (Status Angle)',
    subject: '🏆 You are in the Top 7% Qualified Candidates for {roadmapTitle} Cert, {name}!',
    description: 'Celebrates 60%+ completion and invites student to certify.',
    isMarketing: true,
  },
  exam_nudge_v2: {
    id: 'exam_nudge_v2',
    category: '3. Exam Ready',
    name: '🎓 Exam Ready V2: Free ₹15,000 Proctored Exam Ticket (High Value Gift)',
    subject: '🎓 Free ₹15,000 Proctored Certification Ticket Ready for {name}!',
    description: 'Positions proctored exam as a ₹15,000 waived fee gift.',
    isMarketing: true,
  },
  exam_nudge_v3: {
    id: 'exam_nudge_v3',
    category: '3. Exam Ready',
    name: '🎓 Exam Ready V3: Recruiters Verifying SkillBun QR Links (Job Proof)',
    subject: '⚡ Recruiters are verifying SkillBun QR Certificates for {roadmapTitle}',
    description: 'Emphasizes tamper-proof verification on LinkedIn & resume.',
    isMarketing: true,
  },

  // CATEGORY 4: EXAM COOLDOWN ENCOURAGEMENT (FAILED ATTEMPT)
  exam_failed_v1: {
    id: 'exam_failed_v1',
    category: '4. Exam Retake',
    name: '📚 Retake V1: 100% Free Unlimited Retake Ticket (Zero Risk)',
    subject: '⚡ Retake Ticket Granted! 100% Free Retake for {roadmapTitle}, {name}',
    description: 'Reassures student that retakes are free and unlimited.',
    isMarketing: true,
  },
  exam_failed_v2: {
    id: 'exam_failed_v2',
    category: '4. Exam Retake',
    name: '📚 Retake V2: Review SBV1 Encrypted Study Vault (Pass Guarantee)',
    subject: '📖 Cheat-Sheet Unlocked: Review SBV1 Guides to Guarantee 100% Pass',
    description: 'Advises reading encrypted study guides during 1-hour cooldown.',
    isMarketing: true,
  },
  exam_failed_v3: {
    id: 'exam_failed_v3',
    category: '4. Exam Retake',
    name: '📚 Retake V3: Missed Passing by Just 2 Questions (High Confidence)',
    subject: '💪 You missed passing by just 2 questions, {name}! 1-Hour Cooldown Ready',
    description: 'Boosts confidence for near-pass candidates after 1-hour cooldown.',
    isMarketing: true,
  },

  // CATEGORY 5: CERTIFICATE ACHIEVED (ALUMNI UPSELL)
  cert_congrats_v1: {
    id: 'cert_congrats_v1',
    category: '5. Alumni Cert',
    name: '🏆 Cert Alumni V1: Verified Specialist Status & QR Badge (Credential)',
    subject: '🎉 Verified Specialist Status Unlocked! Claim your QR Badge, {name}',
    description: 'Promotes LinkedIn QR badge sharing and resume addition.',
    isMarketing: true,
  },
  cert_congrats_v2: {
    id: 'cert_congrats_v2',
    category: '5. Alumni Cert',
    name: '🏆 Cert Alumni V2: Next High-Salary Track Combo (Multi-Skill Upsell)',
    subject: '🚀 Level Up: Recommended Next High-Salary Track after {roadmapTitle}',
    description: 'Recommends complementary high-paying tech tracks.',
    isMarketing: true,
  },
  cert_congrats_v3: {
    id: 'cert_congrats_v3',
    category: '5. Alumni Cert',
    name: '🏆 Cert Alumni V3: Priority Recruiter Directory Unlocked (VIP Access)',
    subject: '⭐ Priority Recruiter Directory Activated for {name}',
    description: 'Informs certified alumnus about public recruiter verification indexing.',
    isMarketing: true,
  },

  // CATEGORY 6: SECURITY & ACCOUNT ALERT (TRANSACTIONAL)
  transactional_alert_v1: {
    id: 'transactional_alert_v1',
    category: '6. Transactional',
    name: '🔒 Transactional V1: Account Security & Authentication Alert',
    subject: '🔒 SkillBun Account Security & Authentication Notice for {name}',
    description: 'Security notice. Omits marketing unsubscribe per compliance rules.',
    isMarketing: false,
  },
  transactional_alert_v2: {
    id: 'transactional_alert_v2',
    category: '6. Transactional',
    name: '🔒 Transactional V2: Password & Login Session Guard Notice',
    subject: '🛡️ Password & Login Session Security Guard Update for {name}',
    description: 'Session guard notice. Omits marketing unsubscribe per compliance rules.',
    isMarketing: false,
  },
  transactional_alert_v3: {
    id: 'transactional_alert_v3',
    category: '6. Transactional',
    name: '🔒 Transactional V3: Critical Account Credential Status Alert',
    subject: '🔑 Critical Account Verification & Credential Status for {name}',
    description: 'Credential alert. Omits marketing unsubscribe per compliance rules.',
    isMarketing: false,
  },
};

export function renderTemplateContent(templateId, { name, email, roadmapTitle, progressCount, degree }) {
  const templateConfig = RETENTION_TEMPLATES[templateId] || RETENTION_TEMPLATES.welcome_v1;
  const isMarketing = templateConfig ? templateConfig.isMarketing !== false : true;
  let contentHtml = '';
  let subject = '';

  switch (templateId) {
    // CATEGORY 1: ONBOARDING & ACTIVATION
    case 'welcome_v1':
      subject = `🚨 ₹35,000 Tech Curriculum Unlocked 100% Free for ${name} (Limited Access)`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            💎 100% Free Student Sponsorship
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Hey ${name}, why pay ₹35,000 for coding bootcamps?
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Commercial EdTech institutes charge students ₹30,000 to ₹50,000 for structured roadmaps.
          </p>
        </div>

        <p>At <strong>SkillBun.tech</strong>, we believe high-quality tech education must be <strong>100% Free for every student</strong>. Your account has been granted full VIP access to our entire ecosystem without a single rupee charged!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #00e599; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            🎁 What You Just Unlocked ($450+ Total Value):
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            ✔ <strong>100+ Interactive Tech Roadmaps</strong> (Full-Stack, AI/ML, DevOps, Data Engine)<br>
            ✔ <strong>SkillBun Vault (SBV1)</strong> Encrypted Master Study Guides<br>
            ✔ <strong>Bun-Bot 24/7 AI Counsellor</strong> for instant doubt solving<br>
            ✔ <strong>Official Proctored Exam & Verified QR Certificate</strong>
          </div>
        </div>

        <p style="font-weight: 700; color: #ffffff;">Don’t leave this ₹35,000 educational sponsorship sitting idle. Take the 1-minute AI Quiz now!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/quiz" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ⚡ Claim Free Access & Take AI Quiz →
          </a>
        </div>
      `;
      break;

    case 'welcome_v2':
      subject = `🚀 Don’t stay behind 93% of tech hires, ${name}! Activate your 2026 roadmap`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            ⚡ 2026 Hiring Benchmark Alert
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, competition in ${degree} isn't waiting!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            93% of top tech hires build structured skill roadmaps before applying to jobs.
          </p>
        </div>

        <p>While average students rely on random tutorial videos, top engineers follow clear interactive roadmaps with proof of competency.</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #3b82f6; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            📊 Your Personalized 2026 Benchmark Status
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            Candidate Name: ${name}<br>
            Academic Background: ${degree}<br>
            Roadmaps Available: 100+ Career Tracks<br>
            Status: Action Required (0% Roadmap Activated)
          </div>
        </div>

        <p style="font-weight: 700; color: #ffffff;">Your first topic node takes less than 3 minutes. Start today and stay ahead of your batchmates!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/onboarding?next=/quiz" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(59,130,246,0.45);">
            ⚡ Activate My Tech Career Benchmark →
          </a>
        </div>
      `;
      break;

    case 'welcome_v3':
      subject = `🎁 You unlocked $500 worth of Encrypted SBV1 Study Vault access, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(234,179,8,0.15); color: #eab308; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🔐 Encrypted Vault Privilege
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Exclusive Vault Key Granted to ${name}
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            3,335 proprietary study guides protected under SkillBun Vault (SBV1) encryption.
          </p>
        </div>

        <p>Most study platforms show basic text summaries. SkillBun protects <strong>3,335 comprehensive topic study guides</strong> using AES-256 HKDF encryption to maintain top academic quality!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #eab308; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #eab308; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            🔑 SBV1 Master Access Token Attached to ${email}
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            ✔ Decrypt and read topic guides directly on interactive roadmaps<br>
            ✔ Includes curated YouTube video tutorials & hands-on project briefs<br>
            ✔ 100% Free student authorization
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📖 Access SBV1 Encrypted Study Vault →
          </a>
        </div>
      `;
      break;

    // CATEGORY 2: RE-ENGAGEMENT
    case 'reengagement_v1':
      subject = `⚠️ Your ${roadmapTitle} streak & candidate rank is decaying, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(239,68,68,0.15); color: #ef4444; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            ⚠️ Streak Decay Warning
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, your learning streak is about to reset!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            You’ve already finished ${progressCount} nodes on ${roadmapTitle}. Don’t let your hard work freeze.
          </p>
        </div>

        <p>Every day you pause, your retention drops and your placement readiness score decays. Reaching 60% unlocks your <strong>Official Proctored Certification Exam</strong>!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #ef4444; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: #ef4444; text-transform: uppercase;">Roadmap Streak Status</span>
            <span style="font-size: 12px; background-color: #21262d; color: #ffffff; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${progressCount} Nodes Done</span>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
            ${roadmapTitle}
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            Complete just 1 more topic node to save your active streak!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ▶️ Save My Streak on ${roadmapTitle} →
          </a>
        </div>
      `;
      break;

    case 'reengagement_v2':
      subject = `🔥 3 Minutes to unlock your Free ${roadmapTitle} Cert Exam Ticket, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            ⚡ Quick 3-Minute Milestone
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, you are almost at the exam line!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            You have completed ${progressCount} topic nodes. Complete 1 quick node to unlock your proctored exam.
          </p>
        </div>

        <p>Other students spend months studying theory. SkillBun lets you check off completed topics and earn verified certificates <strong>100% Free</strong>.</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0; text-align: center;">
          <div style="font-size: 13px; font-weight: 800; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            🎯 3-Minute Quick Challenge
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
            Check off your next ${roadmapTitle} topic node now!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ⚡ Check Off Topic Node in 3 Mins →
          </a>
        </div>
      `;
      break;

    case 'reengagement_v3':
      subject = `💡 Recruiter Queue Alert: Complete your ${roadmapTitle} track, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            💼 Recruiter Indexing Alert
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, tech recruiters check active student profiles!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Active candidates with 60%+ roadmap progress get priority visibility in SkillBun directory search.
          </p>
        </div>

        <p>When company recruiters search SkillBun for student talent in <strong>${degree}</strong>, profiles with high progress and verified QR certificates are listed at the top!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #3b82f6; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            📈 Recruiter Directory Index Status
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            Candidate: ${name}<br>
            Track: ${roadmapTitle}<br>
            Current Nodes Completed: ${progressCount}<br>
            Status: Resume activity to boost directory ranking!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            💼 Boost My Directory Index Score →
          </a>
        </div>
      `;
      break;

    // CATEGORY 3: EXAM READY
    case 'exam_nudge_v1':
      subject = `🏆 You are in the Top 7% Qualified Candidates for ${roadmapTitle} Cert, ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🏆 Top 7% Elite Qualification
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Congratulations ${name}! You qualify for the Proctored Exam.
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Only 7% of tech candidates complete 60%+ roadmap nodes to unlock this exam.
          </p>
        </div>

        <div class="box-dark" style="background-color: rgba(0, 229, 153, 0.1); border: 2px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0; text-align: center;">
          <div style="font-size: 13px; font-weight: 800; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            🎉 Exam Unlocked: ${roadmapTitle}
          </div>
          <div style="font-size: 15px; color: #ffffff; font-weight: 700; margin-bottom: 8px;">
            Score 70%+ on 10 randomized adaptive questions to earn your Verified Certificate!
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            Tamper-proof public QR verification & printable PDF document included.
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            🎓 Start Proctored Certification Exam →
          </a>
        </div>
      `;
      break;

    case 'exam_nudge_v2':
      subject = `🎓 Free ₹15,000 Proctored Certification Ticket Ready for ${name}!`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(234,179,8,0.15); color: #eab308; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🏷️ ₹15,000 Exam Fee Waived
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, your 100% Free Exam Pass is ready!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Professional proctored certification exams usually cost ₹10,000 to ₹15,000.
          </p>
        </div>

        <p>SkillBun waives 100% of certification fees for students who complete 60%+ of their roadmap. You don't have to pay a single rupee!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #eab308; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #eab308; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            🎫 Exam Voucher Code: SKILLBUN-100-FREE
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            Candidate: ${name}<br>
            Track: ${roadmapTitle}<br>
            Cost: ₹0 (100% Waived)
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            🎫 Redeem Exam Ticket & Start Test →
          </a>
        </div>
      `;
      break;

    case 'exam_nudge_v3':
      subject = `⚡ Recruiters are verifying SkillBun QR Certificates for ${roadmapTitle}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🛡️ Job Proof & Verification
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, get your LinkedIn-ready QR certificate!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Companies verify candidates using SkillBun's unique QR authentication links.
          </p>
        </div>

        <p>Generic course completion certificates can be fake. SkillBun certificates store verification data on Firestore at <strong>skillbun.tech/certificate/[id]</strong> with anti-cheat proctoring proof!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0; text-align: center;">
          <div style="font-size: 13px; font-weight: 800; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            📜 Verified QR Credential Ready
          </div>
          <div style="font-size: 15px; color: #ffffff; font-weight: 700;">
            Pass the 10-question quiz to mint your certificate URL!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            ⚡ Mint My Verified Certificate →
          </a>
        </div>
      `;
      break;

    // CATEGORY 4: EXAM RETAKE
    case 'exam_failed_v1':
      subject = `⚡ Retake Ticket Granted! 100% Free Retake for ${roadmapTitle}, ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(239,68,68,0.15); color: #ef4444; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🔄 Free Unlimited Retakes
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Zero penalty, ${name}! Your retake is 100% Free.
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Other platforms charge ₹2,000 per retake attempt. SkillBun gives you infinite free tries.
          </p>
        </div>

        <p>We saw your recent attempt on the <strong>${roadmapTitle} Exam</strong>. Missing the pass mark on attempt #1 is completely normal!</p>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #00e599; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            💡 Why Retaking on SkillBun is Risk-Free:
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            ✔ <strong>100% Free:</strong> No retake fee or hidden charges<br>
            ✔ <strong>Adaptive Question Bank:</strong> 50+ shuffled questions<br>
            ✔ <strong>Vault Guides:</strong> Review SBV1 study guides during cooldown
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            🔄 Retake ${roadmapTitle} Exam Now →
          </a>
        </div>
      `;
      break;

    case 'exam_failed_v2':
      subject = `📖 Cheat-Sheet Unlocked: Review SBV1 Guides to Guarantee 100% Pass`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            📖 SBV1 Study Vault Advantage
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            ${name}, review the exact topics you missed!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Use your 1-hour cooldown to study our encrypted SBV1 guides and guarantee a 100% score.
          </p>
        </div>

        <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #00e599; border-radius: 14px; padding: 22px; margin: 22px 0;">
          <div style="font-weight: 800; color: #00e599; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">
            🎯 3-Step Pass Formula:
          </div>
          <div style="color: #c9d1d9; font-size: 14px; line-height: 1.8;">
            1. Open ${roadmapTitle} tree<br>
            2. Click topic nodes and read SBV1 Vault guides<br>
            3. Ask Bun-Bot AI for any doubts & click Start Exam!
          </div>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📖 Open SBV1 Guides & Practice →
          </a>
        </div>
      `;
      break;

    case 'exam_failed_v3':
      subject = `💪 You missed passing by just 2 questions, ${name}! 1-Hour Cooldown Ready`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            💪 Near-Pass High Confidence
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            You were so close, ${name}!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            You scored almost 70%! You only needed 1 or 2 more correct answers.
          </p>
        </div>

        <p>Don't lose your focus now. Once your 1-hour cooldown timer finishes, you can attempt the test again with brand new shuffled questions!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            💪 Retake Exam & Pass Now →
          </a>
        </div>
      `;
      break;

    // CATEGORY 5: CERTIFICATE ACHIEVED
    case 'cert_congrats_v1':
      subject = `🎉 Verified Specialist Status Unlocked! Claim your QR Badge, ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(0,229,153,0.15); color: #00e599; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🏆 Verified Alumni Credential
          </div>
          <h1 class="text-title" style="font-size: 26px; font-weight: 800; color: #00e599; margin: 0 0 8px 0;">
            Congratulations ${name}!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            You are officially a SkillBun Verified Specialist on ${roadmapTitle}!
          </p>
        </div>

        <div class="box-dark" style="background-color: rgba(0, 229, 153, 0.12); border: 2px solid #00e599; border-radius: 16px; padding: 24px; text-align: center; margin: 22px 0;">
          <div style="font-size: 12px; font-weight: 800; color: #00e599; text-transform: uppercase; margin-bottom: 6px;">
            Official SkillBun Credentials
          </div>
          <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">
            ${roadmapTitle} Certified Specialist
          </div>
          <div style="font-size: 13px; color: #8b949e;">
            Public QR Link: skillbun.tech/certificate/[id]
          </div>
        </div>

        <p>84% of certified alumni add this QR link to LinkedIn and resume. Download your PDF copy now!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/dashboard/certifications" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            📜 View & Download Certificate PDF →
          </a>
        </div>
      `;
      break;

    case 'cert_congrats_v2':
      subject = `🚀 Level Up: Recommended Next High-Salary Track after ${roadmapTitle}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🚀 Multi-Skill Salary Boost
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Great job on ${roadmapTitle}, ${name}!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Engineers who combine 2 complementary tracks earn 45% higher entry packages.
          </p>
        </div>

        <p>Now that you mastered <strong>${roadmapTitle}</strong>, unlock your next complementary skill track (e.g. AI/ML, DevOps, or Data Engineering) for 100% Free on SkillBun.tech!</p>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/roadmap" style="display: inline-block; background-color: #00e599; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(0,229,153,0.45);">
            🚀 Explore Next Career Roadmap Track →
          </a>
        </div>
      `;
      break;

    case 'cert_congrats_v3':
      subject = `⭐ Priority Recruiter Directory Activated for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(234,179,8,0.15); color: #eab308; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            ⭐ VIP Alumni Directory Indexing
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Your profile is now VIP Certified, ${name}!
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Certified alumni profiles are indexed at the top of SkillBun recruiter database searches.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #eab308; color: #000000; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(234,179,8,0.45);">
            ⭐ Check VIP Directory Profile Status →
          </a>
        </div>
      `;
      break;

    // CATEGORY 6: TRANSACTIONAL NOTIFICATIONS
    case 'transactional_alert_v1':
      subject = `🔒 SkillBun Account Security & Authentication Notice for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
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
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(59,130,246,0.45);">
            🔒 Go to Dashboard Security →
          </a>
        </div>
      `;
      break;

    case 'transactional_alert_v2':
      subject = `🛡️ Password & Login Session Security Guard Update for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🛡️ Login Session Guard
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Session Guard Status
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Authentication session update for ${name} (${email}).
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/settings" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(59,130,246,0.45);">
            🛡️ Manage Security Settings →
          </a>
        </div>
      `;
      break;

    case 'transactional_alert_v3':
      subject = `🔑 Critical Account Verification & Credential Status for ${name}`;
      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: rgba(59,130,246,0.15); color: #3b82f6; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
            🔑 Credential Audit
          </div>
          <h1 class="text-title" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0;">
            Account Verification Notice
          </h1>
          <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
            Credential and profile status audit for ${name}.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${SITE_URL}/dashboard" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; font-size: 16px; padding: 15px 36px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 20px rgba(59,130,246,0.45);">
            🔑 Verify Account Credentials →
          </a>
        </div>
      `;
      break;

    default:
      subject = `🐰 Important Update from SkillBun.tech for ${name}`;
      contentHtml = `<p>Hi ${name}, resume your learning journey on SkillBun.tech!</p>`;
  }

  return { subject, contentHtml, isMarketing };
}
