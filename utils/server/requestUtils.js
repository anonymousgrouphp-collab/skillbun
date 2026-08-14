/**
 * SkillBun Server-Side Request Utilities
 * Shared helpers for request parsing, IP extraction, and rate limit key generation.
 */

/**
 * Safely extracts client IP address across Cloudflare, reverse proxies, and direct connections.
 * @param {Request} request
 * @returns {string} Client IP address or fallback '127.0.0.1'
 */
export function getClientAddress(request) {
  const forwardedFor = request?.headers?.get?.('x-forwarded-for') || ''
  return (
    request?.headers?.get?.('cf-connecting-ip') ||
    request?.headers?.get?.('x-real-ip') ||
    forwardedFor.split(',')[0].trim() ||
    '127.0.0.1'
  )
}

/**
 * Generates standard rate limit key per user ID and client IP address.
 * @param {string} prefix
 * @param {Request} request
 * @param {string} uid
 * @returns {string}
 */
export function getRateLimitKey(prefix, request, uid) {
  return `uid:${uid}:ip:${getClientAddress(request)}`
}
