/**
 * Apply Global Standard Data to All 100 Roadmaps
 * Preserves all existing skill trees, stages, resources, and IDs,
 * while enriching each roadmap with CTO-standard Goal, Learn, and Boost pillars.
 */

const fs = require('fs');
const path = require('path');

const { PART1_CATALOG } = require('./data/roadmapsGlobalCatalog_part1.js');
const { PART2_CATALOG } = require('./data/roadmapsGlobalCatalog_part2.js');
const { PART3_CATALOG } = require('./data/roadmapsGlobalCatalog_part3.js');
const { PART4_CATALOG } = require('./data/roadmapsGlobalCatalog_part4.js');

const CATALOG = {
  ...PART1_CATALOG,
  ...PART2_CATALOG,
  ...PART3_CATALOG,
  ...PART4_CATALOG
};

const ROADMAPS_DIR = path.join(process.cwd(), 'public', 'data', 'roadmaps');

function cleanRegionalPhrases(obj) {
  if (typeof obj === 'string') {
    return obj
      .replace(/in India\b/g, 'globally')
      .replace(/Indian cybersecurity landscape/g, 'global cybersecurity industry')
      .replace(/in the dynamic Indian context/g, 'in the global technology industry');
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanRegionalPhrases);
  }
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = cleanRegionalPhrases(v);
    }
    return res;
  }
  return obj;
}

function updateRoadmaps() {
  const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json')).sort();
  console.log(`Processing ${files.length} roadmaps...`);

  let updatedCount = 0;

  files.forEach(file => {
    const slug = file.replace('.json', '');
    const meta = CATALOG[slug];

    if (!meta) {
      console.error(`ERROR: No metadata found for ${slug}!`);
      process.exit(1);
    }

    const filePath = path.join(ROADMAPS_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    let original = JSON.parse(raw);

    // Deep clean any regional text in stages/tree
    original = cleanRegionalPhrases(original);

    // Build the enriched object in clean, canonical key order
    const updated = {
      id: original.id || slug,
      title: meta.title || original.title,
      description: meta.description || original.description,
      goal: meta.goal,
      learn: meta.learn,
      boost: meta.boost,
    };

    if (original.format) {
      updated.format = original.format;
    }

    if (original.tree) {
      updated.tree = original.tree;
    }

    if (original.stages) {
      updated.stages = original.stages;
    }

    // Preserve any extra custom root properties if they exist
    for (const [key, value] of Object.entries(original)) {
      if (!updated[key] && !['id', 'title', 'description', 'format', 'tree', 'stages'].includes(key)) {
        updated[key] = value;
      }
    }

    // Write formatted JSON
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
    updatedCount++;
  });

  console.log(`Successfully updated ${updatedCount} roadmaps to the global standard with /goal /learn /boost!`);
}

updateRoadmaps();
