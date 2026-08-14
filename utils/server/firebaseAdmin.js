import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

import {
  getFirebaseAdminClientEmail,
  getFirebaseAdminPrivateKey,
  getFirebaseAdminProjectId,
} from '@/utils/server/env'

const ADMIN_APP_NAME = 'skillbun-admin'

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
  try {
    const app = getAdminApp()
    return app ? getAuth(app) : null
  } catch (err) {
    console.warn('[Firebase Admin Auth Init Warning]:', err.message)
    return null
  }
}

export function getFirebaseAdminFirestore() {
  try {
    const app = getAdminApp()
    return app ? getFirestore(app) : null
  } catch (err) {
    console.warn('[Firebase Admin Firestore Init Warning]:', err.message)
    return null
  }
}
