import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertVerifiedSignup } from '../../firebase-functions/signupPolicy.mjs';

// Execute the actual Admin wrapper with explicit SDK doubles. These tests never
// initialize Firebase, create an account, send an email, or contact production.
async function loadAdminWrapper(sdk, { configured = true } = {}) {
  const app = { name: 'skillbun-admin' };
  const deps = {
    cert: () => { throw new Error('Unexpected credential initialization'); },
    getApps: () => configured ? [app] : [],
    initializeApp: () => { throw new Error('Unexpected Firebase initialization'); },
    getFirestore: () => { throw new Error('Unexpected database access'); },
    getFirebaseAdminClientEmail: () => '',
    getFirebaseAdminPrivateKey: () => '',
    getFirebaseAdminProjectId: () => '',
    loadFirebaseAuth: async () => ({ getAuth: () => sdk }),
  };
  const source = (await readFile(new URL('../../utils/server/firebaseAdmin.js', import.meta.url), 'utf8'))
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\r?\n/gm, '')
    .replaceAll("await import('firebase-admin/auth')", 'await loadFirebaseAuth()')
    .replaceAll('export function ', 'function ');
  return new Function(...Object.keys(deps), `${source}; return getFirebaseAdminAuth();`)(...Object.values(deps));
}

test('API authentication requires authoritative verified-email claim and revocation check', async () => {
  const verified = { uid: 'verified-student', email_verified: true };
  const calls = [];
  const auth = await loadAdminWrapper({
    verifyIdToken: async (...args) => { calls.push(args); return verified; },
  });
  assert.equal(await auth.verifyIdToken('signed-token'), verified);
  assert.deepEqual(calls, [['signed-token', true]]);
});

test('unverified, missing and forged truthy verification claims cannot use authenticated APIs', async () => {
  for (const email_verified of [false, undefined, null, 'true', 1]) {
    const auth = await loadAdminWrapper({ verifyIdToken: async () => ({ uid: 'unverified', email_verified }) });
    await assert.rejects(auth.verifyIdToken('signed-token'), { code: 'auth/email-not-verified' });
  }
});

test('revoked sessions still fail before application verification', async () => {
  const auth = await loadAdminWrapper({ verifyIdToken: async () => {
    const error = new Error('Revoked'); error.code = 'auth/id-token-revoked'; throw error;
  } });
  await assert.rejects(auth.verifyIdToken('revoked-token'), { code: 'auth/id-token-revoked' });
});

test('Admin account creation and updates pass validated engine input to Firebase', async () => {
  const calls = [];
  const auth = await loadAdminWrapper({
    createUser: async (properties) => { calls.push(['create', properties]); return { uid: properties.uid }; },
    updateUser: async (uid, properties) => { calls.push(['update', uid, properties]); return { uid }; },
  });
  const properties = { uid: 'otp-verified-user', email: 'student@example.test', password: 'local-test-password', emailVerified: true };
  assert.deepEqual(await auth.createUser(properties), { uid: properties.uid });
  assert.deepEqual(await auth.updateUser(properties.uid, { emailVerified: true }), { uid: properties.uid });
  assert.deepEqual(calls, [['create', properties], ['update', properties.uid, { emailVerified: true }]]);
});

test('Admin provisioning fails closed without server credentials', async () => {
  const auth = await loadAdminWrapper({}, { configured: false });
  await assert.rejects(auth.createUser({}), /service credentials required/);
  await assert.rejects(auth.updateUser('uid', {}), /service credentials required/);
  await assert.rejects(auth.verifyIdToken('signed-token'), /service credentials required/);
});

test('registration hook blocks unverified email/password creation through public Firebase APIs', () => {
  for (const emailVerified of [false, undefined, null, 'true', 1]) {
    assert.throws(() => assertVerifiedSignup({ email: 'student@example.test', emailVerified }), {
      code: 'auth/email-not-verified',
    });
  }
});

test('registration hook preserves verified Google and server OTP-created accounts', () => {
  assert.doesNotThrow(() => assertVerifiedSignup({ email: 'student@example.test', emailVerified: true, providerData: [{ providerId: 'google.com' }] }));
  assert.doesNotThrow(() => assertVerifiedSignup({ email: 'student@example.test', emailVerified: true, providerData: [{ providerId: 'password' }] }));
});

test('Firestore source guards require token verification, preserve public certificates and server-only exams', async () => {
  const rules = await readFile(new URL('../../firestore.rules', import.meta.url), 'utf8');
  assert.match(rules, /function signedInAs\(uid\)\s*\{\s*return signedIn\(\) && request\.auth\.uid == uid;/);
  assert.match(rules, /function signedIn\(\)\s*\{\s*return request\.auth != null && request\.auth\.token\.get\('email_verified', false\) == true;/);
  assert.match(rules, /match \/certificates\/\{certId\}\s*\{\s*allow get: if true;/);
  assert.match(rules, /match \/examAttempts\/\{attemptId\}\s*\{\s*allow read: if false;/);
  assert.match(rules, /match \/emailSignupChallenges\/\{challengeId\}\s*\{\s*allow read, write: if false;/);
});
