import { validateEmail } from '@/utils/shared/emailValidator';

/**
 * Validates a plain object (rejecting null, primitives, arrays, and objects with suspicious prototypes).
 */
export function validatePlainObject(value, options = {}) {
  const { fieldName = 'Payload', maxKeys = 50 } = options;

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid JSON object.`,
      value: null,
    };
  }

  // Reject prototype pollution attempts
  if (
    Object.prototype.hasOwnProperty.call(value, '__proto__') ||
    Object.prototype.hasOwnProperty.call(value, 'constructor') ||
    Object.prototype.hasOwnProperty.call(value, 'prototype')
  ) {
    return {
      isValid: false,
      error: `Invalid property names in ${fieldName}.`,
      value: null,
    };
  }

  const keys = Object.keys(value);
  if (keys.length > maxKeys) {
    return {
      isValid: false,
      error: `${fieldName} contains too many properties (max: ${maxKeys}).`,
      value: null,
    };
  }

  return { isValid: true, value, error: null };
}

/**
 * Validates a string with strict type, length, and format rules.
 */
export function validateString(value, options = {}) {
  const {
    fieldName = 'Field',
    minLength = 0,
    maxLength = 1000,
    pattern = null,
    allowEmpty = false,
    trim = true,
  } = options;

  if (typeof value !== 'string') {
    if (value === undefined || value === null) {
      if (allowEmpty && minLength === 0) {
        return { isValid: true, value: '', error: null };
      }
      return { isValid: false, error: `${fieldName} is required.`, value: '' };
    }
    return { isValid: false, error: `${fieldName} must be a string.`, value: '' };
  }

  const processed = trim ? value.trim() : value;

  if (!allowEmpty && processed.length === 0 && minLength > 0) {
    return { isValid: false, error: `${fieldName} cannot be empty.`, value: processed };
  }

  if (processed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters long.`,
      value: processed,
    };
  }

  if (processed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed ${maxLength} characters.`,
      value: processed,
    };
  }

  // Reject unsafe control characters (except common whitespace \r, \n, \t)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(processed)) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid control characters.`,
      value: processed,
    };
  }

  if (pattern && !pattern.test(processed)) {
    return {
      isValid: false,
      error: `${fieldName} has an invalid format.`,
      value: processed,
    };
  }

  return { isValid: true, value: processed, error: null };
}

/**
 * Validates an integer within a strict range.
 */
export function validateInteger(value, options = {}) {
  const { fieldName = 'Field', min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, defaultValue = undefined } = options;

  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return { isValid: true, value: defaultValue, error: null };
    }
    return { isValid: false, error: `${fieldName} is required.`, value: null };
  }

  const num = typeof value === 'number' ? value : Number(value);

  if (!Number.isInteger(num)) {
    return { isValid: false, error: `${fieldName} must be an integer.`, value: null };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}.`,
      value: null,
    };
  }

  return { isValid: true, value: num, error: null };
}

/**
 * Validates a boolean value.
 */
export function validateBoolean(value, options = {}) {
  const { fieldName = 'Field', defaultValue = undefined } = options;

  if (typeof value === 'boolean') {
    return { isValid: true, value, error: null };
  }

  if (value === undefined || value === null) {
    if (defaultValue !== undefined) {
      return { isValid: true, value: defaultValue, error: null };
    }
    return { isValid: false, error: `${fieldName} must be a boolean.`, value: null };
  }

  if (value === 'true' || value === '1' || value === 1) {
    return { isValid: true, value: true, error: null };
  }

  if (value === 'false' || value === '0' || value === 0) {
    return { isValid: true, value: false, error: null };
  }

  return { isValid: false, error: `${fieldName} must be a boolean.`, value: null };
}

/**
 * Validates that a value belongs to a specific enum / whitelist.
 */
export function validateEnum(value, allowedValues, options = {}) {
  const { fieldName = 'Field', defaultValue = undefined } = options;

  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return { isValid: true, value: defaultValue, error: null };
    }
    return { isValid: false, error: `${fieldName} is required.`, value: null };
  }

  if (!allowedValues.includes(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}.`,
      value: null,
    };
  }

  return { isValid: true, value, error: null };
}

/**
 * Validates an array with length limits and optional element validator.
 */
export function validateArray(value, options = {}) {
  const {
    fieldName = 'Array',
    minItems = 0,
    maxItems = 100,
    itemValidator = null,
  } = options;

  if (!Array.isArray(value)) {
    return { isValid: false, error: `${fieldName} must be an array.`, value: [] };
  }

  if (value.length < minItems) {
    return {
      isValid: false,
      error: `${fieldName} must contain at least ${minItems} item(s).`,
      value,
    };
  }

  if (value.length > maxItems) {
    return {
      isValid: false,
      error: `${fieldName} cannot exceed ${maxItems} items.`,
      value,
    };
  }

  if (typeof itemValidator === 'function') {
    const validatedItems = [];
    for (let i = 0; i < value.length; i++) {
      const result = itemValidator(value[i], i);
      if (!result.isValid) {
        return {
          isValid: false,
          error: `${fieldName}[${i}]: ${result.error}`,
          value,
        };
      }
      validatedItems.push(result.value !== undefined ? result.value : value[i]);
    }
    return { isValid: true, value: validatedItems, error: null };
  }

  return { isValid: true, value, error: null };
}

export { validateEmail };
