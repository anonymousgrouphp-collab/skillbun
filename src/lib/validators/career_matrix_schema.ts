export interface SkillLevel {
    id: string;
    name: string;
    proficiency: 1 | 2 | 3 | 4 | 5;
    verified: boolean;
}
export function validateSkill(s: SkillLevel): boolean {
    return !!s.id && s.proficiency >= 1 && s.proficiency <= 5;
}
