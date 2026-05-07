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
  return getAuth(getAdminApp())
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getAdminApp())
}
