import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { createRemoteJWKSet, jwtVerify } from 'jose'

import {
  getFirebaseAdminClientEmail,
  getFirebaseAdminPrivateKey,
  getFirebaseAdminProjectId,
} from '@/utils/server/env'

const ADMIN_APP_NAME = 'skillbun-admin'
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
)

function getAdminApp() {
  const existingApp = getApps().find((app) => app.name === ADMIN_APP_NAME)
  if (existingApp) {
    return existingApp
  }

  const projectId = getFirebaseAdminProjectId()
  const clientEmail = getFirebaseAdminClientEmail()
  const privateKey = getFirebaseAdminPrivateKey()

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are not configured.')
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  }, ADMIN_APP_NAME)
}

export function getFirebaseAdminAuth() {
  const projectId = getFirebaseAdminProjectId() || 'skillbun-75d10'

  return {
    async verifyIdToken(token) {
      if (!token || typeof token !== 'string') {
        throw new Error('Decoding Firebase ID token failed. Invalid token.')
      }

      const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      })

      return {
        ...payload,
        uid: payload.user_id || payload.sub,
        email: payload.email || '',
      }
    },
  }
}

export function getFirebaseAdminFirestore() {
  try {
    const app = getAdminApp()
    if (!app) return null

    const db = getFirestore(app)
    try {
      db.settings({ preferRest: true })
    } catch {
      // Ignore if already configured
    }

    return db
  } catch (err) {
    console.warn('[Firebase Admin Firestore Init Warning]:', err.message)
    return null
  }
}
