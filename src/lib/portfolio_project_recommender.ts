export function recommendProjects(missingSkills: string[]): string[] {
    return missingSkills.map(s => `Fullstack capstone demonstrating ${s} integration`);
}
