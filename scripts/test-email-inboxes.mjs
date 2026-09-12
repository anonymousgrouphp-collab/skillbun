import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { emailSamples } from '../tests/fixtures/emailSamples.mjs';
import { getZohoSmtpHost, getZohoSmtpPort, getZohoSmtpUser, getZohoSmtpPass } from '../utils/server/env.js';

// Explicit recipients required. This script never reads real student/employee records.
const recipients = process.argv.slice(2);
if (!recipients.length || recipients.some(email => !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email))) throw new Error('Provide only the approved recipient email addresses as arguments.');
try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const user = getZohoSmtpUser(), pass = getZohoSmtpPass();
if (!user || !pass) throw new Error('Zoho SMTP is not configured. No messages sent.');
const port = getZohoSmtpPort();
const transport = nodemailer.createTransport({ host: getZohoSmtpHost() || 'smtppro.zoho.in', port, secure: port === 465, auth: { user, pass }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000 });
const samples = await emailSamples();
const ids = ['welcome_v1', 'reengagement_v1', 'exam_nudge_v1', 'transactional_alert_v1', 'workforce_offer', 'password_reset'];
const out = path.resolve('output/email-preview');
await fs.mkdir(out, { recursive: true });
const checkpoint = path.join(out, 'inbox-dispatch.json');
let results = [];
try { results = JSON.parse(await fs.readFile(checkpoint, 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
try {
  for (const recipient of recipients) {
    for (const [index, id] of ids.entries()) {
      if (results.some(result => result.recipient === recipient && result.template === id && result.status !== 'failed_before_submission')) {
        console.log(`${recipient}: ${id} — already attempted; skipped to avoid duplicates`);
        continue;
      }
      const attempt = { recipient, template: id, status: 'pending', attemptedAt: new Date().toISOString() };
      results.push(attempt);
      await fs.writeFile(checkpoint, JSON.stringify(results, null, 2));
      const mail = samples[id];
      const notice = '<p style="font-family:Arial,sans-serif;font-size:14px;color:#1A1A1A;background-color:#FFFFFF;padding:16px;">RENDERING TEST — SYNTHETIC SAMPLE ONLY. No account event, offer, credential or password reset has occurred. Any references to attachments or credentials below are sample content; no official PDF is attached.</p>';
      const info = await transport.sendMail({ from: 'SkillBun <noreply@skillbun.tech>', to: recipient, replyTo: 'harsh@skillbun.tech', subject: `[SkillBun rendering test ${index + 1}/${ids.length} — SAMPLE ONLY] ${id}`, html: mail.html.replace(/(<body\b[^>]*>)/i, `$1${notice}`), text: 'RENDERING TEST — SYNTHETIC SAMPLE ONLY. No account event, offer, credential or password reset has occurred. No official PDF is attached.\n\n' + mail.text });
      Object.assign(attempt, { status: 'submitted', accepted: info.accepted, rejected: info.rejected, messageId: info.messageId, sentAt: new Date().toISOString() });
      await fs.writeFile(checkpoint, JSON.stringify(results, null, 2));
      console.log(`${recipient}: ${id} — accepted ${info.accepted.length}, rejected ${info.rejected.length}`);
      // Keep sample dispatch below the platform's normal 10/minute sending pace.
      await new Promise(resolve => setTimeout(resolve, 6500));
    }
  }
} catch (error) {
  const attempt = results.at(-1);
  if (attempt?.status === 'pending') {
    Object.assign(attempt, { status: error.command === 'CONN' ? 'failed_before_submission' : 'uncertain', code: error.code, command: error.command });
    await fs.writeFile(checkpoint, JSON.stringify(results, null, 2));
  }
  throw error;
} finally { transport.close(); }
