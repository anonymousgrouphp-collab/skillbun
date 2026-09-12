import { retrieveKnowledge } from '../utils/server/rag/index.js';
import { embedTexts, rerankDocuments } from '../utils/server/rag/models.js';

// Public synthetic queries only; does not invoke a generative LLM or send emails.
const lexicalOnly = process.argv.includes('--lexical');
if (lexicalOnly) process.env.RAG_MODEL_PROVIDER = 'lexical';
else {
  await embedTexts(['Career learning roadmap'], { timeoutMs: 300000 });
  await rerankDocuments('Frontend learning', [{ id: 'warmup', title: 'Frontend', text: 'Learn HTML and CSS for web interfaces.' }], { timeoutMs: 300000 });
}
const cases = [
  ['frontend HTML CSS learning', ['frontend']],
  ['C# .NET developer', ['dotnet_developer']],
  ['cybersecurty', ['cybersecurity']],
  ['website banana kaise shuru', ['frontend', 'fullstack']],
  ['analyze data to find patterns and insights', ['data_science', 'data_analyst']],
  ['What are the certificate eligibility and retry rules?', ['platform:certification']],
  ['frontend versus backend', ['frontend', 'backend']],
  ['orchids lunar pancakes', []],
];
let passed = 0;
for (const [query, expected] of cases) {
  const start = Date.now();
  const result = await retrieveKnowledge({ query, timeoutMs: 12000 });
  const ids = result.sources.map(hit => hit.document.roadmapSlug || hit.document.id);
  const matched = expected.length ? expected.some(id => ids.includes(id)) : !ids.length;
  if (matched) passed++;
  console.log(JSON.stringify({ query, status: result.status, mode: result.mode, strategy: result.strategy, corrections: result.corrections,
    sources: ids, reranked: result.sources.some(hit => Number.isFinite(hit.rerankScore)), passed: matched, elapsedMs: Date.now() - start }));
}
console.log(`Public retrieval smoke evaluation: ${passed}/${cases.length} cases passed (${lexicalOnly ? 'lexical' : 'neural hybrid'} mode).`);
if (passed !== cases.length) process.exitCode = 1;
