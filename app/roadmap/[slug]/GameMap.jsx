'use client';
import { useState, useEffect } from 'react';
import './roadmap.css';

function isSafeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try { return ['https:', 'http:'].includes(new URL(url).protocol); } catch { return false; }
}
function askBunBot(t, r) {
  return `/counsellor?${new URLSearchParams({ q: `Explain ${t} in simple terms`, context: `${r} Roadmap` })}`;
}

/* Flatten tree nodes for progress counting */
function flattenTree(nodes) {
  const result = [];
  function walk(list) {
    list.forEach(n => {
      if (n.countInProgress !== false) result.push(n);
      if (n.children?.length) walk(n.children);
    });
  }
  walk(nodes);
  return result;
}

function normalizeTopicNode(topic) {
  return {
    ...topic,
    tag: topic.tag || 'essential',
    resources: Array.isArray(topic.resources) ? topic.resources : [],
    children: Array.isArray(topic.children) ? topic.children.map(normalizeTopicNode) : [],
  };
}

function normalizeProjectNode(project, roadmapId, stage, index) {
  if (!project) return null;

  return {
    id: `${roadmapId}_stage_${stage.step || index + 1}_project`,
    name: `Project: ${project.title}`,
    icon: '🏆',
    tag: 'advanced',
    description: project.description || 'Build a portfolio-ready project for this stage.',
    resources: project.url ? [{ title: project.title, url: project.url, type: 'article' }] : [],
    children: [],
  };
}

function normalizeStageNode(stage, roadmapId, index) {
  const topics = Array.isArray(stage.topics) ? stage.topics.map(normalizeTopicNode) : [];
  const project = normalizeProjectNode(stage.project, roadmapId, stage, index);

  return {
    id: `${roadmapId}_stage_${stage.step || index + 1}`,
    name: stage.title,
    icon: stage.icon || '🎯',
    tag: 'essential',
    description: stage.description || `Complete the ${stage.title} branches before moving ahead.`,
    resources: [],
    children: project ? [...topics, project] : topics,
    countInProgress: false,
    unlockChildren: 'always',
  };
}

function normalizeRoadmapTree(roadmap) {
  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    return roadmap.tree.map(normalizeTopicNode);
  }

  if (Array.isArray(roadmap.stages)) {
    const roadmapId = roadmap.id || 'roadmap';
    return roadmap.stages.map((stage, index) => normalizeStageNode(stage, roadmapId, index));
  }

  return [];
}

const TREE_CARD_WIDTH = 270;
const TREE_ROOT_WIDTH = 420;
const TREE_GAP = 24;

function getLeafCount(node) {
  if (!node.children?.length) return 1;
  return node.children.reduce((sum, child) => sum + getLeafCount(child), 0);
}

function getBranchWidth(node, depth = 0) {
  const cardWidth = depth === 0 ? TREE_ROOT_WIDTH : TREE_CARD_WIDTH;
  if (!node.children?.length) return cardWidth;

  const childrenWidth = node.children.reduce((sum, child) => sum + getBranchWidth(child, depth + 1), 0);
  return Math.max(cardWidth, childrenWidth + TREE_GAP * (node.children.length - 1));
}

function getTerminalNodes(node) {
  if (!node.children?.length) return [node];
  return node.children.flatMap(child => getTerminalNodes(child));
}

