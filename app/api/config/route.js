import { NextResponse } from 'next/server'

export async function GET() {
  const siteKey = process.env.TURNSTILE_SITE_KEY || ''
  const secretKey = process.env.TURNSTILE_SECRET_KEY || ''
  const CAPTCHA_ENABLED = Boolean(siteKey && secretKey);
  return NextResponse.json({
      captcha: {
          provider: 'turnstile',
          enabled: CAPTCHA_ENABLED,
          siteKey: CAPTCHA_ENABLED ? siteKey : '',
          mode: CAPTCHA_ENABLED ? 'live' : 'disabled'
      }
  });
}
