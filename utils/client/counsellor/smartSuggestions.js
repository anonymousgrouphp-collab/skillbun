'use client';

// Smart Suggestion Engine for SkillBun AI Counsellor
// Generates personalized initial prompt starters & context-aware follow-up chips

export function getPersonalizedInitialChips(profile = {}) {
  const degree = String(profile.degree || '').toLowerCase();
  const year = String(profile.year || '').toLowerCase();

  const isBcaOrBsc = degree.includes('bca') || degree.includes('bsc');
  const isBtech = degree.includes('b.tech') || degree.includes('btech') || degree.includes('be');
  const isSenior = year.includes('3rd') || year.includes('4th') || year.includes('final');

  if (isBcaOrBsc && !isSenior) {
    return [
      { icon: '🚀', text: 'BCA to High Package Tech Career Playbook?' },
      { icon: '💻', text: 'Web Dev vs AI/ML: Which is best for BCA?' },
      { icon: '📚', text: 'NIMCET MCA vs Direct Off-Campus Job?' },
      { icon: '📄', text: 'Best resume projects for 1st/2nd year BCA?' },
      { icon: '💰', text: 'Fresh graduate software engineer salaries in India?' }
    ];
  }

  if (isBcaOrBsc && isSenior) {
    return [
      { icon: '💼', text: 'BCA Off-Campus Placement Playbook for Tier 3?' },
      { icon: '🎓', text: 'NIMCET Exam strategy & top NIT MCA seats?' },
      { icon: '⚡', text: 'Fullstack Developer vs DevOps for fast hiring?' },
      { icon: '📄', text: 'How to get LinkedIn referrals as a BCA graduate?' },
      { icon: '📜', text: 'How to earn SkillBun Verifiable Certificate?' }
    ];
  }

  if (isBtech && isSenior) {
    return [
      { icon: '💰', text: 'FAANG & Top Product Company salaries in LPA?' },
      { icon: '🌐', text: 'MERN vs Next.js: What product companies want?' },
      { icon: '🛡️', text: 'Cybersecurity vs Cloud DevOps salary spectrum?' },
      { icon: '📄', text: 'Resume formatting & GitHub portfolio tips?' },
      { icon: '🎯', text: 'GATE CS/DA vs Off-Campus Product Roles?' }
    ];
  }

  // Default B.Tech / General Tech Student Initial Chips
  return [
    { icon: '💰', text: 'Salary spectrum for Data Scientist in India?' },
    { icon: '⚡', text: 'Python vs Java: Which one for placements?' },
    { icon: '☁️', text: 'Best certs & roadmaps for Cloud DevOps?' },
    { icon: '📅', text: 'Day in the life of a Fullstack Developer?' },
    { icon: '🔐', text: 'How to break into Cybersecurity in India?' }
  ];
}

