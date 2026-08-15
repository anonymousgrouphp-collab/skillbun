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
export function buildOfferDispatchEmail({ employee, referenceId }) {
  if (!employee) {
    throw new TypeError('buildOfferDispatchEmail requires an employee record object.');
  }

  const salutation = employee.salutation || 'Mr./Ms.';
  const fullName = employee.full_name || 'Candidate';
  const designation = employee.designation || 'Engineering Intern';
  const department = employee.department || 'Tech Team (Development & Engineering)';
  const joiningDate = formatDate(employee.joining_date);
  const contractEndDate = formatDate(employee.contract_end_date);
  const stipendAmount = typeof employee.stipend_amount === 'number' ? employee.stipend_amount : 0;
  const stipendDisplay = stipendAmount > 0
    ? `INR ${stipendAmount.toLocaleString('en-IN')} / month`
    : 'Merit-based training with verified credentials & LOR';

  const subject = `[SkillBun] Internship Offer Letter & Terms of Engagement - ${fullName} (Ref: ${referenceId})`;
  const cc = 'harsh@skillbun.tech';
  const replyTo = 'harsh@skillbun.tech';

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; background-color: rgba(0,229,153,0.12); color: #00e599; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
        🎉 Formal Internship Offer
      </div>
      <h1 class="text-title" style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Welcome to SkillBun!
      </h1>
      <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
        Official Offer of Engagement & Internship Terms
      </p>
    </div>

    <p style="margin: 0 0 14px 0;">
      Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},
    </p>

    <p style="margin: 0 0 16px 0; line-height: 1.6;">
      Following your comprehensive technical evaluation and leadership screening, SkillBun is pleased to extend this formal offer for the position of <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong>.
    </p>

    <!-- Details Box -->
    <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <div style="font-weight: 800; color: #00e599; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Engagement Overview
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.8;">
        <tr>
          <td style="color: #8b949e; width: 40%;">Candidate Name:</td>
          <td style="color: #ffffff; font-weight: 700;">${escapeHtml(salutation)} ${escapeHtml(fullName)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Role & Stream:</td>
          <td style="color: #ffffff; font-weight: 700;">${escapeHtml(designation)} (${escapeHtml(department)})</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Tenure Period:</td>
          <td style="color: #ffffff; font-weight: 700;">${escapeHtml(joiningDate)} to ${escapeHtml(contractEndDate)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Stipend Structure:</td>
          <td style="color: #00e599; font-weight: 700;">${escapeHtml(stipendDisplay)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Reference Code:</td>
          <td style="color: #ffffff; font-family: monospace;">${escapeHtml(referenceId)}</td>
        </tr>
      </table>
    </div>

    <!-- Instructions Box -->
    <div style="background-color: rgba(0,229,153,0.06); border-left: 3px solid #00e599; padding: 14px 16px; margin: 20px 0; font-size: 13.5px; line-height: 1.6; color: #c9d1d9;">
      <strong style="color: #ffffff;">Next Steps to Confirm Your Seat:</strong>
      <ol style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Review the attached formal <strong>4-page Internship Offer Letter & Terms PDF</strong>.</li>
        <li>Sign the <strong>Candidate Acceptance block on Page 4</strong>.</li>
        <li>Reply back to this email with your signed copy within <strong>3 business days</strong>.</li>
      </ol>
    </div>

    <p style="margin: 20px 0 0 0; line-height: 1.6;">
      We look forward to working closely with you on production software systems, agile roadmaps, and high-impact engineering milestones!
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #21262d; font-size: 13.5px; line-height: 1.5; color: #8b949e;">
      Warm regards,<br>
      <strong style="color: #ffffff;">Harsh Patel</strong><br>
      Lead, SkillBun<br>
      <a href="https://skillbun.tech" style="color: #00e599; text-decoration: none;">skillbun.tech</a>
    </div>
  `;

  const html = buildBaseEmailWrapper(
    contentHtml,
    subject,
    false, // isMarketing = false for transactional/legal
    employee.personal_email || ''
  );

  const text = [
    `Dear ${salutation} ${fullName},`,
    '',
    `Following your technical evaluation and leadership screening, SkillBun is pleased to extend this formal offer for the position of ${designation} within the ${department}.`,
    '',
    'ENGAGEMENT OVERVIEW:',
    `- Candidate Name: ${salutation} ${fullName}`,
    `- Role & Stream: ${designation} (${department})`,
    `- Tenure Period: ${joiningDate} to ${contractEndDate}`,
    `- Stipend: ${stipendDisplay}`,
    `- Reference Code: ${referenceId}`,
    '',
    'NEXT STEPS:',
    '1. Review the attached 4-page Offer Letter & Terms of Engagement PDF.',
    '2. Sign the Acceptance Block on Page 4.',
    '3. Reply back to harsh@skillbun.tech with your signed copy within 3 business days.',
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
  const department = employee.department || 'Tech Team (Development & Engineering)';
  const joiningDate = formatDate(employee.joining_date);
  const extendedEndDate = formatDate(newContractEndDate || employee.contract_end_date);

  const subject = `[SkillBun] Extension of Internship Tenure - ${fullName} (Ref: ${referenceId})`;
  const cc = 'harsh@skillbun.tech';
  const replyTo = 'harsh@skillbun.tech';

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <div style="display: inline-block; background-color: rgba(0,229,153,0.12); color: #00e599; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
        🚀 Internship Tenure Extension
      </div>
      <h1 class="text-title" style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Extension of Internship Tenure
      </h1>
      <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
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
    <div class="box-dark" style="background-color: #0d1117; border: 1.5px solid #30363d; border-radius: 14px; padding: 20px; margin: 20px 0;">
      <div style="font-weight: 800; color: #00e599; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
        Revised Tenure Overview
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.8;">
        <tr>
          <td style="color: #8b949e; width: 40%;">Candidate Name:</td>
          <td style="color: #ffffff; font-weight: 700;">${escapeHtml(salutation)} ${escapeHtml(fullName)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Role & Department:</td>
          <td style="color: #ffffff; font-weight: 700;">${escapeHtml(designation)} (${escapeHtml(department)})</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Revised Tenure Period:</td>
          <td style="color: #00e599; font-weight: 700;">${escapeHtml(joiningDate)} to ${escapeHtml(extendedEndDate)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Extension Reference:</td>
          <td style="color: #ffffff; font-family: monospace;">${escapeHtml(referenceId)}</td>
        </tr>
      </table>
    </div>

    <!-- Instructions Box -->
    <div style="background-color: rgba(0,229,153,0.06); border-left: 3px solid #00e599; padding: 14px 16px; margin: 20px 0; font-size: 13.5px; line-height: 1.6; color: #c9d1d9;">
      <strong style="color: #ffffff;">Instructions & Acceptance:</strong>
      <ol style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Review your attached official <strong>Extension Letter PDF</strong>.</li>
        <li>Sign the <strong>Candidate Acceptance block</strong> at the bottom of the letter.</li>
        <li>Reply back to this email thread with your signed copy for organizational records.</li>
      </ol>
    </div>

    <p style="margin: 20px 0 0 0; line-height: 1.6;">
      We look forward to achieving further production milestones and scaling our core systems together!
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #21262d; font-size: 13.5px; line-height: 1.5; color: #8b949e;">
      Warm regards,<br>
      <strong style="color: #ffffff;">Harsh Patel</strong><br>
      Lead, SkillBun<br>
      <a href="https://skillbun.tech" style="color: #00e599; text-decoration: none;">skillbun.tech</a>
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
