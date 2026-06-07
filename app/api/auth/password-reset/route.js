import { NextResponse } from 'next/server'

import { getAllowedAppOrigins, getAppOrigin } from '@/utils/server/env'
import { getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin'
import { checkServerRateLimit, hashRateLimitSubject } from '@/utils/server/rateLimitStore'
import { sendSkillBunPasswordResetEmail } from '@/utils/server/zohoMailer'

export const runtime = 'nodejs'

const MAX_EMAIL_LENGTH = 254
const RATE_LIMITS = [
  { name: 'emailMinute', windowMs: 60 * 1000, maxRequests: 1, getSubject: ({ email }) => `email:${email}` },
  { name: 'emailHour', windowMs: 60 * 60 * 1000, maxRequests: 3, getSubject: ({ email }) => `email:${email}` },
  { name: 'ipHour', windowMs: 60 * 60 * 1000, maxRequests: 10, getSubject: ({ address }) => `ip:${address}` },
]

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function isValidEmail(email) {
  return email.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getClientAddress(request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || ''
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    forwardedFor.split(',')[0]?.trim() ||
    'local'
  )
}

async function checkRateLimit({ address, email, increment = true }) {
  return checkServerRateLimit({
    namespace: 'passwordReset',
    subject: { address, email },
    limits: RATE_LIMITS,
    increment,
  })
}

function retryAfterSeconds(ms) {
  return String(Math.max(1, Math.ceil(ms / 1000)))
}

function okResponse() {
  return NextResponse.json({ ok: true })
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin.replace('://127.0.0.1:', '://localhost:')
  } catch {
    return ''
  }
}

function isLocalOrigin(origin) {
  try {
    const parsed = new URL(origin)
    return parsed.protocol === 'http:' && parsed.hostname === 'localhost'
  } catch {
    return false
  }
}

function getPasswordResetBaseUrl(request) {
  const requestOrigin = normalizeOrigin(request.headers.get('origin') || new URL(request.url).origin)
  if (requestOrigin) {
    try {
      const parsedOrigin = new URL(requestOrigin)
      const hostname = parsedOrigin.hostname
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        'skillbun-v2.vercel.app',
        'skillbun.tech',
        'www.skillbun.tech',
        'skillbun-75d10.firebaseapp.com',
        'skillbun-75d10.web.app'
      ]
      if (allowedDomains.includes(hostname)) {
        return requestOrigin
      }
    } catch (e) {
      console.error('Failed to parse request origin URL:', e)
    }
  }

  const configuredOrigin = normalizeOrigin(getAppOrigin())
  if (configuredOrigin) return configuredOrigin

  const allowedOrigins = new Set(getAllowedAppOrigins().map(normalizeOrigin).filter(Boolean))

  if (allowedOrigins.has(requestOrigin)) return requestOrigin
  if (process.env.NODE_ENV !== 'production' && isLocalOrigin(requestOrigin)) return requestOrigin

  throw new Error('APP_ORIGIN is not configured.')
}

function buildActionCodeSettings(request) {
  const baseUrl = getPasswordResetBaseUrl(request)

  return {
    url: `${baseUrl}/auth?mode=login`,
    handleCodeInApp: false,
  }
}

export async function POST(request) {
  let email = ''

  try {
    const body = await request.json().catch(() => ({}))
    email = normalizeEmail(body?.email)

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const address = getClientAddress(request)
    // 1. Check rate limit (without incrementing)
    const rateLimit = await checkRateLimit({ address, email, increment: false })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Please wait before requesting another reset email.', retryAfterMs: rateLimit.retryAfterMs },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSeconds(rateLimit.retryAfterMs) },
        }
      )
    }

    const auth = getFirebaseAdminAuth()

    try {
      await auth.getUserByEmail(email)
    } catch (error) {
      if (error?.code === 'auth/user-not-found') {
        // Increment rate limit to prevent brute force email enumeration
        await checkRateLimit({ address, email, increment: true }).catch((err) => {
          console.error('Failed to increment rate limit on user-not-found:', err)
        })
        return okResponse()
      }

      throw error
    }

    const rawResetLink = await auth.generatePasswordResetLink(email, buildActionCodeSettings(request))
    const baseUrl = getPasswordResetBaseUrl(request)
    const resetLink = rawResetLink.replace(/^https:\/\/[^\/]+/, baseUrl)

    await sendSkillBunPasswordResetEmail({ email, resetLink })

    // 2. Increment rate limit on successful mail delivery
    await checkRateLimit({ address, email, increment: true }).catch((err) => {
      console.error('Failed to increment rate limit after successful send:', err)
    })

    return okResponse()
  } catch (error) {
    console.error('Password reset request failed:', {
      code: error?.code || '',
      message: error?.message || 'Unknown error',
      emailHash: email ? hashRateLimitSubject(email).slice(0, 32) : '',
    })

    return NextResponse.json({ error: 'Could not send password reset email. Please try again later.' }, { status: 500 })
  }
}
