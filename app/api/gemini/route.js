import { NextResponse } from 'next/server'

import crypto from 'node:crypto'

import {
  getGeminiApiKey,
  getGeminiMaxRetries,
  getGeminiRateLimitPerHour,
  getGeminiRateLimitPerMinute,
  getGeminiRetryBaseDelayMs,
  getGeminiTimeoutMs,
} from '@/utils/server/env'
import { verifyHumanProofToken } from '@/utils/server/humanProof'

const MAX_BODY_CHARS = 100_000
const MAX_CONTENT_ITEMS = 60
const MAX_PARTS_PER_MESSAGE = 12
const MAX_PART_TEXT_CHARS = 18_000
const GEMINI_MODEL = 'gemini-2.5-flash'
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const RATE_LIMIT_BUCKETS = [
  { name: 'minute', windowMs: 60 * 1000, getLimit: getGeminiRateLimitPerMinute },
  { name: 'hour', windowMs: 60 * 60 * 1000, getLimit: getGeminiRateLimitPerHour },
]

const geminiRateBuckets = globalThis.__skillbunGeminiRateBuckets ?? new Map()
globalThis.__skillbunGeminiRateBuckets = geminiRateBuckets
let lastRateLimitCleanup = 0

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

function getRateLimitKey(request, token) {
  return hashRateKey(`${getClientAddress(request)}:${token}`)
}

function cleanupRateLimitBuckets(now) {
  if (now - lastRateLimitCleanup < 60_000) return
  lastRateLimitCleanup = now

  for (const [key, bucket] of geminiRateBuckets.entries()) {
    if (!bucket || bucket.resetAt <= now) {
      geminiRateBuckets.delete(key)
    }
  }
}

function checkGeminiRateLimit(key, now = Date.now()) {
  cleanupRateLimitBuckets(now)

  const pendingBuckets = []
  let blockedBucket = null

  for (const limit of RATE_LIMIT_BUCKETS) {
    const bucketKey = `${key}:${limit.name}`
    const maxRequests = limit.getLimit()
    let bucket = geminiRateBuckets.get(bucketKey)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + limit.windowMs }
    }

    if (bucket.count >= maxRequests) {
      const retryAfterMs = Math.max(1000, bucket.resetAt - now)
      if (!blockedBucket || retryAfterMs < blockedBucket.retryAfterMs) {
        blockedBucket = { retryAfterMs, limitName: limit.name, maxRequests }
      }
    }

    pendingBuckets.push({ bucketKey, bucket })
  }

  if (blockedBucket) {
    return { allowed: false, ...blockedBucket }
  }

  for (const { bucketKey, bucket } of pendingBuckets) {
    bucket.count += 1
    geminiRateBuckets.set(bucketKey, bucket)
  }

  return { allowed: true }
}

function retryAfterSeconds(ms) {
  return String(Math.max(1, Math.ceil(ms / 1000)))
}

function parseRetryAfterMs(value) {
  if (!value) return 0

  const seconds = Number.parseInt(value, 10)
  if (Number.isFinite(seconds)) {
    return Math.max(0, seconds * 1000)
  }

  const retryDate = Date.parse(value)
  if (Number.isFinite(retryDate)) {
    return Math.max(0, retryDate - Date.now())
  }

  return 0
}

function getRetryDelayMs(response, attempt) {
  const retryAfterMs = parseRetryAfterMs(response?.headers?.get('retry-after'))
  if (retryAfterMs > 0) {
    return Math.min(retryAfterMs, 30_000)
  }

  return Math.min(getGeminiRetryBaseDelayMs() * (2 ** attempt), 8_000)
}

