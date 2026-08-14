import fs from 'fs';
import path from 'path';

export const revalidate = 86400; // Revalidate sitemap once per day

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillbun.tech';
  const currentDate = new Date().toISOString();

  // Core static site routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/counsellor`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

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
          return [
            {
              url: `${baseUrl}/roadmap/${slug}`,
              lastModified: currentDate,
              changeFrequency: 'weekly',
              priority: 0.85,
            },
            {
              url: `${baseUrl}/roadmap/${slug}/certify`,
              lastModified: currentDate,
              changeFrequency: 'monthly',
              priority: 0.75,
            },
          ];
        });
    }
  } catch (error) {
    console.error('Error generating sitemap roadmap routes:', error);
  }

  return [...staticRoutes, ...roadmapRoutes];
}
