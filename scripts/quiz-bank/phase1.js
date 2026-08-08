/**
 * Phase 1: Core Tech DNA Discovery Pool (Broad Pillar Identification)
 */

module.exports = [
  {
    id: 1,
    phase: 1,
    q: "Your college team is building a major project for an all-India hackathon. Which part of the project do you naturally take charge of?",
    options: [
      { l: "A", t: "Designing and building the core application logic, APIs, and databases so everything runs reliably.", pillar: "systems", tags: ["fullstack", "backend", "frontend"], i: "Solid engineering instinct, {name}! You naturally focus on core application architecture." },
      { l: "B", t: "Training an intelligent model or analyzing datasets to give your project smart predictive capabilities.", pillar: "data_ai", tags: ["ai_ml_engineer", "data_science"], i: "Analytical mindset, {name}! You look for patterns and intelligence in data." },
      { l: "C", t: "Crafting a beautiful, intuitive user interface in Figma and ensuring user flow is seamless.", pillar: "design_product", tags: ["ui_ux_design", "product_designer"], i: "Great user empathy, {name}! You prioritize user experience and visual interface design." },
      { l: "D", t: "Setting up cloud hosting on AWS/GCP, Docker containers, and CI/CD pipelines so deployment never fails.", pillar: "cloud_infra", tags: ["devops_cloud", "cloud_architect"], i: "Infrastructure-first thinking, {name}! You ensure high availability and smooth deployments." }
    ]
  },
  {
    id: 2,
    phase: 1,
    q: "During a major online sale in India, the e-commerce backend experiences severe lag. What is your immediate diagnostic reaction?",
    options: [
      { l: "A", t: "Inspect server-side execution traces, database queries, and async code execution bottlenecks.", pillar: "systems", tags: ["backend", "java_developer", "go_developer"], i: "Deep troubleshooter, {name}! You jump right into code execution performance." },
      { l: "B", t: "Analyze real-time event telemetry to understand drop-offs, user funnel anomalies, and anomaly alerts.", pillar: "data_ai", tags: ["data_analyst", "analytics_engineer"], i: "Data-driven approach, {name}! You look at system health through metrics and user data." },
      { l: "C", t: "Redesign the checkout flow to gracefully inform users, queue traffic, and prevent cart abandonment frustration.", pillar: "design_product", tags: ["product_manager", "ux_researcher"], i: "Product-first vision, {name}! You focus on preserving user trust during downtime." },
      { l: "D", t: "Audit firewall traffic, auto-scaling worker groups, load balancers, and network ingress paths.", pillar: "cloud_infra", tags: ["site_reliability_engineer", "network_engineer"], i: "Resilience expert, {name}! You look at traffic routing, load balancers, and cloud infra capacity." }
    ]
  },
  {
    id: 3,
    phase: 1,
    q: "When exploring a new open-source repository on GitHub, what part of the repository pulls your interest first?",
    options: [
      { l: "A", t: "The clean directory layout, design patterns, object structures, and modular codebase logic.", pillar: "systems", tags: ["python_developer", "rust_developer", "c_cpp_systems_developer"], i: "Architecture focused, {name}! Clean modular code is your technical benchmark." },
      { l: "B", t: "The data pipelines, PyTorch/TensorFlow scripts, data cleanups, and evaluation metrics.", pillar: "data_ai", tags: ["generative_ai_app_developer", "nlp_engineer"], i: "AI-curious mind, {name}! Machine learning and data pipelines catch your eye instantly." },
      { l: "C", t: "The frontend component library, design tokens, responsive CSS micro-animations, and UI components.", pillar: "design_product", tags: ["frontend", "design_systems_engineer"], i: "Eye for detail, {name}! Clean design tokens and frontend components excite you." },
      { l: "D", t: "The Dockerfile, Kubernetes helm charts, Terraform infrastructure scripts, and GitHub workflow actions.", pillar: "cloud_infra", tags: ["terraform_iac_engineer", "kubernetes_engineer"], i: "Automation pro, {name}! Infrastructure-as-code and container setups are your playground." }
    ]
  },
  {
    id: 4,
    phase: 1,
    q: "What type of technical problem feels most rewarding for you to solve after hours of effort?",
    options: [
      { l: "A", t: "Optimizing a slow API endpoint or database query from 2.5s down to 40ms.", pillar: "systems", tags: ["backend", "graphql_api_developer", "database_admin"], i: "Performance enthusiast, {name}! Speed and efficiency optimization drive your work." },
      { l: "B", t: "Getting a machine learning model to reach 96% accuracy on a complex, messy real-world dataset.", pillar: "data_ai", tags: ["computer_vision_engineer", "ai_ml_engineer"], i: "Precision seeker, {name}! Extracting high accuracy from noisy datasets is your specialty." },
      { l: "C", t: "Transforming a confusing 5-step user journey into a single, effortless 1-click action.", pillar: "design_product", tags: ["ui_ux_design", "service_designer"], i: "Simplicity champion, {name}! You turn complex user friction into elegant simple flows." },
      { l: "D", t: "Automating zero-downtime rolling upgrades across a multi-region cloud cluster.", pillar: "cloud_infra", tags: ["devops_cloud", "aws_cloud_engineer"], i: "Reliability builder, {name}! High availability and seamless upgrades give you peace of mind." }
    ]
  },
  {
    id: 5,
    phase: 1,
    q: "If you were joining an early-stage Indian tech startup tomorrow, which core team would you want to sit with?",
    options: [
      { l: "A", t: "Core Product Engineering — shipping core features, scalable backends, and app capabilities.", pillar: "systems", tags: ["fullstack", "nextjs_developer"], i: "Core builder, {name}! You thrive in product engineering teams building features." },
      { l: "B", t: "AI & Insights Lab — building recommendation algorithms, GenAI features, and analytics engine.", pillar: "data_ai", tags: ["ai_ml_engineer", "generative_ai_app_developer"], i: "Innovation driver, {name}! Building intelligent AI engines is where you shine." },
      { l: "C", t: "Product & UX Studio — interviewing users, refining wireframes, and shaping product strategy.", pillar: "design_product", tags: ["product_manager", "product_designer"], i: "Product strategist, {name}! Shaping vision and user experience is your calling." },
      { l: "D", t: "DevOps & Cloud Ops — maintaining zero outage, cloud cost management, and security posture.", pillar: "cloud_infra", tags: ["platform_engineer", "finops_engineer"], i: "Foundation keeper, {name}! You keep the tech machinery running smoothly and securely." }
    ]
  },
  {
    id: 6,
    phase: 1,
    q: "Which emerging tech trend in 2026 gets you most eager to build something original?",
    options: [
      { l: "A", t: "Next-gen web stack: Server Actions, WebAssembly, high-throughput microservices, and edge computing.", pillar: "systems", tags: ["fullstack", "rust_developer"], i: "Tech forward, {name}! Modern high-throughput application stacks excite you." },
      { l: "B", t: "Autonomous AI agents, multimodal LLMs, RAG systems, and neural network fine-tuning.", pillar: "data_ai", tags: ["prompt_engineer", "llmops_engineer"], i: "AI frontier, {name}! Autonomous agents and LLM orchestration are your ambition." },
      { l: "C", t: "Inclusive design, AI-powered spatial UI, cross-platform micro-interactions, and visual systems.", pillar: "design_product", tags: ["ui_ux_design", "ar_vr_developer"], i: "Design innovator, {name}! Spatial interfaces and micro-interactions spark your creativity." },
      { l: "D", t: "Internal developer platforms, GitOps, AI-driven observability, and multi-cloud orchestration.", pillar: "cloud_infra", tags: ["platform_engineer", "observability_engineer"], i: "DevOps innovator, {name}! Developer platforms and automated orchestration captivate you." }
    ]
  },
  {
    id: 7,
    phase: 1,
    q: "How do you prefer to measure the success of a technology product you built?",
    options: [
      { l: "A", t: "Clean code coverage, low bug count, sub-second latency, and graceful error handling.", pillar: "systems", tags: ["backend", "qa_automation"], i: "Quality focused, {name}! Robustness and clean code metrics are your benchmark." },
      { l: "B", t: "F1-score, prediction accuracy, statistical significance, and actionable insights produced.", pillar: "data_ai", tags: ["data_science", "analytics_engineer"], i: "Metric driven, {name}! Quantitative precision and statistical impact define success for you." },
      { l: "C", t: "High user engagement, Net Promoter Score (NPS), low bounce rates, and user delight.", pillar: "design_product", tags: ["product_manager", "ux_researcher"], i: "User centric, {name}! User satisfaction and retention metrics are your measure of success." },
      { l: "D", t: "99.999% uptime SLA, zero unplanned downtime, fast incident recovery, and cloud cost efficiency.", pillar: "cloud_infra", tags: ["site_reliability_engineer", "finops_engineer"], i: "SLA champion, {name}! Maximum uptime and cost-efficient cloud infra mean success to you." }
    ]
  },
  {
    id: 8,
    phase: 1,
    q: "If you had 2 weeks of free time to complete any self-guided project, what would you choose?",
    options: [
      { l: "A", t: "Build a complete SaaS platform with user authentication, payments, and live chat backend.", pillar: "systems", tags: ["fullstack", "nextjs_developer", "java_developer"], i: "Product engine builder, {name}! Full-fledged SaaS applications are right up your alley." },
      { l: "B", t: "Fine-tune an open-source LLM model on an Indian language dataset for domain-specific Q&A.", pillar: "data_ai", tags: ["nlp_engineer", "generative_ai_app_developer"], i: "AI builder, {name}! Custom model fine-tuning and language AI inspire your projects." },
      { l: "C", t: "Redesign the mobile app of your favorite Indian startup (e.g. Swiggy or Zomato) with fresh UI/UX concepts.", pillar: "design_product", tags: ["ui_ux_design", "product_designer"], i: "Creative UX thinker, {name}! Redesigning real-world consumer apps showcases your talent." },
      { l: "D", t: "Build a self-hosting homelab cluster using Docker, Kubernetes, automated backups, and Cloudflare tunnels.", pillar: "cloud_infra", tags: ["kubernetes_engineer", "linux_system_admin"], i: "Homelab tinkerer, {name}! Self-hosted clusters and cloud automation show true DevOps passion." }
    ]
  }
];
