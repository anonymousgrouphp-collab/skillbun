'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const FLOATER_TEXTS = [
  'console.log("career")', 'import skills', 'git commit -m "future"',
  'npm i success', 'def find_path():', 'SELECT * FROM jobs',
  '404: fear not found', 'while(learning) grow()', 'sudo make me a developer',
  '<BunBot />', '{ const path = "tech"; }', 'git checkout new-life',
  'try { succeed() } catch (e) { learn() }', 'public static void main()',
  'SELECT dream FROM opportunities'
];

const CODE_CHARS = ['0', '1', '</>', '{}', '[]', '//', 'def', 'fn', 'var', '&&', '||', '!=', 'if', 'for', 'git'];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const statsRef = useRef(null);
  const statsAnimated = useRef(false);
  const supabase = createClient();
  const router = useRouter();
  const googleBtnRef = useRef(null);

  useEffect(() => {
    let timer;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authRequired') === 'true') {
      setShowSplash(false);
      localStorage.setItem('sb_dest', urlParams.get('dest') || '/quiz');
      setShowModal(true);
      window.history.replaceState({}, '', '/');
    } else {
      // Splash timer
      timer = setTimeout(() => setShowSplash(false), 3000);
    }

    // Shuffle text animation (delayed until after splash)
    const shuffleTexts = document.querySelectorAll('.shuffle-text');
    shuffleTexts.forEach((el, idx) => {
      const finalWord = el.getAttribute('data-final') || '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
      let iteration = 0;
      setTimeout(() => {
        const iv = setInterval(() => {
          el.innerText = finalWord.split('').map((letter, i) => {
            if (i < iteration) return finalWord[i];
            return chars[Math.floor(Math.random() * chars.length)];
          }).join('');
          iteration += 1 / 3;
          if (iteration >= finalWord.length) {
            el.innerText = finalWord;
            clearInterval(iv);
          }
        }, 50);
      }, 3500 + idx * 400);
    });

    // Code Rain on splash
    const rainEl = document.getElementById('codeRain');
    if (rainEl) {
      for (let i = 0; i < 20; i++) {
        const col = document.createElement('div');
        col.className = 'code-col';
        col.style.left = `${Math.random() * 100}%`;
        col.style.animationDuration = `${6 + Math.random() * 8}s`;
        col.style.animationDelay = `${Math.random() * 5}s`;
        let content = '';
        for (let j = 0; j < 15; j++) {
          content += `${CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]}<br>`;
        }
        col.innerHTML = content;
        rainEl.appendChild(col);
      }
    }

    // Floating code snippets in hero
    const floatersEl = document.getElementById('floaters');
    if (floatersEl) {
      for (let i = 0; i < 15; i++) {
        const floater = document.createElement('div');
        floater.className = 'floater';
        floater.textContent = FLOATER_TEXTS[i];
        floater.style.left = `${Math.random() * 92}%`;
        floater.style.animationDuration = `${10 + Math.random() * 12}s`;
        floater.style.animationDelay = `${Math.random() * 8}s`;
        floatersEl.appendChild(floater);
      }
    }

    // Count-up animation for stats
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated.current) {
          statsAnimated.current = true;
          document.querySelectorAll('.stat-num').forEach((el) => {
            const target = Number(el.getAttribute('data-target'));
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000;
            const startTime = performance.now();
            function update(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(eased * target);
              el.textContent = `${current}${suffix}`;
              if (progress < 1) requestAnimationFrame(update);
              else el.textContent = `${target}${suffix}`;
            }
            requestAnimationFrame(update);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    if (statsRef.current) observer.observe(statsRef.current);

    // Hamburger menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
      const toggle = () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
      };
      mobileMenuBtn.addEventListener('click', toggle);
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuBtn.classList.remove('active');
          navLinks.classList.remove('active');
        });
      });
    }

    return () => {
      clearTimeout(timer);
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  const openAuthModal = (destination) => {
    localStorage.setItem('sb_dest', destination || '/quiz');
    setShowModal(true);
  };

  const handleGoogleCredential = async (response) => {
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Login error:', error.message);
        setIsLoggingIn(false);
        return;
      }

      const dest = localStorage.getItem('sb_dest') || '/quiz';

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('degree, current_year')
        .eq('user_id', data.user.id)
        .single();

      if (!profile || !profile.degree || !profile.current_year) {
        router.push(`/onboarding?next=${encodeURIComponent(dest)}`);
      } else {
        localStorage.setItem('sb_name', data.user.user_metadata?.full_name || '');
        localStorage.setItem('sb_email', data.user.email || '');
        localStorage.setItem('sb_degree', profile.degree || '');
        localStorage.setItem('sb_year', profile.current_year || '');
        router.push(dest);
      }

      setShowModal(false);
    } catch (err) {
      console.error('Login failed:', err);
      setIsLoggingIn(false);
    }
  };

  // Render Google Sign-In button when modal opens
  useEffect(() => {
    if (!showModal) return;

    const renderBtn = () => {
      if (googleBtnRef.current && window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 350,
        });
      }
    };

    if (window.google) {
      renderBtn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          renderBtn();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showModal]);

  return (
    <>
      {/* ===== SPLASH SCREEN ===== */}
      {showSplash && (
        <div id="splash" style={{ display: 'flex' }}>
          <div className="code-rain" id="codeRain"></div>
          <div className="bunny-wrap">
            <svg className="bunny-svg" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left Ear */}
              <ellipse cx="68" cy="68" rx="16" ry="44" fill="#f0f0f0" transform="rotate(-10 68 68)" />
              <ellipse cx="68" cy="68" rx="8" ry="34" fill="#f9a8d4" transform="rotate(-10 68 68)" />
              {/* Right Ear */}
              <g className="ear-right">
                <ellipse cx="132" cy="68" rx="16" ry="44" fill="#f0f0f0" transform="rotate(10 132 68)" />
                <ellipse cx="132" cy="68" rx="8" ry="34" fill="#f9a8d4" transform="rotate(10 132 68)" />
              </g>
              {/* Body */}
              <ellipse cx="100" cy="170" rx="55" ry="45" fill="#f0f0f0" />
              {/* Head */}
              <circle cx="100" cy="118" r="46" fill="#f0f0f0" />
              {/* Eyes */}
              <g className="eye">
                <circle cx="85" cy="113" r="8" fill="#1a1a2e" />
                <circle cx="88" cy="110" r="2.5" fill="white" />
              </g>
              <g className="eye">
                <circle cx="115" cy="113" r="8" fill="#1a1a2e" />
                <circle cx="118" cy="110" r="2.5" fill="white" />
              </g>
              {/* Nose */}
              <ellipse cx="100" cy="126" rx="5" ry="3.5" fill="#f9a8d4" />
              {/* Mouth */}
              <path d="M93 130 Q100 136 107 130" stroke="#ccc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Cheeks */}
              <circle cx="77" cy="122" r="9" fill="#fca5a5" opacity="0.5" />
              <circle cx="123" cy="122" r="9" fill="#fca5a5" opacity="0.5" />
              {/* Code badge on tummy */}
              <rect x="72" y="152" width="56" height="30" rx="8" fill="#0D1117" stroke="#2ECC71" strokeWidth="1.5" />
              <text x="100" y="163" textAnchor="middle" fill="#2ECC71" fontFamily="monospace" fontSize="7">&lt;code&gt;</text>
              <text x="100" y="174" textAnchor="middle" fill="#A8FF3E" fontFamily="monospace" fontSize="7">career/&gt;</text>
              {/* Paws */}
              <ellipse cx="60" cy="195" rx="15" ry="10" fill="#f0f0f0" />
              <ellipse cx="140" cy="195" rx="15" ry="10" fill="#f0f0f0" />
            </svg>
          </div>
          <div className="splash-title">ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
          <img src="/logo.png" alt="SkillBun Logo" />
          <div className="splash-subtitle">Hop into the <span>right career</span></div>
          <div className="splash-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      )}

      <div id="main-page">
        {/* ===== HERO ===== */}
        <div className="hero">
          <div className="hero-bg-glow"></div>
          <div className="floaters" id="floaters"></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-tag"> For BCA · BSc · B.Tech Students</div>
            <h1>Your Tech <span className="shuffle-text" data-final="Career">######</span>,<br /><span
              className="highlight">Engineered For <span className="shuffle-text" data-final="Success">#######</span>.</span></h1>
            <p>Not sure which path to take in tech? SkillBun analyzes your interests, guides you through career options,
              entrance exams, top colleges, languages to learn, and connects you to real industry peers.</p>
            <div className="hero-btns">
              <button onClick={() => openAuthModal('/quiz')} className="btn-primary">🐾 Take the Career Quiz</button>
            </div>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="stats-row" ref={statsRef}>
          <div className="stat">
            <span className="stat-num" data-target="50" data-suffix="K+">0</span>
            <span className="stat-label">Students Guided</span>
          </div>
          <div className="stat">
            <span className="stat-num" data-target="200" data-suffix="+">0</span>
            <span className="stat-label">Career Paths Mapped</span>
          </div>
          <div className="stat">
            <span className="stat-num" data-target="98" data-suffix="%">0</span>
            <span className="stat-label">Satisfaction Rate</span>
          </div>
        </div>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how">
          <div className="section-label">🐾 The Journey</div>
          <h2 className="section-title">How SkillBun Works</h2>
          <p className="section-sub">Four simple hops from confusion to a clear, personalized tech career roadmap.</p>
          <div className="steps">
            <div className="step-card">
              <span className="step-icon">📋</span>
              <div className="step-num">01</div>
              <h3>Interest Quiz</h3>
              <p>Answer curated questions about your interests, strengths, and goals. Our AI analyzes your personality and learning style.</p>
            </div>
            <div className="step-card">
              <span className="step-icon">🗺️</span>
              <div className="step-num">02</div>
              <h3>Career Mapping</h3>
              <p>Get a personalized career roadmap with top fields like AI/ML, Web Dev, Cybersecurity, Data Science, and more.</p>
            </div>
            <div className="step-card">
              <span className="step-icon">🤝</span>
              <div className="step-num">03</div>
              <h3>Dream Tech Jobs</h3>
              <p>Explore packages and get AI chatbot support for any doubts along the way.</p>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" style={{ paddingTop: 0 }}>
          <div className="section-label">✨ Everything You Need</div>
          <h2 className="section-title">Built for Aspiring Techies</h2>
          <p className="section-sub">From choosing a programming language to landing your first job – SkillBun has you covered at every hop.</p>
          <div className="features-grid">
            <a href="/counsellor" className="feature-card feature-card-link" aria-label="Open AI Career Counsellor">
              <div className="feature-icon-wrap">🤖</div>
              <div>
                <h3>AI Career Counsellor</h3>
                <p>Ask anything – pros/cons of a course, salary expectations, day-in-the-life of a role. Bun-Bot is always available.</p>
              </div>
            </a>
            <div className="feature-card">
              <div className="feature-icon-wrap">💻</div>
              <div>
                <h3>Language Recommender</h3>
                <p>Should you learn Python, Java, or Go? Get tailored recommendations based on your target field and interests.</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap">🏢</div>
              <div>
                <h3>Company Explorer</h3>
                <p>Browse curated companies hiring freshers, check packages, job roles and required skills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CAREER FIELDS ===== */}
        <section id="careers" style={{ paddingTop: 0 }}>
          <div className="section-label">🚀 Explore Fields</div>
          <h2 className="section-title">Which Path Will You Hop?</h2>
          <p className="section-sub">SkillBun covers all major and emerging tech career paths for BCA, BSc, and B.Tech students.</p>
          <div className="fields-wrap">
            <div className="field-pill">🧠 AI & Machine Learning</div>
            <div className="field-pill">🌐 Full Stack Web Dev</div>
            <div className="field-pill">📱 Mobile Development</div>
            <div className="field-pill">🔐 Cybersecurity</div>
            <div className="field-pill">📊 Data Science & Analytics</div>
            <div className="field-pill">☁️ Cloud & DevOps</div>
            <div className="field-pill">🎮 Game Development</div>
            <div className="field-pill">🔗 Blockchain</div>
            <div className="field-pill">🤖 Robotics & Embedded</div>
            <div className="field-pill">🖥️ Systems Programming</div>
            <div className="field-pill">📡 Networking</div>
            <div className="field-pill">🧬 Bioinformatics</div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <div className="cta-section">
          <div className="cta-card">
            <div className="welcome-bunny" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💻</div>
            <h2>Ready to Hop In?</h2>
            <p>Join thousands of students who found their perfect tech career path with SkillBun. It's free to start.</p>
            <button onClick={() => openAuthModal('/quiz')} className="btn-primary" style={{ margin: '0 auto' }}>🐾 Start Your Quiz — It's Free</button>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <footer id="contact">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">🐰 ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
              <p>Hop into the right career. Helping BCA, BSc, and B.Tech students find their perfect tech path through AI-powered guidance and real peer connections.</p>
              <div className="footer-socials">
                <a className="social-btn" href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.2" />
                  </svg>
                </a>
                <a className="social-btn" href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a className="social-btn" href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a className="social-btn" href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="/quiz">Career Quiz</a></li>
                <li><a href="#careers">Career Paths</a></li>
                <li><a href="/counsellor">College Finder</a></li>
                <li><a href="/counsellor">Exam Guide</a></li>
                <li><a href="/counsellor">Courses</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Use</a></li>
                <li><a href="mailto:harsh@skillbun.tech">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 <span>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>. Made with 🐾 for India's tech students.</p>
            <div className="badge-bar">
              <span className="badge">BCA Friendly</span>
              <span className="badge">BS/BS-MS (AICS/CSDA)</span>
              <span className="badge">B.Tech(CS/IT)</span>
              <span className="badge">AI Powered</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== AUTH MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-logo">🐰 ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
            <div className="modal-desc">Login to Save your Roadmaps</div>
            
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div ref={googleBtnRef}></div>
              {isLoggingIn && (
                <p style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
                  🐰 Setting up your account...
                </p>
              )}
            </div>
            
            <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'center' }}>
              By logging in, you agree to our <a href="/terms" style={{ color: 'var(--green)' }}>Terms of Use</a> and <a href="/privacy" style={{ color: 'var(--green)' }}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
