import { syncPosthogConsent } from './utils/client/analyticsConsent';
syncPosthogConsent();
if (typeof window !== 'undefined') {
  window.addEventListener('sb_consent_updated', syncPosthogConsent);
  window.addEventListener('storage', syncPosthogConsent);
}


