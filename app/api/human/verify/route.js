import { NextResponse } from 'next/server'

import { getTurnstileSecretKey, isCaptchaEnabled } from '@/utils/server/env'
import { issueHumanProofToken, verifyHumanProofToken } from '@/utils/server/humanProof'

export async function POST(request) {
  const captchaEnabled = isCaptchaEnabled()
  const existingToken = request.headers.get('x-skillbun-human') || ''
  const existingVerification = verifyHumanProofToken(existingToken)

  if (existingVerification.valid) {
    const refreshed = issueHumanProofToken({ v: 1 })

    if (!refreshed) {
      return NextResponse.json({ error: 'Human verification is not configured.' }, { status: 500 })
    }

    return NextResponse.json({
      captchaEnabled: captchaEnabled,
      humanToken: refreshed.token,
      expiresAt: refreshed.expiresAt,
    })
  }

  if (!captchaEnabled) {
    const issued = issueHumanProofToken({ v: 1 })

    if (!issued) {
      return NextResponse.json({ error: 'Human verification is not configured.' }, { status: 500 })
    }

    return NextResponse.json({
      captchaEnabled: false,
      humanToken: issued.token,
      expiresAt: issued.expiresAt,
    })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token : ''

    const bypassHeader = request.headers.get('x-skillbun-bypass') || ''
    const isLocal = process.env.NODE_ENV !== 'production'
    const isBypassed = (token === 'bypass-captcha-dev') || (bypassHeader === 'bypass-captcha-dev')

    if (isBypassed && isLocal) {
      const issued = issueHumanProofToken({ v: 1 })

      if (!issued) {
        return NextResponse.json({ error: 'Human verification is not configured.' }, { status: 500 })
      }

      return NextResponse.json({
        captchaEnabled: true,
        humanToken: issued.token,
        expiresAt: issued.expiresAt,
      })
    }

    if (!token) {
      return NextResponse.json({ error: 'Captcha token is required.' }, { status: 400 })
    }

    const formBody = new URLSearchParams({
      secret: getTurnstileSecretKey(),
      response: token
    })

    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const remoteIp = forwardedFor.split(',')[0]?.trim()
    if (remoteIp) {
      formBody.set('remoteip', remoteIp)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString()
    })

    const data = await response.json()
    if (data.success) {
      const issued = issueHumanProofToken({ v: 1 })

      if (!issued) {
        return NextResponse.json({ error: 'Human verification is not configured.' }, { status: 500 })
      }

      return NextResponse.json({
        captchaEnabled: true,
        humanToken: issued.token,
        expiresAt: issued.expiresAt
      })
    }

    return NextResponse.json({ error: 'Captcha verification failed.' }, { status: 403 })
  } catch {
    return NextResponse.json({ error: 'Captcha error.' }, { status: 500 })
  }
}
