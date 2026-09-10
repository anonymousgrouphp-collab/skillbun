/**
 * SkillBun Workforce (HR) Email Templates
 *
 * Formal offer / extension / termination / activation letters, rendered on the
 * shared email design system (emailTheme.js): a flat document sheet whose
 * masthead carries the reference code as a monospace document tag, the letter
 * type as an eyebrow above the headline, and a body composed from real motifs
 * — a corner-framed spec sheet for the engagement terms, data block for Zoho
 * access, step rail for next steps, note box for the security protocol.
 *
 * These are legal, transactional letters. Function signatures, return shapes,
 * headers (from / cc / replyTo) and the substantive clauses are unchanged;
 * dispatch routes depend on them. Every builder renders with isMarketing=false.
 */

import {
  SITE_URL,
  TOKENS,
  escapeHtml,
  buildEmail,
  emailText,
  emailSectionLabel,
  emailFrame,
  emailChipBlock,
  emailStepRail,
  emailSpecSheet,
  emailCredentialStrip,
  emailNote,
  emailPoints,
  emailButton,
  emailSignoff,
} from './emailTheme.js';

const L = TOKENS.light;

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  try {
    let d;
    if (typeof dateValue === 'string') {
      d = new Date(dateValue.includes('T') ? dateValue : `${dateValue}T00:00:00.000Z`);
    } else if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
      d = dateValue.toDate();
    } else if (dateValue?._seconds) {
      d = new Date(dateValue._seconds * 1000);
    } else if (dateValue instanceof Date) {
      d = dateValue;
    } else {
      d = new Date(dateValue);
    }

    if (!d || Number.isNaN(d.getTime())) return String(dateValue);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return String(dateValue);
  }
}

/* -- Shared blocks ----------------------------------------------------------- */

// Zoho enterprise workspace access. statusLabel: 'Provisioned' | 'Active'.
function credentialsBlock({ zohoWorkEmail, zohoPassword, zohoNotes, statusLabel }) {
  return `
    ${emailText(`Your official SkillBun enterprise workspace account is <strong>${escapeHtml(statusLabel).toLowerCase()}</strong>. Use these confidential credentials to access your work mailbox and team tools.`)}
    ${emailCredentialStrip(
      [
        ['Work email', zohoWorkEmail],
        ['Temporary password', zohoPassword],
        ['Login portal', 'mail.zoho.in', { href: 'https://mail.zoho.in' }],
        ...(zohoNotes ? [['Access notes', zohoNotes, { mono: false }]] : []),
      ],
      { title: 'Enterprise workspace &amp; Zoho Mail' }
    )}
    ${emailNote('<strong>Security protocol:</strong> for compliance, please change your temporary password immediately after your first sign-in at Zoho Mail.')}
  `;
}

/**
 * Formal Offer Letter email payload.
 * @returns {{ subject, html, text, from, cc, replyTo }}
 */
