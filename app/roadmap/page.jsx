import fs from 'fs';
import path from 'path';
import RoadmapHubClient from './RoadmapHubClient';

const ROADMAPS_DIR = path.join(process.cwd(), 'public', 'data', 'roadmaps');
const ROADMAP_SLUG_PATTERN = /^[a-z0-9_]+$/;

const categories = [
  { id: 'all', label: 'All' },
  { id: 'web_app', label: 'Web & App' },
  { id: 'ai_data', label: 'AI & Data' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'cloud_devops', label: 'Cloud & DevOps' },
  { id: 'design_product', label: 'Design & Product' },
  { id: 'systems_emerging', label: 'Systems & Emerging' },
  { id: 'business_ops', label: 'Business/Ops' },
];

const featuredSlugs = new Set([
  'ai_ml_engineer',
  'fullstack',
  'frontend',
  'data_science',
  'cybersecurity',
  'devops_cloud',
  'ui_ux_design',
  'flutter_developer',
]);

export const metadata = {
  title: 'Roadmaps - SkillBun',
  description: 'Browse SkillBun career roadmaps, continue saved skill trees, and explore new learning paths.',
};

function titleFromSlug(slug) {
  return slug
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeTopicNode(topic) {
  return {
    ...topic,
    resources: Array.isArray(topic.resources) ? topic.resources : [],
    children: Array.isArray(topic.children) ? topic.children.map(normalizeTopicNode) : [],
  };
}

function normalizeProjectNode(project, roadmapId, stage, index) {
  if (!project) return null;

  return {
    id: `${roadmapId}_stage_${stage.step || index + 1}_project`,
    name: `Project: ${project.title}`,
    description: project.description || '',
    resources: project.url ? [{ title: project.title, url: project.url, type: 'article' }] : [],
    children: [],
  };
}

function normalizeStageNode(stage, roadmapId, index) {
  const topics = Array.isArray(stage.topics) ? stage.topics.map(normalizeTopicNode) : [];
  const project = normalizeProjectNode(stage.project, roadmapId, stage, index);

  return {
    id: `${roadmapId}_stage_${stage.step || index + 1}`,
    name: stage.title,
    description: stage.description || '',
    resources: [],
    children: project ? [...topics, project] : topics,
    countInProgress: false,
  };
}

function normalizeRoadmapTree(roadmap) {
  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    return roadmap.tree.map(normalizeTopicNode);
  }

  if (Array.isArray(roadmap.stages)) {
    const roadmapId = roadmap.id || 'roadmap';
    return roadmap.stages.map((stage, index) => normalizeStageNode(stage, roadmapId, index));
  }

  return [];
}

function flattenProgressNodes(nodes) {
  const result = [];

  function walk(list) {
    list.forEach((node) => {
      if (node.countInProgress !== false && node.id) {
        result.push(node);
      }

      if (node.children?.length) {
        walk(node.children);
      }
    });
  }

  walk(nodes);
  return result;
}

function countResources(nodes) {
  return nodes.reduce((total, node) => (
    total
    + (Array.isArray(node.resources) ? node.resources.length : 0)
    + (node.children?.length ? countResources(node.children) : 0)
  ), 0);
}

function inferCategory(slug, title) {
  const text = `${slug} ${title}`.toLowerCase();

  if (/(security|cyber|soc|dfir|grc|iam|malware|penetration|red_team|threat)/.test(text)) {
    return 'cybersecurity';
  }

  if (/(^|[\s_/])ai([\s_/]|$)|(^|[\s_/])ml([\s_/]|$)|data|analytics|bi_|computer_vision|nlp|recommendation|speech|prompt|reinforcement|geospatial/.test(text)) {
    return 'ai_data';
  }

  if (/(cloud|aws|azure|gcp|devops|kubernetes|terraform|iac|sre|site_reliability|platform|observability|release|serverless|finops|linux)/.test(text)) {
    return 'cloud_devops';
  }

  if (/(design|designer|ux|ui|product|content|service|writing|seo|marketing|scrum)/.test(text)) {
    return 'design_product';
  }

  if (/(game|unity|unreal|ar_vr|robotics|embedded|iot|blockchain|c_cpp|systems|technical_artist|rpa)/.test(text)) {
    return 'systems_emerging';
  }

  if (/(business|analyst|support|admin|governance|manager)/.test(text)) {
    return 'business_ops';
  }

  return 'web_app';
}

function readRoadmaps() {
  try {
    return fs
      .readdirSync(ROADMAPS_DIR)
      .filter((fileName) => fileName.endsWith('.json'))
      .map((fileName) => {
        const slug = fileName.replace(/\.json$/, '');

        if (!ROADMAP_SLUG_PATTERN.test(slug)) {
          return null;
        }

        try {
          const content = fs.readFileSync(path.join(ROADMAPS_DIR, fileName), 'utf8');
          const roadmap = JSON.parse(content);
          const title = roadmap.title || titleFromSlug(slug);
          const tree = normalizeRoadmapTree(roadmap);
          const nodes = flattenProgressNodes(tree);

          return {
            slug,
            title,
            description: roadmap.description || `Explore the ${title} career roadmap.`,
            category: inferCategory(slug, title),
            totalNodes: nodes.length,
            nodeIds: nodes.map((node) => node.id),
            resourceCount: countResources(tree),
            featured: featuredSlugs.has(slug),
          };
        } catch {
          const title = titleFromSlug(slug);

          return {
            slug,
            title,
            description: `Explore the ${title} career roadmap.`,
            category: inferCategory(slug, title),
            totalNodes: 0,
            nodeIds: [],
            resourceCount: 0,
            featured: false,
          };
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export default function RoadmapHubPage() {
  const roadmaps = readRoadmaps();

  return <RoadmapHubClient categories={categories} roadmaps={roadmaps} />;
}
