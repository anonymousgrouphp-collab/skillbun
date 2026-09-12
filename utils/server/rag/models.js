import os from 'node:os';
import path from 'node:path';

export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
export const RERANKER_MODEL = 'Xenova/ms-marco-MiniLM-L-6-v2';
export const EMBEDDING_DIMENSIONS = 384;
export const EMBEDDING_MODEL_SIGNATURE = `${EMBEDDING_MODEL}:q8:mean:normalized:384`;

const MAX_BATCH = 32;
const MAX_TEXT_CHARS = 4000;
const MAX_QUERY_CHARS = 1600;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 4000;
const FAILURE_COOLDOWN_MS = 30_000;

export class RagModelError extends Error {
    constructor(code) {
        super(`RAG model operation unavailable (${code}).`);
        this.name = 'RagModelError';
        this.code = code;
    }
}

function modelError(code) {
    return new RagModelError(code);
}

function boundedTimeout(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.max(10, Math.min(300_000, number)) : DEFAULT_TIMEOUT_MS;
}

function cleanText(value, maximum = MAX_TEXT_CHARS) {
    if (typeof value !== 'string' || !value.trim()) throw modelError('INVALID_INPUT');
    return value.trim().slice(0, maximum);
}

function providerName(env) {
    const provider = String(env.RAG_MODEL_PROVIDER || 'local').trim().toLowerCase();
    if (!['local', 'http', 'lexical'].includes(provider)) throw modelError('INVALID_PROVIDER');
    return provider;
}

export function getEmbeddingModelSignature(env = process.env) {
    if (providerName(env) !== 'http') return EMBEDDING_MODEL_SIGNATURE;
    // A remote model's identity must be explicit: dimensions alone do not establish compatibility.
    const signature = String(env.RAG_EMBEDDING_MODEL_SIGNATURE || '').trim();
    if (!signature || signature.length > 240) throw modelError('MODEL_SIGNATURE_REQUIRED');
    return `http:${signature}`;
}

function validateVectors(vectors, expectedCount) {
    if (!Array.isArray(vectors) || vectors.length !== expectedCount) throw modelError('INVALID_RESPONSE');
    return vectors.map(vector => {
        if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS ||
            vector.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
            throw modelError('INVALID_RESPONSE');
        }
        const norm = Math.hypot(...vector);
        if (!Number.isFinite(norm) || norm < 1e-12) throw modelError('INVALID_RESPONSE');
        return vector.map(value => value / norm);
    });
}

function endpoint(value) {
    let url;
    try { url = new URL(String(value || '')); } catch { throw modelError('INVALID_ENDPOINT'); }
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.hash || !['https:', 'http:'].includes(url.protocol) ||
        (url.protocol === 'http:' && !loopback)) throw modelError('INVALID_ENDPOINT');
    return url;
}

async function readJson(response, signal) {
    if (!response.ok) throw modelError('PROVIDER_ERROR');
    const length = Number(response.headers.get('content-length'));
    if (Number.isFinite(length) && length > MAX_RESPONSE_BYTES) throw modelError('INVALID_RESPONSE');
    const reader = response.body?.getReader();
    if (!reader) throw modelError('INVALID_RESPONSE');
    let size = 0;
    let body = '';
    const decoder = new TextDecoder();
    try {
        while (true) {
            if (signal.aborted) throw modelError('ABORTED');
            const { done, value } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_RESPONSE_BYTES) throw modelError('INVALID_RESPONSE');
            body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
        try { return JSON.parse(body); } catch { throw modelError('INVALID_RESPONSE'); }
    } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
    }
}

