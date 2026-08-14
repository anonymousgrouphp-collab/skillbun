import { NextResponse } from 'next/server'

export const API_ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AI_UNAVAILABLE: 'AI_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}

/**
 * Standard Success Response helper for Next.js API Routes.
 */
export function apiSuccess(data = {}, { status = 200, headers = {} } = {}) {
  const payload = typeof data === 'object' && data !== null && !Array.isArray(data)
    ? { success: true, ...data }
    : { success: true, data }

  return NextResponse.json(payload, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

/**
 * Standard Error Response helper for Next.js API Routes.
 * Unifies error responses across the entire SkillBun platform.
 */
export function apiError(err, {
  status = 500,
  code = API_ERROR_CODES.INTERNAL_ERROR,
  details = null,
  retryAfterMs = null,
  headers = {},
} = {}) {
  const message = typeof err === 'string'
    ? err
    : (err?.message || 'An unexpected server error occurred.')

  let finalStatus = status
  let finalCode = code

  if (retryAfterMs || code === API_ERROR_CODES.RATE_LIMIT_EXCEEDED || finalStatus === 429) {
    finalStatus = 429
    finalCode = API_ERROR_CODES.RATE_LIMIT_EXCEEDED
  }

  const responseHeaders = {
    'Cache-Control': 'no-store',
    ...headers,
  }

  if (retryAfterMs && retryAfterMs > 0) {
    responseHeaders['Retry-After'] = String(Math.max(1, Math.ceil(retryAfterMs / 1000)))
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: finalCode,
        message,
        details: details || undefined,
        retryAfterMs: retryAfterMs || undefined,
      },
    },
    {
      status: finalStatus,
      headers: responseHeaders,
    }
  )
}

/**
 * Higher-order wrapper to safely execute API route handlers with automatic error catching.
 */
export function withErrorHandler(handler) {
  return async function wrappedHandler(request, context) {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error(`[API Route Exception] ${request?.nextUrl?.pathname || 'unknown'}:`, error)
      return apiError(error, {
        status: error?.status || 500,
        code: error?.code || API_ERROR_CODES.INTERNAL_ERROR,
      })
    }
  }
}
