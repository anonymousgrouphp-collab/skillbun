import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import RoadmapGamifier from './RoadmapGamifier'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const roadmapPath = path.join(process.cwd(), 'public', 'data', 'roadmaps', `${slug}.json`)
  if (!fs.existsSync(roadmapPath)) return { title: 'Roadmap Not Found' }

  const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'))
  return {
    title: `SkillBun – ${data.title} Roadmap`,
    description: data.description,
  }
}

export default async function RoadmapPage({ params }) {
  const { slug } = await params
  const roadmapPath = path.join(process.cwd(), 'public', 'data', 'roadmaps', `${slug}.json`)

  if (!fs.existsSync(roadmapPath)) {
    notFound()
  }

  const data = JSON.parse(fs.readFileSync(roadmapPath, 'utf8'))

  return (
    <>
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
                    {topic.resources && topic.resources.map((res, i) => (
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="resource-link" key={i}>
                        <span className="resource-icon">{res.type === 'video' ? '📺' : '📚'}</span> {res.title}
                      </a>
                    ))}
                    <a href={`/counsellor?q=Explain%20${encodeURIComponent(topic.name)}%20in%20simple%20terms&context=${encodeURIComponent(data.title)}%20Roadmap`} className="btn-ask-ai">
                      🤖 Ask Bun-Bot
                    </a>
                  </div>
                </div>
              ))}

              {stage.project && (
                <div className="project-card">
                  <h3>🚀 Milestone Project: {stage.project.title}</h3>
                  <p>{stage.project.description}</p>
                  {stage.project.url && (
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
    </>
  )
}
