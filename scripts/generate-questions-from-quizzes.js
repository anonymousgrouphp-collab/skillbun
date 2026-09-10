/**
 * Quiz Question Generator from Certification Quizzes
 * 
 * Takes topics/domains from 100 certification quiz JSON files in public/data/quizzes/
 * and transforms them into 1st-year-friendly, highly relatable career discovery scenarios.
 * 
 * Usage: node scripts/generate-questions-from-quizzes.js
 */

const fs = require('fs');
const path = require('path');
const { roadmapToPillar } = require('./quiz-bank/config');

const QUIZZES_DIR = path.join(__dirname, '..', 'public', 'data', 'quizzes');
const BANK_DIR = path.join(__dirname, 'quiz-bank');

const files = fs.readdirSync(QUIZZES_DIR).filter(f => f.endsWith('.json'));
console.log(`Found ${files.length} certification quiz files.`);

const pillarQuestions = {
  systems: [],
  data_ai: [],
  design_product: [],
  cloud_infra: [],
  security: [],
  operations: []
};

let startId = 1000;

// Scenario templates based on common tech domains
const scenarioAngleTemplates = [
  {
    qTemplate: "Hey {name}, during a college hackathon project involving {topic}, which aspect would excite you most?",
    opts: [
      { t: "Building the core logic and backend architecture", tagSuffix: "", pillar: "systems" },
      { t: "Designing the user interface and visual workflow", tagSuffix: "_ui", pillar: "design_product" },
      { t: "Analyzing the data patterns and adding smart AI features", tagSuffix: "_ai", pillar: "data_ai" },
      { t: "Setting up server deployment, cloud, and security checks", tagSuffix: "_infra", pillar: "cloud_infra" }
    ]
  },
  {
    qTemplate: "{name}, if your campus tech club asks you to build a {topic} tool, where would you add your biggest contribution?",
    opts: [
      { t: "Writing clean, efficient code for the main features", tagSuffix: "", pillar: "systems" },
      { t: "Understanding student feedback and polishing the user experience", tagSuffix: "_ux", pillar: "design_product" },
      { t: "Optimizing database queries and tracking usage analytics", tagSuffix: "_data", pillar: "data_ai" },
      { t: "Testing for bugs, security vulnerabilities, and deployment reliability", tagSuffix: "_sec", pillar: "security" }
    ]
  },
  {
    qTemplate: "When working on a team project centered around {topic}, what role feels most natural to you, {name}?",
    opts: [
      { t: "The Developer: Coding core features and managing data structures", tagSuffix: "", pillar: "systems" },
      { t: "The Designer: Wireframing screens and styling UI elements", tagSuffix: "_design", pillar: "design_product" },
      { t: "The Data Specialist: Handling datasets and predictive models", tagSuffix: "_ai", pillar: "data_ai" },
      { t: "The Systems Admin: Managing hosting, APIs, and security protocols", tagSuffix: "_ops", pillar: "cloud_infra" }
    ]
  },
  {
    qTemplate: "{name}, imagine a local startup hires you for a week to help with {topic}. What challenge would you jump at first?",
    opts: [
      { t: "Solving complex coding bugs and speeding up feature delivery", tagSuffix: "", pillar: "systems" },
      { t: "Redesigning the app screens to make them super intuitive for customers", tagSuffix: "_ui", pillar: "design_product" },
      { t: "Uncovering actionable insights from customer data logs", tagSuffix: "_analytics", pillar: "data_ai" },
      { t: "Hardening system security and automating cloud deployment pipelines", tagSuffix: "_devops", pillar: "cloud_infra" }
    ]
  }
];

// Simple helper to clean up raw cert question text into a short topic name
function extractTopicFromCertQuestion(questionText, slug) {
  const cleanSlug = slug.replace(/_/g, ' ');
  if (!questionText || typeof questionText !== 'string') return cleanSlug;
  
  // Try extracting keywords
  const words = questionText.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  if (words.length >= 2) {
    const keyword = words.slice(0, 3).join(' ').toLowerCase();
    return `${keyword} (${cleanSlug})`;
  }
  return cleanSlug;
}

for (const file of files) {
  const slug = path.basename(file, '.json');
  const pillar = roadmapToPillar[slug] || 'systems';
  const filePath = path.join(QUIZZES_DIR, file);

  let quizData = [];
  try {
    quizData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    continue;
  }

  if (!Array.isArray(quizData)) continue;

  const validQuizzes = quizData.filter(q => typeof q.question === 'string' && q.question.length > 20);
  const selected = validQuizzes.slice(0, 25);

  selected.forEach((certQ, idx) => {
    startId++;
    const topic = extractTopicFromCertQuestion(certQ.question, slug);
    const template = scenarioAngleTemplates[idx % scenarioAngleTemplates.length];
    
    const formattedQuestion = template.qTemplate.replace('{topic}', topic);

    const qObj = {
      id: startId,
      phase: 2,
      pillar: pillar,
      sourceSlug: slug,
      topic: topic,
      q: formattedQuestion,
      options: template.opts.map((opt, optIdx) => {
        const labels = ['A', 'B', 'C', 'D'];
        let optionPillar = opt.pillar;
        
        // Ensure primary option stays aligned with current roadmap pillar
        if (optIdx === 0) {
          optionPillar = pillar;
        }

        return {
          l: labels[optIdx],
          t: opt.t,
          pillar: optionPillar,
          tags: [slug],
          i: `Awesome preference choice, {name}! This reveals your inclination towards ${optionPillar.replace(/_/g, ' ')} roles.`
        };
      })
    };

    pillarQuestions[pillar].push(qObj);
  });
}

console.log('\n--- Transformed Career Discovery Scenario Stats ---');
for (const [p, list] of Object.entries(pillarQuestions)) {
  console.log(`Pillar ${p}: ${list.length} beginner-friendly career scenarios generated.`);
  const outFile = path.join(BANK_DIR, `phase2-cert-${p}.js`);
  const content = `/**\n * Phase 2 Cert-inspired Relatable Questions for Pillar: ${p}\n */\n\nmodule.exports = ${JSON.stringify(list, null, 2)};\n`;
  fs.writeFileSync(outFile, content, 'utf8');
}

console.log('\n✅ Successfully regenerated beginner-friendly question bank in scripts/quiz-bank/!');
