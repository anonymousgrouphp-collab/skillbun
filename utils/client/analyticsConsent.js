'use client';

import posthog from 'posthog-js';

export const CONSENT_STORAGE_KEY = 'sb_consent_choice';
export function getConsentChoice() {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(CONSENT_STORAGE_KEY); } catch { return null; }
}
export function hasAnalyticsConsent() {
  return getConsentChoice() === 'accepted';
}

let initialized = false;
export function syncPosthogConsent() {
  const accepted = hasAnalyticsConsent();
  if (!accepted) {
    if (initialized) { posthog.opt_out_capturing(); posthog.reset(); }
    return;
  }
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || !host) return;
  if (!initialized) {
    posthog.init(token, {
      api_host: host, defaults: '2026-01-30', capture_pageview: false,
      capture_exceptions: false, autocapture: false, disable_session_recording: true,
      // Do not include email/reference/token query parameters in page metadata.
      before_send: (event) => {
        if (!hasAnalyticsConsent()) return null;
        if (event?.properties?.$current_url) {
          try { const url = new URL(event.properties.$current_url); event.properties.$current_url = url.origin + url.pathname; } catch { delete event.properties.$current_url; }
        }
        return event;
      },
    });
    initialized = true;
  }
  posthog.opt_in_capturing({ captureEventName: false });
}
