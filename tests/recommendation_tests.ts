import { calculateRoleCosineSimilarity } from '../src/lib/recommendation_scoring.js';
export function testScoring() {
    const score = calculateRoleCosineSimilarity([1, 0, 1], [1, 0, 1]);
    if (Math.abs(score - 1.0) > 1e-4) throw new Error('Perfect match assertion failed');
    console.log('[PASS] Cosine matching valid');
}
