export function buildContentSecurityPolicy({ nonce, production = process.env.NODE_ENV === 'production' } = {}) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'skillbun-75d10';
  let posthogOrigin = '';
  try {
    const host = new URL(process.env.NEXT_PUBLIC_POSTHOG_HOST);
    if (host.protocol === 'https:') posthogOrigin = ` ${host.origin}`;
  } catch { /* Optional analytics host is not configured. */ }
  if (nonce && !/^[A-Za-z0-9+/=_-]+$/.test(nonce)) throw new Error('Invalid CSP nonce');
  return [
    "default-src 'self'", "base-uri 'self'", "object-src blob:", "frame-ancestors 'self'",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://www.google-analytics.com https://*.google-analytics.com",
    "font-src 'self' data:", "style-src 'self' 'unsafe-inline'",
    `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ''}${production ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://*.posthog.com${posthogOrigin}`,
    "script-src-attr 'none'",
    `connect-src 'self'${production ? '' : ' ws://localhost:* http://localhost:*'} https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.posthog.com${posthogOrigin}`,
    `frame-src 'self' blob: data: https://${projectId}.firebaseapp.com https://challenges.cloudflare.com https://accounts.google.com https://www.youtube.com https://youtube.com`,
    "worker-src 'self' blob:", "form-action 'self'",
    ...(production ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}
