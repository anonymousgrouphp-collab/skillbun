/**
 * Central Document Template Registry & Version Architecture
 *
 * Implements a version-pinned / append-only template architecture for all
 * SkillBun documents (Roadmap Certificates, Workforce Credentials, and HR Legal Letters).
 *
 * LIFECYCLE INVARIANT:
 * 1. Issuance Time: getActiveTemplateVersion(category) is stamped onto the record.
 * 2. Storage: template_version is permanently stored in Firestore.
 * 3. Render / PDF Time: resolveTemplateVersion(category, doc.template_version) resolves
 *    strictly to the stored version.
 * 4. Error Policy: Missing/null on legacy records falls back to 'v1'. An explicit unsupported
 *    version (e.g. 'v99') throws UnsupportedTemplateVersionError. NEVER silent fallback.
 */

export const DOCUMENT_CATEGORIES = Object.freeze({
  ROADMAP_CERT: 'ROADMAP_CERT',
  INTERNSHIP_CERT: 'INTERNSHIP_CERT',
  TRAINING_CERT: 'TRAINING_CERT',
  LOR: 'LOR',
  OFFER_LETTER: 'OFFER_LETTER',
  EXTENSION_LETTER: 'EXTENSION_LETTER',
  TERMINATION_NOTICE: 'TERMINATION_NOTICE',
});

/**
 * Category capabilities determine how each document is manifested.
 * - 'web': Rendered interactively via React on /certificate/[id]
 * - 'pdf': Rendered programmatically via pdf-lib in documentPdfService
 */
export const CATEGORY_CAPABILITIES = Object.freeze({
  [DOCUMENT_CATEGORIES.ROADMAP_CERT]: 'web',
  [DOCUMENT_CATEGORIES.INTERNSHIP_CERT]: 'web',
  [DOCUMENT_CATEGORIES.TRAINING_CERT]: 'web',
  [DOCUMENT_CATEGORIES.LOR]: 'web',
  [DOCUMENT_CATEGORIES.OFFER_LETTER]: 'pdf',
  [DOCUMENT_CATEGORIES.EXTENSION_LETTER]: 'pdf',
  [DOCUMENT_CATEGORIES.TERMINATION_NOTICE]: 'pdf',
});

export class UnsupportedTemplateVersionError extends Error {
  constructor(category, version) {
    super(`Unsupported template version "${version}" for document category "${category}".`);
    this.name = 'UnsupportedTemplateVersionError';
    this.category = category;
    this.version = version;
    this.code = 'UNSUPPORTED_TEMPLATE_VERSION';
  }
}

/**
 * Canonical mapper normalizing any document type string, alias, or workforce prefix
 * into an authoritative DOCUMENT_CATEGORIES enum key.
 *
 * @param {string} rawType
 * @returns {string} One of DOCUMENT_CATEGORIES
 */
export function normalizeDocumentCategory(rawType) {
  if (!rawType || typeof rawType !== 'string') {
    return DOCUMENT_CATEGORIES.ROADMAP_CERT;
  }

  const cleaned = rawType.trim().toUpperCase().replace(/[\s/-]+/g, '_');

  switch (cleaned) {
    // Academic Exam Cert
    case 'ROADMAP':
    case 'ROADMAP_CERT':
    case 'ROADMAP_CERTIFICATE':
    case 'EXAM':
      return DOCUMENT_CATEGORIES.ROADMAP_CERT;

    // Internship Completion Credential
    case 'INTERNSHIP':
    case 'INTERNSHIP_CERT':
    case 'INT_REC':
    case 'SB_INT':
    case 'HR_INT':
      return DOCUMENT_CATEGORIES.INTERNSHIP_CERT;

    // Practical Training Credential
    case 'TRAINING':
    case 'TRAINING_CERT':
    case 'TRN_EXP':
    case 'SB_TRN':
    case 'HR_TRN':
      return DOCUMENT_CATEGORIES.TRAINING_CERT;

    // Official Letter of Recommendation
    case 'LOR':
    case 'CORP_LOR':
    case 'SB_LOR':
    case 'HR_LOR':
    case 'LETTER_OF_RECOMMENDATION':
      return DOCUMENT_CATEGORIES.LOR;

    // Formal Offer Letter
    case 'OFFER':
    case 'OFFER_LETTER':
    case 'OFFER_PACK':
    case 'HR_OFF':
    case 'SB_OFF':
      return DOCUMENT_CATEGORIES.OFFER_LETTER;

    // Extension Letter
    case 'EXTENSION':
    case 'EXTENSION_LETTER':
    case 'HR_EXT':
    case 'SB_EXT':
      return DOCUMENT_CATEGORIES.EXTENSION_LETTER;

    // Termination Notice
    case 'TERMINATION':
    case 'TERMINATION_NOTICE':
    case 'HR_TERM':
    case 'SB_TERM':
    case 'SEPARATION_NOTICE':
      return DOCUMENT_CATEGORIES.TERMINATION_NOTICE;

    default:
      return rawType;
  }
}

/**
 * Authoritative registry defining active versions and supported versions for all user-visible documents.
 */
export const TEMPLATE_REGISTRY = Object.freeze({
  [DOCUMENT_CATEGORIES.ROADMAP_CERT]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
  [DOCUMENT_CATEGORIES.INTERNSHIP_CERT]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
  [DOCUMENT_CATEGORIES.TRAINING_CERT]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
  [DOCUMENT_CATEGORIES.LOR]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
  [DOCUMENT_CATEGORIES.OFFER_LETTER]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
  [DOCUMENT_CATEGORIES.EXTENSION_LETTER]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
  [DOCUMENT_CATEGORIES.TERMINATION_NOTICE]: Object.freeze({
    activeVersion: 'v1',
    supportedVersions: Object.freeze(['v1']),
    legacyFallbackVersion: 'v1',
  }),
});

