'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import posthog from 'posthog-js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { trackPageView, identifyUser } from '@/lib/analytics';
import { useAuth } from './AuthProvider';

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = useAuth();

  // Track Page Views on route change
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    trackPageView(url);
  }, [pathname, searchParams]);

  // Identify User when Auth state changes
  useEffect(() => {
    if (auth?.user?.uid) {
      identifyUser(auth.user.uid, {
        email: auth.user.email,
        degree: auth.profile?.degree || '',
        year: auth.profile?.year || '',
        interest: auth.profile?.interest || '',
      });
    }
  }, [auth?.user, auth?.profile]);

  return null;
}

export function AnalyticsProvider({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_vi8BxTy7vMdhuQn7WSmcQ4n4C2hPqBemqXEGTStm83HJ';
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

      posthog.init(token, {
        api_host: host,
        person_profiles: 'identified_only',
        capture_pageview: true,
      });
    }
  }, []);

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
