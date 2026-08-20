/**
 * Unified Server-Side Document PDF Service (Pillar 1)
 *
 * Centralizes programmatic PDF document generation for:
 * 1. 4-Page Formal Offer Letter & Terms of Engagement ('OFFER_LETTER' / 'OFFER')
 * 2. 1-Page Extension of Internship Tenure Letter ('EXTENSION' / 'EXTENSION_LETTER')
 * 3. Relieving & Workforce Merit Certificates
 */

import { generateOfferLetterPdf } from './offerLetterGenerator.js';
import { generateExtensionLetterPdf } from './extensionLetterGenerator.js';
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGINS,
  CONTENT_WIDTH,
  COLORS,
} from './pdfLayoutHelper.js';

export const SUPPORTED_DOC_TYPES = Object.freeze({
  OFFER_LETTER: 'OFFER_LETTER',
  EXTENSION_LETTER: 'EXTENSION_LETTER',
  EXTENSION: 'EXTENSION',
  OFFER: 'OFFER',
});

/**
 * Generates a standard programmatic PDF buffer according to document type.
 *
 * @param {string} docType - Document type (e.g. 'OFFER_LETTER', 'EXTENSION_LETTER')
 * @param {Object} data - Employee / recipient record data
 * @param {Object} [options={}] - Additional generator options
 * @returns {Promise<{ buffer: Buffer, filename: string, referenceId: string, metadataSnapshot: Object }>}
 */
export async function generateDocumentPdf(docType, data, options = {}) {
  if (!docType || typeof docType !== 'string') {
    throw new TypeError('generateDocumentPdf requires a valid docType string.');
  }
  if (!data || typeof data !== 'object') {
    throw new TypeError('generateDocumentPdf requires a valid data record object.');
  }

  const normalizedType = docType.trim().toUpperCase();

  switch (normalizedType) {
    case 'OFFER':
    case 'OFFER_LETTER':
    case 'HR-OFF':
      return generateOfferLetterPdf(data, options);

    case 'EXTENSION':
    case 'EXTENSION_LETTER':
    case 'HR-EXT':
      return generateExtensionLetterPdf(data, options);

    default:
      throw new Error(`[DocumentPdfService] Unsupported document type: '${docType}'. Supported types: OFFER_LETTER, EXTENSION_LETTER`);
  }
}

export {
  generateOfferLetterPdf,
  generateExtensionLetterPdf,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGINS,
  CONTENT_WIDTH,
  COLORS,
};