export function buildOfferDispatchEmail({ employee, referenceId, credentials = null }) {
  if (!employee) {
    throw new TypeError('buildOfferDispatchEmail requires an employee record object.');
  }

  const salutation = employee.salutation || 'Mr./Ms.';
  const fullName = employee.full_name || 'Candidate';
  const designation = employee.designation || 'Engineering Intern';
  const department = employee.department || 'Operations & Management';
  const courseDegree = employee.course_degree || '';
  const collegeName = employee.college_name || '';
  const joiningDate = formatDate(employee.joining_date);
  const contractEndDate = formatDate(employee.contract_end_date);
  const stipendAmount = typeof employee.stipend_amount === 'number' ? employee.stipend_amount : 0;
  const stipendDisplay = stipendAmount > 0
    ? `INR ${stipendAmount.toLocaleString('en-IN')} / month`
    : 'Merit-based training with verified credentials & LOR';

  const zohoWorkEmail = (credentials?.work_email || employee.work_email || '').trim();
  const zohoPassword = credentials?.password || '';
  const zohoNotes = (credentials?.access_notes || '').trim();
  const hasZohoCredentials = Boolean(zohoWorkEmail && zohoPassword);

  const subject = `[SkillBun] Formal Offer of Engagement & Internship Terms - ${fullName} (Ref: ${referenceId})`;
  const from = 'SkillBun Hiring Team <noreply@skillbun.tech>';
  const cc = 'harsh@skillbun.tech';
  const replyTo = 'harsh@skillbun.tech';

  const contentHtml = `
    ${emailText(`Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},`)}
    ${emailText(`Following your technical evaluation and screening, SkillBun is pleased to extend this formal offer for the position of <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong>.`)}

    ${emailChipBlock({
      eyebrow: 'Offer of engagement',
      title: escapeHtml(designation),
      meta: `${escapeHtml(department)} &nbsp;/&nbsp; Ref ${escapeHtml(referenceId)}`,
    })}

    ${emailFrame(
      emailSpecSheet([
        ['Candidate', `${escapeHtml(salutation)} ${escapeHtml(fullName)}`],
        ...(courseDegree ? [['Qualification', `${escapeHtml(courseDegree)}${collegeName ? ` &bull; ${escapeHtml(collegeName)}` : ''}`]] : []),
        ['Tenure', `${escapeHtml(joiningDate)} &rarr; ${escapeHtml(contractEndDate)}`],
        ['Stipend', escapeHtml(stipendDisplay)],
      ], { flush: true }),
      { label: 'Engagement overview' }
    )}

    ${hasZohoCredentials ? credentialsBlock({ zohoWorkEmail, zohoPassword, zohoNotes, statusLabel: 'Provisioned' }) : ''}

    ${emailSectionLabel('Next steps to confirm your seat')}
    ${emailStepRail([
      { title: 'Review the attached offer letter', body: 'The formal 4-page Internship Offer Letter & Terms PDF is attached to this email.' },
      { title: 'Sign the acceptance block on page 4', body: 'Your signature confirms the terms of engagement.' },
      { title: 'Reply back to harsh@skillbun.tech with your signed copy within 3 business days', body: 'Send the signed PDF to harsh@skillbun.tech to secure your seat.' },
      ...(hasZohoCredentials ? [{ title: 'Verify your workspace access', body: 'Sign in to your Zoho work email and confirm access to team channels.' }] : []),
    ])}

    ${emailText('We look forward to working closely with you on production software systems, agile roadmaps and high-impact engineering milestones.')}

    ${emailSignoff({ name: 'SkillBun Hiring Team', role: 'Talent Acquisition & People Operations' })}
  `;

  const html = buildEmail({
    title: subject,
    eyebrow: 'Formal internship offer',
    docTag: `Ref ${referenceId}`,
    headline: 'Welcome to the<br>SkillBun team',
    lede: `An official offer of engagement for ${escapeHtml(designation)}.`,
    chips: [department, `Joining ${joiningDate}`],
    contentHtml,
    isMarketing: false,
    email: employee.personal_email || '',
  });

  const textLines = [
    `Dear ${salutation} ${fullName},`,
    '',
    `Following your technical evaluation and screening, SkillBun is pleased to extend this formal offer for the position of ${designation} within the ${department}.`,
    '',
    'ENGAGEMENT OVERVIEW:',
    `- Candidate Name: ${salutation} ${fullName}`,
    `- Role & Stream: ${designation} (${department})`,
    ...(courseDegree ? [`- Academic Qualification: ${courseDegree}${collegeName ? ` (${collegeName})` : ''}`] : []),
    `- Tenure Period: ${joiningDate} to ${contractEndDate}`,
    `- Stipend: ${stipendDisplay}`,
    `- Reference Code: ${referenceId}`,
  ];

  if (hasZohoCredentials) {
    textLines.push(
      '',
      'ENTERPRISE WORKSPACE & ZOHO MAIL CREDENTIALS:',
      `- Work Email: ${zohoWorkEmail}`,
      `- Temporary Password: ${zohoPassword}`,
      '- Login Portal: https://mail.zoho.in',
      ...(zohoNotes ? [`- Access Notes: ${zohoNotes}`] : []),
      '(Note: Please update your temporary password upon first login.)'
    );
  }

  textLines.push(
    '',
    'NEXT STEPS:',
    '1. Review the attached 4-page Offer Letter & Terms of Engagement PDF.',
    '2. Sign the Acceptance Block on Page 4.',
    '3. Reply back to harsh@skillbun.tech with your signed copy within 3 business days.',
    '',
    'Warm regards,',
    'SkillBun Hiring Team',
    'Talent Acquisition & People Operations',
    'SkillBun Inc.',
    'https://skillbun.tech'
  );

  const text = textLines.join('\n');

  return { subject, html, text, from, cc, replyTo };
}

