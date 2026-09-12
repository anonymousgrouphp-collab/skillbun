import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { getEmbeddingModelSignature, EMBEDDING_DIMENSIONS } from './models.js';

const INDEX_FILE = path.join(process.cwd(), 'content/rag/embeddings.json');
let cached;

/** Never build a corpus embedding index in a user request. Stale indexes fail closed. */
export async function loadVectorIndex(corpus, { reader = readFile } = {}) {
  let signature;
  try { signature = getEmbeddingModelSignature(); } catch { return null; }
  if (reader === readFile && cached?.version === corpus.version && cached.signature === signature && cached.expires > Date.now()) return cached.value;
  let value = null;
  try {
    if (reader === readFile && (await stat(INDEX_FILE)).size > 32 * 1024 * 1024) return null;
    const raw = await reader(INDEX_FILE, { encoding: 'utf8', signal: AbortSignal.timeout(1000) });
    if (typeof raw !== 'string' || raw.length > 32 * 1024 * 1024) return null;
    const data = JSON.parse(raw);
    const ids = new Set(corpus.documents.map(doc => doc.id));
    if (data.version !== 1 || data.corpusVersion !== corpus.version || data.model !== signature
      || data.dimensions !== EMBEDDING_DIMENSIONS || !Array.isArray(data.vectors) || data.vectors.length !== ids.size) return null;
    const vectors = new Map();
    for (const entry of data.vectors) {
      if (!ids.has(entry?.id) || vectors.has(entry.id) || !validVector(entry.values, data.dimensions)) return null;
      vectors.set(entry.id, entry.values);
    }
    value = vectors;
  } catch { /* Missing or invalid vectors leave lexical retrieval available. */ }
  if (reader === readFile) cached = { version: corpus.version, signature, expires: Date.now() + (value ? 300000 : 30000), value };
  return value;
}

export function validVector(vector, dimensions) {
  return Array.isArray(vector) && vector.length === dimensions
    && vector.every(value => typeof value === 'number' && Number.isFinite(value))
    && vector.some(value => value !== 0);
}

export function searchDense(documents, vectors, queryVector, { limit = 24 } = {}) {
  if (!(vectors instanceof Map) || !validVector(queryVector, EMBEDDING_DIMENSIONS)) return [];
  const queryNorm = Math.hypot(...queryVector);
  return documents.flatMap(document => {
    const vector = vectors.get(document.id);
    if (!validVector(vector, queryVector.length)) return [];
    let dot = 0;
    for (let i = 0; i < vector.length; i++) dot += vector[i] * queryVector[i];
    const score = dot / (queryNorm * Math.hypot(...vector));
    return Number.isFinite(score) ? [{ document, score }] : [];
  }).sort((a, b) => b.score - a.score || a.document.id.localeCompare(b.document.id)).slice(0, limit);
}
