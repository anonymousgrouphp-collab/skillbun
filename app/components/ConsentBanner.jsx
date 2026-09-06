'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import styles from './ConsentBanner.module.css';

export const CONSENT_STORAGE_KEY = 'sb_consent_choice';

export function getConsentChoice() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function updateAnalyticsConsent(status) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, status);
  } catch {
    // Ignore storage failure
  }

  // 1. Google Analytics Consent Mode v2 Update
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: status === 'accepted' ? 'granted' : 'denied',
      ad_storage: 'denied',
      personalization_storage: 'denied',
    });
  }

  // 2. PostHog Opt-In / Opt-Out
  try {
    if (status === 'accepted') {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  } catch {
    // PostHog might not be initialized
  }

  // Dispatch event so AnalyticsTracker can sync
  window.dispatchEvent(new CustomEvent('sb_consent_updated', { detail: { status } }));
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsentChoice();
    if (!existing) {
      // Delay display slightly so first paint is uninterrupted
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    updateAnalyticsConsent('accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    updateAnalyticsConsent('declined');
    setVisible(false);
  };

  return (
    <aside className={styles.bannerOverlay} role="dialog" aria-label="Privacy & Cookie Consent">
      <div className={styles.content}>
        <h4 className={styles.title}>
          <span>🍪</span> Privacy & Learning Experience Choice
        </h4>
        <p className={styles.text}>
          SkillBun uses essential session cookies to keep you signed in. With your permission, we also use aggregated analytics (PostHog & GA4) to improve student career tracks. We never sell student data or serve third-party ads.
        </p>
        <p className={styles.complianceNote}>
          By clicking <strong>Accept</strong>, you confirm you are 18+ or an enrolled student with guardian consent in accordance with global privacy standards (GDPR, CCPA) and India&apos;s DPDP Act 2023. Read our <Link href="/privacy" className={styles.complianceLink}>Privacy Policy</Link>.
        </p>
        <div className={styles.actions}>
          <button onClick={handleAccept} className={styles.acceptBtn} type="button">
            Accept Analytics
          </button>
          <button onClick={handleDecline} className={styles.declineBtn} type="button">
            Decline Non-Essential
          </button>
        </div>
      </div>
    </aside>
  );
}
