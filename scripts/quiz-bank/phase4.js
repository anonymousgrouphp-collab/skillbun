/**
 * Phase 4: Confirmation & Career Aspiration Questions
 * Questions 9 & 10 confirm final execution style, work environment, and 3-year career goals.
 */

module.exports = [
  {
    id: 801,
    phase: 4,
    q: "How do you prefer structuring your day-to-day work environment as a tech professional?",
    options: [
      { l: "A", t: "Deep Focus Coding: Extended uninterrupted blocks of writing clean code, building features, and refactoring.", tags: ["backend", "frontend", "fullstack", "rust_developer", "go_developer"], i: "Deep builder, {name}! Deep focus sessions and shipping clean code are your natural workflow." },
      { l: "B", t: "Data & Model Experimentation: Working in notebooks, testing algorithms, and tweaking parameters iteratively.", tags: ["ai_ml_engineer", "data_science", "generative_ai_app_developer"], i: "Iterative experimenter, {name}! Hypothesis testing and model tweaking suit your analytical rhythm." },
      { l: "C", t: "Cross-Functional Collaboration: Meeting with design, product, engineering leads, and business stakeholders.", tags: ["product_manager", "scrum_master_agile_coach", "business_analyst"], i: "Collaborative leader, {name}! Aligning teams and bridging tech with business vision is your strength." },
      { l: "D", t: "Systems & Security Operations: Monitoring dashboards, automating infra scripts, and responding to incidents.", tags: ["devops_cloud", "site_reliability_engineer", "cybersecurity"], i: "Ops guardian, {name}! System monitoring and infrastructure automation keep your adrenaline going." }
    ]
  },
  {
    id: 802,
    phase: 4,
    q: "What is your ultimate 3-year career aspiration after graduating or completing your studies?",
    options: [
      { l: "A", t: "Senior Software Engineer / Tech Lead building core scalable products at a high-growth tech startup or MNC.", tags: ["fullstack", "backend", "frontend", "nextjs_developer", "java_developer"], i: "Engineering leader, {name}! Climbing the technical engineering ladder to Tech Lead is a stellar path." },
      { l: "B", t: "AI / Data Specialist driving cutting-edge Machine Learning, GenAI apps, or Data Infrastructure.", tags: ["ai_ml_engineer", "data_engineering", "generative_ai_app_developer"], i: "AI Innovator, {name}! Becoming an AI or Data leader puts you at the forefront of tech transformation." },
      { l: "C", t: "Product Leader (PM / Product Designer) shaping user-facing product strategy, UX, and business roadmap.", tags: ["product_manager", "ui_ux_design", "product_designer"], i: "Product Visionary, {name}! Leading product design and strategic vision sets you up for executive tech roles." },
      { l: "D", t: "DevOps Architect / Cybersecurity Lead safeguarding infrastructure, cloud systems, and enterprise security.", tags: ["cloud_architect", "devops_cloud", "cybersecurity", "cloud_security_engineer"], i: "Cloud & Security Leader, {name}! Mastering infrastructure resilience and security positions you as a critical tech asset." }
    ]
  }
];
