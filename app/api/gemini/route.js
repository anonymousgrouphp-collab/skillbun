import { NextResponse } from 'next/server'

import { getGeminiApiKey, getGeminiTimeoutMs } from '@/utils/server/env'
import { verifyHumanProofToken } from '@/utils/server/humanProof'

const MAX_BODY_CHARS = 100_000
const MAX_CONTENT_ITEMS = 60
const MAX_PARTS_PER_MESSAGE = 12
const MAX_PART_TEXT_CHARS = 18_000

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

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

    let response
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json({ error: 'AI is busy. Please try again in a moment.' }, { status: 429 })
      }

      if (response.status >= 400 && response.status < 500) {
        return NextResponse.json({ error: 'Gemini rejected the request payload.' }, { status: 502 })
      }

      return NextResponse.json({ error: 'Something went wrong with AI.' }, { status: 502 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    if (err?.name === 'AbortError') {
      return NextResponse.json({ error: 'AI request timed out. Please try again.' }, { status: 504 })
    }

    return NextResponse.json({ error: 'Could not reach AI service.' }, { status: 500 })
  }
}
