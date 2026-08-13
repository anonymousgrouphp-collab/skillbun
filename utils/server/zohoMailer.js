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

  if (!host || !port || !user || !pass) {
    throw new Error('Zoho SMTP credentials are not configured.')
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return cachedTransporter
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export async function sendSkillBunPasswordResetEmail({ email, resetLink }) {
  const safeLink = escapeHtml(resetLink)

  await getTransporter().sendMail({
    from: getPasswordResetFrom(),
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
