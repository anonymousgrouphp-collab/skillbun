import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Script from 'next/script'

export const metadata = {
  title: 'SkillBun - AI Career Counsellor',
  description: 'Chat with Bun-Bot, your AI Career Counsellor. Ask anything about tech careers, salaries, and roles.',
}

export default async function CounsellorPage() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder'

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
    },
  })

  // Get user from Google Auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  // Fetch profile from DB
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If no profile, send to onboarding
  if (!profile || !profile.degree || !profile.current_year) {
    redirect('/onboarding?next=/counsellor')
  }

  const name = profile.full_name || user.user_metadata?.full_name || 'Student'
  const email = profile.email || user.email || ''
  const degree = profile.degree || ''
  const year = profile.current_year || ''

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

      {/* Sync verified DB profile data into localStorage for counsellor.js backward compatibility */}
      <Script id="sync-auth-counsellor" strategy="beforeInteractive">
        {`
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb_name', ${JSON.stringify(name)});
            localStorage.setItem('sb_email', ${JSON.stringify(email)});
            localStorage.setItem('sb_degree', ${JSON.stringify(degree)});
            localStorage.setItem('sb_year', ${JSON.stringify(year)});
          }
        `}
      </Script>

      <Script src="/vendor/marked.umd.js" strategy="lazyOnload" />
      <Script src="/counsellor.js" strategy="lazyOnload" />
    </>
  )
}
