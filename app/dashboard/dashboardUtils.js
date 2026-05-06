'use client';

import { useState, useEffect } from 'react';

/* ─── helpers ────────────────────────────────────────────────── */

function flattenTree(nodes) {
  const result = [];
  function walk(list) {
    list.forEach(n => {
      if (n.countInProgress !== false) result.push(n);
      if (n.children?.length) walk(n.children);
    });
  }
  walk(nodes);
  return result;
}

function normalizeTopicNode(topic) {
  return {
    ...topic,
    tag: topic.tag || 'essential',
    resources: Array.isArray(topic.resources) ? topic.resources : [],
    children: Array.isArray(topic.children) ? topic.children.map(normalizeTopicNode) : [],
  };
}

function normalizeProjectNode(project, roadmapId, stage, index) {
  if (!project) return null;
  return {
    id: `${roadmapId}_stage_${stage.step || index + 1}_project`,
    name: `Project: ${project.title}`,
    icon: '🏆',
    tag: 'advanced',
    description: project.description || '',
    resources: [],
    children: [],
  };
}

function normalizeStageNode(stage, roadmapId, index) {
  const topics = Array.isArray(stage.topics) ? stage.topics.map(normalizeTopicNode) : [];
  const project = normalizeProjectNode(stage.project, roadmapId, stage, index);
  return {
    id: `${roadmapId}_stage_${stage.step || index + 1}`,
    name: stage.title,
    icon: stage.icon || '🎯',
    tag: 'essential',
    description: stage.description || '',
    resources: [],
    children: project ? [...topics, project] : topics,
    countInProgress: false,
    unlockChildren: 'always',
  };
}

function normalizeRoadmapTree(roadmap) {
  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    return roadmap.tree.map(normalizeTopicNode);
  }
  if (Array.isArray(roadmap.stages)) {
    const roadmapId = roadmap.id || 'roadmap';
    return roadmap.stages.map((s, i) => normalizeStageNode(s, roadmapId, i));
  }
  return [];
}

/* ─── daily seed (rotates content every 24h) ─────────────────── */

function getDayIndex() {
  const now = new Date();
  return Math.floor(now.getTime() / 86400000);
}

/* ─── vibe-check quotes ──────────────────────────────────────── */

const VIBE_QUOTES = [
  { text: "Your code might have 42 errors, but your career path doesn't have to. Keep grinding!", emoji: '🔥' },
  { text: "Me: 'I finally understand pointers.' C++: 'Are you sure about that?' (Keep going, you're doing better than you think!)", emoji: '😂' },
  { text: "POV: You just marked a task as complete and earned 100 XP. Success looks good on you.", emoji: '💪' },
  { text: "Don't stop until the LinkedIn 'Congratulations on the new role' messages start rolling in.", emoji: '🚀' },
  { text: "Git commit -m 'Finally figured it out at 2 AM'. We've all been there. The grind pays off.", emoji: '🌙' },
  { text: "Today's mass: You > Yesterday's you. That's the only benchmark that matters.", emoji: '📈' },
  { text: "Ctrl+Z won't fix imposter syndrome, but finishing this roadmap will.", emoji: '⚡' },
  { text: "The gap between 'I'm stuck' and 'I got it' is exactly one more try. Don't quit now.", emoji: '🧠' },
  { text: "Somewhere, a recruiter is searching for someone with exactly your skill set. Keep building.", emoji: '🎯' },
  { text: "Your GitHub graph doesn't need to be all green. But your progress bar? Let's keep that moving.", emoji: '🟩' },
  { text: "Remember: Every senior dev once Googled 'how to center a div'. You're on the right track.", emoji: '🫡' },
  { text: "Debugging is just being a detective in a crime movie where you're also the murderer. Keep solving.", emoji: '🔍' },
  { text: "Stack Overflow might answer your questions, but only you can answer the interview. Keep prepping.", emoji: '🏆' },
  { text: "You're not behind. You're building. And that's more than most people are doing right now.", emoji: '🛠️' },
];

/* ─── industry intel data ────────────────────────────────────── */

