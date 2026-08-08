/**
 * SkillBun Shared Email Validator
 * Strictly validates email format, top-level domain (TLD), and blocks disposable/spam/trash email domains.
 */

const MAX_EMAIL_LENGTH = 254;

// Known disposable, temporary, or spam domain names (lowercase)
const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'yopmail.org',
  'mailinator.com', 'mailinator.net', 'mailinator2.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  'tempmail.com', 'tempmail.net', 'temp-mail.org', 'temp-mail.ru', 'tempmail.de',
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.at', 'trashmail.io',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.block', 'guerrillamail.de',
  'dispostable.com',
  'sharklasers.com',
  'getnada.com',
  'throwawaymail.com',
  'maildrop.cc',
  'fakeinbox.com',
  'crazymailing.com',
  'inboxalias.com',
  'generator.email',
  'emailondeck.com',
  'byom.de',
  'burnermail.io',
  'mohmal.com',
  'binkmail.com',
  'safetymail.info',
  'mytemp.email',
  'disposable.com',
  'trash.com',
  'spam.com',
  'fake.com',
  'test.com',
  'example.com',
  'invalid.com',
  'dummy.com',
  'random.com',
  'temp.com',
  'nohost.com',
  'nowhere.com',
  'foo.com',
  'bar.com',
  'mailinator.org',
  '10minmail.com',
  'mytrashmail.com',
  'disposablemail.com',
  'getairmail.com',
  'anonymbox.com',
]);

// Non-existent or fake TLDs commonly used in spam/bot testing
const INVALID_TLDS = new Set([
  'nd', 'fake', 'test', 'invalid', 'local', 'localhost', 'example', 'domain', 'sample', 'null', 'undefined', 'void', 'temp'
]);

/**
 * Validates an email address.
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string, normalizedEmail: string }}
 */
export function validateEmail(email) {
  const raw = String(email || '').trim();
  const normalized = raw.toLowerCase();

  if (!normalized) {
    return { isValid: false, error: 'Please enter your email address.', normalizedEmail: '' };
  }

  if (normalized.length > MAX_EMAIL_LENGTH) {
    return { isValid: false, error: 'Email address is too long.', normalizedEmail: normalized };
  }

  // Must contain exactly one @
  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address with a single "@" symbol.', normalizedEmail: normalized };
  }

  const [localPart, domainPart] = parts;

  // Local part validation
  if (!localPart || localPart.length > 64) {
    return { isValid: false, error: 'The email username before "@" is invalid.', normalizedEmail: normalized };
  }

  // Local part cannot start/end with a dot or have consecutive dots
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, error: 'Please enter a valid email address without misplaced dots.', normalizedEmail: normalized };
  }

  // Basic character set for local part
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
    return { isValid: false, error: 'Email contains invalid characters before "@".', normalizedEmail: normalized };
  }

  // Domain part validation
  if (!domainPart || !domainPart.includes('.')) {
    return { isValid: false, error: 'Please enter a valid domain name (e.g. gmail.com).', normalizedEmail: normalized };
  }

  // Domain labels check
  const domainLabels = domainPart.split('.');
  if (domainLabels.some((label) => !label || label.length > 63 || label.startsWith('-') || label.endsWith('-'))) {
    return { isValid: false, error: 'Please enter a valid domain name.', normalizedEmail: normalized };
  }

  // Top level domain (TLD) check - the last part after final dot
  const tld = domainLabels[domainLabels.length - 1];

  // TLD must be strictly alphabetic and at least 2 characters long (e.g. com, org, in, edu)
  if (!/^[a-z]{2,24}$/.test(tld)) {
    return { isValid: false, error: 'Please enter an email with a valid domain extension (e.g. .com, .org, .in).', normalizedEmail: normalized };
  }

  // Reject known invalid/fake TLDs
  if (INVALID_TLDS.has(tld)) {
    return { isValid: false, error: `The domain extension ".${tld}" is not valid. Please use a real email (e.g. gmail.com).`, normalizedEmail: normalized };
  }

  // Check disposable / spam domains
  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    return { isValid: false, error: 'Disposable or temporary email addresses are not allowed. Please use a permanent email (e.g. Gmail, Outlook, Yahoo).', normalizedEmail: normalized };
  }

  return { isValid: true, normalizedEmail: normalized };
}

/**
 * Simple helper returning boolean.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return validateEmail(email).isValid;
}
