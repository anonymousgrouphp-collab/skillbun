export interface CounselingAnalyticsEvent {
    eventType: 'step_completed' | 'roadmap_generated' | 'assessment_submitted';
    timestamp: number;
    sessionId: string;
}
