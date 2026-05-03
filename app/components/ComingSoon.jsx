import Link from 'next/link';

export default function ComingSoon({ title = 'Coming Soon 🚀', description = 'We are working hard to bring this feature to life. Check back later!' }) {
  return (
    <div className="notfound-page">
      {/* Floating code snippets background */}
      <div className="notfound-floaters" aria-hidden="true">
        <span className="nf-floater" style={{ top: '12%', left: '8%', animationDelay: '0s' }}>git branch feature/new</span>
        <span className="nf-floater" style={{ top: '25%', right: '10%', animationDelay: '1.2s' }}>npm install patience</span>
        <span className="nf-floater" style={{ top: '60%', left: '5%', animationDelay: '2.4s' }}>await build()</span>
        <span className="nf-floater" style={{ top: '75%', right: '7%', animationDelay: '0.6s' }}>import {'{'} future {'}'} from 'skillbun'</span>
        <span className="nf-floater" style={{ top: '40%', left: '12%', animationDelay: '1.8s' }}>{'// TODO: ship it'}</span>
        <span className="nf-floater" style={{ top: '50%', right: '15%', animationDelay: '3s' }}>return &lt;Awesome /&gt;</span>
      </div>

      {/* Bunny mascot with building/excited expression */}
      <div className="notfound-bunny-wrap">
        <svg className="notfound-bunny-svg" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Ear — perked up */}
          <ellipse cx="68" cy="68" rx="16" ry="44" fill="#f0f0f0" transform="rotate(-10 68 68)" />
          <ellipse cx="68" cy="68" rx="8" ry="34" fill="#f9a8d4" transform="rotate(-10 68 68)" />
          {/* Right Ear — perked up */}
          <g className="nf-ear-wiggle">
            <ellipse cx="132" cy="68" rx="16" ry="44" fill="#f0f0f0" transform="rotate(10 132 68)" />
            <ellipse cx="132" cy="68" rx="8" ry="34" fill="#f9a8d4" transform="rotate(10 132 68)" />
          </g>
          {/* Body */}
          <ellipse cx="100" cy="170" rx="55" ry="45" fill="#f0f0f0" />
          {/* Head */}
          <circle cx="100" cy="118" r="46" fill="#f0f0f0" />
          {/* Eyes — starry/excited */}
          <g className="eye">
            <path d="M85 105 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#FFD700" />
          </g>
          <g className="eye">
            <path d="M115 105 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#FFD700" />
          </g>
          {/* Nose */}
          <ellipse cx="100" cy="126" rx="5" ry="3.5" fill="#f9a8d4" />
          {/* Mouth — smiling */}
          <path d="M93 130 Q100 136 107 130" stroke="#ccc" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="77" cy="122" r="9" fill="#fca5a5" opacity="0.5" />
          <circle cx="123" cy="122" r="9" fill="#fca5a5" opacity="0.5" />
          {/* Construction sign on tummy */}
          <rect x="72" y="152" width="56" height="30" rx="8" fill="var(--bg)" stroke="#FFB800" strokeWidth="1.5" />
          <text x="100" y="163" textAnchor="middle" fill="#FFB800" fontFamily="monospace" fontSize="8" fontWeight="bold">WIP</text>
          <text x="100" y="174" textAnchor="middle" fill="var(--muted)" fontFamily="monospace" fontSize="6">building...</text>
          {/* Paws */}
          <ellipse cx="60" cy="195" rx="15" ry="10" fill="#f0f0f0" />
          <ellipse cx="140" cy="195" rx="15" ry="10" fill="#f0f0f0" />
        </svg>
      </div>

      {/* Error content */}
      <div className="notfound-content">
        <span className="notfound-code" style={{ color: '#FFB800' }}>WIP</span>
        <h1 className="notfound-title">{title}</h1>
        <p className="notfound-desc">
          {description}
        </p>

        {/* Quick action buttons */}
        <div className="notfound-actions">
          <Link href="/" className="btn-primary notfound-btn-home">
            🏠 Back to Home
          </Link>
          <Link href="/counsellor" className="notfound-btn-secondary">
            🤖 Ask Bun-Bot
          </Link>
        </div>

        {/* Suggested pages */}
        <div className="notfound-suggestions">
          <p className="notfound-suggest-label">While you wait, explore:</p>
          <div className="notfound-suggest-links">
            <Link href="/quiz" className="notfound-suggest-pill">🐾 Career Quiz</Link>
            <Link href="/#careers" className="notfound-suggest-pill">🚀 Career Paths</Link>
            <Link href="/about" className="notfound-suggest-pill">ℹ️ About Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
