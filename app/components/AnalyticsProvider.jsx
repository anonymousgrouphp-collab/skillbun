'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import { hasAnalyticsConsent } from '@/utils/client/analyticsConsent';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import posthog from 'posthog-js';
import { trackPageView, identifyUser } from '@/lib/analytics';
import { useAuth } from './AuthProvider';
import ConsentBanner, { getConsentChoice } from './ConsentBanner';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const identifiedUserId = useRef(null);
  const [consentGranted, setConsentGranted] = useState(false);

  // Sync consent state on mount and when changed
  useEffect(() => {
    const checkConsent = () => {
      setConsentGranted(getConsentChoice() === 'accepted');
    };

    checkConsent();

    const handleConsentUpdate = (e) => {
      setConsentGranted(e?.detail?.status === 'accepted');
    };

    window.addEventListener('sb_consent_updated', handleConsentUpdate);
    return () => window.removeEventListener('sb_consent_updated', handleConsentUpdate);
  }, []);

  // Track Page Views on route change — strictly guarded by consent
  useEffect(() => {
    if (!pathname || !consentGranted) return;
    const url = pathname;
    trackPageView(url);
  }, [pathname, searchParams, consentGranted]);

  // Synchronize identity to PostHog — strictly guarded by consent
  useEffect(() => {
    if (!consentGranted) return;

    const user = auth?.user;

    if (user?.uid) {
      if (identifiedUserId.current && identifiedUserId.current !== user.uid) {
        posthog.reset();
      }

      if (identifiedUserId.current !== user.uid) {
        const personProperties = {};
        // Contact details are not analytics properties.
        identifyUser(user.uid, personProperties);
        identifiedUserId.current = user.uid;
      }
      return;
    }

    if (identifiedUserId.current) {
      posthog.reset();
      identifiedUserId.current = null;
    }
  }, [auth?.user, consentGranted]);

  return null;
}

export function AnalyticsProvider({ children, nonce }) {
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const sync = () => {
      const consent = hasAnalyticsConsent();
      window['ga-disable-G-XTFMS5Q59C'] = !consent;
      setAccepted(consent);
    };
    sync();
    window.addEventListener('sb_consent_updated', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('sb_consent_updated', sync); window.removeEventListener('storage', sync); };
  }, []);
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {accepted && <GoogleAnalytics gaId="G-XTFMS5Q59C" nonce={nonce} />}
      {accepted && <Analytics beforeSend={(event) => hasAnalyticsConsent() ? event : null} />}
      {accepted && <SpeedInsights beforeSend={(event) => hasAnalyticsConsent() ? event : null} />}

      {/* Consent gate banner for DPDP Act 2023 & GDPR compliance */}
      <ConsentBanner />

      {children}
    </>
  );
}

export default AnalyticsProvider;
