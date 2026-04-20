import './globals.css';
import UserMenu from './components/UserMenu';

export const metadata = {
  title: 'SkillBun – Hop into the Right Career',
  description: 'SkillBun helps BCA, BSc, and B.Tech students find their perfect tech career path through AI-powered guidance and real peer connections.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav>
          <div className="nav-logo">
            <a href="/" className="nav-logo-link">
              <img src="/logo.png" alt="SkillBun Logo" />
              <span className="mini-bunny"></span> ꌗꀘꀤ꒒꒒ꌃꀎꈤ
            </a>
          </div>
          <ul className="nav-links">
            <li><a href="/#features">Features</a></li>
            <li><a href="/#how">How it Works</a></li>
            <li><a href="/#careers">Career Paths</a></li>
            <li><a href="/counsellor">AI Counsellor</a></li>
            <li><a href="/#contact">Connect with us</a></li>
          </ul>
          <div className="nav-cta">
            <UserMenu />
            <div className="mobile-dropdown-group">
              <a href="/quiz" className="btn-signup">Get Started 🚀</a>
              <button className="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
