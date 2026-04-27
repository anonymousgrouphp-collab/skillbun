const DEFAULT_INTERNAL_PATH = '/quiz'
const PROTOCOL_PATTERN = /^[a-z][a-z\d+\-.]*:/i

export function normalizeInternalPath(value, fallback = DEFAULT_INTERNAL_PATH) {
  const safeFallback = typeof fallback === 'string' && fallback.startsWith('/') ? fallback : DEFAULT_INTERNAL_PATH

  if (typeof value !== 'string') {
    return safeFallback
  }

  const trimmed = value.trim()

  if (!trimmed || PROTOCOL_PATTERN.test(trimmed) || trimmed.startsWith('//') || trimmed.startsWith('\\')) {
    return safeFallback
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  try {
    const parsed = new URL(withLeadingSlash.replace(/\\/g, '/'), 'https://skillbun.local')

    if (parsed.origin !== 'https://skillbun.local') {
      return safeFallback
    }

    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`
    return normalized === '/onboarding' || normalized.startsWith('/onboarding?') ? safeFallback : normalized
  } catch {
    return safeFallback
  }
}

export function buildOnboardingPath(nextPath, fallback = DEFAULT_INTERNAL_PATH) {
  const safeNext = normalizeInternalPath(nextPath, fallback)
  return `/onboarding?next=${encodeURIComponent(safeNext)}`
}
