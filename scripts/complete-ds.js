const fs = require('fs');
const path = require('path');

const DOCS_DIR = 'public/data/docs/design_systems_engineer';
const ROADMAP_PATH = 'public/data/roadmaps/design_systems_engineer.json';

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

const db = {
  "design_systems_engineer_portfolio_career": {
    title: "Design Systems Engineer Portfolio & Career Readiness",
    intro: "A Design Systems Engineer (DSE) operates at the intersection of design and engineering. Your portfolio and career assets must reflect this unique position, demonstrating both visual system understanding and frontend engineering excellence.",
    concepts: [
      {
        name: "Systems Thinking Showcase",
        desc: "Your projects shouldn't just be isolated components. Show how tokens connect Figma variables directly to CSS/JS outputs, how theme engines scale, and how component libraries are consumed in real projects."
      },
      {
        name: "Quantifiable System Metrics",
        desc: "Highlight the business and engineering impact of your work: reduction in custom CSS lines, speed of page creation, design QA review speedups, or decrease in accessibility compliance issues."
      },
      {
        name: "DSE Specific Tech Stack",
        desc: "Clearly list DSE-specific tools on your resume: Figma API integration, Style Dictionary, Storybook, token JSON schemas, visual regression testing (Chromatic), and component monorepos."
      }
    ],
    example: {
      title: "Recommended DSE Portfolio Component Project Structure",
      code: `my-design-system/
├── .github/workflows/          # CI/CD pipelines
│   └── visual-tests.yml        # Chromatic / visual regression
├── tokens/                     # Style Dictionary design tokens
│   ├── src/                    # Token JSON files
│   └── build/                  # Generated CSS/JS variables
├── packages/                   # Component monorepo packages
│   ├── react-components/
│   └── css-styles/
└── storybook/                  # Storybook documentation site`
    },
    questions: [
      "How do you demonstrate 'adoption metrics' in your portfolio projects?",
      "Why is monorepo configuration important for DSE roles?",
      "How do you display Figma-code synchronization workflows to recruiters?"
    ]
  },
  "ds_case_study_writing": {
    title: "Crafting Impactful Design System Case Studies",
    intro: "A great design system case study tells a story of collaboration, standardization, and scaling. It goes beyond code to describe the organization's problem, the governance model, and the adoption process.",
    concepts: [
      {
        name: "Problem-Driven Narrative",
        desc: "Start with the concrete organizational pain: design inconsistency, bloated CSS bundle sizes, slow feature delivery, or accessibility compliance risks. Delineate how these issues impacted the business."
      },
      {
        name: "The Token & Component Pipeline",
        desc: "Explain the architecture: how design decisions are translated into tokens, how components are built in isolation using Storybook, and how tests ensure stability."
      },
      {
        name: "Governance and Evolution Model",
        desc: "Describe how changes are managed: who approves new components, how bugs are reported, and the federated vs. centralized contribution models used to keep the system healthy."
      }
    ],
    example: {
      title: "Case Study Impact Metrics Table (Markdown)",
      code: `| Metric | Before Design System | After Design System | Business Impact |
| --- | --- | --- | --- |
| Page Development Time | 5 Days | 4 Hours | 90% Faster Time-to-Market |
| Custom Styles / CSS | 25,000 Lines | 1,200 Lines | Smaller Bundle, Higher Speed |
| Accessibility Failures | 14 Major Issues | 0 (Lint-enforced) | Reduced Compliance/Legal Risk |
| Component Reusability | < 20% | > 85% | Less Duplicate Code & Maintenance |`
    },
    questions: [
      "What is the recommended structure for a design system case study?",
      "How do you explain design system adoption obstacles and how you resolved them?",
      "Why should you describe the governance model of your component library?"
    ]
  },
  "ds_capstone_project": {
    title: "Capstone Project: Building a Production-Ready Design System",
    intro: "The capstone project is the culmination of your DSE training. It represents a fully documented, tested, and published React/CSS component library that follows industry-standard design ops practices.",
    concepts: [
      {
        name: "Production Token System",
        desc: "Create a design token architecture with global aliases and semantic tokens, processed by Style Dictionary into CSS custom properties, JS constants, and TypeScript types."
      },
      {
        name: "Accessible Components in isolation",
        desc: "Build at least 5 core UI components (Button, Modal, Input, Toast, Accordion) in React/TypeScript, fully matching WCAG AA accessibility standards, documented interactively in Storybook."
      },
      {
        name: "CI/CD & Publishing Automated Pipeline",
        desc: "Configure automated workflows for linting, unit tests, Chromatic visual regression testing, and semantic package versioning/publishing to NPM."
      }
    ],
    example: {
      title: "Sample GitHub Actions Workflow for Chromatic Visual Regression",
      code: `name: "Chromatic Visual Testing"
on: push

jobs:
  chromatic-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Install Dependencies
        run: npm ci
      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: \${{ secrets.CHROMATIC_PROJECT_TOKEN }}`
    },
    questions: [
      "Why is pixel-perfect visual regression testing critical for component updates?",
      "Explain the differences between global tokens and semantic tokens in design systems.",
      "How do you enforce WCAG keyboard-accessibility patterns in custom modal components?"
    ]
  },
  "ds_interview_preparation": {
    title: "Interviewing for Design Systems Engineer Roles",
    intro: "DSE interviews assess both coding skills and system architecture knowledge. You must demonstrate how to write clean, reusable, accessible UI code, and how to collaborate with design systems teams at scale.",
    concepts: [
      {
        name: "DSE Coding Assessments",
        desc: "Be prepared to build common components (e.g., Tab system, Select dropdown, Modal) live. Highlight focus management, keyboard accessibility, ARIA mappings, and custom styling APIs."
      },
      {
        name: "Design Systems Architecture & Tooling",
        desc: "Understand monorepo setups, Style Dictionary configuration, Figma API tokens, bundle size analysis, semantic versioning rules, and CSS delivery (CSS-in-JS vs CSS Modules vs utility classes)."
      },
      {
        name: "Collaboration and System Advocacy",
        desc: "Answer behavioral questions about resolving friction between designer variables and developer implementation, getting adoption from product teams, and writing contribution guidelines."
      }
    ],
    example: {
      title: "Focus Management Pattern for a Modal Component (React/DSE)",
      code: `// Focus lock and restoration helper snippet
useEffect(() => {
  const previouslyFocusedElement = document.activeElement;
  const modalElement = modalRef.current;
  
  if (isOpen && modalElement) {
    modalElement.focus(); // Set focus to modal container
  }
  
  return () => {
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus(); // Restore focus on unmount
    }
  };
}, [isOpen]);`
    },
    questions: [
      "How would you explain your component governance model to a hiring manager?",
      "How do you handle theming and dark-mode tokens dynamically at runtime?",
      "Explain how you would write automated tests for keyboard trap behavior in a modal dialog."
    ]
  }
};

