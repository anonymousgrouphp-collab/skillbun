import { beforeUserCreated } from 'firebase-functions/v2/identity'
import { HttpsError } from 'firebase-functions/v2/https'
import { assertVerifiedSignup } from './signupPolicy.mjs'

// Blocking functions require Firebase Authentication with Identity Platform.
// Google supplies a verified email; password signup must use the OTP API first.
export const requireVerifiedSignup = beforeUserCreated((event) => {
  try {
    assertVerifiedSignup(event.data)
  } catch (error) {
    throw new HttpsError('failed-precondition', error.message)
  }
})
