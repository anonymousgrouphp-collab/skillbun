import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import GameMap from './GameMap'

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

  return <GameMap key={slug} roadmap={data} slug={slug} />
}
