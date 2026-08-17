import crypto from 'node:crypto';

export const WORKFORCE_PREFIXES = Object.freeze({
  OFFER: 'HR-OFF',
  EXTENSION: 'HR-EXT',
  TERMINATION: 'HR-TERM',
  RELIEVING: 'HR-REL',
  INTERNSHIP: 'INT-REC',
  TRAINING: 'TRN-EXP',
  LOR: 'CORP-LOR',
});

// Legacy prefix mapping for backward compatibility
const LEGACY_PREFIX_MAP = Object.freeze({
  'SB-OFF': 'HR-OFF',
  'SB-EXT': 'HR-EXT',
  'SB-TERM': 'HR-TERM',
  'SB-REL': 'HR-REL',
  'SB-INT': 'INT-REC',
  'SB-TRN': 'TRN-EXP',
  'SB-LOR': 'CORP-LOR',
});

// Character pool excluding ambiguous characters (0, O, 1, I, L)
const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates a cryptographically random, non-sequential alphanumeric string of specified length.
 * @param {number} length
 * @returns {string}
 */
export function getRandomAlphanumeric(length = 6) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generates an academic / roadmap certificate cryptographic token.
 * Format: SKBXXXX-XX-XX-XXXX (12-character cryptographic fingerprint)
 * Example: SKB8F92-4C-10-9A7E
 * @returns {string}
 */
export function generateCertificateId() {
  const part1 = getRandomAlphanumeric(4);
  const part2 = getRandomAlphanumeric(2);
  const part3 = getRandomAlphanumeric(2);
  const part4 = getRandomAlphanumeric(4);
  return `SKB${part1}-${part2}-${part3}-${part4}`;
}

/**
 * Generates a formatted workforce document or credential database ID.
 * Format: SKB-YYYY-PREFIX-SUFFIX (e.g. "SKB-2026-HR-OFF-8K29DF")
 * @param {'HR-OFF' | 'HR-EXT' | 'HR-TERM' | 'HR-REL' | 'INT-REC' | 'TRN-EXP' | 'CORP-LOR' | string} rawPrefix
 * @param {number} [customYear] - Optional override year (defaults to current UTC year)
 * @returns {string} e.g. "SKB-2026-HR-OFF-8K29DF"
 */
export function generateWorkforceId(rawPrefix, customYear) {
  const prefix = LEGACY_PREFIX_MAP[rawPrefix] || rawPrefix;
  const validPrefixes = Object.values(WORKFORCE_PREFIXES);
  if (!validPrefixes.includes(prefix)) {
    throw new Error(
      `Invalid workforce ID prefix "${rawPrefix}". Expected one of: ${validPrefixes.join(', ')}`
    );
  }

  const year = customYear && Number.isInteger(customYear) ? customYear : new Date().getUTCFullYear();
  const randomSuffix = getRandomAlphanumeric(6);

  return `SKB-${year}-${prefix}-${randomSuffix}`;
}

/**
 * Converts a database ID (with hyphens) to official Corporate Display Format (with slashes).
 * Example: "SKB-2026-HR-OFF-8K29DF" -> "SKB/2026/HR-OFF/8K29DF"
 * @param {string} id
 * @returns {string}
 */
export function formatWorkforceDisplayId(id) {
  if (!id || typeof id !== 'string') return '';
  const trimmed = id.trim();

  // If already using slashes, return normalized uppercase
  if (trimmed.includes('/')) return trimmed.toUpperCase();

  // If new standard format: SKB-YYYY-TYPE-SUBTYPE-CODE or SKB-YYYY-TYPE-CODE
  const newFormatMatch = trimmed.toUpperCase().match(/^SKB-(\d{4})-([A-Z0-9]+(?:-[A-Z0-9]+)?)-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6})$/);
  if (newFormatMatch) {
    const [, year, type, code] = newFormatMatch;
    return `SKB/${year}/${type}/${code}`;
  }

  // Legacy format conversion: SB-OFF-2026-8K29DF -> SKB/2026/HR-OFF/8K29DF
  const legacyMatch = trimmed.toUpperCase().match(/^SB-([A-Z]+)-(\d{4})-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6})$/);
  if (legacyMatch) {
    const [, legacyType, year, code] = legacyMatch;
    const mappedType = LEGACY_PREFIX_MAP[`SB-${legacyType}`] || legacyType;
    return `SKB/${year}/${mappedType}/${code}`;
  }

  return trimmed;
}

