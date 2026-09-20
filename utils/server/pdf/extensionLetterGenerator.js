/**
 * Compatibility wrapper for Extension Letter PDF generator.
 * Delegates to the versioned V1 generator under templates/extensionLetter/v1.js.
 */
export { generateExtensionLetterV1 as generateExtensionLetterPdf } from './templates/extensionLetter/v1.js';
