/**
 * Only provider-verified emails may be created through Firebase's public APIs.
 * The application creates email/password users through Admin Auth after OTP
 * verification. Never mark an unverified provider email as verified here.
 */
export function assertVerifiedSignup(user) {
  if (user?.email && user.emailVerified !== true) {
    const error = new Error('Verify your email with the code at skillbun.tech before creating your account.')
    error.code = 'auth/email-not-verified'
    throw error
  }
}
