'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeInternalPath } from '@/utils/shared/routes';
import { useAuth } from '../components/AuthProvider';
import styles from './onboarding.module.css';

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = normalizeInternalPath(searchParams.get('next'), '/quiz');
  const editMode = searchParams.get('edit') === '1';
  const { user, profile, authLoading, profileLoading, isProfileComplete, saveProfile } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/auth?next=${encodeURIComponent(next)}`);
      return;
    }

    if (!authLoading && !profileLoading && isProfileComplete && !editMode) {
      router.replace(next);
    }
  }, [authLoading, editMode, isProfileComplete, next, profileLoading, router, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const degree = String(formData.get('degree') || '').trim();
    const year = String(formData.get('year') || '').trim();
    const interest = String(formData.get('interest') || '').trim();

    if (!name || !degree || !year) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveProfile({ name, degree, year, interest });
      router.replace(next);
    } catch (saveError) {
      console.error('Failed to save Firebase profile:', saveError);
      setError('Could not save your profile. Please check Firebase setup and try again.');
      setSaving(false);
    }
  }

  if (authLoading || profileLoading || !profile.hydrated || !user || (isProfileComplete && !editMode)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={`welcome-bunny ${styles.welcomeBunny}`}>🐰</div>
        <p className={styles.loadingText}>Setting things up...</p>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div className={styles.bunnyLarge}>🐰</div>
        <h1 className={styles.title}>
          Welcome there!
        </h1>
        <p className={styles.subtitle}>
          Tell us a little about yourself so SkillBun can personalize your career guidance.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name *</label>
          <input name="name" type="text" defaultValue={profile.hasName ? profile.name : ''} required placeholder="Enter your first name" className={`form-control ${styles.inputControl}`} />
        </div>
        <div className="form-group">
          <label>Degree / Program *</label>
          <select name="degree" defaultValue={profile.degree} required>
            <option value="">Select your degree</option>
            <option value="BCA – Bachelor of Computer Applications">BCA – Bachelor of Computer Applications</option>
            <option value="B.Tech – Computer Science">B.Tech – Computer Science</option>
            <option value="B.Tech – Information Technology">B.Tech – Information Technology</option>
            <option value="BS – Artificial Intelligence and Cyber Security">BS – Artificial Intelligence and Cyber Security</option>
            <option value="BS-MS – Artificial Intelligence and Cyber Security">BS-MS – Artificial Intelligence and Cyber Security</option>
            <option value="BS – Computer Science and Data Analytics">BS – Computer Science and Data Analytics</option>
            <option value="BS-MS – Computer Science and Data Analytics">BS-MS – Computer Science and Data Analytics</option>
            <option value="Other Engineering">Other Engineering</option>
          </select>
        </div>

        <div className="form-group">
          <label>Current Year *</label>
          <select name="year" defaultValue={profile.year} required>
            <option value="">Select year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="Graduated / Working">Graduated / Working</option>
          </select>
        </div>

        <div className="form-group">
          <label>Area of Interest (Optional)</label>
          <select name="interest" defaultValue={profile.interest || ''}>
            <option value="">Choose an area that excites you</option>
            <option value="Web Development">🌐 Web Development</option>
            <option value="AI / Machine Learning">🤖 AI / Machine Learning</option>
            <option value="Mobile App Development">📱 Mobile App Development</option>
            <option value="Data Science">📊 Data Science</option>
            <option value="Cybersecurity">🔐 Cybersecurity</option>
            <option value="Cloud Computing">☁️ Cloud Computing</option>
            <option value="UI/UX Design">🎨 UI/UX Design</option>
            <option value="Not sure yet">🤔 Not sure yet – help me explore!</option>
          </select>
        </div>

        <button type="submit" className={`btn-form ${styles.btnSubmit}`} disabled={saving}>
          {saving ? '💾 Saving...' : '🚀 Let\'s Get Started!'}
        </button>

        {error && (
          <p className={`auth-message error ${styles.errorMsg}`}>{error}</p>
        )}

        <p className={styles.footerNote}>
          This helps our AI quiz and counsellor give you personalized advice. You can update this anytime.
        </p>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={`welcome-bunny ${styles.welcomeBunny}`}>🐰</div>
        <p className={styles.loadingText}>Setting things up...</p>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