/**
 * Formal Internship Tenure Extension email payload.
 * @returns {{ subject, html, text, cc, replyTo }}
 */
export function buildExtensionDispatchEmail({ employee, referenceId, newContractEndDate }) {
  if (!employee) {
    throw new TypeError('buildExtensionDispatchEmail requires an employee record object.');
  }

  const salutation = employee.salutation || 'Mr./Ms.';
  const fullName = employee.full_name || 'Candidate';
  const designation = employee.designation || 'Engineering Intern';
  const department = employee.department || 'Operations & Management';
  const joiningDate = formatDate(employee.joining_date);
  const extendedEndDate = formatDate(newContractEndDate || employee.contract_end_date);

  const subject = `[SkillBun] Extension of Internship Tenure - ${fullName} (Ref: ${referenceId})`;
  const cc = 'harsh@skillbun.tech';
  const replyTo = 'harsh@skillbun.tech';

  const contentHtml = `
    ${emailText(`Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},`)}
    ${emailText(`In recognition of your technical contributions, milestone execution and ownership as <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong>, SkillBun is pleased to formally extend your internship tenure.`)}

    ${emailFrame(
      emailSpecSheet([
        ['Candidate', `${escapeHtml(salutation)} ${escapeHtml(fullName)}`],
        ['Role & department', `${escapeHtml(designation)} (${escapeHtml(department)})`],
        ['Revised tenure', `${escapeHtml(joiningDate)} &rarr; ${escapeHtml(extendedEndDate)}`],
        ['Extension reference', escapeHtml(referenceId)],
      ], { flush: true }),
      { label: 'Revised tenure overview' }
    )}

    ${emailSectionLabel('Instructions & acceptance')}
    ${emailStepRail([
      { title: 'Review the attached extension letter', body: 'Your official Extension Letter PDF is attached to this email.' },
      { title: 'Sign the candidate acceptance block', body: 'You will find it at the bottom of the letter.' },
      { title: 'Reply with your signed copy', body: 'Send it back on this thread for our records.' },
    ])}

    ${emailText('We look forward to achieving further production milestones and scaling our core systems together.')}

    ${emailSignoff({ name: 'Harsh Patel', role: 'Lead, SkillBun' })}
  `;

  const html = buildEmail({
    title: subject,
    eyebrow: 'Tenure extension',
    docTag: `Ref ${referenceId}`,
    headline: 'Your internship<br>has been extended',
    lede: 'An official addendum to your engagement, with revised terms.',
    chips: [designation, `Through ${extendedEndDate}`],
    contentHtml,
    isMarketing: false,
    email: employee.personal_email || '',
  });

  const text = [
    `Dear ${salutation} ${fullName},`,
    '',
    `SkillBun is pleased to formally extend your internship tenure as ${designation} within the ${department}.`,
    '',
    'REVISED TENURE OVERVIEW:',
    `- Candidate Name: ${salutation} ${fullName}`,
    `- Role & Department: ${designation} (${department})`,
    `- Revised Tenure Period: ${joiningDate} to ${extendedEndDate}`,
    `- Extension Reference: ${referenceId}`,
    '',
    'NEXT STEPS:',
    '1. Review the attached official Extension Letter PDF.',
    '2. Sign the Candidate Acceptance block at the bottom.',
    '3. Reply back to this email with your signed copy.',
    '',
    'Warm regards,',
    'Harsh Patel',
    'Lead, SkillBun',
    'https://skillbun.tech',
  ].join('\n');

  return { subject, html, text, cc, replyTo };
}

/**
 * Formal Termination / Offboarding Notice email payload.
 * @returns {{ subject, html, text, cc, replyTo }}
 */
