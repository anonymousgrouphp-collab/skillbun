import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skillbun-75d10'
const firebaseAuthOrigin = `https://${firebaseProjectId}.firebaseapp.com`

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
}

export default nextConfig
