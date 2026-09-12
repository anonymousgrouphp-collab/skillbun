import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
    createRagModelAdapter, EMBEDDING_MODEL, RERANKER_MODEL, EMBEDDING_MODEL_SIGNATURE,
    EMBEDDING_DIMENSIONS, getEmbeddingModelSignature,
} from '../../utils/server/rag/models.js';
import { prepareRagIndex } from '../../scripts/prepare-rag-index.mjs';

const vector = (first = 1) => [first, ...Array(EMBEDDING_DIMENSIONS - 1).fill(0)];
const documents = [
    { id: 'a', title: 'Databases', text: 'Query relational data using SQL.' },
    { id: 'b', title: 'Interface design', text: 'Create page layouts and accessible interfaces.' },
];
const errorCode = code => error => error?.name === 'RagModelError' && error.code === code;
const tick = () => new Promise(resolve => setImmediate(resolve));

function mockLibrary({ extract, classify, initialize } = {}) {
    const calls = [];
    const library = {
        env: {},
        pipeline: async (...args) => {
            calls.push(['pipeline', ...args]);
            await initialize?.();
            return async (...input) => {
                calls.push(['extract', ...input]);
                return extract ? extract(...input) : { tolist: () => input[0].map(() => vector(2)) };
            };
        },
        AutoTokenizer: { from_pretrained: async model => {
            calls.push(['tokenizer', model]);
            return (...args) => { calls.push(['pairs', ...args]); return { paired: args }; };
        } },
        AutoModelForSequenceClassification: { from_pretrained: async (...args) => {
            calls.push(['classifier', ...args]);
            return async inputs => {
                calls.push(['classify', inputs]);
                return classify ? classify(inputs) : { logits: { dims: [documents.length, 1], data: new Float32Array([-3, 4]) } };
            };
        } },
    };
    return { library, calls };
}

test('local embeddings use a real q8 neural feature-extraction contract and reuse initialization', async () => {
    const { library, calls } = mockLibrary();
    const adapter = createRagModelAdapter({ env: {}, loadTransformers: async () => library });
    assert.deepEqual(await adapter.embedTexts(['Learn SQL']), [vector()]);
    assert.deepEqual(await adapter.embedTexts(['Build a web page']), [vector()]);
    assert.equal(calls.filter(call => call[0] === 'pipeline').length, 1);
    assert.deepEqual(calls[0], ['pipeline', 'feature-extraction', EMBEDDING_MODEL, { dtype: 'q8', device: 'cpu' }]);
    assert.deepEqual(calls[1][2], { pooling: 'mean', normalize: true, truncation: true, max_length: 256 });
    assert.equal(library.env.cacheDir, path.join(os.tmpdir(), 'skillbun-rag-models'));
    assert.equal(adapter.getEmbeddingModelSignature(), EMBEDDING_MODEL_SIGNATURE);
});

test('cross encoder jointly tokenizes query/document pairs and ranks classifier logits', async () => {
    const { library, calls } = mockLibrary();
    const adapter = createRagModelAdapter({ env: {}, loadTransformers: async () => library });
    const result = await adapter.rerankDocuments('How can I build an accessible page?', documents);
    assert.equal(result[0].document, documents[1]);
    assert.ok(result[0].score > 0.98);
    const pairCall = calls.find(call => call[0] === 'pairs');
    assert.deepEqual(pairCall[1], Array(2).fill('How can I build an accessible page?'));
    assert.deepEqual(pairCall[2].text_pair, documents.map(document => `${document.title}\n${document.text}`));
    assert.equal(pairCall[2].max_length, 512);
    assert.deepEqual(calls.find(call => call[0] === 'classifier'), ['classifier', RERANKER_MODEL, { dtype: 'q8', device: 'cpu' }]);
});

test('disabled and invalid providers never load or call a remote model', async () => {
    for (const [provider, code] of [['lexical', 'DISABLED'], ['unknown', 'INVALID_PROVIDER']]) {
        const adapter = createRagModelAdapter({ env: { RAG_MODEL_PROVIDER: provider }, loadTransformers: () => assert.fail(), fetchImpl: () => assert.fail() });
        await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode(code));
    }
});

