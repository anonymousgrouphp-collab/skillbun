import { buildEmail, emailText, emailButton, escapeHtml } from '../server/emailTheme.js';
import { emailHtmlToText } from './emailContent.js';
import { EMAIL_CATEGORIES } from './emailRecommendation.js';
import { normalizeEmailRoadmapSlug } from './emailRoadmap.js';

export function validateEmailDraft(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid email draft.');
  const limits = { name: 80, subject: 140, headline: 160, intro: 450, ctaLabel: 60 };
  const output = {};
  const clean = (value, max) => {
    if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>\r\n]|https?:|www\.|[\w.+-]+@[\w.-]+|\{(?!\{(?:name|roadmapTitle)\}\})/.test(value.replace(/\{\{(?:name|roadmapTitle)\}\}/g, ''))) throw new Error('Draft must contain plain text and supported placeholders only.');
    return value.trim();
  };
  for (const [key, max] of Object.entries(limits)) output[key] = clean(input[key], max);
  if (!Array.isArray(input.paragraphs) || input.paragraphs.length < 1 || input.paragraphs.length > 4) throw new Error('Draft needs one to four paragraphs.');
  output.paragraphs = input.paragraphs.map(p => clean(p, 650));
  const text = JSON.stringify(output);
  if (/guarantee|unlimited.{0,20}retake|recruiter.{0,25}(queue|priority)|top\s*\d+\s*%|password|voucher|₹|\$\d/i.test(text)) throw new Error('Draft contains unsupported promotional or account claims.');
  return output;
}
export function renderSavedEmail(draft, data = {}) {
  const content = validateEmailDraft(draft.content);
  const fill = text => text.replace(/\{\{(name|roadmapTitle)\}\}/g, (_, key) => String(data[key] || (key === 'name' ? 'Student' : 'your chosen track')));
  const htmlText = text => escapeHtml(fill(text));
  const slug = normalizeEmailRoadmapSlug(data.roadmapSlug);
  const path = draft.category === 'welcome' ? '/onboarding?next=/quiz' : slug ? `/roadmap/${slug}${draft.category === 'exam_nudge' ? '/certify' : ''}` : '/roadmap';
  const subject = fill(content.subject).replace(/[\r\n]/g, ' ').slice(0, 200);
  const html = buildEmail({ title: subject, headline: htmlText(content.headline), lede: htmlText(content.intro), eyebrow: EMAIL_CATEGORIES[draft.category], docTag: 'LEARNING UPDATE', contentHtml: content.paragraphs.map(p => emailText(htmlText(p))).join('') + emailButton({ href: `https://skillbun.tech${path}`, label: htmlText(content.ctaLabel) }), isMarketing: true, email: data.email || '' });
  return { subject, html, text: emailHtmlToText(html), isMarketing: true };
}
