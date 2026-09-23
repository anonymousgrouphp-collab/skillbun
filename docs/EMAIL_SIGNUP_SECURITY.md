# Verified email signup

The public application is **https://skillbun.tech**. **https://skillbun.vercel.app** redirects there. Google authentication retains `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=skillbun.tech` and its existing Firebase helper configuration.

Email/password signup now sends a six-digit email code before creating a Firebase account. The server validates the code and creates the account with `emailVerified: true`; the client then signs in with the chosen password. Passwords are never saved in the signup challenge collection. Google keeps its existing provider-verified flow.

## Verification and abuse controls

- Codes expire after 10 minutes, allow five incorrect guesses, and can be resent after 60 seconds. A resend replaces the previous code.
- Mailbox sending limits are five per hour and ten per day. Gmail address aliases share a rate-limit bucket, while each challenge remains bound to its exact normalized email address.
- IP sending limits are five per minute, twenty per hour, and one hundred per day.
- Verification requests are limited to thirty per hour per email, and thirty per minute, one hundred per hour, and five hundred per day per IP.
- Shared Redis or Firestore limits fail closed for signup when durable enforcement is unavailable. Signup does not use isolated process-memory limits as a production fallback.
- Origin and request-body validation precede signup processing. Human verification is required when the existing CAPTCHA integration is enabled.
- OTP records and state changes are transactionally managed in the server-only `emailSignupChallenges` collection. Client access is denied even to a signed-in administrator. Expiration is checked by the application; Firestore cleanup timing never extends code validity.
- API authentication checks revoked/disabled sessions and requires the Firebase token's authoritative `email_verified === true` claim. Firestore's owner-access rules also require this claim. A client-writable profile field cannot grant verified status.
- Existing unverified password-only accounts can finish verification without deleting their profile or progress. After code verification, recovery replaces the password while the account remains unverified, revokes old sessions, then marks the email verified. Verified, federated, and disabled accounts are not changed by this recovery path.

## Production configuration and deployment

These are required release steps. A Vercel application deployment alone does not deploy Firestore rules or the Firebase registration hook.

1. **Server configuration in Vercel:** configure `SIGNUP_OTP_SECRET` with at least 32 characters of cryptographically random secret material. An explicitly configured `HUMAN_PROOF_SECRET` of at least 32 characters is also accepted as a fallback. The signup flow does not derive this secret from AI provider keys or use a development default. Keep either value server-only; never prefix it with `NEXT_PUBLIC_`. Rotating the secret invalidates pending codes.
2. **Existing services:** retain the Firebase Admin project/service-account credentials and its existing Auth/Firestore permissions. Retain `ZOHO_SMTP_HOST`, `ZOHO_SMTP_PORT`, `ZOHO_SMTP_USER=noreply@skillbun.tech`, and `ZOHO_SMTP_PASS`. Verification messages use the configured system mailbox, with replies routed to `harsh@skillbun.tech`. Redis REST credentials are optional when Firestore is available; one durable rate-limit backend must be reachable. Keep the existing Turnstile credentials and enablement settings when CAPTCHA is used.
3. **Deploy the application to Vercel** so the OTP endpoints and new auth interface are available. Confirm the canonical origin is `https://skillbun.tech`; include only owned application origins in any configured allowlist.
4. **Deploy Firestore rules:** from the repository root, run `firebase deploy --only firestore:rules --project skillbun-75d10`. This closes direct unverified access to profiles, progress, and other authenticated client data, and explicitly denies all client access to OTP records.
5. **Optional Firestore cleanup:** create a TTL policy for collection group `emailSignupChallenges`, field `deleteAfter`. For example, `gcloud firestore fields ttls update deleteAfter --collection-group=emailSignupChallenges --enable-ttl --project=skillbun-75d10`. Records carry a cleanup timestamp approximately 24 hours after their update. TTL cleanup is asynchronous and may incur Firestore delete charges. The application already enforces shorter code expiry without this cleanup policy.
6. **Close Firebase's public signup bypass:** upgrade this Firebase project to **Firebase Authentication with Identity Platform**, reviewing its billing terms, and deploy the included blocking function. Install its separate dependencies with `npm ci --prefix firebase-functions`, then run `firebase deploy --only functions:signup-security --project skillbun-75d10`. Confirm the Authentication/Identity Platform **before create** trigger is registered as `requireVerifiedSignup`. The function needs no SMTP or OTP secrets and performs no network calls.

