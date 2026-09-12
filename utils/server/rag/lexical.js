const STOPWORDS = new Set('a an and are as at be but by can do for from how i in is it me my of on or our that the their them there these they this to was we what when where which who will with you your hai hain ho ka ke ki ko kya mein mujhe se aur ek bhi'.split(' '));

/** Preserve technical identifiers instead of turning C++, C# and .NET into the same token. */
export function tokenize(text) {
  if (typeof text !== 'string') return [];
  return (text.toLowerCase().match(/c\+\+|c#|\.net\b|[\p{L}\p{N}]+(?:\.[\p{L}\p{N}]+)*/gu) || [])
    .filter(term => !STOPWORDS.has(term));
}

export function createLexicalIndex(documents) {
  const entries = new Map();
  const frequencies = new Map();
  let totalLength = 0;
  for (const document of Array.isArray(documents) ? documents : []) {
    if (!document?.id || entries.has(document.id)) continue;
    const tokens = tokenize(`${document.title || ''} ${document.text || ''} ${document.roadmapSlug || ''}`);
    const terms = new Map();
    for (const token of tokens) terms.set(token, (terms.get(token) || 0) + 1);
    for (const term of terms.keys()) frequencies.set(term, (frequencies.get(term) || 0) + 1);
    entries.set(document.id, { document, terms, length: tokens.length });
    totalLength += tokens.length;
  }
  return { entries, frequencies, averageLength: totalLength / Math.max(1, entries.size) || 1 };
}

/** Okapi BM25 scores are ranking signals, not calibrated relevance probabilities. */
export function searchLexical(index, query, { limit = 24 } = {}) {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length || !index?.entries?.size) return [];
  const results = [];
  const k1 = 1.2;
  const b = 0.75;
  for (const { document, terms: counts, length } of index.entries.values()) {
    let score = 0;
    const matchedTerms = [];
    for (const term of terms) {
      const frequency = counts.get(term) || 0;
      if (!frequency) continue;
      const documentFrequency = index.frequencies.get(term);
      const idf = Math.log(1 + (index.entries.size - documentFrequency + 0.5) / (documentFrequency + 0.5));
      score += idf * (frequency * (k1 + 1)) / (frequency + k1 * (1 - b + b * length / index.averageLength));
      matchedTerms.push(term);
    }
    if (score > 0) results.push({ document, score, coverage: matchedTerms.length / terms.length, matchedTerms });
  }
  return results.sort((a, b) => b.score - a.score || a.document.id.localeCompare(b.document.id)).slice(0, Math.max(0, Math.min(1200, Number(limit) || 0)));
}

/** Scale by the maximum possible fusion score; do not interpret the result as confidence. */
export function reciprocalRankFusion(rankings, { limit = 24, k = 60 } = {}) {
  const lists = (Array.isArray(rankings) ? rankings : []).filter(list => Array.isArray(list) && list.length);
  const smoothing = Number.isFinite(k) && k >= 0 ? k : 60;
  const merged = new Map();
  for (const ranking of lists) {
    const seen = new Set();
    let rank = 0;
    for (const result of ranking) {
      const id = result?.document?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const current = merged.get(id) || { document: result.document, score: 0, coverage: 0, matchedTerms: [] };
      current.score += 1 / (smoothing + ++rank);
      current.coverage = Math.max(current.coverage, Number(result.coverage) || 0);
      current.matchedTerms = [...new Set([...current.matchedTerms, ...(result.matchedTerms || [])])];
      merged.set(id, current);
    }
  }
  const maximum = lists.length / (smoothing + 1) || 1;
  return [...merged.values()].map(result => ({ ...result, score: result.score / maximum }))
    .sort((a, b) => b.score - a.score || a.document.id.localeCompare(b.document.id))
    .slice(0, Math.max(0, Math.min(1200, Number(limit) || 0)));
}
