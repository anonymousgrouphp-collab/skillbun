import { PDFDocument, StandardFonts } from 'pdf-lib';
import { generateWorkforceId } from '../workforceId.js';
import {
  COLORS,
  CONTENT_WIDTH,
  drawBulletPoint,
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
 * Generates a pixel-perfect 4-page formal Offer Letter & Terms of Engagement PDF.
 * @param {Object} employee - Employee record data from Firestore
 * @param {Object} [options]
 * @param {string} [options.referenceId] - Optional pre-allocated reference ID (e.g. SB-OFF-2026-8K29DF)
 * @returns {Promise<{ buffer: Buffer, filename: string, referenceId: string, metadataSnapshot: Object }>}
 */
export async function generateOfferLetterPdf(employee, options = {}) {
  if (!employee || typeof employee !== 'object') {
    throw new TypeError('generateOfferLetterPdf requires a valid employee record object.');
  }

  const referenceId = options.referenceId || employee.offer_reference_id || employee.reference_id || generateWorkforceId('SB-OFF');
  const issueDateStr = formatDate(new Date());

  const salutation = employee.salutation || 'Mr./Ms.';
  const fullName = employee.full_name || 'Candidate Name';
  const parentName = employee.parent_name || 'Parent / Guardian';
  const currentAddress = employee.current_address || 'Address on record';
  const permanentAddress = employee.permanent_address || currentAddress;
  const courseDegree = employee.course_degree || 'Undergraduate Degree';
  const collegeName = employee.college_name || 'University / Institution';
  const department = employee.department || 'Tech Team (Development & Engineering)';
  const designation = employee.designation || 'Engineering Intern';
  const joiningDate = formatDate(employee.joining_date);
  const contractEndDate = formatDate(employee.contract_end_date);
  const stipendAmount = typeof employee.stipend_amount === 'number' ? employee.stipend_amount : 0;
  const stipendCurrency = employee.stipend_currency || 'INR';

  const doc = await PDFDocument.create();

  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);

  const TOTAL_PAGES = 4;

  // ==========================================
  // PAGE 1: RECIPIENT, BACKGROUND, PURPOSE
  // ==========================================
  const page1 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page1, boldFont, regularFont, referenceId, issueDateStr);
  drawPageFooter(page1, italicFont, 1, TOTAL_PAGES);

  let y = PAGE_HEIGHT - MARGINS.top - 20;

  // Document Big Banner
  page1.drawRectangle({
    x: MARGINS.left,
    y: y - 26,
    width: CONTENT_WIDTH,
    height: 32,
    color: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  page1.drawText('INTERNSHIP OFFER LETTER & TERMS OF ENGAGEMENT', {
    x: MARGINS.left + 12,
    y: y - 14,
    size: 11.5,
    font: boldFont,
    color: COLORS.accent,
  });

  page1.drawText(`Ref: ${referenceId}`, {
    x: PAGE_WIDTH - MARGINS.right - boldFont.widthOfTextAtSize(`Ref: ${referenceId}`, 9) - 12,
    y: y - 13,
    size: 9,
    font: boldFont,
    color: COLORS.primary,
  });

  y -= 46;

  // Candidate Details Card
  page1.drawRectangle({
    x: MARGINS.left,
    y: y - 88,
    width: CONTENT_WIDTH,
    height: 94,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.75,
  });

  page1.drawText('TO:', { x: MARGINS.left + 10, y: y - 14, size: 9, font: boldFont, color: COLORS.accent });
  page1.drawText(`${salutation} ${fullName}`, { x: MARGINS.left + 35, y: y - 14, size: 9.5, font: boldFont, color: COLORS.primary });
  page1.drawText(`(S/o / D/o: ${parentName})`, { x: MARGINS.left + 35 + boldFont.widthOfTextAtSize(`${salutation} ${fullName} `, 9.5), y: y - 14, size: 8.5, font: regularFont, color: COLORS.secondary });

  page1.drawText('Current Address:', { x: MARGINS.left + 10, y: y - 30, size: 8.5, font: boldFont, color: COLORS.secondary });
  const currAddrLines = wrapText(currentAddress, CONTENT_WIDTH - 110, regularFont, 8.5);
  page1.drawText(currAddrLines[0] || 'N/A', { x: MARGINS.left + 95, y: y - 30, size: 8.5, font: regularFont, color: COLORS.primary });

  page1.drawText('Permanent Address:', { x: MARGINS.left + 10, y: y - 44, size: 8.5, font: boldFont, color: COLORS.secondary });
  const permAddrLines = wrapText(permanentAddress, CONTENT_WIDTH - 120, regularFont, 8.5);
  page1.drawText(permAddrLines[0] || 'N/A', { x: MARGINS.left + 105, y: y - 44, size: 8.5, font: regularFont, color: COLORS.primary });

  page1.drawText('Academic Qualification:', { x: MARGINS.left + 10, y: y - 58, size: 8.5, font: boldFont, color: COLORS.secondary });
  page1.drawText(`${courseDegree}  *  ${collegeName}`, { x: MARGINS.left + 120, y: y - 58, size: 8.5, font: regularFont, color: COLORS.primary });

  page1.drawText('Designation & Stream:', { x: MARGINS.left + 10, y: y - 72, size: 8.5, font: boldFont, color: COLORS.secondary });
  page1.drawText(`${designation}  —  ${department}`, { x: MARGINS.left + 115, y: y - 72, size: 8.5, font: boldFont, color: COLORS.accent });

  y -= 104;

  // Section 1: Background
  y = drawSectionHeading(page1, '1. BACKGROUND & ORGANIZATIONAL OVERVIEW', y, boldFont, 10);
  y = drawParagraph(
    page1,
    'SkillBun operates with a dedicated mission to empower students and early-career software developers with structured roadmap navigation, practical technical skill mastery, and direct production engineering exposure. Through our collaborative internship programs, we bring emerging talent into high-impact environments to build, deploy, and scale world-class developer tools and career discovery platforms.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 2: Selection
  y = drawSectionHeading(page1, '2. SELECTION AS INTERN', y, boldFont, 10);
  y = drawParagraph(
    page1,
    `Following our structured 4-round technical screening process (comprising Resume & Portfolio Screening, Preliminary Introductory Evaluation, Technical Domain Q&A, and Leadership Review), SkillBun is pleased to extend this formal offer for the position of ${designation} within the ${department}.`,
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 3: Status & Purpose
  y = drawSectionHeading(page1, '3. INTERNSHIP STATUS AND PURPOSE', y, boldFont, 10);
  y = drawParagraph(
    page1,
    '3.1 Educational & Practical Learning Experience: This engagement is designed as an intensive experiential learning program aimed at bridging academic coursework with production-grade engineering, agile sprint workflows, and real-world system architecture.',
    y,
    regularFont,
    9,
    13
  );
  y -= 4;
  y = drawParagraph(
    page1,
    '3.2 Internship Not Employment: The candidate acknowledges and agrees that this engagement is strictly an internship and does not constitute an employer-employee relationship, civil service post, or entitlement to permanent tenure at SkillBun.',
    y,
    regularFont,
    9,
    13
  );
  y -= 4;
  y = drawParagraph(
    page1,
    '3.3 Collaborative Environment: The intern will collaborate closely with engineering leads, product architects, and peer team members using industry-standard communication and version-control toolchains (Zoho Workspace, GitHub, Figma, and Next.js).',
    y,
    regularFont,
    9,
    13
  );

  // ==========================================
  // PAGE 2: PARTICIPATION, DUTIES, CONDUCT, NDA
  // ==========================================
  const page2 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page2, boldFont, regularFont, referenceId, issueDateStr);
  drawPageFooter(page2, italicFont, 2, TOTAL_PAGES);

  y = PAGE_HEIGHT - MARGINS.top - 20;

  // Section 4: Participation & Responsibilities
  y = drawSectionHeading(page2, '4. INTERNSHIP PARTICIPATION AND RESPONSIBILITIES', y, boldFont, 10);
  y = drawParagraph(
    page2,
    `4.1 Internship Period: The tenure of this internship shall commence on ${joiningDate} and conclude on ${contractEndDate} (the "Internship Period"), unless extended by mutual written agreement or terminated earlier pursuant to the provisions herein.`,
    y,
    regularFont,
    9,
    13
  );
  y -= 4;
  y = drawParagraph(
    page2,
    '4.2 Sprint Milestones: Specific sprint objectives, task deliverables, and deliverable targets will be assigned by the Lead and tracked via the centralized SkillBun Intern Workspace (/portal). Deliverables must be submitted on time with adequate documentation.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 5: Time Management
  y = drawSectionHeading(page2, '5. EFFICIENT TIME MANAGEMENT & ACADEMIC BALANCE', y, boldFont, 10);
  y = drawParagraph(
    page2,
    'SkillBun respects academic schedules and exam timetables. Interns are expected to manage their time conscientiously, communicate exam leaves or unavoidable schedule conflicts in advance to the Lead, and fulfill all agreed sprint deliverables with high consistency.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 6: Stream Duties
  y = drawSectionHeading(page2, `6. STREAM DUTIES AND EXPECTATIONS (${department.toUpperCase()})`, y, boldFont, 10);
  y = drawParagraph(page2, 'During the tenure of your internship, your core duties and responsibilities include:', y, regularFont, 9, 12);
  y -= 3;

  y = drawBulletPoint(page2, 'Designing, developing, testing, and shipping modular full-stack web applications and APIs utilizing Next.js, React, Node.js, and Firebase.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page2, 'Writing clean, performant, and type-safe code while maintaining backward compatibility and zero-regression standards across platforms.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page2, 'Participating in agile sprint planning, code review pull requests, architecture discussions, and daily engineering standups.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page2, 'Ensuring rigorous automated input validation, rate limiting, and token-based authentication across all backend endpoints.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page2, 'Documenting technical workflows, creating API schemas, and recording comprehensive verification walkthroughs for assigned deliverables.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page2, 'Upholding strict zero-trust credential hygiene, data confidentiality, and organizational security protocols at all times.', y, regularFont, 8.5, 12);

  y -= 8;

  // Section 7: Compliance & Professional Conduct
  y = drawSectionHeading(page2, '7. COMPLIANCE & PROFESSIONAL CONDUCT', y, boldFont, 10);
  y = drawParagraph(
    page2,
    'The intern agrees to observe all written and oral guidelines, security procedures, and professional communication standards established by SkillBun. High professionalism, respect for peer contributors, constructive feedback, and ethical conduct are strictly mandatory.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 8: IP & NDA
  y = drawSectionHeading(page2, '8. INTELLECTUAL PROPERTY & NON-DISCLOSURE AGREEMENT (NDA)', y, boldFont, 10);
  y = drawParagraph(
    page2,
    '8.1 Sole Company Ownership: All software code, designs, algorithms, architectures, documentation, workflows, and inventions created by the intern during this engagement shall remain the sole, exclusive, and unencumbered intellectual property of SkillBun.',
    y,
    regularFont,
    9,
    13
  );
  y -= 4;
  y = drawParagraph(
    page2,
    '8.2 Strict Confidentiality: The intern shall not disclose, duplicate, reverse engineer, or distribute any proprietary codebase, database schemas, internal communications, credentials, or user data to any external party without prior written consent from Harsh Patel (Lead, SkillBun).',
    y,
    regularFont,
    9,
    13
  );

  // ==========================================
  // PAGE 3: NDA CONTD, COMPENSATION, TERMINATION
  // ==========================================
  const page3 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page3, boldFont, regularFont, referenceId, issueDateStr);
  drawPageFooter(page3, italicFont, 3, TOTAL_PAGES);

  y = PAGE_HEIGHT - MARGINS.top - 20;

  y = drawSectionHeading(page3, '8. NDA & DATA PROTECTION (CONTD.)', y, boldFont, 10);
  y = drawParagraph(
    page3,
    '8.3 Breach Penalties: Any intentional unauthorized disclosure, repository scraping, credential leakage, or intellectual property infringement shall constitute a material breach, resulting in immediate termination, complete forfeiture of exit credentials, and appropriate legal action.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 9: Compensation & Perks
  y = drawSectionHeading(page3, '9. COMPENSATION, PERKS & PRE-PLACEMENT OFFER (PPO)', y, boldFont, 10);
  
  const stipendText = stipendAmount > 0
    ? `9.1 Monthly Compensation: This internship carries a monthly stipend of ${stipendCurrency} ${stipendAmount.toLocaleString('en-IN')}, disbursed on a monthly cycle upon verified completion of assigned sprint deliverables and milestone targets.`
    : '9.1 Merit-Based Training: This internship is a structured merit-based training and skill development engagement. While unpaid in monetary terms, it provides direct production codebase access, senior engineering mentorship, and comprehensive career credentials.';
  
  y = drawParagraph(page3, stipendText, y, regularFont, 9, 13);
  y -= 4;

  y = drawParagraph(
    page3,
    '9.2 Assured Exit Credentials: Upon successful completion of the tenure and verified handover of assigned milestones, the intern shall be awarded:',
    y,
    regularFont,
    9,
    13
  );
  y -= 2;
  y = drawBulletPoint(page3, 'Official Certificate of Internship with tamper-proof cryptographic verification and QR code registry at /certificate/[id].', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page3, 'Official Certificate of Training certifying mastery in full-stack engineering and software architecture.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page3, 'Official Letter of Recommendation (LOR) on corporate letterhead signed by the Founder & Lead.', y, regularFont, 8.5, 12);
  y = drawBulletPoint(page3, '1-Click verified LinkedIn profile credential synchronization and professional endorsement.', y, regularFont, 8.5, 12);
  y -= 4;

  y = drawParagraph(
    page3,
    '9.3 Pre-Placement Offer (PPO) Eligibility: Outstanding interns demonstrating exceptional technical competence, leadership, and product ownership during their tenure will be considered for formal Pre-Placement Offers (PPO) and extended engineering positions.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 10: Termination
  y = drawSectionHeading(page3, '10. INTERNSHIP TERMINATION & NOTICE PERIOD', y, boldFont, 10);
  y = drawParagraph(
    page3,
    '10.1 Notice Period: Either party may terminate this internship by providing a written notice of seven (7) business days. SkillBun reserves the right to terminate the engagement immediately in the event of gross misconduct, repeated unresponsiveness, or breach of confidentiality.',
    y,
    regularFont,
    9,
    13
  );
  y -= 4;
  y = drawParagraph(
    page3,
    '10.2 Effects of Termination: Upon termination, all assigned workspace credentials, repositories, and portal access shall be revoked. Incomplete tenures shall not be eligible for exit completion certificates.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 11: Liability & Governing Law
  y = drawSectionHeading(page3, '11. LIMITATION OF LIABILITY & GOVERNING LAW', y, boldFont, 10);
  y = drawParagraph(
    page3,
    '11.1 Limitation of Liability: In no event shall SkillBun or its leads be liable for any indirect, incidental, or consequential damages arising out of or related to this educational internship.',
    y,
    regularFont,
    9,
    13
  );
  y -= 4;
  y = drawParagraph(
    page3,
    '11.2 Governing Law: This agreement shall be governed by, construed, and enforced in accordance with the laws of the Republic of India. Any legal proceedings arising from this engagement shall be subject to the exclusive jurisdiction of the competent courts in India.',
    y,
    regularFont,
    9,
    13
  );

  y -= 8;

  // Section 12: Entire Agreement
  y = drawSectionHeading(page3, '12. ENTIRE AGREEMENT', y, boldFont, 10);
  y = drawParagraph(
    page3,
    'This document represents the entire understanding between SkillBun and the candidate, superseding all prior discussions, emails, or representations concerning the internship program.',
    y,
    regularFont,
    9,
    13
  );

  // ==========================================
  // PAGE 4: SIGNATURE & ACCEPTANCE BLOCK
  // ==========================================
  const page4 = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageHeader(page4, boldFont, regularFont, referenceId, issueDateStr);
  drawPageFooter(page4, italicFont, 4, TOTAL_PAGES);

  y = PAGE_HEIGHT - MARGINS.top - 20;

  y = drawSectionHeading(page4, '13. EXECUTION AND FORMAL ACCEPTANCE', y, boldFont, 10);
  y = drawParagraph(
    page4,
    'IN WITNESS WHEREOF, the parties hereto have reviewed, understood, and agreed to all terms and conditions set forth in this Internship Offer Letter & Terms of Engagement, and have executed this instrument as of the issuance date.',
    y,
    regularFont,
    9,
    13
  );

  y -= 25;

  const boxWidth = (CONTENT_WIDTH - 20) / 2;
  const boxHeight = 175;

  // Box 1: For SkillBun
  page4.drawRectangle({
    x: MARGINS.left,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  // Box 1 Header
  page4.drawRectangle({
    x: MARGINS.left,
    y: y - 24,
    width: boxWidth,
    height: 24,
    color: COLORS.bgLight,
  });
  page4.drawText('FOR SKILLBUN', {
    x: MARGINS.left + 10,
    y: y - 16,
    size: 9,
    font: boldFont,
    color: COLORS.accent,
  });

  page4.drawText('Authorized Signatory:', { x: MARGINS.left + 10, y: y - 42, size: 8.5, font: boldFont, color: COLORS.secondary });
  page4.drawText('Harsh Patel', { x: MARGINS.left + 10, y: y - 56, size: 10, font: boldFont, color: COLORS.primary });
  page4.drawText('Lead, SkillBun', { x: MARGINS.left + 10, y: y - 68, size: 8.5, font: regularFont, color: COLORS.secondary });

  // Seal / Signature Badge Placeholder
  page4.drawRectangle({
    x: MARGINS.left + 10,
    y: y - 128,
    width: boxWidth - 20,
    height: 48,
    color: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 0.5,
  });
  page4.drawText('OFFICIAL SEAL & VERIFIED DIGITAL SIGNATURE', {
    x: MARGINS.left + 16,
    y: y - 100,
    size: 7.5,
    font: boldFont,
    color: COLORS.accentGreen,
  });
  page4.drawText('SkillBun Verified Issuance Authority', {
    x: MARGINS.left + 16,
    y: y - 114,
    size: 7.5,
    font: italicFont,
    color: COLORS.muted,
  });

  page4.drawText(`Date of Issuance: ${issueDateStr}`, { x: MARGINS.left + 10, y: y - 146, size: 8, font: regularFont, color: COLORS.secondary });
  page4.drawText(`Reference Code: ${referenceId}`, { x: MARGINS.left + 10, y: y - 160, size: 8, font: boldFont, color: COLORS.accent });

  // Box 2: For Candidate
  page4.drawRectangle({
    x: MARGINS.left + boxWidth + 20,
    y: y - boxHeight,
    width: boxWidth,
    height: boxHeight,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  // Box 2 Header
  page4.drawRectangle({
    x: MARGINS.left + boxWidth + 20,
    y: y - 24,
    width: boxWidth,
    height: 24,
    color: COLORS.bgLight,
  });
  page4.drawText('FOR THE INTERN (ACCEPTANCE)', {
    x: MARGINS.left + boxWidth + 30,
    y: y - 16,
    size: 9,
    font: boldFont,
    color: COLORS.accent,
  });

  page4.drawText('Candidate Name:', { x: MARGINS.left + boxWidth + 30, y: y - 42, size: 8.5, font: boldFont, color: COLORS.secondary });
  page4.drawText(`${salutation} ${fullName}`, { x: MARGINS.left + boxWidth + 30, y: y - 56, size: 10, font: boldFont, color: COLORS.primary });
  page4.drawText(`Title: ${designation}`, { x: MARGINS.left + boxWidth + 30, y: y - 68, size: 8.5, font: regularFont, color: COLORS.secondary });

  page4.drawText('Signature of Acceptance:', { x: MARGINS.left + boxWidth + 30, y: y - 100, size: 8.5, font: boldFont, color: COLORS.secondary });
  page4.drawLine({
    start: { x: MARGINS.left + boxWidth + 30, y: y - 122 },
    end: { x: MARGINS.left + 2 * boxWidth + 10, y: y - 122 },
    thickness: 0.75,
    color: COLORS.primary,
  });

  page4.drawText('Date of Acceptance:', { x: MARGINS.left + boxWidth + 30, y: y - 142, size: 8.5, font: boldFont, color: COLORS.secondary });
  page4.drawLine({
    start: { x: MARGINS.left + boxWidth + 120, y: y - 144 },
    end: { x: MARGINS.left + 2 * boxWidth + 10, y: y - 144 },
    thickness: 0.75,
    color: COLORS.border,
  });

  y -= (boxHeight + 25);

  // Instructions Banner
  page4.drawRectangle({
    x: MARGINS.left,
    y: y - 50,
    width: CONTENT_WIDTH,
    height: 50,
    color: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 0.75,
  });

  page4.drawText('IMPORTANT ONBOARDING INSTRUCTIONS:', {
    x: MARGINS.left + 12,
    y: y - 16,
    size: 8.5,
    font: boldFont,
    color: COLORS.accent,
  });

  page4.drawText(
    'Please review these terms, sign in the Acceptance Block above, and reply back to harsh@skillbun.tech',
    { x: MARGINS.left + 12, y: y - 30, size: 8, font: regularFont, color: COLORS.primary }
  );
  page4.drawText(
    'with your attached signed copy within three (3) business days to confirm your onboarding schedule.',
    { x: MARGINS.left + 12, y: y - 42, size: 8, font: regularFont, color: COLORS.primary }
  );

  const pdfBytes = await doc.save();
  const buffer = Buffer.from(pdfBytes);
  const sanitizedName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `SkillBun_Offer_Letter_${sanitizedName}_${referenceId}.pdf`;

  const metadataSnapshot = {
    reference_id: referenceId,
    salutation,
    full_name: fullName,
    parent_name: parentName,
    current_address: currentAddress,
    permanent_address: permanentAddress,
    course_degree: courseDegree,
    college_name: collegeName,
    personal_email: employee.personal_email || '',
    department,
    designation,
    joining_date: employee.joining_date,
    contract_end_date: employee.contract_end_date,
    stipend_amount: stipendAmount,
    stipend_currency: stipendCurrency,
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
