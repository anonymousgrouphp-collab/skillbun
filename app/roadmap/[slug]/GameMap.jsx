'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import { readStoredRoadmapProgress } from '@/utils/shared/progressStore';
import { trackEvent } from '@/lib/analytics';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import connections from '../../../public/data/roadmap_connections.json';
import './roadmap.css';

function isSafeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return true;
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
const SPARK_COLORS = ['#2ECC71', '#A8FF3E', '#FFD700', '#58D68D'];
const SPARK_DISTANCES = [42, 55, 48, 60, 45, 57, 50, 62, 46, 54];

function readStoredProgress(slug) {
  return readStoredRoadmapProgress(slug);
}

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

export default function GameMap({ roadmap, slug, initialTab }) {
  const router = useRouter();
  const nextRoadmap = useMemo(() => connections[slug] || null, [slug]);
  const { user, authLoading, saveRoadmapProgress, progressVersion } = useAuth();
  const [progress, setProgress] = useState(() => readStoredProgress(slug));
  const [expanded, setExpanded] = useState(null);
  const [confetti, setConfetti] = useState(null);
  const [progressNotice, setProgressNotice] = useState('');
  const [selectedDocNode, setSelectedDocNode] = useState(null);
  const [verifiedVideos, setVerifiedVideos] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab && ['learn', 'goal', 'boost'].includes(initialTab)) {
      return initialTab;
    }
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.endsWith('/goal')) return 'goal';
      if (pathname.endsWith('/boost')) return 'boost';
      if (pathname.endsWith('/learn')) return 'learn';
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (['learn', 'goal', 'boost'].includes(tab)) return tab;
    }
    return 'learn';
  });

  useEffect(() => {
    const syncTab = () => {
      const pathname = window.location.pathname;
      const pathTab = pathname.endsWith('/goal')
        ? 'goal'
        : pathname.endsWith('/boost')
        ? 'boost'
        : pathname.endsWith('/learn')
        ? 'learn'
        : null;

      const params = new URLSearchParams(window.location.search);
      const tab = pathTab || params.get('tab');
      if (['learn', 'goal', 'boost'].includes(tab)) {
        setActiveTab(tab);
      } else {
        setActiveTab('learn');
      }
    };

    syncTab();
    window.addEventListener('popstate', syncTab);
    return () => window.removeEventListener('popstate', syncTab);
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const basePath = url.pathname.replace(/\/(goal|learn|boost)$/, '');
      url.searchParams.set('tab', newTab);
      window.history.pushState({ tab: newTab }, '', `${basePath}?tab=${newTab}`);
    }
  };


  useEffect(() => {
    fetch('/data/verified_videos.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVerifiedVideos(data);
        }
      })
      .catch(err => {
        console.error('Failed to load verified videos:', err);
      });
  }, []);

  useEffect(() => {
    if (slug) {
      trackEvent('roadmap_viewed', { slug, title: roadmap?.title || slug });
    }
  }, [slug, roadmap?.title]);

  const roadmapTree = useMemo(() => normalizeRoadmapTree(roadmap), [roadmap]);
  const allNodes = flattenTree(roadmapTree);
  const total = allNodes.length;
  const doneCount = allNodes.filter(n => progress.includes(n.id)).length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const toggle = async (id) => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setProgressNotice('Log in to save this roadmap to your SkillBun account.');
      router.push(`/auth?next=${encodeURIComponent(`/roadmap/${slug}`)}`);
      return;
    }

    const wasDone = progress.includes(id);
    const next = wasDone ? progress.filter(x => x !== id) : [...progress, id];
    const previous = progress;
    if (!wasDone) { setConfetti(id); setTimeout(() => setConfetti(null), 1200); }
    setProgress(next);
    setProgressNotice('');

    try {
      await saveRoadmapProgress(slug, next);
      if (!wasDone) {
        const completedNode = allNodes.find((node) => node.id === id);
        trackEvent('roadmap_node_completed', {
          roadmap_slug: slug,
          node_id: id,
          node_tag: completedNode?.tag || 'essential',
          completed_nodes: next.length,
          completion_percent: total === 0 ? 0 : Math.round((next.length / total) * 100),
        });
      }
    } catch (error) {
      console.error('Failed to save roadmap progress:', error);
      setProgress(previous);
      setProgressNotice('Could not save progress to Firebase. Please try again.');
    }
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

  useEffect(() => {
    setProgress(readStoredProgress(slug));
  }, [progressVersion, slug]);

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
                  disabled={!isUnlocked || authLoading}
                  onClick={(e) => { e.stopPropagation(); if (isUnlocked) toggle(node.id); }}
                  title={isUnlocked ? (user ? (isDone ? 'Undo' : 'Complete') : 'Log in to save progress') : 'Complete prerequisite first'}
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
                  disabled={!isUnlocked || authLoading}
                  onClick={(e) => { e.stopPropagation(); if (isUnlocked) toggle(node.id); }}
                >
                  {isUnlocked ? (isDone ? '✅ Completed — Undo?' : '🎯 Mark Complete (+100 XP)') : 'Complete prerequisite first'}
                </button>
                {node.resources?.filter(r => isSafeUrl(r.url)).length > 0 && (
                  <div className="sk-res-section">
                    <h4>📚 Resources</h4>
                    {node.resources.filter(r => isSafeUrl(r.url)).map((r, i) => (
                      <a
                        href={r.url}
                        target={r.type === 'doc' ? undefined : "_blank"}
                        rel="noopener noreferrer"
                        className={`sk-res ${r.type === 'doc' ? 'sk-res-doc-btn' : ''}`}
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (r.type === 'doc') {
                            e.preventDefault();
                            setSelectedDocNode({
                              topicId: node.id,
                              topicName: node.name,
                              topicDesc: node.description,
                              roadmapTitle: roadmap.title,
                              docUrl: r.url,
                              resources: node.resources,
                              isUnlocked: isUnlocked,
                              isDone: isDone,
                              nodeId: node.id
                            });
                          }
                        }}
                      >
                        <span className="sk-res-type" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {r.type === 'doc' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                          ) : r.type === 'video' ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="3" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          )}
                        </span>
                        {r.type === 'doc' ? (
                          <span className="sk-res-doc-title">
                            Study Guide by <span className="sk-brand-text">ꌗꀘꀤ꒒꒒ꌃꀎꈤ</span>
                          </span>
                        ) : (
                          <span>{r.title}</span>
                        )}
                        <span className="sk-res-go">{r.type === 'doc' ? '→' : '↗'}</span>
                      </a>
                    ))}
                  </div>
                )}
                <Link href={askBunBot(node.name, roadmap.title)} className="sk-btn-ai" onClick={e => e.stopPropagation()}>Ask BunBot</Link>
              </div>
            )}
          </div>
          {/* Celebration */}
          {isCelebrating && (
            <div className="sk-confetti">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="sk-spark" style={{ '--angle': `${i * 36}deg`, '--dist': `${SPARK_DISTANCES[i]}px`, background: SPARK_COLORS[i % SPARK_COLORS.length] }}></span>
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
            {progressNotice && <p className="sk-sync-note">{progressNotice}</p>}
            <div className="sk-cert-btn-container">
              {pct >= 60 ? (
                <button
                  className="sk-cert-btn unlocked"
                  onClick={() => router.push(`/roadmap/${slug}/certify`)}
                >
                  🏆 Get Certified — Take Quiz!
                </button>
              ) : (
                <button
                  className="sk-cert-btn locked"
                  disabled
                  title="Complete at least 60% of this roadmap to unlock the certification quiz!"
                >
                  🔒 Get Certified ({pct}%)
                </button>
              )}
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

      {/* Pillar Navigation Tabs: Learn, Goal, Boost */}
      <div className="sk-pillar-nav-wrapper">
        <div className="sk-pillar-nav" role="tablist" aria-label="Roadmap Pillars">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'learn'}
            className={`sk-pillar-tab ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => handleTabChange('learn')}
          >
            <span className="sk-pillar-tab-icon">📘</span>
            <span className="sk-pillar-tab-text">Learn</span>
            <span className="sk-pillar-tab-badge">{total} Nodes</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'goal'}
            className={`sk-pillar-tab ${activeTab === 'goal' ? 'active' : ''}`}
            onClick={() => handleTabChange('goal')}
          >
            <span className="sk-pillar-tab-icon">🎯</span>
            <span className="sk-pillar-tab-text">Goal</span>
            <span className="sk-pillar-tab-badge">Global $ & ₹</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'boost'}
            className={`sk-pillar-tab ${activeTab === 'boost' ? 'active' : ''}`}
            onClick={() => handleTabChange('boost')}
          >
            <span className="sk-pillar-tab-icon">🚀</span>
            <span className="sk-pillar-tab-text">Boost</span>
            <span className="sk-pillar-tab-badge">Projects & Certs</span>
          </button>
        </div>
      </div>

      {/* 1. LEARN TAB: The Interactive Skill Tree */}
      {activeTab === 'learn' && (
        <>
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

          {/* Next Recommended Roadmap */}
          {nextRoadmap && (
            <div className="sk-next-section">
              <div className="sk-next-label">Next Career Milestone</div>
              <button 
                className="sk-next-card"
                onClick={() => router.push(`/roadmap/${nextRoadmap.next}`)}
                title={`Go to ${nextRoadmap.title} Roadmap`}
              >
                <div className="sk-next-glow"></div>
                <div className="sk-next-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"/>
                  </svg>
                </div>
                <div className="sk-next-info">
                  <span className="sk-next-tag">Next Step</span>
                  <h3 className="sk-next-title">{nextRoadmap.title}</h3>
                </div>
                <div className="sk-next-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {/* 2. GOAL TAB: Career Mission & Global Dual-Currency Benchmarks */}
      {activeTab === 'goal' && (
        <div className="sk-pillar-panel sk-goal-panel">
          <div className="sk-panel-card sk-goal-hero-card">
            <div className="sk-panel-badge">🎯 CAREER OBJECTIVE</div>
            <h2>{roadmap.title} Mission</h2>
            <p className="sk-goal-lead">{roadmap.goal?.objective || roadmap.description}</p>
            <div className="sk-goal-meta-row">
              <span className="sk-pill ess">{roadmap.goal?.experience_level || 'Entry to Senior (0 - 5+ Years)'}</span>
              <span className="sk-pill adv">Global Tech Standard</span>
            </div>
          </div>

          <div className="sk-panel-card sk-salary-card">
            <div className="sk-panel-badge">💰 GLOBAL COMPENSATION BENCHMARKS</div>
            <h3>Dual-Currency Salary Spectrum</h3>
            <p className="sk-salary-sub">Calibrated benchmarks across remote engineering teams, Silicon Valley hubs, and regional tech ecosystems.</p>
            <div className="sk-salary-grid">
              <div className="sk-salary-box">
                <span className="sk-salary-tag">Big Tech & Global Remote</span>
                <div className="sk-salary-amount sk-green">
                  {roadmap.goal?.salary_range?.usd
                    ? `$${(roadmap.goal.salary_range.usd.min / 1000).toFixed(0)}k - $${(roadmap.goal.salary_range.usd.max / 1000).toFixed(0)}k`
                    : '$80k - $140k'}
                  <span className="sk-salary-period">/ yr USD</span>
                </div>
                <span className="sk-salary-note">Worldwide Remote & US / European Tech Hubs</span>
              </div>
              <div className="sk-salary-box">
                <span className="sk-salary-tag">Regional Tech Hubs</span>
                <div className="sk-salary-amount">
                  {roadmap.goal?.salary_range?.inr_lpa
                    ? `₹${roadmap.goal.salary_range.inr_lpa.min} - ₹${roadmap.goal.salary_range.inr_lpa.max}`
                    : '₹6 - ₹20'}
                  <span className="sk-salary-period">LPA (INR)</span>
                </div>
                <span className="sk-salary-note">India, APAC & Emerging Tech Startup Hubs</span>
              </div>
            </div>
          </div>

          {roadmap.goal?.target_roles?.length > 0 && (
            <div className="sk-panel-card">
              <div className="sk-panel-badge">💼 TARGET ROLES</div>
              <h3>Industry Job Titles</h3>
              <p className="sk-panel-desc">Key engineering roles hiring worldwide for this skill profile.</p>
              <div className="sk-role-pills">
                {roadmap.goal.target_roles.map((role, i) => (
                  <span key={i} className="sk-role-pill">
                    <span className="sk-role-bullet">•</span>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="sk-panel-card">
            <div className="sk-panel-badge">🏛️ ARCHITECTURAL PILLARS</div>
            <h3>Core Engineering Pillars</h3>
            <div className="sk-pillar-grid">
              {(roadmap.goal?.career_pillars || ['Foundational Systems', 'Architecture & Scale', 'Production Reliability']).map((pillar, i) => (
                <div key={i} className="sk-pillar-box">
                  <div className="sk-pillar-num">0{i + 1}</div>
                  <h4>{pillar}</h4>
                </div>
              ))}
            </div>
            {roadmap.learn?.summary && (
              <div className="sk-learn-summary-box">
                <p>{roadmap.learn.summary}</p>
              </div>
            )}
            <div className="sk-panel-action-row">
              <button
                type="button"
                className="sk-cert-btn unlocked"
                onClick={() => handleTabChange('learn')}
              >
                Explore Interactive Skill Tree (Learn) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOOST TAB: Projects, Certifications & Interview Prep */}
      {activeTab === 'boost' && (
        <div className="sk-pillar-panel sk-boost-panel">
          <div className="sk-panel-card sk-boost-hero-card">
            <div className="sk-panel-badge">🚀 CAREER ACCELERATION</div>
            <h2>Proof of Work & Portfolio Boost</h2>
            <p className="sk-goal-lead">Stand out to global engineering managers and technical recruiters with portfolio-grade capstones, industry certifications, and Bun-Bot interview preparation.</p>
          </div>

          <div className="sk-panel-card">
            <div className="sk-panel-badge">🏆 PORTFOLIO-GRADE CAPSTONES</div>
            <h3>Recommended Projects for {roadmap.title}</h3>
            <p className="sk-panel-desc">Production-grade deliverables to showcase genuine engineering depth on your GitHub profile and resume.</p>
            <div className="sk-project-list">
              {(roadmap.boost?.capstone_projects || []).map((proj, i) => (
                <div key={i} className="sk-project-item">
                  <div className="sk-project-header">
                    <h4>{proj.title}</h4>
                    <span className="sk-pill adv">Capstone #{i + 1}</span>
                  </div>
                  <p className="sk-project-desc">{proj.description}</p>
                  <div className="sk-project-tags">
                    {(proj.tech_stack || []).map((t, idx) => (
                      <span key={idx} className="sk-project-tag">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sk-boost-dual-grid">
            <div className="sk-panel-card">
              <div className="sk-panel-badge">📜 INDUSTRY CREDENTIALS</div>
              <h3>Globally Recognized Certifications</h3>
              <ul className="sk-bullet-list">
                {(roadmap.boost?.certifications || ['Standard Cloud Associate', 'Domain Professional']).map((cert, i) => (
                  <li key={i}>
                    <span className="sk-list-check">✓</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sk-panel-card">
              <div className="sk-panel-badge">⚡ INTERVIEW FOCUS</div>
              <h3>Key Technical Interview Topics</h3>
              <ul className="sk-bullet-list">
                {(roadmap.boost?.interview_focus || ['System Design', 'Algorithms & Problem Solving', 'Domain Depth']).map((topic, i) => (
                  <li key={i}>
                    <span className="sk-list-check">⚡</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sk-panel-card sk-cta-card">
            <div className="sk-panel-badge">🤖 MENTORSHIP & VERIFICATION</div>
            <h3>Ready to accelerate your {roadmap.title} journey?</h3>
            <p className="sk-panel-desc">Practice technical interview questions with Bun-Bot or take the official SkillBun proctored certification exam.</p>
            <div className="sk-cta-buttons">
              <Link
                href={`/counsellor?${new URLSearchParams({ q: `Simulate a technical interview for a ${roadmap.title} role. Ask me real interview questions one by one.`, context: `${roadmap.title} Roadmap` })}`}
                className="sk-btn-ai sk-cta-ai"
              >
                🤖 Simulate Interview with BunBot
              </Link>
              <Link
                href={`/roadmap/${slug}/certify`}
                className="sk-cert-btn unlocked sk-cta-cert"
              >
                🏆 Take Certification Exam
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Study Guide Drawer */}
      {selectedDocNode && (
        <StudyGuideDrawer
          key={selectedDocNode.docUrl}
          node={selectedDocNode}
          verifiedVideos={verifiedVideos}
          user={user}
          onClose={() => setSelectedDocNode(null)}
          onToggleComplete={() => {
            toggle(selectedDocNode.nodeId);
            setSelectedDocNode(prev => prev ? { ...prev, isDone: !prev.isDone } : null);
          }}
          authLoading={authLoading}
        />
      )}
    </div>
  );
}

// Slide-out Study Guide Drawer Component
function StudyGuideDrawer({ node, verifiedVideos, user, onClose, onToggleComplete, authLoading }) {
  const [docHtml, setDocHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    let active = true;

    // Extract slug and topicId from docUrl like "/data/docs/slug/topicId.md"
    const match = node.docUrl?.match(/\/data\/docs\/([^/]+)\/([^/]+)\.md$/);
    if (!match) {
      Promise.resolve().then(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
      return;
    }

    const [, slug, topicId] = match;

    // If user is not logged in, show login prompt
    if (!user) {
      Promise.resolve().then(() => {
        if (active) {
          setNeedsLogin(true);
          setLoading(false);
        }
      });
      return;
    }

    // Fetch from authenticated API route
    user.getIdToken().then(token => {
      return fetch(`/api/docs/${slug}/${topicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    })
      .then(res => {
        if (res.status === 401) {
          if (active) { setNeedsLogin(true); setLoading(false); }
          return null;
        }
        if (!res.ok) throw new Error('Failed to load study guide');
        return res.text();
      })
      .then(text => {
        if (text && active) {
          const parsed = marked.parse(text);
          const clean = DOMPurify.sanitize(parsed);
          setDocHtml(clean);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [node.docUrl, user]);

  const youtubeVideos = useMemo(() => {
    return (node.resources || []).filter(r => r.type === 'video' && (r.url.includes('youtube.com') || r.url.includes('youtu.be')));
  }, [node.resources]);

  const getEmbedUrl = (url) => {
    try {
      if (!verifiedVideos.includes(url)) {
        return null;
      }
      const u = new URL(url);
      if (u.hostname === 'youtu.be') {
        const videoId = u.pathname.substring(1);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      
      // Handle playlist URLs
      if (u.pathname.includes('/playlist')) {
        const listId = u.searchParams.get('list');
        return listId ? `https://www.youtube.com/embed/videoseries?list=${listId}` : null;
      }
      
      // Handle standard watch URLs
      const videoId = u.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="sk-drawer-overlay" onClick={onClose}>
      <div className="sk-drawer" onClick={e => e.stopPropagation()}>
        <div className="sk-drawer-header">
          <div className="sk-drawer-title-info">
            <h2>{node.topicName}</h2>
            <span className="sk-drawer-context">{node.roadmapTitle}</span>
          </div>
          <button className="sk-drawer-close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="sk-drawer-body">
          {/* Quick Actions */}
          <div className="sk-drawer-actions">
            <button
              className={`sk-btn-mark ${node.isDone ? 'done' : ''}`}
              disabled={!node.isUnlocked || authLoading}
              onClick={onToggleComplete}
            >
              {node.isUnlocked ? (node.isDone ? '✅ Completed — Undo?' : '🎯 Mark Complete (+100 XP)') : 'Complete prerequisite first'}
            </button>
            <Link href={askBunBot(node.topicName, node.roadmapTitle)} className="sk-btn-ai">
              Ask BunBot
            </Link>
          </div>

          {/* YouTube Video Resource */}
          {youtubeVideos.length > 0 && (
            <div className="sk-drawer-video-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="3" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                Video Tutorials
              </h3>
              {youtubeVideos.map((video, idx) => {
                const embedUrl = getEmbedUrl(video.url);
                return (
                  <div className="sk-video-container" key={idx}>
                    {embedUrl ? (
                      <iframe
                        width="100%"
                        height="240"
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="sk-res">
                        <span className="sk-res-type" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="15" x="2" y="3" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                        </span>
                        <span>{video.title}</span>
                        <span className="sk-res-go">↗</span>
                      </a>
                    )}
                    <span className="sk-video-title">{video.title}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Study Guide Content */}
          <div className="sk-drawer-doc-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              SkillBun Original Study Guide
            </h3>
            {loading ? (
              <div className="sk-drawer-loading">
                <div className="sk-spinner"></div>
                <p>Loading study guide...</p>
              </div>
            ) : needsLogin ? (
              <div className="sk-drawer-login-prompt">
                <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Study guides are available for logged-in students.
                </p>
                <a href="/auth" className="sk-btn-login">Log in to read this guide</a>
              </div>
            ) : error ? (
              <p className="sk-drawer-error">Could not load the study guide. Please try again or ask BunBot.</p>
            ) : (
              <div className="sk-markdown-content" dangerouslySetInnerHTML={{ __html: docHtml }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