export function buildTerminationDispatchEmail({
  employee,
  reasonCode = 'COMPLETED',
  reason = '',
  grantedCredentials = [],
  effectiveDate,
}) {
  if (!employee) {
    throw new TypeError('buildTerminationDispatchEmail requires an employee record object.');
  }

  const salutation = employee.salutation || 'Mr./Ms.';
  const fullName = employee.full_name || 'Candidate';
  const designation = employee.designation || 'Intern';
  const department = employee.department || 'Tech Team';
  const effDate = formatDate(effectiveDate || new Date());

  const isPositive = ['COMPLETED', 'ACADEMIC_LEAVE', 'VOLUNTARY_RESIGNATION', 'MUTUAL_SEPARATION'].includes(reasonCode);

  const subject = isPositive
    ? `[SkillBun] Internship Completion & Offboarding Acknowledgement - ${fullName}`
    : `[SkillBun] Official Notice of Engagement Conclusion - ${fullName}`;

  const cc = 'harsh@skillbun.tech';
  const replyTo = 'harsh@skillbun.tech';

  const introParagraph = isPositive
    ? `We would like to formally acknowledge the successful conclusion of your internship tenure as <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong> at SkillBun, effective <strong>${escapeHtml(effDate)}</strong>. We sincerely appreciate your dedication, technical problem solving, and proactive contributions to our student-centric tech roadmaps.`
    : `This email serves as official notification that your tenure as <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong> at SkillBun has concluded, effective <strong>${escapeHtml(effDate)}</strong>.`;

  const credentialsHtml = grantedCredentials.length > 0
    ? `
      ${emailSectionLabel('Granted verified credentials')}
      ${emailPoints(grantedCredentials.map((c) => `<strong>${escapeHtml(c)}</strong> &mdash; verified in the SkillBun Trust Registry`))}
      ${emailText('You can view, verify and download all your official credentials at any time in the SkillBun Alumni Vault.')}
      ${emailButton({ href: `${SITE_URL}/alumni`, label: 'Open the Alumni Vault' })}
    `
    : '';

  const reasonHtml = reason
    ? emailNote(`<strong>Administrative note:</strong> ${escapeHtml(reason)}`, isPositive ? 'neutral' : 'danger')
    : '';

  const contentHtml = `
    ${emailText(`Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},`)}
    ${emailText(introParagraph)}

    ${emailFrame(
      emailSpecSheet([
        ['Role held', `${escapeHtml(designation)} (${escapeHtml(department)})`],
        ['Effective date', escapeHtml(effDate)],
        ['Status', isPositive ? 'Tenure concluded' : 'Engagement concluded'],
      ], { flush: true }),
      { label: 'Offboarding record' }
    )}

    ${reasonHtml}

    ${credentialsHtml}

    ${emailSectionLabel('Offboarding & access protocol')}
    ${emailPoints([
      'Internal workforce credentials and workspace permissions have transitioned to offboarded status.',
      `Your earned public credentials remain securely preserved in the <a href="${SITE_URL}/alumni" class="sb-text" style="color:${L.text}; text-decoration:underline;">Alumni Vault</a>.`,
      'You remain bound by the confidentiality and non-disclosure terms agreed upon during engagement.',
    ])}

    ${emailText(isPositive
      ? 'We wish you the very best in your future career endeavours and look forward to celebrating your continued success.'
      : 'If you have questions regarding offboarding settlements or documentation, reply directly to this email.')}

    ${emailSignoff({ name: 'Harsh Patel', role: 'Lead, SkillBun' })}
  `;

  const html = buildEmail({
    title: subject,
    eyebrow: isPositive ? 'Tenure concluded' : 'Formal offboarding notice',
    docTag: 'Offboarding',
    headline: isPositive ? 'Completion of your<br>internship tenure' : 'Notice of engagement<br>conclusion',
    lede: 'An official record and offboarding summary for your files.',
    chips: [designation, `Effective ${effDate}`],
    contentHtml,
    isMarketing: false,
    email: employee.personal_email || '',
  });

  const text = [
    `Dear ${salutation} ${fullName},`,
    '',
    introParagraph.replace(/<[^>]+>/g, ''),
    '',
    reason ? `Administrative Note: ${reason}\n` : '',
    grantedCredentials.length > 0 ? `GRANTED CREDENTIALS:\n${grantedCredentials.map((c) => `- ${c}`).join('\n')}\nAlumni Document Vault: https://skillbun.tech/alumni\n` : '',
    'OFFBOARDING & ACCESS PROTOCOL:',
    '- Internal workspace credentials and dashboard privileges have transitioned to offboarded status.',
    '- Earned public credentials remain preserved at https://skillbun.tech/alumni.',
    '- Confidentiality and non-disclosure obligations remain binding.',
    '',
    'Warm regards,',
    'Harsh Patel',
    'Lead, SkillBun',
    'https://skillbun.tech',
  ].join('\n');

  return { subject, html, text, cc, replyTo };
}

