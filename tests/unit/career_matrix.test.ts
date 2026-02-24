import { validateSkill } from '../../src/lib/validators/career_matrix_schema';
describe('SkillLevel Validation', () => {
    it('accepts valid proficiency rating', () => {
        expect(validateSkill({ id: 'ts-01', name: 'TypeScript', proficiency: 4, verified: true })).toBe(true);
    });
});
