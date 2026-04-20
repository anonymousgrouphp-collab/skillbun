import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Script from 'next/script'

export const metadata = {
  title: 'Career Quiz – SkillBun',
  description: 'Take SkillBun\'s AI-powered career quiz.',
}

export default async function QuizPage() {
  const cookieStore = cookies()
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
    redirect('/onboarding?next=/quiz')
  }

  const name = profile.full_name || user.user_metadata?.full_name || 'Student'
  const email = profile.email || user.email || ''
  const degree = profile.degree || ''
  const year = profile.current_year || ''

  return (
    <>
      <div className="quiz-wrapper">
        <div id="welcomeScreen" className="quiz-welcome">
            <div className="welcome-bunny">👋</div>
            <h1>Hey <span id="userName">{name.split(' ')[0]}</span>!</h1>
            <p>Let's find your perfect tech career path. I'll ask you <strong>10 to 18 questions</strong> that adapt based on your answers.</p>
            <div className="welcome-profile" id="welcomeProfile">
              <div className="profile-tag">Degree: {degree}</div>
              <div className="profile-tag">Year: {year}</div>
            </div>
            
            <div id="captchaWrap" className="quiz-captcha-wrap" style={{ display: 'none' }}>
                <div id="captchaWidget" className="quiz-captcha-widget"></div>
                <p id="captchaStatus" className="quiz-captcha-status"></p>
            </div>
            <button type="button" className="btn-primary quiz-start-btn" id="startQuizBtn">🐾 Let's Begin!</button>
        </div>

        <div id="quizScreen" className="quiz-screen" style={{ display: 'none' }}>
            <div className="quiz-progress-wrap">
                <div className="quiz-phase" id="quizPhase">Phase 1: Discovery</div>
                <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill" id="progressFill" style={{ width: '0%' }}></div>
                </div>
                <div className="quiz-progress-text">Question <span id="qNum">1</span> of <span id="qTotal">15</span></div>
            </div>

            <div className="quiz-question-card" id="questionCard">
                <div className="quiz-q-text" id="questionText">Loading your first question...</div>
            </div>

            <div className="quiz-options" id="optionsContainer">
            </div>

            <div className="quiz-loading" id="quizLoading" style={{ display: 'none' }}>
                <div className="quiz-loading-dots">
                    <span></span><span></span><span></span>
                </div>
                <p>SkillBun is thinking...</p>
            </div>
        </div>

        <div id="resultScreen" className="quiz-results" style={{ display: 'none' }}>
            <div className="result-header">
                <div style={{ fontSize: '3rem' }}>🎯</div>
                <h1>Your Career Matches</h1>
                <p>Based on your profile and answers, here are your top career paths:</p>
            </div>

            <div className="result-cards" id="resultCards">
            </div>

            <div className="result-actions">
                <button type="button" className="btn-primary" id="loadMoreBtn">🔍 Load More Career Paths</button>
                <button type="button" className="btn-secondary" id="retakeBtn">🔄 Retake Quiz</button>
                <a href="/" className="btn-secondary">🏠 Back to Home</a>
            </div>
        </div>
      </div>

      {/* Sync verified DB profile data into localStorage for quiz.js backward compatibility */}
      <Script id="sync-auth" strategy="beforeInteractive">
        {`
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb_name', ${JSON.stringify(name)});
            localStorage.setItem('sb_email', ${JSON.stringify(email)});
            localStorage.setItem('sb_degree', ${JSON.stringify(degree)});
            localStorage.setItem('sb_year', ${JSON.stringify(year)});
          }
        `}
      </Script>

      <Script src="/quiz.js" strategy="lazyOnload" />
    </>
  )
}
