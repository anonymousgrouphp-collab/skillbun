import nodemailer from 'nodemailer'

import {
  getPasswordResetFrom,
  getZohoSmtpHost,
  getZohoSmtpPass,
  getZohoSmtpPort,
  getZohoSmtpUser,
} from '@/utils/server/env'

let cachedTransporter = null

function getTransporter() {
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

function escapeHtml(value) {
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
      'SkillBun Support',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.55;">
        <p>Hi,</p>
        <p>Use this link to reset your SkillBun password:</p>
        <p>
          <a href="${safeLink}" style="display: inline-block; padding: 10px 14px; border-radius: 8px; background: #16a34a; color: #ffffff; text-decoration: none;">
            Reset password
          </a>
        </p>
        <p>If the button does not work, paste this link into your browser:</p>
        <p style="word-break: break-all;"><a href="${safeLink}">${safeLink}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>SkillBun Support</p>
      </div>
    `,
  })
}
