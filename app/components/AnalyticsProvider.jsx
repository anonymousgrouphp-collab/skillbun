'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XTFMS5Q59C';
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_vi8BxTy7vMdhuQn7WSmcQ4n4C2hPqBemqXEGTStm83HJ';
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* Official Vercel Web Analytics Component */}
      <Analytics />

      {/* Official Vercel Speed Insights Component */}
      <SpeedInsights />

      {/* 1. Google Analytics 4 (GA4) Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </Script>

      {/* 2. PostHog Product Analytics Snippet */}
      <Script id="posthog-analytics" strategy="afterInteractive">
        {`
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify_group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1.0)}(document,window.posthog||[]);
          window.posthog.init('${posthogKey}', { api_host: '${posthogHost}', autocapture: true, capture_pageview: true });
        `}
      </Script>

      {/* 3. Vercel Speed Insights & Performance Listener */}
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
