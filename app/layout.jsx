import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { Fredoka, Nunito } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import UserMenu from './components/UserMenu';
import ThemeToggle from './components/ThemeToggle';
import SearchBar from './components/SearchBar';
import { AuthProvider } from './components/AuthProvider';
import AnalyticsProvider from './components/AnalyticsProvider';
import Footer from './components/Footer';

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillbun.tech';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SkillBun – 100% Free AI Tech Career Roadmaps & Verified Certifications',
    template: '%s | SkillBun',
  },
  description: 'SkillBun is a 100% Free AI-powered career discovery platform for BCA, BSc, B.Tech, and MCA students. Explore 100+ free step-by-step career roadmaps, adaptive AI quizzes, Bun-Bot AI counsellor, and earn free verified digital certificates.',
  keywords: [
    'SkillBun',
    'Free Tech Career Roadmaps',
    'Free Developer Certifications',
    'Free AI Career Counsellor',
    'Free Coding Quiz',
    'BCA Career Guide',
    'BTech Skill Trees',
    'Frontend Roadmap Free',
    'Backend Roadmap Free',
    'AI ML Roadmap Free',
    'Software Developer Career',
    'SkillBun Certifications Free',
    'Student Career Discovery',
  ],
  authors: [{ name: 'SkillBun Team', url: siteUrl }],
  creator: 'SkillBun',
  publisher: 'SkillBun',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SkillBun – 100% Free AI Tech Career Roadmaps & Verified Certifications',
    description: '100% Free tech career roadmaps, adaptive AI quizzes, Bun-Bot AI mentor, and verified certificates for BCA, BSc, B.Tech, and MCA students.',
    url: siteUrl,
    siteName: 'SkillBun',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'SkillBun Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillBun – 100% Free AI Tech Career Roadmaps & Certifications',
    description: '100% Free AI guidance, 100+ tech career roadmaps, adaptive quizzes, and free verified certificates for students.',
    images: ['/logo.png'],
    creator: '@SkillBun',
  },
};

const jsonLdStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'SkillBun',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      image: `${siteUrl}/logo.png`,
      description: 'SkillBun helps BCA, BSc, B.Tech, and MCA tech students find their ideal career path through 100% free AI guidance, 100+ structured roadmaps, and free verified certificates.',
      isAccessibleForFree: true,
      sameAs: [
        'https://github.com/skillbun',
        'https://linkedin.com/company/skillbun',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'SkillBun',
      description: '100% Free AI-powered tech career discovery, adaptive quizzes, and verified roadmaps.',
      isAccessibleForFree: true,
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/roadmap?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is SkillBun completely free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! SkillBun is 100% free for all students. All 100+ tech career roadmaps, study guides, adaptive AI quizzes, Bun-Bot AI counsellor chats, and official verified certificates are completely free with zero hidden paywalls or subscription fees.',
          },
        },
        {
          '@type': 'Question',
          name: 'What features does SkillBun offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SkillBun provides 100+ step-by-step career roadmaps (AI/ML, Fullstack, DevOps, Cybersecurity, Mobile), an adaptive technical quiz engine, Bun-Bot AI career counsellor, interactive study guides, and free proctored digital certifications.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do SkillBun career roadmaps work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Each SkillBun roadmap breaks down complex tech roles into interactive topic nodes with curated study guides, video tutorials, milestone projects, and clear skill milestones.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I earn a free SkillBun Certificate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When you achieve at least 60% progress on any career roadmap, you unlock the free certification exam. Passing the 10-question adaptive assessment (scoring 70% or higher) earns a publicly verifiable digital certificate at zero cost.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#F4F7F2" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
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
        <a href="#main-content" className="skip-nav">Skip to content</a>
        <AuthProvider>
          <AnalyticsProvider>
            <nav>
              <div className="nav-logo">
                <Link href="/" className="nav-logo-link">
                  <Image src="/logo.png" alt="SkillBun Logo" width={38} height={38} priority unoptimized />
                  <span>ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
                </Link>
              </div>
              <SearchBar />

              <div className="nav-cta">
                <ThemeToggle />
                <UserMenu />
              </div>
            </nav>
            <main id="main-content">{children}</main>
            <Footer />
          </AnalyticsProvider>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId="G-XTFMS5Q59C" />
    </html>
  );
}
