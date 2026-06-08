const fs = require('fs');
const path = require('path');

const ROADMAPS_DIR = 'public/data/roadmaps';
const files = fs.readdirSync(ROADMAPS_DIR).filter(f => f.endsWith('.json'));

function getTopicsList(roadmap) {
  const list = [];
  function collect(node) {
    if (node.id && node.name) {
      list.push(node);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(collect);
    }
  }
  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    roadmap.tree.forEach(collect);
  } else if (Array.isArray(roadmap.stages)) {
    roadmap.stages.forEach(stage => {
      if (Array.isArray(stage.topics)) {
        stage.topics.forEach(collect);
      }
    });
  }
  return list;
}

const completed = [];
const remaining = [];

files.forEach(file => {
  const roadmapPath = path.join(ROADMAPS_DIR, file);
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'));
  const topics = getTopicsList(roadmap);
  if (topics.length === 0) return;
  const isComplete = topics.every(t => Array.isArray(t.resources) && t.resources.some(r => r.type === 'doc'));
  const slug = file.replace('.json', '');
  if (isComplete) {
    completed.push(slug);
  } else {
    remaining.push(slug);
  }
});

const jsonOutput = {
  total: files.length,
  completedCount: completed.length,
  remainingCount: remaining.length,
  completed: completed.sort(),
  remaining: remaining.sort()
};

fs.writeFileSync('public/data/roadmaps_status.json', JSON.stringify(jsonOutput, null, 2), 'utf8');

const mdOutput = `# SkillBun Roadmaps Content Status

This file tracks which roadmaps are 100% complete (fully enriched with "SkillBun Originals" study guides and YouTube links) and which ones are remaining.

## Overview
- **Total Roadmaps**: ${files.length}
- **Completed (100%)**: ${completed.length}
- **Remaining**: ${remaining.length}

---

## 🏆 Completed Roadmaps (${completed.length})
${completed.sort().map(s => `- [x] ${s}`).join('\n')}

---

## ⏳ Remaining Roadmaps (${remaining.length})
${remaining.sort().map(s => `- [ ] ${s}`).join('\n')}
`;

fs.writeFileSync('public/data/roadmaps_status.md', mdOutput, 'utf8');
console.log('Status files generated successfully in public/data/');
