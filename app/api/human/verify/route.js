import { NextResponse } from 'next/server'

export async function POST(request) {
  const CAPTCHA_ENABLED = Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
  
  if (!CAPTCHA_ENABLED) {
    return NextResponse.json({
        captchaEnabled: false,
        humanToken: 'skip',
        expiresAt: Date.now() + 1800000
    });
  }

  try {
    const body = await request.json();
    const token = body?.token;

    const formBody = new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token
    });

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
    });

    const data = await response.json();
    if (data.success) {
      return NextResponse.json({
          captchaEnabled: true,
          humanToken: 'verified',
          expiresAt: Date.now() + 1800000
      });
    }

    return NextResponse.json({ error: 'Captcha verification failed.' }, { status: 403 });
  } catch (err) {
    return NextResponse.json({ error: 'Captcha error.' }, { status: 500 });
  }
}
