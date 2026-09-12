import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderSavedEmail, validateEmailDraft } from '../../utils/shared/emailDraft.js';
import { emailHtmlToText, prepareEmailPreview } from '../../utils/shared/emailContent.js';
import { WORDMARK } from '../../utils/server/emailTheme.js';

const legacyContent = {
  name: 'A small step',
  subject: 'Continue, {{name}}',
  headline: 'Your next learning step',
  intro: 'Return to {{roadmapTitle}} at your own pace.',
  paragraphs: ['Choose a topic you want to understand more clearly.'],
  ctaLabel: 'Open roadmap',
};

const qualityContent = {
  ...legacyContent,
  subject: 'Explain a concept, {{name}}',
  headline: 'Explain one roadmap concept',
  intro: 'Hi {{name}}, choose an idea from {{roadmapTitle}} to explore.',
  focus: {
    title: 'One concept. One clearer idea.',
    detail: 'Use {{roadmapTitle}} to connect a definition with an example you understand.',
  },
  steps: [
    { title: 'Pick one topic', body: 'Open {{roadmapTitle}} and choose a concept you would like to explain more clearly.' },
    { title: 'Read the guide', body: 'Sign in to read the study guide and note an example that helps the concept make sense.' },
    { title: 'Write an explanation', body: 'Close the guide and write an explanation in your own words, {{name}}.' },
  ],
};

const categories = {
  welcome: ['PROFILE', 'DISCOVER', 'EXPLORE'],
  reengagement: ['CHOOSE', 'READ', 'EXPLAIN'],
  exam_nudge: ['REVIEW', 'RECALL', 'CHECK'],
  exam_failed: ['REVISIT', 'PRACTISE', 'RECHECK'],
  cert_congrats: ['REFLECT', 'BUILD', 'EXPLAIN'],
};

function buttonHref(html) {
  const button = html.match(/<a\b[^>]*\bclass="sb-btn-a"[^>]*>/)?.[0];
  assert.ok(button, 'The email needs a primary action');
  return button.match(/\bhref="([^"]+)"/)[1];
}

test('every saved V1 category gains a real image-independent graphic and three practical steps', () => {
  for (const [category, nodes] of Object.entries(categories)) {
    const email = renderSavedEmail({ category, content: legacyContent });
    assert.match(email.html, /<table\b[^>]*class="sb-learning-graphic"/, category);
    assert.deepEqual([...email.html.matchAll(/<td\b[^>]*class="sb-step-num"[^>]*>(\d+)<\/td>/g)].map(match => match[1]), ['1', '2', '3'], category);
    for (const node of nodes) assert.ok(email.text.includes(node), `${category}: ${node}`);
    assert.match(email.text, /Put it into practice/, category);
    assert.ok(email.html.includes(WORDMARK), category);
    assert.equal([...email.html.matchAll(/<img\b/g)].length, 1, `${category}: only the existing brand image needs loading`);
    assert.doesNotMatch(email.html, /<script\b|<svg\b|<canvas\b|<iframe\b/i, category);
    assert.ok(Buffer.byteLength(email.html) < 90000, `${category}: avoid email clipping`);
  }
});

test('V2 visual copy and personalisation are escaped once in HTML and readable in plain text', () => {
  assert.deepEqual(validateEmailDraft(qualityContent, { requireQuality: true }), qualityContent);
  const data = {
    name: '<img src=x onerror=alert(1)> & "Ada"',
    roadmapTitle: 'Systems & APIs <script>alert(1)</script>',
    roadmapSlug: 'fullstack',
    email: 'sample@example.com',
  };
  const email = renderSavedEmail({ category: 'reengagement', schemaVersion: 2, content: qualityContent }, data);
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;Ada&quot;/);
  assert.match(email.html, /Systems &amp; APIs &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(email.html, /<img src=x|<script>|&amp;amp;/);
  for (const value of [qualityContent.headline, qualityContent.focus.title, data.name, data.roadmapTitle, ...qualityContent.steps.map(step => step.title)]) {
    assert.ok(email.text.includes(value), value);
  }
  assert.doesNotMatch(email.text, /<table|font-family:|&amp;|&lt;/);
  assert.equal(email.subject, `Explain a concept, ${data.name}`);
  assert.ok(Buffer.byteLength(email.html) < 90000);
});

test('visual fields reject unsafe markup, URLs, addresses and unsupported placeholders', () => {
  for (const value of ['<img src=x onerror=alert(1)>', 'Visit https://attacker.example', 'Visit www.attacker.example', 'Write to other@example.com', 'Ask {{password}} for help', 'Ask {name} for help', 'Hello\nBcc: other@example.com']) {
    for (const field of ['focusTitle', 'focusDetail', 'stepTitle', 'stepBody']) {
      const content = structuredClone(qualityContent);
      if (field === 'focusTitle') content.focus.title = value;
      if (field === 'focusDetail') content.focus.detail = value;
      if (field === 'stepTitle') content.steps[0].title = value;
      if (field === 'stepBody') content.steps[0].body = value;
      assert.throws(() => validateEmailDraft(content), undefined, `${field}: ${value}`);
    }
  }
});

