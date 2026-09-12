import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadRagCorpus } from '../utils/server/rag/corpus.js';
import { embedTexts, getEmbeddingModelSignature, EMBEDDING_DIMENSIONS } from '../utils/server/rag/models.js';

/** Index only the allowlisted public corpus. No user records, quiz banks or vault content. */
export async function prepareRagIndex({
    loadCorpus = loadRagCorpus,
    embed = embedTexts,
    signature = getEmbeddingModelSignature(),
    outputPath = path.join(process.cwd(), 'content', 'rag', 'embeddings.json'),
    report = message => console.log(message),
} = {}) {
    const corpus = await loadCorpus({ force: true });
    if (!corpus.catalogComplete || !corpus.roadmapCount || !corpus.documents.length) {
        throw new Error('Public roadmap catalog is incomplete; the existing RAG index was preserved.');
    }
    if (!corpus.documents.every(document =>
        ['platform', 'roadmap', 'topics'].includes(document.kind) &&
        /^(?:skillbun:product:[a-z-]+|public\/data\/roadmaps\/[a-z][a-z0-9_-]{0,79}\.json)$/.test(document.source))) {
        throw new Error('RAG indexing only accepts the allowlisted public roadmap and product corpus.');
    }
    const vectors = [];
    report(`Preparing neural embeddings for ${corpus.documents.length} public documents from ${corpus.roadmapCount} roadmaps.`);
    for (let offset = 0; offset < corpus.documents.length; offset += 8) {
        const batch = corpus.documents.slice(offset, offset + 8);
        const result = await embed(batch.map(document => document.text), { timeoutMs: 300_000 });
        if (!Array.isArray(result) || result.length !== batch.length) throw new Error('Embedding batch was incomplete.');
        for (let index = 0; index < batch.length; index++) {
            const values = result[index];
            if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS ||
                values.some(value => typeof value !== 'number' || !Number.isFinite(value))) {
                throw new Error('Embedding batch contained an invalid vector.');
            }
            vectors.push({ id: batch[index].id, values: values.map(value => Number(value.toFixed(7))) });
        }
        if (offset === 0 || vectors.length % 80 === 0 || vectors.length === corpus.documents.length) {
            report(`Embedded ${vectors.length}/${corpus.documents.length} public documents.`);
        }
    }
    const artifact = { version: 1, corpusVersion: corpus.version, model: signature, dimensions: EMBEDDING_DIMENSIONS, vectors };
    const destination = path.resolve(outputPath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try {
        await fs.writeFile(temporary, `${JSON.stringify(artifact)}\n`, { encoding: 'utf8', flag: 'wx' });
        await fs.rename(temporary, destination);
    } finally {
        await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
    report(`Saved ${vectors.length} vectors (${EMBEDDING_DIMENSIONS} dimensions) to content/rag/embeddings.json.`);
    return artifact;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    prepareRagIndex().catch(error => {
        console.error(error?.name === 'RagModelError' ? error.message : 'RAG index preparation failed; the previous index was preserved. Check public catalog availability and model configuration.');
        process.exitCode = 1;
    });
}
