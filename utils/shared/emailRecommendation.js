export const EMAIL_CATEGORIES = {
  welcome: 'Welcome and getting started',
  reengagement: 'Continue learning',
  exam_nudge: 'Certification preparation',
  exam_failed: 'Review after an unsuccessful exam',
  cert_congrats: 'Certificate congratulations',
};
export const EMAIL_GAP_MS = 72 * 60 * 60 * 1000;
const DAY = 86400000;
export function emailTime(value) {
  const date = value?.toDate?.() ?? (value?.seconds ? value.seconds * 1000 : value);
  const n = date ? new Date(date).getTime() : 0;
  return Number.isFinite(n) ? n : 0;
}
export function emailCategory(id = '') {
  return Object.keys(EMAIL_CATEGORIES).find(category => id.startsWith(category + '_v')) || '';
}
export function recommendEmail(user, now = Date.now()) {
  const history = (user.sentEmailHistory || []).filter(Boolean).map(log => typeof log === 'string' ? { templateId: log } : log).filter(log => !log.isTest);
  const sentIds = new Set(history.map(log => log.templateId));
  const hold = reason => ({ id: '', category: '', label: 'No email due', reason, eligible: false, alreadySentCount: history.length });
  if (user.isUnsubscribed) return hold('This student has unsubscribed from marketing emails.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email || '')) return hold('A valid recipient email is missing.');
  const lastMarketing = Math.max(0, ...history.filter(log => log.category || emailCategory(log.templateId) || log.templateId?.startsWith('ai_')).map(log => emailTime(log.sentAt)));
  if (lastMarketing && now - lastMarketing < EMAIL_GAP_MS) return hold('A marketing email was sent within the last 72 hours.');
  const progress = [...(user.progress || [])].sort((a, b) => emailTime(b.updatedAt) - emailTime(a.updatedAt));
  const certificates = [...(user.certificates || [])].filter(c => c.roadmapSlug).sort((a, b) => emailTime(b.createdAt) - emailTime(a.createdAt));
  const outcomes = [...(user.examOutcomes || [])].filter(a => a.status === 'COMPLETED').sort((a, b) => emailTime(b.submittedAt) - emailTime(a.submittedAt));
  const recent = (date, days) => emailTime(date) > 0 && now - emailTime(date) >= 0 && now - emailTime(date) <= days * DAY;
  let category = '', reason = '', eventKey = '', target = progress[0];
  const cert = certificates.find(c => recent(c.createdAt, 14) && !history.some(log => log.eventKey === `cert:${c.id || c.certId}` || ((log.category || emailCategory(log.templateId)) === 'cert_congrats' && (!log.roadmapSlug || log.roadmapSlug === c.roadmapSlug))));
  const latestExam = outcomes[0];
  if (cert) {
    category = 'cert_congrats'; reason = 'A recently issued roadmap certificate has not been acknowledged.';
    eventKey = `cert:${cert.id || cert.certId}`; target = { ...progress.find(p => p.slug === cert.roadmapSlug), slug: cert.roadmapSlug, roadmapTitle: cert.roadmapTitle };
  } else if (latestExam?.passed === false && recent(latestExam.submittedAt, 7) && !certificates.some(c => c.roadmapSlug === latestExam.roadmapSlug) && !history.some(log => log.eventKey === `exam:${latestExam.id}`)) {
    category = 'exam_failed'; reason = 'The latest submitted exam has a confirmed unsuccessful result.';
    eventKey = `exam:${latestExam.id}`; target = progress.find(p => p.slug === latestExam.roadmapSlug) || { slug: latestExam.roadmapSlug };
  } else {
    const ready = progress.find(p => p.totalTopics > 0 && p.progressCount / p.totalTopics >= 0.6 && !certificates.some(c => c.roadmapSlug === p.slug) && !outcomes.some(a => a.roadmapSlug === p.slug && a.passed === true));
    const activity = Math.max(emailTime(user.lastSignInTime), ...progress.map(p => emailTime(p.updatedAt)), ...outcomes.map(a => emailTime(a.submittedAt)), emailTime(user.createdAt));
    if (ready) { category = 'exam_nudge'; reason = 'Verified roadmap progress meets the 60% requirement; the exam page checks remaining attempts.'; target = ready; }
    else if (!progress.some(p => (p.progressCount ?? p.completedNodeIds?.length ?? 0) > 0) && recent(user.createdAt, 7)) { category = 'welcome'; reason = 'New account with no completed roadmap topics.'; }
    else if (activity && now - activity >= 3 * DAY) { category = 'reengagement'; reason = 'No recorded learning or sign-in activity for at least three days.'; }
  }
  if (!category) return hold('No relevant lifecycle event or inactivity trigger is due.');
  const id = [1, 2, 3].map(v => `${category}_v${v}`).find(id => !sentIds.has(id)) || '';
  return { id, category, label: EMAIL_CATEGORIES[category], reason, eventKey, eligible: true, needsGeneration: !id, isRotated: sentIds.size > 0, alreadySentCount: history.length, roadmapSlug: target?.slug || '', roadmapTitle: target?.roadmapTitle || '', progressCount: target?.progressCount ?? null, totalTopics: target?.totalTopics ?? null };
}
