/**
 * Phase 3: AI Fallback Questions (One set per pillar if AI Call 1 times out/fails)
 */

module.exports = {
  systems: [
    {
      id: 701,
      phase: 3,
      pillar: "systems",
      q: "In an enterprise software project, which engineering trade-off matters most to your technical principles?",
      options: [
        { l: "A", t: "Clean modular code architecture that is testable and easy for junior devs to read.", tags: ["backend", "fullstack"], i: "Architectural purity, {name}! Maintainable code bases save team overhead." },
        { l: "B", t: "Pixel-perfect UI animations and smooth client-side performance.", tags: ["frontend", "ui_ux_design"], i: "UI craftsmanship, {name}! Delighting users with slick frontend performance is key." },
        { l: "C", t: "Fast API response times under high concurrent user traffic load.", tags: ["go_developer", "rust_developer"], i: "Performance focus, {name}! Low-latency API response times are your engineering pride." },
        { l: "D", t: "Cross-platform consistency across iOS, Android, and Desktop environments.", tags: ["flutter_developer", "react_native_developer"], i: "Multi-platform reach, {name}! Universal software delivery across devices is essential." }
      ]
    }
  ],
  data_ai: [
    {
      id: 702,
      phase: 3,
      pillar: "data_ai",
      q: "When deploying artificial intelligence into production, what is your top operational priority?",
      options: [
        { l: "A", t: "Model accuracy, low hallucination rates, and high precision metrics.", tags: ["ai_ml_engineer", "generative_ai_app_developer"], i: "Model quality advocate, {name}! High accuracy and trustworthy outputs matter most." },
        { l: "B", t: "Low latency inference speed and GPU cost efficiency.", tags: ["llmops_engineer", "mlops_engineer"], i: "Inference efficiency pro, {name}! Fast response times and GPU cost management drive real-world AI." },
        { l: "C", t: "Clean automated data pipelines with zero data corruption.", tags: ["data_engineering", "analytics_engineer"], i: "Data pipeline guardian, {name}! Reliable data ingestion makes AI models trustworthy." },
        { l: "D", t: "Clear data visualizations and executive dashboard reports.", tags: ["data_visualization_specialist", "data_analyst"], i: "Insight communicator, {name}! Transforming complex data into actionable leadership dashboards is powerful." }
      ]
    }
  ],
  design_product: [
    {
      id: 703,
      phase: 3,
      pillar: "design_product",
      q: "What defines a truly successful digital product in your eyes?",
      options: [
        { l: "A", t: "Users intuitively understand how to use it without reading any documentation.", tags: ["ui_ux_design", "product_designer"], i: "Frictionless UI believer, {name}! Intuitive self-explanatory interface design is true excellence." },
        { l: "B", t: "Strong business metrics, high user retention, and sustainable monetisation.", tags: ["product_manager", "business_analyst"], i: "Product strategist, {name}! Business metrics and customer retention build enduring startups." },
        { l: "C", t: "Consistent design tokens, typography, and reusable component systems.", tags: ["design_systems_engineer"], i: "Design system advocate, {name}! Structured design tokens and component standards create visual harmony." },
        { l: "D", t: "Deep qualitative alignment with real user needs uncovered through research.", tags: ["ux_researcher", "service_designer"], i: "User-first researcher, {name}! Deep qualitative user discovery prevents building the wrong features." }
      ]
    }
  ],
  cloud_infra: [
    {
      id: 704,
      phase: 3,
      pillar: "cloud_infra",
      q: "What gives you the greatest peace of mind when managing cloud infrastructure?",
      options: [
        { l: "A", t: "Zero downtime during deployment rollouts with instant automated rollback capability.", tags: ["devops_cloud", "release_engineer"], i: "Deployment safety expert, {name}! Instant automated rollbacks make releases stress-free." },
        { l: "B", t: "Declarative Infrastructure-as-Code where everything can be recreated with one command.", tags: ["terraform_iac_engineer", "kubernetes_engineer"], i: "IaC champion, {name}! Reproducible declarative cloud state eliminates configuration drift." },
        { l: "C", t: "Comprehensive Grafana metrics dashboards with active anomaly alerting.", tags: ["observability_engineer", "site_reliability_engineer"], i: "Observability pro, {name}! Real-time telemetry dashboards keep you aware of system health." },
        { l: "D", t: "Optimized cloud billing with no wasted EC2/K8s resource capacity.", tags: ["finops_engineer", "cloud_architect"], i: "Cloud cost optimizer, {name}! Efficient resource allocation keeps cloud bills lean and clean." }
      ]
    }
  ],
  security: [
    {
      id: 705,
      phase: 3,
      pillar: "security",
      q: "What is your primary philosophy when securing enterprise tech systems?",
      options: [
        { l: "A", t: "Shift-left security: Catching code vulnerabilities in CI/CD before code ever reaches production.", tags: ["application_security_engineer", "cloud_security_engineer"], i: "Shift-left advocate, {name}! Automated static analysis in pipelines stops bugs early." },
        { l: "B", t: "Continuous offensive testing: Simulating attacker exploits to verify real vulnerabilities.", tags: ["penetration_tester", "red_team_operator"], i: "Adversary simulator, {name}! Offensive ethical hacking reveals true security gaps." },
        { l: "C", t: "Zero-Trust architecture & strict Identity Access Management (IAM) controls.", tags: ["iam_engineer", "cloud_security_engineer"], i: "Zero-Trust architect, {name}! Strict identity validation and minimum privilege access safeguard data." },
        { l: "D", t: "Real-time threat monitoring and rapid digital forensics incident response.", tags: ["soc_analyst", "dfir_analyst"], i: "Threat responder, {name}! Vigilant SOC monitoring and fast incident response limit damage." }
      ]
    }
  ],
  operations: [
    {
      id: 706,
      phase: 3,
      pillar: "operations",
      q: "In specialized technology operations, what outcome is most satisfying?",
      options: [
        { l: "A", t: "Shipping a flawless automated test suite with 100% regression pass rates.", tags: ["qa_automation"], i: "Automation master, {name}! Automated test suites guarantee software reliability." },
        { l: "B", t: "Publishing a clear, comprehensive API documentation portal that developers praise.", tags: ["technical_writing"], i: "Tech communicator, {name}! World-class documentation empowers global developer communities." },
        { l: "C", t: "Building a immersive 3D interactive game or VR experience with smooth frame rates.", tags: ["game_development", "ar_vr_developer"], i: "3D Creator, {name}! High-performance interactive worlds deliver pure user immersion." },
        { l: "D", t: "Automating repetitive enterprise business workflows with low-code/RPA tools.", tags: ["no_code_low_code_developer", "rpa_developer"], i: "Workflow automator, {name}! Removing manual business work with low-code automation drives huge efficiency." }
      ]
    }
  ]
};
