'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
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
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
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
        if (user.email) personProperties.email = user.email;
        if (user.displayName) personProperties.name = user.displayName;
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

export function AnalyticsProvider({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* Official Vercel Web Analytics Component */}
      <Analytics />

      {/* Official Vercel Speed Insights Component */}
      <SpeedInsights />

      {/* Vercel Speed Insights & Performance Listener */}
      <Script id="vercel-speed-insights" strategy="afterInteractive">
        {`
          (function(){
            if (typeof window !== 'undefined' && 'performance' in window) {
              window.addEventListener('load', function() {
                setTimeout(function() {
                  var nav = performance.getEntriesByType('navigation')[0];
                  if (nav) {
                    window.gtag && window.gtag('event', 'page_speed_vitals', {
                      domComplete: Math.round(nav.domComplete),
                      loadEventEnd: Math.round(nav.loadEventEnd),
                      duration: Math.round(nav.duration)
                    });
                  }
                }, 0);
              });
            }
          })();
        `}
      </Script>

      {/* Consent gate banner for DPDP Act 2023 & GDPR compliance */}
      <ConsentBanner />

      {children}
    </>
  );
}

export default AnalyticsProvider;