test('failed local initialization recovers on a later request without surfacing raw provider errors', async () => {
    let attempts = 0;
    const { library } = mockLibrary({ initialize: () => { if (++attempts === 1) throw new Error('secret credentials'); } });
    const adapter = createRagModelAdapter({ env: {}, loadTransformers: async () => library });
    await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('PROVIDER_ERROR'));
    await tick();
    assert.deepEqual(await adapter.embedTexts(['Learn SQL']), [vector()]);
    assert.equal(attempts, 2);
});

test('timeout keeps unfinished native inference occupied and permits warm reuse afterwards', async () => {
    let complete;
    let clock = 0;
    let extractionCount = 0;
    const { library, calls } = mockLibrary({ extract: async () => {
        extractionCount++;
        if (extractionCount === 1) await new Promise(resolve => { complete = resolve; });
        return { tolist: () => [vector()] };
    } });
    const adapter = createRagModelAdapter({ env: {}, loadTransformers: async () => library, now: () => clock });
    await assert.rejects(adapter.embedTexts(['Learn SQL'], { timeoutMs: 10 }), errorCode('TIMEOUT'));
    clock = 60_000;
    await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('BUSY'));
    complete();
    await tick();
    assert.deepEqual(await adapter.embedTexts(['Learn SQL']), [vector()]);
    assert.equal(calls.filter(call => call[0] === 'pipeline').length, 1);
});

test('caller cancellation bounds HTTP work and aborts the underlying request', async () => {
    let requestSignal;
    const adapter = createRagModelAdapter({ env: httpEnv(), fetchImpl: async (_, options) => {
        requestSignal = options.signal;
        await new Promise((_, reject) => options.signal.addEventListener('abort', () => reject(new Error('abort')), { once: true }));
    } });
    const controller = new AbortController();
    const pending = adapter.embedTexts(['Learn SQL'], { signal: controller.signal });
    await tick();
    controller.abort();
    await assert.rejects(pending, errorCode('ABORTED'));
    assert.equal(requestSignal.aborted, true);
});

function httpEnv(overrides = {}) {
    return { RAG_MODEL_PROVIDER: 'http', RAG_EMBEDDING_URL: 'https://embeddings.example/embed',
        RAG_RERANK_URL: 'https://reranker.example/rerank', RAG_EMBEDDING_MODEL_SIGNATURE: 'miniLM-deployment-v1', ...overrides };
}

test('HTTP TEI adapter uses explicit authenticated endpoints and maps rerank indices', async () => {
    const calls = [];
    const adapter = createRagModelAdapter({ env: httpEnv({ RAG_MODEL_API_KEY: 'test-only' }), fetchImpl: async (url, options) => {
        calls.push({ url, ...options, body: JSON.parse(options.body) });
        return Response.json(url.endsWith('/embed') ? [vector(2)] : [{ index: 1, score: 0.9 }, { index: 0, score: 0.1 }]);
    } });
    assert.deepEqual(await adapter.embedTexts(['Learn SQL']), [vector()]);
    const ranked = await adapter.rerankDocuments('Build a page', documents);
    assert.equal(ranked[0].document, documents[1]);
    assert.equal(calls[0].redirect, 'error');
    assert.equal(calls[0].headers.Authorization, 'Bearer test-only');
    assert.deepEqual(calls[0].body, { inputs: ['Learn SQL'], normalize: true, truncate: true });
    assert.equal(calls[1].body.raw_scores, false);
    assert.equal(adapter.getEmbeddingModelSignature(), 'http:miniLM-deployment-v1');
});

test('HTTP endpoints cannot contain URL credentials, insecure remote transport or redirects', async () => {
    for (const url of ['https://user:password@example.com/embed', 'http://example.com/embed', 'file:///private/key', 'https://example.com/embed#key']) {
        const adapter = createRagModelAdapter({ env: httpEnv({ RAG_EMBEDDING_URL: url }), fetchImpl: () => assert.fail() });
        await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('INVALID_ENDPOINT'));
    }
    const redirected = createRagModelAdapter({ env: httpEnv(), fetchImpl: async () => Response.json({}, { status: 302 }) });
    await assert.rejects(redirected.embedTexts(['Learn SQL']), errorCode('PROVIDER_ERROR'));
    assert.throws(() => getEmbeddingModelSignature(httpEnv({ RAG_EMBEDDING_MODEL_SIGNATURE: '' })), errorCode('MODEL_SIGNATURE_REQUIRED'));
});

