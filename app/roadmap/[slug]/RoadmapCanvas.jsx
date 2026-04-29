'use client';
import { useState, useEffect, useRef } from 'react';
import './roadmap.css';

/* ── helpers ────────────────────────────────────────────── */
function isSafeExternalUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return false;
  try {
    return new Set(['https:', 'http:']).has(new URL(url).protocol);
  } catch {
    return false;
  }
}

function buildAskBunBotHref(topicName, roadmapTitle) {
  const params = new URLSearchParams({
    q: `Explain ${topicName} in simple terms`,
    context: `${roadmapTitle} Roadmap`,
  });
  return `/counsellor?${params.toString()}`;
}

/* Map common tech keywords → emoji icon */
const TECH_ICONS = {
  'node': '🟢', 'java': '☕', 'python': '🐍', 'javascript': '🟨', 'react': '⚛️',
  'express': '🚂', 'rest': '🔗', 'api': '🔌', 'sql': '🗃️', 'nosql': '🍃',
  'mongo': '🍃', 'postgres': '🐘', 'mysql': '🐬', 'git': '🔀', 'docker': '🐳',
  'cloud': '☁️', 'aws': '☁️', 'deploy': '🚀', 'test': '🧪', 'auth': '🔐',
  'security': '🛡️', 'css': '🎨', 'html': '📄', 'typescript': '🔷', 'next': '▲',
  'database': '💾', 'cache': '⚡', 'redis': '🔴', 'graphql': '◈', 'webpack': '📦',
  'linux': '🐧', 'nginx': '🟩', 'ci': '🔄', 'cd': '🔄', 'kubernetes': '☸️',
  'android': '🤖', 'kotlin': '🟣', 'swift': '🍎', 'flutter': '💙', 'firebase': '🔥',
  'frontend': '🖥️', 'backend': '⚙️', 'fullstack': '🏗️', 'design': '🎨',
  'ux': '👤', 'ui': '🖼️', 'data': '📊', 'ml': '🧠', 'ai': '🤖', 'cyber': '🔒',
  'pick': '🎯', 'language': '💬', 'framework': '🏗️', 'architecture': '🏛️',
  'project': '🚀', 'portfolio': '💼', 'job': '💼', 'interview': '🎤',
  'dsa': '🧮', 'algorithm': '📐', 'system': '🔧', 'network': '🌐',
};

function getTopicIcon(name) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(TECH_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📘';
}

