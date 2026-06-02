'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { normalizeInternalPath } from '@/utils/shared/routes';

const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;
const PASSWORD_RESET_COOLDOWN_KEY = 'sb_password_reset_available_at';

function readPasswordResetAvailableAt() {
  if (typeof window === 'undefined') {
    return 0;
  }

  const availableAt = Number(window.localStorage.getItem(PASSWORD_RESET_COOLDOWN_KEY) || 0);
  return Number.isFinite(availableAt) ? availableAt : 0;
}

function friendlyAuthError(error) {
  const code = error?.code || '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
    return 'That email or password does not match a SkillBun account.';
  }

  if (code.includes('auth/email-already-in-use')) {
    return 'That email already has an account. Try logging in instead.';
  }

  if (code.includes('auth/weak-password')) {
    return 'Use a password with at least 6 characters.';
  }

  if (code.includes('auth/popup-closed-by-user')) {
    return 'The Google sign-in window was closed before finishing.';
  }

  if (code.includes('auth/unauthorized-domain')) {
    return 'This domain is not authorized in Firebase Authentication settings.';
  }

  if (code.includes('auth/too-many-requests')) {
    return 'Too many attempts. Wait a bit before trying again.';
  }

  return error?.message || 'Something went wrong. Please try again.';
}

function buildOnboardingPath(next) {
  return `/onboarding?next=${encodeURIComponent(next)}`;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = normalizeInternalPath(searchParams.get('next'), '/dashboard');
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const {
    configured,
    user,
    authLoading,
    profileLoading,
    isProfileComplete,
    authError,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    resendVerification,
  } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [resetCooldownSeconds, setResetCooldownSeconds] = useState(0);

  const title = mode === 'signup' ? 'Create your SkillBun account' : 'Welcome back to SkillBun';
  const actionLabel = mode === 'signup' ? 'Create account' : 'Log in';
  const switchCopy = mode === 'signup' ? 'Already have an account?' : 'New to SkillBun?';
  const switchLabel = mode === 'signup' ? 'Log in' : 'Sign up';

  useEffect(() => {
    if (authLoading || profileLoading || !user) {
      return;
    }

    router.replace(isProfileComplete ? next : buildOnboardingPath(next));
  }, [authLoading, isProfileComplete, next, profileLoading, router, user]);

  useEffect(() => {
    const updateResetCooldown = () => {
      const availableAt = readPasswordResetAvailableAt();
      const nextCooldownSeconds = Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));

      setResetCooldownSeconds(nextCooldownSeconds);

      if (nextCooldownSeconds === 0 && availableAt > 0) {
        window.localStorage.removeItem(PASSWORD_RESET_COOLDOWN_KEY);
      }
    };

    updateResetCooldown();
    const intervalId = window.setInterval(updateResetCooldown, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const helperText = useMemo(() => {
    if (!configured) {
      return 'Firebase is not configured yet. Add the NEXT_PUBLIC_FIREBASE_* values to your environment before using login.';
    }

    if (mode === 'signup') {
      return 'We will send a verification email, but you can continue setting up SkillBun right away.';
    }

    return 'Use Google or email to continue your quiz, roadmap, and dashboard on any device.';
  }, [configured, mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const formData = new FormData(event.currentTarget);
    const formEmail = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    if (!formEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(formEmail, password);
        setStatus('Verification email sent. Setting up your profile...');
      } else {
        await signInWithEmail(formEmail, password);
        setStatus('Logged in. Loading your SkillBun profile...');
      }
    } catch (authSubmitError) {
      setError(friendlyAuthError(authSubmitError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setStatus('');
    setSubmitting(true);

    try {
      await signInWithGoogle();
      setStatus('Google sign-in complete. Loading your SkillBun profile...');
    } catch (googleError) {
      setError(friendlyAuthError(googleError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setError('');
    setStatus('');

    if (!email.trim()) {
      setError('Enter your email first, then request a reset link.');
      return;
    }

    if (resetCooldownSeconds > 0) {
      setError(`Please wait ${resetCooldownSeconds} seconds before requesting another reset email.`);
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(email.trim());
      const availableAt = Date.now() + PASSWORD_RESET_COOLDOWN_MS;
      window.localStorage.setItem(PASSWORD_RESET_COOLDOWN_KEY, String(availableAt));
      setResetCooldownSeconds(Math.ceil(PASSWORD_RESET_COOLDOWN_MS / 1000));
      setStatus('Password reset email sent. You can request another in 60 seconds.');
    } catch (resetError) {
      setError(friendlyAuthError(resetError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setError('');
    setStatus('');
    setSubmitting(true);

    try {
      await resendVerification();
      setStatus('Verification email sent again.');
    } catch (verificationError) {
      setError(friendlyAuthError(verificationError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="auth-title">
        <div className="auth-copy">
          <div className="auth-bunny" aria-hidden="true">
            <Image src="/logo.png" alt="" width={58} height={58} priority />
          </div>
          <p className="section-label">SkillBun Account</p>
          <h1 id="auth-title">{title}</h1>
          <p>{helperText}</p>
          <div className="auth-flow-tags" aria-label="SkillBun account flow">
            <span>Login</span>
            <span>Profile</span>
            <span>Quiz</span>
            <span>Roadmaps</span>
          </div>
          <div className="auth-path-panel" aria-label="What SkillBun restores after login">
            <div className="auth-path-step">
              <span>01</span>
              <strong>Profile context</strong>
              <p>Keep your interests, strengths, and study preferences ready.</p>
            </div>
            <div className="auth-path-step">
              <span>02</span>
              <strong>Adaptive quiz</strong>
              <p>Continue from the same career signals across devices.</p>
            </div>
            <div className="auth-path-step">
              <span>03</span>
              <strong>Roadmap progress</strong>
              <p>Return to saved skills, milestones, and Bun-Bot guidance.</p>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-header">
            <span>Account checkpoint</span>
            <strong>{mode === 'signup' ? 'Start your SkillBun flow' : 'Resume your SkillBun flow'}</strong>
          </div>
          <div className="auth-mode-toggle" role="tablist" aria-label="Choose login or signup">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
              role="tab"
              aria-selected={mode === 'login'}
            >
              Log In
            </button>
            <button
              type="button"
              className={mode === 'signup' ? 'active' : ''}
              onClick={() => setMode('signup')}
              role="tab"
              aria-selected={mode === 'signup'}
            >
              Sign Up
            </button>
          </div>

          <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={!configured || submitting}>
            <span aria-hidden="true">G</span>
            Continue with Google
          </button>

          <div className="auth-divider"><span>or</span></div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
              />
            </div>

            <button type="submit" className="btn-form" disabled={!configured || submitting}>
              {submitting ? 'Please wait...' : actionLabel}
            </button>
          </form>

          {mode === 'login' && (
            <button
              type="button"
              className="auth-link-button"
              onClick={handlePasswordReset}
              disabled={!configured || submitting || resetCooldownSeconds > 0}
            >
              {resetCooldownSeconds > 0 ? `Send again in ${resetCooldownSeconds}s` : 'Send password reset email'}
            </button>
          )}

          {user && !user.emailVerified && (
            <button type="button" className="auth-link-button" onClick={handleResendVerification} disabled={!configured || submitting}>
              Resend verification email
            </button>
          )}

          {(status || error || authError) && (
            <div className={`auth-message ${error || authError ? 'error' : 'ok'}`} role="status">
              {error || authError || status}
            </div>
          )}

          <p className="auth-switch">
            {switchCopy}{' '}
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
              {switchLabel}
            </button>
          </p>

          <Link href="/" className="auth-home-link">Back to homepage</Link>
        </div>

        <div className="auth-mini-console" aria-hidden="true">
          <span>next</span>
          <strong>{next}</strong>
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="auth-page">
        <div className="auth-loading">Loading SkillBun login...</div>
      </main>
    }>
      <AuthForm />
    </Suspense>
  );
}
