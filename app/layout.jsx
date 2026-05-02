import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { Fredoka, Nunito } from 'next/font/google';
import UserMenu from './components/UserMenu';
import ThemeToggle from './components/ThemeToggle';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-fredoka',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata = {
  title: 'SkillBun – Hop into the Right Career',
  description: 'SkillBun helps BCA, BSc, and B.Tech students find their perfect tech career path through AI-powered guidance and real peer connections.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#F4F7F2" />
        {/* Theme initialization — runs before paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var saved = localStorage.getItem('sb_theme');
              var valid = saved === 'light' || saved === 'dark';
              var t = valid ? saved : 'light';
              document.documentElement.setAttribute('data-theme', t);
              document.documentElement.style.colorScheme = t;
              var themeMeta = document.querySelector('meta[name="theme-color"]');
              if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0D1117' : '#F4F7F2');
            } catch(e){}
          })();
        `}} />
      </head>
      <body>
        <nav>
          <div className="nav-logo">
            <Link href="/" className="nav-logo-link">
              <Image src="/logo.png" alt="SkillBun Logo" width={44} height={44} priority />
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
