export function calculateRoleCosineSimilarity(userVector: number[], roleVector: number[]): number {
    if (userVector.length !== roleVector.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < userVector.length; i++) {
        dot += userVector[i] * roleVector[i];
        normA += userVector[i] * userVector[i];
        normB += roleVector[i] * roleVector[i];
    }
    return (normA > 0 && normB > 0) ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}
