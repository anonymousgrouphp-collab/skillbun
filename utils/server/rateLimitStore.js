import crypto from 'node:crypto'

import { getUpstashRedisRestToken, getUpstashRedisRestUrl, isRedisConfigured } from './env.js'
import { getFirebaseAdminFirestore } from './firebaseAdmin.js'

const RATE_LIMIT_COLLECTION = 'serverRateLimits'

// In-memory fallback cache for development or when remote services are unreachable
const memoryFallbackStore = new Map()

export function hashRateLimitSubject(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex')
}

function getRateLimitDocId(namespace, name, subject) {
  return hashRateLimitSubject(`${namespace}:${name}:${subject}`)
}

function resolveLimitSubject(subject, limit) {
  const resolved = typeof limit.getSubject === 'function' ? limit.getSubject(subject) : subject
  return typeof resolved === 'string' && resolved.trim() ? resolved.trim() : ''
}

function normalizeBucket(snapshot, now, windowMs) {
  const data = snapshot?.exists ? snapshot.data() : (snapshot || {})
  const count = Number.parseInt(data?.count, 10)
  const resetAt = Number.parseInt(data?.resetAt, 10)

  if (!Number.isFinite(count) || !Number.isFinite(resetAt) || resetAt <= now) {
    return { count: 0, resetAt: now + windowMs }
  }

  return { count, resetAt }
}

/**
 * Check and apply rate limits using Upstash Redis REST API.
 * Uses atomic HTTP pipeline for ultra-low latency (<5ms).
 */
async function checkRedisRateLimit({ namespace, subject, limits, increment = true }) {
  const restUrl = getUpstashRedisRestUrl()
  const restToken = getUpstashRedisRestToken()

  if (!restUrl || !restToken) {
    return null
  }

  const pipeline = []
  const bucketMeta = []

  for (const limit of limits) {
    const maxRequests = Number.parseInt(
      typeof limit.getLimit === 'function' ? limit.getLimit() : limit.maxRequests,
      10
    )
    const windowMs = Number.parseInt(limit.windowMs, 10)

    if (!limit.name || !Number.isFinite(maxRequests) || maxRequests < 1 || !Number.isFinite(windowMs) || windowMs < 1000) {
      throw new Error('Rate limit bucket configuration is invalid.')
    }

    const limitSubject = resolveLimitSubject(subject, limit)
    if (!limitSubject) {
      throw new Error('Rate limit subject is invalid.')
    }

    const redisKey = `sb:rl:${namespace}:${limit.name}:${hashRateLimitSubject(limitSubject)}`
    bucketMeta.push({ limit, maxRequests, windowMs, redisKey })

    if (increment) {
      pipeline.push(['INCR', redisKey])
      pipeline.push(['PTTL', redisKey])
    } else {
      pipeline.push(['GET', redisKey])
      pipeline.push(['PTTL', redisKey])
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 2000)

  try {
    const response = await fetch(`${restUrl.replace(/\/+$/, '')}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Upstash Redis rate limit request failed with status: ${response.status}`)
      return null
    }

    const results = await response.json()
    if (!Array.isArray(results)) {
      return null
    }

    let blockedBucket = null

    for (let i = 0; i < bucketMeta.length; i++) {
      const { limit, maxRequests, windowMs, redisKey } = bucketMeta[i]
      const countRes = results[i * 2]?.result
      const pttlRes = results[i * 2 + 1]?.result

      let currentCount = typeof countRes === 'number' ? countRes : Number.parseInt(countRes || '0', 10)
      let pttl = typeof pttlRes === 'number' ? pttlRes : Number.parseInt(pttlRes || '-1', 10)

      // If new key or expired without TTL set, ensure TTL is applied
      if (increment && currentCount === 1 && pttl === -1) {
        // Set expiry asynchronously in the background
        fetch(`${restUrl.replace(/\/+$/, '')}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${restToken}` },
        }).catch((err) => console.warn('Failed to set Redis PEXPIRE:', err?.message))
        pttl = windowMs
      }

      if (currentCount > maxRequests || (!increment && currentCount >= maxRequests)) {
        const retryAfterMs = pttl > 0 ? pttl : windowMs
        if (!blockedBucket || retryAfterMs < blockedBucket.retryAfterMs) {
          blockedBucket = { retryAfterMs, limitName: limit.name, maxRequests }
        }
      }
    }

    if (blockedBucket) {
      return { allowed: false, ...blockedBucket }
    }

    return { allowed: true }
  } catch (err) {
    clearTimeout(timeoutId)
    console.warn('Redis rate limit error, falling back to database/memory store:', err?.message || err)
    return null
  }
}

/**
 * Check rate limits using in-memory store (for testing or local fallback)
 */
