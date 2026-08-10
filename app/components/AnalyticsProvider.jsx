'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import posthog from 'posthog-js';
import { trackPageView, identifyUser } from '@/lib/analytics';
import { useAuth } from './AuthProvider';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const identifiedUserId = useRef(null);

  // Track Page Views on route change
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    trackPageView(url);
  }, [pathname, searchParams]);

  // Firebase restores authentication on refresh and emits this callback after sign-in.
  // PostHog persists the identity, so only synchronize when the authenticated account changes.
  useEffect(() => {
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
  }, [auth?.user]);

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

      {children}
    </>
  );
}

export default AnalyticsProvider;
