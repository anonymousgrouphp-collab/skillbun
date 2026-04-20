import { NextResponse } from 'next/server'

export async function GET() {
  const CAPTCHA_ENABLED = Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
  return NextResponse.json({
      captcha: {
          provider: 'turnstile',
          enabled: CAPTCHA_ENABLED,
          siteKey: CAPTCHA_ENABLED ? process.env.TURNSTILE_SITE_KEY : '',
          mode: CAPTCHA_ENABLED ? 'live' : 'disabled'
      }
  });
}
