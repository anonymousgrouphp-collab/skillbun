'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import WorkspaceSidebar from '../components/WorkspaceSidebar';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    profile,
    authLoading,
    profileLoading,
    isProfileComplete,
    resetPassword,
    resendVerification,
    deleteAccount,
  } = useAuth();

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Authentication gate redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth?next=/settings');
      return;
    }

    if (!authLoading && !profileLoading && user && !isProfileComplete) {
      router.replace('/onboarding?next=/settings');
    }
  }, [authLoading, isProfileComplete, profileLoading, router, user]);

  if (authLoading || profileLoading || !profile.hydrated || !user || !isProfileComplete) {
    return (
      <div style={{ opacity: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
        Loading Settings...
      </div>
    );
  }

  // Determine auth provider (Google vs Password)
  const isGoogle = Array.isArray(profile.providers) && profile.providers.includes('google.com');
  const providerLabel = isGoogle ? 'Google Account' : 'Email & Password';

  async function handlePasswordReset() {
    setError('');
    setStatus('');
    setLoading(true);

    try {
      await resetPassword(user.email);
      setStatus('Password reset email sent. Please check your inbox.');
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a bit before trying again.');
      } else {
        setError(err.message || 'Could not send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    setError('');
    setStatus('');
    setLoading(true);

    try {
      await resendVerification();
      setStatus('Verification email sent successfully.');
    } catch (err) {
      setError(err.message || 'Could not send verification email.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setError('');
    setStatus('');
    setLoading(true);
    setShowDeleteModal(false);

    try {
      await deleteAccount();
      // On success, AuthProvider signs out and redirects to homepage
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        setError('🔒 Security check: Please log out and log back in, then immediately delete your account.');
      } else {
        setError(err.message || 'Could not delete your account. Please try again.');
      }
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.bgGridOverlay} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.board}>
          <WorkspaceSidebar active="settings" title="Settings" status="SETTINGS.ONLINE" kicker="SkillBun Settings" />

          <div className={styles.mainColumn}>
            {/* Account Details Panel */}
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Account details</h2>
                <p>Manage your account credentials and verification status</p>
              </div>

              <div className={styles.section}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>Email Address</span>
                    <span className={styles.infoValue}>{user.email}</span>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>Sign-in Provider</span>
                    <span className={styles.infoValue}>{providerLabel}</span>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>Verification Status</span>
                    <span className={styles.infoValue}>
                      {user.emailVerified ? (
                        <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeUnverified}`}>Unverified</span>
                      )}
                    </span>
                  </div>
                </div>

                {!user.emailVerified && (
                  <button
                    type="button"
                    className={styles.resendLink}
                    onClick={handleResendVerification}
                    disabled={loading}
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </article>

            {/* Security Settings Panel */}
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Security & Sign-in</h2>
                <p>Update your password and manage credentials</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Change Password</h3>
                {isGoogle ? (
                  <p className={styles.dangerText} style={{ color: 'var(--muted)' }}>
                    Your account is connected via Google. To change your password, please manage it in your Google Account settings.
                  </p>
                ) : (
                  <>
                    <p className={styles.dangerText} style={{ color: 'var(--muted)' }}>
                      Request a secure password reset link sent to your registered email address.
                    </p>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={handlePasswordReset}
                      disabled={loading}
                    >
                      Send Password Reset Email
                    </button>
                  </>
                )}
              </div>
            </article>

            {/* Danger Zone Panel */}
            <article className={`${styles.panel} ${styles.dangerPanel}`}>
              <div className={styles.panelHeader}>
                <h2 className={styles.dangerTitle}>Danger Zone</h2>
                <p>Permanently delete your account and progress data</p>
              </div>

              <div className={styles.section}>
                <p className={styles.dangerText}>
                  Permanently delete your SkillBun profile, career quiz results, and all saved roadmap progress. This action is irreversible.
                </p>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={() => setShowDeleteModal(true)}
                  disabled={loading}
                >
                  Delete Account
                </button>
              </div>
            </article>

            {/* Alert Messages */}
            {(status || error) && (
              <div className={`${styles.message} ${error ? styles.messageError : styles.messageOk}`} role="status">
                {error || status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal Confirmation */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete your account permanently?</h3>
            <p>
              Are you absolutely sure? All your progress, career quiz recommendations, roadmap completion nodes, and profile data will be permanently wiped out. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleDeleteAccount}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
