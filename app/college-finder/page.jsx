import ComingSoon from '@/app/components/ComingSoon';

export const metadata = {
  title: 'College Finder – SkillBun',
  description: 'SkillBun College Finder is coming soon.',
};

export default function CollegeFinderPage() {
  return (
    <ComingSoon 
      title="College Finder is coming soon 🎓" 
      description="We're curating a comprehensive list of colleges for BCA, BSc, and B.Tech students. Check back soon!"
    />
  );
}
