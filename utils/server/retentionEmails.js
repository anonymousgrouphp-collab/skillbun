/**
 * SkillBun Retention Email Renderer
 *
 * Bridges the template catalogue to the email design system: escapes dynamic
 * data once, then hands the hero fields and composed body to buildEmail().
 */

import { RETENTION_TEMPLATES, renderTemplateContent } from './retentionTemplates.js';
import { buildEmail, buildBaseEmailWrapper, escapeHtml } from './emailTheme.js';

export { RETENTION_TEMPLATES, buildBaseEmailWrapper, escapeHtml };

/**
 * Exact inverse of escapeHtml, for the one field that is not HTML.
 *
 * Templates compose the subject from the same pre-escaped values they use in the
 * body, but a Subject header is plain text — an inbox shows the entity verbatim,
 * so "AI &amp; Machine Learning" is what the student would read. `&amp;` is
 * decoded last so an escaped entity in the source ("&amp;lt;") unwinds one level
 * only, not two.
 */
function decodeHtmlEntities(value) {
  return String(value ?? '')
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&amp;', '&');
}

export function generateRetentionEmailHtml(templateId, data = {}) {
  const name = escapeHtml(data.name || 'Student');
  const email = escapeHtml(data.email || '');
  const roadmapTitle = escapeHtml(data.roadmapTitle || 'Full Stack Web Development');
  const progressCount = data.progressCount || 12;
  const degree = escapeHtml(data.degree || 'B.Tech - Computer Science');

  const { subject, eyebrow, headline, lede, docTag, chips, contentHtml, isMarketing } = renderTemplateContent(
    templateId,
    { name, email, roadmapTitle, progressCount, degree }
  );

  const plainSubject = decodeHtmlEntities(subject);

  const html = buildEmail({
    title: plainSubject,
    eyebrow,
    headline,
    lede,
    docTag,
    chips,
    contentHtml,
    isMarketing,
    email,
  });

  return { subject: plainSubject, html };
}
