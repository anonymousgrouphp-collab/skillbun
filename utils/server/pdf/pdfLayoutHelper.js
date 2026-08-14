import { rgb, StandardFonts } from 'pdf-lib';

export const PAGE_WIDTH = 595.28; // A4 standard width (pt)
export const PAGE_HEIGHT = 841.89; // A4 standard height (pt)

export const MARGINS = Object.freeze({
  top: 50,
  bottom: 50,
  left: 50,
  right: 50,
});

export const CONTENT_WIDTH = PAGE_WIDTH - MARGINS.left - MARGINS.right; // 495.28 pt

export const COLORS = Object.freeze({
  primary: rgb(0.12, 0.14, 0.18),
  secondary: rgb(0.35, 0.40, 0.46),
  muted: rgb(0.55, 0.60, 0.65),
  accent: rgb(0.08, 0.44, 0.78),      // SkillBun / Cosmic Blue
  accentGreen: rgb(0.06, 0.62, 0.40), // SkillBun Brand Green
  border: rgb(0.82, 0.86, 0.90),
  bgLight: rgb(0.96, 0.97, 0.98),
  white: rgb(1, 1, 1),
});

/**
 * Wraps text into lines that fit within maxWidth.
 * @param {string} text
 * @param {number} maxWidth
 * @param {import('pdf-lib').PDFFont} font
 * @param {number} fontSize
 * @returns {string[]} Array of wrapped line strings
 */
export function wrapText(text, maxWidth, font, fontSize) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Draws standard SkillBun / Team Cosmic header on a page.
 * @param {import('pdf-lib').PDFPage} page
 * @param {import('pdf-lib').PDFFont} boldFont
 * @param {import('pdf-lib').PDFFont} regularFont
 * @param {string} [referenceId]
 * @param {string} [docDate]
 */
export function drawPageHeader(page, boldFont, regularFont, referenceId, docDate) {
  const topY = PAGE_HEIGHT - MARGINS.top + 20;

  // Header Title
  page.drawText('SKILLBUN', {
    x: MARGINS.left,
    y: topY,
    size: 14,
    font: boldFont,
    color: COLORS.accent,
  });

  // Parent Org Subtitle
  page.drawText('(A project operating under its parent organization, Team Cosmic)', {
    x: MARGINS.left + 85,
    y: topY + 1,
    size: 8.5,
    font: regularFont,
    color: COLORS.secondary,
  });

  // Right-aligned Ref / Date if provided
  if (referenceId || docDate) {
    const metaText = [referenceId, docDate].filter(Boolean).join('  |  ');
    const metaWidth = regularFont.widthOfTextAtSize(metaText, 8);
    page.drawText(metaText, {
      x: PAGE_WIDTH - MARGINS.right - metaWidth,
      y: topY + 1,
      size: 8,
      font: regularFont,
      color: COLORS.muted,
    });
  }

  // Header dividing rule
  page.drawLine({
    start: { x: MARGINS.left, y: topY - 8 },
    end: { x: PAGE_WIDTH - MARGINS.right, y: topY - 8 },
    thickness: 0.75,
    color: COLORS.border,
  });
}

/**
 * Draws standard SkillBun footer on a page with page number.
 * @param {import('pdf-lib').PDFPage} page
 * @param {import('pdf-lib').PDFFont} italicFont
 * @param {number} pageNumber
 * @param {number} totalPages
 */
export function drawPageFooter(page, italicFont, pageNumber, totalPages) {
  const footerY = MARGINS.bottom - 20;

  // Footer dividing rule
  page.drawLine({
    start: { x: MARGINS.left, y: footerY + 14 },
    end: { x: PAGE_WIDTH - MARGINS.right, y: footerY + 14 },
    thickness: 0.5,
    color: COLORS.border,
  });

  page.drawText('SkillBun Internship Program  *  Confidential', {
    x: MARGINS.left,
    y: footerY,
    size: 8,
    font: italicFont,
    color: COLORS.muted,
  });

  const pageStr = `Page ${pageNumber} of ${totalPages}`;
  const pageStrWidth = italicFont.widthOfTextAtSize(pageStr, 8);
  page.drawText(pageStr, {
    x: PAGE_WIDTH - MARGINS.right - pageStrWidth,
    y: footerY,
    size: 8,
    font: italicFont,
    color: COLORS.muted,
  });
}

/**
 * Draws a section heading with an accent vertical bar.
 * @param {import('pdf-lib').PDFPage} page
 * @param {string} title
 * @param {number} y
 * @param {import('pdf-lib').PDFFont} boldFont
 * @param {number} [fontSize=10.5]
 * @returns {number} Next Y position
 */
export function drawSectionHeading(page, title, y, boldFont, fontSize = 10.5) {
  // Vertical accent bar
  page.drawRectangle({
    x: MARGINS.left,
    y: y - 2,
    width: 3.5,
    height: fontSize + 3,
    color: COLORS.accent,
  });

  // Heading text
  page.drawText(title, {
    x: MARGINS.left + 9,
    y: y,
    size: fontSize,
    font: boldFont,
    color: COLORS.primary,
  });

  return y - (fontSize + 8);
}

/**
 * Draws paragraph text and returns updated Y position.
 * @param {import('pdf-lib').PDFPage} page
 * @param {string} text
 * @param {number} y
 * @param {import('pdf-lib').PDFFont} font
 * @param {number} fontSize
 * @param {number} lineHeight
 * @param {number} [maxWidth=CONTENT_WIDTH]
 * @param {number} [indent=0]
 * @param {import('pdf-lib').RGB} [color=COLORS.primary]
 * @returns {number} Next Y position
 */
export function drawParagraph(
  page,
  text,
  y,
  font,
  fontSize = 9.5,
  lineHeight = 13.5,
  maxWidth = CONTENT_WIDTH,
  indent = 0,
  color = COLORS.primary
) {
  const lines = wrapText(text, maxWidth - indent, font, fontSize);
  for (const line of lines) {
    page.drawText(line, {
      x: MARGINS.left + indent,
      y,
      size: fontSize,
      font,
      color,
    });
    y -= lineHeight;
  }
  return y;
}

/**
 * Draws a bullet point with clean hanging indent.
 * @param {import('pdf-lib').PDFPage} page
 * @param {string} text
 * @param {number} y
 * @param {import('pdf-lib').PDFFont} font
 * @param {number} fontSize
 * @param {number} lineHeight
 * @param {string} [bullet="*"]
 * @returns {number} Next Y position
 */
export function drawBulletPoint(
  page,
  text,
  y,
  font,
  fontSize = 9,
  lineHeight = 13,
  bullet = '-'
) {
  const bulletIndent = 12;
  page.drawText(bullet, {
    x: MARGINS.left + 4,
    y,
    size: fontSize,
    font,
    color: COLORS.accent,
  });

  const lines = wrapText(text, CONTENT_WIDTH - bulletIndent - 4, font, fontSize);
  for (let i = 0; i < lines.length; i++) {
    page.drawText(lines[i], {
      x: MARGINS.left + bulletIndent + 4,
      y,
      size: fontSize,
      font,
      color: COLORS.primary,
    });
    y -= lineHeight;
  }
  return y - 2;
}
