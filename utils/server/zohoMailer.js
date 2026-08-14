import nodemailer from 'nodemailer'

import {
  getPasswordResetFrom,
  getZohoSmtpHost,
  getZohoSmtpPass,
  getZohoSmtpPort,
  getZohoSmtpUser,
} from '@/utils/server/env'

let cachedTransporter = null

export function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter
  }

  const host = getZohoSmtpHost()
  const port = getZohoSmtpPort()
  const user = getZohoSmtpUser()
  const pass = getZohoSmtpPass()

  if (!user || !pass) {
    throw new Error('Zoho SMTP credentials missing: Please ensure ZOHO_SMTP_USER and ZOHO_SMTP_PASS are configured in environment settings.')
  }

  const smtpPort = Number(port || 465)
  const isSecure = smtpPort === 465

  cachedTransporter = nodemailer.createTransport({
    host: host || 'smtppro.zoho.in',
    port: smtpPort,
    secure: isSecure,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 6000,
  })

  return cachedTransporter
}

export function escapeHtml(value) {
  return String(value ?? '')
}

export async function sendSkillBunPasswordResetEmail({ email, resetLink }) {
  const safeLink = escapeHtml(resetLink)

  await getTransporter().sendMail({
    from: getPasswordResetFrom() || 'SkillBun Support <support@skillbun.tech>',
    to: email,
    subject: 'Reset your SkillBun password',
    text: [
      'Hi,',
      '',
      'Use this link to reset your SkillBun password:',
      resetLink,
      '',
      'If you did not request this, you can ignore this email.',
      '',
    ].join('\n'),
    html: `
      <p>Hi,</p>
      <p>Use this link to reset your SkillBun password:</p>
      <p><a href="${safeLink}">${safeLink}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  })
}

/**
 * Sends an email with optional binary attachments, CC, and custom Reply-To via Zoho SMTP.
 * @param {Object} params
 * @param {string} params.to - Primary recipient email
 * @param {string} [params.cc] - Optional CC email address
 * @param {string} [params.replyTo] - Optional Reply-To email address
 * @param {string} params.subject - Email subject line
 * @param {string} [params.html] - HTML formatted body
 * @param {string} [params.text] - Plain text fallback body
 * @param {Array<{ filename: string, content: Buffer|string, contentType?: string }>} [params.attachments] - Array of attachment descriptors
 * @param {string} [params.from] - Optional custom sender header
 * @returns {Promise<import('nodemailer').SentMessageInfo>}
 */
export async function sendMailWithAttachment({
  to,
  cc,
  replyTo,
  subject,
  html,
  text,
  attachments = [],
  from,
}) {
  if (!to) {
    throw new TypeError('sendMailWithAttachment requires a valid "to" recipient email address.')
  }

  const defaultFrom = getPasswordResetFrom() || 'SkillBun Careers <noreply@skillbun.tech>'
  const mailOptions = {
    from: from || defaultFrom,
    to,
    subject,
    text: text || '',
    html: html || '',
    attachments,
  }

  if (cc) mailOptions.cc = cc
  if (replyTo) mailOptions.replyTo = replyTo

  const transporter = getTransporter()
  const info = await transporter.sendMail(mailOptions)
  return info
}
