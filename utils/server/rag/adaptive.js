import { tokenize } from './lexical.js';

const ALIASES = [
  [/\b(?:ui\s*ux|ui\/ux)\b/gi, 'ui ux design'],
  [/\b(?:ai\s*ml|ai\/ml)\b/gi, 'artificial intelligence machine learning'],
  [/\b(?:web dev|website banana|website banani)\b/gi, 'web development frontend fullstack'],
  [/\b(?:data scientist)\b/gi, 'data science'],
  [/\b(?:cyber security|ethical hacking)\b/gi, 'cybersecurity penetration testing'],
  [/\b(?:kaise shuru|kahan se shuru|shuru kar|seekhna|sikhna)\b/gi, 'beginner learning roadmap'],
  [/\b(?:kitne roadmaps|kitne tracks|total tracks|how many paths)\b/gi, 'roadmap catalog count'],
  [/\b(?:certificate kaise|certificate kab)\b/gi, 'certificate eligibility assessment'],
];

export function normalizeQuery(value) {
  return typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600) : '';
}

export function planRetrieval(query, { history = [], purpose = 'counsellor' } = {}) {
  const original = normalizeQuery(query);
  const skip = !original || /^(?:hi|hello|hey|thanks|thank you|namaste|ok|okay)[!.\s]*$/i.test(original);
  const followUp = /\b(it|that|this|those|its|isme|usme|yeh|uska|iske|aur|next)\b/i.test(original) && tokenize(original).length <= 7;
  const previous = history.filter(value => typeof value === 'string').map(normalizeQuery).filter(Boolean).at(-1);
  const contextual = followUp && previous ? `${previous.slice(0, 300)} ${original}` : original;
  const expanded = ALIASES.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), contextual);
  const comparison = /\b(vs|versus|compare|comparison|difference|between|better|dono|farak)\b/i.test(original);
  const broad = comparison || /\b(recommend|choose|options|career paths|explore)\b/i.test(original);
  return {
    original, query: normalizeQuery(expanded), skip,
    strategy: skip ? 'skip' : purpose === 'email' ? 'examples' : comparison ? 'comparison' : broad ? 'exploration' : 'focused',
    candidates: broad ? 40 : 30, rerankLimit: broad ? 20 : 14,
    limit: purpose === 'email' ? 6 : broad ? 6 : 4,
    corrections: contextual !== original ? ['follow-up-context'] : [],
  };
}

// One conservative spelling repair. No LLM or external service receives a query
// for rewriting; instructions in a retrieved document never become a query.
export function correctQuery(query, vocabulary) {
  const words = tokenize(query);
  let changed = false;
  const repaired = words.map(word => {
    if (word.length < 5 || vocabulary.has(word)) return word;
    const candidates = [...vocabulary].filter(candidate => candidate.length >= 5 && oneEditApart(word, candidate));
    if (candidates.length !== 1) return word;
    changed = true;
    return candidates[0];
  });
  return changed ? repaired.join(' ').slice(0, 600) : '';
}

function oneEditApart(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let left = 0;
  while (left < Math.min(a.length, b.length) && a[left] === b[left]) left++;
  if (a.length === b.length) {
    return a.slice(left + 1) === b.slice(left + 1)
      || (a[left] === b[left + 1] && a[left + 1] === b[left] && a.slice(left + 2) === b.slice(left + 2));
  }
  return a.length > b.length ? a.slice(left + 1) === b.slice(left) : a.slice(left) === b.slice(left + 1);
}

// These are conservative relevance heuristics, NOT calibrated probabilities.
// Fusion rank alone is deliberately insufficient evidence of relevance.
export function hasEvidence(hit) {
  // A strongly negative paired score can reject superficial keyword overlap.
  if (Number.isFinite(hit.rerankScore) && hit.rerankScore < 0.005) return false;
  return (hit.coverage >= 0.45 && hit.lexicalScore > 0)
    || hit.semanticScore >= 0.42
    || (hit.rerankScore >= 0.05 && (hit.coverage >= 0.2 || hit.semanticScore >= 0.30));
}
