import crypto from 'node:crypto';
import { getWorkforceEncryptionKey } from './env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Validates and retrieves the 32-byte Buffer encryption key from environment.
 * Throws explicit errors to prevent silent corruption or unencrypted writes.
 * @returns {Buffer} 32-byte Buffer key
 */
function getEncryptionKeyBuffer() {
  const rawKey = getWorkforceEncryptionKey();

  if (!rawKey || typeof rawKey !== 'string') {
    throw new Error('WORKFORCE_ENCRYPTION_KEY is not configured in the server environment.');
  }

  const trimmed = rawKey.trim();

  // Support 64-character hex string (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }

  // Support raw 32-character utf8 string
  if (Buffer.byteLength(trimmed, 'utf8') === 32) {
    return Buffer.from(trimmed, 'utf8');
  }

  throw new Error(
    'WORKFORCE_ENCRYPTION_KEY must be a 64-character hex string (32 bytes) or 32-byte UTF-8 string.'
  );
}

/**
 * Encrypts an object containing sensitive credentials into an authenticated ciphertext string.
 * @param {Object} data - Credential payload, e.g. { work_email, password, access_notes }
 * @returns {string} Colon-delimited hex format: "ivHex:authTagHex:ciphertextHex"
 */
export function encryptCredentials(data) {
  if (!data || typeof data !== 'object') {
    throw new TypeError('encryptCredentials requires a non-null object payload.');
  }

  const keyBuffer = getEncryptionKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const plaintext = JSON.stringify(data);

  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
}

/**
 * Decrypts a colon-delimited AES-256-GCM ciphertext string back into the original object.
 * @param {string} encryptedString - "ivHex:authTagHex:ciphertextHex"
 * @returns {Object} Original decrypted credential payload
 */
export function decryptCredentials(encryptedString) {
  if (typeof encryptedString !== 'string' || !encryptedString.includes(':')) {
    throw new TypeError('Invalid encrypted credentials format. Expected "iv:authTag:ciphertext".');
  }

  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed ciphertext structure. Expected exactly 3 delimited components.');
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes, got ${iv.length}.`);
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid Auth Tag length: expected ${AUTH_TAG_LENGTH} bytes, got ${authTag.length}.`);
  }

  const keyBuffer = getEncryptionKeyBuffer();
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
