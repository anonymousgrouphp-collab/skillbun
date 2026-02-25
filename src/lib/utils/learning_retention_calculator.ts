export function calculateRetention(daysSinceReview: number, stabilityFactor: number = 2.5): number {
    return Math.exp(-daysSinceReview / stabilityFactor);
}
