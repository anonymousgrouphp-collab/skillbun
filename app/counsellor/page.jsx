'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function CounsellorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: 'Student', degree: '', year: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const degree = localStorage.getItem('sb_degree') || '';
    const year = localStorage.getItem('sb_year') || '';
    const name = localStorage.getItem('sb_name') || 'Student';

    if (!degree || !year) {
      router.replace('/onboarding?next=/counsellor');
    } else {
      setProfile({ name, degree, year });
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div id="main-page" style={{ opacity: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>;

  const { name } = profile;

  return (
    <>
      <div id="main-page" style={{ opacity: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px' }}>
        <div id="chat-container">
          <div className="chat-header">
            <div className="chat-bot-icon">🤖</div>
            <div className="chat-header-info">
              <h2>Bun-Bot Counsellor</h2>
              <p><span className="status-dot"></span> Online · Ready to help {name.split(' ')[0]}</p>
            </div>
            <button className="chat-clear-btn" id="clearChatBtn">🗑 Clear</button>
          </div>

          <div id="securityBanner" style={{ display: 'none' }}>
            <p id="captchaStatus" style={{ margin: '0 0 0.5rem 0' }}>Checking security...</p>
            <div id="captchaWidget" style={{ display: 'inline-block' }}></div>
          </div>

          <div className="chat-suggestions" id="chatSuggestions">
            <button className="suggestion-chip">💰 Salary for Data Scientist?</button>
            <button className="suggestion-chip">🤔 Python vs Java?</button>
            <button className="suggestion-chip">🎓 Best certs for Cloud?</button>
            <button className="suggestion-chip">📅 Day in life of a Dev?</button>
            <button className="suggestion-chip">🔐 How to enter Cybersecurity?</button>
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

          <div className="chat-input-area">
            <textarea id="chatInput" className="chat-input" placeholder="Ask Bun-Bot anything about tech careers..." rows="1"></textarea>
            <button className="chat-send-btn" id="sendBtn" title="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* localStorage already holds our data, but counsellor.js uses these keys */}

      <Script src="/vendor/marked.umd.js" strategy="lazyOnload" />
      <Script src="/counsellor.js" strategy="lazyOnload" />
    </>
  )
}