test('invalid neural vectors, logits, duplicate rerank indices and oversized bodies are rejected', async () => {
    for (const response of [[vector().slice(1)], [[...Array(384).fill(0)]], [vector().map(() => '1')], []]) {
        const adapter = createRagModelAdapter({ env: httpEnv(), fetchImpl: async () => Response.json(response) });
        await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('INVALID_RESPONSE'));
    }
    for (const response of [[{ index: 0, score: 0.8 }, { index: 0, score: 0.9 }], [{ index: 0, score: -1 }, { index: 1, score: 1 }]]) {
        const adapter = createRagModelAdapter({ env: httpEnv(), fetchImpl: async () => Response.json(response) });
        await assert.rejects(adapter.rerankDocuments('Learn SQL', documents), errorCode('INVALID_RESPONSE'));
    }
    const { library } = mockLibrary({ classify: () => ({ logits: { dims: [2, 2], data: [1, 2, 3, 4] } }) });
    await assert.rejects(createRagModelAdapter({ env: {}, loadTransformers: async () => library }).rerankDocuments('Learn SQL', documents), errorCode('INVALID_RESPONSE'));
    const oversized = createRagModelAdapter({ env: httpEnv(), fetchImpl: async () => new Response('x'.repeat(1024 * 1024 + 1)) });
    await assert.rejects(oversized.embedTexts(['Learn SQL']), errorCode('INVALID_RESPONSE'));
});

test('input caps stop unbounded work and malformed documents before loading models', async () => {
    const adapter = createRagModelAdapter({ env: {}, loadTransformers: () => assert.fail() });
    for (const texts of [[], Array(33).fill('text'), [null], ['   ']]) {
        await assert.rejects(adapter.embedTexts(texts), errorCode('INVALID_INPUT'));
    }
    await assert.rejects(adapter.rerankDocuments('SQL', [documents[0], documents[0]]), errorCode('INVALID_INPUT'));
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(adapter.embedTexts(['Learn SQL'], { signal: controller.signal }), errorCode('ABORTED'));
});

test('repeated provider failures open a bounded cooldown', async () => {
    let count = 0;
    let clock = 0;
    const adapter = createRagModelAdapter({ env: httpEnv(), now: () => clock, fetchImpl: async () => { count++; return Response.json({}, { status: 503 }); } });
    for (let i = 0; i < 3; i++) {
        await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('PROVIDER_ERROR'));
        await tick();
    }
    await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('COOLDOWN'));
    assert.equal(count, 3);
    clock = 30_001;
    await assert.rejects(adapter.embedTexts(['Learn SQL']), errorCode('PROVIDER_ERROR'));
    assert.equal(count, 4);
});

test('public indexing writes a complete versioned artifact and preserves it on incomplete input', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'skillbun-rag-index-test-'));
    const outputPath = path.join(directory, 'embeddings.json');
    const corpus = { catalogComplete: true, roadmapCount: 1, version: 'test-version', documents: [
        { id: 'roadmap:frontend', kind: 'roadmap', source: 'public/data/roadmaps/frontend.json', text: 'Learn accessible page layouts.' },
    ] };
    try {
        const artifact = await prepareRagIndex({ outputPath, signature: EMBEDDING_MODEL_SIGNATURE, loadCorpus: async () => corpus, embed: async () => [vector()], report() {} });
        assert.equal(artifact.corpusVersion, 'test-version');
        assert.equal(artifact.vectors[0].id, 'roadmap:frontend');
        const before = await fs.readFile(outputPath, 'utf8');
        await assert.rejects(prepareRagIndex({ outputPath, loadCorpus: async () => ({ ...corpus, catalogComplete: false }), embed: () => assert.fail(), report() {} }), /incomplete/);
        await assert.rejects(prepareRagIndex({ outputPath, loadCorpus: async () => ({ ...corpus, documents: [{ ...corpus.documents[0], source: 'content/docs/private.sbv' }] }), embed: () => assert.fail(), report() {} }), /public/);
        assert.equal(await fs.readFile(outputPath, 'utf8'), before);
        assert.deepEqual(await fs.readdir(directory), ['embeddings.json']);
    } finally {
        await fs.unlink(outputPath).catch(() => {});
        await fs.rmdir(directory);
    }
});
