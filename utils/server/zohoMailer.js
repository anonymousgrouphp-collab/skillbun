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

  // Fallback defaults for Zoho SMTP if environment variables are partially defined
  const host = getZohoSmtpHost() || process.env.ZOHO_SMTP_HOST || 'smtppro.zoho.in'
  const port = getZohoSmtpPort() || 465
  const user = getZohoSmtpUser() || process.env.ZOHO_SMTP_USER || 'noreply@skillbun.tech'
  const pass = getZohoSmtpPass() || process.env.ZOHO_SMTP_PASS

  if (!user || !pass) {
    throw new Error('Zoho SMTP credentials (ZOHO_SMTP_USER, ZOHO_SMTP_PASS) are missing.')
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: Number(port) === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })

  return cachedTransporter
}

export function escapeHtml(value) {
  return String(value)
}

export async function sendSkillBunPasswordResetEmail({ email, resetLink }) {
  const safeLink = escapeHtml(resetLink)

  await getTransporter().sendMail({
    from: getPasswordResetFrom() || 'SkillBun Support <noreply@skillbun.tech>',
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
