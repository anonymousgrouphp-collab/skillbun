/**
 * AI mail visual standard. Layout and product facts belong to SkillBun, not
 * model-generated HTML. These defaults also upgrade saved V1 drafts at render
 * time without changing their immutable content or IDs.
 */
export const EMAIL_DRAFT_VISUALS = {
  welcome: {
    label: 'Your career discovery route',
    nodes: ['PROFILE', 'DISCOVER', 'EXPLORE'],
    focus: { title: 'Turn your interests into a direction.', detail: 'Start with your profile, explore the career quiz, then compare your roadmap options.' },
    steps: [
      { title: 'Add your profile details', body: 'Describe your interests and education during onboarding so career discovery has some context.' },
      { title: 'Explore the career discovery quiz', body: 'Choose the student scenarios that interest you. These choices explore preferences, not technical right or wrong answers.' },
      { title: 'Compare your recommended paths', body: 'Read a roadmap overview and identify one topic you would like to explore.' },
    ],
    note: 'Career recommendations are starting points to explore. You can compare paths before choosing a direction.',
  },
  reengagement: {
    label: 'A small learning loop',
    nodes: ['CHOOSE', 'READ', 'EXPLAIN'],
    focus: { title: 'One topic. One clearer idea.', detail: 'Choose a concept on {{roadmapTitle}} and finish with an explanation in your own words.' },
    steps: [
      { title: 'Choose one topic to revisit', body: 'Open your roadmap and pick a concept you want to understand more clearly.' },
      { title: 'Read its study guide', body: 'Sign in to open the guide. Look for one definition or example that makes the concept easier to explain.' },
      { title: 'Write your own explanation', body: 'Close the guide and describe the concept in two sentences. Note one question to revisit next time.' },
    ],
    note: 'A useful stopping point: one explanation you understand and one question you want to explore next.',
  },
  exam_nudge: {
    label: 'Your preparation route',
    nodes: ['REVIEW', 'RECALL', 'CHECK'],
    focus: { title: 'Make your revision count.', detail: 'Review a topic, practise explaining it, then check the assessment requirements.' },
    steps: [
      { title: 'Review an uncertain topic', body: 'Use your roadmap and study guide to revisit a concept you still find difficult.' },
      { title: 'Explain it without the guide', body: 'Write a short explanation and an example, then check where your understanding needs work.' },
      { title: 'Check the assessment page', body: 'Review eligibility, remaining attempts and any cooldown before deciding to start.' },
    ],
    note: 'The assessment page confirms eligibility and remaining attempts. Opening it does not guarantee an available attempt.',
  },
  exam_failed: {
    label: 'A focused revision loop',
    nodes: ['REVISIT', 'PRACTISE', 'RECHECK'],
    focus: { title: 'Give one difficult concept another look.', detail: 'Use {{roadmapTitle}} to turn an uncertain idea into a worked example.' },
    steps: [
      { title: 'Pick a topic that felt difficult', body: 'Return to your roadmap and choose one concept you want to revise before another assessment.' },
      { title: 'Work through an example', body: 'Read its study guide, then write out an example in your own words without looking at the explanation.' },
      { title: 'Check what still feels unclear', body: 'Compare your explanation with the guide. Review remaining attempts and cooldown on the assessment page when you are ready.' },
    ],
    note: 'Retakes depend on remaining attempts and cooldown. Use the assessment page for your current availability.',
  },
  cert_congrats: {
    label: 'From learning to application',
    nodes: ['REFLECT', 'BUILD', 'EXPLAIN'],
    focus: { title: 'Put your learning to work.', detail: 'Your roadmap certificate marks an achievement. Use a concept from {{roadmapTitle}} in a small example.' },
    steps: [
      { title: 'Choose a concept to apply', body: 'Revisit your roadmap and pick an idea you can demonstrate with a small, self-contained example.' },
      { title: 'Build or write the example', body: 'Apply the concept to a problem you understand. Keep the scope small enough to explain clearly.' },
      { title: 'Describe what you learned', body: 'Write a short note covering the problem, your approach and something you would improve.' },
    ],
    note: 'A roadmap certificate recognises the assessment you passed. Keep building examples that show how you apply the ideas.',
  },
};
