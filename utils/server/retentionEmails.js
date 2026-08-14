/**
 * SkillBun Ultra-Premium User Retention & Lifecycle Email System
 * Domain: https://skillbun.tech
 * 
 * Features:
 * - Base HTML email wrapper with automatic system dark/light theme support (prefers-color-scheme)
 * - Dynamic Candidate Auto-Fill ({name}, {email}, {roadmapTitle}, {progressCount}, {degree})
 * - Compliance: Discreet unsubscribe link to https://skillbun.tech/settings?action=unsubscribe on marketing emails.
 */

import { RETENTION_TEMPLATES, renderTemplateContent } from './retentionTemplates.js';

const SITE_URL = 'https://skillbun.tech';

export { RETENTION_TEMPLATES };

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildBaseEmailWrapper(contentHtml, titleText, isMarketing = true, email = '') {
  const unsubscribeUrl = `${SITE_URL}/settings?action=unsubscribe&email=${encodeURIComponent(email)}`;

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(titleText)}</title>
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #05070a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    @media (prefers-color-scheme: light) {
      .email-bg { background-color: #f8fafc !important; }
      .email-card { background-color: #ffffff !important; border-color: #e2e8f0 !important; }
      .text-primary { color: #0f172a !important; }
      .text-subtle { color: #475569 !important; }
      .text-title { color: #0f172a !important; }
      .box-dark { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #1e293b !important; }
      .brand-wordmark { color: #008751 !important; }
      .brand-subtitle { color: #64748b !important; }
    }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #05070a !important; }
      .email-card { background-color: #111722 !important; border-color: #1f293d !important; }
      .text-primary { color: #f0f6fc !important; }
      .text-subtle { color: #8b949e !important; }
      .text-title { color: #ffffff !important; }
      .box-dark { background-color: #0d1117 !important; border-color: #30363d !important; color: #c9d1d9 !important; }
      .brand-wordmark { color: #00e599 !important; }
      .brand-subtitle { color: #94a3b8 !important; }
    }
  </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; background-color: #05070a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-bg" style="background-color: #05070a; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width: 600px; background-color: #111722; border: 1px solid #1f293d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- SkillBun Brand Header (Unique Wordmark Lockup per AGENTS.md) -->
          <tr>
            <td style="padding: 28px 24px 20px 24px; text-align: center; border-bottom: 2px solid #00e599; background: linear-gradient(180deg, rgba(0,229,153,0.06) 0%, rgba(0,0,0,0) 100%);">
              <a href="${SITE_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                <div style="font-family: 'Fredoka', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 32px; font-weight: 900; color: #00e599; letter-spacing: 2px; line-height: 1.2;" class="brand-wordmark">
                  ꌗꀘꀤ꒒꒒ꌃꀎꈤ
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;" class="brand-subtitle">
                  SKILLBUN.TECH &bull; HOP INTO THE RIGHT TECH CAREER &bull; 100% FREE
                </div>
              </a>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td class="text-primary" style="padding: 32px 32px 28px 32px; color: #f0f6fc; font-size: 15px; line-height: 1.65;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Discreet Ultra-Compact Footer -->
          <tr>
            <td style="background-color: #0d1117; padding: 12px 24px; border-top: 1px solid #21262d; text-align: center; font-size: 10px; color: #6e7681; line-height: 1.4;">
              <span style="color: #6e7681;">SkillBun.tech</span>
              ${isMarketing ? ` • <a href="${unsubscribeUrl}" target="_blank" style="color: #6e7681; text-decoration: underline;">Unsubscribe / Preferences</a>` : ''}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateRetentionEmailHtml(templateId, data = {}) {
  const name = escapeHtml(data.name || 'Student');
  const email = escapeHtml(data.email || '');
  const roadmapTitle = escapeHtml(data.roadmapTitle || 'Full Stack Web Development');
  const progressCount = data.progressCount || 12;
  const degree = escapeHtml(data.degree || 'B.Tech - Computer Science');

  const { subject, contentHtml, isMarketing } = renderTemplateContent(templateId, {
    name,
    email,
    roadmapTitle,
    progressCount,
    degree,
  });

  const html = buildBaseEmailWrapper(contentHtml, subject, isMarketing, email);

  return { subject, html };
}
