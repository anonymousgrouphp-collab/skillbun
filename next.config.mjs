import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skillbun-75d10'
const firebaseAuthOrigin = `https://${firebaseProjectId}.firebaseapp.com`
const isProduction = process.env.NODE_ENV === 'production'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.gstatic.com https://apis.google.com`,
  `connect-src 'self'${isProduction ? '' : ' ws://localhost:* http://localhost:*'} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://challenges.cloudflare.com`,
  `frame-src 'self' ${firebaseAuthOrigin} https://challenges.cloudflare.com https://accounts.google.com`,
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
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
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
    ]
  },
}

export default nextConfig