/**
 * Returns the current active template version for newly issued documents.
 * IMPORTANT: This must ONLY be invoked during document issuance/minting!
 *
 * @param {string} rawType - Raw document type or category
 * @returns {string} Active version string (e.g. 'v1')
 */
export function getActiveTemplateVersion(rawType) {
  const category = normalizeDocumentCategory(rawType);
  const config = TEMPLATE_REGISTRY[category];
  if (!config) {
    return 'v1';
  }
  return config.activeVersion;
}

/**
 * Resolves the template version to use for rendering or generating an existing document.
 *
 * Rules:
 * 1. Missing, undefined, null, or empty string -> resolves to legacyFallbackVersion ('v1').
 * 2. Supported version string -> returns the version.
 * 3. Explicit unsupported version -> THROWS UnsupportedTemplateVersionError (NEVER falls back to 'v1').
 *
 * @param {string} rawType - Raw document type or category
 * @param {string|null|undefined} requestedVersion - The template_version recorded on the document
 * @returns {string} Validated template version string
 * @throws {UnsupportedTemplateVersionError} When requestedVersion is explicitly defined but unsupported
 */
export function resolveTemplateVersion(rawType, requestedVersion) {
  const category = normalizeDocumentCategory(rawType);
  const config = TEMPLATE_REGISTRY[category];

  // 1. Missing / legacy check
  if (requestedVersion === null || requestedVersion === undefined || requestedVersion === '') {
    return config?.legacyFallbackVersion || 'v1';
  }

  const normalizedVersion = String(requestedVersion).trim().toLowerCase();

  // 2. Supported version check
  if (config && config.supportedVersions.includes(normalizedVersion)) {
    return normalizedVersion;
  }

  // 3. Explicit unsupported version -> throw loudly!
  throw new UnsupportedTemplateVersionError(category, requestedVersion);
}

/**
 * Checks whether a given version is currently supported for a category.
 *
 * @param {string} rawType
 * @param {string} version
 * @returns {boolean}
 */
export function isSupportedTemplateVersion(rawType, version) {
  if (!version || typeof version !== 'string') return false;
  const category = normalizeDocumentCategory(rawType);
  const config = TEMPLATE_REGISTRY[category];
  if (!config) return false;
  return config.supportedVersions.includes(version.trim().toLowerCase());
}

/**
 * Frozen asset references for V1 templates.
 * These assets must NEVER be modified or overwritten in-place in future releases.
 */
export const V1_FROZEN_ASSETS = Object.freeze({
  ROADMAP_CANVA_TEMPLATE: '/certificate-template.png',
  INTERNSHIP_CANVA_TEMPLATE: '/internship-cert-template.png',
  TRAINING_CANVA_TEMPLATE: '/training-cert-template.png',
  BRAND_LOGO_TIGHT: '/logo-tight.png',
  REISH_MARK: '/reish-mark.png',
  REISH_WORDMARK: '/reish-wordmark.png',
  LOGO: '/logo.png',
  SPLASH_LOGO: '/splash-logo.png',
});

/**
 * Canonical Manifest of Frozen Template Source Files and Assets.
 *
 * Any file listed here belongs to an already-released, immutable template version (e.g. V1).
 * Automated CI checks and git guards will block any direct modification to these paths.
 * New visual or structural changes must be implemented as a new version (e.g. V2).
 */
export const FROZEN_TEMPLATE_MANIFEST = Object.freeze({
  v1: Object.freeze({
    renderers: Object.freeze([
      'app/certificate/[id]/templates/CertificateRendererV1.jsx',
    ]),
    pdfGenerators: Object.freeze([
      'utils/server/pdf/templates/offerLetter/v1.js',
      'utils/server/pdf/templates/extensionLetter/v1.js',
      'utils/server/pdf/templates/terminationNotice/v1.js',
    ]),
    assets: Object.freeze([
      'public/certificate-template.png',
      'public/internship-cert-template.png',
      'public/training-cert-template.png',
      'public/logo-tight.png',
      'public/reish-mark.png',
      'public/reish-wordmark.png',
      'public/logo.png',
      'public/splash-logo.png',
    ]),
  }),
});

/**
 * Flat list of all frozen file paths across all released versions.
 * Normalized to forward-slash repo-relative paths.
 */
export const ALL_FROZEN_TEMPLATE_PATHS = Object.freeze(
  Object.values(FROZEN_TEMPLATE_MANIFEST).flatMap((ver) => [
    ...ver.renderers,
    ...ver.pdfGenerators,
    ...ver.assets,
  ])
);

/**
 * Validates integrity of TEMPLATE_REGISTRY configuration:
 * 1. activeVersion must be in supportedVersions for every category.
 * 2. supportedVersions must not be empty.
 * 3. legacyFallbackVersion must be in supportedVersions.
 *
 * @param {Object} [registry=TEMPLATE_REGISTRY]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTemplateRegistry(registry = TEMPLATE_REGISTRY) {
  const errors = [];
  for (const [category, config] of Object.entries(registry)) {
    if (!config.supportedVersions || !Array.isArray(config.supportedVersions) || config.supportedVersions.length === 0) {
      errors.push(`Category "${category}" has no supportedVersions declared.`);
      continue;
    }
    if (!config.supportedVersions.includes(config.activeVersion)) {
      errors.push(`Category "${category}" activeVersion "${config.activeVersion}" is not in supportedVersions [${config.supportedVersions.join(', ')}].`);
    }
    if (!config.supportedVersions.includes(config.legacyFallbackVersion)) {
      errors.push(`Category "${category}" legacyFallbackVersion "${config.legacyFallbackVersion}" is not in supportedVersions [${config.supportedVersions.join(', ')}].`);
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

