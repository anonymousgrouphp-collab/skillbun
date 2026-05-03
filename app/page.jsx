'use client';
import { useEffect, useState } from 'react';
import { normalizeInternalPath } from '@/utils/shared/routes';

const FLOATER_TEXTS = [
  'console.log("career")', 'import skills', 'git commit -m "future"',
  'npm i success', 'def find_path():', 'SELECT * FROM jobs',
  '404: fear not found', 'while(learning) grow()', 'sudo make me a developer',
  '<BunBot />', '{ const path = "tech"; }', 'git checkout new-life',
  'try { succeed() } catch (e) { learn() }', 'public static void main()',
  'SELECT dream FROM opportunities'
];

const CODE_CHARS = ['0', '1', '</>', '{}', '[]', '//', 'def', 'fn', 'var', '&&', '||', '!=', 'if', 'for', 'git'];
const FLOATER_LEFT_LANES = [10, 18, 27, 35];
const FLOATER_RIGHT_LANES = [57, 65, 74, 82];
const CAREER_FIELD_LINKS = [
  { label: 'AI/ML Engineer', href: '/roadmap/ai_ml_engineer' },
  { label: 'Full Stack Developer', href: '/roadmap/fullstack' },
  { label: 'Android Developer', href: '/roadmap/android' },
  { label: 'iOS Developer', href: '/roadmap/ios_developer' },
  { label: 'Flutter Developer', href: '/roadmap/flutter_developer' },
  { label: 'React Native Developer', href: '/roadmap/react_native_developer' },
  { label: 'Cybersecurity Specialist', href: '/roadmap/cybersecurity' },
  { label: 'Data Science & AI', href: '/roadmap/data_science' },
  { label: 'Analytics Engineer', href: '/roadmap/analytics_engineer' },
  { label: 'DevOps & Cloud Engineer', href: '/roadmap/devops_cloud' },
  { label: 'Game Developer', href: '/roadmap/game_development' },
  { label: 'Blockchain/Web3 Developer', href: '/roadmap/blockchain_web3' },
  { label: 'Robotics Engineer', href: '/roadmap/robotics_engineer' },
  { label: 'Embedded & IoT Developer', href: '/roadmap/embedded_iot' },
  { label: 'C/C++ Systems Developer', href: '/roadmap/c_cpp_systems_developer' },
  { label: 'Network Engineer', href: '/roadmap/network_engineer' },
  { label: 'UI/UX Designer', href: '/roadmap/ui_ux_design' },
];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let timer;
    let authFrame;
    const shuffleTimeouts = [];
    const shuffleIntervals = [];
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authRequired') === 'true') {
      window.history.replaceState({}, '', '/');
      authFrame = window.requestAnimationFrame(() => {
        setShowSplash(false);
      });
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
      const timeoutId = window.setTimeout(() => {
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
        shuffleIntervals.push(iv);
      }, 3500 + idx * 400);
      shuffleTimeouts.push(timeoutId);
    });

    // Code Rain on splash
    const rainEl = document.getElementById('codeRain');
    if (rainEl) {
      rainEl.innerHTML = '';
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
      floatersEl.innerHTML = '';
      let leftLaneIndex = 0;
      let rightLaneIndex = 0;

      for (let i = 0; i < FLOATER_TEXTS.length; i++) {
        const floater = document.createElement('div');
        floater.className = 'floater';
        floater.textContent = FLOATER_TEXTS[i];
        const placeOnLeft = i % 2 === 0;
        const laneGroup = placeOnLeft ? FLOATER_LEFT_LANES : FLOATER_RIGHT_LANES;
        const laneIndex = placeOnLeft ? leftLaneIndex++ : rightLaneIndex++;
        const baseLeft = laneGroup[laneIndex % laneGroup.length];
        const jitter = (Math.random() - 0.5) * 4;
        floater.style.left = `${baseLeft + jitter}%`;
        floater.style.animationDuration = `${10 + Math.random() * 12}s`;
        floater.style.animationDelay = `${Math.random() * 8}s`;
        floatersEl.appendChild(floater);
      }
    }

    let revealObserver;
    const revealNodes = Array.from(document.querySelectorAll('.sb-reveal'));
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

      revealNodes.forEach((node) => revealObserver.observe(node));
    } else {
      revealNodes.forEach((node) => node.classList.add('is-visible'));
    }

    return () => {
      if (authFrame) {
        window.cancelAnimationFrame(authFrame);
      }
      clearTimeout(timer);
      shuffleTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      shuffleIntervals.forEach((intervalId) => window.clearInterval(intervalId));
      revealObserver?.disconnect();
      if (rainEl) rainEl.innerHTML = '';
      if (floatersEl) floatersEl.innerHTML = '';
    };
  }, []);

  const openAuthModal = (destination) => {
    localStorage.setItem('sb_dest', normalizeInternalPath(destination, '/quiz'));
    window.location.assign(`/onboarding?next=${encodeURIComponent(destination)}`);
  };

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
              <rect x="72" y="152" width="56" height="30" rx="8" fill="var(--bg)" stroke="#2ECC71" strokeWidth="1.5" />
              <text x="100" y="163" textAnchor="middle" fill="#2ECC71" fontFamily="monospace" fontSize="7">&lt;code&gt;</text>
              <text x="100" y="174" textAnchor="middle" fill="#A8FF3E" fontFamily="monospace" fontSize="7">career/&gt;</text>
              {/* Paws */}
              <ellipse cx="60" cy="195" rx="15" ry="10" fill="#f0f0f0" />
              <ellipse cx="140" cy="195" rx="15" ry="10" fill="#f0f0f0" />
            </svg>
          </div>
          <div className="splash-title">ꌗꀘꀤ꒒꒒ꌃꀎꈤ</div>
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
            <div className="hero-tag">For BCA · BSc · B.Tech Students</div>
            <h1>Your Tech <span className="shuffle-text" data-final="Career">Career</span>,<br /><span
              className="highlight">Engineered For <span className="shuffle-text" data-final="Success">Success</span>.</span></h1>
            <p>SkillBun turns career confusion into a guided system: profile setup, adaptive AI quiz, ranked career matches,
              interactive roadmaps, and Bun-Bot support for every next step.</p>
            <div className="hero-btns">
              <button onClick={() => openAuthModal('/quiz')} className="btn-primary">🐾 Take the Career Quiz</button>
              <a href="#features" className="btn-secondary hero-secondary">See the platform</a>
            </div>
            <div className="hero-signal-strip" aria-label="SkillBun guidance flow">
              <span>Profile</span>
              <span>Adaptive Quiz</span>
              <span>Career Match</span>
              <span>Roadmap</span>
            </div>
          </div>
        </div>

        {/* ===== STUDENT MOMENTS ===== */}
        <section className="sb-section sb-moments-section sb-reveal" aria-labelledby="student-moments-title">
          <div className="sb-moments-shell">
            <div className="sb-moments-copy">
              <div className="section-label">Sample student moments</div>
              <h2 id="student-moments-title" className="section-title">The kind of clarity SkillBun is built to create</h2>
              <p className="section-sub">Illustrative guidance moments, not testimonials. These show the journey SkillBun is designed to support before, during, and after the quiz.</p>
              <div className="sb-guidance-rhythm" aria-label="SkillBun guidance rhythm">
                <span>Profile context</span>
                <span>Adaptive quiz</span>
                <span>Roadmap support</span>
              </div>
            </div>

            <div className="sb-guidance-console" aria-label="Illustrative SkillBun guidance moments">
              <div className="sb-console-topline">
                <span className="sb-console-dot"></span>
                <span>skillbun.guidance.flow</span>
                <code>sample_mode: true</code>
              </div>

              <div className="sb-moment-rail" aria-hidden="true">
                <span></span>
              </div>

              <div className="sb-moment-grid">
                <article className="sb-moment-card before">
                  <span className="sb-moment-tag">Before</span>
                  <p>I like tech, but I don’t know where to start.</p>
                </article>

                <article className="sb-moment-card profile">
                  <span className="sb-moment-tag">Profile signal</span>
                  <h3>Context first</h3>
                  <p>Degree, year, interests, and learning confidence shape the first guidance layer.</p>
                  <div className="sb-signal-chips">
                    <span>BCA</span>
                    <span>2nd Year</span>
                    <span>Not sure yet</span>
                  </div>
                </article>

                <article className="sb-moment-card quiz">
                  <span className="sb-moment-tag">Quiz adapts</span>
                  <h3>Answers shape the next question</h3>
                  <p>If you lean toward building, data, security, or cloud, the quiz narrows instead of staying generic.</p>
                </article>

                <article className="sb-moment-card recommendation">
                  <span className="sb-moment-tag">Recommendation clarity</span>
                  <h3>Not just a career name</h3>
                  <p>Fit reason, skills, demand, salary context, and the next step sit together so comparison feels calmer.</p>
                </article>

                <article className="sb-moment-card roadmap">
                  <span className="sb-moment-tag">Roadmap + Bun-Bot</span>
                  <h3>Keep moving after results</h3>
                  <p>Open a skill tree, build projects, track progress, and ask Bun-Bot when a topic feels foggy.</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHAT SKILLBUN DOES ===== */}
        <section id="features" className="sb-section sb-reveal">
          <div className="section-label">SkillBun</div>
          <h2 className="section-title">A complete guidance system before you pick a tech path</h2>
          <p className="section-sub">Most students get scattered advice. SkillBun connects profile, quiz, recommendations, roadmaps, and counselling into one clear flow.</p>
          <div className="sb-capability-grid">
            <div className="sb-capability">
              <span className="sb-capability-kicker">01</span>
              <h3>Understand your starting point</h3>
              <p>Collect degree, year, interests, and confidence level so guidance starts from your real student context.</p>
            </div>
            <div className="sb-capability">
              <span className="sb-capability-kicker">02</span>
              <h3>Ask adaptive questions</h3>
              <p>The quiz changes direction based on your answers instead of forcing every student through the same form.</p>
            </div>
            <div className="sb-capability">
              <span className="sb-capability-kicker">03</span>
              <h3>Explain career matches</h3>
              <p>Recommendations include match strength, skills, demand, salary context, and next steps you can compare.</p>
            </div>
            <div className="sb-capability">
              <span className="sb-capability-kicker">04</span>
              <h3>Turn decisions into action</h3>
              <p>Native roadmap pages break careers into staged skill trees, projects, resources, and progress checkpoints.</p>
            </div>
          </div>
        </section>

        {/* ===== JOURNEY ===== */}
        <section id="how" className="sb-section sb-reveal">
          <div className="section-label">The Journey</div>
          <h2 className="section-title">From confused student to focused roadmap</h2>
          <p className="section-sub">The public homepage stays open for every viewer. When you are ready, the same CTA takes you through onboarding, quiz, recommendation, and roadmap.</p>
          <div className="sb-journey" aria-label="SkillBun user journey">
            <div className="sb-journey-line"></div>
            <div className="sb-journey-step">
              <div className="sb-journey-dot">1</div>
              <h3>Explore the platform</h3>
              <p>Understand what SkillBun can do before sharing details or starting the quiz.</p>
            </div>
            <div className="sb-journey-step">
              <div className="sb-journey-dot">2</div>
              <h3>Enter profile details</h3>
              <p>Tell SkillBun your name, degree, current year, and optional interest area.</p>
            </div>
            <div className="sb-journey-step">
              <div className="sb-journey-dot">3</div>
              <h3>Take the adaptive quiz</h3>
              <p>Answer focused questions about interests, strengths, learning style, and goals.</p>
            </div>
            <div className="sb-journey-step">
              <div className="sb-journey-dot">4</div>
              <h3>Open your roadmap</h3>
              <p>Use your recommended skill tree to learn, build projects, and ask Bun-Bot for help.</p>
            </div>
          </div>
        </section>

        {/* ===== AI QUIZ ENGINE ===== */}
        <section className="sb-section sb-split sb-reveal">
          <div className="sb-copy-block">
            <div className="section-label">AI Quiz Engine</div>
            <h2 className="section-title">A quiz that behaves more like a career interview</h2>
            <p className="section-sub">SkillBun asks 10 to 18 questions, adapts to your responses, and waits until it has enough signal before recommending careers.</p>
            <div className="sb-check-list">
              <span>Interest, strengths, and learning-style discovery</span>
              <span>Branching questions that narrow the path</span>
              <span>Human verification and rate limits stay protected</span>
            </div>
          </div>
          <div className="sb-quiz-panel" aria-label="Adaptive quiz preview">
            <div className="sb-panel-top">
              <span>Phase 1: Discovery</span>
              <span>Question 7 / 15</span>
            </div>
            <div className="sb-progress-shell"><span></span></div>
            <h3>Which problem sounds exciting to solve?</h3>
            <div className="sb-answer-stack">
              <div className="sb-answer active">Making apps that people use daily</div>
              <div className="sb-answer">Finding hidden patterns in data</div>
              <div className="sb-answer">Protecting systems from attacks</div>
              <div className="sb-answer">Automating cloud deployments</div>
            </div>
          </div>
        </section>

        {/* ===== RECOMMENDATION OUTPUT ===== */}
        <section className="sb-section sb-reveal">
          <div className="section-label">Career Recommendations</div>
          <h2 className="section-title">Results that explain why a path fits you</h2>
          <p className="section-sub">The quiz does not stop at a career name. It gives you context you can actually use while deciding what to learn next.</p>
          <div className="sb-results-showcase">
            <div className="sb-result-card sb-result-primary">
              <div className="sb-result-meta">
                <span>Top Match</span>
                <strong>94%</strong>
              </div>
              <h3>Full Stack Developer</h3>
              <p>Best fit if you enjoy building visible products, connecting interfaces to data, and learning by shipping projects.</p>
              <div className="sb-mini-tags">
                <span>React</span>
                <span>APIs</span>
                <span>Databases</span>
              </div>
            </div>
            <div className="sb-result-card">
              <div className="sb-result-meta">
                <span>Strong Fit</span>
                <strong>88%</strong>
              </div>
              <h3>Data Analyst</h3>
              <p>Great for students who like finding meaning in numbers, dashboards, and business decisions.</p>
              <div className="sb-mini-tags">
                <span>SQL</span>
                <span>Excel</span>
                <span>BI</span>
              </div>
            </div>
            <div className="sb-result-card">
              <div className="sb-result-meta">
                <span>Explore</span>
                <strong>82%</strong>
              </div>
              <h3>Cybersecurity</h3>
              <p>A solid path if you enjoy puzzles, systems thinking, and protecting users from real-world threats.</p>
              <div className="sb-mini-tags">
                <span>Networks</span>
                <span>Linux</span>
                <span>Security</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ROADMAP PREVIEW ===== */}
        <section className="sb-section sb-split sb-split-reverse sb-reveal">
          <div className="sb-roadmap-preview" aria-label="Roadmap preview">
            <div className="sb-roadmap-node root">
              <span>&lt;/&gt;</span>
              <strong>Career Core</strong>
            </div>
            <div className="sb-roadmap-branches">
              <div className="sb-roadmap-node"><span>01</span><strong>Foundations</strong></div>
              <div className="sb-roadmap-node"><span>02</span><strong>Projects</strong></div>
              <div className="sb-roadmap-node"><span>03</span><strong>Portfolio</strong></div>
            </div>
            <div className="sb-roadmap-pulse"></div>
          </div>
          <div className="sb-copy-block">
            <div className="section-label">Interactive Roadmaps</div>
            <h2 className="section-title">Every recommendation becomes a skill tree</h2>
            <p className="section-sub">Roadmaps are not static PDFs. They unlock step-by-step, track local progress, include resources, and let you ask Bun-Bot about any topic.</p>
            <div className="sb-check-list">
              <span>Skill nodes with prerequisite flow</span>
              <span>Portfolio-ready project checkpoints</span>
              <span>Progress, XP, resources, and Bun-Bot help</span>
            </div>
          </div>
        </section>

        {/* ===== BUN BOT ===== */}
        <section className="sb-section sb-split sb-reveal">
          <div className="sb-copy-block">
            <div className="section-label">Bun-Bot Counsellor</div>
            <h2 className="section-title">A career companion after the result screen</h2>
            <p className="section-sub">Students can ask follow-up questions about salaries, languages, certifications, exams, colleges, and day-in-the-life tradeoffs.</p>
            <a href="/counsellor" className="btn-secondary sb-inline-link">Open Bun-Bot</a>
          </div>
          <div className="sb-bot-window" aria-label="Bun-Bot preview">
            <div className="sb-bot-header">
              <span className="status-dot"></span>
              <strong>Bun-Bot online</strong>
            </div>
            <div className="sb-bot-message bot">Ask me why Full Stack, Data, or Cybersecurity fits your profile.</div>
            <div className="sb-bot-message user">Which path is best if I like building projects?</div>
            <div className="sb-bot-message bot">Start with Full Stack, compare Backend next, then use the roadmap to build proof.</div>
          </div>
        </section>

        {/* ===== CAREER FIELDS ===== */}
        <section id="careers" className="sb-section sb-reveal" style={{ paddingTop: 0 }}>
          <div className="section-label">Explore Fields</div>
          <h2 className="section-title">Which path will you hop?</h2>
          <p className="section-sub">SkillBun covers major and emerging tech roles for BCA, BSc, BS/BS-MS, and B.Tech students.</p>
          <div className="fields-wrap">
            {CAREER_FIELD_LINKS.map((field) => (
              <a className="field-pill" href={field.href} key={field.href}>{field.label}</a>
            ))}
          </div>
        </section>

        {/* ===== TRUST ===== */}
        <section className="sb-section sb-trust-section sb-reveal">
          <div className="section-label">Why It Feels Different</div>
          <h2 className="section-title">Detailed enough for decisions, friendly enough to start today</h2>
          <div className="sb-trust-grid">
            <div>
              <strong>Student-first</strong>
              <p>Built around degree, year, uncertainty, and practical learning constraints.</p>
            </div>
            <div>
              <strong>Action-oriented</strong>
              <p>Recommendations connect directly to roadmaps, projects, and follow-up help.</p>
            </div>
            <div>
              <strong>Safe by design</strong>
              <p>Existing validation, rate limits, and human-verification protections remain intact.</p>
            </div>
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
                <a className="social-btn" href="https://www.instagram.com/skillbun.tech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.2" />
                  </svg>
                </a>
                <a className="social-btn" href="/coming-soon" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a className="social-btn" href="https://www.youtube.com/@TeamCosmic-d4e" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a className="social-btn" href="https://www.linkedin.com/company/skillbun-tech/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
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
                <li><a href="#careers">Career Roadmaps</a></li>
                <li><a href="/counsellor">AI Counsellor</a></li>
                <li><a href="/dashboard">Dashboard</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Use</a></li>
                <li><a href="/contact">Contact Us</a></li>
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

    </>
  );
}
