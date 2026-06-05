import { NextResponse } from 'next/server'

import {
  getGeminiApiKey,
  getGeminiMaxRetries,
  getGeminiRateLimitPerHour,
  getGeminiRateLimitPerMinute,
  getGeminiRetryBaseDelayMs,
  getGeminiTimeoutMs,
} from '@/utils/server/env'
import { getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin'
import { verifyHumanProofToken } from '@/utils/server/humanProof'
import { checkServerRateLimit } from '@/utils/server/rateLimitStore'

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

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

async function verifyAuthenticatedUser(request) {
  const idToken = getBearerToken(request)

  if (!idToken) {
    return { error: NextResponse.json({ error: 'Login required.' }, { status: 401 }) }
  }

  try {
    const user = await getFirebaseAdminAuth().verifyIdToken(idToken)
    return { user }
  } catch {
    return { error: NextResponse.json({ error: 'Login required.' }, { status: 401 }) }
  }
}

function getRateLimitSubject(request, uid) {
  return `uid:${uid}:ip:${getClientAddress(request)}`
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

    const authResult = await verifyAuthenticatedUser(request)
    if (authResult.error) {
      return authResult.error
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

    let rateLimit
    try {
      rateLimit = await checkServerRateLimit({
        namespace: 'gemini',
        subject: getRateLimitSubject(request, authResult.user.uid),
        limits: RATE_LIMIT_BUCKETS,
      })
    } catch (error) {
      console.error('Gemini rate limit check failed:', error?.message || error)
      return NextResponse.json({ error: 'AI protection check is temporarily unavailable. Please try again.' }, { status: 503 })
    }

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

    const filteredData = {
      candidates: data.candidates ? data.candidates.map(candidate => ({
        content: candidate.content ? {
          parts: candidate.content.parts ? candidate.content.parts.map(part => ({
            text: part.text
          })) : []
        } : null,
        finishReason: candidate.finishReason
      })) : [],
      promptFeedback: data.promptFeedback ? {
        blockReason: data.promptFeedback.blockReason
      } : null
    }

    return NextResponse.json(filteredData)
  } catch (err) {
    if (err?.name === 'AbortError') {
      return NextResponse.json({ error: 'AI request timed out. Please try again.' }, { status: 504 })
    }

    return NextResponse.json({ error: 'Could not reach AI service.' }, { status: 500 })
  }
}