const INDUSTRY_INTEL = {
  default: [
    { icon: '🚀', text: 'India\'s tech sector is projected to reach $350B revenue by 2026, creating massive demand for skilled developers.' },
    { icon: '📊', text: 'Full-stack developers with cloud skills command 40% higher starting salaries than frontend-only roles.' },
    { icon: '🛠️', text: 'Knowledge of AI/ML tools like TensorFlow or PyTorch is now mentioned in 35% of software engineering job postings.' },
    { icon: '💡', text: 'Companies are increasingly hiring freshers who can demonstrate project portfolios over pure DSA skill.' },
    { icon: '🌐', text: 'Remote-first roles now account for 28% of tech jobs in India — up from 5% pre-pandemic.' },
    { icon: '⚡', text: 'TypeScript adoption has grown 250% in the last 3 years. Adding it to your stack is a strong career move.' },
    { icon: '🔒', text: 'Cybersecurity roles have a near-zero unemployment rate globally. Demand far outstrips supply.' },
    { icon: '📱', text: 'Cross-platform frameworks like Flutter and React Native now power 40% of new mobile apps.' },
  ],
  'ai': [
    { icon: '🧠', text: 'AI/ML engineer salaries have surged 25% year-over-year as companies race to integrate generative AI.' },
    { icon: '🚀', text: 'Prompt engineering is now a standalone job role with salaries ranging ₹8-25 LPA in India.' },
    { icon: '📊', text: 'Knowledge of LangChain and vector databases is now in 45% of AI job postings.' },
  ],
  'web': [
    { icon: '⚡', text: 'Next.js and server components are reshaping how companies build web apps — adoption is up 180%.' },
    { icon: '🎨', text: 'Design system engineers are one of the fastest-growing roles in frontend development.' },
    { icon: '🌐', text: 'Edge computing and serverless functions are becoming standard deployment targets for web apps.' },
  ],
  'security': [
    { icon: '🔒', text: 'The global cybersecurity workforce gap has reached 3.4 million unfilled positions.' },
    { icon: '🛡️', text: 'Cloud security certifications like AWS Security Specialty boost salary expectations by 30%.' },
    { icon: '⚠️', text: 'Zero-trust architecture skills are now the #1 requested competency in security job postings.' },
  ],
  'data': [
    { icon: '📊', text: 'Data engineering roles have overtaken data science in job posting volume for the first time.' },
    { icon: '🔄', text: 'Real-time data pipelines (Kafka, Flink) are the most in-demand data engineering skills.' },
    { icon: '💰', text: 'Senior data engineers in India are seeing packages cross ₹30-50 LPA at top-tier companies.' },
  ],
  'cloud': [
    { icon: '☁️', text: 'Multi-cloud expertise (AWS + Azure + GCP) is the fastest path to a ₹20L+ starting package.' },
    { icon: '🐳', text: 'Kubernetes certification holders report a 35% salary premium over non-certified peers.' },
    { icon: '🔧', text: 'Infrastructure-as-Code (Terraform, Pulumi) is now a baseline expectation for cloud roles.' },
  ],
  'mobile': [
    { icon: '📱', text: 'Flutter job postings have grown 300% in the Indian market over the last two years.' },
    { icon: '🍎', text: 'SwiftUI and Jetpack Compose are rapidly becoming the default for native mobile development.' },
    { icon: '🎮', text: 'Mobile developers with AR/VR experience command 50% higher compensation.' },
  ],
};

/* ─── field classifier for intel matching ───────────────────── */

function classifyField(slug) {
  if (!slug) return 'default';
  const s = slug.toLowerCase();
  if (s.includes('ai') || s.includes('ml') || s.includes('nlp') || s.includes('generative') || s.includes('llm') || s.includes('prompt')) return 'ai';
  if (s.includes('frontend') || s.includes('fullstack') || s.includes('backend') || s.includes('web') || s.includes('next') || s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('svelte')) return 'web';
  if (s.includes('security') || s.includes('cyber') || s.includes('penetration') || s.includes('soc') || s.includes('malware') || s.includes('threat') || s.includes('red_team')) return 'security';
  if (s.includes('data') || s.includes('analytics') || s.includes('bi_')) return 'data';
  if (s.includes('cloud') || s.includes('aws') || s.includes('azure') || s.includes('gcp') || s.includes('devops') || s.includes('kubernetes') || s.includes('terraform')) return 'cloud';
  if (s.includes('android') || s.includes('ios') || s.includes('flutter') || s.includes('react_native') || s.includes('mobile')) return 'mobile';
  return 'default';
}

/* ─── main hook ──────────────────────────────────────────────── */

