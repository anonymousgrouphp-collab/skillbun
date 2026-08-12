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
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">🐰</div>
                <div className="avatar-status-ring"></div>
              </div>
              <div className="profile-details">
                <h3>{name}</h3>
                <div className="profile-degree-badge">{degree}</div>
                <div className="profile-year-tag">Year {year}</div>
              </div>
            </div>
            
            <div className="sidebar-card limit-card" id="limitCard">
              <h4>
                <span className="card-icon">⚡</span> Usage Quota
              </h4>
              <div className="limit-progress-container">
                <div className="limit-text">
                  <span>Messages Left</span>
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
              <h4>
                <span className="card-icon">✨</span> Pro Tips
              </h4>
              <ul>
                <li>Compare career tracks (e.g. <em>Web Dev vs DevOps</em>)</li>
                <li>Ask for Indian salaries in <strong>LPA</strong></li>
                <li>Request interactive roadmaps & cert guidance</li>
                <li>Speak in English, Hindi, or Hinglish!</li>
              </ul>
            </div>

            <div className="sidebar-card nav-card">
              <h4>
                <span className="card-icon">🚀</span> Fast Access
              </h4>
              <a href="/dashboard" className="sidebar-link">
                <span className="link-icon">📊</span> Dashboard
              </a>
              <a href="/quiz" className="sidebar-link">
                <span className="link-icon">🎯</span> Retake Career Quiz
              </a>
            </div>
          </aside>

          {/* Main Chat Console */}
          <div id="chat-container" className="chat-console">
            {/* Mobile Top Compact Info Bar */}
            <div className="mobile-counsellor-bar">
              <div className="mobile-limit-badge">
                <span>⚡ Quota:</span>
                <strong id="mobileLimitCount">100/100</strong>
              </div>
              <div className="mobile-bar-actions">
                <a href="/dashboard" className="mobile-icon-link" title="Dashboard">📊</a>
                <a href="/quiz" className="mobile-icon-link" title="Retake Quiz">🎯</a>
              </div>
            </div>

            <div className="chat-header">
              <div className="chat-header-main">
                <div className="chat-bot-icon-glow">
                  <div className="chat-bot-icon">🤖</div>
                  <span className="bot-status-ring"></span>
                </div>
                <div className="chat-header-info">
                  <div className="chat-header-title-row">
                    <h2>Bun-Bot AI Counsellor</h2>
                    <span className="chat-engine-tag">Discovery Engine v2.0</span>
                  </div>
                  <p>
                    <span className="status-dot"></span>
                    <span className="status-text">Online</span>
                    <span className="status-divider">•</span>
                    <span>Direct Assistant to <strong>{name.split(' ')[0]}</strong></span>
                  </p>
                </div>
                <button className="chat-clear-btn" id="clearChatBtn" title="Clear Chat History">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span className="clear-text">Clear Chat</span>
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
                  <p>Hi <strong>{name.split(' ')[0]}</strong>! I'm <strong>Bun-Bot</strong>, your personal AI Career Counsellor 🐰</p>
                  <p>I can guide you through every tech career path in India. Ask me anything like:</p>
                  <ul>
                    <li>Pros and cons of learning different courses or languages</li>
                    <li>Salary expectations for various roles (e.g., <em>Data Scientist vs. Backend Dev</em>)</li>
                    <li>What a "day in the life" looks like for specific tech roles</li>
                    <li>Which entrance exams or certifications fit your timeline</li>
                  </ul>
                  <p>What would you like to explore today?</p>
                </div>
              </div>
            </div>

            <div className="typing-indicator" id="typingIndicator">
              <span></span><span></span><span></span>
            </div>

            {/* Input area wrapper containing prompt starters and input console */}
            <div className="chat-input-wrapper">
              <div className="chat-suggestions-header">
                <span id="suggestionsTitle">✨ Suggested Questions</span>
                <button id="refreshSuggestionsBtn" className="suggestions-refresh-btn" title="Shuffle new questions">
                  🔄 Shuffle
                </button>
              </div>
              <div className="chat-suggestions" id="chatSuggestions">
                {/* Dynamically populated by smartSuggestions */}
              </div>

              <div className="chat-input-area">
                <div className="chat-input-container">
                  <textarea id="chatInput" className="chat-input" placeholder="Ask Bun-Bot anything about tech careers, roadmaps, salaries..." rows={1}></textarea>
                  <div className="chat-input-hint">Press <span>Enter ↵</span> to send</div>
                </div>
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
