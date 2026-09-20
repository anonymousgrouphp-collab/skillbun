/**
 * Unified Server-Side Document PDF Service
 *
 * Dispatches programmatic PDF generation by (category, templateVersion)
 * according to the version-pinned / append-only template architecture.
 *
 * Supported Document Types:
 * 1. 4-Page Formal Offer Letter ('OFFER_LETTER' / 'OFFER' / 'HR-OFF')
 * 2. 1-Page Extension Letter ('EXTENSION_LETTER' / 'EXTENSION' / 'HR-EXT')
 * 3. 1-Page Notice of Engagement Conclusion ('TERMINATION_NOTICE' / 'TERMINATION' / 'HR-TERM')
 */

import {
  DOCUMENT_CATEGORIES,
  normalizeDocumentCategory,
  resolveTemplateVersion,
  UnsupportedTemplateVersionError,
} from '../../common/docTemplateRegistry.js';
import { generateOfferLetterV1 } from './templates/offerLetter/v1.js';
import { generateExtensionLetterV1 } from './templates/extensionLetter/v1.js';
import { generateTerminationNoticeV1 } from './templates/terminationNotice/v1.js';
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
  TERMINATION_NOTICE: 'TERMINATION_NOTICE',
  EXTENSION: 'EXTENSION',
  OFFER: 'OFFER',
  TERMINATION: 'TERMINATION',
});

/**
 * Registry of versioned PDF generators indexed by canonical category and template version.
 */
const PDF_GENERATOR_REGISTRY = Object.freeze({
  [DOCUMENT_CATEGORIES.OFFER_LETTER]: Object.freeze({
    v1: generateOfferLetterV1,
  }),
  [DOCUMENT_CATEGORIES.EXTENSION_LETTER]: Object.freeze({
    v1: generateExtensionLetterV1,
  }),
  [DOCUMENT_CATEGORIES.TERMINATION_NOTICE]: Object.freeze({
    v1: generateTerminationNoticeV1,
  }),
});

/**
 * Generates a standard programmatic PDF buffer according to document category and stored template version.
 *
 * @param {string} rawDocType - Document type / alias
 * @param {Object} data - Employee or snapshot record
 * @param {Object} [options={}] - Generation options (may supply options.templateVersion)
 * @returns {Promise<{ buffer: Buffer, filename: string, referenceId: string, metadataSnapshot: Object }>}
 */
export async function generateDocumentPdf(docType, data, options = {}) {
  if (!docType || typeof docType !== 'string') {
    throw new TypeError('generateDocumentPdf requires a valid docType string.');
  }
  if (!data || typeof data !== 'object') {
    throw new TypeError('generateDocumentPdf requires a valid data record object.');
  }

  const category = normalizeDocumentCategory(docType);
  const generatorsForCategory = PDF_GENERATOR_REGISTRY[category];

  if (!generatorsForCategory) {
    throw new Error(`[DocumentPdfService] Unsupported document type: '${docType}' (normalized as '${category}'). Supported types: OFFER_LETTER, EXTENSION_LETTER, TERMINATION_NOTICE`);
  }

  // Resolve template version strictly:
  // - options.templateVersion or data.template_version
  // - null/undefined resolves to 'v1' (legacy fallback)
  // - explicit unsupported version throws UnsupportedTemplateVersionError (NEVER silent fallback)
  const requestedVersion = options.templateVersion ?? data.template_version;
  const resolvedVersion = resolveTemplateVersion(category, requestedVersion);

  const generator = generatorsForCategory[resolvedVersion];
  if (!generator) {
    throw new UnsupportedTemplateVersionError(category, resolvedVersion);
  }

  return generator(data, {
    ...options,
    templateVersion: resolvedVersion,
  });
}

// Backward-compatible direct aliases targeting V1 generators
export const generateOfferLetterPdf = generateOfferLetterV1;
export const generateExtensionLetterPdf = generateExtensionLetterV1;
export const generateTerminationNoticePdf = generateTerminationNoticeV1;

export {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGINS,
  CONTENT_WIDTH,
  COLORS,
  PDF_GENERATOR_REGISTRY,
};
