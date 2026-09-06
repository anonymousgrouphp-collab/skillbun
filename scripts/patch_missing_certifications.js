const fs = require('fs');
const path = require('path');

const CERTS_MAP = {
  blockchain_web3: ['Certified Ethereum Developer', 'Certified Smart Contract Security Professional (CSCSP)'],
  content_designer: ['UX Content Design Certified (Content Design London)', 'Nielsen Norman Group UX Certification'],
  data_visualization_specialist: ['Data Visualization Society Certified Member', 'Tableau Desktop Specialist'],
  design_systems_engineer: ['W3C Web Accessibility Specialist', 'Meta Front-End Developer Certificate'],
  desktop_app_developer: ['Linux Foundation Certified Software Developer', 'Microsoft Certified: Developer Associate'],
  elixir_phoenix_developer: ['Functional Programming Foundation Certificate', 'BEAM Architecture Specialist'],
  embedded_iot: ['Arm Certified Engineer: Architecture', 'IEEE Embedded Systems Certification'],
  flutter_developer: ['Google Associate Android Developer Certification', 'Meta Mobile Specialization'],
  game_development: ['Unity Certified Associate Programmer', 'Unreal Engine Associate Badge'],
  macos_developer: ['Apple Certified Mac Professional', 'Meta iOS Developer Professional Certificate'],
  no_code_low_code_developer: ['Bubble Developer Certification', 'Webflow Certified Expert'],
  observability_engineer: ['Prometheus Certified Associate (PCA)', 'Datadog Certified Core Engineer'],
  platform_engineer: ['Certified Kubernetes Administrator (CKA)', 'HashiCorp Certified: Terraform Associate'],
  prompt_engineer: ['DeepLearning.AI Prompt Engineering for Developers', 'AWS Certified AI Practitioner'],
  recommendation_systems_engineer: ['TensorFlow Developer Certificate', 'AWS Certified Machine Learning - Specialty'],
  reinforcement_learning_engineer: ['DeepLearning.AI Reinforcement Learning Specialization', 'Deep Reinforcement Learning Nanodegree'],
  release_engineer: ['Linux Foundation Certified DevOps Engineer', 'GitHub Actions Certified'],
  robotics_engineer: ['ROS 2 Developer Certificate', 'IEEE Robotics & Automation Certification'],
  seo_specialist: ['Google Search Central SEO Expert', 'Semrush Certified Technical SEO Professional'],
  service_designer: ['Service Design Network (SDN) Accredited Practitioner', 'Nielsen Norman Group UX Master Certified'],
  speech_ai_engineer: ['DeepLearning.AI Audio & Speech Processing Specialization', 'AWS Certified Machine Learning - Specialty'],
  technical_artist: ['Epic Games Unreal Engine Technical Artist Badge', 'Autodesk Certified Professional (Maya/3ds Max)'],
  technical_support_engineer: ['ITIL 4 Foundation Certification', 'CompTIA A+ Core Certification'],
  unreal_engine_developer: ['Epic Games Unreal Engine Associate Badge', 'Unreal Engine Developer Specialization'],
  wordpress_developer: ['WordPress Core Contributor Credential', 'Yoast SEO Certified Expert']
};

const dir = path.join(process.cwd(), 'public', 'data', 'roadmaps');

for (const [slug, certs] of Object.entries(CERTS_MAP)) {
  const file = path.join(dir, `${slug}.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data.boost) data.boost = {};
    data.boost.certifications = certs;
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated certifications for ${slug}`);
  }
}

console.log('Certifications patched successfully!');