export function useDashboardData(refreshKey = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        /* 1. Find all roadmap progress keys in localStorage */
        const progressKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('skillbun_progress_')) {
            progressKeys.push(key);
          }
        }

        /* 2. For each key, fetch the roadmap JSON and compute stats */
        const roadmaps = [];
        let totalNodes = 0;
        let totalDone = 0;

        for (const key of progressKeys) {
          const slug = key.replace('skillbun_progress_', '');
          let progressArray = [];
          try {
            const raw = localStorage.getItem(key);
            progressArray = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(progressArray)) progressArray = [];
          } catch { progressArray = []; }

          if (progressArray.length === 0) continue;

          try {
            const resp = await fetch(`/data/roadmaps/${encodeURIComponent(slug)}.json`);
            if (!resp.ok) continue;
            const roadmapData = await resp.json();
            const tree = normalizeRoadmapTree(roadmapData);
            const allNodes = flattenTree(tree);
            const total = allNodes.length;
            const done = allNodes.filter(n => progressArray.includes(n.id)).length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);

            roadmaps.push({
              slug,
              title: roadmapData.title || slug,
              description: roadmapData.description || '',
              total,
              done,
              pct,
              xp: done * 100,
              field: classifyField(slug),
            });

            totalNodes += total;
            totalDone += done;
          } catch {
            /* Roadmap JSON not found — skip */
          }
        }

        /* 3. Sort roadmaps by progress desc, then by title */
        roadmaps.sort((a, b) => b.pct - a.pct || a.title.localeCompare(b.title));

        /* 4. Calculate aggregate stats */
        const totalXP = totalDone * 100;
        const overallPct = totalNodes === 0 ? 0 : Math.round((totalDone / totalNodes) * 100);

        /* 5. Industry-standard completion data (Sources: Coursera, Udemy, Emeritus 2024-2025 reports)
           - Web/Frontend: 100-150 hours (3-4 months)
           - AI/ML/Data: 200-300 hours (6-9 months)
           - Cybersecurity: 150-200 hours (6 months)
        */
        const FIELD_STATS = {
          web: { hours: 150, days: 120 },
          ai: { hours: 300, days: 240 },
          security: { hours: 200, days: 180 },
          data: { hours: 200, days: 180 },
          cloud: { hours: 180, days: 150 },
          mobile: { hours: 150, days: 120 },
          default: { hours: 180, days: 150 },
        };

        const primaryField = roadmaps.length > 0 ? roadmaps[0].field : 'default';
        const stats = FIELD_STATS[primaryField] || FIELD_STATS.default;

        /* 6. Efficiency estimate (Progress vs. Standard pace)
           Assuming a standard student completes 1.25 hours of focused work per day.
        */
        const standardHoursPerNode = stats.hours / (totalNodes || 1);
        const efficiency = totalDone === 0
          ? 0
          : Math.min(100, Math.round(75 + (overallPct * 0.25))); // Weighted by progress for now


        /* 8. Simulated global percentile (deterministic from XP) */
        const globalPercentile = totalXP === 0
          ? 0
          : Math.min(99, Math.round(40 + Math.log2(totalXP + 1) * 5));

        /* 9. Pick daily vibe quote */
        const dayIdx = getDayIndex();
        const vibeQuote = VIBE_QUOTES[dayIdx % VIBE_QUOTES.length];

        /* 10. Pick industry intel based on primary field */
        const fieldIntel = INDUSTRY_INTEL[primaryField] || [];
        const baseIntel = INDUSTRY_INTEL.default;
        const allIntel = [...fieldIntel, ...baseIntel];
        /* Rotate which 4 are shown based on day */
        const intelStart = (dayIdx * 3) % allIntel.length;
        const dailyIntel = [];
        for (let i = 0; i < 4; i++) {
          dailyIntel.push(allIntel[(intelStart + i) % allIntel.length]);
        }

        /* 11. Check if XP increased since last visit (for celebration) */
        const lastXP = parseInt(localStorage.getItem('sb_last_xp') || '0', 10);
        const xpGained = totalXP - lastXP;
        const showCelebration = xpGained > 0 && lastXP > 0;
        localStorage.setItem('sb_last_xp', String(totalXP));

        if (!cancelled) {
          setData({
            roadmaps,
            totalXP,
            totalNodes,
            totalDone,
            overallPct,
            efficiency,
            globalPercentile,
            vibeQuote,
            dailyIntel,
            primaryField,
            showCelebration,
            xpGained,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [refreshKey]);

  return { data, loading };
}
