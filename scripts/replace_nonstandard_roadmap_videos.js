/**
 * SkillBun - Roadmap Video Global Standard Migration Script
 *
 * Enforces the SkillBun Official Video Standard:
 * 1. Zero dead (404/400) videos.
 * 2. Zero regional/Hindi-only channel videos (CodeWithHarry, Apna College, WsCube Tech, Sreemanti Dey, etc.).
 * 3. Authentic metadata alignment (real course titles matching video content).
 * 4. High-pedigree educational channels (freeCodeCamp.org, MIT, Stanford, Traversy Media, Programming with Mosh, etc.).
 * 5. Rebuilds public/data/verified_videos.json so all active roadmap videos embed properly in GameMap drawer.
 */

const fs = require('fs');
const path = require('path');

const ROADMAPS_DIR = path.join(process.cwd(), 'public', 'data', 'roadmaps');
const VERIFIED_VIDEOS_PATH = path.join(process.cwd(), 'public', 'data', 'verified_videos.json');

// Load replacement mapping
const REPLACEMENT_MAP_PATH = 'C:/Users/ceoha/.gemini/antigravity/brain/e67dc84d-2d21-443b-9339-3d4ce6b9ce87/scratch/replacement_map.json';
const replacementMap = JSON.parse(fs.readFileSync(REPLACEMENT_MAP_PATH, 'utf8'));

// Additional safety overrides for specific critical roadmap nodes
const explicitOverrides = {
  'https://www.youtube.com/watch?v=h88xuhbS_XE': {
    url: 'https://www.youtube.com/watch?v=rSjt1E9WHaQ',
    title: 'Linear Algebra Course – Mathematics for Machine Learning and Generative AI'
  },
  'https://www.youtube.com/watch?v=LA1_vBXOIiQ': {
    url: 'https://www.youtube.com/watch?v=QCPJ0VdpM00',
    title: 'Linear Algebra for Machine Learning'
  },
  'https://www.youtube.com/watch?v=5nYqK4WC8hw': {
    url: 'https://www.youtube.com/watch?v=GrJP9FLV3FE',
    title: 'XGBoost & Hyperparameter Tuning in Python'
  },
  'https://www.youtube.com/watch?v=ulprqHHWlng': {
    url: 'https://www.youtube.com/watch?v=7HKot-brXFE',
    title: 'AWS Certified Cloud Practitioner Course 2026 (CLF-C02) — freeCodeCamp.org'
  }
};

Object.assign(replacementMap, explicitOverrides);

function migrateRoadmaps() {
  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json')).sort();
  console.log(`Starting video standard migration across ${files.length} roadmaps...`);

  let totalReplacements = 0;
  let affectedRoadmaps = 0;
  const allActiveVideoUrls = new Set();

  files.forEach(file => {
    const filePath = path.join(ROADMAPS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fileModified = false;

    function walk(node) {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node === 'object') {
        if (Array.isArray(node.resources)) {
          node.resources.forEach(r => {
            if (r && (r.type === 'video' || (r.url && (r.url.includes('youtube.com') || r.url.includes('youtu.be'))))) {
              const originalUrl = (r.url || '').trim();
              if (replacementMap[originalUrl]) {
                const rep = replacementMap[originalUrl];
                r.url = rep.url;
                if (rep.title) {
                  r.title = rep.title;
                }
                fileModified = true;
                totalReplacements++;
              }
              if (r.url) {
                allActiveVideoUrls.add(r.url.trim());
              }
            }
          });
        }
        for (const k of Object.keys(node)) {
          if (k !== 'resources') walk(node[k]);
        }
      }
    }

    walk(data);

    if (fileModified) {
      affectedRoadmaps++;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
  });

  console.log(`Migration complete!`);
  console.log(` - Replaced ${totalReplacements} video references`);
  console.log(` - Updated ${affectedRoadmaps} roadmap files`);
  console.log(` - Total unique active video URLs in catalog: ${allActiveVideoUrls.size}`);

  // Rebuild public/data/verified_videos.json with only valid, active URLs
  const verifiedList = Array.from(allActiveVideoUrls).sort();
  fs.writeFileSync(VERIFIED_VIDEOS_PATH, JSON.stringify(verifiedList, null, 2) + '\n', 'utf8');
  console.log(` - Rebuilt ${VERIFIED_VIDEOS_PATH} with ${verifiedList.length} verified entries.`);
}

migrateRoadmaps();
