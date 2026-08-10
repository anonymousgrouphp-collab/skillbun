'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import projectsData from '@/public/data/projects_curated.json';
import styles from './projects.module.css';
import posthog from 'posthog-js';

const DOMAIN_OPTIONS = [
  { key: 'all', label: '🌟 All Domains' },
  { key: 'frontend', label: '🎨 Frontend' },
  { key: 'backend', label: '⚙️ Backend' },
  { key: 'fullstack', label: '🚀 Full-Stack' },
  { key: 'ai_ml', label: '🤖 AI / ML' },
  { key: 'devops', label: '☁️ DevOps' },
  { key: 'mobile', label: '📱 Mobile' },
  { key: 'cybersecurity', label: '🔐 Cybersecurity' },
  { key: 'data_science', label: '📊 Data Science' },
];

const DIFFICULTY_OPTIONS = [
  { key: 'all', label: 'All Levels' },
  { key: 'Beginner', label: '🌱 Beginner' },
  { key: 'Intermediate', label: '⚡ Intermediate' },
  { key: 'Advanced', label: '🔥 Advanced' },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeModalProject, setActiveModalProject] = useState(null);

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      // Domain filter
      if (selectedDomain !== 'all' && project.domain !== selectedDomain) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && project.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = project.title.toLowerCase().includes(q);
        const matchesSummary = project.summary.toLowerCase().includes(q);
        const matchesTech = project.techStack.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesSummary || matchesTech;
      }
      return true;
    });
  }, [searchQuery, selectedDomain, selectedDifficulty]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleBadge}>
          <span>🔨 Hands-On Learning</span>
        </div>
        <h1 className={styles.title}>SkillBun Projects Hub</h1>
        <p className={styles.subtitle}>
          Explore real-world, portfolio-ready projects across engineering tracks. Build practical skills, follow step-by-step blueprints, and accelerate your career.
        </p>
      </header>

      {/* Quiz Banner */}
      <div className={styles.quizBanner}>
        <div className={styles.quizBannerContent}>
          <span className={styles.quizIcon}>🐰</span>
          <div>
            <div className={styles.quizBannerTitle}>Not sure which project fits your skill level?</div>
            <div className={styles.quizBannerDesc}>
              Take our 2-minute diagnostic career quiz to get personalized recommendations matched to your strengths.
            </div>
          </div>
        </div>
        <Link href="/onboarding?next=/quiz" className={styles.quizBtn}>
          ✨ Take Career Quiz
        </Link>
      </div>

      {/* Controls: Search & Filters */}
      <div className={styles.controls}>
        <div className={styles.searchBarWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search projects by title, keyword, or tech stack (e.g. React, Python, Docker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Domain Filter */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Domain:</span>
          {DOMAIN_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`${styles.filterChip} ${selectedDomain === opt.key ? styles.filterChipActive : ''}`}
              onClick={() => setSelectedDomain(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Level:</span>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`${styles.filterChip} ${selectedDifficulty === opt.key ? styles.filterChipActive : ''}`}
              onClick={() => setSelectedDifficulty(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className={styles.grid}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            let diffClass = styles.difficultyBeginner;
            if (project.difficulty === 'Intermediate') diffClass = styles.difficultyIntermediate;
            if (project.difficulty === 'Advanced') diffClass = styles.difficultyAdvanced;

            return (
              <div key={project.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardHeaderRow}>
                    <span className={styles.domainBadge}>{project.domain.replace('_', ' ')}</span>
                    <span className={`${styles.difficultyBadge} ${diffClass}`}>{project.difficulty}</span>
                  </div>

                  <h2 className={styles.projectTitle}>{project.title}</h2>
                  <p className={styles.projectSummary}>{project.summary}</p>

                  <div className={styles.timeTag}>
                    <span>⏱️ Est. Time:</span>
                    <span>{project.estimatedHours}</span>
                  </div>

                  <div className={styles.techStack}>
                    {project.techStack.map((tech) => (
                      <span key={tech} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => {
                      posthog.capture('project_blueprint_viewed', {
                        project_id: project.id,
                        project_domain: project.domain,
                        difficulty: project.difficulty,
                      });
                      setActiveModalProject(project);
                    }}
                  >
                    <span>📋 View Blueprint</span>
                  </button>
                  <Link href={`/roadmap/${project.roadmapSlug}`} className={styles.btnSecondary}>
                    <span>🗺️ Roadmap</span>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyBunny}>🐰🔍</div>
            <h3 className={styles.emptyTitle}>No matching projects found</h3>
            <p className={styles.emptyText}>Try searching for a different keyword or clearing your filters.</p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery('');
                setSelectedDomain('all');
                setSelectedDifficulty('all');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Modal View for Project Blueprint */}
      {activeModalProject && (
        <div className={styles.modalOverlay} onClick={() => setActiveModalProject(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setActiveModalProject(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={styles.domainBadge}>{activeModalProject.domain.replace('_', ' ')}</span>
                <span className={styles.difficultyBadge}>{activeModalProject.difficulty}</span>
              </div>
              <h2 className={styles.modalTitle}>{activeModalProject.title}</h2>
              <div className={styles.timeTag}>⏱️ Estimated duration: {activeModalProject.estimatedHours}</div>
            </div>

            <p className={styles.projectSummary}>{activeModalProject.summary}</p>

            <div className={styles.modalSectionTitle}>🛠️ Technologies & Tools</div>
            <div className={styles.techStack} style={{ marginBottom: '1.5rem' }}>
              {activeModalProject.techStack.map((tech) => (
                <span key={tech} className={styles.techTag}>
                  {tech}
                </span>
              ))}
            </div>

            <div className={styles.modalSectionTitle}>✅ Key Deliverables & Requirements</div>
            <ul className={styles.deliverablesList}>
              {activeModalProject.deliverables.map((item, index) => (
                <li key={index} className={styles.deliverableItem}>
                  <span className={styles.checkIcon}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <Link
                href={`/roadmap/${activeModalProject.roadmapSlug}`}
                className={styles.quizBtn}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                🗺️ Open Career Skill Tree
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