export default function GameMap({ roadmap, slug }) {
  const [progress, setProgress] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [confetti, setConfetti] = useState(null);

  const roadmapTree = normalizeRoadmapTree(roadmap);
  const allNodes = flattenTree(roadmapTree);
  const total = allNodes.length;
  const doneCount = allNodes.filter(n => progress.includes(n.id)).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('skillbun_progress_' + slug);
      const p = raw ? JSON.parse(raw) : [];
      setProgress(Array.isArray(p) ? p : []);
    } catch { setProgress([]); }
  }, [slug]);

  const toggle = (id) => {
    const key = 'skillbun_progress_' + slug;
    const wasDone = progress.includes(id);
    const next = wasDone ? progress.filter(x => x !== id) : [...progress, id];
    if (!wasDone) { setConfetti(id); setTimeout(() => setConfetti(null), 1200); }
    setProgress(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const done = (id) => progress.includes(id);

  const isRootGateComplete = (node) => (
    node.children?.length ? getTerminalNodes(node).some(terminal => done(terminal.id)) : done(node.id)
  );

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') setExpanded(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* Render a tree node + its children recursively */
  function TreeNode({ node, depth = 0, parentUnlocked = true, parentDone = true }) {
    const isDone = done(node.id);
    const isUnlocked = parentUnlocked && (depth === 0 || parentDone);
    const isOpen = expanded === node.id;
    const isCelebrating = confetti === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const childrenUnlocked = node.unlockChildren === 'always' || isDone;
    const childCount = hasChildren ? node.children.length : 0;
    const childWidths = hasChildren ? node.children.map(child => getBranchWidth(child, depth + 1)) : [];
    const branchWidth = getBranchWidth(node, depth);
    const childColumns = childWidths.map((width, idx) => `minmax(${width}px, ${getLeafCount(node.children[idx])}fr)`).join(' ');
    const treeWidth = childWidths.length
      ? childWidths.reduce((sum, width) => sum + width, 0) + TREE_GAP * (childWidths.length - 1)
      : TREE_CARD_WIDTH;
    const lineLeft = childWidths.length ? childWidths[0] / 2 : 0;
    const lineRight = childWidths.length ? childWidths[childWidths.length - 1] / 2 : 0;
    const icon = node.icon || '📘';

    return (
      <div
        className={`sk-branch sk-branch-depth-${Math.min(depth, 3)}`}
        style={{ '--branch-width': `${branchWidth}px` }}
      >
        {/* This node */}
        <div className={`sk-node depth-${Math.min(depth, 3)} ${isDone ? 'done' : ''} ${isUnlocked ? '' : 'locked'} ${isCelebrating ? 'celebrate' : ''}`}>
          <div className="sk-node-card" onClick={() => setExpanded(isOpen ? null : node.id)}>
            <div className="sk-node-shimmer"></div>
            <div className="sk-node-row">
              <div className={`sk-node-icon ${isDone ? 'done' : ''}`}>{icon}</div>
              <div className="sk-node-info">
                <div className="sk-node-title-row">
                  <h3>{node.name}</h3>
                  {node.tag === 'advanced' && <span className="sk-pill adv">⚡ ADV</span>}
                  {node.tag === 'essential' && <span className="sk-pill ess">CORE</span>}
                </div>
                <p>{node.description}</p>
              </div>
              <div className="sk-node-actions">
                <button
                  className={`sk-check ${isDone ? 'done' : ''}`}
                  disabled={!isUnlocked}
                  onClick={(e) => { e.stopPropagation(); if (isUnlocked) toggle(node.id); }}
                  title={isUnlocked ? (isDone ? 'Undo' : 'Complete') : 'Complete prerequisite first'}
                >
                  {isDone ? '✓' : ''}
                </button>
                {(hasChildren || node.resources?.length > 0) && (
                  <span className={`sk-arrow ${isOpen ? 'open' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                )}
              </div>
            </div>
            {isOpen && (
              <div className="sk-detail">
                <button
                  className={`sk-btn-mark ${isDone ? 'done' : ''}`}
                  disabled={!isUnlocked}
                  onClick={(e) => { e.stopPropagation(); if (isUnlocked) toggle(node.id); }}
                >
                  {isUnlocked ? (isDone ? '✅ Completed — Undo?' : '🎯 Mark Complete (+100 XP)') : 'Complete prerequisite first'}
                </button>
                {node.resources?.filter(r => isSafeUrl(r.url)).length > 0 && (
                  <div className="sk-res-section">
                    <h4>📚 Resources</h4>
                    {node.resources.filter(r => isSafeUrl(r.url)).map((r, i) => (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="sk-res" key={i} onClick={e => e.stopPropagation()}>
                        <span className="sk-res-type">{r.type === 'video' ? '📺' : '📖'}</span>
                        <span>{r.title}</span>
                        <span className="sk-res-go">↗</span>
                      </a>
                    ))}
                  </div>
                )}
                <a href={askBunBot(node.name, roadmap.title)} className="sk-btn-ai" onClick={e => e.stopPropagation()}>🤖 Ask Bun-Bot</a>
              </div>
            )}
          </div>
          {/* Celebration */}
          {isCelebrating && (
            <div className="sk-confetti">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="sk-spark" style={{ '--angle': `${i * 36}deg`, '--dist': `${35 + Math.random() * 25}px`, background: ['#2ECC71','#A8FF3E','#FFD700','#58D68D'][i % 4] }}></span>
              ))}
            </div>
          )}
        </div>

        {/* Children branches */}
        {hasChildren && (
          <div className="sk-children">
            {/* Vertical connector from parent down */}
            <div className="sk-connector"></div>
            {/* Children row with horizontal line via ::before */}
            <div
              className={`sk-child-nodes ${childCount === 1 ? 'single-child' : ''}`}
              style={{
                '--child-count': childCount,
                '--child-columns': childColumns,
                '--tree-width': `${treeWidth}px`,
                '--line-left': `${lineLeft}px`,
                '--line-right': `${lineRight}px`,
              }}
            >
              {node.children.map(child => (
                <div className="sk-child-branch" key={child.id}>
                  <div className="sk-child-vline"></div>
                  <TreeNode node={child} depth={depth + 1} parentUnlocked={isUnlocked} parentDone={childrenUnlocked} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sk-wrapper">
      {/* Background */}
      <div className="sk-bg">
        <div className="sk-bg-orb sk-bg-1"></div>
        <div className="sk-bg-orb sk-bg-2"></div>
        <div className="sk-grid"></div>
        {['{ }','< />','( )','[ ]','=>','::','&&','||'].map((s, i) => (
          <span key={i} className="sk-float" style={{ left: `${5 + i * 12}%`, animationDelay: `${i * 1.5}s`, animationDuration: `${14 + i * 2}s` }}>{s}</span>
        ))}
      </div>

      {/* Hero */}
      <div className="sk-hero">
        <div className="sk-hero-glow"></div>
        <div className="sk-hero-inner">
          <div className="sk-hero-left">
            <div className="sk-badge">🌳 SKILL TREE</div>
            <h1 className="sk-title">{roadmap.title}</h1>
            <p className="sk-desc">{roadmap.description}</p>
            <div className="sk-stats">
              <div className="sk-stat"><span className="sk-stat-v">{total}</span><span className="sk-stat-l">Skills</span></div>
              <div className="sk-sep"></div>
              <div className="sk-stat"><span className="sk-stat-v">{doneCount}</span><span className="sk-stat-l">Done</span></div>
              <div className="sk-sep"></div>
              <div className="sk-stat"><span className="sk-stat-v sk-green">{doneCount * 100}</span><span className="sk-stat-l">XP</span></div>
            </div>
          </div>
          <div className="sk-hero-right">
            <div className="sk-ring">
              <svg viewBox="0 0 120 120">
                <defs><linearGradient id="skG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#2ECC71"/><stop offset="100%" stopColor="#A8FF3E"/></linearGradient></defs>
                <circle cx="60" cy="60" r="52" className="sk-ring-bg"/>
                <circle cx="60" cy="60" r="52" className="sk-ring-bar" stroke="url(#skG)" strokeDasharray={`${(pct/100)*326.73} 326.73`}/>
              </svg>
              <div className="sk-ring-txt"><span className="sk-ring-pct">{pct}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* The Skill Tree */}
      <div className="sk-tree-scroll">
        <div className="sk-tree">
          {roadmapTree.map((rootNode, idx) => {
            const rootUnlocked = idx === 0 || isRootGateComplete(roadmapTree[idx - 1]);

            return (
              <div className="sk-root-step" key={rootNode.id}>
                <TreeNode node={rootNode} depth={0} parentUnlocked={rootUnlocked} />
                {idx < roadmapTree.length - 1 && <div className="sk-step-connector" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
