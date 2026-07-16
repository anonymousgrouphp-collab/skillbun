export function estimatePreparationMonths(skillGapsCount: number, weeklyHours: number): number {
    return Math.max(1, Math.round((skillGapsCount * 40) / (weeklyHours * 4)));
}
