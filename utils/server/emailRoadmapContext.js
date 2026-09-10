import fs from 'node:fs/promises';
import path from 'node:path';
import { emailRoadmapContext, normalizeEmailRoadmapSlug } from '../shared/emailRoadmap.js';

/** Read only the public roadmap catalog; never study guides or quiz banks. */
export async function loadEmailRoadmapContext(slug, completedNodeIds) {
  const roadmapSlug = normalizeEmailRoadmapSlug(slug);
  if (!roadmapSlug) return { roadmapSlug: '', totalTopics: null };
  try {
    const roadmap = JSON.parse(await fs.readFile(path.join(process.cwd(), 'public', 'data', 'roadmaps', `${roadmapSlug}.json`), 'utf8'));
    return { roadmapSlug, roadmapTitle: roadmap.title, ...emailRoadmapContext(roadmap, completedNodeIds) };
  } catch {
    return { roadmapSlug: '', totalTopics: null };
  }
}