/**
 * Activation / Welcome (onboarding complete) email payload.
 * @returns {{ subject, html, text, from, cc, replyTo }}
 */
export function buildActivationWelcomeEmail({ employee, credentials }) {
  const fullName = employee.full_name || 'Team Member';
  const salutation = employee.salutation || 'Mr./Ms.';
  const designation = employee.designation || 'Intern';
  const department = employee.department || 'Engineering';
  const joiningDate = formatDate(employee.joining_date);

  const zohoWorkEmail = (credentials?.work_email || employee.work_email || '').trim();
  const zohoPassword = credentials?.password || '';
  const zohoNotes = (credentials?.access_notes || '').trim();
  const hasZohoCredentials = Boolean(zohoWorkEmail && zohoPassword);

  const subject = `[SkillBun] Welcome to the Team! Onboarding Complete & Workspace Access - ${fullName}`;
  const from = 'SkillBun Hiring Team <noreply@skillbun.tech>';
  const cc = 'harsh@skillbun.tech';
  const replyTo = 'harsh@skillbun.tech';

  const contentHtml = `
    ${emailText(`Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},`)}
    ${emailText(`Your onboarding documentation has been processed and your status is officially <strong>active</strong> as <strong>${escapeHtml(designation)}</strong> (${escapeHtml(department)}), effective from <strong>${escapeHtml(joiningDate)}</strong>.`)}

    ${hasZohoCredentials ? credentialsBlock({ zohoWorkEmail, zohoPassword, zohoNotes, statusLabel: 'Active' }) : ''}

    ${emailSectionLabel('Day one')}
    ${emailStepRail([
      ...(hasZohoCredentials
        ? [{ title: 'Sign in to your work mailbox', body: `Open <a href="https://mail.zoho.in" target="_blank" class="sb-text" style="color:${L.text}; font-weight:700; text-decoration:underline;">mail.zoho.in</a> and verify your access.` }]
        : []),
      { title: 'Check for team invitations', body: 'Project invitations and sprint check-in schedules land in your inbox.' },
      { title: 'Get familiar with the product', body: `Explore the interactive roadmaps and resources at <a href="${SITE_URL}" target="_blank" class="sb-text" style="color:${L.text}; font-weight:700; text-decoration:underline;">skillbun.tech</a>.` },
      { title: 'Questions?', body: `Reach out directly to <a href="mailto:harsh@skillbun.tech" class="sb-text" style="color:${L.text}; font-weight:700; text-decoration:underline;">harsh@skillbun.tech</a>.` },
    ])}

    ${emailSignoff({ name: 'SkillBun Hiring & People Operations', role: '' })}
  `;

  const html = buildEmail({
    title: subject,
    eyebrow: 'Onboarding complete',
    docTag: 'Activation',
    headline: 'Welcome to the<br>SkillBun team',
    lede: 'Your engagement is now officially active.',
    chips: [designation, `Since ${joiningDate}`],
    contentHtml,
    isMarketing: false,
    email: employee.personal_email || '',
  });

  const textLines = [
    `Dear ${salutation} ${fullName},`,
    '',
    `We are delighted to confirm that your onboarding documentation has been processed and your status is officially ACTIVE as ${designation} (${department}), effective from ${joiningDate}.`,
    '',
  ];

  if (hasZohoCredentials) {
    textLines.push(
      'ENTERPRISE WORKSPACE & ZOHO MAIL CREDENTIALS:',
      `- Work Email: ${zohoWorkEmail}`,
      `- Temporary Password: ${zohoPassword}`,
      '- Login Portal: https://mail.zoho.in',
      ...(zohoNotes ? [`- Access Notes: ${zohoNotes}`] : []),
      '(Note: Please update your temporary password upon first login.)',
      ''
    );
  }

  textLines.push(
    'DAY 1 GETTING STARTED:',
    hasZohoCredentials ? '1. Log in to your Zoho work mailbox (https://mail.zoho.in).' : '1. Check your inbox for team project invitations.',
    '2. Familiarize yourself with interactive roadmaps at https://skillbun.tech.',
    '3. For questions, contact harsh@skillbun.tech.',
    '',
    'Warm regards,',
    'SkillBun Hiring & People Operations',
    'SkillBun Inc.',
    'https://skillbun.tech'
  );

  const text = textLines.join('\n');

  return { subject, html, text, from, cc, replyTo };
}