/**
 * Converts a Corporate Display ID (with slashes) to database/URL-safe format (with hyphens).
 * Example: "SKB/2026/HR-OFF/8K29DF" -> "SKB-2026-HR-OFF-8K29DF"
 * @param {string} id
 * @returns {string}
 */
export function normalizeWorkforceDbId(id) {
  if (!id || typeof id !== 'string') return '';
  return id.trim().toUpperCase().replace(/\//g, '-');
}

/**
 * Validates whether a given string is a valid academic certificate ID.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidCertificateId(id) {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim().toUpperCase();
  // Standard cryptographic token: SKBXXXX-XX-XX-XXXX
  const cryptoTokenRegex = /^SKB[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;
  if (cryptoTokenRegex.test(trimmed)) return true;
  // Alternate chunking token: SKB-XXXX-XXXX-XXXX
  const legacyCryptoRegex = /^SKB-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/;
  if (legacyCryptoRegex.test(trimmed)) return true;
  // Workforce credential IDs (both hyphen and slash format)
  if (isValidWorkforceId(trimmed)) return true;
  // Legacy Firestore auto-IDs (alphanumeric 15-30 chars)
  return /^[a-zA-Z0-9_-]{15,35}$/.test(id.trim());
}

/**
 * Validates whether a given string is a valid workforce document or credential ID.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidWorkforceId(id) {
  if (typeof id !== 'string') return false;
  const normalized = normalizeWorkforceDbId(id);

  // New format: SKB-YYYY-(HR-OFF|HR-EXT|HR-TERM|HR-REL|INT-REC|TRN-EXP|CORP-LOR)-XXXXXX
  const newRegex = /^SKB-\d{4}-(HR-OFF|HR-EXT|HR-TERM|HR-REL|INT-REC|TRN-EXP|CORP-LOR)-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
  if (newRegex.test(normalized)) return true;

  // Legacy format: SB-(OFF|EXT|TERM|REL|INT|TRN|LOR)-YYYY-XXXXXX
  const legacyRegex = /^SB-(OFF|EXT|TERM|REL|INT|TRN|LOR)-\d{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
  return legacyRegex.test(normalized);
}

/**
 * Parses components of a workforce ID.
 * @param {string} id
 * @returns {{ prefix: string, type: string, year: number, code: string, displayId: string, dbId: string } | null}
 */
export function parseWorkforceId(id) {
  if (!isValidWorkforceId(id)) return null;
  const normalized = normalizeWorkforceDbId(id);
  const displayId = formatWorkforceDisplayId(id);

  // New format parsing: SKB-2026-HR-OFF-8K29DF
  const newMatch = normalized.match(/^SKB-(\d{4})-([A-Z0-9]+-[A-Z0-9]+)-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6})$/);
  if (newMatch) {
    const [, yearStr, type, code] = newMatch;
    return {
      prefix: type,
      type,
      year: Number.parseInt(yearStr, 10),
      code,
      displayId,
      dbId: normalized,
    };
  }

  // Legacy format parsing: SB-OFF-2026-8K29DF
  const legacyMatch = normalized.match(/^SB-([A-Z]+)-(\d{4})-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6})$/);
  if (legacyMatch) {
    const [, legacyType, yearStr, code] = legacyMatch;
    const mappedType = LEGACY_PREFIX_MAP[`SB-${legacyType}`] || legacyType;
    return {
      prefix: mappedType,
      type: mappedType,
      year: Number.parseInt(yearStr, 10),
      code,
      displayId,
      dbId: normalized,
    };
  }

  return null;
}
