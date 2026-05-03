import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const ROADMAPS_DIR = path.join(process.cwd(), 'public', 'data', 'roadmaps');

let cachedRoadmaps = null;

function getRoadmaps() {
  if (cachedRoadmaps) return cachedRoadmaps;

  try {
    const files = fs.readdirSync(ROADMAPS_DIR);
    cachedRoadmaps = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const slug = file.replace('.json', '');
        try {
          const content = fs.readFileSync(path.join(ROADMAPS_DIR, file), 'utf-8');
          const json = JSON.parse(content);
          return { slug, title: json.title || slug, type: 'roadmap' };
        } catch {
          // Fallback if parsing fails
          const title = slug
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          return { slug, title, type: 'roadmap' };
        }
      });
    return cachedRoadmaps;
  } catch (error) {
    console.error('Failed to read roadmaps directory:', error);
    return [];
  }
}

const STATIC_PAGES = [
  { title: 'Home', href: '/', type: 'page' },
  { title: 'Features', href: '/#features', type: 'page' },
  { title: 'How it Works', href: '/#how', type: 'page' },
  { title: 'Career Paths', href: '/#careers', type: 'page' },
  { title: 'AI Counsellor', href: '/counsellor', type: 'page' },
  { title: 'Connect with us', href: '/#contact', type: 'page' },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  
  const query = q.toLowerCase().trim();
  const roadmaps = getRoadmaps();
  
  if (!query) {
    // Return some default suggestions when search is empty but focused
    return NextResponse.json({
      pages: STATIC_PAGES.slice(1, 5), // skip home
      roadmaps: roadmaps.slice(0, 6)
    });
  }

  const filteredPages = STATIC_PAGES.filter(p => p.title.toLowerCase().includes(query));
  const filteredRoadmaps = roadmaps.filter(r => r.title.toLowerCase().includes(query));

  return NextResponse.json({
    pages: filteredPages.slice(0, 4),
    roadmaps: filteredRoadmaps.slice(0, 8)
  });
}
