import crypto from 'node:crypto'

import { getFirebaseAdminFirestore } from './firebaseAdmin'

const RATE_LIMIT_COLLECTION = 'serverRateLimits'

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
  const data = snapshot.exists ? snapshot.data() : {}
  const count = Number.parseInt(data?.count, 10)
  const resetAt = Number.parseInt(data?.resetAt, 10)

  if (!Number.isFinite(count) || !Number.isFinite(resetAt) || resetAt <= now) {
    return { count: 0, resetAt: now + windowMs }
  }

  return { count, resetAt }
}

export async function checkServerRateLimit({ namespace, subject, limits, now = Date.now(), increment = true }) {
  if (!namespace || !subject || !Array.isArray(limits) || limits.length === 0) {
    throw new Error('Rate limit configuration is invalid.')
  }

  const db = getFirebaseAdminFirestore()

  return db.runTransaction(async (transaction) => {
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
}
