/**
 * SkillBun Retention & Lifecycle Email Templates (18 Variations)
 *
 * Each template supplies the masthead document tag, the title block (eyebrow /
 * headline / lede / meta) and a content body composed from design-system
 * motifs — node rail, segmented track, spec sheet, stat band, data block,
 * tags, note — so the emails differ structurally, not just in wording.
 *
 * Motif choice is deliberate: emailNodeRail carries the roadmap metaphor and is
 * used where the message is about a learning path; emailStepRail is used for
 * plain procedures; emailSpecSheet and emailCredentialStrip render facts as a
 * datasheet rather than as marketing copy. emailFrame puts crop marks around a
 * block so it reads as a detail view on a drawing sheet, and emailWaffle draws
 * the roadmap to scale — one square per topic — instead of abstracting progress
 * into a bar.
 *
 * Copy voice: premium, minimal, honest. No invented monetary values, no fake
 * rankings, no false scarcity, no decorative emoji.
 *
 * Name and roadmapTitle arrive escaped for trusted markup. Email and degree
 * stay raw for emailCredentialStrip, which escapes them. Counts may be unknown.
 */

import {
  SITE_URL,
  emailText,
  emailSectionLabel,
  emailFrame,
  emailChipBlock,
  emailNodeRail,
  emailStepRail,
  emailSpecSheet,
  emailStatBand,
  emailProgressTrack,
  emailWaffle,
  emailCredentialStrip,
  emailTags,
  emailNote,
  emailPoints,
  emailButton,
  emailLink,
} from './emailTheme.js';

