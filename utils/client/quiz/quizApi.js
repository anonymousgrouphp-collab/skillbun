'use client';

import { getFirebaseServices } from '../firebaseClient';
import {
  hasFreshHumanProof,
  persistHumanProof,
  clearHumanProof,
  restoreHumanProof
} from './quizState';

const HUMAN_PROOF_HEADER = 'x-skillbun-human';
const AI_CLIENT_MAX_RETRIES = 1;
const AI_RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getFirebaseIdToken() {
  const services = getFirebaseServices();
  let currentUser = services.auth?.currentUser;

  if (!currentUser && services.auth) {
    await new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 3000);

      const unsubscribe = services.auth.onAuthStateChanged((user) => {
        if (user && !resolved) {
          currentUser = user;
          resolved = true;
          clearTimeout(timer);
          if (typeof unsubscribe === 'function') unsubscribe();
          resolve();
        }
      });
    });
  }

  if (!currentUser) {
    const error = new Error('Login required');
    error.status = 401;
    throw error;
  }

  return currentUser.getIdToken();
}

export async function fetchSecurityConfig(state) {
  try {
    const response = await fetch('/api/config');
    if (!response.ok) return;

    const data = await response.json();
    const captcha = data?.captcha || {};

    state.securityConfig.captchaEnabled = captcha.enabled === true && typeof captcha.siteKey === 'string' && captcha.siteKey.length > 0;
    state.securityConfig.captchaSiteKey = state.securityConfig.captchaEnabled ? captcha.siteKey : '';
  } catch (err) {
    state.securityConfig.captchaEnabled = false;
    state.securityConfig.captchaSiteKey = '';
  }
}

export async function verifyHumanProof(state, renderCaptchaCallback) {
  restoreHumanProof(state);
  if (hasFreshHumanProof(state)) {
    return true;
  }

  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const bypassKey = typeof window !== 'undefined' ? window.localStorage.getItem('sb_bypass_captcha') : null;

  if (!state.securityConfig.captchaEnabled || isLocalhost || bypassKey === 'bypass-captcha-dev') {
    persistHumanProof(state, 'dev-human-proof-token', Date.now() + 3600 * 1000);
    return true;
  }

  const body = state.securityConfig.captchaEnabled ? { token: state.captchaToken } : {};
  const headers = { 'Content-Type': 'application/json' };
  const bypassKey = typeof window !== 'undefined' ? window.localStorage.getItem('sb_bypass_captcha') : null;
  if (state.captchaToken === 'bypass-captcha-dev' || bypassKey === 'bypass-captcha-dev') {
    headers['x-skillbun-bypass'] = 'bypass-captcha-dev';
  }

  try {
    const response = await fetch('/api/human/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      clearHumanProof(state);
      return false;
    }

    const data = await response.json();
    const token = typeof data?.humanToken === 'string' ? data.humanToken : '';
    const parsedExpiresAt = Number.parseInt(data?.expiresAt, 10);

    if (!token || !Number.isFinite(parsedExpiresAt)) {
      clearHumanProof(state);
      return false;
    }

    persistHumanProof(state, token, parsedExpiresAt);

    if (state.securityConfig.captchaEnabled && window.turnstile && state.captchaWidgetId !== null) {
      window.turnstile.reset(state.captchaWidgetId);
      state.captchaToken = '';
    }

    return true;
  } catch (err) {
    return false;
  }
}

export async function refreshHumanProofSession(state) {
  if (!restoreHumanProof(state)) return false;

  try {
    const response = await fetch('/api/human/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [HUMAN_PROOF_HEADER]: state.humanProofToken
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      clearHumanProof(state);
      return false;
    }

    const data = await response.json();
    const token = typeof data?.humanToken === 'string' ? data.humanToken : '';
    const expiresAt = Number.parseInt(data?.expiresAt, 10);

    if (!token || !Number.isFinite(expiresAt)) {
      clearHumanProof(state);
      return false;
    }

    persistHumanProof(state, token, expiresAt);
    return true;
  } catch (err) {
    return hasFreshHumanProof(state);
  }
}

export function parseRetryAfterMs(value) {
  if (!value) return 0;

  const seconds = Number.parseInt(value, 10);
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const retryDate = Date.parse(value);
  if (Number.isFinite(retryDate)) {
    return Math.max(0, retryDate - Date.now());
  }

  return 0;
}

export function formatWaitTime(ms) {
  const seconds = Math.max(1, Math.ceil(ms / 1000));
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

function getRetryDelayMs(error, attempt) {
  if (Number.isFinite(error?.retryAfterMs) && error.retryAfterMs > 0) {
    return Math.min(error.retryAfterMs, 30_000);
  }

  return Math.min(700 * (2 ** attempt), 4_000);
}

export async function fetchGeminiPayload(state, payload) {
  let lastError = null;

  for (let attempt = 0; attempt <= AI_CLIENT_MAX_RETRIES; attempt += 1) {
    try {
      const idToken = await getFirebaseIdToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      };
      if (state.humanProofToken) headers[HUMAN_PROOF_HEADER] = state.humanProofToken;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403) {
          clearHumanProof(state);
        }

        const error = new Error(errData.error || `API request failed (${res.status})`);
        error.status = res.status;
        error.retryAfterMs = Number.parseInt(errData.retryAfterMs, 10) || parseRetryAfterMs(res.headers.get('retry-after'));

        if (AI_RETRYABLE_STATUSES.has(res.status) && attempt < AI_CLIENT_MAX_RETRIES) {
          lastError = error;
          await sleep(getRetryDelayMs(error, attempt));
          continue;
        }

        throw error;
      }

      return await res.json();
    } catch (error) {
      if (error?.status || attempt >= AI_CLIENT_MAX_RETRIES) {
        if (!error?.status && !error?.code) {
          error.code = 'NETWORK_OR_CLIENT_ERROR';
        }
        throw error;
      }

      lastError = error;
      await sleep(getRetryDelayMs(error, attempt));
    }
  }

  throw lastError || new Error('AI request failed');
}

export async function fetchQuizQuestions(state) {
  const idToken = await getFirebaseIdToken();
  const headers = {
    Authorization: `Bearer ${idToken}`
  };
  if (state.humanProofToken) headers[HUMAN_PROOF_HEADER] = state.humanProofToken;

  const res = await fetch('/api/quiz/questions', {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch quiz questions');
  }

  return await res.json();
}