/** Server-only neural adapters. Factories are injectable so tests never download models. */
export function createRagModelAdapter({
    env = process.env,
    loadTransformers = () => import('@huggingface/transformers'),
    fetchImpl = (...args) => fetch(...args),
    now = Date.now,
} = {}) {
    let transformersPromise;
    let embeddingPromise;
    let rerankerPromise;
    const state = {
        embedding: { pending: null, failures: 0, blockedUntil: 0 },
        reranker: { pending: null, failures: 0, blockedUntil: 0 },
    };

    function transformers() {
        if (!transformersPromise) {
            transformersPromise = Promise.resolve().then(loadTransformers).then(library => {
                library.env.cacheDir = String(env.RAG_MODEL_CACHE_DIR || path.join(os.tmpdir(), 'skillbun-rag-models'));
                return library;
            }).catch(error => { transformersPromise = null; throw error; });
        }
        return transformersPromise;
    }

    function embeddingModel() {
        if (!embeddingPromise) {
            embeddingPromise = transformers().then(library => library.pipeline('feature-extraction', EMBEDDING_MODEL, {
                dtype: 'q8', device: 'cpu',
            })).catch(error => { embeddingPromise = null; throw error; });
        }
        return embeddingPromise;
    }

    function rankingModel() {
        if (!rerankerPromise) {
            rerankerPromise = transformers().then(async library => {
                const [tokenizer, model] = await Promise.all([
                    library.AutoTokenizer.from_pretrained(RERANKER_MODEL),
                    library.AutoModelForSequenceClassification.from_pretrained(RERANKER_MODEL, { dtype: 'q8', device: 'cpu' }),
                ]);
                return { tokenizer, model };
            }).catch(error => { rerankerPromise = null; throw error; });
        }
        return rerankerPromise;
    }

    async function http(urlValue, payload, signal) {
        const url = endpoint(urlValue);
        const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
        if (env.RAG_MODEL_API_KEY) headers.Authorization = `Bearer ${env.RAG_MODEL_API_KEY}`;
        const response = await fetchImpl(url.toString(), {
            method: 'POST', headers, body: JSON.stringify(payload), signal, redirect: 'error',
        });
        return readJson(response, signal);
    }

    async function run(kind, operation, { signal, timeoutMs } = {}) {
        const provider = providerName(env);
        if (provider === 'lexical') throw modelError('DISABLED');
        if (signal?.aborted) throw modelError('ABORTED');
        const slot = state[kind];
        if (slot.pending) throw modelError('BUSY');
        if (slot.blockedUntil > now()) throw modelError('COOLDOWN');
        const controller = new AbortController();
        let timer;
        let onAbort;
        let expired = false;
        const deadline = new Promise((_, reject) => {
            onAbort = () => { controller.abort(); reject(modelError('ABORTED')); };
            signal?.addEventListener('abort', onAbort, { once: true });
            timer = setTimeout(() => {
                expired = true;
                controller.abort();
                reject(modelError('TIMEOUT'));
            }, boundedTimeout(timeoutMs ?? env.RAG_MODEL_TIMEOUT_MS));
        });
        // Native ONNX inference cannot always be interrupted. Keep its slot occupied until it
        // really settles, including after a caller times out; never build an unbounded queue.
        const pending = Promise.resolve().then(() => operation(provider, controller.signal));
        slot.pending = pending;
        pending.then(() => {
            if (!expired) { slot.failures = 0; slot.blockedUntil = 0; }
        }, () => {}).finally(() => { if (slot.pending === pending) slot.pending = null; });
        try {
            return await Promise.race([pending, deadline]);
        } catch (error) {
            if (error?.code !== 'ABORTED') {
                slot.failures++;
                if (expired || slot.failures >= 3) slot.blockedUntil = now() + FAILURE_COOLDOWN_MS;
            }
            throw error instanceof RagModelError ? error : modelError('PROVIDER_ERROR');
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
        }
    }

    return {
        getEmbeddingModelSignature: () => getEmbeddingModelSignature(env),
        async embedTexts(texts, options = {}) {
            if (!Array.isArray(texts) || !texts.length || texts.length > MAX_BATCH) throw modelError('INVALID_INPUT');
            const batch = texts.map(text => cleanText(text));
            return run('embedding', async (provider, signal) => {
                let vectors;
                if (provider === 'http') {
                    getEmbeddingModelSignature(env);
                    vectors = await http(env.RAG_EMBEDDING_URL, { inputs: batch, normalize: true, truncate: true }, signal);
                } else {
                    const model = await embeddingModel();
                    if (signal.aborted) throw modelError('ABORTED');
                    const output = await model(batch, { pooling: 'mean', normalize: true, truncation: true, max_length: 256 });
                    vectors = output.tolist();
                }
                return validateVectors(vectors, batch.length);
            }, options);
        },
        async rerankDocuments(query, documents, options = {}) {
            const question = cleanText(query, MAX_QUERY_CHARS);
            if (!Array.isArray(documents) || !documents.length || documents.length > MAX_BATCH) throw modelError('INVALID_INPUT');
            const ids = new Set();
            const passages = documents.map(document => {
                if (!document || typeof document.id !== 'string' || !document.id || ids.has(document.id)) throw modelError('INVALID_INPUT');
                ids.add(document.id);
                const text = cleanText(document.text);
                return `${typeof document.title === 'string' ? document.title.slice(0, 200) + '\n' : ''}${text}`.slice(0, MAX_TEXT_CHARS);
            });
            return run('reranker', async (provider, signal) => {
                let scores;
                if (provider === 'http') {
                    const response = await http(env.RAG_RERANK_URL, { query: question, texts: passages, raw_scores: false, truncate: true }, signal);
                    if (!Array.isArray(response) || response.length !== documents.length) throw modelError('INVALID_RESPONSE');
                    const seen = new Set();
                    scores = Array(documents.length);
                    for (const result of response) {
                        if (!Number.isInteger(result?.index) || result.index < 0 || result.index >= documents.length ||
                            seen.has(result.index) || typeof result.score !== 'number' || !Number.isFinite(result.score) ||
                            result.score < 0 || result.score > 1) throw modelError('INVALID_RESPONSE');
                        seen.add(result.index);
                        scores[result.index] = result.score;
                    }
                } else {
                    const { tokenizer, model } = await rankingModel();
                    if (signal.aborted) throw modelError('ABORTED');
                    const inputs = tokenizer(passages.map(() => question), {
                        text_pair: passages, padding: true, truncation: true, max_length: 512,
                    });
                    const output = await model(inputs);
                    const logits = output?.logits;
                    if (!logits || logits.dims?.length !== 2 || logits.dims[0] !== documents.length || logits.dims[1] !== 1 ||
                        logits.data?.length !== documents.length) throw modelError('INVALID_RESPONSE');
                    scores = Array.from(logits.data, value => {
                        if (typeof value !== 'number' || !Number.isFinite(value)) throw modelError('INVALID_RESPONSE');
                        return 1 / (1 + Math.exp(-value));
                    });
                }
                // Sigmoid is a bounded ranking signal, not a calibrated probability of truth.
                return documents.map((document, index) => ({ document, score: scores[index] }))
                    .sort((left, right) => right.score - left.score || left.document.id.localeCompare(right.document.id));
            }, options);
        },
    };
}

const defaultAdapter = createRagModelAdapter();
export const embedTexts = (texts, options) => defaultAdapter.embedTexts(texts, options);
export const rerankDocuments = (query, documents, options) => defaultAdapter.rerankDocuments(query, documents, options);