function checkMemoryRateLimit({ namespace, subject, limits, now = Date.now(), increment = true }) {
  let blockedBucket = null
  const pendingUpdates = []

  for (const limit of limits) {
    const maxRequests = Number.parseInt(
      typeof limit.getLimit === 'function' ? limit.getLimit() : limit.maxRequests,
      10
    )
    const windowMs = Number.parseInt(limit.windowMs, 10)
    const limitSubject = resolveLimitSubject(subject, limit)
    const key = `${namespace}:${limit.name}:${hashRateLimitSubject(limitSubject)}`

    const existing = memoryFallbackStore.get(key)
    const bucket = normalizeBucket(existing, now, windowMs)

    if (bucket.count >= maxRequests) {
      const retryAfterMs = Math.max(1000, bucket.resetAt - now)
      if (!blockedBucket || retryAfterMs < blockedBucket.retryAfterMs) {
        blockedBucket = { retryAfterMs, limitName: limit.name, maxRequests }
      }
    }

    if (increment) {
      pendingUpdates.push({
        key,
        data: {
          count: bucket.count + 1,
          resetAt: bucket.resetAt,
        },
      })
    }
  }

  if (blockedBucket) {
    return { allowed: false, ...blockedBucket }
  }

  if (increment) {
    for (const update of pendingUpdates) {
      memoryFallbackStore.set(update.key, update.data)
    }
  }

  return { allowed: true }
}

/**
 * Main Rate Limit Checker:
 * 1. Tries ultra-fast Redis if configured (sub-5ms)
 * 2. Falls back to Firestore transactions if available
 * 3. Falls back to In-Memory store if Firestore is not initialized (e.g. offline dev/testing)
 */
export async function checkServerRateLimit({ namespace, subject, limits, now = Date.now(), increment = true }) {
  if (!namespace || !subject || !Array.isArray(limits) || limits.length === 0) {
    throw new Error('Rate limit configuration is invalid.')
  }

  // 1. Try Redis if configured
  if (isRedisConfigured()) {
    try {
      const redisResult = await checkRedisRateLimit({ namespace, subject, limits, increment })
      if (redisResult !== null) {
        return redisResult
      }
    } catch (redisError) {
      console.warn('Redis rate limiting check encountered error:', redisError?.message)
    }
  }

  // 2. Try Firestore fallback
  try {
    const db = getFirebaseAdminFirestore()
    if (!db) {
      return checkMemoryRateLimit({ namespace, subject, limits, now, increment })
    }

    return await db.runTransaction(async (transaction) => {
      const checks = []
      let blockedBucket = null

      for (const limit of limits) {
        const maxRequests = Number.parseInt(
          typeof limit.getLimit === 'function' ? limit.getLimit() : limit.maxRequests,
          10
        )
        const windowMs = Number.parseInt(limit.windowMs, 10)

        if (!limit.name || !Number.isFinite(maxRequests) || maxRequests < 1 || !Number.isFinite(windowMs) || windowMs < 1000) {
          throw new Error('Rate limit bucket configuration is invalid.')
        }

        const limitSubject = resolveLimitSubject(subject, limit)
        if (!limitSubject) {
          throw new Error('Rate limit subject is invalid.')
        }

        const ref = db.collection(RATE_LIMIT_COLLECTION).doc(getRateLimitDocId(namespace, limit.name, limitSubject))
        const snapshot = await transaction.get(ref)
        const bucket = normalizeBucket(snapshot, now, windowMs)
        checks.push({ ref, limit, bucket, maxRequests, windowMs, limitSubject })

        if (bucket.count >= maxRequests) {
          const retryAfterMs = Math.max(1000, bucket.resetAt - now)
          if (!blockedBucket || retryAfterMs < blockedBucket.retryAfterMs) {
            blockedBucket = { retryAfterMs, limitName: limit.name, maxRequests }
          }
        }
      }

      if (blockedBucket) {
        return { allowed: false, ...blockedBucket }
      }

      if (increment) {
        for (const { ref, limit, bucket, limitSubject } of checks) {
          transaction.set(ref, {
            namespace,
            limitName: limit.name,
            subjectHash: hashRateLimitSubject(limitSubject),
            count: bucket.count + 1,
            resetAt: bucket.resetAt,
            expiresAt: new Date(bucket.resetAt + 24 * 60 * 60 * 1000),
            updatedAt: now,
          }, { merge: true })
        }
      }

      return { allowed: true }
    })
  } catch (firestoreError) {
    console.warn('Firestore rate limit fallback failed, using memory store:', firestoreError?.message)
    return checkMemoryRateLimit({ namespace, subject, limits, now, increment })
  }
}