export const RETENTION_TEMPLATES = {
  // CATEGORY 1: ONBOARDING & ACTIVATION
  welcome_v1: {
    id: 'welcome_v1',
    category: '1. Onboarding',
    name: 'Onboarding V1: Everything is free (value-first)',
    subject: 'Welcome to SkillBun, {name} — your roadmaps are ready',
    description: 'Warm welcome that lays out what the free account includes.',
    isMarketing: true,
  },
  welcome_v2: {
    id: 'welcome_v2',
    category: '1. Onboarding',
    name: 'Onboarding V2: Start with the quiz (guided first step)',
    subject: 'Not sure where to start, {name}? Take the 2-minute quiz',
    description: 'Nudges the new student toward the AI quiz to find a track.',
    isMarketing: true,
  },
  welcome_v3: {
    id: 'welcome_v3',
    category: '1. Onboarding',
    name: 'Onboarding V3: How roadmaps work (education-first)',
    subject: 'How SkillBun roadmaps work, {name}',
    description: 'Explains the roadmap → study guide → certificate flow.',
    isMarketing: true,
  },

  // CATEGORY 2: RE-ENGAGEMENT
  reengagement_v1: {
    id: 'reengagement_v1',
    category: '2. Re-engagement',
    name: 'Re-engage V1: Pick up where you left off',
    subject: 'Your {roadmapTitle} roadmap is waiting, {name}',
    description: 'Gentle reminder built around a segmented progress track.',
    isMarketing: true,
  },
  reengagement_v2: {
    id: 'reengagement_v2',
    category: '2. Re-engagement',
    name: 'Re-engage V2: One small step',
    subject: 'One topic today, {name}?',
    description: 'Low-friction nudge to complete a single topic node.',
    isMarketing: true,
  },
  reengagement_v3: {
    id: 'reengagement_v3',
    category: '2. Re-engagement',
    name: 'Re-engage V3: Toward the certificate',
    subject: "You're closer to your {roadmapTitle} certificate than you think",
    description: 'Frames continued progress around unlocking the exam at 60%.',
    isMarketing: true,
  },

  // CATEGORY 3: EXAM READY
  exam_nudge_v1: {
    id: 'exam_nudge_v1',
    category: '3. Exam Ready',
    name: 'Exam Ready V1: You unlocked the exam',
    subject: 'Your {roadmapTitle} certification exam is unlocked, {name}',
    description: 'Celebrates 60%+ completion and invites the student to certify.',
    isMarketing: true,
  },
  exam_nudge_v2: {
    id: 'exam_nudge_v2',
    category: '3. Exam Ready',
    name: 'Exam Ready V2: What to expect',
    subject: 'Ready for your {roadmapTitle} exam? Here’s what to expect',
    description: 'Sets clear, honest expectations about the exam format.',
    isMarketing: true,
  },
  exam_nudge_v3: {
    id: 'exam_nudge_v3',
    category: '3. Exam Ready',
    name: 'Exam Ready V3: A credential you can share',
    subject: 'Turn your {roadmapTitle} progress into a verified certificate',
    description: 'Explains the verifiable QR certificate students earn.',
    isMarketing: true,
  },

  // CATEGORY 4: EXAM RETAKE
  exam_failed_v1: {
    id: 'exam_failed_v1',
    category: '4. Exam Retake',
    name: 'Retake V1: Retakes are free',
    subject: 'Your {roadmapTitle} retake is ready when you are, {name}',
    description: 'Reassures the student that retakes are free.',
    isMarketing: true,
  },
  exam_failed_v2: {
    id: 'exam_failed_v2',
    category: '4. Exam Retake',
    name: 'Retake V2: Review, then retry',
    subject: 'A quick review before your {roadmapTitle} retake, {name}',
    description: 'A three-step review plan for the cooldown window.',
    isMarketing: true,
  },
  exam_failed_v3: {
    id: 'exam_failed_v3',
    category: '4. Exam Retake',
    name: 'Retake V3: Keep going',
    subject: "Don't give up on your {roadmapTitle} certificate, {name}",
    description: 'Short encouraging note after an unsuccessful attempt.',
    isMarketing: true,
  },

  // CATEGORY 5: CERTIFICATE ACHIEVED
  cert_congrats_v1: {
    id: 'cert_congrats_v1',
    category: '5. Alumni Cert',
    name: 'Cert V1: Congratulations + credential',
    subject: "Congratulations, {name} — you're {roadmapTitle} certified",
    description: 'Celebrates the certificate and shows the verification details.',
    isMarketing: true,
  },
  cert_congrats_v2: {
    id: 'cert_congrats_v2',
    category: '5. Alumni Cert',
    name: 'Cert V2: What to learn next',
    subject: "What's next after {roadmapTitle}, {name}?",
    description: 'Suggests a complementary roadmap to continue learning.',
    isMarketing: true,
  },
  cert_congrats_v3: {
    id: 'cert_congrats_v3',
    category: '5. Alumni Cert',
    name: 'Cert V3: Add it to your profile',
    subject: 'Add your {roadmapTitle} certificate to your resume, {name}',
    description: 'Practical steps for using the certificate on LinkedIn/resume.',
    isMarketing: true,
  },

  // CATEGORY 6: SECURITY & ACCOUNT (TRANSACTIONAL)
  transactional_alert_v1: {
    id: 'transactional_alert_v1',
    category: '6. Transactional',
    name: 'Transactional V1: Sign-in notice',
    subject: 'A new sign-in to your SkillBun account',
    description: 'Security notice. Omits marketing unsubscribe per compliance rules.',
    isMarketing: false,
  },
  transactional_alert_v2: {
    id: 'transactional_alert_v2',
    category: '6. Transactional',
    name: 'Transactional V2: Password changed',
    subject: 'Your SkillBun password was changed',
    description: 'Password-change confirmation. Omits marketing unsubscribe.',
    isMarketing: false,
  },
  transactional_alert_v3: {
    id: 'transactional_alert_v3',
    category: '6. Transactional',
    name: 'Transactional V3: Account update',
    subject: 'An update to your SkillBun account',
    description: 'General account notice. Omits marketing unsubscribe.',
    isMarketing: false,
  },
};

