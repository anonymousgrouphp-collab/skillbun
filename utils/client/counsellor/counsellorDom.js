'use client';

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { clearHumanProof } from './counsellorState';
import { RATE_LIMIT_KEY } from './counsellorApi';

if (typeof marked?.setOptions === 'function') {
  marked.setOptions({
    headerIds: false,
    mangle: false,
    breaks: true
  });
}

export function getEl(id) {
  return document.getElementById(id);
}

export function toggleSecurityBanner(show) {
  const banner = getEl('securityBanner');
  if (!banner) return;
  banner.style.display = show ? 'block' : 'none';
}

export function getStoredProfile() {
  const name = localStorage.getItem('sb_name') || '';
  const degree = localStorage.getItem('sb_degree') || '';
  const year = localStorage.getItem('sb_year') || '';
  return { name, degree, year };
}

export function redirectToProfileSetup(destination) {
  window.location.href = `/onboarding?next=${encodeURIComponent('/' + destination.replace('.html', ''))}`;
}

export function loadProfile(state) {
  const { name, degree, year } = getStoredProfile();
  if (!degree || !year) {
    redirectToProfileSetup('counsellor.html');
    return false;
  }

  state.userProfile = { name: name || 'Student', degree, year };

  const badge = getEl('userBadge');
  const dropdownName = getEl('dropdownName');
  const dropdownDegree = getEl('dropdownDegree');
  const dropdownYear = getEl('dropdownYear');

  if (badge) badge.textContent = `User: ${name}`;
  if (dropdownName) dropdownName.textContent = name;
  if (dropdownDegree) dropdownDegree.textContent = degree;
  if (dropdownYear) dropdownYear.textContent = year;
  return true;
}

export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

export function sanitizeHTML(unsafeHtml) {
  return DOMPurify.sanitize(String(unsafeHtml ?? ''), {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input', 'textarea', 'select', 'option', 'img', 'video', 'audio', 'source', 'picture'],
    FORBID_ATTR: ['style'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/(?!\/)|#)/i
  });
}

export function renderBotHTML(text) {
  const safeText = String(text ?? '');

  if (typeof marked?.parse === 'function') {
    return sanitizeHTML(marked.parse(safeText));
  }

  const escaped = escapeHTML(safeText)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>');
  return '<p>' + escaped + '</p>';
}

export function appendMessage(state, role, text) {
  const container = getEl('chatMessages');
  if (!container) return;

  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const avatar = document.createElement('div');
  avatar.className = `msg-avatar ${role}`;
  avatar.textContent = role === 'bot' ? '🤖' : (state.userProfile.name ? state.userProfile.name.charAt(0).toUpperCase() : 'U');

  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;

  if (role === 'user') {
    msgDiv.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = text;
    msgDiv.appendChild(p);
  } else {
    msgDiv.innerHTML = '';
    const cleanHtml = sanitizeHTML(renderBotHTML(text));
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, 'text/html');
    while (doc.body.firstChild) {
      msgDiv.appendChild(doc.body.firstChild);
    }
  }

  row.appendChild(avatar);
  row.appendChild(msgDiv);
  container.appendChild(row);

  // Auto-scroll
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

export function setCaptchaStatus(message, tone) {
  const statusEl = getEl('captchaStatus');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.style.color = tone === 'error' ? 'var(--danger)' : tone === 'ok' ? 'var(--success)' : 'var(--text)';
}

export function toggleDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = getEl('userDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

export function logoutUser(state) {
  localStorage.removeItem('sb_name');
  localStorage.removeItem('sb_email');
  localStorage.removeItem('sb_degree');
  localStorage.removeItem('sb_year');
  localStorage.removeItem(RATE_LIMIT_KEY);
  clearHumanProof(state);
  window.location.href = '/';
}

export function updateUsageLimitCard() {
  const limitCountEl = getEl('limitCount');
  const limitBarEl = getEl('limitBar');
  const limitResetEl = getEl('limitReset');

  if (!limitCountEl || !limitBarEl || !limitResetEl) return;

  let count = 0;
  let windowStart = Date.now();

  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        count = Number.parseInt(parsed.count, 10) || 0;
        windowStart = Number.parseInt(parsed.windowStart, 10) || Date.now();
      }
    }
  } catch (err) {
    console.warn('Could not read rate limit for UI:', err);
  }

  const RATE_LIMIT_MAX = 100;
  const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
  const now = Date.now();

  if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
    count = 0;
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX - count);
  limitCountEl.textContent = `${remaining} / ${RATE_LIMIT_MAX}`;

  const percent = Math.min(100, Math.max(0, (remaining / RATE_LIMIT_MAX) * 100));
  limitBarEl.style.width = `${percent}%`;

  limitBarEl.classList.remove('green', 'warning', 'danger');
  if (remaining >= 10) {
    limitBarEl.classList.add('green');
  } else if (remaining >= 5) {
    limitBarEl.classList.add('warning');
  } else {
    limitBarEl.classList.add('danger');
  }

  if (count === 0) {
    limitResetEl.textContent = 'Timer starts on first message';
  } else {
    const msLeft = (windowStart + RATE_LIMIT_WINDOW_MS) - now;
    if (msLeft <= 0) {
      limitResetEl.textContent = 'Resets soon';
    } else {
      const minsLeft = Math.floor(msLeft / 60000);
      const secsLeft = Math.floor((msLeft % 60000) / 1000);
      limitResetEl.textContent = `Resets in ${minsLeft}m ${secsLeft}s`;
    }
  }
}
