export function calculateNextDifficulty(consecutiveCorrect: number): 'easy' | 'medium' | 'hard' {
    if (consecutiveCorrect >= 3) return 'hard';
    if (consecutiveCorrect >= 1) return 'medium';
    return 'easy';
}
