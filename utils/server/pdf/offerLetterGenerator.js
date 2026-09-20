/**
 * Compatibility wrapper for Offer Letter PDF generator.
 * Delegates to the versioned V1 generator under templates/offerLetter/v1.js.
 */
export { generateOfferLetterV1 as generateOfferLetterPdf } from './templates/offerLetter/v1.js';
