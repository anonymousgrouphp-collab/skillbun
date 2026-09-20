import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateWorkforceId, formatWorkforceDisplayId, WORKFORCE_PREFIXES } from '../../../workforceId.js';
import {
  COLORS,
  CONTENT_WIDTH,
  drawPageFooter,
  drawPageHeader,
  drawParagraph,
  drawSectionHeading,
  MARGINS,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  wrapText,
} from '../../pdfLayoutHelper.js';

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
 * Generates a formal 1-page Notice of Engagement Conclusion / Termination Notice PDF (V1).
 *
 * @param {Object} employee - Employee record or snapshot from Firestore
 * @param {Object} [options]
 * @param {string} [options.referenceId] - Pre-allocated reference ID
 * @param {string} [options.templateVersion] - Resolved template version (e.g. 'v1')
 * @param {string} [options.reasonCode] - 'COMPLETED', 'MUTUAL_SEPARATION', 'PERFORMANCE', 'POLICY_VIOLATION'
 * @param {string} [options.reason] - Detailed remarks
 * @param {Array<string>} [options.grantedCredentials] - List of credential display IDs
 * @param {string|Date} [options.effectiveDate] - Effective date of conclusion
 * @returns {Promise<{ buffer: Buffer, filename: string, referenceId: string, metadataSnapshot: Object }>}
 */
