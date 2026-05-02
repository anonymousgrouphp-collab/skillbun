import ComingSoon from '@/app/components/ComingSoon';

export const metadata = {
  title: 'Courses – SkillBun',
  description: 'SkillBun Courses are coming soon.',
};

export default function CoursesPage() {
  return (
    <ComingSoon 
      title="Courses are coming soon 📚" 
      description="We're gathering the best resources and courses to help you master your chosen tech stack."
    />
  );
}
