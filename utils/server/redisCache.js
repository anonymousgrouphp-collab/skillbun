import { getUpstashRedisRestToken, getUpstashRedisRestUrl, isRedisConfigured } from './env.js'

// In-memory L1 cache for serverless instance lifespan
const memoryL1Cache = new Map()

/**
 * Multi-layer Cache Manager (L1 Instance Memory -> L2 Upstash Redis -> L3 Source Data)
 */
export async function getCache(key) {
  const now = Date.now()

  // 1. Check L1 In-Memory Cache
  const l1Hit = memoryL1Cache.get(key)
  if (l1Hit && l1Hit.expiresAt > now) {
    return l1Hit.value
  }

  // 2. Check L2 Upstash Redis
  if (isRedisConfigured()) {
    const restUrl = getUpstashRedisRestUrl()
    const restToken = getUpstashRedisRestToken()

    if (restUrl && restToken) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 1500)

        const response = await fetch(`${restUrl.replace(/\/+$/, '')}/get/${encodeURIComponent(key)}`, {
          headers: { Authorization: `Bearer ${restToken}` },
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (response.ok) {
          const data = await response.json()
          if (data?.result) {
            try {
              const parsed = JSON.parse(data.result)
              // Cache in L1 memory for 30 seconds to reduce Redis roundtrips
              memoryL1Cache.set(key, { value: parsed, expiresAt: now + 30_000 })
              return parsed
            } catch {
              return data.result
            }
          }
        }
      } catch (err) {
        console.warn('[Redis Cache Get Error]:', err?.message)
      }
    }
  }

  return null
}

export async function setCache(key, value, ttlSeconds = 300) {
  const now = Date.now()

  // 1. Save in L1 Memory
  memoryL1Cache.set(key, { value, expiresAt: now + ttlSeconds * 1000 })

  // 2. Save in L2 Upstash Redis
  if (isRedisConfigured()) {
    const restUrl = getUpstashRedisRestUrl()
    const restToken = getUpstashRedisRestToken()

    if (restUrl && restToken) {
      try {
        const stringVal = typeof value === 'string' ? value : JSON.stringify(value)
        fetch(`${restUrl.replace(/\/+$/, '')}/setex/${encodeURIComponent(key)}/${ttlSeconds}/${encodeURIComponent(stringVal)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${restToken}` },
        }).catch(() => {})
      } catch (err) {
        console.warn('[Redis Cache Set Error]:', err?.message)
      }
    }
  }
}

/**
 * Read-through Cache Helper: returns cached value or executes fetcherFn and caches the result
 */
export async function getOrSetCache(key, ttlSeconds, fetcherFn) {
  const cached = await getCache(key)
  if (cached !== null && cached !== undefined) {
    return cached
  }

  const freshData = await fetcherFn()
  if (freshData !== null && freshData !== undefined) {
    await setCache(key, freshData, ttlSeconds)
  }

  return freshData
}
