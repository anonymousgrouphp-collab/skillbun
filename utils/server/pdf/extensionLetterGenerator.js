import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateWorkforceId, formatWorkforceDisplayId, WORKFORCE_PREFIXES } from '../workforceId.js';
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
} from './pdfLayoutHelper.js';

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
 * Generates a formal 1-page Extension of Internship Tenure PDF letter.
 * @param {Object} employee - Employee record data from Firestore
 * @param {Object} [options]
 * @param {string|Date} [options.newContractEndDate] - The new/extended end date
 * @param {string} [options.originalReferenceId] - The original offer reference ID (e.g. SKB/2026/HR-OFF/8K29DF)
 * @param {string} [options.referenceId] - Optional pre-allocated reference ID (e.g. SKB/2026/HR-EXT/3N72LA)
 * @returns {Promise<{ buffer: Buffer, filename: string, referenceId: string, metadataSnapshot: Object }>}
 */
export async function generateExtensionLetterPdf(employee, options = {}) {
  if (!employee || typeof employee !== 'object') {
    throw new TypeError('generateExtensionLetterPdf requires a valid employee record object.');
  }

  const rawRefId = options.referenceId || employee.reference_id || generateWorkforceId(WORKFORCE_PREFIXES.EXTENSION);
  const referenceId = formatWorkforceDisplayId(rawRefId);
  const originalRefId = formatWorkforceDisplayId(options.originalReferenceId || employee.offer_reference_id || employee.original_offer_id || 'SKB/2026/HR-OFF/ORIGINAL');
  const issueDateStr = formatDate(new Date());

  const salutation = employee.salutation || 'Mr./Ms.';
  const fullName = employee.full_name || 'Candidate Name';
  const parentName = employee.parent_name || 'Parent / Guardian';
  const currentAddress = employee.current_address || 'Address on record';
  const department = employee.department || 'Tech Team (Development & Engineering)';
  const designation = employee.designation || 'Engineering Intern';
  const joiningDate = formatDate(employee.joining_date);
  const newContractEndDate = formatDate(options.newContractEndDate || employee.contract_end_date);

  const doc = await PDFDocument.create();

  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);

  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page, boldFont, regularFont, referenceId, issueDateStr);
  drawPageFooter(page, italicFont, 1, 1);

  let y = PAGE_HEIGHT - MARGINS.top - 20;

  // Banner
  page.drawRectangle({
    x: MARGINS.left,
    y: y - 26,
    width: CONTENT_WIDTH,
    height: 32,
    color: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawText('EXTENSION OF INTERNSHIP TENURE', {
    x: MARGINS.left + 12,
    y: y - 14,
    size: 11.5,
    font: boldFont,
    color: COLORS.accent,
  });

  page.drawText(`Ref: ${referenceId}`, {
    x: PAGE_WIDTH - MARGINS.right - boldFont.widthOfTextAtSize(`Ref: ${referenceId}`, 9) - 12,
    y: y - 13,
    size: 9,
    font: boldFont,
    color: COLORS.primary,
  });

  y -= 46;

  // Candidate Details Card
  page.drawRectangle({
    x: MARGINS.left,
    y: y - 66,
    width: CONTENT_WIDTH,
    height: 72,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.75,
  });

  page.drawText('TO:', { x: MARGINS.left + 10, y: y - 14, size: 9, font: boldFont, color: COLORS.accent });
  page.drawText(`${salutation} ${fullName}`, { x: MARGINS.left + 35, y: y - 14, size: 9.5, font: boldFont, color: COLORS.primary });
  page.drawText(`(S/o / D/o: ${parentName})`, { x: MARGINS.left + 35 + boldFont.widthOfTextAtSize(`${salutation} ${fullName} `, 9.5), y: y - 14, size: 8.5, font: regularFont, color: COLORS.secondary });

  page.drawText('Designation & Stream:', { x: MARGINS.left + 10, y: y - 30, size: 8.5, font: boldFont, color: COLORS.secondary });
  page.drawText(`${designation}  —  ${department}`, { x: MARGINS.left + 115, y: y - 30, size: 8.5, font: boldFont, color: COLORS.accent });

  page.drawText('Original Offer Reference:', { x: MARGINS.left + 10, y: y - 46, size: 8.5, font: boldFont, color: COLORS.secondary });
  page.drawText(originalRefId, { x: MARGINS.left + 125, y: y - 46, size: 8.5, font: regularFont, color: COLORS.primary });

  y -= 82;

  // Section 1: Performance Appreciation
  y = drawSectionHeading(page, '1. PERFORMANCE APPRECIATION & TENURE EXTENSION', y, boldFont, 10);
  y = drawParagraph(
    page,
    `On behalf of SkillBun, we commend your outstanding technical contributions, dedication, and proactive engineering ownership demonstrated throughout your ongoing tenure as ${designation} within the ${department}. Your consistent execution across sprint milestones has been highly valued.`,
    y,
    regularFont,
    9,
    13.5
  );

  y -= 8;

  // Section 2: Revised Terms
  y = drawSectionHeading(page, '2. REVISED INTERNSHIP PERIOD', y, boldFont, 10);
  y = drawParagraph(
    page,
    `In recognition of your performance and ongoing project roadmaps, we are pleased to formally extend your internship engagement. The revised tenure of your internship is now effective from ${joiningDate} through ${newContractEndDate} (the "Extended Period").`,
    y,
    regularFont,
    9,
    13.5
  );

  y -= 8;

  // Section 3: Reaffirmation
  y = drawSectionHeading(page, '3. REAFFIRMATION OF TERMS & CONDITIONS', y, boldFont, 10);
  y = drawParagraph(
    page,
    'All other terms, conditions, non-disclosure obligations (NDA), intellectual property ownership rules, code of conduct requirements, and credential issuance entitlements set forth in your original Internship Offer Letter & Terms of Engagement shall remain in full force and effect without alteration.',
    y,
    regularFont,
    9,
    13.5
  );

  y -= 25;

  // Signatures
  const boxWidth = (CONTENT_WIDTH - 20) / 2;
  const boxHeight = 165;

  // Box 1: For SkillBun
  page.drawRectangle({
    x: MARGINS.left,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: MARGINS.left,
    y: y - 24,
    width: boxWidth,
    height: 24,
    color: COLORS.bgLight,
  });
  page.drawText('FOR SKILLBUN', {
    x: MARGINS.left + 10,
    y: y - 16,
    size: 9,
    font: boldFont,
    color: COLORS.accent,
  });

  page.drawText('Authorized Signatory:', { x: MARGINS.left + 10, y: y - 42, size: 8.5, font: boldFont, color: COLORS.secondary });
  page.drawText('Harsh Patel', { x: MARGINS.left + 10, y: y - 56, size: 10, font: boldFont, color: COLORS.primary });
  page.drawText('Lead, SkillBun', { x: MARGINS.left + 10, y: y - 68, size: 8.5, font: regularFont, color: COLORS.secondary });

  page.drawRectangle({
    x: MARGINS.left + 10,
    y: y - 122,
    width: boxWidth - 20,
    height: 44,
    color: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  });
  page.drawText('OFFICIAL SEAL & VERIFIED DIGITAL SIGNATURE', {
    x: MARGINS.left + 16,
    y: y - 96,
    size: 7.5,
    font: boldFont,
    color: COLORS.accentGreen,
  });
  page.drawText('SkillBun Verified Issuance Authority', {
    x: MARGINS.left + 16,
    y: y - 110,
    size: 7.5,
    font: italicFont,
    color: COLORS.muted,
  });

  page.drawText(`Date of Issuance: ${issueDateStr}`, { x: MARGINS.left + 10, y: y - 140, size: 8, font: regularFont, color: COLORS.secondary });
  page.drawText(`Extension Ref: ${referenceId}`, { x: MARGINS.left + 10, y: y - 152, size: 8, font: boldFont, color: COLORS.accent });

  // Box 2: For Candidate
  page.drawRectangle({
    x: MARGINS.left + boxWidth + 20,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: MARGINS.left + boxWidth + 20,
    y: y - 24,
    width: boxWidth,
    height: 24,
    color: COLORS.bgLight,
  });
  page.drawText('FOR THE INTERN (ACCEPTANCE)', {
    x: MARGINS.left + boxWidth + 30,
    y: y - 16,
    size: 9,
    font: boldFont,
    color: COLORS.accent,
  });

  page.drawText('Candidate Name:', { x: MARGINS.left + boxWidth + 30, y: y - 42, size: 8.5, font: boldFont, color: COLORS.secondary });
  page.drawText(`${salutation} ${fullName}`, { x: MARGINS.left + boxWidth + 30, y: y - 56, size: 10, font: boldFont, color: COLORS.primary });
  page.drawText(`Title: ${designation}`, { x: MARGINS.left + boxWidth + 30, y: y - 68, size: 8.5, font: regularFont, color: COLORS.secondary });

  page.drawText('Signature of Acceptance:', { x: MARGINS.left + boxWidth + 30, y: y - 96, size: 8.5, font: boldFont, color: COLORS.secondary });
  page.drawLine({
    start: { x: MARGINS.left + boxWidth + 30, y: y - 116 },
    end: { x: MARGINS.left + 2 * boxWidth + 10, y: y - 116 },
    thickness: 0.75,
    color: COLORS.primary,
  });

  page.drawText('Date of Acceptance:', { x: MARGINS.left + boxWidth + 30, y: y - 136, size: 8.5, font: boldFont, color: COLORS.secondary });
  page.drawLine({
    start: { x: MARGINS.left + boxWidth + 120, y: y - 138 },
    end: { x: MARGINS.left + 2 * boxWidth + 10, y: y - 138 },
    thickness: 0.75,
    color: COLORS.border,
  });

  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);
  const sanitizedName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeFilenameRef = referenceId.replace(/[\/\\]/g, '_');
  const filename = `SkillBun_Extension_Letter_${sanitizedName}_${safeFilenameRef}.pdf`;

  const metadataSnapshot = {
    reference_id: referenceId,
    original_reference_id: originalRefId || 'SKB/2026/HR-OFF/ORIGINAL',
    salutation: salutation || 'Mr./Ms.',
    full_name: fullName || 'Candidate Name',
    parent_name: parentName || 'Parent / Guardian',
    current_address: currentAddress || 'Address on record',
    personal_email: employee.personal_email || '',
    department: department || 'Engineering',
    designation: designation || 'Intern',
    joining_date: employee.joining_date ? (employee.joining_date.toDate ? employee.joining_date.toDate().toISOString() : String(employee.joining_date)) : '',
    extended_contract_end_date: options.newContractEndDate ? String(options.newContractEndDate) : (employee.contract_end_date ? (employee.contract_end_date.toDate ? employee.contract_end_date.toDate().toISOString() : String(employee.contract_end_date)) : ''),
    signatory_name: 'Harsh Patel',
    signatory_title: 'Lead, SkillBun',
    issued_at: new Date().toISOString(),
  };

  return {
    buffer,
    filename,
    referenceId,
    metadataSnapshot,
  };
}
