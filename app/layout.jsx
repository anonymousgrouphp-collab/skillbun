import './globals.css';
import Link from 'next/link';
import UserMenu from './components/UserMenu';
import ThemeToggle from './components/ThemeToggle';

export const metadata = {
  title: 'SkillBun – Hop into the Right Career',
  description: 'SkillBun helps BCA, BSc, and B.Tech students find their perfect tech career path through AI-powered guidance and real peer connections.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#0D1117" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
        {/* Theme initialization — runs before paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var saved = localStorage.getItem('sb_theme');
              var valid = saved === 'light' || saved === 'dark';
              var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
              var t = valid ? saved : (prefersLight ? 'light' : 'dark');
              document.documentElement.setAttribute('data-theme', t);
              document.documentElement.style.colorScheme = t;
              var themeMeta = document.querySelector('meta[name="theme-color"]');
              if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0D1117' : '#F6F8FA');
            } catch(e){}
          })();
        `}} />
      </head>
      <body>
        <nav>
          <div className="nav-logo">
            <Link href="/" className="nav-logo-link">
              <img src="/logo.png" alt="SkillBun Logo" />
              <span className="mini-bunny"></span> ꌗꀘꀤ꒒꒒ꌃꀎꈤ
            </Link>
          </div>
          <ul className="nav-links">
            <li><Link href="/#features">Features</Link></li>
            <li><Link href="/#how">How it Works</Link></li>
            <li><Link href="/#careers">Career Paths</Link></li>
            <li><Link href="/counsellor">AI Counsellor</Link></li>
            <li><Link href="/#contact">Connect with us</Link></li>
          </ul>
          <div className="nav-cta">
            <ThemeToggle />
            <UserMenu />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