test('new AI drafts require complete, distinct action steps while V1 drafts remain compatible', () => {
  assert.deepEqual(validateEmailDraft(legacyContent), legacyContent);
  assert.throws(() => validateEmailDraft(legacyContent, { requireQuality: true }));
  assert.throws(() => renderSavedEmail({ category: 'welcome', schemaVersion: 2, content: legacyContent }));
  for (const steps of [null, {}, [], qualityContent.steps.slice(0, 2), [...qualityContent.steps, qualityContent.steps[0]], [null, ...qualityContent.steps.slice(1)], ['Read the guide', ...qualityContent.steps.slice(1)], [{ title: 'Pick a topic' }, ...qualityContent.steps.slice(1)]]) {
    assert.throws(() => validateEmailDraft({ ...qualityContent, steps }), undefined, JSON.stringify(steps));
  }
  for (const content of [
    { ...qualityContent, focus: [] },
    { ...qualityContent, focus: { title: qualityContent.focus.title } },
    { ...qualityContent, steps: [qualityContent.steps[0], qualityContent.steps[0], qualityContent.steps[2]] },
    { ...qualityContent, headline: 'Continue your learning journey' },
    { ...qualityContent, ctaLabel: 'Learn more' },
    { ...qualityContent, focus: { ...qualityContent.focus, detail: 'Complete it in 5 minutes and improve your score by 80%.' } },
  ]) assert.throws(() => validateEmailDraft(content, { requireQuality: true }));
});

test('upgrading legacy rendering preserves all saved paragraphs and does not mutate the draft', () => {
  const draft = { category: 'reengagement', schemaVersion: 1, content: {
    ...legacyContent,
    paragraphs: [
      'Choose a topic you want to understand more clearly.',
      'Compare the definitions in your guide & write down a question.',
      'Review your example before deciding what to explore next.',
      'Return to {{roadmapTitle}} when you want to revisit your notes.',
    ],
  } };
  const saved = structuredClone(draft);
  const email = renderSavedEmail(draft, { roadmapTitle: 'AI & ML' });
  assert.deepEqual(draft, saved);
  for (const paragraph of draft.content.paragraphs) assert.ok(email.text.includes(paragraph.replace('{{roadmapTitle}}', 'AI & ML')));
  assert.match(email.text, /Your next learning step/);
  assert.match(email.html, /guide &amp; write/);
  assert.doesNotMatch(email.html, /&amp;amp;/);
});

test('primary actions retain category destinations and safely fall back when roadmap context is invalid', () => {
  for (const category of Object.keys(categories)) {
    const draft = { category, schemaVersion: 2, content: qualityContent };
    const valid = renderSavedEmail(draft, { roadmapSlug: 'fullstack' });
    const expected = category === 'welcome' ? '/onboarding?next=/quiz' : category === 'exam_nudge' ? '/roadmap/fullstack/certify' : '/roadmap/fullstack';
    assert.equal(buttonHref(valid.html), `https://skillbun.tech${expected}`, category);
    for (const roadmapSlug of [undefined, '', '../.env', 'https://attacker.example', 'fullstack?next=//attacker.example', 'x" onclick="alert(1)']) {
      const email = renderSavedEmail(draft, { roadmapSlug });
      assert.equal(buttonHref(email.html), `https://skillbun.tech${category === 'welcome' ? '/onboarding?next=/quiz' : '/roadmap'}`, `${category}: ${roadmapSlug}`);
      if (category !== 'welcome') assert.match(email.text, /Find your roadmap/);
      assert.doesNotMatch(email.html, /attacker\.example|onclick=/);
    }
  }
  assert.throws(() => renderSavedEmail({ category: 'unknown', content: legacyContent }));
});

test('learning graphics never turn missing, invalid or real progress into invented metrics', () => {
  const contexts = [{}, { progressCount: 0 }, { progressCount: -1, totalTopics: 40 }, { progressCount: NaN, totalTopics: 40 }, { progressCount: '<img src=x>', totalTopics: 40 }, { progressCount: 0, totalTopics: 40 }, { progressCount: 25, totalTopics: 40 }, { progressCount: 40, totalTopics: 40 }];
  for (const category of Object.keys(categories)) {
    const draft = { category, content: legacyContent };
    const baseline = renderSavedEmail(draft);
    for (const context of contexts) assert.deepEqual(renderSavedEmail(draft, context), baseline, `${category}: ${JSON.stringify(context)}`);
    assert.doesNotMatch(baseline.text.replace('100% free, always', ''), /\d\s*%|\d+\s*\/\s*\d+|\d+ topics|NaN|null|undefined/);
  }
});

test('the graphic and steps survive light, dark, stripped-style and blocked-image previews', () => {
  const email = renderSavedEmail({ category: 'reengagement', schemaVersion: 2, content: qualityContent });
  const original = email.html;
  for (const options of [{ theme: 'light' }, { theme: 'dark' }, { stripStyles: true }, { blockImages: true }, { theme: 'dark', blockImages: true }, { stripStyles: true, blockImages: true }]) {
    const preview = prepareEmailPreview(original, options);
    assert.match(preview, /<table\b[^>]*class="sb-learning-graphic"/);
    assert.equal(emailHtmlToText(preview), email.text);
    assert.equal([...preview.matchAll(/<td\b[^>]*class="sb-step-num"/g)].length, 3);
    if (options.blockImages) assert.doesNotMatch(preview, /<img\b[^>]*\bsrc=/);
    if (options.stripStyles) assert.doesNotMatch(preview, /@media|fonts\.googleapis\.com/);
    if (options.theme === 'dark') assert.match(preview, /@media all/);
    if (options.theme === 'light') assert.match(preview, /@media not all/);
  }
  assert.equal(email.html, original);
  assert.match(original, /prefers-color-scheme: dark/);
  assert.match(original, /\[data-ogsc\]/);
  assert.match(original, /\[data-ogsb\]/);
  assert.match(original, /<meta name="color-scheme" content="light dark">/);
});
