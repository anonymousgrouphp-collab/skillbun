import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skillbun-75d10'
const firebaseAuthOrigin = `https://${firebaseProjectId}.firebaseapp.com`
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
const posthogCspSource = posthogHost ? ` ${posthogHost}` : ''
const isProduction = process.env.NODE_ENV === 'production'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://www.google-analytics.com https://*.google-analytics.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://*.posthog.com`,
  `connect-src 'self'${isProduction ? '' : ' ws://localhost:* http://localhost:*'} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.posthog.com${posthogCspSource}`, 
  `frame-src 'self' ${firebaseAuthOrigin} https://challenges.cloudflare.com https://accounts.google.com https://www.youtube.com https://youtube.com`,
  "worker-src 'self' blob:",
  "form-action 'self'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    '/api/docs/[slug]/[topicId]': ['./content/docs/??/*.sbv'],
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: `${firebaseAuthOrigin}/__/auth/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(logo.png|splash-logo.png|certificate-template.png|favicon.ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
}

export default nextConfig
