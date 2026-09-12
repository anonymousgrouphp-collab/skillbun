import { renderSavedEmail } from '../../utils/shared/emailDraft.js';
import { EMAIL_DRAFT_VISUALS } from '../../utils/shared/emailDraftStandard.js';

// Synthetic editorial examples for visual checks. No provider or mail dispatch.
const COPY = {
  welcome: ['Discover a career direction, {{name}}', 'Start with what interests you.', 'Set up my profile', 'Think of a college project you would enjoy helping with. Your interests give you a useful starting point for comparing career paths.'],
  reengagement: ['Choose one concept to revisit, {{name}}', 'Make one idea click.', 'Open my roadmap', 'Try explaining the concept to a classmate in your own words. If you get stuck, that is a useful clue about what to read again.'],
  exam_nudge: ['Review a concept before your assessment', 'Check your understanding before you begin.', 'Check exam options', 'Reading an explanation can feel easier than recalling it. Try writing an example with your notes closed before choosing what to review.'],
  exam_failed: ['Turn a difficult topic into a worked example', 'Build clarity before another attempt.', 'Review my roadmap', 'Choose a concept you found difficult, rather than trying to revise everything at once. Focus on the part you cannot yet explain clearly.'],
  cert_congrats: ['Put your roadmap learning into practice', 'You earned it. Now apply an idea.', 'Revisit my roadmap', 'Your roadmap certificate recognises the assessment you passed. A small example is a useful way to practise applying what you learned.'],
};

export function emailDraftSamples(overrides = {}) {
  const data = { name: 'Sample Student', roadmapTitle: 'Full Stack Development', roadmapSlug: 'fullstack', email: 'sample@example.com', ...overrides };
  return Object.fromEntries(Object.entries(EMAIL_DRAFT_VISUALS).map(([category, visual]) => {
    const [subject, headline, ctaLabel, paragraph] = COPY[category];
    const content = {
      name: `Visual standard: ${category}`, subject, headline, ctaLabel,
      intro: category === 'welcome' ? 'Hi {{name}}, start with your interests and explore where they could take you.' : 'Hi {{name}}, here is a practical way to work with what you learn on {{roadmapTitle}}.',
      paragraphs: [paragraph], focus: visual.focus, steps: visual.steps,
    };
    return [`ai_${category}`, renderSavedEmail({ category, schemaVersion: 2, content }, data)];
  }));
}