The function uses Firebase Functions v2 on Node.js 22. Its independent package and lockfile are in `firebase-functions/`; it is not part of the Vercel dependency graph. Firebase deployments can require an enabled billing plan and the corresponding Functions/Cloud Run build services. No cloud upgrade, billing change, function deployment, rule deployment, or production email dispatch is performed merely by applying this code change.

**Do not globally disable user signup or disable the email provider.** Firebase's `client.permissions.disabledUserSignup` setting applies to creation through all public authentication methods and can prevent first-time Google signup. Disabling email auth also disables existing password login. The blocking function specifically enforces verified email creation while allowing Google's verified accounts.

## Why the blocking function is required

Firebase's web API key is public by design. Hiding `createUserWithEmailAndPassword` in the interface cannot prevent a caller from invoking `accounts:signUp` directly. Until the blocking function is deployed, that call can still create an **unverified Firebase Auth record**. The updated application, API guards, and deployed Firestore rules deny that record access to the authenticated product, but preventing creation of the record itself requires the Identity Platform hook.

The hook rejects a new user with an email unless `emailVerified` is the boolean `true`. Firebase does not let public API callers set that flag. Google's verified email is allowed without an additional OTP. Server provisioning uses the privileged Admin SDK after OTP validation, which uses OAuth2 authorization and bypasses the client registration trigger; it also explicitly sets `emailVerified: true`, consistent with the hook's policy. The hook never marks an unverified email as verified.

The official Firebase blocking-functions guide documents both the Identity Platform requirement and this exact unverified-registration rejection pattern. Firebase's official Auth emulator implementation also guards its signup `BEFORE_CREATE` invocation with `reqBody.email && !ctx.security?.Oauth2`, distinguishing privileged Admin creation from public client signup.

References:

- [Firebase blocking functions, prerequisites, and unverified-registration example](https://firebase.google.com/docs/auth/extend-with-blocking-functions)
- [Identity Toolkit accounts.signUp API](https://cloud.google.com/identity-platform/docs/reference/rest/v1/accounts/signUp)
- [Identity Toolkit project configuration and ClientPermissions](https://cloud.google.com/identity-platform/docs/reference/rest/v2/projects/getConfig)
- [Firebase Auth emulator signup implementation](https://github.com/firebase/firebase-tools/blob/master/src/emulator/auth/operations.ts)
- [Firestore TTL configuration](https://firebase.google.com/docs/firestore/ttl)

## Verification and operational checks

Local tests use service doubles and never create real accounts or send email. They cover verified/invalid token claims, revocation handling, privileged provisioning adapters, the registration hook policy, and Firestore source guardrails. The rules checks are source checks, not an assertion that cloud rules have been deployed.

After deployment, use a controlled test mailbox to verify delivery, code expiry, resend invalidation, wrong-code exhaustion, completed signup/login, and recovery of an existing unverified password account. Confirm direct public Firebase email/password signup is rejected by the hook, verified Google signup still succeeds, and unverified ID tokens cannot read/write protected Firestore documents or call authenticated APIs. Run these checks only against an approved test account; never email unrelated users or alter their accounts for testing.

Removing the function requires unregistering its Authentication/Identity Platform trigger first. Leaving a registered trigger pointed at a deleted or unavailable function can block account creation. Do not unregister this protection as a routine workaround for signup errors.
