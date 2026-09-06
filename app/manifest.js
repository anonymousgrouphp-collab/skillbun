export default function manifest() {
  return {
    name: 'SkillBun – AI Career Roadmaps & Certifications',
    short_name: 'SkillBun',
    description: '100% Free AI-powered tech career discovery, interactive skill roadmaps, and verified digital certificates.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F7F2',
    theme_color: '#F4F7F2',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
