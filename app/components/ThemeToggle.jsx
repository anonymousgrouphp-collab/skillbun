'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'sb_theme';
const THEME_CHANGE_EVENT = 'sb_theme_change';
const THEMES = new Set(['light', 'dark']);

function getPreferredTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (THEMES.has(stored)) {
      return stored;
    }
  } catch {
    // Fall through to the site default if storage is unavailable.
  }

  return 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;

  const themeColor = theme === 'dark' ? '#0D1117' : '#F4F7F2';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
}

function getThemeSnapshot() {
  if (typeof document === 'undefined') {
    return 'light';
  }

  const activeTheme = document.documentElement.getAttribute('data-theme');
  return THEMES.has(activeTheme) ? activeTheme : getPreferredTheme();
}

function subscribeToTheme(onStoreChange) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    const nextTheme = THEMES.has(event.newValue) ? event.newValue : getPreferredTheme();
    applyTheme(nextTheme);
    onStoreChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function saveThemePreference(theme) {
  applyTheme(theme);

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The visual theme can still switch for this session.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => 'light');
  const toggle = () => saveThemePreference(theme === 'dark' ? 'light' : 'dark');

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      title={`Switch to ${nextTheme} theme`}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === 'dark'}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-sun">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
          </svg>
        </span>
        <span className="theme-toggle-icon theme-toggle-moon">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M20.2 14.1A7.6 7.6 0 0 1 9.9 3.8 8.3 8.3 0 1 0 20.2 14.1Z" />
          </svg>
        </span>
        <span className="theme-toggle-thumb" />
      </span>
      <span className="theme-toggle-label">{theme === 'dark' ? 'Night' : 'Day'}</span>
    </button>
  );
}
