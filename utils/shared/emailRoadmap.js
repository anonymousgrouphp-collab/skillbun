export function normalizeEmailRoadmapSlug(value) {
  const slug = String(value ?? '').trim();
  return /^[a-z0-9][a-z0-9_-]{0,99}$/.test(slug) ? slug : '';
}

/** Count the same nodes as certification, including legacy stage projects. */
export function emailRoadmapContext(roadmap, completedNodeIds) {
  const ids = [];
  const walk = nodes => {
    for (const node of nodes) {
      if (node.countInProgress !== false) ids.push(node.id);
      if (Array.isArray(node.children)) walk(node.children);
    }
  };
  if (roadmap?.format === 'tree' && Array.isArray(roadmap.tree)) walk(roadmap.tree);
  else if (Array.isArray(roadmap?.stages)) {
    roadmap.stages.forEach((stage, index) => {
      walk(Array.isArray(stage.topics) ? stage.topics : []);
      if (stage.project) ids.push(`${roadmap.id || 'roadmap'}_stage_${stage.step || index + 1}_project`);
    });
  }
  const complete = Array.isArray(completedNodeIds) ? new Set(completedNodeIds) : null;
  return {
    totalTopics: ids.length || null,
    ...(complete ? { progressCount: ids.filter(id => complete.has(id)).length } : {}),
  };
}
