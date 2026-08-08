'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>

      {/* Google Analytics 4 Injection (If configured) */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {children}
    </>
  );
}

export default AnalyticsProvider;