export function getFollowUpSuggestions(lastUserMsg = '', botAnswer = '') {
  const query = (lastUserMsg + ' ' + botAnswer).toLowerCase();

  // 1. Web Dev / Fullstack / Frontend / Backend Topic
  if (/web|frontend|backend|fullstack|react|node|javascript|html|css|next\.js|mern/i.test(query)) {
    return [
      { icon: '⚡', text: 'Frontend vs Backend vs Fullstack: Which path to pick?' },
      { icon: '💰', text: 'Fresh Fullstack Developer salary spectrum in India?' },
      { icon: '🚀', text: 'Top 3 Fullstack projects for resume to stand out?' },
      { icon: '📜', text: 'How to earn SkillBun Fullstack Certificate?' },
      { icon: '🌐', text: 'Is Next.js mandatory after learning React?' }
    ];
  }

  // 2. AI / ML / Data Science Topic
  if (/ai|machine learning|data science|ml|python|deep learning|data analyst|nlp|prompt/i.test(query)) {
    return [
      { icon: '🤖', text: 'Python libraries needed for Machine Learning?' },
      { icon: '💰', text: 'AI/ML Engineer salary in FAANG vs Indian startups?' },
      { icon: '🧠', text: 'Math & Statistics required for Data Science?' },
      { icon: '🚀', text: 'Beginner AI project ideas to publish on GitHub?' },
      { icon: '📊', text: 'Data Analyst vs Data Scientist: Key differences?' }
    ];
  }

  // 3. Cybersecurity / Hacking Topic
  if (/security|cyber|hacking|ethical|bug bounty|ceh|network|linux|pentest/i.test(query)) {
    return [
      { icon: '🛡️', text: 'Is CEH certification worth it for freshers?' },
      { icon: '🐧', text: 'Why is Linux skills mandatory for Ethical Hacking?' },
      { icon: '💰', text: 'Cybersecurity Analyst salary in India?' },
      { icon: '🚀', text: 'How to start Bug Bounty hunting as a student?' },
      { icon: '📜', text: 'SkillBun Cybersecurity Roadmap details?' }
    ];
  }

  // 4. Cloud / DevOps Topic
  if (/devops|cloud|aws|azure|gcp|docker|kubernetes|linux|ci\/cd|terraform/i.test(query)) {
    return [
      { icon: '☁️', text: 'AWS vs Azure vs GCP: Which cloud provider to learn first?' },
      { icon: '🐳', text: 'Docker vs Kubernetes explained simply for students?' },
      { icon: '💰', text: 'DevOps Engineer salary in LPA in India?' },
      { icon: '🛠️', text: 'How to set up a CI/CD pipeline project for resume?' },
      { icon: '🗺️', text: 'SkillBun DevOps & Cloud Roadmap guide?' }
    ];
  }

  // 5. Salary / Placements / Resume / Referral Topic
  if (/salary|lpa|package|placement|resume|referral|linkedin|off campus|tier 3/i.test(query)) {
    return [
      { icon: '📈', text: 'Service vs Product company salaries in India?' },
      { icon: '📄', text: 'How to structure tech resume for referral calls?' },
      { icon: '💼', text: 'Tier-3 Off-Campus Hiring Playbook?' },
      { icon: '🤝', text: 'How to message tech leads on LinkedIn politely?' },
      { icon: '📜', text: 'SkillBun Verifiable Certificates overview?' }
    ];
  }

  // 6. Generic Smart Fallback Follow-Ups
  return [
    { icon: '🎓', text: 'Which certifications carry real weight on LinkedIn?' },
    { icon: '🚀', text: 'How to get real-world internship experience in college?' },
    { icon: '🗺️', text: 'Which SkillBun roadmap should I follow next?' },
    { icon: '💰', text: 'Highest paying tech skills in India for 2026?' },
    { icon: '📜', text: 'How do SkillBun proctored exams work?' }
  ];
}

const GLOBAL_CHIP_POOL = [
  { icon: '💰', text: 'Salary spectrum for Data Scientist in India?' },
  { icon: '⚡', text: 'Python vs Java: Which one for placements?' },
  { icon: '☁️', text: 'Best certs & roadmaps for Cloud DevOps?' },
  { icon: '📅', text: 'Day in the life of a Fullstack Developer?' },
  { icon: '🔐', text: 'How to break into Cybersecurity in India?' },
  { icon: '🚀', text: 'BCA to High Package Tech Career Playbook?' },
  { icon: '🎓', text: 'NIMCET Exam strategy & top NIT MCA seats?' },
  { icon: '📄', text: 'Top 3 project ideas for GitHub resume?' },
  { icon: '🛡️', text: 'Is CEH certification worth it for freshers?' },
  { icon: '📈', text: 'Service vs Product company salaries in LPA?' },
  { icon: '🌐', text: 'MERN vs Next.js for product startup jobs?' },
  { icon: '🤝', text: 'How to politely ask for LinkedIn referrals?' },
  { icon: '🤖', text: 'Python libraries needed for Machine Learning?' },
  { icon: '💼', text: 'Off-campus hiring playbook for Tier-3 college?' },
  { icon: '📜', text: 'How to earn SkillBun Verifiable Certificate?' }
];

export function getRandomShuffledChips() {
  const shuffled = [...GLOBAL_CHIP_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}
