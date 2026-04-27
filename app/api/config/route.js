import { NextResponse } from 'next/server'

import { getTurnstileSiteKey, isCaptchaEnabled } from '@/utils/server/env'

export async function GET() {
  const captchaEnabled = isCaptchaEnabled()

  return NextResponse.json({
    captcha: {
      provider: 'turnstile',
      enabled: captchaEnabled,
      siteKey: captchaEnabled ? getTurnstileSiteKey() : '',
      mode: captchaEnabled ? 'live' : 'disabled',
    },
  })
}
