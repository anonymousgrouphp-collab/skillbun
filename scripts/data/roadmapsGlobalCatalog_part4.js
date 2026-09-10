/**
 * SkillBun 100 Roadmaps Global Standard Catalog - Part 4
 * Design, Product, Systems, Gaming, Hardware & Operations (27 Slugs)
 */

const PART4_CATALOG = {
  ar_vr_developer: {
    title: 'AR/VR Developer',
    description: 'Create immersive spatial computing experiences, virtual reality simulations, and augmented reality apps using Unity, Unreal Engine, OpenXR, and Apple visionOS.',
    goal: {
      objective: 'Engineer cutting-edge spatial computing applications, 3D interaction mechanics, and immersive mixed-reality experiences for headsets and mobile devices.',
      salary: '$90,000 - $160,000 / yr (₹8 - ₹26 LPA)',
      salary_range: { usd: { min: 90000, max: 160000, period: 'yr' }, inr_lpa: { min: 8, max: 26, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['AR/VR Developer', 'Spatial Computing Engineer', 'XR Software Developer'],
      career_pillars: ['Spatial 3D Interaction Design & Physics', 'OpenXR & Headset SDKs (Meta Quest, Vision Pro)', 'Real-Time Graphics Optimization for VR (90fps+)']
    },
    learn: {
      summary: 'Master real-time 3D mathematics (quaternions, vectors), Unity XR Interaction Toolkit, OpenXR standard, hand-tracking mechanics, spatial audio, and performance optimization.',
      key_competencies: ['3D Vector Math, Transformations & Quaternions', 'Unity XR Interaction Toolkit & AR Foundation', 'OpenXR Multi-Platform Standard', 'Hand Tracking & Gesture Recognition Interfaces', 'VR Performance Optimization (Targeting 90+ FPS)'],
      prerequisites: ['Proficiency in C# or C++', 'Basic familiarity with 3D math and coordinates', 'Unity or Unreal engine fundamentals']
    },
    boost: {
      capstone_projects: [
        { title: 'Spatial Mixed-Reality Medical Training Simulator', tech_stack: ['Unity', 'OpenXR', 'C#', 'Meta Quest 3 SDK', 'Shader Graph'], description: 'Build an interactive VR surgical training tool featuring precise hand tracking, grab physics, and spatial audio feedback.' }
      ],
      certifications: ['Unity Certified Associate / Professional Programmer'],
      interview_focus: ['Minimizing VR Motion Sickness (Latency & Refresh Rates)', 'Forward Rendering vs Deferred Rendering in VR', 'Spatial Anchors & Plane Detection Mechanics in AR', 'Handling 6-DoF Tracking Loss and Occlusion']
    }
  },

  blockchain_web3: {
    title: 'Blockchain & Web3 Engineer',
    description: 'Architect decentralized applications (dApps), secure smart contracts in Solidity, zero-knowledge proofs, and token economic protocols on Ethereum and EVM chains.',
    goal: {
      objective: 'Design, audit, and deploy tamper-proof decentralized applications, smart contract protocols, and Web3 infrastructure across public blockchains.',
      salary: '$95,000 - $175,000 / yr (₹8 - ₹32 LPA)',
      salary_range: { usd: { min: 95000, max: 175000, period: 'yr' }, inr_lpa: { min: 8, max: 32, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Smart Contract Engineer', 'Blockchain Developer', 'Web3 Protocols Architect', 'DeFi Engineer'],
      career_pillars: ['Solidity Architecture & Gas Optimization', 'Smart Contract Security Auditing & Defense', 'EVM Internals & Decentralized Storage (IPFS)']
    },
    learn: {
      summary: 'Master Solidity 0.8+, EVM memory and storage opcodes, Hardhat and Foundry testing suites, OpenZeppelin standards (ERC-20, ERC-721, ERC-1155), and reentrancy defenses.',
      key_competencies: ['Solidity Programming & EVM Storage Layout', 'Foundry & Hardhat Smart Contract Testing', 'Gas Optimization Techniques & Assembly (Yul)', 'Smart Contract Security (Reentrancy, Front-running)', 'Ethers.js / Viem Client-Side Web3 Integration'],
      prerequisites: ['Solid programming experience (JavaScript, Python, or C++)', 'Basic cryptography knowledge (hashes, signatures)', 'Understanding of distributed consensus']
    },
    boost: {
      capstone_projects: [
        { title: 'Decentralized Automated Market Maker (AMM) & Liquidity Pool', tech_stack: ['Solidity', 'Foundry', 'Viem', 'Next.js', 'Tailwind'], description: 'Architect a Uniswap v2 style constant-product AMM with swap functionality, fee distribution, and comprehensive Foundry fuzz tests.' }
      ],
      interview_focus: ['Reentrancy Attack Vectors & Checks-Effects-Interactions Pattern', 'EVM Storage vs Memory vs Calldata Gas Cost Breakdown', 'ERC-4337 Account Abstraction Mechanics', 'Fuzzing & Invariant Testing with Foundry']
    }
  },

  business_analyst: {
    title: 'Business Analyst',
    description: 'Bridge business strategy and technical execution: gather requirements, model business processes (BPMN), formulate data specifications, and align stakeholders.',
    goal: {
      objective: 'Translate strategic organizational goals and user needs into clear, unambiguous engineering specifications, functional requirements, and process improvements.',
      salary: '$70,000 - $125,000 / yr (₹5 - ₹18 LPA)',
      salary_range: { usd: { min: 70000, max: 125000, period: 'yr' }, inr_lpa: { min: 5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Business Analyst', 'IT Systems Analyst', 'Business Systems Consultant'],
      career_pillars: ['Requirements Gathering & Functional Specs', 'BPMN Process Modeling & Gap Analysis', 'Data-Driven Validation with SQL & Excel']
    },
    learn: {
      summary: 'Master user story writing, acceptance criteria (Given/When/Then), BPMN 2.0 process flow diagrams, gap analysis, SQL data validation, and Jira backlog grooming.',
      key_competencies: ['Business Process Modeling Notation (BPMN 2.0)', 'User Stories & Acceptance Criteria (Gherkin/BDD)', 'Stakeholder Interviewing & Requirements Elicitation', 'SQL Data Querying for Business Validation', 'Jira & Confluence Backlog Management'],
      prerequisites: ['Strong verbal and written communication', 'Analytical thinking and problem breakdown', 'Basic spreadsheet software familiarity']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Digital Transformation BRD & Process Overhaul', tech_stack: ['BPMN (Lucidchart)', 'Jira', 'SQL', 'Confluence'], description: 'Draft a comprehensive Business Requirements Document (BRD) and to-be process diagrams for transforming an analog loan approval system.' }
      ],
      certifications: ['IIBA Certified Business Analysis Professional (CBAP)', 'PMI-PBA (Professional in Business Analysis)'],
      interview_focus: ['Managing Conflicting Stakeholder Priorities', 'Writing Unambiguous Functional vs Non-Functional Requirements', 'Conducting a Comprehensive Gap Analysis', 'Using SQL to Validate Feasibility of Requirements']
    }
  },

  c_cpp_systems_developer: {
    title: 'C/C++ Systems Developer',
    description: 'Engineer high-throughput, low-latency, memory-critical systems, operating system kernels, device drivers, and high-frequency trading engines using modern C and C++20.',
    goal: {
      objective: 'Write deterministic, ultra-low-latency, and memory-managed systems code that operates directly at the hardware and operating system boundary.',
      salary: '$95,000 - $170,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 95000, max: 170000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Staff (1 - 6+ Years)',
      target_roles: ['C++ Software Engineer', 'Systems Programmer', 'Low-Latency Systems Developer', 'Embedded Software Engineer'],
      career_pillars: ['Manual Memory Management & Pointers', 'Modern C++ (Move Semantics, RAII, Templates)', 'Multi-Threading, Concurrency & Cache Optimization']
    },
    learn: {
      summary: 'Master C memory layout, pointer arithmetic, modern C++ (C++17/C++20), RAII, smart pointers, move semantics, template metaprogramming, POSIX threads, and Valgrind profiling.',
      key_competencies: ['Pointers, Memory Layout, Stack vs Heap & Valgrind', 'RAII, Smart Pointers (unique_ptr, shared_ptr)', 'Move Semantics, Rvalue References & Perfect Forwarding', 'POSIX Threads, Mutexes, Condition Variables & Atomics', 'Modern Build Systems (CMake) & Compiler Optimization Flags'],
      prerequisites: ['Foundational computer architecture knowledge', 'Basic programming experience', 'Understanding of bits, bytes, and memory']
    },
    boost: {
      capstone_projects: [
        { title: 'High-Frequency Order Matching Engine & Limit Order Book', tech_stack: ['C++20', 'CMake', 'POSIX Sockets', 'Google Benchmark', 'Valgrind'], description: 'Build a lock-free, zero-allocation limit order matching engine processing 1,000,000 orders/sec with sub-microsecond latency.' }
      ],
      certifications: ['Linux Foundation Certified Systems Engineer'],
      interview_focus: ['Virtual Memory, Page Faults & TLB Caching', 'Move Semantics vs Copy Semantics Implementation', 'Virtual Functions & Vtable Memory Overhead', 'Lock-Free Programming with std::atomic and Memory Orders']
    }
  },

  content_designer: {
    title: 'Content Designer',
    description: 'Design intuitive, accessible user journeys through clear language, microcopy, content architecture, error states, and product terminology.',
    goal: {
      objective: 'Craft purposeful, clear, and inclusive product content and microcopy that guides users seamlessly through digital products and services.',
      salary: '$75,000 - $130,000 / yr (₹5.5 - ₹18 LPA)',
      salary_range: { usd: { min: 75000, max: 130000, period: 'yr' }, inr_lpa: { min: 5.5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Content Designer', 'UX Writer', 'Product Copywriter', 'Content Strategist'],
      career_pillars: ['UX Writing & Product Microcopy', 'Information Architecture & Taxonomy', 'Accessibility & Inclusive Language']
    },
    learn: {
      summary: 'Master UX writing principles, voice and tone design systems, microcopy for onboarding and error handling, content testing, readability metrics, and Figma design collaboration.',
      key_competencies: ['Action-Oriented Microcopy & Error State Writing', 'Voice, Tone & Content Design Systems', 'Content Testing (Cloze Tests, Highlighter Testing)', 'Information Hierarchy & Scannability', 'Accessibility & Plain Language Standards (WCAG)'],
      prerequisites: ['Exceptional written communication skills', 'Empathy for user friction and confusion', 'Basic familiarity with design software (Figma)']
    },
    boost: {
      capstone_projects: [
        { title: 'Complex SaaS Onboarding & Error Overhaul Case Study', tech_stack: ['Figma', 'Content Design System', 'User Testing Metrics'], description: 'Audit an enterprise SaaS onboarding funnel, rewrite confusing technical error states, and improve task completion rates by 25%.' }
      ],
      interview_focus: ['Designing Error Messages that Empower Users', 'Voice vs Tone in Product Personality', 'Measuring Content Design Business Impact', 'Collaborating Cross-Functionally with Product Designers and Engineers']
    }
  },

  design_systems_engineer: {
    title: 'Design Systems Engineer',
    description: 'Bridge design and engineering by building token-driven component libraries, accessible UI components, and design tooling using React and Storybook.',
    goal: {
      objective: 'Build, maintain, and scale robust, accessible, multi-brand UI component systems that accelerate company-wide product delivery.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Design Systems Engineer', 'Design Technologist', 'UI Components Architect'],
      career_pillars: ['Design Tokens Architecture (Style Dictionary)', 'WCAG 2.2 Accessible Primitive Components', 'Component Documentation & Storybook Testing']
    },
    learn: {
      summary: 'Master design token workflows (Style Dictionary), accessible component primitives (Radix/Aria), Storybook documentation, visual regression testing (Chromatic), and npm packaging.',
      key_competencies: ['Design Tokens (W3C Community Spec & Style Dictionary)', 'Headless Accessible Primitives (Radix UI / React Aria)', 'Storybook 8 Component Driven Development', 'Visual Regression Testing (Chromatic / Playwright)', 'Semantic Versioning & Multi-Brand Theming'],
      prerequisites: ['Strong React/TypeScript proficiency', 'Deep CSS & modern styling knowledge', 'Close collaboration with Figma designers']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Multi-Theme Accessible Component Library', tech_stack: ['React', 'TypeScript', 'Storybook', 'Tailwind', 'Chromatic', 'NPM'], description: 'Publish a production-ready UI component library supporting dark/light tokens, keyboard navigation, and automated visual regression testing.' }
      ],
      interview_focus: ['Design Tokens Architecture & Synchronization with Figma', 'Building Fully Accessible Modal and Dropdown Components', 'Component API Design: Flexibility vs Constraint', 'Handling Breaking Component Changes Across Multiple Products']
    }
  },

  digital_marketing_analyst: {
    title: 'Digital Marketing Analyst',
    description: 'Analyze digital acquisition channels, optimize paid media campaigns (SEM/Meta), master Google Analytics 4, and drive conversion rate optimization (CRO).',
    goal: {
      objective: 'Leverage data analytics to optimize customer acquisition funnels, maximize marketing return on ad spend (ROAS), and scale organic/paid growth.',
      salary: '$65,000 - $115,000 / yr (₹4.5 - ₹16 LPA)',
      salary_range: { usd: { min: 65000, max: 115000, period: 'yr' }, inr_lpa: { min: 4.5, max: 16, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Digital Marketing Analyst', 'Performance Marketing Specialist', 'Growth Marketing Analyst'],
      career_pillars: ['Google Analytics 4 & Tag Management', 'Conversion Rate Optimization (CRO) & A/B Testing', 'Paid Acquisition & Attribution Modeling']
    },
    learn: {
      summary: 'Master Google Analytics 4 event architectures, Google Tag Manager (GTM), multi-touch attribution modeling, conversion rate optimization (A/B testing), and SQL analytics.',
      key_competencies: ['Google Analytics 4 Custom Events & Exploration Reports', 'Google Tag Manager (GTM) Container Triggers & Tags', 'Marketing Attribution Models (First-Touch, Last-Touch, Data-Driven)', 'Conversion Rate Optimization (CRO) & Funnel Drop-off Auditing', 'A/B Testing Statistical Significance'],
      prerequisites: ['Analytical and data-driven mindset', 'Familiarity with digital marketing channels', 'Spreadsheet modeling skills (Excel/Sheets)']
    },
    boost: {
      capstone_projects: [
        { title: 'E-Commerce Marketing Attribution & Funnel Optimization Audit', tech_stack: ['Google Analytics 4', 'GTM', 'Looker Studio', 'SQL'], description: 'Build an end-to-end attribution dashboard tracking paid traffic campaigns, checkout drop-offs, and calculating true ROAS.' }
      ],
      certifications: ['Google Analytics 4 Certification', 'Meta Certified Digital Marketing Associate'],
      interview_focus: ['Explaining the Differences Between First-Touch and Data-Driven Attribution', 'Setting Up Cross-Domain Tracking in GA4 with GTM', 'Calculating Customer Acquisition Cost (CAC) and Lifetime Value (LTV)', 'Designing a Statistically Rigorous Landing Page A/B Test']
    }
  },

  embedded_iot: {
    title: 'Embedded & IoT Systems Engineer',
    description: 'Program microcontrollers, real-time operating systems (FreeRTOS), hardware peripherals (SPI/I2C/UART), and secure wireless communication for IoT devices.',
    goal: {
      objective: 'Develop firmware, low-power embedded software, and connected IoT devices that interface directly with hardware sensors and cloud backends.',
      salary: '$80,000 - $140,000 / yr (₹6 - ₹22 LPA)',
      salary_range: { usd: { min: 80000, max: 140000, period: 'yr' }, inr_lpa: { min: 6, max: 22, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 6+ Years)',
      target_roles: ['Embedded Systems Engineer', 'Firmware Developer', 'IoT Solutions Engineer', 'Hardware Software Engineer'],
      career_pillars: ['Embedded C & Microcontroller Architecture', 'FreeRTOS & Real-Time Task Scheduling', 'Communication Protocols (SPI, I2C, UART, MQTT)']
    },
    learn: {
      summary: 'Master embedded C programming, ARM Cortex-M microcontrollers (STM32/ESP32), FreeRTOS task scheduling, serial communication (UART, I2C, SPI), and IoT protocols (MQTT, BLE).',
      key_competencies: ['Embedded C, Bitwise Operations & Register Manipulation', 'Microcontroller Peripherals (GPIO, Timers, ADC, PWM)', 'FreeRTOS Tasks, Semaphores & Queue IPC', 'Serial Protocols: UART, I2C, SPI & CAN Bus', 'IoT Cloud Connectivity: MQTT, Wi-Fi, BLE & Over-The-Air (OTA) Updates'],
      prerequisites: ['Basic C programming', 'Introductory electronics (Ohm’s law, circuits)', 'Curiosity about physical computing hardware']
    },
    boost: {
      capstone_projects: [
        { title: 'Connected Industrial IoT Environmental Monitor with FreeRTOS', tech_stack: ['ESP32', 'Embedded C', 'FreeRTOS', 'MQTT', 'AWS IoT Core'], description: 'Build a low-power multi-sensor IoT device reporting temperature/vibration telemetry over encrypted MQTT with remote OTA update support.' }
      ],
      interview_focus: ['Interrupt Service Routine (ISR) Best Practices & Volatile Keyword', 'Debugging Priority Inversion in Real-Time Operating Systems', 'SPI vs I2C Communication Tradeoffs and Clock Streching', 'Low-Power Sleep Modes and Battery Budgeting for IoT']
    }
  },

  game_development: {
    title: 'Game Developer',
    description: 'Create engaging, interactive video games: game physics, gameplay loops, 3D math, graphics shaders, state machines, and audio systems.',
    goal: {
      objective: 'Engineer responsive gameplay mechanics, interactive game systems, and immersive visual experiences across modern gaming platforms.',
      salary: '$75,000 - $135,000 / yr (₹5.5 - ₹20 LPA)',
      salary_range: { usd: { min: 75000, max: 135000, period: 'yr' }, inr_lpa: { min: 5.5, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Game Developer', 'Gameplay Programmer', 'Game Systems Engineer'],
      career_pillars: ['Game Loop & Real-Time Physics Systems', '3D Mathematics (Vectors, Dot/Cross Products, Matrices)', 'State Machines & Gameplay Systems Architecture']
    },
    learn: {
      summary: 'Master the game loop architecture, delta time physics calculation, 2D/3D collision detection, finite state machines, pathfinding (A* algorithm), and sound integration.',
      key_competencies: ['Game Loop Execution & Frame Rate Independence', 'Vector Math, Dot/Cross Products & Coordinate Spaces', 'Collision Detection (AABB, Circle, Raycasting)', 'A* Pathfinding & AI Behavior Trees', 'Input Systems, Audio Integration & Animation State Machines'],
      prerequisites: ['Programming proficiency in C#, C++, or Python', 'Basic geometry and linear algebra', 'Passion for interactive entertainment']
    },
    boost: {
      capstone_projects: [
        { title: 'Action Roguelike Game with Procedural Level Generation', tech_stack: ['C# / C++', 'Unity / Godot', 'Procedural Dungeon Generation', 'Custom Shaders'], description: 'Build a complete action game featuring procedurally generated levels, responsive character combat, enemy AI state machines, and sound fx.' }
      ],
      interview_focus: ['The Core Game Loop (Update vs FixedUpdate)', 'A* Pathfinding Algorithm Mechanics and Heuristics', 'Object Pooling to Avoid Garbage Collection Spikes', 'Spatial Partitioning Algorithms (Quadtrees / Octrees)']
    }
  },

  general: {
    title: 'General Tech Discovery',
    description: 'Explore the universal foundations of computer science: algorithmic thinking, software architecture, web protocols, version control, and career trajectory discovery.',
    goal: {
      objective: 'Build an unshakeable computer science foundation, identify your engineering passions, and transition confidently into high-demand technical career tracks.',
      salary: '$60,000 - $110,000 / yr (₹4.5 - ₹16 LPA)',
      salary_range: { usd: { min: 60000, max: 110000, period: 'yr' }, inr_lpa: { min: 4.5, max: 16, period: 'lpa' } },
      experience_level: 'Entry Level (0 - 2 Years)',
      target_roles: ['Junior Software Engineer', 'Technology Associate', 'Technical Solutions Specialist'],
      career_pillars: ['Algorithmic Thinking & Problem Solving', 'Computer Architecture & Web Networking Basics', 'Developer Productivity Tools & Version Control (Git)']
    },
    learn: {
      summary: 'Master computational thinking, algorithmic logic, computer systems fundamentals, client-server networking, command-line mastery, and Git version control.',
      key_competencies: ['Computational Thinking & Algorithmic Logic', 'Data Structures (Arrays, Hash Maps, Linked Lists, Trees)', 'Client-Server Architecture & HTTP Web Protocols', 'Linux Command Line & Shell Navigation', 'Git Version Control & GitHub Collaborative Workflows'],
      prerequisites: ['Curiosity about how technology and software work', 'Basic computer literacy', 'Desire to build digital solutions']
    },
    boost: {
      capstone_projects: [
        { title: 'Personal Developer Portfolio & Interactive Project Showcase', tech_stack: ['HTML5', 'CSS3', 'Modern JavaScript', 'Git', 'GitHub Pages'], description: 'Build and deploy a responsive personal developer portfolio showcasing interactive mini-projects, dark/light theme, and live demo links.' }
      ],
      certifications: ['CS50: Introduction to Computer Science (Harvard)', 'CompTIA IT Fundamentals (ITF+)'],
      interview_focus: ['Explaining How the Internet and DNS Resolution Works', 'Basic Time and Space Complexity (Big-O Notation)', 'Git Branching, Rebasing and Merge Conflicts', 'Structured Problem-Solving Methodology']
    }
  },

  no_code_low_code_developer: {
    title: 'No-Code / Low-Code Developer',
    description: 'Build production web applications, automated business workflows, and enterprise internal tools rapidly using Bubble, Webflow, Make, and Airtable.',
    goal: {
      objective: 'Accelerate digital product delivery by designing and deploying functional web applications and automated workflows with minimal custom code.',
      salary: '$60,000 - $110,000 / yr (₹4.5 - ₹15 LPA)',
      salary_range: { usd: { min: 60000, max: 110000, period: 'yr' }, inr_lpa: { min: 4.5, max: 15, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 4+ Years)',
      target_roles: ['No-Code Developer', 'Low-Code Solutions Architect', 'Digital Automation Specialist'],
      career_pillars: ['Visual Database Architecture & Relational Modeling', 'API Integrations & Webhook Automation', 'Responsive Visual Interface Engineering']
    },
    learn: {
      summary: 'Master Bubble database modeling and workflows, Webflow CMS and responsive design, Make/Zapier automation logic, REST API connectors, and Airtable systems.',
      key_competencies: ['Bubble.io Application Logic & Relational Data Modeling', 'Webflow Responsive Web Design & CMS Collections', 'Workflow Automation (Make, Zapier) & Webhook Routing', 'REST API Connections & Authentication (API Connector)', 'Custom JavaScript / CSS Snippets for Low-Code Extensibility'],
      prerequisites: ['Logical mindset and problem-solving skills', 'Understanding of basic data relationships (one-to-many)', 'Basic web layout understanding']
    },
    boost: {
      capstone_projects: [
        { title: 'Complete Marketplace Application on Bubble with Stripe', tech_stack: ['Bubble.io', 'Stripe Connect', 'SendGrid', 'API Connector'], description: 'Build a two-sided freelance services marketplace with seller profiles, booking calendar workflows, and automated payout splits via Stripe.' }
      ],
      interview_focus: ['Relational Data Modeling in No-Code Platforms', 'Optimizing Database Queries and Privacy Rules in Bubble', 'Integrating External REST APIs and Webhook Payloads', 'When to Choose No-Code vs Custom Software Engineering']
    }
  },

  product_designer: {
    title: 'Product Designer',
    description: 'Drive end-to-end product experiences from discovery to delivery: user research, journey mapping, wireframing, high-fidelity prototypes, and design systems in Figma.',
    goal: {
      objective: 'Solve user problems and deliver high-impact business outcomes through intuitive, delightful, and user-validated end-to-end product design.',
      salary: '$80,000 - $145,000 / yr (₹6.5 - ₹22 LPA)',
      salary_range: { usd: { min: 80000, max: 145000, period: 'yr' }, inr_lpa: { min: 6.5, max: 22, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Product Designer', 'UI/UX Designer', 'Lead Product Designer'],
      career_pillars: ['Product Discovery & User Journey Mapping', 'Figma Mastery & Interactive Prototyping', 'Design Systems & Engineering Handoff']
    },
    learn: {
      summary: 'Master double-diamond design process, user research methods, information architecture, wireframing, high-fidelity UI design in Figma, usability testing, and handoff.',
      key_competencies: ['Figma Auto-Layout, Components & Interactive Variables', 'User Journey Mapping & Information Architecture', 'Wireframing, Rapid Prototyping & Usability Testing', 'Design Systems & Token Consistency', 'Cross-Functional Collaboration with Product & Engineering'],
      prerequisites: ['Visual design sensitivity and typography basics', 'Empathy for human behavior and user frustration', 'Familiarity with digital software interfaces']
    },
    boost: {
      capstone_projects: [
        { title: 'End-to-End Mobile FinTech Experience Case Study', tech_stack: ['Figma', 'Prototyping', 'User Research', 'Design System'], description: 'Conduct user research, design wireframes, build an interactive prototype, and conduct usability tests for a personal wealth management app.' }
      ],
      certifications: ['Google UX Design Professional Certificate'],
      interview_focus: ['Articulating the Design Process in Case Study Presentations', 'Balancing Business Constraints with User Advocacy', 'Conducting and Synthesizing Usability Testing Feedback', 'Design System Token Handoff with Frontend Developers']
    }
  },

  product_manager: {
    title: 'Product Manager',
    description: 'Define product vision, craft roadmap strategies, write rigorous PRDs, analyze user metrics, and lead cross-functional engineering teams to ship value.',
    goal: {
      objective: 'Lead cross-functional engineering, design, and business teams to discover, build, and scale products that customers love and that drive sustainable business growth.',
      salary: '$90,000 - $165,000 / yr (₹8 - ₹28 LPA)',
      salary_range: { usd: { min: 90000, max: 165000, period: 'yr' }, inr_lpa: { min: 8, max: 28, period: 'lpa' } },
      experience_level: 'Junior to Director (1 - 7+ Years)',
      target_roles: ['Technical Product Manager', 'Product Manager', 'Growth Product Manager', 'Group Product Manager'],
      career_pillars: ['Product Vision & Strategic Roadmapping', 'Product Requirements Documents (PRDs) & Feature Specs', 'Data Analytics, A/B Testing & User Metrics']
    },
    learn: {
      summary: 'Master product discovery frameworks, user persona formulation, Product Requirements Documents (PRDs), Agile/Scrum ceremonies, product analytics (Mixpanel/Amplitude), and A/B testing.',
      key_competencies: ['Product Requirements Documents (PRDs) & User Story Mapping', 'Prioritization Frameworks (RICE, MoSCoW, Kano Model)', 'Product Analytics (Funnel Analysis, Cohort Retention)', 'Agile, Scrum & Sprint Planning Workflows', 'Market Analysis, Competitive Intelligence & Go-To-Market (GTM)'],
      prerequisites: ['Strong strategic thinking and leadership skills', 'Excellent communication and narrative-building abilities', 'High technical empathy and curiosity']
    },
    boost: {
      capstone_projects: [
        { title: 'Comprehensive PRD & Go-to-Market Strategy for an AI Feature', tech_stack: ['Product Strategy', 'Figma Wireframes', 'Analytics Spec', 'PRD Document'], description: 'Author a complete, engineering-ready Product Requirements Document (PRD) specifying metrics, user stories, edge cases, and rollout strategy.' }
      ],
      certifications: ['Pragmatic Institute Certified Product Manager', 'Scrum Alliance Certified Scrum Product Owner (CSPO)'],
      interview_focus: ['Product Design Questions ("How would you design an elevator for children?")', 'Prioritizing Competing Engineering Features using RICE', 'Diagnosing Sudden Metrics Drops (e.g. "Checkout conversion dropped 15% overnight")', 'Root Cause Analysis and Execution Tradeoffs']
    }
  },

  qa_automation: {
    title: 'QA Automation Engineer',
    description: 'Build automated end-to-end testing suites, API integration tests, performance benchmarks, and CI/CD quality gates using Playwright, Cypress, and Python.',
    goal: {
      objective: 'Guarantee software reliability, prevent regressions, and accelerate deployment confidence by engineering comprehensive automated testing frameworks.',
      salary: '$70,000 - $125,000 / yr (₹5 - ₹18 LPA)',
      salary_range: { usd: { min: 70000, max: 125000, period: 'yr' }, inr_lpa: { min: 5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['QA Automation Engineer', 'Software Development Engineer in Test (SDET)', 'Quality Assurance Specialist'],
      career_pillars: ['End-to-End Web Automation (Playwright/Cypress)', 'API Testing & Contract Validation', 'CI/CD Pipeline Quality Gates & Performance Testing']
    },
    learn: {
      summary: 'Master Playwright and Cypress test automation, Page Object Models (POM), REST API testing with Postman/Supertest, load testing with k6, and CI/CD test integration.',
      key_competencies: ['Playwright & Cypress E2E Automation Frameworks', 'Page Object Model (POM) Design Pattern', 'REST API Automated Testing & Assertion Suites', 'Load & Stress Testing with k6 / JMeter', 'Automated Test Reporting & CI/CD Execution'],
      prerequisites: ['JavaScript/TypeScript or Python programming basics', 'Understanding of web browsers, HTML and DOM selectors', 'Basic Git workflows']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise Playwright Automated E2E Test Suite', tech_stack: ['TypeScript', 'Playwright', 'GitHub Actions', 'Allure Reports', 'Docker'], description: 'Build a production-grade automated testing suite testing user signup, cart checkout, and payments with parallel execution and trace recording.' }
      ],
      certifications: ['ISTQB Certified Tester Foundation Level (CTFL)'],
      interview_focus: ['Page Object Model Architecture and Maintainability', 'Handling Asynchronous Flakiness and Dynamic DOM Elements', 'Unit vs Integration vs End-to-End Testing (The Testing Pyramid)', 'Load Testing: Measuring Throughput vs Latency vs Error Rate']
    }
  },

  robotics_engineer: {
    title: 'Robotics Engineer',
    description: 'Design autonomous robots, kinematics, sensor fusion, SLAM algorithms, motor control, and simulation using ROS 2, C++, and Python.',
    goal: {
      objective: 'Program physical and simulated robotic systems capable of autonomous navigation, perception, manipulation, and real-time control.',
      salary: '$95,000 - $170,000 / yr (₹8 - ₹30 LPA)',
      salary_range: { usd: { min: 95000, max: 170000, period: 'yr' }, inr_lpa: { min: 8, max: 30, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Robotics Software Engineer', 'Autonomous Systems Developer', 'Controls & Navigation Engineer'],
      career_pillars: ['ROS 2 Architecture & Node Communication', 'Kinematics, Dynamics & Trajectory Planning', 'SLAM & Sensor Fusion (LiDAR, IMU, Odometry)']
    },
    learn: {
      summary: 'Master ROS 2 (Robot Operating System), nodes, topics, actions, Gazebo physics simulation, forward/inverse kinematics, SLAM, Nav2 navigation stack, and sensor fusion.',
      key_competencies: ['ROS 2 (DDS, Nodes, Publishers, Subscribers, Actions)', 'Robot Simulation in Gazebo & URDF Modeling', 'Simultaneous Localization and Mapping (SLAM)', 'Nav2 Autonomous Path Planning & Obstacle Avoidance', 'Sensor Fusion with Kalman Filters (LiDAR, IMU)'],
      prerequisites: ['Strong C++ and Python programming', 'Linear algebra, vector calculus and physics mechanics', 'Linux operating system proficiency']
    },
    boost: {
      capstone_projects: [
        { title: 'Autonomous Mobile Robot Navigation in Gazebo with ROS 2', tech_stack: ['ROS 2', 'C++', 'Python', 'Gazebo', 'Nav2', 'SLAM Toolbox'], description: 'Model a differential drive robot in URDF, simulate it in a custom Gazebo warehouse, map the environment using LiDAR, and navigate autonomously.' }
      ],
      interview_focus: ['Forward vs Inverse Kinematics Mathematics', 'Extended Kalman Filter (EKF) Sensor Fusion Mechanics', 'DDS Middleware in ROS 2 vs ROS 1 Master Architecture', 'Costmap Configuration in the Nav2 Navigation Stack']
    }
  },

  rpa_developer: {
    title: 'RPA Developer',
    description: 'Automate repetitive enterprise workflows, document understanding, optical character recognition (OCR), and back-office operations using UiPath and Power Automate.',
    goal: {
      objective: 'Free human workers from mundane manual tasks by developing reliable, unattended software robots and automated business process workflows.',
      salary: '$70,000 - $125,000 / yr (₹5 - ₹18 LPA)',
      salary_range: { usd: { min: 70000, max: 125000, period: 'yr' }, inr_lpa: { min: 5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['RPA Developer', 'Intelligent Automation Engineer', 'UiPath Developer'],
      career_pillars: ['UiPath Studio & Robotic Enterprise Framework (REFramework)', 'Document Understanding & AI OCR Integration', 'Orchestrator Management & Unattended Bot Deployment']
    },
    learn: {
      summary: 'Master UiPath Studio, the Robotic Enterprise Framework (REFramework), queue management, selector optimization, document understanding, and Power Automate desktop.',
      key_competencies: ['UiPath Studio Workflow Development & Debugging', 'Robotic Enterprise Framework (REFramework) Architecture', 'UiPath Orchestrator Queues, Triggers & Assets', 'Selector Tuning, Fuzzy Selectors & Computer Vision', 'Intelligent Document Processing (OCR & Data Extraction)'],
      prerequisites: ['Basic programming logic (C# or VB.NET basics helpful)', 'Analytical thinking and process mapping', 'Familiarity with enterprise software like Excel and SAP']
    },
    boost: {
      capstone_projects: [
        { title: 'End-to-End Automated Invoice Processing Bot with REFramework', tech_stack: ['UiPath', 'REFramework', 'OCR', 'Excel', 'Orchestrator'], description: 'Build an unattended robot that downloads PDF invoices from emails, extracts tabular line items using OCR, and enters them into an ERP system.' }
      ],
      certifications: ['UiPath Certified Professional Associate (UiRPA)', 'UiPath Certified Professional Automation Developer (UiARD)'],
      interview_focus: ['UiPath REFramework State Machine Architecture', 'Handling Dynamic and Unreliable UI Selectors', 'Orchestrator Queue Item Status Lifecycles', 'Exception Handling: Business Rule Exceptions vs System Exceptions']
    }
  },

  salesforce_developer: {
    title: 'Salesforce Developer',
    description: 'Develop enterprise customer relationship management solutions on Salesforce: Apex programming, Lightning Web Components (LWC), SOQL, and integrations.',
    goal: {
      objective: 'Customize and extend the world’s leading enterprise CRM platform using Apex, Lightning Web Components, and secure API integrations.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 6+ Years)',
      target_roles: ['Salesforce Developer', 'Salesforce Technical Architect', 'LWC Developer'],
      career_pillars: ['Apex Backend Programming & Trigger Architecture', 'Lightning Web Components (LWC) Modern UI', 'Governor Limits Management & SOQL/SOSL Queries']
    },
    learn: {
      summary: 'Master Apex object-oriented programming, SOQL/SOSL database querying, Lightning Web Components (modern JavaScript/web components), trigger frameworks, and governor limits.',
      key_competencies: ['Apex Programming, Classes & Asynchronous Apex (Batch/Queueable)', 'Lightning Web Components (LWC) & Event Propagation', 'SOQL/SOSL Query Optimization & Relationship Queries', 'Apex Trigger Frameworks & Bulkification', 'Salesforce Governor Limits & Transaction Boundaries'],
      prerequisites: ['Object-Oriented Programming (Java or C# familiarity)', 'Basic web standards (JavaScript, HTML, CSS)', 'Relational database concepts']
    },
    boost: {
      capstone_projects: [
        { title: 'Custom Healthcare Case Management Portal in Salesforce', tech_stack: ['Salesforce DX', 'Apex', 'LWC', 'SOQL', 'REST Callout'], description: 'Build a custom patient intake system featuring interactive LWC forms, automated insurance verification callouts, and bulkified Apex triggers.' }
      ],
      certifications: ['Salesforce Certified Platform Developer I (PDI)', 'Salesforce Certified Platform Developer II (PDII)'],
      interview_focus: ['Salesforce Governor Limits & Bulkification Architecture', 'LWC Event Handling (Custom Events vs LMS vs PubSub)', 'Trigger Frameworks & Avoiding Recursive Loops', 'Asynchronous Apex: Future vs Queueable vs Batch Apex']
    }
  },

  scrum_master_agile_coach: {
    title: 'Scrum Master / Agile Coach',
    description: 'Facilitate high-velocity agile engineering teams: lead Scrum ceremonies, remove delivery impediments, foster team psychological safety, and optimize metrics.',
    goal: {
      objective: 'Empower autonomous software engineering squads, remove delivery obstacles, foster psychological safety, and drive continuous agile process improvement.',
      salary: '$85,000 - $145,000 / yr (₹7 - ₹22 LPA)',
      salary_range: { usd: { min: 85000, max: 145000, period: 'yr' }, inr_lpa: { min: 7, max: 22, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Scrum Master', 'Agile Delivery Coach', 'Agile Project Manager'],
      career_pillars: ['Scrum Ceremonies & Servant Leadership', 'Impediment Removal & Team Flow Optimization', 'Agile Metrics (Velocity, Burndown, Cycle Time)']
    },
    learn: {
      summary: 'Master the Scrum Guide, sprint planning, daily standups, sprint reviews, retrospectives, Kanban work-in-progress (WIP) limits, cycle time analytics, and team conflict resolution.',
      key_competencies: ['Scrum Framework (Artifacts, Events, Accountabilities)', 'Facilitating High-Impact Retrospectives & Continuous Improvement', 'Kanban Flow, WIP Limits & Lead Time / Cycle Time Analytics', 'Resolving Cross-Functional Impediments & Team Conflicts', 'Coaching Product Owners & Developers on Agile Value Delivery'],
      prerequisites: ['Deep interpersonal empathy and active listening skills', 'Understanding of software development lifecycles', 'Familiarity with team collaboration tools (Jira, Miro)']
    },
    boost: {
      capstone_projects: [
        { title: 'Agile Team Turnaround & Retrospective Playbook', tech_stack: ['Jira Software', 'Miro', 'Agile Metrics Suite'], description: 'Document a comprehensive agile transformation playbook resolving sprint carryover, reducing cycle times by 30%, and coaching a struggling squad.' }
      ],
      certifications: ['Certified ScrumMaster (CSM)', 'Professional Scrum Master (PSM I / PSM II)'],
      interview_focus: ['How to Handle an Engineer Who Refuses to Attend Standups', 'Coaching a Product Owner Who Keeps Changing Sprint Scope', 'Velocity vs Throughput: Why Velocity is Not a Productivity Metric', 'Structuring Retrospectives that Lead to Real Actionable Change']
    }
  },

  seo_specialist: {
    title: 'SEO Specialist',
    description: 'Drive high-intent organic search traffic: technical SEO audits, Core Web Vitals optimization, keyword research, link architecture, and search intent analysis.',
    goal: {
      objective: 'Maximize organic search visibility and user acquisition by aligning site technical architecture and high-quality content with search engine algorithms.',
      salary: '$60,000 - $110,000 / yr (₹4.5 - ₹16 LPA)',
      salary_range: { usd: { min: 60000, max: 110000, period: 'yr' }, inr_lpa: { min: 4.5, max: 16, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['SEO Specialist', 'Technical SEO Manager', 'Organic Growth Strategist'],
      career_pillars: ['Technical SEO & Core Web Vitals', 'Keyword Research & Search Intent Mapping', 'On-Page Architecture & Structured Data (Schema.org)']
    },
    learn: {
      summary: 'Master search engine crawling/indexing, Google Search Console, Screaming Frog technical audits, canonical tags, XML sitemaps, JSON-LD Schema markup, and keyword clustering.',
      key_competencies: ['Technical SEO Audits (Crawling, Indexing, Render Budgets)', 'Google Search Console & Bing Webmaster Tools', 'Core Web Vitals & Page Speed Optimization', 'Schema.org Structured Data (JSON-LD Markup)', 'Keyword Research, Clustering & Search Intent Analysis'],
      prerequisites: ['Basic HTML, CSS and web architecture knowledge', 'Analytical problem solving', 'Curiosity about how Google Search ranks web pages']
    },
    boost: {
      capstone_projects: [
        { title: 'Full Technical SEO Audit & Schema Markup Package', tech_stack: ['Screaming Frog', 'Google Search Console', 'Schema.org', 'Ahrefs/Semrush'], description: 'Perform an exhaustive technical audit of a high-traffic web application, resolve crawl budget issues, and deploy rich schema markup.' }
      ],
      interview_focus: ['Troubleshooting Sudden Organic Traffic Drops in Google Search Console', 'Client-Side Rendering (CSR) vs Server-Side Rendering (SSR) SEO Impact', 'Canonicalization vs 301 Redirects vs Noindex Tags', 'Optimizing for Core Web Vitals (LCP, INP, CLS)']
    }
  },

  service_designer: {
    title: 'Service Designer',
    description: 'Design end-to-end customer and operational experiences across digital and physical touchpoints using service blueprints, user journey ecosystems, and research.',
    goal: {
      objective: 'Orchestrate seamless, omnichannel service experiences that align frontstage customer interactions with backstage operational processes and technology.',
      salary: '$80,000 - $140,000 / yr (₹6 - ₹22 LPA)',
      salary_range: { usd: { min: 80000, max: 140000, period: 'yr' }, inr_lpa: { min: 6, max: 22, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 5+ Years)',
      target_roles: ['Service Designer', 'Customer Experience Architect', 'Design Strategist'],
      career_pillars: ['Service Blueprints (Frontstage / Backstage Mapping)', 'Ecosystem Stakeholder Mapping & Research', 'Cross-Channel Touchpoint Optimization']
    },
    learn: {
      summary: 'Master service blueprinting (frontstage user actions, backstage staff processes, support systems), customer journey ecosystems, participatory design workshops, and pilot testing.',
      key_competencies: ['Service Blueprinting Methodology', 'Customer Journey Ecosystem Mapping', 'Participatory Co-Design Workshop Facilitation', 'Qualitative Systems Research & Shadowing', 'Prototyping Non-Digital & Omnichannel Services'],
      prerequisites: ['Strong systems thinking and empathy', 'Experience with visual mapping tools (Miro/Mural/Figma)', 'Comfort working with diverse cross-functional teams']
    },
    boost: {
      capstone_projects: [
        { title: 'Complete Omnichannel Healthcare / Airport Service Blueprint', tech_stack: ['Miro/Figma', 'Service Blueprinting', 'Qualitative Research Synthesis'], description: 'Design an exhaustive end-to-end service blueprint mapping patient touchpoints, nursing actions, backstage database calls, and fail points.' }
      ],
      interview_focus: ['Service Blueprint vs User Journey Map Distinction', 'Aligning Frontstage UX with Legacy Backstage Systems', 'Facilitating Co-Design Workshops with Resistant Stakeholders', 'Measuring Return on Investment for Service Design Changes']
    }
  },

  technical_artist: {
    title: 'Technical Artist',
    description: 'Bridge the gap between digital artists and software engineers: custom HLSL/GLSL shaders, character rigging pipelines, procedural generation, and graphics optimization.',
    goal: {
      objective: 'Empower game artists with efficient digital content creation tools and optimize real-time graphics pipelines for maximum visual fidelity and frame rate performance.',
      salary: '$85,000 - $150,000 / yr (₹7 - ₹24 LPA)',
      salary_range: { usd: { min: 85000, max: 150000, period: 'yr' }, inr_lpa: { min: 7, max: 24, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Technical Artist', 'Shader Developer', 'Rigging & Pipeline Specialist'],
      career_pillars: ['Real-Time Shaders (HLSL, GLSL, Shader Graph)', 'DCC Tooling Automation (Python in Blender/Maya)', 'Draw Call & Graphics Memory Optimization']
    },
    learn: {
      summary: 'Master shader math (lighting models, dot products), HLSL/GLSL shader programming, Unity Shader Graph / Unreal Material Editor, Python scripting in Maya/Blender, and profiling.',
      key_competencies: ['Shader Programming (HLSL, GLSL & Node-Based Shaders)', 'Python Automation for 3D Software (Blender, Maya)', 'Character Skeletal Rigging & Skinning Workflows', 'Performance Profiling (RenderDoc, Unreal Insights)', 'VFX Particle Systems (Niagara, Unity VFX Graph)'],
      prerequisites: ['Familiarity with 3D software (Blender, Maya, 3ds Max)', 'Basic scripting knowledge (Python or C#)', 'Aesthetic visual eye combined with technical curiosity']
    },
    boost: {
      capstone_projects: [
        { title: 'Interactive Stylized Water & Weather Shader Suite', tech_stack: ['Unity / Unreal Engine', 'HLSL', 'Shader Graph', 'Blender'], description: 'Author a high-performance stylized dynamic water shader featuring shoreline foam, Gerstner wave displacement, and underwater refraction.' }
      ],
      interview_focus: ['Vertex Shaders vs Pixel/Fragment Shaders Responsibilities', 'Optimizing Overdraw and Draw Calls in Real-Time Engines', 'Writing Custom Python Tooling for Artist Workflows', 'PBR (Physically Based Rendering) Lighting Principles']
    }
  },

  technical_support_engineer: {
    title: 'Technical Support Engineer',
    description: 'Diagnose complex software bugs, analyze server logs, reproduce customer issues, author technical documentation, and collaborate with core engineering.',
    goal: {
      objective: 'Resolve mission-critical customer software issues, diagnose underlying software bugs, and bridge the gap between customers and core engineering squads.',
      salary: '$60,000 - $105,000 / yr (₹4 - ₹15 LPA)',
      salary_range: { usd: { min: 60000, max: 105000, period: 'yr' }, inr_lpa: { min: 4, max: 15, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 4+ Years)',
      target_roles: ['Technical Support Engineer (Tier 2/3)', 'Application Support Specialist', 'Customer Engineering Specialist'],
      career_pillars: ['Root Cause Analysis & System Log Debugging', 'API Troubleshooting with Postman & cURL', 'Ticket Escalation & Engineering Collaboration']
    },
    learn: {
      summary: 'Master software debugging, server log analysis (ELK/Datadog), API testing with Postman/cURL, relational database queries for issue replication, and ticketing systems (Zendesk/Jira).',
      key_competencies: ['Application Log Analysis & Grep/Regex Debugging', 'API Request Inspection (Postman, DevTools, cURL)', 'SQL Querying for Data Verification & Reproduction', 'Ticketing Workflows & SLA Management (Zendesk, Jira)', 'Clear Technical Communication with Developers and Customers'],
      prerequisites: ['Basic understanding of web technologies (HTTP, APIs)', 'Problem-solving persistence', 'Customer-facing empathy and patience']
    },
    boost: {
      capstone_projects: [
        { title: 'Automated Log Diagnostics & Ticket Triage Tool', tech_stack: ['Python', 'Zendesk API', 'Regex', 'Postman'], description: 'Build an automated utility that parses customer error log attachments, identifies known stack traces, and suggests instant solutions.' }
      ],
      interview_focus: ['Systematic Troubleshooting Methodology for Intermittent Bugs', 'Interpreting HTTP Status Codes (401 vs 403, 502 vs 504)', 'De-escalating Frustrated High-Value Customers', 'Writing High-Quality Bug Reports for Engineering Teams']
    }
  },

  technical_writing: {
    title: 'Technical Writer',
    description: 'Author world-class developer documentation, OpenAPI references, interactive tutorials, architectural guides, and SDK code samples using docs-as-code.',
    goal: {
      objective: 'Empower software developers with clear, accurate, and structured technical documentation, interactive tutorials, and comprehensive API references.',
      salary: '$75,000 - $135,000 / yr (₹5.5 - ₹18 LPA)',
      salary_range: { usd: { min: 75000, max: 135000, period: 'yr' }, inr_lpa: { min: 5.5, max: 18, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Technical Writer', 'Developer Documentation Specialist', 'API Documentation Engineer'],
      career_pillars: ['Docs-as-Code Workflows (Markdown, Git, Static Generators)', 'API Reference Documentation (OpenAPI/Swagger)', 'Developer Tutorials & Code Samples']
    },
    learn: {
      summary: 'Master Docs-as-Code workflows (Markdown, Docusaurus, Hugo), OpenAPI/Swagger specs, Git pull-request reviews, information architecture, and writing code samples.',
      key_competencies: ['Docs-as-Code (Markdown, MDX, Static Site Generators)', 'OpenAPI / Swagger API Specification Authoring', 'Information Architecture for Developer Hubs', 'Writing Clear Code Samples (JavaScript, Python, cURL)', 'Style Guides (Microsoft Style Guide, Google Dev Style)'],
      prerequisites: ['Exceptional written English clarity', 'Basic programming knowledge to understand code', 'Git version control familiarity']
    },
    boost: {
      capstone_projects: [
        { title: 'Complete Developer Documentation Portal with Docusaurus', tech_stack: ['Docusaurus', 'Markdown', 'OpenAPI/Swagger', 'GitHub Pages'], description: 'Build and deploy an interactive developer portal featuring quickstart guides, interactive API endpoints, and dark/light mode.' }
      ],
      certifications: ['Society for Technical Communication (STC) Certification'],
      interview_focus: ['Structuring API Documentation for Maximum Developer Adoption', 'Maintaining Accuracy across Rapid Engineering Release Cycles', 'Docs-as-Code Pull Request Review Workflows', 'Auditing Documentation for Accessibility and Inclusivity']
    }
  },

  ui_ux_design: {
    title: 'UI/UX Designer',
    description: 'Craft intuitive, accessible, and delightful digital user interfaces, user research studies, wireframes, and interactive design systems in Figma.',
    goal: {
      objective: 'Create intuitive, user-centered digital interfaces that balance visual aesthetics with rigorous usability and accessibility standards.',
      salary: '$75,000 - $135,000 / yr (₹5.5 - ₹20 LPA)',
      salary_range: { usd: { min: 75000, max: 135000, period: 'yr' }, inr_lpa: { min: 5.5, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['UI/UX Designer', 'Product Designer', 'User Experience Specialist'],
      career_pillars: ['User Research & Usability Testing', 'Figma Prototyping & Layout Mastery', 'Design Systems & WCAG Accessibility']
    },
    learn: {
      summary: 'Master user research, wireframing, Figma components and auto-layout, interactive micro-animations, design tokens, usability testing, and WCAG accessibility standards.',
      key_competencies: ['User Research, Personas & User Flows', 'Figma Auto-Layout, Components & Variables', 'Interactive Prototyping & Micro-Interactions', 'Design Systems & Style Guides', 'Web Content Accessibility Guidelines (WCAG 2.2)'],
      prerequisites: ['Visual design interest and empathy for users', 'Basic computer interface familiarity', 'Curiosity about digital products']
    },
    boost: {
      capstone_projects: [
        { title: 'Accessible Fintech Banking Web & Mobile App Redesign', tech_stack: ['Figma', 'Prototyping', 'Accessibility Audit (Stark)', 'Usability Testing'], description: 'Conduct usability tests on a traditional banking portal, design a high-contrast accessible interface, and prototype interactive checkout flows.' }
      ],
      certifications: ['Google UX Design Professional Certificate'],
      interview_focus: ['Explaining Rationale Behind Layout and Hierarchy Choices', 'Conducting Usability Testing on Low-Fidelity Wireframes', 'Designing Accessible Color Contrast and Focus States', 'Handoff and Collaboration Workflows with Frontend Engineers']
    }
  },

  unity_developer: {
    title: 'Unity Developer',
    description: 'Build 2D/3D games, real-time interactive simulations, and spatial applications using the Unity Engine, C#, physics, and animation systems.',
    goal: {
      objective: 'Develop high-performance 2D and 3D games and interactive simulations utilizing the versatile Unity engine and C# architecture.',
      salary: '$80,000 - $140,000 / yr (₹6 - ₹20 LPA)',
      salary_range: { usd: { min: 80000, max: 140000, period: 'yr' }, inr_lpa: { min: 6, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['Unity Game Developer', 'Unity Gameplay Programmer', 'Interactive 3D Developer'],
      career_pillars: ['C# Scripting & Unity Architecture', 'Physics, Colliders & Raycasting', 'Optimization (Profiler, Draw Calls, AssetBundles)']
    },
    learn: {
      summary: 'Master C# for Unity, MonoBehaviour lifecycles, physics engines, Cinemachine cameras, UI Toolkit, ScriptableObjects architecture, Addressables, and profiling.',
      key_competencies: ['C# Scripting & MonoBehaviour Execution Order', 'Unity Physics (Rigidbody, Colliders, Raycasting)', 'ScriptableObjects Architecture for Modular Systems', 'Cinemachine Camera Systems & Animator Controllers', 'Performance Profiling & Memory Management'],
      prerequisites: ['C# or object-oriented programming foundation', 'Basic 3D math and vector coordinates', 'Unity Hub & Editor familiarity']
    },
    boost: {
      capstone_projects: [
        { title: '3D Action Platformer with Fluid Character Controller', tech_stack: ['Unity', 'C#', 'Cinemachine', 'Shader Graph', 'Universal Render Pipeline'], description: 'Develop a 3D platformer featuring responsive wall-jumping physics, dynamic camera tracking, particle systems, and particle effects.' }
      ],
      certifications: ['Unity Certified Associate / Professional Programmer'],
      interview_focus: ['MonoBehaviour Lifecycle (Awake vs Start vs Update vs FixedUpdate)', 'ScriptableObjects for Data-Driven Architecture', 'Optimizing Draw Calls (Static/Dynamic Batching, GPU Instancing)', 'Garbage Collection Spikes Mitigation in Unity']
    }
  },

  unreal_engine_developer: {
    title: 'Unreal Engine Developer',
    description: 'Develop AAA-quality games and simulations using Unreal Engine 5, C++, Blueprints visual scripting, Nanite, Lumen, and gameplay framework.',
    goal: {
      objective: 'Engineer cutting-edge, photorealistic video games and real-time interactive worlds utilizing Unreal Engine 5’s industry-leading engine architecture.',
      salary: '$90,000 - $160,000 / yr (₹7.5 - ₹25 LPA)',
      salary_range: { usd: { min: 90000, max: 160000, period: 'yr' }, inr_lpa: { min: 7.5, max: 25, period: 'lpa' } },
      experience_level: 'Junior to Senior (1 - 6+ Years)',
      target_roles: ['Unreal Engine Programmer', 'Gameplay C++ Developer', 'Unreal Technical Designer'],
      career_pillars: ['Unreal C++ & Gameplay Framework', 'Blueprints Visual Scripting & Hybrid Architecture', 'Unreal Engine 5 Technologies (Nanite, Lumen, Niagara)']
    },
    learn: {
      summary: 'Master Unreal Engine 5 gameplay framework (GameMode, PlayerController, Character, Pawn), C++ and Blueprint hybrid development, replication networking, and Lumen lighting.',
      key_competencies: ['Unreal Engine 5 Architecture & UObject Reflection', 'Unreal C++ & Memory Management (Garbage Collection)', 'Blueprints Visual Scripting & Best Practices', 'Multiplayer Networking & Actor Replication', 'Nanite Virtualized Geometry & Lumen Dynamic Lighting'],
      prerequisites: ['Solid C++ programming foundation', 'Understanding of 3D mathematics', 'Unreal Engine 5 editor familiarity']
    },
    boost: {
      capstone_projects: [
        { title: 'Multiplayer Co-Op Tactical Shooter in Unreal Engine 5', tech_stack: ['Unreal Engine 5', 'C++', 'Blueprints', 'Enhanced Input', 'Lumen'], description: 'Build a multiplayer tactical shooter featuring networked weapon replication, health sync, dynamic lighting via Lumen, and smart enemy AI.' }
      ],
      interview_focus: ['UObject Reflection System & Garbage Collection in Unreal', 'Actor Replication & Network RPCs (Server, Client, NetMulticast)', 'C++ vs Blueprint Division of Responsibilities', 'Lumen and Nanite Performance Considerations']
    }
  },

  ux_researcher: {
    title: 'UX Researcher',
    description: 'Conduct qualitative user interviews, quantitative usability studies, card sorting, survey methodologies, and behavioral telemetry analysis.',
    goal: {
      objective: 'Uncover deep human behaviors, user motivations, and friction points through rigorous research methods to de-risk product strategy.',
      salary: '$80,000 - $140,000 / yr (₹6 - ₹20 LPA)',
      salary_range: { usd: { min: 80000, max: 140000, period: 'yr' }, inr_lpa: { min: 6, max: 20, period: 'lpa' } },
      experience_level: 'Entry to Senior (0 - 5+ Years)',
      target_roles: ['UX Researcher', 'User Researcher', 'Design Researcher'],
      career_pillars: ['Qualitative Generative Research (Interviews, Shadowing)', 'Quantitative Evaluative Research (Usability Testing, Surveys)', 'Research Synthesis & Stakeholder Influence']
    },
    learn: {
      summary: 'Master qualitative user interviews, usability testing facilitation, card sorting and tree testing, survey statistical sampling, thematic affinity synthesis, and research repositories.',
      key_competencies: ['Moderated & Unmoderated Usability Testing', 'Generative User Interviewing & Active Listening', 'Card Sorting & Tree Testing for Information Architecture', 'Thematic Analysis & Insight Synthesis', 'Research Repositories & Executive Briefings'],
      prerequisites: ['Deep curiosity about human psychology and behavior', 'Exceptional interpersonal and observation skills', 'Clear communication and documentation ability']
    },
    boost: {
      capstone_projects: [
        { title: 'Enterprise B2B Workflow Usability Study & Synthesis Report', tech_stack: ['Usability Testing', 'Miro Affinity Mapping', 'Survey Analysis'], description: 'Conduct a comprehensive study of an enterprise analytics workflow, identify critical friction points, and deliver an actionable insights report.' }
      ],
      certifications: ['Nielsen Norman Group (NN/g) UX Master Certified'],
      interview_focus: ['Designing Research Plans to Address Ambiguous Business Questions', 'Avoiding Leading Questions in User Interviews', 'Triangulating Qualitative Insights with Quantitative Product Telemetry', 'Presenting Surprising User Insights to Skeptical Stakeholders']
    }
  }
};

module.exports = { PART4_CATALOG };
