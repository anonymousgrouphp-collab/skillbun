import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRewrittenUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server.js';
import { buildContentSecurityPolicy } from '../../utils/server/contentSecurityPolicy.mjs';

const projectId = 'skillbun-auth-regression';
const appOrigin = 'https://skillbun.tech';
let configImport = 0;

// Keep these tests independent of local credentials and restore every env value.
async function withFirebaseEnvironment(overrides, run) {
  const fixture = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'skillbun.tech',
    NEXT_PUBLIC_POSTHOG_HOST: undefined,
    ...overrides,
  };
  const previous = new Map(Object.keys(fixture).map((key) => [key, process.env[key]]));
  try {
    for (const [key, value] of Object.entries(fixture)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    return await run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function configuredResponse(path) {
  // next.config captures its build-time environment, so reload it for each fixture.
  const { default: nextConfig } = await import(`../../next.config.mjs?google-auth-test=${++configImport}`);
  return unstable_getResponseFromNextConfig({ url: `${appOrigin}${path}`, nextConfig });
}

function directive(policy, name) {
  const result = policy.split('; ').find((entry) => entry.startsWith(`${name} `));
  assert.ok(result, `Missing ${name} directive`);
  return result.split(' ').slice(1);
}

for (const path of [
  '/__/auth',
  '/__/auth/',
  '/__/auth/handler',
  '/__/auth/iframe',
  '/__/auth/handler.js',
  '/__/auth/iframe.js',
  '/__/auth/nested/helper.js',
]) {
  test(`Firebase helper ${path} retains its upstream CSP and framing policy`, async () => {
    await withFirebaseEnvironment({}, async () => {
      const response = await configuredResponse(path);
      // No app policy may be layered onto Firebase's own helper response policy.
      assert.equal(response.headers.get('content-security-policy'), null);
      assert.equal(response.headers.get('x-frame-options'), null);
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      assert.match(response.headers.get('strict-transport-security'), /max-age=63072000/);
    });
  });
}

for (const path of [
  '/',
  '/auth?mode=signup',
  '/api',
  '/api/human/verify',
  '/roadmap/web-development',
  '/__/authorize',
  '/__/auth-other',
  '/__/auth-other/handler',
]) {
  test(`Application route ${path} keeps strict CSP and clickjacking protection`, async () => {
    await withFirebaseEnvironment({}, async () => {
      const response = await configuredResponse(path);
      const policy = response.headers.get('content-security-policy');
      assert.equal(policy, buildContentSecurityPolicy({ production: true }));
      assert.deepEqual(directive(policy, 'frame-ancestors'), ["'self'"]);
      assert.deepEqual(directive(policy, 'script-src-attr'), ["'none'"]);
      assert.ok(!directive(policy, 'script-src').includes("'unsafe-inline'"));
      assert.ok(!directive(policy, 'script-src').includes("'unsafe-eval'"));
      assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    });
  });
}

test('Firebase helper rewrite uses project hosting and preserves OAuth callback parameters', async () => {
  await withFirebaseEnvironment({}, async () => {
    const callback = new URL('/__/auth/handler', appOrigin);
    callback.searchParams.set('apiKey', 'public-test-key');
    callback.searchParams.set('authType', 'signInViaPopup');
    callback.searchParams.set('providerId', 'google.com');
    callback.searchParams.set('eventId', 'test-event-123');
    callback.searchParams.set('state', 'a+b/c==');
    callback.searchParams.set('redirectUrl', `${appOrigin}/auth?mode=signup&next=%2Fquiz`);
    const response = await configuredResponse(`${callback.pathname}${callback.search}`);
    const rewritten = new URL(getRewrittenUrl(response));
    assert.equal(rewritten.origin, `https://${projectId}.firebaseapp.com`);
    assert.equal(rewritten.pathname, '/__/auth/handler');
    assert.deepEqual([...rewritten.searchParams], [...callback.searchParams]);
    assert.equal(response.headers.get('location'), null);
  });
});

for (const [domain, expectedOrigin] of [
  ['skillbun.tech', 'https://skillbun.tech'],
  ['skillbun.vercel.app', 'https://skillbun.vercel.app'],
  ['skillbun-preview-123.vercel.app', 'https://skillbun-preview-123.vercel.app'],
  [undefined, `https://${projectId}.firebaseapp.com`],
]) {
  test(`App CSP permits the exact Firebase auth origin for ${domain || 'project fallback'}`, async () => {
    await withFirebaseEnvironment({ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: domain }, () => {
      const policy = buildContentSecurityPolicy({ nonce: 'authNonce123+/==', production: true });
      const frames = directive(policy, 'frame-src');
      assert.ok(frames.includes(expectedOrigin), `Missing configured Firebase auth origin: ${expectedOrigin}`);
      assert.ok(frames.includes(`https://${projectId}.firebaseapp.com`));
      assert.ok(!frames.includes('https://*.vercel.app'));
      assert.ok(!frames.includes('https://*.firebaseapp.com'));
      const scripts = directive(policy, 'script-src');
      assert.ok(scripts.includes("'nonce-authNonce123+/=='"));
      assert.ok(!scripts.includes("'unsafe-inline'"));
      assert.ok(!scripts.includes("'unsafe-eval'"));
      assert.deepEqual(directive(policy, 'frame-ancestors'), ["'self'"]);
    });
  });
}

test('Invalid auth-domain values cannot expand the application CSP', async () => {
  const baseline = await withFirebaseEnvironment({ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: undefined }, () => (
    buildContentSecurityPolicy({ nonce: 'safeNonce123', production: true })
  ));
  for (const domain of [
    '',
    'not a domain',
    'https://skillbun.tech',
    'http://skillbun.tech',
    '//skillbun.tech',
    'student@skillbun.tech',
    'skillbun.tech:443',
    'skillbun.tech/__/auth',
    'skillbun.tech?redirect=evil.test',
    'skillbun.tech#fragment',
    '*.skillbun.tech',
    'skillbun.tech https://evil.test',
    "skillbun.tech; script-src 'unsafe-inline' *",
    'skillbun.tech\r\nX-Injected: true',
    'skillbun..tech',
    '-skillbun.tech',
  ]) {
    await withFirebaseEnvironment({ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: domain }, () => {
      assert.equal(
        buildContentSecurityPolicy({ nonce: 'safeNonce123', production: true }),
        baseline,
        `Invalid auth domain changed the CSP: ${JSON.stringify(domain)}`,
      );
    });
  }
});
