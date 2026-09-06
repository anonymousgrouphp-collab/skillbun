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
    <aside
      className={styles.bannerOverlay}
      role="dialog"
      aria-label="Privacy & Cookie Preferences"
      aria-describedby="cookie-consent-desc"
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.cookieIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
                <path d="M11 17v.01" />
                <path d="M7 13v.01" />
              </svg>
            </span>
            <h4 className={styles.title}>Cookie &amp; Privacy</h4>
          </div>
          <button
            onClick={handleDecline}
            className={styles.closeBtn}
            type="button"
            aria-label="Decline and dismiss cookie notice"
            title="Decline non-essential cookies"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p id="cookie-consent-desc" className={styles.text}>
          SkillBun uses cookies &amp; aggregated analytics to personalize roadmaps and track learning progress. We never sell student data.
        </p>

        <div className={styles.complianceRow}>
          <span className={styles.complianceNote}>GDPR, CCPA &amp; DPDP Compliant</span>
          <span className={styles.dot}>•</span>
          <Link href="/privacy" className={styles.complianceLink}>
            Privacy Policy
          </Link>
        </div>

        <div className={styles.actions}>
          <button onClick={handleAccept} className={styles.acceptBtn} type="button">
            Accept
          </button>
          <button onClick={handleDecline} className={styles.declineBtn} type="button">
            Decline
          </button>
        </div>
      </div>
    </aside>
  );
}
