'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useDashboardData } from './dashboardUtils';
import './dashboard.css';

const DONUT_RADIUS = 82;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const MINI_DONUT_RADIUS = 17;
const MINI_DONUT_CIRCUMFERENCE = 2 * Math.PI * MINI_DONUT_RADIUS;
const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const DASHBOARD_PREVIEW_PROFILE = {
  hydrated: true,
  name: 'Aarav Sharma',
  hasName: true,
  degree: 'B.Tech',
  year: '3rd Year',
  interest: 'Frontend Engineering',
};
const DASHBOARD_PREVIEW_DATA = {
  roadmaps: [
    { slug: 'frontend', title: 'Frontend Developer', description: '', total: 42, done: 30, pct: 71, xp: 3000, field: 'web' },
    { slug: 'fullstack', title: 'Full Stack Developer', description: '', total: 38, done: 20, pct: 53, xp: 2000, field: 'web' },
    { slug: 'ai_ml_engineer', title: 'AI/ML Engineer', description: '', total: 27, done: 12, pct: 44, xp: 1200, field: 'ai' },
  ],
  totalXP: 6200,
  totalNodes: 107,
  totalDone: 62,
  overallPct: 58,
  efficiency: 89,
  globalPercentile: 84,
  vibeQuote: { text: 'Preview mode is showing a realistic dashboard snapshot for UI review.', emoji: '🧪' },
  dailyIntel: [
    { icon: '🚀', text: 'Frontend engineers who ship polished interfaces consistently stand out in fresher hiring rounds.' },
    { icon: '📊', text: 'Teams increasingly evaluate portfolio depth, not just DSA scores, for product-facing roles.' },
    { icon: '🌐', text: 'Next.js and TypeScript remain common expectations for modern web internship pipelines.' },
    { icon: '⚡', text: 'Cross-functional builders with UI judgement and roadmap ownership are gaining an edge in campus hiring.' },
  ],
  primaryField: 'web',
  showCelebration: false,
  xpGained: 0,
};

/* ─── Confetti particles ─────────────────────────────────────── */
const CONFETTI_COLORS = ['#2ECC71', '#A8FF3E', '#FFD700', '#58D68D', '#FF6B6B', '#4ECDC4', '#FF9F43', '#A29BFE'];