// Generate Markdown Files
Object.keys(db).forEach(id => {
  const item = db[id];
  const markdown = `# ${item.title}: Study Guide

${item.intro}

## 1. Key Concepts

${item.concepts.map((c, idx) => `### Concept ${idx + 1}: ${c.name}
${c.desc}`).join('\n\n')}

## 2. Practical Example

### ${item.example.title}
\`\`\`${id.includes('workflow') || id.includes('structure') || id.includes('metrics') ? 'text' : 'javascript'}
${item.example.code}
\`\`\`

## 3. Quick Check-Up

${item.questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}\n`;

  const docPath = path.join(DOCS_DIR, `${id}.md`);
  fs.writeFileSync(docPath, markdown, 'utf8');
  console.log(`Generated study guide for: ${id}`);
});

// Update JSON file
const roadmap = JSON.parse(fs.readFileSync(ROADMAP_PATH, 'utf8'));

function updateNode(node) {
  if (node.id && db[node.id]) {
    const nonDocResources = Array.isArray(node.resources)
      ? node.resources.filter(r => r.type !== 'doc')
      : [];
    node.resources = [
      ...nonDocResources,
      {
        title: 'Study Guide & Notes',
        url: `/data/docs/design_systems_engineer/${node.id}.md`,
        type: 'doc'
      }
    ];
  }
  if (Array.isArray(node.children)) {
    node.children.forEach(updateNode);
  }
}

if (Array.isArray(roadmap.tree)) {
  roadmap.tree.forEach(updateNode);
}

fs.writeFileSync(ROADMAP_PATH, JSON.stringify(roadmap, null, 2), 'utf8');
console.log('Updated design_systems_engineer.json with study guide links.');
