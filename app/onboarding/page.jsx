'use client';
import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function OnboardingForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/quiz';

  const [user, setUser] = useState(null);
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [interest, setInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/');
        return;
      }
      setUser(user);

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile && profile.degree && profile.current_year) {
        // Profile already complete, sync to localStorage and redirect
        syncToLocalStorage(user, profile);
        router.replace(next);
        return;
      }
      setLoading(false);
    }
    checkUser();
  }, [next, router, supabase]);

  function syncToLocalStorage(user, profile) {
    localStorage.setItem('sb_name', user.user_metadata?.full_name || '');
    localStorage.setItem('sb_email', user.email || '');
    localStorage.setItem('sb_degree', profile.degree || '');
    localStorage.setItem('sb_year', profile.current_year || '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!degree || !year) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    // Auto-detect analytics data
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const referral = document.referrer || 'direct';

    const profileData = {
      user_id: user.id,
      full_name: user.user_metadata?.full_name || '',
      email: user.email || '',
      degree: degree,
      current_year: year,
      interest_area: interest || null,
      browser,
      os,
      device_type: deviceType,
      screen_resolution: screenRes,
      referral_source: referral,
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(profileData, { onConflict: 'user_id' });

    if (error) {
      console.error('Profile save error:', error);
      alert('Could not save profile. Please try again.');
      setSaving(false);
      return;
    }

    // Sync to localStorage for quiz.js/counsellor.js backward compatibility
    syncToLocalStorage(user, profileData);

    router.replace(next);
  }

  if (loading) {
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
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', color: 'var(--green)', marginBottom: '0.5rem' }}>
          Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6 }}>
          Tell us a little about yourself so SkillBun can personalize your career guidance.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Degree / Program *</label>
          <select value={degree} onChange={(e) => setDegree(e.target.value)} required>
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
          <select value={year} onChange={(e) => setYear(e.target.value)} required>
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
          <select value={interest} onChange={(e) => setInterest(e.target.value)}>
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
