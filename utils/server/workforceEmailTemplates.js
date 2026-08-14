import { buildBaseEmailWrapper, escapeHtml } from './retentionEmails.js';

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  try {
    const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (Number.isNaN(d.getTime())) return String(dateValue);
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
        Welcome to SkillBun & Team Cosmic!
      </h1>
      <p class="text-subtle" style="color: #8b949e; margin: 0; font-size: 14px;">
        Official Offer of Engagement & Internship Terms
      </p>
    </div>

    <p style="margin: 0 0 14px 0;">
      Dear ${escapeHtml(salutation)} ${escapeHtml(fullName)},
    </p>

    <p style="margin: 0 0 16px 0; line-height: 1.6;">
      Following your comprehensive technical evaluation and leadership screening, Team Cosmic and SkillBun are pleased to extend this formal offer for the position of <strong>${escapeHtml(designation)}</strong> within the <strong>${escapeHtml(department)}</strong>.
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
          <td style="color: #ffffff;">${escapeHtml(joiningDate)} — ${escapeHtml(contractEndDate)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Stipend Status:</td>
          <td style="color: #ffffff;">${escapeHtml(stipendDisplay)}</td>
        </tr>
        <tr>
          <td style="color: #8b949e;">Reference Code:</td>
          <td style="color: #00e599; font-family: monospace; font-weight: 700;">${escapeHtml(referenceId)}</td>
        </tr>
      </table>
    </div>

    <div style="font-weight: 700; color: #ffffff; font-size: 15px; margin: 22px 0 10px 0;">
      Next Steps to Confirm Your Onboarding:
    </div>

    <ol style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.7; color: #c9d1d9;">
      <li>Review the attached formal 4-page PDF document (<strong>SkillBun Offer Letter & Terms of Engagement</strong>).</li>
      <li>Sign in the <strong>Acceptance Block</strong> on Page 4 (physical or digital signature).</li>
      <li>Reply back to this email thread (<strong>harsh@skillbun.tech</strong>) with your signed copy within <strong>three (3) business days</strong> to finalize your onboarding.</li>
    </ol>

    <p style="margin: 20px 0 0 0; line-height: 1.6;">
      We look forward to working closely with you on production software systems, agile roadmaps, and high-impact engineering milestones!
    </p>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #21262d; font-size: 13.5px; line-height: 1.5; color: #8b949e;">
      Warm regards,<br>
      <strong style="color: #ffffff;">Harsh Patel</strong><br>
      Lead, SkillBun & Team Cosmic<br>
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
    `Following your technical evaluation and leadership screening, Team Cosmic and SkillBun are pleased to extend this formal offer for the position of ${designation} within the ${department}.`,
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
    'Lead, SkillBun & Team Cosmic',
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
