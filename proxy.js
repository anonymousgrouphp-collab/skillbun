import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { buildContentSecurityPolicy } from './utils/server/contentSecurityPolicy.mjs';

export function proxy(request) {
  let pathname;
  try { pathname = decodeURIComponent(request.nextUrl.pathname); }
  catch { return new NextResponse(null, { status: 400 }); }
  // Static question banks and plaintext backups must never be downloadable.
  if (/^\/data\/(quizzes|docs)(\/|$)/i.test(pathname) || pathname === '/data/quizQuestions.json') {
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  const nonce = randomBytes(24).toString('base64');
  const policy = buildContentSecurityPolicy({ nonce });
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', policy);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/data/:path*', '/((?!api(?:/|$)|_next/|__/auth/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|woff2?|txt|xml|webmanifest)$).*)'],
};
