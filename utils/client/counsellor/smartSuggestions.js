'use client';

// Smart Suggestion Engine for BunBot
// Generates personalized initial prompt starters & context-aware follow-up chips

export function getPersonalizedInitialChips(profile = {}) {
  const degree = String(profile.degree || '').toLowerCase();
  const year = String(profile.year || '').toLowerCase();

  const isBcaOrBsc = degree.includes('bca') || degree.includes('bsc') || degree.includes('b.sc');
  const isBtech = degree.includes('b.tech') || degree.includes('btech') || degree.includes('be');
  const isBootcampOrSelf = degree.includes('bootcamp') || degree.includes('self-taught') || degree.includes('pre-college');
  const isSenior = year.includes('3rd') || year.includes('4th') || year.includes('final') || year.includes('graduat');

  if (isBootcampOrSelf) {
    return [
      { icon: '🚀', text: 'How to land a junior developer job without a traditional CS degree?' },
      { icon: '💻', text: 'Top 3 fullstack portfolio projects to impress recruiters?' },
      { icon: '🌐', text: 'Global remote junior developer salaries in USD ($)?' },
      { icon: '📄', text: 'Open source contributions vs personal projects for resume?' },
      { icon: '📜', text: 'How to earn a SkillBun Verifiable Certificate?' }
    ];
  }

  if (isBcaOrBsc && !isSenior) {
    return [
      { icon: '🚀', text: 'BCA / B.Sc to 6-Figure Tech Career Playbook?' },
      { icon: '💻', text: 'Web Dev vs AI/ML: Which track is best for freshers?' },
      { icon: '📚', text: 'Master\'s degree vs Direct Junior Developer Job?' },
      { icon: '📄', text: 'Best resume projects for 1st/2nd year tech students?' },
      { icon: '💰', text: 'Junior software engineer salaries ($ / LPA benchmarks)?' }
    ];
  }

  if (isBcaOrBsc && isSenior) {
    return [
      { icon: '💼', text: 'Off-campus tech hiring playbook for fresh graduates?' },
      { icon: '🎓', text: 'Top Master\'s degree & higher studies options in CS?' },
      { icon: '⚡', text: 'Fullstack Developer vs DevOps for fastest hiring?' },
      { icon: '📄', text: 'How to get LinkedIn referrals as a fresh graduate?' },
      { icon: '📜', text: 'How to earn a SkillBun Verifiable Certificate?' }
    ];
  }

  if ((isBtech || degree.includes('computer science') || degree.includes('software')) && isSenior) {
    return [
      { icon: '💰', text: 'FAANG & Top Tech Company salaries (USD $ & LPA)?' },
      { icon: '🌐', text: 'MERN vs Next.js: What modern product companies want?' },
      { icon: '🛡️', text: 'Cybersecurity vs Cloud DevOps salary & growth spectrum?' },
      { icon: '📄', text: 'Resume formatting & GitHub portfolio best practices?' },
      { icon: '🎯', text: 'System Design & DSA preparation strategy for freshers?' }
    ];
  }

  // Default Global Computer Science / Tech Student Initial Chips
  return [
    { icon: '💰', text: 'Global salary spectrum for Data Scientists & ML Engineers?' },
    { icon: '⚡', text: 'Python vs Java vs Go: Which language for tech careers?' },
    { icon: '☁️', text: 'Best certifications & roadmaps for Cloud & DevOps?' },
    { icon: '📅', text: 'Day in the life of a Fullstack Software Engineer?' },
    { icon: '🔐', text: 'How to break into Cybersecurity as a college student?' }
  ];
}