export function renderTemplateContent(templateId, { name, email, roadmapTitle, progressCount, totalTopics, roadmapSlug, degree }) {
  const hasCount = progressCount !== null && progressCount !== undefined;
  const hasProgress = hasCount && Number.isFinite(totalTopics) && totalTopics > 0;
  const percent = hasProgress ? Math.round(progressCount / totalTopics * 100) : null;
  const remaining = hasProgress ? Math.max(0, Math.ceil(totalTopics * 0.6) - progressCount) : null;
  const roadmapUrl = roadmapSlug ? `${SITE_URL}/roadmap/${roadmapSlug}` : `${SITE_URL}/roadmap`;
  const examUrl = roadmapSlug ? `${roadmapUrl}/certify` : roadmapUrl;
  const progressGraphic = (label, caption) => hasProgress
    ? emailProgressTrack({ percent, label, caption })
    : emailNote('Open your roadmap to see your latest progress and exam eligibility.');
  const templateConfig = RETENTION_TEMPLATES[templateId] || RETENTION_TEMPLATES.welcome_v1;
  const isMarketing = templateConfig ? templateConfig.isMarketing !== false : true;

  let subject = '';
  let eyebrow = '';
  let headline = '';
  let lede = '';
  let docTag = '';
  let chips = [];
  let contentHtml = '';

  switch (templateId) {
    /* ---------------- CATEGORY 1: ONBOARDING ---------------- */
    case 'welcome_v1':
      subject = `Welcome to SkillBun, ${name} — your roadmaps are ready`;
      eyebrow = 'Welcome';
      docTag = 'Onboarding';
      headline = `Welcome aboard,<br>${name}`;
      lede = 'Your account is ready. Everything below is free — no trial, no card, no paywall.';
      chips = ['100+ roadmaps', 'verified certificates', 'no paywall'];
      contentHtml = `
        ${emailText('SkillBun teaches a tech skill the structured way: follow a roadmap, study each topic, then prove what you know with a certificate anyone can verify.')}
        ${emailStatBand([
          { value: '100+', label: 'Roadmaps' },
          { value: '60%', label: 'Exam unlock' },
          { value: '&#8377;0', label: 'Cost' },
        ])}
        ${emailSectionLabel("What's included")}
        ${emailPoints([
          '<strong>Career roadmaps</strong> across web, AI/ML, DevOps, data and mobile',
          '<strong>Study guides</strong> for every topic, with curated videos and project ideas',
          '<strong>Bun-Bot</strong>, an AI counsellor for questions as you learn',
          '<strong>Verified certificates</strong> you can share once you pass the exam',
        ])}
        ${emailSectionLabel('Tracks students start with')}
        ${emailTags(['Full Stack', 'AI / ML', 'DevOps', 'Data Engineering', 'Android', 'Cybersecurity'])}
        ${emailButton({ href: `${SITE_URL}/quiz`, label: 'Find my roadmap' })}
        ${emailLink({ href: `${SITE_URL}/roadmap`, label: 'Or browse all 100+ roadmaps' })}
      `;
      break;

    case 'welcome_v2':
      subject = `Not sure where to start, ${name}? Take the 2-minute quiz`;
      eyebrow = 'Get started';
      docTag = 'Onboarding';
      headline = "Let's find the right track for you";
      lede = 'With 100+ roadmaps to choose from, the quiz is the fastest way to narrow it down.';
      chips = ['2 minutes', 'retake anytime'];
      contentHtml = `
        ${emailText('The quiz asks about your interests, background and how you like to work, then ranks the roadmaps that fit you best.')}
        ${emailStepRail([
          { title: 'Answer a few questions', body: 'About two minutes, no right or wrong answers.' },
          { title: 'Get your matches', body: 'Ranked roadmaps based on what you told us.' },
          { title: 'Start learning', body: 'Open a roadmap and work through it at your own pace.' },
        ])}
        ${emailSectionLabel('What the quiz weighs')}
        ${emailTags(['Interests', 'Background', 'Maths comfort', 'Build vs analyse', 'Time available'])}
        ${emailButton({ href: `${SITE_URL}/quiz`, label: 'Take the quiz' })}
        ${emailLink({ href: `${SITE_URL}/roadmap`, label: 'Prefer to browse instead' })}
      `;
      break;

    case 'welcome_v3':
      subject = `How SkillBun roadmaps work, ${name}`;
      eyebrow = 'How it works';
      docTag = 'Onboarding';
      headline = 'Three stages, one certificate';
      lede = 'Every roadmap on SkillBun follows the same clear path from first topic to verified credential.';
      contentHtml = `
        ${emailFrame(
          emailNodeRail([
            {
              title: 'Learn',
              body: 'Work through topic nodes with study guides, curated videos and project briefs.',
              state: 'current',
            },
            {
              title: 'Track',
              body: 'Check off topics as you go. Your position on the roadmap is saved automatically.',
              state: 'todo',
            },
            {
              title: 'Certify',
              body: 'Reach 60% to unlock the exam, then pass it to earn your certificate.',
              state: 'todo',
            },
          ], { flush: true }),
          { label: 'Roadmap flow' }
        )}
        ${emailNote('Your certificate comes with a unique verification page and QR code at <strong>skillbun.tech/certificate</strong>, so anyone can confirm it is genuine.')}
        ${emailButton({ href: `${SITE_URL}/roadmap`, label: 'Start learning' })}
      `;
      break;

    /* ---------------- CATEGORY 2: RE-ENGAGEMENT ---------------- */
    case 'reengagement_v1':
      subject = `Your ${roadmapTitle} roadmap is waiting, ${name}`;
      eyebrow = 'Pick up where you left off';
      docTag = 'Progress';
      headline = `Welcome back,<br>${name}`;
      lede = hasCount ? `You've completed ${progressCount} topics on ${roadmapTitle}. Continue from your saved progress.` : 'Open your roadmap to pick up your learning journey.';
      contentHtml = `
        ${hasProgress && totalTopics <= 120 ? emailFrame(
          emailWaffle({
            total: totalTopics,
            filled: progressCount,
            label: roadmapTitle,
            caption: `Each square is one topic node &nbsp;/&nbsp; the exam unlocks at 60%`,
            flush: true,
          }),
          { label: 'Topic matrix' }
        ) : progressGraphic(roadmapTitle, hasCount ? `${progressCount} topics completed` : '')}
        ${emailStatBand([
          ...(hasCount ? [{ value: String(progressCount), label: 'Topics done' }] : []),
          ...(hasProgress ? [{ value: String(remaining), label: 'To exam unlock' }] : []),
          { value: 'Saved', label: 'Your position' },
        ])}
        ${emailText('Even a few minutes today keeps your momentum going. Open the roadmap and continue from your next unfinished topic.')}
        ${emailButton({ href: roadmapUrl, label: 'Continue learning' })}
      `;
      break;

    case 'reengagement_v2':
      subject = `One topic today, ${name}?`;
      eyebrow = 'A small step';
      docTag = 'Progress';
      headline = 'Small steps add up';
      lede = 'You don’t need a free afternoon — one topic node is enough to keep moving.';
      contentHtml = `
        ${progressGraphic(roadmapTitle, `${progressCount} topics done so far`)}
        ${emailNodeRail([
          {
            title: hasCount ? `${progressCount} topics completed` : 'Your learning progress',
            body: hasCount ? 'Marked complete on your roadmap.' : 'Check your roadmap for the latest completed topics.',
            state: 'done',
          },
          {
            title: 'Your next topic',
            body: 'Study guide, videos and a short project brief, all in one node.',
            state: 'current',
          },
          {
            title: 'Certification exam',
            body: `Unlocks once you reach 60% of the ${roadmapTitle} track.`,
            state: 'todo',
          },
        ])}
        ${emailButton({ href: roadmapUrl, label: 'Continue learning' })}
      `;
      break;

    case 'reengagement_v3':
      subject = `You're closer to your ${roadmapTitle} certificate than you think`;
      eyebrow = 'Toward your certificate';
      docTag = 'Progress';
      headline = `Keep going, ${name}`;
      lede = `At 60% roadmap progress your ${roadmapTitle} certification exam unlocks.`;
      contentHtml = `
        ${progressGraphic('Roadmap progress', `${progressCount} topics completed &nbsp;/&nbsp; exam unlocks at 60%`)}
        ${emailStatBand([
          ...(hasProgress ? [{ value: String(remaining), label: 'Topics to unlock' }] : []),
          { value: '70%', label: 'Score to pass' },
          { value: 'Free', label: 'Retakes' },
        ])}
        ${emailText('Every topic you finish moves you closer — and a verified certificate is something you can put straight on your resume and LinkedIn.')}
        ${emailButton({ href: roadmapUrl, label: `Continue ${roadmapTitle}` })}
      `;
      break;

    /* ---------------- CATEGORY 3: EXAM READY ---------------- */
    case 'exam_nudge_v1':
      subject = `Your ${roadmapTitle} certification exam, ${name}`;
      eyebrow = hasProgress && progressCount / totalTopics >= 0.6 ? 'Progress requirement met' : 'Certification exam';
      docTag = 'Certification';
      headline = `Nice work,<br>${name}`;
      lede = hasProgress && progressCount / totalTopics >= 0.6 ? `You've reached 60% progress on ${roadmapTitle}. Open the exam to check your available attempts.` : `Reach 60% progress on ${roadmapTitle} to unlock its certification exam.`;
      chips = ['10 questions', 'free retakes'];
      contentHtml = `
        ${emailFrame(
          emailSpecSheet([
            ['Roadmap', roadmapTitle],
            ['Format', '10 randomly selected questions'],
            ['Time limit', '45 seconds a question'],
            ['Passing score', '70% or higher'],
            ['Cost', 'Free'],
            ['Attempts', '3 total per rolling 24 hours'],
            ['Cooldown', '1 hour after 2 consecutive failures'],
            ['On passing', 'Verified certificate + PDF'],
          ], { flush: true }),
          { label: 'Exam specification' }
        )}
        ${emailNote('No pressure — if you don’t pass the first time, retakes are always free and the questions are reshuffled.')}
        ${emailButton({ href: examUrl, label: roadmapSlug ? 'Open certification exam' : 'Find your roadmap' })}
      `;
      break;

    case 'exam_nudge_v2':
      subject = `Ready for your ${roadmapTitle} exam? Here's what to expect`;
      eyebrow = 'Before you start';
      docTag = 'Certification';
      headline = 'Know what’s coming';
      lede = 'A short, honest rundown so there are no surprises when you begin.';
      contentHtml = `
        ${emailStatBand([
          { value: '10', label: 'Questions' },
          { value: '70%', label: 'To pass' },
          { value: '3', label: 'Attempts / 24h' },
        ])}
        ${emailPoints([
          '<strong>Questions are drawn</strong> from the roadmap’s question bank',
          '<strong>70% to pass</strong> — that’s 7 of 10 correct',
          '<strong>Shuffled each time</strong>, so every attempt is different',
          '<strong>45 seconds a question</strong> — anything left unanswered counts as incorrect',
        ])}
        ${emailText(`When you're ready, open your ${roadmapTitle} roadmap and start the exam from there.`)}
        ${emailNote('Up to 3 total attempts per rolling 24 hours. After 2 consecutive failures, take a 1-hour study cooldown.')}
        ${emailButton({ href: examUrl, label: roadmapSlug ? 'Open certification exam' : 'Find your roadmap' })}
      `;
      break;

    case 'exam_nudge_v3':
      subject = `Turn your ${roadmapTitle} progress into a verified certificate`;
      eyebrow = 'Verified credential';
      docTag = 'Certification';
      headline = 'A certificate that proves it';
      lede = 'Pass the exam and earn a credential anyone can verify online in seconds.';
      contentHtml = `
        ${emailText(`Each SkillBun certificate gets its own verification page with a QR code, so recruiters and employers can confirm your ${roadmapTitle} credential without taking your word for it.`)}
        ${emailCredentialStrip(
          [
            ['Verify at', 'skillbun.tech/certificate/[id]', { href: `${SITE_URL}/certificate` }],
            ['Contains', 'QR code + downloadable PDF'],
            ['Shareable on', 'LinkedIn, resume, portfolio'],
            ['Expires', 'Never'],
          ],
          { title: 'Credential record' }
        )}
        ${emailButton({ href: examUrl, label: roadmapSlug ? 'Open certification exam' : 'Find your roadmap' })}
      `;
      break;

    /* ---------------- CATEGORY 4: EXAM RETAKE ---------------- */
    case 'exam_failed_v1':
      subject = `Plan your ${roadmapTitle} retake, ${name}`;
      eyebrow = 'Prepare to retry';
      docTag = 'Retake';
      headline = 'Not this time — and that’s fine';
      lede = `Retakes on ${roadmapTitle} are free, subject to the attempt limit and study cooldown.`;
      contentHtml = `
        ${emailText('Review the topics you found difficult before your next attempt. Open the exam page to check when you can retry.')}
        ${emailFrame(
          emailSpecSheet([
            ['Retake cost', 'Free'],
            ['Attempts allowed', '3 per 24 hours'],
            ['Cooldown', '1 hour after 2 consecutive failures'],
            ['Question set', 'Reshuffled each attempt'],
            ['Progress lost', 'None'],
          ], { flush: true }),
          { label: 'Retake terms' }
        )}
        ${emailSectionLabel('Before you retry')}
        ${emailPoints([
          'Revisit the topics that felt shaky in your roadmap',
          'Ask Bun-Bot to explain anything that didn’t click',
          'Remember the questions are reshuffled on every attempt',
        ])}
        ${emailButton({ href: examUrl, label: roadmapSlug ? 'Check retake availability' : 'Find your roadmap' })}
      `;
      break;

    case 'exam_failed_v2':
      subject = `A quick review before your ${roadmapTitle} retake, ${name}`;
      eyebrow = 'Review plan';
      docTag = 'Retake';
      headline = 'A little review goes a long way';
      lede = 'Use the time before your retake to revisit what tripped you up.';
      contentHtml = `
        ${emailNodeRail([
          {
            title: `Open your ${roadmapTitle} roadmap`,
            body: 'Your completed topics are all still there, exactly as you left them.',
            state: 'current',
          },
          {
            title: 'Re-read the harder study guides',
            body: 'Focus on the topics you felt least sure about during the attempt.',
            state: 'todo',
          },
          {
            title: 'Ask Bun-Bot, then retry',
            body: 'Clear up anything still fuzzy before your next attempt.',
            state: 'todo',
          },
        ])}
        ${emailButton({ href: roadmapUrl, label: 'Review your roadmap' })}
      `;
      break;

    case 'exam_failed_v3':
      subject = `Don't give up on your ${roadmapTitle} certificate, ${name}`;
      eyebrow = 'Keep going';
      docTag = 'Retake';
      headline = `You've got this, ${name}`;
      lede = 'One attempt doesn’t define your progress. The certificate is still well within reach.';
      contentHtml = `
        ${emailText(`You've already put in the work to unlock the exam. Take a breather, review what tripped you up, and come back for another attempt — retakes are always free.`)}
        ${emailNote('Up to 3 total attempts per rolling 24 hours, with a 1-hour cooldown after 2 consecutive failures.')}
        ${emailButton({ href: examUrl, label: roadmapSlug ? 'Check retake availability' : 'Find your roadmap' })}
      `;
      break;

    /* ---------------- CATEGORY 5: CERTIFICATE ACHIEVED ---------------- */
    case 'cert_congrats_v1':
      subject = `Congratulations, ${name} — you're ${roadmapTitle} certified`;
      eyebrow = 'Certified';
      docTag = 'Credential';
      headline = `Congratulations,<br>${name}`;
      lede = `You've earned your verified ${roadmapTitle} certificate. That's a real milestone.`;
      chips = ['verified', 'qr + pdf'];
      contentHtml = `
        ${emailChipBlock({
          eyebrow: 'Verified credential',
          title: `${roadmapTitle} — Certified`,
          meta: `Issued to ${name} &nbsp;/&nbsp; SkillBun`,
        })}
        ${emailFrame(
          emailSpecSheet([
            ['Issued by', 'SkillBun'],
            ['Verification', 'Public QR page + PDF'],
            ['Valid', 'Permanently'],
          ], { flush: true }),
          { label: 'Certificate of completion' }
        )}
        ${emailText('Your certificate is ready to view, download and share whenever you like. The verification page stays live permanently, so anyone can confirm it is genuine.')}
        ${emailButton({ href: `${SITE_URL}/dashboard/certifications`, label: 'View my certificate' })}
      `;
      break;

    case 'cert_congrats_v2':
      subject = `What's next after ${roadmapTitle}, ${name}?`;
      eyebrow = 'What’s next';
      docTag = 'Credential';
      headline = `Great work on ${roadmapTitle}`;
      lede = 'Now that you have one certificate, a related roadmap is a natural next step.';
      contentHtml = `
        ${emailText('Building a second, complementary skill rounds out your profile and opens up more roles. Every roadmap is free, just like the one you finished.')}
        ${emailSectionLabel('Popular next tracks')}
        ${emailPoints([
          '<strong>AI / Machine Learning</strong> — pairs well with almost any engineering track',
          '<strong>DevOps &amp; Cloud</strong> — for shipping and running what you build',
          '<strong>Data Engineering</strong> — if you enjoyed the data side',
        ])}
        ${emailTags(['AI / ML', 'DevOps', 'Cloud', 'Data Engineering', 'System Design', 'Cybersecurity'])}
        ${emailButton({ href: `${SITE_URL}/roadmap`, label: 'Explore roadmaps' })}
      `;
      break;

    case 'cert_congrats_v3':
      subject = `Add your ${roadmapTitle} certificate to your resume, ${name}`;
      eyebrow = 'Make it count';
      docTag = 'Credential';
      headline = 'Put your certificate to work';
      lede = 'A verified credential is most useful where recruiters can actually see it.';
      contentHtml = `
        ${emailStepRail([
          { title: 'Add it to LinkedIn', body: 'Under Licenses & Certifications, with the verification link.' },
          { title: 'Put the link on your resume', body: 'Next to the skill, so it can be checked in one click.' },
          { title: 'Share the QR code', body: `List ${roadmapTitle} among your skills with the QR link as proof.` },
        ])}
        ${emailButton({ href: `${SITE_URL}/dashboard/certifications`, label: 'Open my certificate' })}
      `;
      break;

    /* ---------------- CATEGORY 6: TRANSACTIONAL ---------------- */
    case 'transactional_alert_v1':
      subject = 'A new sign-in to your SkillBun account';
      eyebrow = 'Security notice';
      docTag = 'Security';
      headline = 'New sign-in detected';
      lede = 'We noticed a sign-in to your SkillBun account.';
      contentHtml = `
        ${emailCredentialStrip(
          [
            ['Account', email || 'your SkillBun account'],
            ['Event', 'Successful sign-in'],
          ],
          { title: 'Event record' }
        )}
        ${emailText('If this was you, no action is needed.')}
        ${emailNote('If you don’t recognise this activity, change your password right away and review your active sessions.', 'danger')}
        ${emailButton({ href: `${SITE_URL}/settings`, label: 'Review account security' })}
      `;
      break;

    case 'transactional_alert_v2':
      subject = 'Your SkillBun password was changed';
      eyebrow = 'Security notice';
      docTag = 'Security';
      headline = 'Password changed';
      lede = 'The password for your SkillBun account was updated.';
      contentHtml = `
        ${emailCredentialStrip(
          [
            ['Account', email || 'your SkillBun account'],
            ['Event', 'Password updated'],
          ],
          { title: 'Event record' }
        )}
        ${emailText('If you made this change, you’re all set — nothing else to do.')}
        ${emailNote('If this wasn’t you, secure your account immediately by resetting your password.', 'danger')}
        ${emailButton({ href: `${SITE_URL}/settings`, label: 'Manage security settings' })}
      `;
      break;

    case 'transactional_alert_v3':
      subject = 'An update to your SkillBun account';
      eyebrow = 'Account notice';
      docTag = 'Account';
      headline = 'Your account was updated';
      lede = 'This is a routine notice about your SkillBun account.';
      contentHtml = `
        ${emailCredentialStrip(
          [
            ['Account', email || 'your SkillBun account'],
            ['Programme', degree],
          ],
          { title: 'Account record' }
        )}
        ${emailText('No action is needed. If anything looks unfamiliar, you can review your account details and security settings at any time.')}
        ${emailButton({ href: `${SITE_URL}/dashboard`, label: 'Go to dashboard' })}
      `;
      break;

    default:
      subject = `An update from SkillBun for ${name}`;
      eyebrow = 'Update';
      docTag = 'Notice';
      headline = `Hi ${name}`;
      lede = 'Pick up your learning journey whenever you’re ready.';
      contentHtml = emailButton({ href: `${SITE_URL}/roadmap`, label: 'Open SkillBun' });
  }

  return { subject, eyebrow, headline, lede, docTag, chips, contentHtml, isMarketing };
}
