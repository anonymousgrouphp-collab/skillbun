/**
 * Quiz Bank Configuration
 * Profile mapping, pillar definitions, and roadmap categorization
 */

const pillars = [
  { id: 'systems', name: 'Software Engineering & Systems', icon: '⚙️' },
  { id: 'data_ai', name: 'Data & AI', icon: '🧠' },
  { id: 'design_product', name: 'Design & Product', icon: '🎨' },
  { id: 'cloud_infra', name: 'Cloud & Infrastructure', icon: '☁️' },
  { id: 'security', name: 'Cybersecurity & Risk', icon: '🔐' },
  { id: 'operations', name: 'Operations & Specialized Tech', icon: '🔧' }
];

// Maps onboarding interest → pillar (used to skip Phase 1)
const profileMapping = {
  interestToPillar: {
    'Web Development': 'systems',
    'AI / Machine Learning': 'data_ai',
    'Mobile App Development': 'systems',
    'Data Science': 'data_ai',
    'Cybersecurity': 'security',
    'Cloud Computing': 'cloud_infra',
    'UI/UX Design': 'design_product',
    'Not sure yet': null  // null = must do Phase 1
  },
  // Degree-based pillar score boosts (added to initial pillarScores)
  degreeBoosts: {
    'BS – Artificial Intelligence and Cyber Security': { data_ai: 1, security: 1 },
    'BS-MS – Artificial Intelligence and Cyber Security': { data_ai: 1, security: 1 },
    'BS – Computer Science and Data Analytics': { data_ai: 1 },
    'BS-MS – Computer Science and Data Analytics': { data_ai: 1 },
    'BCA – Bachelor of Computer Applications': {},
    'B.Tech – Computer Science': {},
    'B.Tech – Information Technology': {},
    'Other Engineering': {}
  },
  // Maps interest → sub-category hint for Phase 2 question selection
  interestToSubHint: {
    'Web Development': ['web_frontend', 'web_backend', 'web_fullstack'],
    'AI / Machine Learning': ['ml_core', 'deep_learning', 'genai'],
    'Mobile App Development': ['mobile_native', 'mobile_cross'],
    'Data Science': ['data_analysis', 'data_engineering'],
    'Cybersecurity': ['offensive', 'defensive', 'compliance'],
    'Cloud Computing': ['cloud_ops', 'cloud_arch'],
    'UI/UX Design': ['ui_design', 'ux_research', 'product_design'],
    'Not sure yet': []
  }
};

// All 100 roadmap slugs categorized by pillar
const roadmapToPillar = {
  // Systems (25 roadmaps)
  frontend: 'systems', backend: 'systems', fullstack: 'systems',
  nextjs_developer: 'systems', angular_developer: 'systems', vue_developer: 'systems', svelte_developer: 'systems',
  android: 'systems', ios_developer: 'systems', flutter_developer: 'systems', react_native_developer: 'systems',
  python_developer: 'systems', java_developer: 'systems', go_developer: 'systems', rust_developer: 'systems',
  c_cpp_systems_developer: 'systems', dotnet_developer: 'systems', php_laravel_developer: 'systems',
  ruby_on_rails_developer: 'systems', elixir_phoenix_developer: 'systems', scala_developer: 'systems',
  desktop_app_developer: 'systems', windows_app_developer: 'systems', macos_developer: 'systems',
  graphql_api_developer: 'systems',

  // Data & AI (15 roadmaps)
  ai_ml_engineer: 'data_ai', data_science: 'data_ai', data_engineering: 'data_ai',
  data_analyst: 'data_ai', analytics_engineer: 'data_ai', bi_developer: 'data_ai',
  data_visualization_specialist: 'data_ai', data_governance_specialist: 'data_ai',
  nlp_engineer: 'data_ai', computer_vision_engineer: 'data_ai', speech_ai_engineer: 'data_ai',
  reinforcement_learning_engineer: 'data_ai', ai_research_engineer: 'data_ai',
  recommendation_systems_engineer: 'data_ai', geospatial_data_scientist: 'data_ai',

  // Design & Product (10 roadmaps)
  ui_ux_design: 'design_product', product_designer: 'design_product', ux_researcher: 'design_product',
  service_designer: 'design_product', design_systems_engineer: 'design_product',
  content_designer: 'design_product', product_manager: 'design_product',
  business_analyst: 'design_product', scrum_master_agile_coach: 'design_product',
  technical_writing: 'design_product',

  // Cloud & Infrastructure (20 roadmaps)
  devops_cloud: 'cloud_infra', site_reliability_engineer: 'cloud_infra',
  cloud_architect: 'cloud_infra', aws_cloud_engineer: 'cloud_infra',
  azure_cloud_engineer: 'cloud_infra', gcp_cloud_engineer: 'cloud_infra',
  kubernetes_engineer: 'cloud_infra', terraform_iac_engineer: 'cloud_infra',
  platform_engineer: 'cloud_infra', serverless_developer: 'cloud_infra',
  observability_engineer: 'cloud_infra', finops_engineer: 'cloud_infra',
  release_engineer: 'cloud_infra', linux_system_admin: 'cloud_infra',
  network_engineer: 'cloud_infra', database_admin: 'cloud_infra',
  technical_support_engineer: 'cloud_infra', api_platform_engineer: 'cloud_infra',
  general: 'cloud_infra',

  // Security (12 roadmaps)
  cybersecurity: 'security', penetration_tester: 'security',
  application_security_engineer: 'security', cloud_security_engineer: 'security',
  soc_analyst: 'security', red_team_operator: 'security',
  dfir_analyst: 'security', threat_intelligence_analyst: 'security',
  malware_analyst: 'security', grc_analyst: 'security', iam_engineer: 'security',

  // Operations & Specialized (18 roadmaps)
  qa_automation: 'operations', rpa_developer: 'operations',
  no_code_low_code_developer: 'operations', salesforce_developer: 'operations',
  shopify_developer: 'operations', wordpress_developer: 'operations',
  seo_specialist: 'operations', digital_marketing_analyst: 'operations',
  game_development: 'operations', unity_developer: 'operations',
  unreal_engine_developer: 'operations', technical_artist: 'operations',
  ar_vr_developer: 'operations', embedded_iot: 'operations',
  robotics_engineer: 'operations', blockchain_web3: 'operations',
  generative_ai_app_developer: 'operations', prompt_engineer: 'operations',
  llmops_engineer: 'operations', mlops_engineer: 'operations',
};

module.exports = { pillars, profileMapping, roadmapToPillar };
