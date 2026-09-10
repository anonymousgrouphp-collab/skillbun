import { buildBaseEmailWrapper, escapeHtml } from './retentionEmails.js';

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

/**
 * Generates the formal Offer Letter email payload with subject, responsive HTML, and plain text.
 * @param {Object} params
 * @param {Object} params.employee - Firestore employee record
 * @param {string} params.referenceId - Allocated workforce offer reference ID (e.g. SB-OFF-2026-XXXXXX)
 * @returns {{ subject: string, html: string, text: string, cc: string, replyTo: string }}
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

  const credentialsHtml = hasZohoCredentials ? `
    <!-- Zoho Enterprise Credentials Card -->
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #00b87a; border-radius: 14px; padding: 20px; margin: 22px 0; box-shadow: 0 4px 16px rgba(0, 184, 122, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div class="text-accent" style="font-weight: 800; color: #008751; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
          🏢 Enterprise Workspace & Zoho Mail Credentials
        </div>
        <span style="background: rgba(0,184,122,0.12); color: #008751; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">Provisioned</span>
      </div>
      <p style="margin: 0 0 14px 0; font-size: 13.5px; color: #475569; line-height: 1.5;">
        Your official SkillBun enterprise workspace account has been provisioned. Please use these confidential credentials to access your work mailbox and team collaboration tools:
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.9;">
        <tr>
          <td class="table-label" style="color: #64748b; width: 38%;">Work Email (Zoho):</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700; font-family: monospace;">${escapeHtml(zohoWorkEmail)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Temporary Password:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700; font-family: monospace; letter-spacing: 0.5px; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px; display: inline-block;">${escapeHtml(zohoPassword)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Mail Login Portal:</td>
          <td class="table-val">
            <a href="https://mail.zoho.in" target="_blank" style="color: #008751; font-weight: 700; text-decoration: underline;">https://mail.zoho.in</a>
          </td>
        </tr>
        ${zohoNotes ? `
        <tr>
          <td class="table-label" style="color: #64748b; vertical-align: top;">Access Notes:</td>
          <td class="table-val" style="color: #334155; font-size: 13px;">${escapeHtml(zohoNotes)}</td>
        </tr>` : ''}
      </table>
      <div style="margin-top: 14px; padding: 10px 12px; background: rgba(0, 135, 81, 0.06); border-radius: 8px; font-size: 12px; color: #166534; line-height: 1.5;">
        🔒 <strong>Security Protocol:</strong> For compliance and safety, please update your temporary password immediately upon your first sign-in at Zoho Mail.
      </div>
    </div>
  ` : '';

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <div class="badge-pill" style="display: inline-block; background-color: rgba(0,184,122,0.1); color: #008751; border: 1px solid rgba(0,184,122,0.25); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
        🎉 Formal Internship Offer & Welcome
      </div>
      <h1 class="text-title" style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">
        Welcome to the SkillBun Team!
      </h1>
      <p class="text-subtle" style="color: #475569; margin: 0; font-size: 14px;">
        Official Offer of Engagement & Internship Terms
      </p>
    </div>

    <p style="margin: 0 0 14px 0;">
      Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},
    </p>

    <p style="margin: 0 0 16px 0; line-height: 1.6;">
      Following your comprehensive technical evaluation and screening, SkillBun is thrilled to extend this formal offer for the position of <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong>.
    </p>

    <!-- Details Box -->
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <div class="text-accent" style="font-weight: 800; color: #008751; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Engagement Overview
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.8;">
        <tr>
          <td class="table-label" style="color: #64748b; width: 40%;">Candidate Name:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700;">${escapeHtml(salutation)} ${escapeHtml(fullName)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Role & Stream:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700;">${escapeHtml(designation)} (${escapeHtml(department)})</td>
        </tr>
        ${courseDegree ? `
        <tr>
          <td class="table-label" style="color: #64748b;">Academic Qualification:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 600;">${escapeHtml(courseDegree)}${collegeName ? ` &bull; ${escapeHtml(collegeName)}` : ''}</td>
        </tr>` : ''}
        <tr>
          <td class="table-label" style="color: #64748b;">Tenure Period:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700;">${escapeHtml(joiningDate)} to ${escapeHtml(contractEndDate)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Stipend Structure:</td>
          <td class="text-accent" style="color: #008751; font-weight: 700;">${escapeHtml(stipendDisplay)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Reference Code:</td>
          <td class="table-val" style="color: #0f172a; font-family: monospace; font-weight: 700;">${escapeHtml(referenceId)}</td>
        </tr>
      </table>
    </div>

    ${credentialsHtml}

    <!-- Instructions Box -->
    <div class="box-instructions" style="background-color: #f0fdf4; border-left: 3px solid #00b87a; padding: 14px 16px; margin: 20px 0; font-size: 13.5px; line-height: 1.6; color: #166534;">
      <strong class="instructions-heading" style="color: #0f172a;">Next Steps to Confirm Your Seat:</strong>
      <ol style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Review the attached formal <strong>4-page Internship Offer Letter & Terms PDF</strong>.</li>
        <li>Sign the <strong>Candidate Acceptance block on Page 4</strong>.</li>
        <li>Reply back to this email with your signed copy within <strong>3 business days</strong>.</li>
        ${hasZohoCredentials ? '<li>Log into your Zoho work email and verify initial access to team channels.</li>' : ''}
      </ol>
    </div>

    <p style="margin: 20px 0 0 0; line-height: 1.6;">
      We look forward to working closely with you on production software systems, agile roadmaps, and high-impact engineering milestones!
    </p>

    <div class="divider" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13.5px; line-height: 1.5; color: #64748b;">
      Warm regards,<br>
      <strong class="instructions-heading" style="color: #0f172a; font-size: 15px;">SkillBun Hiring Team</strong><br>
      <span style="color: #64748b; font-size: 13px;">Talent Acquisition & People Operations</span><br>
      SkillBun Inc. &bull; <a href="https://skillbun.tech" class="text-accent" style="color: #008751; text-decoration: none; font-weight: 700;">skillbun.tech</a>
    </div>
  `;

  const html = buildBaseEmailWrapper(
    contentHtml,
    subject,
    false, // isMarketing = false for transactional/legal
    employee.personal_email || ''
  );

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

  return {
    subject,
    html,
    text,
    from,
    cc,
    replyTo,
  };
}

/**
 * Generates the formal Internship Tenure Extension email payload with subject, responsive HTML, and plain text.
 * @param {Object} params
 * @param {Object} params.employee - Firestore employee record
 * @param {string} params.referenceId - Allocated workforce extension reference ID (e.g. SB-EXT-2026-XXXXXX)
 * @param {string} [params.newContractEndDate] - Extended contract end date string (YYYY-MM-DD)
 * @returns {{ subject: string, html: string, text: string, cc: string, replyTo: string }}
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
    <div style="margin-bottom: 24px;">
      <div class="badge-pill" style="display: inline-block; background-color: rgba(0,184,122,0.1); color: #008751; border: 1px solid rgba(0,184,122,0.25); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
        🚀 Internship Tenure Extension
      </div>
      <h1 class="text-title" style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">
        Extension of Internship Tenure
      </h1>
      <p class="text-subtle" style="color: #475569; margin: 0; font-size: 14px;">
        Official Addendum & Revised Terms
      </p>
    </div>

    <p style="margin: 0 0 14px 0;">
      Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},
    </p>

    <p style="margin: 0 0 16px 0; line-height: 1.6;">
      In recognition of your proactive technical contributions, milestone execution, and leadership ownership as <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong>, SkillBun is pleased to formally extend your internship tenure.
    </p>

    <!-- Details Box -->
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <div class="text-accent" style="font-weight: 800; color: #008751; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Revised Tenure Overview
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.8;">
        <tr>
          <td class="table-label" style="color: #64748b; width: 40%;">Candidate Name:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700;">${escapeHtml(salutation)} ${escapeHtml(fullName)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Role & Department:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700;">${escapeHtml(designation)} (${escapeHtml(department)})</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Revised Tenure Period:</td>
          <td class="text-accent" style="color: #008751; font-weight: 700;">${escapeHtml(joiningDate)} to ${escapeHtml(extendedEndDate)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Extension Reference:</td>
          <td class="table-val" style="color: #0f172a; font-family: monospace; font-weight: 700;">${escapeHtml(referenceId)}</td>
        </tr>
      </table>
    </div>

    <!-- Instructions Box -->
    <div class="box-instructions" style="background-color: #f0fdf4; border-left: 3px solid #00b87a; padding: 14px 16px; margin: 20px 0; font-size: 13.5px; line-height: 1.6; color: #166534;">
      <strong class="instructions-heading" style="color: #0f172a;">Instructions & Acceptance:</strong>
      <ol style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Review your attached official <strong>Extension Letter PDF</strong>.</li>
        <li>Sign the <strong>Candidate Acceptance block</strong> at the bottom of the letter.</li>
        <li>Reply back to this email thread with your signed copy for organizational records.</li>
      </ol>
    </div>

    <p style="margin: 20px 0 0 0; line-height: 1.6;">
      We look forward to achieving further production milestones and scaling our core systems together!
    </p>

    <div class="divider" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13.5px; line-height: 1.5; color: #64748b;">
      Warm regards,<br>
      <strong class="instructions-heading" style="color: #0f172a;">Harsh Patel</strong><br>
      Lead, SkillBun<br>
      <a href="https://skillbun.tech" class="text-accent" style="color: #008751; text-decoration: none; font-weight: 700;">skillbun.tech</a>
    </div>
  `;

  const html = buildBaseEmailWrapper(
    contentHtml,
    subject,
    false,
    employee.personal_email || ''
  );

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

  return {
    subject,
    html,
    text,
    cc,
    replyTo,
  };
}

/**
 * Generates the formal Termination / Offboarding Notice email payload.
 * @param {Object} params
 * @param {Object} params.employee - Firestore employee record
 * @param {string} [params.reason] - Optional reason or note
 * @param {string} [params.effectiveDate] - Effective date string
 * @returns {{ subject: string, html: string, text: string, cc: string, replyTo: string }}
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

  const badgeText = isPositive ? '🎉 Tenure Concluded & Certified' : '⚠️ Formal Offboarding Notice';
  const badgeColor = isPositive ? '#008751' : '#ef4444';
  const badgeBg = isPositive ? 'rgba(0,184,122,0.1)' : 'rgba(239,68,68,0.12)';
  const headingText = isPositive ? 'Completion of Internship Tenure' : 'Notice of Engagement Conclusion';

  const introParagraph = isPositive
    ? `We would like to formally acknowledge the successful conclusion of your internship tenure as <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong> at SkillBun, effective <strong>${escapeHtml(effDate)}</strong>. We sincerely appreciate your dedication, technical problem solving, and proactive contributions to our student-centric tech roadmaps.`
    : `This email serves as official notification that your tenure as <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong> at SkillBun has concluded, effective <strong>${escapeHtml(effDate)}</strong>.`;

  const credentialsHtml = grantedCredentials.length > 0 ? `
    <div class="box-card" style="background-color: #f0fdf4; border: 1.5px solid rgba(0,184,122,0.3); border-radius: 14px; padding: 18px 20px; margin: 18px 0;">
      <div style="font-weight: 800; color: #008751; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
        🎓 Granted Verified Credentials & Documents
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.7; color: #166534;">
        ${grantedCredentials.map((c) => `<li><strong>${escapeHtml(c)}</strong> — Verified in SkillBun Trust Registry</li>`).join('')}
      </ul>
      <div style="margin-top: 12px; font-size: 13px; color: #166534;">
        You can securely view, verify, and download all your official credentials at any time in the <strong>SkillBun Alumni Vault</strong>:<br>
        <a href="https://skillbun.tech/alumni" style="display: inline-block; margin-top: 8px; background-color: #008751; color: #ffffff; padding: 6px 14px; border-radius: 8px; text-decoration: none; font-weight: 750; font-size: 12.5px;">Visit Alumni Document Vault &rarr;</a>
      </div>
    </div>
  ` : '';

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
        ${badgeText}
      </div>
      <h1 class="text-title" style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">
        ${headingText}
      </h1>
      <p class="text-subtle" style="color: #475569; margin: 0; font-size: 14px;">
        Official Record & Offboarding Summary
      </p>
    </div>

    <p style="margin: 0 0 14px 0;">
      Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},
    </p>

    <p style="margin: 0 0 16px 0; line-height: 1.6;">
      ${introParagraph}
    </p>

    ${reason ? `
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin: 16px 0;">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Administrative Note</div>
      <div style="font-size: 14px; line-height: 1.5; color: #1e293b;">${escapeHtml(reason)}</div>
    </div>
    ` : ''}

    ${credentialsHtml}

    <!-- Offboarding Protocol Box -->
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <div style="font-weight: 800; color: ${badgeColor}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Offboarding & Access Protocol
      </div>
      <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.7; color: #475569;">
        <li>Internal workforce administrative credentials and workspace permissions have been transitioned to offboarded status.</li>
        <li>Your earned public credentials remain securely preserved in the <a href="https://skillbun.tech/alumni" style="color: #008751; text-decoration: underline;">Alumni Vault</a>.</li>
        <li>You remain bound by confidentiality and non-disclosure terms agreed upon during engagement.</li>
      </ul>
    </div>

    <p style="margin: 20px 0 0 0; line-height: 1.6;">
      ${isPositive ? 'We wish you the very best in your future career endeavors and look forward to celebrating your continued success!' : 'If you have questions regarding offboarding settlements or documentation, reply directly to this email.'}
    </p>

    <div class="divider" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13.5px; line-height: 1.5; color: #64748b;">
      Warm regards,<br>
      <strong class="instructions-heading" style="color: #0f172a;">Harsh Patel</strong><br>
      Lead, SkillBun<br>
      <a href="https://skillbun.tech" class="text-accent" style="color: #008751; text-decoration: none; font-weight: 750;">skillbun.tech</a>
    </div>
  `;

  const html = buildBaseEmailWrapper(
    contentHtml,
    subject,
    false,
    employee.personal_email || ''
  );

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

  return {
    subject,
    html,
    text,
    cc,
    replyTo,
  };
}

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

  const credentialsHtml = hasZohoCredentials ? `
    <!-- Zoho Enterprise Credentials Card -->
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #00b87a; border-radius: 14px; padding: 20px; margin: 22px 0; box-shadow: 0 4px 16px rgba(0, 184, 122, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div class="text-accent" style="font-weight: 800; color: #008751; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
          🏢 Enterprise Workspace & Zoho Mail Credentials
        </div>
        <span style="background: rgba(0,184,122,0.12); color: #008751; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">Active</span>
      </div>
      <p style="margin: 0 0 14px 0; font-size: 13.5px; color: #475569; line-height: 1.5;">
        Your SkillBun enterprise workspace account is officially provisioned. Please use these confidential credentials to sign in to your work email and team tools:
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.9;">
        <tr>
          <td class="table-label" style="color: #64748b; width: 38%;">Work Email (Zoho):</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700; font-family: monospace;">${escapeHtml(zohoWorkEmail)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Temporary Password:</td>
          <td class="table-val" style="color: #0f172a; font-weight: 700; font-family: monospace; letter-spacing: 0.5px; background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px; display: inline-block;">${escapeHtml(zohoPassword)}</td>
        </tr>
        <tr>
          <td class="table-label" style="color: #64748b;">Mail Login Portal:</td>
          <td class="table-val">
            <a href="https://mail.zoho.in" target="_blank" style="color: #008751; font-weight: 700; text-decoration: underline;">https://mail.zoho.in</a>
          </td>
        </tr>
        ${zohoNotes ? `
        <tr>
          <td class="table-label" style="color: #64748b; vertical-align: top;">Access Notes:</td>
          <td class="table-val" style="color: #334155; font-size: 13px;">${escapeHtml(zohoNotes)}</td>
        </tr>` : ''}
      </table>
      <div style="margin-top: 14px; padding: 10px 12px; background: rgba(0, 135, 81, 0.06); border-radius: 8px; font-size: 12px; color: #166534; line-height: 1.5;">
        🔒 <strong>Security Protocol:</strong> Please update your temporary password immediately upon your first sign-in at Zoho Mail.
      </div>
    </div>
  ` : '';

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <div class="badge-pill" style="display: inline-block; background-color: rgba(0,184,122,0.1); color: #008751; border: 1px solid rgba(0,184,122,0.25); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
        🚀 Onboarding Complete & Active
      </div>
      <h1 class="text-title" style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">
        Welcome to the SkillBun Team!
      </h1>
      <p class="text-subtle" style="color: #475569; margin: 0; font-size: 14px;">
        Your engagement is now officially active.
      </p>
    </div>

    <p style="margin: 0 0 14px 0;">
      Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},
    </p>

    <p style="margin: 0 0 16px 0; line-height: 1.6;">
      We are delighted to confirm that your onboarding documentation has been processed and your status is officially <strong>ACTIVE</strong> as <strong>${escapeHtml(designation)}</strong> (${escapeHtml(department)}), effective from <strong>${escapeHtml(joiningDate)}</strong>.
    </p>

    ${credentialsHtml}

    <!-- Quick Start Box -->
    <div class="box-card" style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <div class="text-accent" style="font-weight: 800; color: #008751; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        📌 Day 1 Getting Started
      </div>
      <ol style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.8; color: #475569;">
        ${hasZohoCredentials ? '<li>Log in to your official Zoho work mailbox (<a href="https://mail.zoho.in" target="_blank" style="color: #008751; font-weight: 600;">mail.zoho.in</a>) to verify access.</li>' : ''}
        <li>Check your inbox for team project invitations and sprint check-in schedules.</li>
        <li>Familiarize yourself with interactive roadmaps and technical resources at <a href="https://skillbun.tech" target="_blank" style="color: #008751; font-weight: 600;">skillbun.tech</a>.</li>
        <li>For any operational questions, reach out directly to the core team at <a href="mailto:harsh@skillbun.tech" style="color: #008751; font-weight: 600;">harsh@skillbun.tech</a>.</li>
      </ol>
    </div>

    <div class="divider" style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13.5px; line-height: 1.5; color: #64748b;">
      Warm regards,<br>
      <strong class="instructions-heading" style="color: #0f172a;">SkillBun Hiring & People Operations</strong><br>
      SkillBun Inc. • <a href="https://skillbun.tech" class="text-accent" style="color: #008751; text-decoration: none; font-weight: 750;">skillbun.tech</a>
    </div>
  `;

  const html = buildBaseEmailWrapper(
    contentHtml,
    subject,
    false,
    employee.personal_email || ''
  );

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

  return {
    subject,
    html,
    text,
    from,
    cc,
    replyTo,
  };
}

