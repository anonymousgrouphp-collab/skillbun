import { createHash, randomUUID } from 'node:crypto';
import { getGroqApiKey, getOpenRouterApiKey, getTokenRouterApiKey, getTokenRouterModel } from './env.js';
import { TOKENROUTER_CHAT_URL } from './tokenRouter.js';
import { EMAIL_CATEGORIES } from '../shared/emailRecommendation.js';
import { validateEmailDraft } from '../shared/emailDraft.js';
import { buildEmailDraftPrompt } from './emailDraftPrompt.js';
import { loadEmailDraftKnowledge } from './emailDraftKnowledge.js';

export function draftCollection(db, category) {
  if (!Object.hasOwn(EMAIL_CATEGORIES, category)) throw new Error('Invalid email category.');
  return db.collection('emailTemplateLibrary').doc(category).collection('variations');
}
export function parseDraftId(id) {
  const match = /^ai_(welcome|reengagement|exam_nudge|exam_failed|cert_congrats)_([a-f0-9]{32})$/.exec(id || '');
  return match ? { category: match[1], key: match[2] } : null;
}
export async function getSavedDraft(db, id) {
  const parsed = parseDraftId(id);
  if (!parsed) throw new Error('Invalid saved template ID.');
  const doc = await draftCollection(db, parsed.category).doc(parsed.key).get();
  if (!doc.exists) throw new Error('Saved template was not found.');
  return { ...doc.data(), id };
}
export async function findUnsentDraft(db, category, history = []) {
  const sent = new Set(history.map(log => typeof log === 'string' ? log : log.templateId));
  let cursor;
  for (let page = 0; page < 10; page++) {
    let query = draftCollection(db, category).orderBy('__name__').limit(50);
    if (cursor) query = query.startAfter(cursor);
    const snap = await query.get();
    const found = snap.docs.find(doc => !sent.has(doc.data().id));
    if (found) return found.data();
    if (snap.size < 50) return null;
    cursor = snap.docs.at(-1);
  }
  throw new Error('Please choose a variation from the saved library.');
}
export function draftFingerprint(category, content) {
  return createHash('sha256').update(category + ':' + JSON.stringify(content).toLowerCase().replace(/\s+/g, ' ')).digest('hex').slice(0, 32);
}
export async function generateDraftContent(category, existingSubjects = [], fetcher = fetch, knowledgeReader) {
  if (!Object.hasOwn(EMAIL_CATEGORIES, category)) throw new Error('Invalid email category.');
  const providers = [
    { name: 'groq', key: getGroqApiKey(), url: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-20b', options: { reasoning_effort: 'low' } },
    { name: 'tokenrouter', key: getTokenRouterApiKey(), url: TOKENROUTER_CHAT_URL, model: getTokenRouterModel(), maxTokens: 4096, timeoutMs: 30000 },
    { name: 'openrouter', key: getOpenRouterApiKey(), url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openrouter/free', options: { reasoning: { enabled: false } } },
  ].filter(p => p.key);
  if (!providers.length) throw new Error('Configure the existing GROQ_API_KEY, TOKENROUTER_API_KEY or OPENROUTER_API_KEY to generate AI email drafts.');
  const deadline = Date.now() + 45000;
  const knowledge = await loadEmailDraftKnowledge(category, knowledgeReader);
  const instructions = buildEmailDraftPrompt(category, existingSubjects, knowledge);
  for (const provider of providers) {
    try {
      // Reasoning shares the output budget; leave room for the complete JSON draft.
      // Bound the entire provider chain, leaving time to save before the lease expires.
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) break;
      const response = await fetcher(provider.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${provider.key}` }, body: JSON.stringify({ model: provider.model, messages: [{ role: 'system', content: instructions }], response_format: { type: 'json_object' }, temperature: 0.85, max_tokens: provider.maxTokens || 3000, ...provider.options }), signal: AbortSignal.timeout(Math.min(provider.timeoutMs || 20000, remainingMs)) });
      if (!response.ok) continue;
      const result = await response.json();
      if (result?.choices?.[0]?.finish_reason && result.choices[0].finish_reason !== 'stop') continue;
      const raw = result?.choices?.[0]?.message?.content;
      if (typeof raw !== 'string' || raw.length > 10000) continue;
      const content = validateEmailDraft(JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '')), { requireQuality: true });
      return { content, provider: provider.name, model: provider.model, groundingSources: knowledge.map(example => example.source) };
    } catch { /* Try the other configured provider without exposing its response or credentials. */ }
  }
  throw new Error('AI drafting is temporarily unavailable or returned invalid content. Existing templates remain available.');
}
export async function createSavedDraft(db, category, adminUid) {
  const collection = draftCollection(db, category);
  const leaseRef = db.collection('emailDraftLocks').doc(category);
  const owner = randomUUID();
  await db.runTransaction(async tx => {
    const lease = await tx.get(leaseRef);
    if (lease.exists && lease.data().expiresAt > Date.now()) throw new Error('A variation for this category is already being generated. Try again shortly.');
    tx.set(leaseRef, { owner, expiresAt: Date.now() + 60000 });
  });
  try {
    const recent = await collection.orderBy('createdAt', 'desc').limit(12).get();
    const generated = await generateDraftContent(category, recent.docs.map(d => d.data().content.subject));
    const key = draftFingerprint(category, generated.content);
    const id = `ai_${category}_${key}`;
    const draft = { id, category, ...generated, nameKey: generated.content.name.toLowerCase(), createdAt: new Date().toISOString(), createdBy: adminUid, schemaVersion: 2, status: 'draft' };
    const ref = collection.doc(key);
    // Immutable versions: exact duplicate generations resolve to the existing record.
    try { await ref.create(draft); } catch (error) {
      if (error.code !== 6 && error.code !== 'already-exists') throw error;
      return { ...(await ref.get()).data(), reused: true };
    }
    return draft;
  } finally {
    await db.runTransaction(async tx => {
      const lease = await tx.get(leaseRef);
      if (lease.data()?.owner === owner) tx.delete(leaseRef);
    });
  }
}
