function getFirstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function parseIntWithinRange(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value ?? '', 10)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, minimum), maximum)
}


export function getTurnstileSiteKey() {
  return getFirstNonEmpty(process.env.TURNSTILE_SITE_KEY)
}

export function getTurnstileSecretKey() {
  return getFirstNonEmpty(process.env.TURNSTILE_SECRET_KEY)
}

export function isCaptchaEnabled() {
  return false
}

export function getGeminiApiKey() {
  return getFirstNonEmpty(process.env.GEMINI_API_KEY)
}

export function getGeminiTimeoutMs() {
  return parseIntWithinRange(process.env.GEMINI_TIMEOUT_MS, 20_000, 5_000, 60_000)
}

export function getHumanProofTtlMs() {
  return parseIntWithinRange(process.env.HUMAN_PROOF_TTL_MS, 30 * 60 * 1000, 60_000, 24 * 60 * 60 * 1000)
}

export function getHumanProofSecret() {
  const configuredSecret = getFirstNonEmpty(process.env.HUMAN_PROOF_SECRET)

  if (configuredSecret) {
    return configuredSecret
  }

  const fallbackSeed = getFirstNonEmpty(
    process.env.GEMINI_API_KEY
  )

  if (fallbackSeed) {
    return `skillbun-human-proof:${fallbackSeed}`
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'skillbun-human-proof:skillbun-local-dev'
  }

  return ''
}
