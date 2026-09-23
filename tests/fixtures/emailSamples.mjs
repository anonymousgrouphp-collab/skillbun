import fs from 'node:fs/promises';
import * as theme from '../../utils/server/emailTheme.js';
import { RETENTION_TEMPLATES, generateRetentionEmailHtml } from '../../utils/server/retentionEmails.js';
import * as workforce from '../../utils/server/workforceEmailTemplates.js';

/** Synthetic only. Never loads environment variables or sends mail. */
export async function emailSamples(overrides = {}) {
  const data = { name: 'Sample Student', email: 'sample@example.com', roadmapTitle: 'AI & Machine Learning', roadmapSlug: 'fullstack', progressCount: 0, totalTopics: 40, degree: 'Computer Science & Engineering', ...overrides };
  const samples = Object.fromEntries(Object.keys(RETENTION_TEMPLATES).map(id => [id, generateRetentionEmailHtml(id, data)]));
  const employee = { full_name: data.name, personal_email: data.email, designation: 'Software Engineering Intern', department: 'Technology & Engineering', joining_date: '2026-09-10', contract_end_date: '2026-12-10', course_degree: data.degree, college_name: 'Sample Institute' };
  const credentials = { work_email: 'sample@example.com', password: 'SAMPLE-ONLY-NOT-A-CREDENTIAL', access_notes: 'Synthetic rendering sample only' };
  samples.workforce_offer = workforce.buildOfferDispatchEmail({ employee, referenceId: 'SKB/2026/HR-OFF/8K29DF', credentials });
  samples.workforce_extension = workforce.buildExtensionDispatchEmail({ employee, referenceId: 'SKB/2026/HR-EXT/8K29DF', newContractEndDate: '2027-03-10' });
  samples.workforce_termination = workforce.buildTerminationDispatchEmail({ employee, reasonCode: 'COMPLETED', effectiveDate: '2026-12-10', grantedCredentials: ['Sample internship credential — not issued'] });
  samples.workforce_activation = workforce.buildActivationWelcomeEmail({ employee, credentials });
  // Isolate account-security renderers from Next's alias imports and capture
  // their SMTP payloads. The transport is synthetic and never sends mail.
  const source = (await fs.readFile(new URL('../../utils/server/zohoMailer.js', import.meta.url), 'utf8')).replaceAll('\r\n', '\n');
  const start = source.indexOf('export async function sendSkillBunPasswordResetEmail');
  const end = source.indexOf('/**\n * Sends an email', start);
  if (start < 0 || end < 0) throw new Error('Account-security renderers could not be isolated');
  const render = source.slice(start, end).replace(/^export /gm, '');
  const captured = [];
  const renderers = new Function(...Object.keys(theme), 'getTransporter', 'getPasswordResetFrom', `${render}; return {sendSkillBunPasswordResetEmail,sendSkillBunSignupCodeEmail};`)(
    ...Object.values(theme), () => ({ sendMail: async payload => { captured.push(payload); } }), () => ''
  );
  await renderers.sendSkillBunPasswordResetEmail({
    email: 'sample@example.com',
    resetLink: `https://example.com/reset-password?oobCode=${'SAMPLE'.repeat(40)}&mode=resetPassword`,
  });
  samples.password_reset = captured.pop();
  await renderers.sendSkillBunSignupCodeEmail({ email: 'sample@example.com', code: '004271', expiresInMinutes: 10 });
  samples.signup_verification = captured.pop();
  return samples;
}
