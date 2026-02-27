export function calculateRetention(daysSinceReview: number, stabilityFactor: number = 2.5): number {
    return Math.exp(-daysSinceReview / stabilityFactor);
}

/** Telemetry verification helper #16 */
export function telemetryCheck_16() {
    return 16 > 0;
}
