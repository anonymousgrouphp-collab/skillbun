'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import styles from './admin.module.css';

export default function AdminRootPage() {
  const { user, authLoading } = useAuth();
  const targetAdminEmail = 'harsh@skillbun.tech';
  const userEmail = (user?.email || '').toLowerCase().trim();

  const isAuthorizedAdmin = userEmail === targetAdminEmail || userEmail === 'admin@skillbun.tech';

  if (authLoading) {
    return (
      <div className={styles.adminContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐰</div>
          <p style={{ fontSize: '1.1rem' }}>Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorizedAdmin) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.authGateCard}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ fontFamily: 'var(--font-fredoka), sans-serif', color: 'var(--text)', marginBottom: '0.75rem' }}>
            SkillBun Command Center
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            This internal portal is restricted to authorized platform administrators ({targetAdminEmail}).
          </p>
          <Link
            href="/auth?next=/admin"
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
            Sign In with Admin Account
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
            <span className={styles.securityPill}>🛡️ Master Admin</span>
          </div>
          <p className={styles.subtitle}>
            Unified operations console for workforce onboarding, student telemetry CRM, retention automations, and credential issuance.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard" className={styles.actionBtnSecondary}>
            ← Student Dashboard
          </Link>
          <Link href="/portal" className={styles.actionBtnSecondary}>
            💼 Intern Portal
          </Link>
        </div>
      </div>

      {/* Main Admin Module Hubs */}
      <div className={styles.hubGrid}>
        {/* Module 1: Workforce Hub */}
        <Link href="/admin/workforce" className={styles.hubCard}>
          <div>
            <div className={styles.hubCardHeader}>
              <div className={`${styles.hubIconBox} ${styles.hubIconBlue}`}>👥</div>
              <div>
                <h3 className={styles.hubCardTitle}>Workforce & Intern Hub</h3>
                <p className={styles.hubCardDesc}>
                  Manage intern onboarding pipeline, automated 4-page offer letters, contract countdowns, and sprint tasks.
                </p>
              </div>
            </div>

            <ul className={styles.hubFeaturesList}>
              <li className={styles.hubFeatureItem}>📄 <strong>1-Click Offer Pack:</strong> 4-Page PDF generated via pdf-lib</li>
              <li className={styles.hubFeatureItem}>✉️ <strong>Zoho Email Dispatch:</strong> Automated dispatch with PDF attachment</li>
              <li className={styles.hubFeatureItem}>⏳ <strong>Tenure Monitor:</strong> Amber alerts for contracts ending $\le 10$ days</li>
              <li className={styles.hubFeatureItem}>🎯 <strong>Sprint Milestones:</strong> Task assignment and deliverable reviews</li>
            </ul>
          </div>

          <div className={styles.hubCardFooter}>
            <span>Open Workforce Hub</span>
            <span>→</span>
          </div>
        </Link>

        {/* Module 2: Analytics & CRM */}
        <Link href="/admin/analytics" className={styles.hubCard}>
          <div>
            <div className={styles.hubCardHeader}>
              <div className={`${styles.hubIconBox} ${styles.hubIconGreen}`}>📊</div>
              <div>
                <h3 className={styles.hubCardTitle}>Student Analytics & CRM</h3>
                <p className={styles.hubCardDesc}>
                  Live student database, learning telemetry, exam readiness tracking, and targeted email automations.
                </p>
              </div>
            </div>

            <ul className={styles.hubFeaturesList}>
              <li className={styles.hubFeatureItem}>👤 <strong>User Telemetry:</strong> Profiles, roadmap nodes & study history</li>
              <li className={styles.hubFeatureItem}>✉️ <strong>Retention Engine:</strong> 15 smart marketing & nudge templates</li>
              <li className={styles.hubFeatureItem}>🎯 <strong>Smart Recommender:</strong> Context-aware email recommendations</li>
              <li className={styles.hubFeatureItem}>🗑️ <strong>User Management:</strong> Secure user purge & data cleanup</li>
            </ul>
          </div>

          <div className={styles.hubCardFooter}>
            <span>Open Analytics & CRM</span>
            <span>→</span>
          </div>
        </Link>

        {/* Module 3: Credentials Registry */}
        <Link href="/admin/analytics?tab=certs" className={styles.hubCard}>
          <div>
            <div className={styles.hubCardHeader}>
              <div className={`${styles.hubIconBox} ${styles.hubIconPurple}`}>📜</div>
              <div>
                <h3 className={styles.hubCardTitle}>Credentials & Verification</h3>
                <p className={styles.hubCardDesc}>
                  Tamper-proof digital credentials registry for Roadmap, Internship, Training, and Recommendation letters.
                </p>
              </div>
            </div>

            <ul className={styles.hubFeaturesList}>
              <li className={styles.hubFeatureItem}>🎓 <strong>Multi-Type Certs:</strong> Roadmap, Internship, Training & LOR</li>
              <li className={styles.hubFeatureItem}>🔒 <strong>Public Verification:</strong> Verified link at <code>/certificate/[id]</code></li>
              <li className={styles.hubFeatureItem}>🚫 <strong>Revocation Control:</strong> 1-click credential revocation</li>
              <li className={styles.hubFeatureItem}>💼 <strong>LinkedIn Integration:</strong> 1-click Add to Profile sync</li>
            </ul>
          </div>

          <div className={styles.hubCardFooter}>
            <span>View Certificate Registry</span>
            <span>→</span>
          </div>
        </Link>
      </div>

      {/* Security & Access Status Banner */}
      <div className={styles.statusBanner}>
        <div className={styles.statusDetails}>
          <div className={styles.statusIcon}>🔐</div>
          <div>
            <div className={styles.statusTitle}>Master Administrator Access Active</div>
            <p className={styles.statusMeta}>
              Signed in as <strong>{userEmail}</strong>. Protected by Firebase Auth token verification, server-side RBAC, and rate limiting.
            </p>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
            System Status: 100% Operational
          </span>
        </div>
      </div>
    </div>
  );
}
