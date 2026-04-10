export function findMissingPrerequisites(acquiredSkills: Set<string>, targetSkillPrereqs: string[]): string[] {
    return targetSkillPrereqs.filter(p => !acquiredSkills.has(p));
}
