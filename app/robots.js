export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillbun.tech';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
      {
        // Explicitly allow AI Search Engines & Knowledge Crawlers (GEO)
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'GoogleOther',
          'ChatGPT-User',
          'Bytespider',
          'CCBot',
          'Diffbot',
          'FacebookBot',
        ],
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
