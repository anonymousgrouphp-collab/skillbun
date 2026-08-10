'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function CounsellorPage() {
  const router = useRouter();
  const { user, profile, authLoading, profileLoading, isProfileComplete } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth?next=/counsellor');
      return;
    }

    if (!authLoading && !profileLoading && user && !isProfileComplete) {
      router.replace('/onboarding?next=/counsellor');
    }
  }, [authLoading, isProfileComplete, profileLoading, router, user]);

  useEffect(() => {
    if (authLoading || profileLoading || !user || !isProfileComplete) {
      return undefined;
    }

    let cancelled = false;
    let cleanup = () => {};

    import('@/utils/client/counsellorRuntime')
      .then(({ mountCounsellorRuntime }) => {
        if (cancelled) {
          return;
        }

        cleanup = mountCounsellorRuntime();
      })
      .catch((error) => {
        console.error('Failed to load counsellor runtime:', error);
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [authLoading, isProfileComplete, profileLoading, user]);

  if (authLoading || profileLoading || !profile.hydrated || !user || !isProfileComplete) return <div id="main-page" style={{ opacity: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>Loading...</div>;

  const { name, degree, year } = profile;

  return (
    <>
      <div id="main-page" className="counsellor-workspace">
        <div className="workspace-container">
          {/* Workspace Left Sidebar: Desktop Desk Guide */}
          <aside className="workspace-sidebar">
            <div className="sidebar-card profile-card">
              <div className="profile-avatar">🐰</div>
              <div className="profile-details">
                <h3>{name}</h3>
                <div className="profile-degree">{degree}</div>
                <div className="profile-year">Year {year}</div>
              </div>
            </div>
            
            <div className="sidebar-card limit-card" id="limitCard">
              <h4>⏳ Usage Limit</h4>
              <div className="limit-progress-container">
                <div className="limit-text">
                  <span>Messages Left:</span>
                  <strong id="limitCount">100 / 100</strong>
                </div>
                <div className="limit-bar-bg">
                  <div className="limit-bar" id="limitBar" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="limit-reset-info" id="limitReset">
                Timer starts on first message
              </div>
            </div>

            <div className="sidebar-card tips-card">
              <h4>💡 Bun-Bot Tips</h4>
              <ul>
                <li>Compare career tracks (e.g. <em>Web Dev vs. Devops</em>)</li>
                <li>Ask for typical salaries in <strong>LPA</strong></li>
                <li>Ask for learning roadmaps (e.g. <em>Frontend Roadmap</em>)</li>
                <li>Talk in English, Hindi, or Hinglish!</li>
              </ul>
            </div>

            <div className="sidebar-card nav-card">
              <h4>🛠️ Fast Links</h4>
              <a href="/dashboard" className="sidebar-link">📊 Dashboard</a>
              <a href="/quiz" className="sidebar-link">🎯 Retake Career Quiz</a>
            </div>
          </aside>

          {/* Main Chat Console */}
          <div id="chat-container" className="chat-console">
            {/* Mobile Top Compact Info Bar */}
            <div className="mobile-counsellor-bar">
              <div className="mobile-limit-badge">
                <span>⏳ Messages:</span>
                <strong id="mobileLimitCount">100/100</strong>
              </div>
              <div className="mobile-bar-actions">
                <a href="/dashboard" className="mobile-icon-link" title="Dashboard">📊</a>
                <a href="/quiz" className="mobile-icon-link" title="Retake Quiz">🎯</a>
              </div>
            </div>

            <div className="chat-header">
              <div className="chat-header-main">
                <div className="chat-bot-icon">🤖</div>
                <div className="chat-header-info">
                  <h2>Bun-Bot Counsellor</h2>
                  <p><span className="status-dot"></span> Online · Ready to help {name.split(' ')[0]}</p>
                </div>
                <button className="chat-clear-btn" id="clearChatBtn" title="Clear Chat History">
                  🗑️ <span className="clear-text">Clear</span>
                </button>
              </div>

              <div className="counsellor-mode-toggle" id="modeToggleContainer">
                <button className="mode-btn active" id="modeFastBtn" data-mode="fast" title="SkillBun Instant Engine (0ms latency)">
                  ⚡ Fast Mode <span className="mode-badge">Instant 0ms</span>
                </button>
                <button className="mode-btn" id="modeDeepBtn" data-mode="deep" title="Hybrid Open-Source LLM + Web Search + RAG">
                  🧠 Deep Mode <span className="mode-badge">AI + Web</span>
                </button>
              </div>
            </div>

            <div id="securityBanner" style={{ display: 'none' }} className="security-banner-card">
              <div className="security-icon">🔒</div>
              <div className="security-body">
                <p id="captchaStatus">Checking security...</p>
                <div id="captchaWidget"></div>
              </div>
            </div>

            <div className="chat-messages" id="chatMessages">
              <div className="message-row bot">
                <div className="msg-avatar bot">🤖</div>
                <div className="message bot">
                  <p>Hi {name.split(' ')[0]}! I'm <strong>Bun-Bot</strong>, your personal AI Career Counsellor. 🐰</p>
                  <p>I can help you with anything related to tech careers in India. Feel free to ask me:</p>
                  <ul>
                    <li>Pros and cons of learning different courses/languages.</li>
                    <li>Salary expectations for various roles (e.g., Data Scientist vs. Backend Dev).</li>
                    <li>What a "day in the life" looks like for a specific tech job.</li>
                    <li>Which entrance exams or certifications might be right for you.</li>
                  </ul>
                  <p>What's on your mind?</p>
                </div>
              </div>
            </div>

            <div className="typing-indicator" id="typingIndicator">
              <span></span><span></span><span></span>
            </div>

            {/* Input area wrapper containing suggestion chips and input box */}
            <div className="chat-input-wrapper">
              <div className="chat-suggestions" id="chatSuggestions">
                <button className="suggestion-chip">💰 Salary for Data Scientist?</button>
                <button className="suggestion-chip">🤔 Python vs Java?</button>
                <button className="suggestion-chip">🎓 Best certs for Cloud?</button>
                <button className="suggestion-chip">📅 Day in life of a Dev?</button>
                <button className="suggestion-chip">🔐 How to enter Cybersecurity?</button>
              </div>

              <div className="chat-input-area">
                <textarea id="chatInput" className="chat-input" placeholder="Ask Bun-Bot anything about tech careers..." rows={1}></textarea>
                <button className="chat-send-btn" id="sendBtn" title="Send message">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
