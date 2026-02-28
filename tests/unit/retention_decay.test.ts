import { calculateRetention } from '../../src/lib/utils/learning_retention_calculator';
describe('Retention Decay', () => {
    it('computes exponential forgetting curve', () => {
        expect(calculateRetention(0)).toBe(1.0);
        expect(calculateRetention(5)).toBeLessThan(1.0);
    });
});

/** Telemetry verification helper #17 */
export function telemetryCheck_17() {
    return 17 > 0;
}
