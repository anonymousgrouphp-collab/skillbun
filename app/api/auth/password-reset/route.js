import crypto from 'node:crypto'

import { NextResponse } from 'next/server'

import { getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin'
import { sendSkillBunPasswordResetEmail } from '@/utils/server/zohoMailer'

export const runtime = 'nodejs'

const MAX_EMAIL_LENGTH = 254
const RATE_LIMITS = [
  { name: 'emailMinute', windowMs: 60 * 1000, maxRequests: 1, key: ({ email }) => `email:${email}` },
  { name: 'emailHour', windowMs: 60 * 60 * 1000, maxRequests: 3, key: ({ email }) => `email:${email}` },
  { name: 'ipHour', windowMs: 60 * 60 * 1000, maxRequests: 10, key: ({ address }) => `ip:${address}` },
]

const resetRateBuckets = globalThis.__skillbunPasswordResetRateBuckets ?? new Map()
globalThis.__skillbunPasswordResetRateBuckets = resetRateBuckets
let lastRateLimitCleanup = 0

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

function hashRateKey(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 32)
}

function cleanupRateLimitBuckets(now) {
  if (now - lastRateLimitCleanup < 60_000) return
  lastRateLimitCleanup = now

  for (const [key, bucket] of resetRateBuckets.entries()) {
    if (!bucket || bucket.resetAt <= now) {
      resetRateBuckets.delete(key)
    }
  }
}

function checkRateLimit({ address, email }, now = Date.now()) {
  cleanupRateLimitBuckets(now)

  const pendingBuckets = []
  let retryAfterMs = 0

  for (const limit of RATE_LIMITS) {
    const bucketKey = `${limit.name}:${hashRateKey(limit.key({ address, email }))}`
    let bucket = resetRateBuckets.get(bucketKey)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + limit.windowMs }
    }

    if (bucket.count >= limit.maxRequests) {
      retryAfterMs = Math.max(retryAfterMs, bucket.resetAt - now)
    }

    pendingBuckets.push({ bucketKey, bucket })
  }

  if (retryAfterMs > 0) {
    return { allowed: false, retryAfterMs }
  }

  for (const { bucketKey, bucket } of pendingBuckets) {
    bucket.count += 1
    resetRateBuckets.set(bucketKey, bucket)
  }

  return { allowed: true }
}

function retryAfterSeconds(ms) {
  return String(Math.max(1, Math.ceil(ms / 1000)))
}

function okResponse() {
  return NextResponse.json({ ok: true })
}

function buildActionCodeSettings(request) {
  const origin = request.headers.get('origin')
  const requestOrigin = new URL(request.url).origin
  const baseUrl = (origin || requestOrigin).replace('://127.0.0.1:', '://localhost:')

  if (!baseUrl) {
    return undefined
  }

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
    const rateLimit = checkRateLimit({ address, email })
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
        return okResponse()
      }

      throw error
    }

    const resetLink = await auth.generatePasswordResetLink(email, buildActionCodeSettings(request))
    await sendSkillBunPasswordResetEmail({ email, resetLink })
    return okResponse()
  } catch (error) {
    console.error('Password reset request failed:', {
      code: error?.code || '',
      message: error?.message || 'Unknown error',
      emailHash: email ? hashRateKey(email) : '',
    })

    return NextResponse.json({ error: 'Could not send password reset email. Please try again later.' }, { status: 500 })
  }
}
