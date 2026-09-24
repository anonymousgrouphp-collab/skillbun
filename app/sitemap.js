import fs from 'fs';
import path from 'path';
import { getHreflangAlternates } from '@/utils/shared/i18n';

export const revalidate = 86400; // Revalidate sitemap once per day

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillbun.tech';
  const currentDate = new Date().toISOString();

  // Core static site routes
  const staticRouteDefs = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/roadmap', changeFrequency: 'daily', priority: 0.9 },
    { path: '/counsellor', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/quiz', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/projects', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticRoutes = staticRouteDefs.map((def) => {
    const fullUrl = `${baseUrl}${def.path}`;
    return {
      url: fullUrl,
      lastModified: currentDate,
      changeFrequency: def.changeFrequency,
      priority: def.priority,
      alternates: {
        languages: getHreflangAlternates(fullUrl),
      },
    };
  });

  // Dynamically load all 100 roadmap JSON slugs
  const roadmapsDir = path.join(process.cwd(), 'public', 'data', 'roadmaps');
  let roadmapRoutes = [];

  try {
    if (fs.existsSync(roadmapsDir)) {
      const files = fs.readdirSync(roadmapsDir);
      roadmapRoutes = files
        .filter((file) => file.endsWith('.json'))
        .flatMap((file) => {
          const slug = file.replace(/\.json$/, '');
          const roadmapUrl = `${baseUrl}/roadmap/${slug}`;
          const certifyUrl = `${baseUrl}/roadmap/${slug}/certify`;
          return [
            {
              url: roadmapUrl,
              lastModified: currentDate,
              changeFrequency: 'weekly',
              priority: 0.85,
              alternates: {
                languages: getHreflangAlternates(roadmapUrl),
              },
            },
            {
              url: certifyUrl,
              lastModified: currentDate,
              changeFrequency: 'monthly',
              priority: 0.75,
              alternates: {
                languages: getHreflangAlternates(certifyUrl),
              },
            },
          ];
        });
    }
  } catch (error) {
    console.error('Error generating sitemap roadmap routes:', error);
  }

  return [...staticRoutes, ...roadmapRoutes];
}