export async function generateTerminationNoticeV1(employee, options = {}) {
  if (!employee || typeof employee !== 'object') {
    throw new TypeError('generateTerminationNoticeV1 requires a valid employee record object.');
  }

  const rawRefId = options.referenceId || employee.reference_id || generateWorkforceId(WORKFORCE_PREFIXES.TERMINATION);
  const referenceId = formatWorkforceDisplayId(rawRefId);
  const meta = employee.metadata_snapshot || {};
  const issueDateStr = formatDate(employee.issued_at || meta.issued_at || new Date());
  const templateVersion = options.templateVersion || meta.template_version || employee.template_version || 'v1';

  const salutation = meta.salutation || employee.salutation || 'Mr./Ms.';
  const fullName = meta.full_name || employee.full_name || 'Candidate Name';
  const department = meta.department || employee.department || 'Operations & Management';
  const designation = meta.designation || employee.designation || 'Intern';
  const reasonCode = options.reasonCode || meta.reason_code || employee.termination_reason_code || 'COMPLETED';
  const reason = options.reason || meta.reason || employee.termination_reason || '';
  const effectiveDate = formatDate(options.effectiveDate || meta.effective_date || employee.terminated_at || new Date());
  const grantedCredentials = options.grantedCredentials || meta.granted_credentials || employee.granted_credentials || [];

  const isCompleted = reasonCode === 'COMPLETED';
  const subjectTitle = isCompleted
    ? 'FORMAL NOTICE: INTERNSHIP TENURE COMPLETION & OFFBOARDING RECORD'
    : 'FORMAL NOTICE: CONCLUSION OF INTERNSHIP ENGAGEMENT';

  const doc = await PDFDocument.create();

  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page, boldFont, regularFont, referenceId, issueDateStr);
  drawPageFooter(page, italicFont, 1, 1);

  let y = PAGE_HEIGHT - MARGINS.top - 20;

  page.drawText('OFFICIAL LEGAL OFFBOARDING RECORD', {
    x: MARGINS.left,
    y,
    size: 8.5,
    font: boldFont,
    color: isCompleted ? COLORS.accent : COLORS.primary,
  });
  y -= 18;

  page.drawText('To,', { x: MARGINS.left, y, size: 9, font: boldFont, color: COLORS.primary });
  y -= 14;
  page.drawText(`${salutation} ${fullName}`, { x: MARGINS.left, y, size: 10, font: boldFont, color: COLORS.primary });
  y -= 13;
  page.drawText(`Designation: ${designation} (${department})`, { x: MARGINS.left, y, size: 8.5, font: regularFont, color: COLORS.secondary });
  y -= 13;
  page.drawText(`Email: ${meta.personal_email || employee.personal_email || 'On Record'}`, { x: MARGINS.left, y, size: 8.5, font: regularFont, color: COLORS.secondary });
  y -= 16;

  page.drawText(subjectTitle, {
    x: MARGINS.left,
    y,
    size: 9.5,
    font: boldFont,
    color: COLORS.primary,
  });
  y -= 6;
  page.drawLine({
    start: { x: MARGINS.left, y },
    end: { x: PAGE_WIDTH - MARGINS.right, y },
    thickness: 0.75,
    color: COLORS.border,
  });
  y -= 16;

  y = drawParagraph(
    page,
    `Dear ${fullName},`,
    y,
    regularFont,
    9,
    13
  );
  y -= 6;

  const leadParagraph = isCompleted
    ? `This document serves as formal confirmation that you have successfully concluded your educational internship engagement at SkillBun (operated by Reish, an MSME Registered Entity under the Government of India) as of ${effectiveDate}. We extend our sincere appreciation for your technical contributions, dedication to organizational sprints, and professional milestones achieved during your tenure.`
    : `This document serves as formal notice that your educational internship engagement with SkillBun (operated by Reish) has been formally concluded effective as of ${effectiveDate}. Please be advised that your access to internal company resources, code repositories, and communication channels has been decommissioned in accordance with standard offboarding procedures.`;

  y = drawParagraph(
    page,
    leadParagraph,
    y,
    regularFont,
    8.5,
    12.5
  );
  y -= 12;

  y = drawSectionHeading(page, '1. OFFBOARDING & TENURE PARAMETERS', y, boldFont, 10);
  y -= 8;

  const tableX = MARGINS.left;
  const col1Width = 160;
  const rowHeight = 16;

  const credsSummary = Array.isArray(grantedCredentials) && grantedCredentials.length > 0
    ? grantedCredentials.join(', ')
    : 'No credentials issued';

  const rows = [
    ['Candidate Name', `${salutation} ${fullName}`],
    ['Designation & Department', `${designation} (${department})`],
    ['Effective Conclusion Date', effectiveDate],
    ['Offboarding Classification', isCompleted ? 'Successful Tenure Completion' : `Concluded (${reasonCode})`],
    ['Credentials Issued', credsSummary],
  ];

  if (reason) {
    rows.push(['Offboarding Remarks', reason]);
  }

  for (let i = 0; i < rows.length; i++) {
    const [label, val] = rows[i];
    const rowY = y - (i * rowHeight);

    page.drawRectangle({
      x: tableX,
      y: rowY - 12,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: i % 2 === 0 ? COLORS.bgLight : COLORS.white,
    });

    page.drawText(label, { x: tableX + 6, y: rowY - 8, size: 8, font: boldFont, color: COLORS.secondary });
    const textVal = String(val).length > 55 ? `${String(val).slice(0, 52)}...` : String(val);
    page.drawText(textVal, { x: tableX + col1Width + 6, y: rowY - 8, size: 8, font: regularFont, color: COLORS.primary });
  }

  y -= (rows.length * rowHeight + 12);

  y = drawSectionHeading(page, '2. SURVIVING COVENANTS: CONFIDENTIALITY & INTELLECTUAL PROPERTY', y, boldFont, 10);
  y -= 6;
  y = drawParagraph(
    page,
    'You are explicitly reminded of your ongoing, perpetual obligations under Sections 4 and 5 of your original Internship Agreement. All platform source code, architectures, candidate data, and proprietary know-how remain the exclusive intellectual property of SkillBun (Reish). You are strictly prohibited from publishing, disclosing, duplicating, or using any confidential material or internal assets. Breach of these ongoing covenants shall be subject to full legal remedies under applicable Indian law.',
    y,
    regularFont,
    8.5,
    12
  );
  y -= 16;

  y = drawSectionHeading(page, '3. AUTHORIZATION & INSTITUTIONAL ATTESTATION', y, boldFont, 10);
  y -= 8;

  const boxWidth = CONTENT_WIDTH;
  const boxHeight = 110;

  page.drawRectangle({
    x: MARGINS.left,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    borderColor: COLORS.border,
    borderWidth: 1,
    color: COLORS.bgLight,
  });

  page.drawText('FOR AND ON BEHALF OF SKILLBUN', {
    x: MARGINS.left + 12,
    y: y - 18,
    size: 8.5,
    font: boldFont,
    color: COLORS.primary,
  });
  page.drawText('(Operated by Reish — MSME Govt. of India)', {
    x: MARGINS.left + 12,
    y: y - 30,
    size: 7.5,
    font: regularFont,
    color: COLORS.secondary,
  });

  page.drawText('Harsh Patel', {
    x: MARGINS.left + 12,
    y: y - 62,
    size: 11,
    font: boldFont,
    color: COLORS.primary,
  });
  page.drawText('Founder & Managing Director', {
    x: MARGINS.left + 12,
    y: y - 74,
    size: 8.5,
    font: regularFont,
    color: COLORS.secondary,
  });
  page.drawText('Lead Architecture, SkillBun', {
    x: MARGINS.left + 12,
    y: y - 86,
    size: 8.5,
    font: regularFont,
    color: COLORS.secondary,
  });

  page.drawText(`Date of Issue: ${issueDateStr}`, {
    x: MARGINS.left + boxWidth - 180,
    y: y - 62,
    size: 8,
    font: regularFont,
    color: COLORS.secondary,
  });
  page.drawText(`Doc Reference: ${referenceId}`, {
    x: MARGINS.left + boxWidth - 180,
    y: y - 76,
    size: 8,
    font: boldFont,
    color: COLORS.accent,
  });

  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);
  const sanitizedName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeFilenameRef = referenceId.replace(/[\/\\]/g, '_');
  const filename = `SkillBun_Conclusion_Notice_${sanitizedName}_${safeFilenameRef}.pdf`;

  const metadataSnapshot = {
    template_version: templateVersion,
    reference_id: referenceId,
    salutation: salutation || 'Mr./Ms.',
    full_name: fullName || 'Candidate Name',
    personal_email: meta.personal_email || employee.personal_email || '',
    department: department || 'Engineering',
    designation: designation || 'Intern',
    effective_date: effectiveDate,
    reason_code: reasonCode,
    reason: reason || '',
    granted_credentials: grantedCredentials,
    signatory_name: 'Harsh Patel',
    signatory_title: 'Lead, SkillBun',
    issued_at: meta.issued_at || (employee.issued_at ? (employee.issued_at.toDate ? employee.issued_at.toDate().toISOString() : String(employee.issued_at)) : new Date().toISOString()),
  };

  return {
    buffer,
    filename,
    referenceId,
    metadataSnapshot,
  };
}
