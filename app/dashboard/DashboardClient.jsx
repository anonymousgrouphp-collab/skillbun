'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { useDashboardData } from './dashboardUtils';
import './dashboard.css';

const DONUT_RADIUS = 82;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const MINI_DONUT_RADIUS = 17;
const MINI_DONUT_CIRCUMFERENCE = 2 * Math.PI * MINI_DONUT_RADIUS;

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
  const { user, profile, authLoading, profileLoading, isProfileComplete, progressVersion } = useAuth();
  const { data, loading } = useDashboardData(progressVersion);
  const [showCeleb, setShowCeleb] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data?.showCelebration) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCeleb(true);
    }
  }, [data?.showCelebration]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth?next=/dashboard');
      return;
    }

    if (!authLoading && !profileLoading && user && !isProfileComplete) {
      router.replace('/onboarding?next=/dashboard');
    }
  }, [authLoading, isProfileComplete, profileLoading, router, user]);

  /* Loading state */
  if (authLoading || profileLoading || !user || !isProfileComplete || loading || !mounted) {
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
  if (!data || data.roadmaps.length === 0) {
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

  const firstName = profile.hasName ? profile.name.split(' ')[0] : 'Student';
  const {
    roadmaps, totalXP, totalDone, totalNodes, overallPct,
    efficiency, globalPercentile, vibeQuote, dailyIntel,
    xpGained,
  } = data;

  return (
    <div className="dash">
      {/* Celebration overlay */}
      {showCeleb && (
        <CelebrationOverlay xpGained={xpGained} onDismiss={() => setShowCeleb(false)} />
      )}

      {/* Hero header */}
      <div className="dash-hero">
        <div className="dash-hero-left">
          <h1>Welcome back, <span>{firstName}</span> 👋</h1>
          <p className="dash-hero-sub">Your Apex Growth dashboard — track, level up, and own your career journey.</p>
        </div>
        <div className="dash-hero-badges">
          <span className="dash-badge dash-badge-xp">⚡ {totalXP.toLocaleString()} XP</span>
          <span className="dash-badge dash-badge-streak">🗺️ {roadmaps.length} Active {roadmaps.length === 1 ? 'Path' : 'Paths'}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="dash-grid">

        {/* 1. Core Progress Engine — Donut */}
        <div className="dash-card dash-card-full">
          <div className="dash-card-title">🎯 Core Progress Engine</div>
          <div className="dash-card-sub">Your overall journey across all active roadmaps</div>
          <div className="dash-donut-wrap">
            <div className="dash-donut">
              <svg viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="dashDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2ECC71" />
                    <stop offset="100%" stopColor="#A8FF3E" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r={DONUT_RADIUS} className="dash-donut-bg" />
                <circle
                  cx="100" cy="100" r={DONUT_RADIUS}
                  className="dash-donut-bar"
                  stroke="url(#dashDonutGrad)"
                  strokeDasharray={`${(overallPct / 100) * DONUT_CIRCUMFERENCE} ${DONUT_CIRCUMFERENCE}`}
                />
              </svg>
              <div className="dash-donut-center">
                <span className="dash-donut-xp">{totalXP.toLocaleString()}</span>
                <span className="dash-donut-xp-label">Total XP</span>
                <span className="dash-donut-pct">{overallPct}% Complete</span>
              </div>
            </div>

            <div className="dash-donut-metrics">
              <div className="dash-metric">
                <span className="dash-metric-icon">📊</span>
                <div className="dash-metric-info">
                  <span className="dash-metric-value">{efficiency}%</span>
                  <span className="dash-metric-label">Efficiency Score</span>
                </div>
              </div>
              <div className="dash-metric">
                <span className="dash-metric-icon">✅</span>
                <div className="dash-metric-info">
                  <span className="dash-metric-value">{totalDone} / {totalNodes}</span>
                  <span className="dash-metric-label">Skills Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Active Roadmaps */}
        <div className="dash-card dash-card-full">
          <div className="dash-card-title">🗺️ Active Roadmaps</div>
          <div className="dash-card-sub">Click any roadmap to continue your journey</div>
          <div className="dash-roadmaps-scroll">
            {roadmaps.map(rm => (
              <Link
                key={rm.slug}
                href={`/roadmap/${rm.slug}`}
                className="dash-roadmap-card"
              >
                <div className="dash-roadmap-mini-donut">
                  <svg viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r={MINI_DONUT_RADIUS} className="dash-roadmap-mini-bg" />
                    <circle
                      cx="22" cy="22" r={MINI_DONUT_RADIUS}
                      className="dash-roadmap-mini-bar"
                      stroke="url(#dashDonutGrad)"
                      strokeDasharray={`${(rm.pct / 100) * MINI_DONUT_CIRCUMFERENCE} ${MINI_DONUT_CIRCUMFERENCE}`}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    />
                  </svg>
                  <span className="dash-roadmap-mini-pct">{rm.pct}%</span>
                </div>
                <div className="dash-roadmap-info">
                  <span className="dash-roadmap-title">{rm.title}</span>
                  <span className="dash-roadmap-stat">{rm.done}/{rm.total} skills · {rm.xp} XP</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Industry Intel */}
        <div className="dash-card">
          <div className="dash-card-title">📡 Industry Intel</div>
          <div className="dash-card-sub">Daily insights for your career field</div>
          <div className="dash-intel-list">
            {dailyIntel.map((item, i) => (
              <div key={i} className="dash-intel-item">
                <span className="dash-intel-icon">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Vibe Check */}
        <div className="dash-card dash-card-vibe">
          <div className="dash-card-title">💬 Vibe Check</div>
          <div className="dash-card-sub">Your daily dose of tech motivation</div>
          <div className="dash-vibe">
            <div className="dash-vibe-emoji">{vibeQuote.emoji}</div>
            <p className="dash-vibe-text">&ldquo;{vibeQuote.text}&rdquo;</p>
            <div className="dash-vibe-footer">
              <span className="dash-vibe-dot" />
              Refreshes daily
            </div>
          </div>
        </div>

        {/* 5. Comparative Performance */}
        <div className="dash-card dash-card-full">
          <div className="dash-card-title">📈 Performance & Goals</div>
          <div className="dash-card-sub">Your estimated standing and career-readiness tracker</div>
          <div className="dash-perf-grid">
            {/* Bar chart */}
            <div className="dash-rank-chart">
              <div className="dash-rank-label">Estimated Global Standing</div>
              <div className="dash-rank-bars">
                <div className="dash-rank-bar-group">
                  <div className="dash-rank-bar-value">{Math.round(globalPercentile * 0.6)}%</div>
                  <div
                    className="dash-rank-bar dash-rank-bar-avg"
                    style={{ height: `${Math.max(8, globalPercentile * 0.6)}%` }}
                  />
                  <span className="dash-rank-bar-label">Avg User</span>
                </div>
                <div className="dash-rank-bar-group">
                  <div className="dash-rank-bar-value">{globalPercentile}%</div>
                  <div
                    className="dash-rank-bar dash-rank-bar-you"
                    style={{ height: `${Math.max(8, globalPercentile)}%` }}
                  />
                  <span className="dash-rank-bar-label">You</span>
                </div>
                <div className="dash-rank-bar-group">
                  <div className="dash-rank-bar-value">99%</div>
                  <div
                    className="dash-rank-bar dash-rank-bar-top"
                    style={{ height: '99%' }}
                  />
                  <span className="dash-rank-bar-label">Top 1%</span>
                </div>
              </div>
              <div className="dash-percentile-badge">
                🏅 Top {Math.max(1, 100 - globalPercentile)}% of learners
              </div>
            </div>

            {/* Burn-down chart */}
            <div className="dash-burndown">
              <div className="dash-burndown-label">Career-Ready Progress</div>
              <div className="dash-burndown-visual">
                <div className="dash-burndown-track">
                  <div
                    className="dash-burndown-fill"
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

      </div>
    </div>
  );
}