function generateConfettiParticles(count = 40) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + (Math.random() * 30 - 15);
    const dist = 150 + Math.random() * 250;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      cx: `${Math.cos(rad) * dist}px`,
      cy: `${Math.sin(rad) * dist - 100}px`,
      cr: `${Math.random() * 720 - 360}deg`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${Math.random() * 0.3}s`,
      size: 6 + Math.random() * 8,
    };
  });
}

/* ─── Celebration overlay ────────────────────────────────────── */
function CelebrationOverlay({ xpGained, onDismiss }) {
  const particles = useMemo(() => generateConfettiParticles(40), []);

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="dash-celebrate" onClick={onDismiss}>
      <div className="dash-confetti-container">
        {particles.map(p => (
          <span
            key={p.id}
            className="dash-confetti-particle"
            style={{
              '--cx': p.cx,
              '--cy': p.cy,
              '--cr': p.cr,
              background: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
      <div className="dash-celebrate-content">
        <div className="dash-celebrate-emoji">🎉</div>
        <h2>Level <span>Up!</span></h2>
        <p>You earned +{xpGained} XP since your last visit. Keep grinding!</p>
        <button className="dash-celebrate-dismiss" onClick={onDismiss}>
          Let&apos;s Go! 🚀
        </button>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, authLoading, profileLoading, isProfileComplete, progressVersion } = useAuth();
  const { data, loading } = useDashboardData(progressVersion);
  const [showCeleb, setShowCeleb] = useState(false);
  const [mounted, setMounted] = useState(false);
  const previewParam = searchParams.get('preview');
  const isDashboardPreview = previewParam === 'dashboard'
    && typeof window !== 'undefined'
    && LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
  const activeProfile = isDashboardPreview ? DASHBOARD_PREVIEW_PROFILE : profile;
  const activeData = isDashboardPreview ? DASHBOARD_PREVIEW_DATA : data;
  const hasDashboardAccess = isDashboardPreview || Boolean(user && isProfileComplete);
  const isDashboardLoading = !mounted || (!isDashboardPreview && (authLoading || profileLoading || !user || !isProfileComplete || loading));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeData?.showCelebration) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCeleb(true);
      return;
    }

    setShowCeleb(false);
  }, [activeData?.showCelebration]);

  useEffect(() => {
    if (isDashboardPreview) {
      return;
    }

    if (!authLoading && !user) {
      router.replace('/auth?next=/dashboard');
      return;
    }

    if (!authLoading && !profileLoading && user && !isProfileComplete) {
      router.replace('/onboarding?next=/dashboard');
    }
  }, [authLoading, isDashboardPreview, isProfileComplete, profileLoading, router, user]);

  /* Loading state */
  if (isDashboardLoading) {
    return (
      <div className="dash">
        <div className="dash-loading">
          <div className="dash-loading-spinner" />
          <span className="dash-loading-text">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  /* Empty state — no active roadmaps */
  if (!hasDashboardAccess || !activeData || activeData.roadmaps.length === 0) {
    return (
      <div className="dash">
        <div className="dash-empty">
          <div className="dash-empty-icon">🗺️</div>
          <h2>Your journey starts here</h2>
          <p>
            You haven&apos;t started any roadmaps yet. Take the quiz to discover your career path and begin tracking your progress!
          </p>
          <Link href="/onboarding?next=/quiz" className="dash-empty-cta">
            🎯 Take the Career Quiz
          </Link>
        </div>
      </div>
    );
  }

  const firstName = activeProfile.hasName ? activeProfile.name.split(' ')[0] : 'Student';
  const {
    roadmaps, totalXP, totalDone, totalNodes, overallPct,
    efficiency, globalPercentile, vibeQuote, dailyIntel,
    xpGained,
  } = activeData;

  return (

    <div className="dash-layout">
      {/* Celebration overlay */}
      {showCeleb && (
        <CelebrationOverlay xpGained={xpGained} onDismiss={() => setShowCeleb(false)} />
      )}

      {/* Sidebar */}
      <div className="dash-sidebar">
        <div className="dash-sidebar-menu">
          <div className="dash-sidebar-label">Menu</div>
          <Link href="/dashboard" className="dash-nav-item active">
            <span className="dash-nav-icon">📊</span> Dashboard
          </Link>
          <Link href="/quiz" className="dash-nav-item">
            <span className="dash-nav-icon">🎯</span> Career Quiz
          </Link>
          <Link href="/roadmap" className="dash-nav-item">
            <span className="dash-nav-icon">🗺️</span> Roadmaps
          </Link>
          <Link href="/profile" className="dash-nav-item">
            <span className="dash-nav-icon">👤</span> Profile
          </Link>

          <div className="dash-sidebar-label">General</div>
          <Link href="/settings" className="dash-nav-item">
            <span className="dash-nav-icon">⚙️</span> Settings
          </Link>
          <Link href="/help" className="dash-nav-item">
            <span className="dash-nav-icon">❓</span> Help
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="dash-main">
        
        {/* Top Header Row */}
        <div className="dash-header">
          <div className="dash-header-title">
            <h1>Dashboard</h1>
            <p>Plan, prioritize, and accomplish your career goals</p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="dash-metrics-grid">
          <div className="dash-metric-card dash-metric-green dark-glow-card">
            <div className="dash-mc-top">
              <div className="dash-mc-title dark-green-title">Total XP</div>
              <span className="dash-mc-icon-border">↗</span>
            </div>
            <div className="dash-mc-val text-white">{totalXP.toLocaleString()}</div>
            <div className="dash-mc-sub">⚡ Leveling up this month</div>
          </div>

          <div className="dash-metric-card dark-card">
            <div className="dash-mc-top">
              <div className="dash-mc-title dark-yellow">Active Paths</div>
            </div>
            <div className="dash-mc-val text-white">{roadmaps.length}</div>
            <div className="dash-mc-sub">✅ Increased from last month</div>
          </div>

          <div className="dash-metric-card dark-card">
            <div className="dash-mc-top">
              <div className="dash-mc-title dark-yellow">Skills Mastered</div>
            </div>
            <div className="dash-mc-val text-white">{totalDone}</div>
            <div className="dash-mc-sub">✅ Validated nodes</div>
          </div>

          <div className="dash-metric-card dark-card">
            <div className="dash-mc-top">
              <div className="dash-mc-title dark-yellow">Remaining</div>
            </div>
            <div className="dash-mc-val text-white">{totalNodes - totalDone}</div>
            <div className="dash-mc-sub">🔥 On Discuss</div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="dash-content-grid">
          
          {/* Performance & Goals */}
          <div className="dash-card dash-span-2 dark-card">
            <div className="dash-card-header" style={{ marginBottom: 0 }}>
              <div className="dash-card-title dark-yellow">Performance & Goals</div>
            </div>
            <div className="dash-card-sub" style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>Your estimated standing and career-readiness tracker</div>
            
            <div className="dash-perf-grid">
              {/* Horizontal Bar chart */}
              <div className="dash-rank-chart">
                <div className="dash-rank-label">Estimated Global Standing</div>
                <div className="dash-rank-bars-horizontal">
                  <div className="dash-rank-bar-col">
                    <div className="dash-rank-val dark-green">{Math.round(globalPercentile * 0.6)}%</div>
                    <div className="dash-rank-pill"><div className="dash-rank-fill" style={{ width: `${Math.max(8, globalPercentile * 0.6)}%` }}></div></div>
                    <div className="dash-rank-lbl">Avg<br/>User</div>
                  </div>
                  <div className="dash-rank-bar-col">
                    <div className="dash-rank-val dark-green">{globalPercentile}%</div>
                    <div className="dash-rank-pill"><div className="dash-rank-fill" style={{ width: `${Math.max(8, globalPercentile)}%` }}></div></div>
                    <div className="dash-rank-lbl">You</div>
                  </div>
                  <div className="dash-rank-bar-col">
                    <div className="dash-rank-val dark-green">99%</div>
                    <div className="dash-rank-pill"><div className="dash-rank-fill" style={{ width: '99%' }}></div></div>
                    <div className="dash-rank-lbl">Top 1%</div>
                  </div>
                </div>
                <div className="dash-percentile-badge dark-badge">
                  <span style={{ color: 'var(--green)' }}>🔥 Top {Math.max(1, 100 - globalPercentile)}% of learners</span>
                </div>
              </div>

              {/* Burn-down chart */}
              <div className="dash-burndown">
                <div className="dash-burndown-label">Career-Ready Progress</div>
                <div className="dash-burndown-visual">
                  <div className="dash-burndown-track dark-track">
                    <div
                      className="dash-burndown-fill dark-fill"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <div className="dash-burndown-stats">
                    <span>{totalDone} done</span>
                    <span className="dash-green">{overallPct}%</span>
                    <span>{totalNodes - totalDone} remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div className="dash-card dash-card-vibe dark-card" style={{ justifyContent: 'space-between' }}>
            <div className="dash-card-header">
              <div className="dash-card-title dark-yellow">🔔 Reminders</div>
            </div>
            {roadmaps.length > 0 ? (
              <div className="dark-inner-box">
                <div className="dash-vibe" style={{padding: '0.5rem 0.5rem', textAlign: 'left', alignItems: 'flex-start'}}>
                  <h3 style={{fontFamily: 'var(--font-nunito), sans-serif', margin: 0, fontSize: '1.05rem', color: '#fff'}}>You left off at <br/>{roadmaps[0].title}</h3>
                  <p className="dash-vibe-text" style={{fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.8rem', fontStyle: 'normal', textAlign: 'left', fontWeight: 'bold'}}>
                    <span className="dark-yellow">What\'s next:</span><br/>
                    Complete the next<br/>skill node to reach<br/>{roadmaps[0].done + 1}/{roadmaps[0].total}!
                  </p>
                </div>
                <Link href={`/roadmap/${roadmaps[0].slug}`} className="dash-btn-primary dark-glow-btn" style={{width: '100%', marginTop: '0.5rem', display: 'block', textAlign: 'center'}}>
                  ▶ Continue Journey
                </Link>
              </div>
            ) : (
              <div className="dark-inner-box">
                <div className="dash-vibe" style={{padding: '0.5rem 0.5rem', textAlign: 'left', alignItems: 'flex-start'}}>
                  <h3 style={{fontFamily: 'var(--font-nunito), sans-serif', margin: 0, fontSize: '1.05rem', color: '#fff'}}>No Active Paths</h3>
                  <p className="dash-vibe-text" style={{fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.8rem', fontStyle: 'normal', textAlign: 'left', fontWeight: 'bold'}}>
                    Take the career quiz to get your personalized roadmap and start tracking progress!
                  </p>
                </div>
                <Link href="/quiz" className="dash-btn-primary dark-glow-btn" style={{width: '100%', marginTop: '0.5rem', display: 'block', textAlign: 'center'}}>
                  ▶ Take Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Roadmaps List (Project equivalent) */}
          <div className="dash-card dark-card">
            <div className="dash-card-header">
              <div className="dash-card-title dark-yellow">Project</div>
              <Link href="/quiz" className="dash-card-action" style={{ color: '#fff', border: 'none', background: 'transparent' }}>+ New</Link>
            </div>
            <div className="dash-roadmaps-list">
              {roadmaps.map(rm => {
                const rmPct = rm.total > 0 ? Math.round((rm.done / rm.total) * 100) : 0;
                return (
                  <Link key={rm.slug} href={`/roadmap/${rm.slug}`} className="dash-rm-item dark-rm-item">
                    <div className="dash-rm-icon" style={{ background: 'transparent', fontSize: '1.2rem' }}>📗</div>
                    <div className="dash-rm-info" style={{ flex: 1 }}>
                      <div className="dash-rm-title dark-yellow" style={{ fontSize: '0.9rem' }}>{rm.title}</div>
                      <div className="dash-rm-stat" style={{ color: 'var(--muted)', fontSize: '0.75rem', marginBottom: '0.4rem' }}>{rm.done}/{rm.total} done</div>
                      <div className="dark-rm-progress">
                        <div className="dark-rm-track">
                          <div className="dark-rm-fill" style={{width: `${rmPct}%`}}></div>
                        </div>
                        <span className="dark-rm-pct">{rmPct}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="dash-content-grid bottom-grid">
          
          {/* Industry Intel */}
          <div className="dash-card dash-span-2 dark-card">
            <div className="dash-card-header" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
              <div className="dash-card-title dark-yellow">Industry Intel</div>
              <div className="dash-card-sub" style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, margin: 0 }}>Daily insights for your career field</div>
            </div>
            <div className="dash-intel-list dark-intel-list">
              {dailyIntel.map((item, i) => {
                let mockIcon = '🛠️';
                if (i === 1) mockIcon = '💡';
                if (i === 2) mockIcon = '🌐';
                if (i === 3) mockIcon = '⚡';
                
                let text = item.text;
                text = text.replace(/(\d+%|\d+x)/g, '<span class="dark-yellow">$1</span>');

                return (
                  <div key={i} className="dash-intel-item dark-intel-item">
                    <span className="dash-intel-icon" style={{ fontSize: '1rem', flexShrink: 0 }}>{mockIcon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ccc', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: text }}></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Progress */}
          <div className="dash-card dark-card">
            <div className="dash-card-header">
              <div className="dash-card-title dark-yellow">Project Progress</div>
            </div>
            <div className="dash-donut-wrap dark-donut-wrap">
              <div className="dash-donut dark-donut">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="82" className="dash-donut-bg dark-donut-bg" />
                  <circle
                    cx="100" cy="100" r="82"
                    className="dash-donut-bar dark-donut-bar"
                    stroke="#00FF00"
                    strokeDasharray={`${(overallPct / 100) * (2 * Math.PI * 82)} ${(2 * Math.PI * 82)}`}
                  />
                </svg>
                <div className="dash-donut-center">
                  <span className="dash-donut-xp" style={{fontSize: '1.8rem', color: '#fff'}}>{overallPct}%</span>
                  <span className="dash-donut-xp-label" style={{color: 'var(--muted)', fontWeight: '700', textTransform: 'none', letterSpacing: '0', fontSize: '0.6rem'}}>Project Ended</span>
                </div>
              </div>
              <div className="dash-progress-legend" style={{display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted)'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#00FF00'}}></div> Completed</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#F2C94C'}}></div> In Progress</span>
              </div>
            </div>
          </div>

          {/* Bun-Bot Quick Ask */}
          <div className="dash-card dash-bunbot-card dark-glow-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'visible' }}>
            
            {/* Pixar Style CSS Bunny */}
            <div className="pixar-bunny-container" style={{ transform: 'scale(0.85)', transformOrigin: 'center left' }}>
              <div className="pixar-bunny">
                {/* Ears */}
                <div className="pb-ear pb-fur pb-ear-left"></div>
                <div className="pb-ear pb-fur pb-ear-right"></div>
                
                {/* Body Elements */}
                <div className="pb-body pb-fur">
                  <div className="pb-arm pb-fur pb-arm-left"></div>
                  <div className="pb-leg pb-fur pb-leg-left"></div>
                  <div className="pb-leg pb-fur pb-leg-right"></div>
                </div>

                {/* Right Waving Arm */}
                <div className="pb-arm pb-fur pb-arm-right"></div>

                {/* Head */}
                <div className="pb-head pb-fur">
                  <div className="pb-cheek pb-fur pb-cheek-left"></div>
                  <div className="pb-cheek pb-fur pb-cheek-right"></div>
                  
                  <div className="pb-eye pb-eye-left">
                    <div className="pb-iris">
                      <div className="pb-pupil">
                        <div className="pb-catchlight-1"></div>
                        <div className="pb-catchlight-2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="pb-eye pb-eye-right">
                    <div className="pb-iris">
                      <div className="pb-pupil">
                        <div className="pb-catchlight-1"></div>
                        <div className="pb-catchlight-2"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pb-snout">
                    <div className="pb-nose"></div>
                    <div className="pb-mouth">
                      <div className="pb-tongue"></div>
                      <div className="pb-teeth"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Boxed Layout Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 1, marginLeft: '-10px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                <span className="dark-yellow">Brain fogged?</span><br/>
                <span className="dark-yellow">Talk to Bun-Bot!</span>
              </p>
              <form action="/counsellor" method="GET" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  name="q" 
                  placeholder="Ask me anything..." 
                  style={{ width: '100%', padding: '0', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.75rem', outline: 'none' }}
                  required
                />
                <button type="submit" className="dark-glow-btn" style={{ padding: '0.3rem 0', fontSize: '0.75rem', width: '80px', alignSelf: 'center', marginTop: '0.2rem' }}>Ask</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
}