async function fetchGeminiWithRetry(apiKey, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`
  const maxRetries = getGeminiMaxRetries()

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      })

      if (response.ok || !RETRYABLE_STATUS_CODES.has(response.status) || attempt === maxRetries) {
        return response
      }

      await sleep(getRetryDelayMs(response, attempt))
    } catch (err) {
      if (attempt === maxRetries || err?.name === 'AbortError') {
        throw err
      }

      await sleep(Math.min(getGeminiRetryBaseDelayMs() * (2 ** attempt), 8_000))
    } finally {
      clearTimeout(timeout)
    }
  }

  throw new Error('Gemini retry loop exited unexpectedly.')
}

async function readResponseJson(response) {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text.slice(0, 500) }
  }
}

function getGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''

  const textPart = parts.find((part) => typeof part?.text === 'string' && part.text.trim())
  return textPart?.text || ''
}

function getEmptyGeminiReason(data) {
  return (
    data?.promptFeedback?.blockReason ||
    data?.candidates?.[0]?.finishReason ||
    data?.error?.status ||
    ''
  )
}

function validateGeminiPayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Payload must be a JSON object.'
  }

  if (!Array.isArray(body.contents) || body.contents.length === 0) {
    return 'Conversation payload must include at least one message.'
  }

  if (body.contents.length > MAX_CONTENT_ITEMS) {
    return 'Conversation payload is too large.'
  }

  for (const entry of body.contents) {
    if (!entry || typeof entry !== 'object') {
      return 'Conversation payload contains an invalid message.'
    }

    if (entry.role !== 'user' && entry.role !== 'model') {
      return 'Conversation payload contains an invalid role.'
    }

    if (!Array.isArray(entry.parts) || entry.parts.length === 0 || entry.parts.length > MAX_PARTS_PER_MESSAGE) {
      return 'Conversation payload contains an invalid message body.'
    }

    for (const part of entry.parts) {
      if (!part || typeof part !== 'object' || typeof part.text !== 'string') {
        return 'Conversation payload contains an invalid text part.'
      }

      if (!part.text.trim()) {
        return 'Conversation payload contains an empty text part.'
      }

      if (part.text.length > MAX_PART_TEXT_CHARS) {
        return 'Conversation payload contains text that is too long.'
      }
    }
  }

  return ''
}

export async function POST(request) {
  try {
    const apiKey = getGeminiApiKey()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured.' }, { status: 500 })
    }

    const token = request.headers.get('x-skillbun-human') || ''
    const verification = verifyHumanProofToken(token)

    if (!verification.valid) {
      return NextResponse.json({ error: 'Human verification required.' }, { status: 403 })
    }

    const rawBody = await request.text()
    if (rawBody.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: 'Conversation payload is too large.' }, { status: 400 })
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 })
    }

    const validationError = validateGeminiPayload(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const rateLimit = checkGeminiRateLimit(getRateLimitKey(request, token))
    if (!rateLimit.allowed) {
      const message = rateLimit.limitName === 'minute'
        ? 'Too many AI requests at once. Please wait a moment and try again.'
        : 'AI request limit reached for this session. Please wait before trying again.'

      return NextResponse.json(
        { error: message, retryAfterMs: rateLimit.retryAfterMs },
        {
          status: 429,
          headers: { 'Retry-After': retryAfterSeconds(rateLimit.retryAfterMs) },
        }
      )
    }

    const response = await fetchGeminiWithRetry(apiKey, JSON.stringify(body))

    if (!response.ok) {
      const errorData = await readResponseJson(response)
      const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'))

      if (response.status === 429) {
        const waitMs = retryAfterMs || 10_000
        return NextResponse.json(
          { error: 'AI quota is busy. Please wait a moment and try again.', retryAfterMs: waitMs },
          {
            status: 429,
            headers: { 'Retry-After': retryAfterSeconds(waitMs) },
          }
        )
      }

      if (response.status >= 400 && response.status < 500) {
        const providerMessage = typeof errorData?.error?.message === 'string' ? errorData.error.message : ''
        if (/authentication|credential|api key/i.test(providerMessage)) {
          return NextResponse.json({ error: 'AI service is not configured correctly. Please contact the SkillBun team.' }, { status: 502 })
        }

        const suffix = providerMessage ? ` ${providerMessage}` : ''
        return NextResponse.json({ error: `Gemini rejected the request payload.${suffix}` }, { status: 502 })
      }

      return NextResponse.json({ error: 'AI service is temporarily unavailable. Please try again.' }, { status: 503 })
    }

    const data = await readResponseJson(response)
    const text = getGeminiText(data)

    if (!text) {
      const reason = getEmptyGeminiReason(data)
      const suffix = reason ? ` (${reason})` : ''
      return NextResponse.json({ error: `AI returned an empty response${suffix}. Please try again.` }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (err) {
    if (err?.name === 'AbortError') {
      return NextResponse.json({ error: 'AI request timed out. Please try again.' }, { status: 504 })
    }

    return NextResponse.json({ error: 'Could not reach AI service.' }, { status: 500 })
  }
}
