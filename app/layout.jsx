import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
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
            <UserMenu />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
