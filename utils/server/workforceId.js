import crypto from 'node:crypto';

export const WORKFORCE_PREFIXES = Object.freeze({
  OFFER: 'SB-OFF',
  EXTENSION: 'SB-EXT',
  TERMINATION: 'SB-TERM',
  RELIEVING: 'SB-REL',
  INTERNSHIP: 'SB-INT',
  TRAINING: 'SB-TRN',
  LOR: 'SB-LOR',
});

// Character pool excluding ambiguous characters (0, O, 1, I, L)
const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates a cryptographically random, non-sequential alphanumeric string of specified length.
 * @param {number} length
 * @returns {string}
 */
function getRandomAlphanumeric(length = 6) {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generates a formatted workforce document or credential ID.
 * @param {'SB-OFF' | 'SB-EXT' | 'SB-TERM' | 'SB-REL' | 'SB-INT' | 'SB-TRN' | 'SB-LOR'} prefix
 * @param {number} [customYear] - Optional override year (defaults to current UTC year)
 * @returns {string} e.g. "SB-OFF-2026-8K29DF"
 */
export function generateWorkforceId(prefix, customYear) {
  const validPrefixes = Object.values(WORKFORCE_PREFIXES);
  if (!validPrefixes.includes(prefix)) {
    throw new Error(
      `Invalid workforce ID prefix "${prefix}". Expected one of: ${validPrefixes.join(', ')}`
    );
  }

  const year = customYear && Number.isInteger(customYear) ? customYear : new Date().getUTCFullYear();
  const randomSuffix = getRandomAlphanumeric(6);

  return `${prefix}-${year}-${randomSuffix}`;
}

/**
 * Validates whether a given string is a valid workforce document or credential ID.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidWorkforceId(id) {
  if (typeof id !== 'string') return false;
  const regex = /^SB-(OFF|EXT|TERM|REL|INT|TRN|LOR)-\d{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
  return regex.test(id.trim().toUpperCase());
}

/**
 * Parses components of a workforce ID.
 * @param {string} id
 * @returns {{ prefix: string, type: string, year: number, code: string } | null}
 */
export function parseWorkforceId(id) {
  if (!isValidWorkforceId(id)) return null;
  const parts = id.trim().toUpperCase().split('-');
  return {
    prefix: `SB-${parts[1]}`,
    type: parts[1],
    year: Number.parseInt(parts[2], 10),
    code: parts[3],
  };
}
