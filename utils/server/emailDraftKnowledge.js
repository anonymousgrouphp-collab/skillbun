import { EMAIL_CATEGORIES } from '../shared/emailRecommendation.js';
import { retrieveKnowledge } from './rag/index.js';
import { loadRagCorpus } from './rag/corpus.js';

const MAX_CONTEXT_LENGTH = 1800;
// Category-only queries keep retrieval independent of student identities or state.
const CATEGORY_QUERIES = {
  welcome: 'beginner learning programming',
  reengagement: 'learning concepts practice',
  exam_nudge: 'learning fundamentals review',
  exam_failed: 'learning concepts explain',
  cert_congrats: 'learning practical projects',
};

function plainExcerpt(value, limit) {
  if (typeof value !== 'string' || value.length > 5000) return '';
  // Reject the whole field before truncating, so hidden suffixes cannot survive
  // as seemingly safe snippets. Catalog text is data, never prompt instructions.
  if (/[<>`*_#{}\x00-\x1f\x7f-\x9f]|\b[a-z][a-z0-9+.-]*:\/\/|\b(?:https?|ftp|file|data|javascript|mailto):|\/\/|www\.|@|\[[^\]]*\]|\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|tech|edu|co)(?:\b|\/)/i.test(value)) return '';
  if (/[$₹€£]|\b(salary|salaries|certifications?|credentials?)\b/i.test(value)) return '';
  const text = value.trim().replace(/\s+/g, ' ');
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit - 1);
  const wordEnd = clipped.lastIndexOf(' ');
  return `${wordEnd > limit / 2 ? clipped.slice(0, wordEnd) : clipped}…`;
}

function extractExample(document) {
  if (!document?.emailSafe || !['roadmap', 'topics'].includes(document.kind)) return null;
  const source = document.roadmapSlug;
  if (typeof source !== 'string' || !/^[a-z][a-z0-9_-]{0,79}$/.test(source)) return null;
  const title = plainExcerpt(document.roadmapTitle, 80);
  if (!title) return null;
  const topics = [];
  const names = new Set();
  for (const item of Array.isArray(document.topics) ? document.topics.slice(0, 20) : []) {
    const name = plainExcerpt(item?.name, 70);
    const description = plainExcerpt(item?.description, 120);
    if (name && description && !names.has(name.toLowerCase())) {
      topics.push({ name, description });
      names.add(name.toLowerCase());
    }
    if (topics.length === 2) break;
  }
  return topics.length ? { source, title, topics } : null;
}

/** Project central retrieval into the stricter, reusable email context contract. */
export async function loadEmailDraftKnowledge(category, options = {}) {
  if (!Object.hasOwn(EMAIL_CATEGORIES, category)) return [];
  const config = typeof options === 'function' ? { reader: options } : options || {};
  const retrieve = typeof config.retrieve === 'function' ? config.retrieve : retrieveKnowledge;
  // Existing injected readers stay supported and use the real central pipeline,
  // with neural services disabled so offline tests never depend on credentials.
  const dependencies = config.reader || config.files ? {
    loadCorpus: () => loadRagCorpus({ reader: config.reader, files: config.files }),
    loadVectors: async () => null,
    rerank: async () => [],
  } : {};
  try {
    const result = await retrieve({ query: CATEGORY_QUERIES[category], purpose: 'email', timeoutMs: 4500 }, dependencies);
    const selected = [];
    const seen = new Set();
    for (const hit of Array.isArray(result?.sources) ? result.sources.slice(0, 60) : []) {
      const example = extractExample(hit?.document);
      if (!example || seen.has(example.source)) continue;
      if (JSON.stringify([...selected, example]).length <= MAX_CONTEXT_LENGTH) {
        selected.push(example);
        seen.add(example.source);
      }
      if (selected.length === 3) break;
    }
    return selected;
  } catch { return []; }
}
