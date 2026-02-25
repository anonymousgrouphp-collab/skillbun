import { calculateRetention } from '../../src/lib/utils/learning_retention_calculator';
describe('Retention Decay', () => {
    it('computes exponential forgetting curve', () => {
        expect(calculateRetention(0)).toBe(1.0);
        expect(calculateRetention(5)).toBeLessThan(1.0);
    });
});
