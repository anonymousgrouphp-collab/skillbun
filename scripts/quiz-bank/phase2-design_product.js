/**
 * Phase 2: Design & Product Pillar Questions
 * Differentiates between UI/UX Design, Product Management, UX Research, Design Systems, Product Design, Service Design, etc.
 */

module.exports = [
  {
    id: 301,
    phase: 2,
    pillar: "design_product",
    q: "Within the product and user experience creation lifecycle, which role feels most like your calling?",
    options: [
      { l: "A", t: "UI/UX Product Designer: Designing Figma wireframes, visually stunning UIs, and interactive prototypes.", tags: ["ui_ux_design", "product_designer"], i: "Product Designer, {name}! Visual design, component layout, and UI prototyping are your core skills." },
      { l: "B", t: "Product Manager (APM / PM): Defining product vision, roadmap prioritization, PRDs, and leading engineering sprints.", tags: ["product_manager", "scrum_master_agile_coach"], i: "Product Leader, {name}! Owning feature scope, business ROI, and engineering delivery drives your vision." },
      { l: "C", t: "UX Researcher: Conducting user interviews, usability testing sessions, card sorting, and synthesizing insights.", tags: ["ux_researcher", "service_designer"], i: "UX Researcher, {name}! Deep human empathy and qualitative user discovery form your foundation." },
      { l: "D", t: "Design Systems Engineer: Building reusable UI component libraries, Storybook specs, and design tokens.", tags: ["design_systems_engineer", "frontend"], i: "Design Systems Engineer, {name}! Bridging visual UI design specs with reusable frontend code is your craft." }
    ]
  },
  {
    id: 302,
    phase: 2,
    pillar: "design_product",
    q: "When evaluating why an Indian app (like Paytm, CRED, or Zomato) succeeds or fails, what do you analyze first?",
    options: [
      { l: "A", t: "The Information Architecture & micro-copy: Clarity of labels, navigation hierarchy, and onboarding microcopy.", tags: ["content_designer", "ui_ux_design"], i: "Content & IA Designer, {name}! Microcopy clarity and logical navigation hierarchy make or break user experience." },
      { l: "B", t: "The End-to-End Service Blueprint: Offline-to-online transitions, support handling, and delivery touchpoints.", tags: ["service_designer", "product_manager"], i: "Service Designer, {name}! Seeing the whole ecosystem beyond the screen creates world-class products." },
      { l: "C", t: "The Business & Functional Requirements: Feature completeness, monetisation model, and competitive moat.", tags: ["business_analyst", "product_manager"], i: "Business Analyst, {name}! Analyzing requirements, business processes, and unit economics is your strength." },
      { l: "D", t: "The Agile Execution & Velocity: How fast the tech team ships updates, manages backlog, and resolves bugs.", tags: ["scrum_master_agile_coach", "product_manager"], i: "Agile Coach, {name}! Streamlined sprint execution and team delivery momentum are your focus." }
    ]
  }
];
