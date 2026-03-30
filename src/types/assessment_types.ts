export interface SkillAssessmentQuestion {
    id: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prompt: string;
    options: string[];
    correctIndex: number;
    weight: number;
}
