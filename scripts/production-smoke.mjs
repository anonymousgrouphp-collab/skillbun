// Read-only release checks. Never prints response bodies, credentials or personal data.
const base = new URL(process.argv[2] || 'http://localhost:3000');
if (!['https:', 'http:'].includes(base.protocol)) throw new Error('Expected an HTTP(S) origin');
const checks = [
  ['/', [200]], ['/privacy', [200]], ['/robots.txt', [200]], ['/sitemap.xml', [200]],
  ['/manifest.json', [200]], ['/favicon.ico', [200]],
  ['/api/admin/certificates', [401, 403]],
  ['/api/admin/certificates?adminEmail=harsh%40skillbun.tech', [401, 403]],
  ['/api/alumni/documents?query=audit%40example.test', [401, 403]],
  ['/api/alumni/documents?query=sb%2Faudit%40example.test', [401, 403]],
  ['/api/quiz/questions', [401]], ['/api/docs/frontend_developer/test', [401]],
  ['/data/quizzes/fullstack.json', [404]], ['/data/%71uizzes/fullstack.json', [404]], ['/data/docs/test.md', [404]],
];
let failed = 0;
for (const [path, statuses] of checks) {
  try {
    const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(20000), redirect: 'manual' });
    let okay = statuses.includes(response.status);
    if (path === '/') {
      const csp = response.headers.get('content-security-policy') || '';
      const scripts = csp.split(';').find((item) => item.trim().startsWith('script-src ')) || '';
      okay &&= scripts.includes("'nonce-") && !/unsafe-inline|unsafe-eval/.test(scripts);
      okay &&= /no-store/.test(response.headers.get('cache-control') || '');
    }
    await response.body?.cancel();
    console.log(`${okay ? 'PASS' : 'FAIL'} ${path} HTTP ${response.status}`);
    if (!okay) failed++;
  } catch (error) { failed++; console.log(`FAIL ${path} ${error.name}`); }
}
process.exitCode = failed ? 1 : 0;