/* ── component ──────────────────────────────────────────── */
export default function RoadmapCanvas({ roadmap, slug }) {
  const [savedProgress, setSavedProgress] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [justCompleted, setJustCompleted] = useState(null);  // for celebration animation
  const containerRef = useRef(null);

  const allTopics = roadmap.stages.flatMap(s => s.topics);
  const totalNodes = allTopics.length;
  const completedCount = allTopics.filter(t => savedProgress.includes(t.id)).length;
  const progressPct = totalNodes === 0 ? 0 : Math.round((completedCount / totalNodes) * 100);
  const xp = completedCount * 100;

  useEffect(() => {
    const storageKey = 'skillbun_progress_' + slug;
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedProgress(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedProgress([]);
    }
  }, [slug]);

  const toggleNode = (id) => {
    const storageKey = 'skillbun_progress_' + slug;
    let newProgress;
    if (savedProgress.includes(id)) {
      newProgress = savedProgress.filter(item => item !== id);
    } else {
      newProgress = [...savedProgress, id];
      setJustCompleted(id);
      setTimeout(() => setJustCompleted(null), 1500);
    }
    setSavedProgress(newProgress);
    localStorage.setItem(storageKey, JSON.stringify(newProgress));
  };

  const isCompleted = (id) => savedProgress.includes(id);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveNode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Calculate stage-level progress */
  function getStageProgress(stage) {
    const total = stage.topics.length;
    const done = stage.topics.filter(t => savedProgress.includes(t.id)).length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }

  /* Determine global index of a topic for numbering */
  let globalIdx = 0;

  return (
    <div className="rc-wrapper" ref={containerRef}>

      {/* Ambient background effects */}
      <div className="rc-ambient">
        <div className="rc-glow rc-glow-1"></div>
        <div className="rc-glow rc-glow-2"></div>
        <div className="rc-glow rc-glow-3"></div>
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="rc-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* ── Hero Header ── */}
      <div className="rc-hero">
        <div className="rc-hero-left">
          <div className="rc-hero-badge">🚀 LEARNING PATH</div>
          <h1 className="rc-hero-title">{roadmap.title}</h1>
          <p className="rc-hero-desc">{roadmap.description}</p>
          <div className="rc-hero-stats">
            <div className="rc-stat">
              <span className="rc-stat-value">{totalNodes}</span>
              <span className="rc-stat-label">Skills</span>
            </div>
            <div className="rc-stat-divider"></div>
            <div className="rc-stat">
              <span className="rc-stat-value">{completedCount}</span>
              <span className="rc-stat-label">Completed</span>
            </div>
            <div className="rc-stat-divider"></div>
            <div className="rc-stat">
              <span className="rc-stat-value rc-xp">{xp} XP</span>
              <span className="rc-stat-label">Earned</span>
            </div>
          </div>
        </div>
        <div className="rc-hero-right">
          <div className="rc-progress-circle">
            <svg viewBox="0 0 120 120">
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ECC71" />
                  <stop offset="100%" stopColor="#A8FF3E" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="52" className="rc-ring-bg" />
              <circle
                cx="60" cy="60" r="52"
                className="rc-ring-fill"
                strokeDasharray={`${(progressPct / 100) * 326.73} 326.73`}
                stroke="url(#progressGrad)"
              />
            </svg>
            <div className="rc-ring-text">
              <span className="rc-ring-pct">{progressPct}%</span>
              <span className="rc-ring-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skill Tree ── */}
      <div className="rc-tree">
        {/* Central spine with glow */}
        <div className="rc-spine">
          <div className="rc-spine-glow" style={{ height: `${progressPct}%` }}></div>
          {/* Animated dot traveling along spine */}
          <div className="rc-spine-dot" style={{ top: `${progressPct}%` }}></div>
        </div>

        {roadmap.stages.map((stage, sIdx) => {
          const stageProg = getStageProgress(stage);
          const stageComplete = stageProg === 100;

          return (
            <div className="rc-stage" key={sIdx}>
              {/* Stage header */}
              <div className={`rc-stage-header ${stageComplete ? 'complete' : ''}`}>
                <div className="rc-stage-icon">{sIdx + 1}</div>
                <div className="rc-stage-info">
                  <h2>{stage.title}</h2>
                  <div className="rc-stage-bar-track">
                    <div className="rc-stage-bar-fill" style={{ width: `${stageProg}%` }}></div>
                  </div>
                </div>
                {stageComplete && <div className="rc-stage-check">✅</div>}
              </div>

              {/* Topic nodes */}
              <div className="rc-nodes">
                {stage.topics.map((topic, tIdx) => {
                  const completed = isCompleted(topic.id);
                  const allPrevDone = tIdx === 0 || isCompleted(stage.topics[tIdx - 1]?.id);
                  const isNext = !completed && allPrevDone;
                  const icon = getTopicIcon(topic.name);
                  const currentGlobalIdx = ++globalIdx;

                  return (
                    <div
                      className={`rc-node ${tIdx % 2 === 0 ? 'left' : 'right'} ${completed ? 'done' : ''} ${isNext ? 'next' : ''} ${justCompleted === topic.id ? 'celebrating' : ''}`}
                      key={topic.id}
                      onClick={() => setActiveNode(topic)}
                    >
                      {/* Connector arm */}
                      <div className="rc-arm">
                        <div className="rc-arm-line"></div>
                        <div className="rc-arm-dot"></div>
                      </div>

                      {/* The node card */}
                      <div className="rc-node-card">
                        <div className="rc-node-card-inner">
                          <div className="rc-node-icon-wrap">
                            {completed ? (
                              <div className="rc-node-check">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            ) : (
                              <span className="rc-node-emoji">{icon}</span>
                            )}
                          </div>
                          <div className="rc-node-text">
                            <div className="rc-node-num">#{currentGlobalIdx}</div>
                            <h3>{topic.name}</h3>
                            <p className="rc-node-desc">{topic.description}</p>
                          </div>
                          {topic.tag === 'advanced' && (
                            <span className="rc-tag rc-tag-adv">⚡ ADV</span>
                          )}
                          <div className="rc-node-arrow">→</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone project */}
              {stage.project && (
                <div className="rc-milestone">
                  <div className="rc-milestone-inner">
                    <div className="rc-milestone-trophy">🏆</div>
                    <div className="rc-milestone-content">
                      <div className="rc-milestone-label">MILESTONE PROJECT</div>
                      <h3>{stage.project.title}</h3>
                      <p>{stage.project.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Detail Modal ── */}
      {activeNode && (
        <div className="rc-overlay" onClick={() => setActiveNode(null)}>
          <div className="rc-modal" onClick={e => e.stopPropagation()}>
            <button className="rc-modal-x" onClick={() => setActiveNode(null)}>✕</button>

            <div className="rc-modal-top">
              <span className="rc-modal-icon">{getTopicIcon(activeNode.name)}</span>
              <div>
                <h2>{activeNode.name}</h2>
                {activeNode.tag === 'advanced' && <span className="rc-tag rc-tag-adv">⚡ Advanced</span>}
              </div>
            </div>

            <p className="rc-modal-desc">{activeNode.description}</p>

            <button
              className={`rc-btn-complete ${isCompleted(activeNode.id) ? 'done' : ''}`}
              onClick={() => toggleNode(activeNode.id)}
            >
              {isCompleted(activeNode.id) ? '✅ Completed — Click to undo' : '🎯 Mark as Complete (+100 XP)'}
            </button>

            {activeNode.resources && activeNode.resources.length > 0 && (
              <div className="rc-modal-resources">
                <h4>📚 Learning Resources</h4>
                {activeNode.resources.filter(r => isSafeExternalUrl(r.url)).map((res, i) => (
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="rc-res-link" key={i}>
                    <span>{res.type === 'video' ? '📺' : '📖'}</span>
                    <span>{res.title}</span>
                    <span className="rc-res-arrow">↗</span>
                  </a>
                ))}
              </div>
            )}

            <a href={buildAskBunBotHref(activeNode.name, roadmap.title)} className="rc-btn-ai">
              🤖 Ask Bun-Bot about this
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
