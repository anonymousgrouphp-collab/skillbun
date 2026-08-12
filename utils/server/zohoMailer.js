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
      'Thanks,',
      'Team ꌗꀘꀤ꒒꒒ꌃꀎꈤ',
    ].join('\n'),
    html: `
      <div style="max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #CAD8CF; border-radius: 12px; font-family: 'Nunito', 'Segoe UI', Arial, sans-serif; color: #18211D; background-color: #F4F7F2; line-height: 1.6;">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap');
        </style>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-family: 'Fredoka', 'Segoe UI', Arial, sans-serif; color: #11864F; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1.5px;">ꌗꀘꀤ꒒꒒ꌃꀎꈤ</h2>
        </div>

        <div style="background: #ffffff; padding: 28px; border-radius: 8px; border: 1px solid #CAD8CF;">
          <p style="margin-top: 0; font-size: 16px;">Hi,</p>
          <p style="font-size: 15px;">You requested to reset your password. Use the button below to secure your account and set up a new password:</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${safeLink}" style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: linear-gradient(135deg, #11864F, #0D6E42); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(17, 134, 79, 0.18);">
              Reset Password
            </a>
          </div>

          <p style="font-size: 13px; color: #516158; line-height: 1.5;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; font-size: 13px; background: #F4F7F2; padding: 10px; border-radius: 6px; border: 1px solid #CAD8CF; margin: 8px 0;"><a href="${safeLink}" style="color: #11864F; text-decoration: none;">${safeLink}</a></p>
          
          <p style="font-size: 14px; color: #516158; margin-bottom: 0;">If you did not request this email, you can safely ignore it. Your password won't change until you create a new one.</p>
        </div>

        <div style="margin-top: 24px; text-align: left; padding-left: 8px;">
          <p style="margin: 0; font-size: 14px; color: #516158;">Thanks,</p>
          <p style="margin: 4px 0 0 0; font-family: 'Fredoka', 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 700; color: #11864F; letter-spacing: 1px;">Team ꌗꀘꀤ꒒꒒ꌃꀎꈤ</p>
        </div>
      </div>
    `,
  })
}
