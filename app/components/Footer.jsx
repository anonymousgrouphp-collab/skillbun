import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <Image src="/logo.png" alt="SkillBun Logo" width={38} height={38} unoptimized />
            <span>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
          </div>
          <p>Hop into the right career. Helping computer science, software engineering, and tech students worldwide find their perfect path through AI-powered guidance and structured roadmaps.</p>
          <div className="footer-socials">
            <a className="social-btn" href="https://www.instagram.com/skillbun.tech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.2" />
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
            <li><Link href="/quiz">Career Quiz</Link></li>
            <li><Link href="/#careers">Career Roadmaps</Link></li>
            <li><Link href="/counsellor">BunBot</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
            <li><Link href="/certificate">Verify Certificate</Link></li>
            <li><Link href="/alumni">Alumni & Workforce Vault</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Use</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          © 2026 <span>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span> by Reish. Made with{' '}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--green)" stroke="var(--green)" strokeWidth="2" style={{ display: 'inline', verticalAlign: 'middle' }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>{' '}
          for tech students worldwide.
        </p>
        <div className="badge-bar">
          <span className="badge">Global Tech Paths</span>
          <span className="badge">CS & Software Engg</span>
          <span className="badge">100+ Free Roadmaps</span>
          <span className="badge">AI Powered</span>
        </div>
      </div>
    </footer>
  );
}
