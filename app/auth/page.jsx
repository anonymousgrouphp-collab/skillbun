'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { normalizeInternalPath } from '@/utils/shared/routes';

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

    setSubmitting(true);

    try {
      await resetPassword(email.trim());
      setStatus('Password reset email sent.');
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
          <div className="auth-bunny" aria-hidden="true">ðŸ°</div>
          <p className="section-label">SkillBun Account</p>
          <h1 id="auth-title">{title}</h1>
          <p>{helperText}</p>
          <div className="auth-flow-tags" aria-label="SkillBun account flow">
            <span>Login</span>
            <span>Profile</span>
            <span>Quiz</span>
            <span>Roadmaps</span>
          </div>
        </div>

        <div className="auth-panel">
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
            <button type="button" className="auth-link-button" onClick={handlePasswordReset} disabled={!configured || submitting}>
              Send password reset email
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