export function getFollowUpSuggestions(lastUserMsg = '', botAnswer = '') {
  const query = (lastUserMsg + ' ' + botAnswer).toLowerCase();

  // 1. Web Dev / Fullstack / Frontend / Backend Topic
  if (/web|frontend|backend|fullstack|react|node|javascript|html|css|next\.js|mern/i.test(query)) {
    return [
      { icon: '⚡', text: 'Frontend vs Backend vs Fullstack: Which path to pick?' },
      { icon: '💰', text: 'Junior Fullstack Developer salary spectrum ($ & LPA)?' },
      { icon: '🚀', text: 'Top 3 Fullstack projects for resume to stand out?' },
      { icon: '📜', text: 'How to earn SkillBun Fullstack Certificate?' },
      { icon: '🌐', text: 'Is Next.js mandatory after learning React?' }
    ];
  }

  // 2. AI / ML / Data Science Topic
  if (/ai|machine learning|data science|ml|python|deep learning|data analyst|nlp|prompt/i.test(query)) {
    return [
      { icon: '🤖', text: 'Python libraries needed for Machine Learning?' },
      { icon: '💰', text: 'AI/ML Engineer salary in Big Tech vs Global Startups?' },
      { icon: '🧠', text: 'Math & Statistics required for Data Science?' },
      { icon: '🚀', text: 'Beginner AI project ideas to publish on GitHub?' },
      { icon: '📊', text: 'Data Analyst vs Data Scientist: Key differences?' }
    ];
  }

  // 3. Cybersecurity / Hacking Topic
  if (/security|cyber|hacking|ethical|bug bounty|ceh|network|linux|pentest/i.test(query)) {
    return [
      { icon: '🛡️', text: 'Which cybersecurity certifications carry real weight?' },
      { icon: '🐧', text: 'Why are Linux & networking skills mandatory for Security?' },
      { icon: '💰', text: 'Global Cybersecurity Analyst salary & demand?' },
      { icon: '🚀', text: 'How to start Bug Bounty hunting as a student?' },
      { icon: '📜', text: 'SkillBun Cybersecurity Roadmap details?' }
    ];
  }

  // 4. Cloud / DevOps Topic
  if (/devops|cloud|aws|azure|gcp|docker|kubernetes|linux|ci\/cd|terraform/i.test(query)) {
    return [
      { icon: '☁️', text: 'AWS vs Azure vs GCP: Which cloud provider to learn first?' },
      { icon: '🐳', text: 'Docker vs Kubernetes explained simply for students?' },
      { icon: '💰', text: 'DevOps & Cloud Engineer global salary spectrum?' },
      { icon: '🛠️', text: 'How to set up a CI/CD pipeline project for resume?' },
      { icon: '🗺️', text: 'SkillBun DevOps & Cloud Roadmap guide?' }
    ];
  }

  // 5. Salary / Placements / Resume / Referral Topic
  if (/salary|lpa|package|placement|resume|referral|linkedin|off campus|tier 3|remote/i.test(query)) {
    return [
      { icon: '📈', text: 'Global tech salaries: Big Tech vs Remote Startups ($ & LPA)?' },
      { icon: '📄', text: 'How to structure tech resume for global recruiter screening?' },
      { icon: '💼', text: 'Junior tech hiring playbook without prior experience?' },
      { icon: '🤝', text: 'How to message engineering leads on LinkedIn politely?' },
      { icon: '📜', text: 'SkillBun Verifiable Certificates overview?' }
    ];
  }

  // 6. Generic Smart Fallback Follow-Ups
  return [
    { icon: '🎓', text: 'Which certifications carry real weight internationally?' },
    { icon: '🚀', text: 'How to get real-world internship experience in college?' },
    { icon: '🗺️', text: 'Which SkillBun roadmap should I follow next?' },
    { icon: '💰', text: 'Highest paying tech skills worldwide for 2026?' },
    { icon: '📜', text: 'How do SkillBun proctored exams work?' }
  ];
}

const GLOBAL_CHIP_POOL = [
  { icon: '💰', text: 'Salary spectrum for Data Scientists ($ / LPA)?' },
  { icon: '⚡', text: 'Python vs Java vs Go: Which language for tech careers?' },
  { icon: '☁️', text: 'Best certs & roadmaps for Cloud & DevOps?' },
  { icon: '📅', text: 'Day in the life of a Fullstack Developer?' },
  { icon: '🔐', text: 'How to break into Cybersecurity in 2026?' },
  { icon: '🚀', text: '6-Figure Tech Career Playbook for Freshers?' },
  { icon: '🎓', text: 'CS Degree vs Bootcamp vs Self-Taught Developer?' },
  { icon: '📄', text: 'Top 3 project ideas for GitHub resume?' },
  { icon: '🛡️', text: 'Which security certifications carry industry weight?' },
  { icon: '📈', text: 'Global tech compensation: Big Tech vs Startups?' },
  { icon: '🌐', text: 'MERN vs Next.js for high-growth startup jobs?' },
  { icon: '🤝', text: 'How to politely ask for LinkedIn tech referrals?' },
  { icon: '🤖', text: 'Python libraries needed for Machine Learning?' },
  { icon: '💼', text: 'Junior developer hiring playbook for freshers?' },
  { icon: '📜', text: 'How to earn SkillBun Verifiable Certificate?' }
];

export function getRandomShuffledChips() {
  const shuffled = [...GLOBAL_CHIP_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}
