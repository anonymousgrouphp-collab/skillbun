import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin';
import { getAllowedAppOrigins, getAppOrigin, isCaptchaEnabled } from '@/utils/server/env';
import { verifyHumanProofToken } from '@/utils/server/humanProof';
import { checkServerRateLimit } from '@/utils/server/rateLimitStore';
import { sendSkillBunSignupCodeEmail } from '@/utils/server/zohoMailer';
import { createEmailSignupService } from './emailSignup.mjs';
import { createEmailSignupHandlers } from './emailSignupHttp.mjs';

export const emailSignupHandlers = createEmailSignupHandlers({
  getService: () => createEmailSignupService({
    db: getFirebaseAdminFirestore(),
    auth: getFirebaseAdminAuth(),
    sendCode: sendSkillBunSignupCodeEmail,
    checkRateLimit: checkServerRateLimit,
    secret: process.env.SIGNUP_OTP_SECRET || process.env.HUMAN_PROOF_SECRET || '',
  }),
  captchaEnabled: isCaptchaEnabled,
  verifyHumanProof: verifyHumanProofToken,
  allowedOrigins: () => [getAppOrigin(), ...getAllowedAppOrigins()],
});
