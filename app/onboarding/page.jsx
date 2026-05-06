'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { normalizeInternalPath } from '@/utils/shared/routes';
import { useAuth } from '../components/AuthProvider';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="welcome-bunny" style={{ fontSize: '3rem' }}>🐰</div>
        <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Setting things up...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🐰</div>
        <h1 style={{ fontFamily: 'var(--font-fredoka), cursive', fontSize: '2rem', color: 'var(--green)', marginBottom: '0.5rem' }}>
          Welcome there!
        </h1>
        <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6 }}>
          Tell us a little about yourself so SkillBun can personalize your career guidance.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name *</label>
          <input name="name" type="text" defaultValue={profile.hasName ? profile.name : ''} required placeholder="Enter your first name" className="form-control" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1rem', marginBottom: '1rem' }} />
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

        <button type="submit" className="btn-form" disabled={saving} style={{ marginTop: '1rem', fontSize: '1.05rem', padding: '1rem' }}>
          {saving ? '💾 Saving...' : '🚀 Let\'s Get Started!'}
        </button>

        {error && (
          <p className="auth-message error" style={{ marginTop: '1rem' }}>{error}</p>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
          This helps our AI quiz and counsellor give you personalized advice. You can update this anytime.
        </p>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="welcome-bunny" style={{ fontSize: '3rem' }}>🐰</div>
        <p style={{ color: 'var(--muted)', fontWeight: 700 }}>Setting things up...</p>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
