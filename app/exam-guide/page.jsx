import ComingSoon from '@/app/components/ComingSoon';

export const metadata = {
  title: 'Exam Guide – SkillBun',
  description: 'SkillBun Exam Guide is coming soon.',
};

export default function ExamGuidePage() {
  return (
    <ComingSoon 
      title="Exam Guide is coming soon 📝" 
      description="Preparation guides and resources for important exams are currently being built."
    />
  );
}
