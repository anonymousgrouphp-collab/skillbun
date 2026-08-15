'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useAdminAccess } from '@/utils/client/adminAuth';
import styles from './admin.module.css';

export default function AdminRootPage() {
  const { user, authLoading } = useAuth();
  const { isAdmin, isFounder, role, checking } = useAdminAccess(user, authLoading);
  const userEmail = (user?.email || '').toLowerCase().trim();

  if (authLoading || checking) {
    return (
      <div className={styles.adminContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ width: 44, height: 44, margin: '0 auto 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <p style={{ fontSize: '1.05rem', fontWeight: '600' }}>Verifying admin authorization...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.authGateCard}>
          <div style={{ width: 56, height: 56, margin: '0 auto 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--text)', marginBottom: '0.75rem' }}>
            SkillBun Command Center
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            This internal operations portal is strictly restricted to authorized platform administrators. Please authenticate with your admin account.
          </p>
          <Link
            href="/auth?next=/dashboard/console/admin"
            style={{
              background: 'var(--green)',
              color: '#000',
              padding: '0.85rem 1.8rem',
              borderRadius: '10px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  // Signed in, but unauthorized
  if (!isAdmin) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.authGateCard} style={{ borderColor: '#ef4444' }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: '#ef4444', marginBottom: '0.75rem' }}>
            403 — Access Denied
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Signed in as <strong>{userEmail}</strong>. You are recognized as a student account and do not have administrative privileges.
          </p>
          <Link
            href="/dashboard"
            style={{
              background: 'var(--surface-raised)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            ← Back to Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <div className={styles.titleBadge}>
            <h1 className={styles.titleText}>SkillBun Admin Command Center</h1>
            {isFounder ? (
              <span className={styles.securityPill}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12l4 6-10 12L2 9l4-6z"/>
                </svg>
                Founder Master Admin
              </span>
            ) : (
              <span className={styles.securityPill}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Authorized {role?.toUpperCase() || 'ADMIN'}
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            Unified operations console for staff & intern workforce management, student telemetry CRM, smart email retention engines, and digital certificate verification.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard" className={styles.actionBtnSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Student Dashboard
          </Link>
          <Link href="/dashboard/console/portal" className={styles.actionBtnSecondary}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Intern Portal
          </Link>
        </div>
      </div>

      {/* Main Admin Module Hubs (Unified 2-Hub Layout) */}
      <div className={styles.hubGrid}>
        {/* Hub 1: Workforce & Intern Hub */}
        <div className={styles.hubCard}>
          <div>
            <div className={styles.hubCardHeader}>
              <div className={`${styles.hubIconBox} ${styles.hubIconBlue}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <h3 className={styles.hubCardTitle}>Workforce & Intern Hub</h3>
                <p className={styles.hubCardDesc}>
                  Manage intern onboarding pipeline, automated 4-page offer letters, contract countdowns, and sprint tasks.
                </p>
              </div>
            </div>

            <ul className={styles.hubFeaturesList}>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>1-Click Offer Pack:</strong> 4-Page PDF generated via pdf-lib</span>
              </li>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Zoho Email Dispatch:</strong> Automated dispatch with PDF attachment</span>
              </li>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Tenure Monitor:</strong> Amber alerts for contracts ending &le; 10 days</span>
              </li>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Sprint Milestones:</strong> Task assignment and deliverable reviews</span>
              </li>
            </ul>
          </div>

          <div className={styles.hubCardFooter}>
            <Link href="/dashboard/console/admin/workforce" className={styles.hubFooterLink}>
              <span>Open Workforce Hub</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>

        {/* Hub 2: Unified Student Analytics, CRM & Credentials Hub */}
        <div className={styles.hubCard}>
          <div>
            <div className={styles.hubCardHeader}>
              <div className={`${styles.hubIconBox} ${styles.hubIconGreen}`}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <div>
                <h3 className={styles.hubCardTitle}>Student Analytics, CRM & Certificates</h3>
                <p className={styles.hubCardDesc}>
                  Live student database, learning telemetry, 15-template retention automations, and verifiable digital certificate registry.
                </p>
              </div>
            </div>

            <ul className={styles.hubFeaturesList}>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>User Telemetry & CRM:</strong> Profiles, roadmap nodes & study history</span>
              </li>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Retention Engine:</strong> 15 smart marketing & nudge templates with auto-shuffler</span>
              </li>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Digital Credentials Registry:</strong> 1-click verification, revocation & LinkedIn sync</span>
              </li>
              <li className={styles.hubFeatureItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Student Controls:</strong> Secure user purge & data cleanup</span>
              </li>
            </ul>
          </div>

          <div className={styles.hubCardFooterSplit}>
            <Link href="/dashboard/console/admin/analytics" className={styles.hubFooterLink}>
              <span>Open Student CRM</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link href="/dashboard/console/admin/analytics?tab=certs" className={styles.hubFooterLinkSecondary}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15l-2 5l4-2l4 2l-2-5"/>
                <circle cx="12" cy="9" r="6"/>
              </svg>
              <span>Certificates Registry</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Security & Access Status Banner */}
      <div className={styles.statusBanner}>
        <div className={styles.statusDetails}>
          <div className={styles.statusIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div>
            <div className={styles.statusTitle}>
              {isFounder ? 'Founder Master Admin Active' : `${role?.toUpperCase() || 'ADMIN'} Privileges Active`}
            </div>
            <p className={styles.statusMeta}>
              Signed in as <strong>{userEmail}</strong>. Protected by Google JWKS token verification, server-side RBAC, and rate limiting.
            </p>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem 0.85rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
            System Status: 100% Operational
          </span>
        </div>
      </div>
    </div>
  );
}
