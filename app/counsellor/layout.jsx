const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillbun.com';

export const metadata = {
  title: 'Bun-Bot – AI Career Counsellor & Tech Advisor | SkillBun',
  description: 'Chat 24/7 with Bun-Bot, SkillBun’s AI-powered career counsellor, for personalized guidance, resume tips, and technical roadmap advice.',
  alternates: {
    canonical: `${siteUrl}/counsellor`,
  },
  openGraph: {
    title: 'Bun-Bot – AI Career Counsellor & Tech Advisor | SkillBun',
    description: 'Chat 24/7 with Bun-Bot, SkillBun’s AI-powered career counsellor, for personalized guidance and roadmap advice.',
    url: `${siteUrl}/counsellor`,
    siteName: 'SkillBun',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Bun-Bot AI Advisor' }],
  },
};

export default function CounsellorLayout({ children }) {
  return children;
}
