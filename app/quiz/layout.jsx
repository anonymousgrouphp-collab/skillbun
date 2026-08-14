const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillbun.tech';

export const metadata = {
  title: 'Adaptive AI Tech Career Quiz | SkillBun',
  description: 'Take SkillBun’s adaptive technical assessment to evaluate your skills and find the ideal tech career path and learning roadmap.',
  alternates: {
    canonical: `${siteUrl}/quiz`,
  },
  openGraph: {
    title: 'Adaptive AI Tech Career Quiz | SkillBun',
    description: 'Evaluate your technical skills and find your ideal career path with SkillBun’s AI quiz.',
    url: `${siteUrl}/quiz`,
    siteName: 'SkillBun',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'SkillBun Career Quiz' }],
  },
};

export default function QuizLayout({ children }) {
  return children;
}
