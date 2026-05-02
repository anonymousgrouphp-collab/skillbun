import ComingSoon from '@/app/components/ComingSoon';

export const metadata = {
  title: 'Dashboard – SkillBun',
  description: 'Your personalized SkillBun dashboard is coming soon.',
};

export default function DashboardPage() {
  return (
    <ComingSoon 
      title="Dashboard is coming soon 🚀" 
      description="We're building a personalized dashboard to track your learning progress, saved paths, and career roadmap."
    />
  );
}
