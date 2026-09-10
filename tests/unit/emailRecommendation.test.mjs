import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { recommendEmail, EMAIL_GAP_MS } from '../../utils/shared/emailRecommendation.js';
import { validateEmailDraft, renderSavedEmail } from '../../utils/shared/emailDraft.js';
import { draftFingerprint, generateDraftContent, findUnsentDraft, parseDraftId } from '../../utils/server/emailDraftLibrary.js';

const now = Date.parse('2026-09-11T12:00:00Z');
const day = 86400000;
const student = overrides => ({ email: 'sample@example.com', createdAt: now - 30 * day, lastSignInTime: now - 4 * day, progress: [], ...overrides });
test('exhausted variations stay in their category and require a saved or new variation', () => {
  const result = recommendEmail(student({ sentEmailHistory: ['reengagement_v1', 'reengagement_v2', 'reengagement_v3'] }), now);
  assert.equal(result.category, 'reengagement'); assert.equal(result.id, ''); assert.equal(result.needsGeneration, true);
});
test('exam eligibility uses verified percentage and actual failures, never attempt counts', () => {
  const user = student({ lastSignInTime: now, quizAttempts: [{ attemptsCount: 4 }], progress: [{ slug: 'fullstack', progressCount: 15, totalTopics: 100 }] });
  assert.equal(recommendEmail(user, now).eligible, false);
  user.progress[0].progressCount = 60;
  assert.equal(recommendEmail(user, now).category, 'exam_nudge');
  user.examOutcomes = [{ id: 'result1', roadmapSlug: 'fullstack', status: 'COMPLETED', passed: false, submittedAt: now - day }];
  assert.equal(recommendEmail(user, now).category, 'exam_failed');
  user.examOutcomes[0].passed = true;
  assert.equal(recommendEmail(user, now).eligible, false);
});
test('unsubscribe and recent marketing suppress recommendations, test mail does not', () => {
  assert.equal(recommendEmail(student({ isUnsubscribed: true }), now).eligible, false);
  assert.equal(recommendEmail(student({ sentEmailHistory: [{ templateId: 'welcome_v1', sentAt: now - EMAIL_GAP_MS + 1 }] }), now).eligible, false);
  assert.equal(recommendEmail(student({ sentEmailHistory: [{ templateId: 'welcome_v1', sentAt: now, isTest: true }] }), now).category, 'reengagement');
});
test('certificate recognition uses recent real events and the matching roadmap', () => {
  const cert = { id: 'cert1', roadmapSlug: 'python', createdAt: now - day };
  const user = student({ certificates: [cert], progress: [{ slug: 'fullstack', progressCount: 3, totalTopics: 100 }] });
  assert.equal(recommendEmail(user, now).roadmapSlug, 'python');
  user.sentEmailHistory = [{ templateId: 'cert_congrats_v1', eventKey: 'cert:cert1', sentAt: now - 4 * day }];
  assert.notEqual(recommendEmail(user, now).category, 'cert_congrats');
  cert.createdAt = now - 40 * day; user.sentEmailHistory = [];
  assert.notEqual(recommendEmail(user, now).category, 'cert_congrats');
});
test('recent progress prevents a false inactivity recommendation', () => {
  assert.equal(recommendEmail(student({ progress: [{ slug: 'python', progressCount: 2, totalTopics: 100, updatedAt: now }] }), now).eligible, false);
  assert.equal(recommendEmail(student({ createdAt: now - day, lastSignInTime: now }), now).category, 'welcome');
});
const content = { name: 'A small step', subject: 'Continue, {{name}}', headline: 'Your next learning step', intro: 'Return to {{roadmapTitle}} at your own pace.', paragraphs: ['Choose a topic you want to understand more clearly.'], ctaLabel: 'Open roadmap' };
test('saved drafts render through the shared theme and cannot supply markup or external destinations', () => {
  assert.deepEqual(validateEmailDraft(content), content);
  for (const subject of ['<img src=x>', 'Visit https://attacker.example', '{{password}}', 'Guaranteed job', 'Hello\nBcc: other@example.com']) assert.throws(() => validateEmailDraft({ ...content, subject }));
  const rendered = renderSavedEmail({ category: 'reengagement', content }, { name: '<script>bad</script>', roadmapTitle: 'AI & ML', roadmapSlug: 'fullstack', email: 'sample@example.com' });
  assert.ok(!rendered.html.includes('<script>'));
  assert.match(rendered.html, /prefers-color-scheme/); assert.match(rendered.text, /roadmap\/fullstack/);
  assert.equal(draftFingerprint('welcome', content), draftFingerprint('welcome', { ...content }));
  assert.notEqual(draftFingerprint('welcome', content), draftFingerprint('reengagement', content));
  assert.equal(parseDraftId('ai_exam_failed_' + 'a'.repeat(32)).category, 'exam_failed');
  assert.equal(parseDraftId('../../bad'), null);
});
test('AI generation uses configured provider with validation and no student identifiers', async () => {
  const previous = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = 'synthetic-not-a-real-key';
  try {
    let payload;
    const result = await generateDraftContent('welcome', [], async (url, options) => {
      payload = JSON.parse(options.body);
      assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
      return Response.json({ choices: [{ message: { content: JSON.stringify(content) } }] });
    });
    assert.equal(result.provider, 'groq'); assert.deepEqual(result.content, content);
    assert.equal(payload.response_format.type, 'json_object');
    assert.ok(!JSON.stringify(payload).includes('sample@example.com'));
  } finally { if (previous === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = previous; }
});
test('library reuses an unsent record rather than generating a duplicate', async () => {
  const docs = [{ id: 'one', data: () => ({ id: 'ai_sent' }) }, { id: 'two', data: () => ({ id: 'ai_new', content }) }];
  const query = { orderBy() { return this; }, limit() { return this; }, get: async () => ({ docs, size: 2 }) };
  const db = { collection: () => ({ doc: () => ({ collection: () => query }) }) };
  assert.equal((await findUnsentDraft(db, 'welcome', ['ai_sent'])).id, 'ai_new');
});
test('draft endpoint checks auth before AI/storage and blocks ineligible students', async () => {
  let source = await fs.readFile(new URL('../../app/api/admin/emails/drafts/route.js', import.meta.url), 'utf8');
  source = source.replace(/import[\s\S]*?from\s*['"][^'"]+['"];\s*/g, '').replace(/export const (runtime|maxDuration) = [^;]+;/g, '').replaceAll('export async function', 'async function');
  let allowed = false, generations = 0;
  const handlers = new Function('NextResponse', 'requireWorkforceAdmin', 'getFirebaseAdminFirestore', 'getFirebaseAdminAuth', 'loadEmailStudent', 'recommendEmail', 'createSavedDraft', source + '; return {GET,POST};')({ json: Response.json }, async () => allowed ? { uid: 'admin' } : { response: Response.json({}, { status: 401 }) }, () => ({}), () => ({}), async () => student({ isUnsubscribed: true }), recommendEmail, async () => { generations++; });
  const request = () => new Request('http://localhost/api/admin/emails/drafts', { method: 'POST', body: JSON.stringify({ uid: 'student' }) });
  assert.equal((await handlers.POST(request())).status, 401);
  allowed = true;
  assert.equal((await handlers.POST(request())).status, 409); assert.equal(generations, 0);
});
