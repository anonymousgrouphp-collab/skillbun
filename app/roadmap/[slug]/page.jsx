import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import RoadmapGamifier from './RoadmapGamifier'

const ROADMAPS_DIR = path.join(process.cwd(), 'public', 'data', 'roadmaps')
const ROADMAP_SLUG_PATTERN = /^[a-z0-9_]+$/
const SAFE_EXTERNAL_PROTOCOLS = new Set(['https:', 'http:'])

function getRoadmapPath(slug) {
  if (typeof slug !== 'string' || !ROADMAP_SLUG_PATTERN.test(slug)) {
    return null
  }

  const roadmapPath = path.join(ROADMAPS_DIR, `${slug}.json`)
  const relativePath = path.relative(ROADMAPS_DIR, roadmapPath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null
  }

  return roadmapPath
}

function readRoadmap(slug) {
  const roadmapPath = getRoadmapPath(slug)

  if (!roadmapPath || !fs.existsSync(roadmapPath)) {
    return null
  }

  try {
    return JSON.parse(fs.readFileSync(roadmapPath, 'utf8'))
  } catch {
    return null
  }
}

function isSafeExternalUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return false
  }

  try {
    return SAFE_EXTERNAL_PROTOCOLS.has(new URL(url).protocol)
  } catch {
    return false
  }
}

function buildAskBunBotHref(topicName, roadmapTitle) {
  const params = new URLSearchParams({
    q: `Explain ${topicName} in simple terms`,
    context: `${roadmapTitle} Roadmap`,
  })

  return `/counsellor?${params.toString()}`
}

export function generateStaticParams() {
  return fs
    .readdirSync(ROADMAPS_DIR)
    .filter((fileName) => fileName.endsWith('.json'))
    .map((fileName) => ({ slug: fileName.replace(/\.json$/, '') }))
    .filter(({ slug }) => ROADMAP_SLUG_PATTERN.test(slug))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = readRoadmap(slug)

  if (!data) {
    return { title: 'Roadmap Not Found' }
  }

  return {
    title: `SkillBun - ${data.title} Roadmap`,
    description: data.description,
  }
}

export default async function RoadmapPage({ params }) {
  const { slug } = await params
  const data = readRoadmap(slug)

  if (!data) {
    notFound()
  }

  return (
    <RoadmapGamifier slug={slug}>
      <header className="roadmap-header">
        <h1 className="roadmap-title">{data.title}</h1>
        <p className="roadmap-desc">{data.description}</p>
      </header>

      <div className="timeline-container" id="timeline">
        {data.stages.map((stage, stageIndex) => (
          <div className="timeline-stage" key={stageIndex}>
            <div className="stage-marker">{stageIndex + 1}</div>
            <h2 className="stage-title">{stage.title}</h2>

            {stage.topics.map((topic) => (
              <div
                className={`topic-card ${topic.tag === 'advanced' ? 'topic-advanced' : ''}`}
                id={`card-topic-${topic.id}`}
                key={topic.id}
              >
                <div className="topic-header">
                  <div className="topic-title-area">
                    <input
                      type="checkbox"
                      className="checkbox-custom topic-checkbox"
                      data-id={topic.id}
                      id={`check-${topic.id}`}
                    />
                    <label htmlFor={`check-${topic.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <h3>{topic.name}</h3>
                      {topic.tag === 'advanced' ? (
                        <span className="badge badge-advanced">advanced</span>
                      ) : (
                        <span className="badge badge-essential">essential</span>
                      )}
                    </label>
                  </div>
                </div>

                <p>{topic.description}</p>

                <div className="resource-row">
                  {topic.resources?.filter((res) => isSafeExternalUrl(res.url)).map((res, i) => (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="resource-link" key={i}>
                      <span className="resource-icon">{res.type === 'video' ? 'Video' : 'Read'}</span> {res.title}
                    </a>
                  ))}
                  <a href={buildAskBunBotHref(topic.name, data.title)} className="btn-ask-ai">
                    Ask Bun-Bot
                  </a>
                </div>
              </div>
            ))}

            {stage.project && (
              <div className="project-card">
                <h3>Milestone Project: {stage.project.title}</h3>
                <p>{stage.project.description}</p>
                {isSafeExternalUrl(stage.project.url) && (
                  <a href={stage.project.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                    View Project Details
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </RoadmapGamifier>
  )
}
