const fs = require('fs');
const path = require('path');

const ROADMAPS_DIR = path.join(__dirname, '..', 'public', 'data', 'roadmaps');
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'data', 'roadmap_connections.json');

// Define connection pairs (current_slug -> next_slug)
// All 100 roadmaps must be covered exactly once as keys.
const connections = {
  // 1. AI, Machine Learning, Data Science & Analytics
  'ai_ml_engineer': 'mlops_engineer',
  'mlops_engineer': 'llmops_engineer',
  'llmops_engineer': 'generative_ai_app_developer',
  'generative_ai_app_developer': 'prompt_engineer',
  'prompt_engineer': 'nlp_engineer',
  'nlp_engineer': 'speech_ai_engineer',
  'speech_ai_engineer': 'computer_vision_engineer',
  'computer_vision_engineer': 'recommendation_systems_engineer',
  'recommendation_systems_engineer': 'reinforcement_learning_engineer',
  'reinforcement_learning_engineer': 'ai_research_engineer',
  'ai_research_engineer': 'data_science',
  'data_science': 'data_analyst',
  'data_analyst': 'bi_developer',
  'bi_developer': 'data_visualization_specialist',
  'data_visualization_specialist': 'geospatial_data_scientist',
  'geospatial_data_scientist': 'analytics_engineer',
  'analytics_engineer': 'data_engineering',
  'data_engineering': 'database_admin',
  'database_admin': 'data_governance_specialist',
  'data_governance_specialist': 'business_analyst',

  // 2. Frontend & Design Stacks
  'frontend': 'nextjs_developer',
  'nextjs_developer': 'vue_developer',
  'vue_developer': 'svelte_developer',
  'svelte_developer': 'angular_developer',
  'angular_developer': 'design_systems_engineer',
  'design_systems_engineer': 'ui_ux_design',
  'ui_ux_design': 'ux_researcher',
  'ux_researcher': 'product_designer',
  'product_designer': 'service_designer',
  'service_designer': 'content_designer',
  'content_designer': 'product_manager',
  'product_manager': 'scrum_master_agile_coach',
  'scrum_master_agile_coach': 'frontend',

  // 3. Backend & Langs
  'backend': 'go_developer',
  'go_developer': 'rust_developer',
  'rust_developer': 'c_cpp_systems_developer',
  'c_cpp_systems_developer': 'embedded_iot',
  'embedded_iot': 'robotics_engineer',
  'robotics_engineer': 'platform_engineer',
  'platform_engineer': 'api_platform_engineer',
  'api_platform_engineer': 'graphql_api_developer',
  'graphql_api_developer': 'python_developer',
  'python_developer': 'backend',

  // 4. Web Stacks (Fullstack, PHP, Ruby, Java, Dotnet, CMS)
  'fullstack': 'php_laravel_developer',
  'php_laravel_developer': 'wordpress_developer',
  'wordpress_developer': 'shopify_developer',
  'shopify_developer': 'no_code_low_code_developer',
  'no_code_low_code_developer': 'rpa_developer',
  'rpa_developer': 'dotnet_developer',
  'dotnet_developer': 'java_developer',
  'java_developer': 'scala_developer',
  'scala_developer': 'elixir_phoenix_developer',
  'elixir_phoenix_developer': 'ruby_on_rails_developer',
  'ruby_on_rails_developer': 'fullstack',

  // 5. Mobile & Desktop Stacks
  'android': 'ios_developer',
  'ios_developer': 'macos_developer',
  'macos_developer': 'windows_app_developer',
  'windows_app_developer': 'desktop_app_developer',
  'desktop_app_developer': 'flutter_developer',
  'flutter_developer': 'react_native_developer',
  'react_native_developer': 'android',

  // 6. Security, Networking & Ops
  'cybersecurity': 'penetration_tester',
  'penetration_tester': 'red_team_operator',
  'red_team_operator': 'malware_analyst',
  'malware_analyst': 'dfir_analyst',
  'dfir_analyst': 'soc_analyst',
  'soc_analyst': 'threat_intelligence_analyst',
  'threat_intelligence_analyst': 'network_engineer',
  'network_engineer': 'application_security_engineer',
  'application_security_engineer': 'cloud_security_engineer',
  'cloud_security_engineer': 'iam_engineer',
  'iam_engineer': 'grc_analyst',
  'grc_analyst': 'cybersecurity',

  // 7. Cloud, DevOps & SRE
  'devops_cloud': 'kubernetes_engineer',
  'kubernetes_engineer': 'terraform_iac_engineer',
  'terraform_iac_engineer': 'aws_cloud_engineer',
  'aws_cloud_engineer': 'azure_cloud_engineer',
  'azure_cloud_engineer': 'gcp_cloud_engineer',
  'gcp_cloud_engineer': 'cloud_architect',
  'cloud_architect': 'site_reliability_engineer',
  'site_reliability_engineer': 'observability_engineer',
  'observability_engineer': 'release_engineer',
  'release_engineer': 'finops_engineer',
  'finops_engineer': 'devops_cloud',

  // 8. Game Dev & AR/VR
  'game_development': 'unity_developer',
  'unity_developer': 'unreal_engine_developer',
  'unreal_engine_developer': 'technical_artist',
  'technical_artist': 'ar_vr_developer',
  'ar_vr_developer': 'game_development',

  // 9. Niche & General
  'general': 'technical_writing',
  'technical_writing': 'technical_support_engineer',
  'technical_support_engineer': 'seo_specialist',
  'seo_specialist': 'digital_marketing_analyst',
  'digital_marketing_analyst': 'blockchain_web3',
  'blockchain_web3': 'general',
  
  // Extra mapping completions for 100 coverage
  'business_analyst': 'data_analyst',
  'linux_system_admin': 'devops_cloud',
  'qa_automation': 'frontend',
  'salesforce_developer': 'rpa_developer',
  'serverless_developer': 'platform_engineer'
};

function main() {
  console.log('Generating roadmap connections map...');

  // 1. Read all files in public/data/roadmaps/
  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} roadmap files.`);

  // 2. Load roadmap titles
  const roadmapTitles = {};
  files.forEach(file => {
    const slug = file.replace('.json', '');
    const filePath = path.join(ROADMAPS_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      roadmapTitles[slug] = data.title || slug;
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  });

  // 3. Build connection map with titles
  const output = {};
  const allSlugs = Object.keys(roadmapTitles);

  allSlugs.forEach(slug => {
    const nextSlug = connections[slug];
    if (!nextSlug) {
      console.warn(`Warning: No recommended next roadmap mapped for slug: ${slug}`);
      return;
    }
    
    const nextTitle = roadmapTitles[nextSlug];
    if (!nextTitle) {
      console.error(`Error: Mapped next slug "${nextSlug}" for "${slug}" does not exist in roadmap files!`);
      process.exit(1);
    }

    output[slug] = {
      next: nextSlug,
      title: nextTitle
    };
  });

  // Verify all 100 are mapped
  const outputKeys = Object.keys(output);
  console.log(`Successfully mapped ${outputKeys.length} / ${allSlugs.length} roadmaps.`);

  if (outputKeys.length !== allSlugs.length) {
    console.error(`Error: Not all roadmaps were mapped! Expected ${allSlugs.length}, got ${outputKeys.length}`);
    const unmapped = allSlugs.filter(s => !output[s]);
    console.error('Unmapped:', unmapped);
    process.exit(1);
  }

  // 4. Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Saved connections to: ${OUTPUT_FILE}`);
}

main();
