import { NextResponse } from 'next/server'
import {
  getCounsellorAiProvider,
  getGeminiApiKey,
  getGroqApiKey,
  getHuggingFaceApiKey,
  getOpenRouterApiKey,
  getOllamaBaseUrl,
  getGeminiMaxRetries,
  getGeminiRateLimitPerHour,
  getGeminiRateLimitPerMinute,
  getGeminiRetryBaseDelayMs,
  getGeminiTimeoutMs,
} from '@/utils/server/env'
import { getFirebaseAdminAuth } from '@/utils/server/firebaseAdmin'
import { verifyHumanProofToken } from '@/utils/server/humanProof'
import { checkServerRateLimit } from '@/utils/server/rateLimitStore'
import { generateOfflineCounsellorResponse } from '@/utils/server/counsellor/offlineEngine'

const MAX_BODY_CHARS = 100_000
const MAX_CONTENT_ITEMS = 60
const MAX_PARTS_PER_MESSAGE = 12
const MAX_PART_TEXT_CHARS = 18_000

const RATE_LIMIT_BUCKETS = [
  { name: 'minute', windowMs: 60 * 1000, getLimit: getGeminiRateLimitPerMinute },
  { name: 'hour', windowMs: 60 * 60 * 1000, getLimit: getGeminiRateLimitPerHour },
]

function getClientAddress(request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || ''
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    forwardedFor.split(',')[0]?.trim() ||
    'local'
  )
}

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

async function verifyAuthenticatedUser(request) {
  const idToken = getBearerToken(request)

  if (!idToken) {
    return { error: NextResponse.json({ error: 'Login required.' }, { status: 401 }) }
  }

  try {
    const user = await getFirebaseAdminAuth().verifyIdToken(idToken)
    return { user }
  } catch {
    return { error: NextResponse.json({ error: 'Login required.' }, { status: 401 }) }
  }
}

function getRateLimitSubject(request, uid) {
  return `uid:${uid}:ip:${getClientAddress(request)}`
}

function validatePayload(body) {
  if (!body || typeof body !== 'object') {
    return 'Payload must be a JSON object.'
  }

  if (!Array.isArray(body.contents) || body.contents.length === 0) {
    return 'Conversation payload must include at least one message.'
  }

  if (body.contents.length > MAX_CONTENT_ITEMS) {
    return 'Conversation payload is too large.'
  }

  return ''
}

const ALL_SKILLBUN_ROADMAPS = [
  'ai_ml_engineer', 'ai_research_engineer', 'analytics_engineer', 'android', 'angular_developer', 'api_platform_engineer', 'application_security_engineer', 'ar_vr_developer', 'aws_cloud_engineer', 'azure_cloud_engineer', 'backend', 'bi_developer', 'blockchain_web3', 'business_analyst', 'c_cpp_systems_developer', 'cloud_architect', 'cloud_security_engineer', 'computer_vision_engineer', 'content_designer', 'cybersecurity', 'data_analyst', 'data_engineering', 'data_governance_specialist', 'data_science', 'data_visualization_specialist', 'database_admin', 'design_systems_engineer', 'desktop_app_developer', 'devops_cloud', 'dfir_analyst', 'digital_marketing_analyst', 'dotnet_developer', 'elixir_phoenix_developer', 'embedded_iot', 'finops_engineer', 'flutter_developer', 'frontend', 'fullstack', 'game_development', 'gcp_cloud_engineer', 'general', 'generative_ai_app_developer', 'geospatial_data_scientist', 'go_developer', 'graphql_api_developer', 'grc_analyst', 'iam_engineer', 'ios_developer', 'java_developer', 'kubernetes_engineer', 'linux_system_admin', 'llmops_engineer', 'macos_developer', 'malware_analyst', 'mlops_engineer', 'network_engineer', 'nextjs_developer', 'nlp_engineer', 'no_code_low_code_developer', 'observability_engineer', 'penetration_tester', 'php_laravel_developer', 'platform_engineer', 'product_designer', 'product_manager', 'prompt_engineer', 'python_developer', 'qa_automation', 'react_native_developer', 'recommendation_systems_engineer', 'red_team_operator', 'reinforcement_learning_engineer', 'release_engineer', 'robotics_engineer', 'rpa_developer', 'ruby_on_rails_developer', 'rust_developer', 'salesforce_developer', 'scala_developer', 'scrum_master_agile_coach', 'seo_specialist', 'serverless_developer', 'service_designer', 'shopify_developer', 'site_reliability_engineer', 'soc_analyst', 'speech_ai_engineer', 'svelte_developer', 'technical_artist', 'technical_support_engineer', 'technical_writing', 'terraform_iac_engineer', 'threat_intelligence_analyst', 'ui_ux_design', 'unity_developer', 'unreal_engine_developer', 'ux_researcher', 'vue_developer', 'windows_app_developer', 'wordpress_developer'
]

function formatRoadmapTitle(slug) {
  return slug
    .split('_')
    .map((w) => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function fetchFreeDuckDuckGoSearchContext(query) {
  if (!query || query.length < 3) return ''
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3_500)

  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    })

    if (!res.ok) return ''
    const html = await res.text()

    const snippets = []
    const regex = /<a class="result__snippet[^>]*>(.*?)<\/a>/g
    let match
    while ((match = regex.exec(html)) !== null && snippets.length < 3) {
      const cleanText = match[1].replace(/<[^>]+>/g, '').trim()
      if (cleanText) snippets.push(cleanText)
    }

    if (snippets.length === 0) return ''
    return `\nLIVE REALTIME WEB SEARCH DATA (FREE DUCKDUCKGO WEB SEARCH):
${snippets.map((s, i) => `- Result ${i + 1}: ${s}`).join('\n')}`
  } catch {
    return ''
  } finally {
    clearTimeout(timeout)
  }
}

async function retrieveSkillbunKnowledge(contents = []) {
  const lastMsg = contents.slice(-3).map((item) => {
    return Array.isArray(item?.parts) ? item.parts.map((p) => p?.text || '').join(' ') : ''
  }).join(' ').toLowerCase()

  const isIdentityOrTechStackQuery = /api|llm|model|gemini|gpt|chatgpt|openai|groq|llama|backend|architecture|how do you work|which model|who created you/i.test(lastMsg)

  let identitySnippet = ''
  if (isIdentityOrTechStackQuery) {
    identitySnippet = `\nCRITICAL IDENTITY MANDATE:
- You are ALWAYS "Bun-Bot", SkillBun's native AI Career Counsellor.
- You must NEVER state or imply that you use Gemini, Llama, OpenAI, ChatGPT, Groq, or any third-party API or LLM provider.
- If asked about APIs, models, backend technology, or how you work, ALWAYS answer: "I am Bun-Bot, SkillBun's custom AI Career Counsellor! I am powered directly by SkillBun's native career discovery engine built specifically for Indian tech students."\n`
  }

  // Non-Tech / Off-Topic Refusal Guard
  const OFF_TOPIC_REGEX = /chai|tea|recipe|cook|cricket|football|movie|song|poem|joke|weather|politics|love|dating|astrology|food/i;
  const IS_TECH_KEYWORD = /tech|code|program|developer|engineer|software|java|python|js|react|html|css|ai|ml|data|sql|cloud|aws|devops|roadmap|college|bca|btech|mca|job|career|salary|lpa|skillbun|contact|harsh/i;

  let domainRefusalSnippet = ''
  if (OFF_TOPIC_REGEX.test(lastMsg) && !IS_TECH_KEYWORD.test(lastMsg)) {
    domainRefusalSnippet = `\nSTRICT DOMAIN REFUSAL MANDATE:
- The user query is non-tech or off-topic (e.g. recipes, tea/chai, sports, general entertainment).
- YOU MUST STRICTLY REFUSE TO ANSWER with this exact message:
"I am Bun-Bot, SkillBun's AI Career Counsellor specialized strictly in tech careers, computer science, software engineering, and SkillBun roadmaps! 🤖\n\nThis question seems to be outside my scope of tech career guidance.\n\n💡 *If you think we made a mistake, please take a screenshot and email us at **harsh@skillbun.tech**.*"\n`
  }

  // Detect Live Web Search Intent (news, 2026, latest, current, trend, exam date, hiring)
  const requiresWebSearch = /latest|news|2025|2026|current|trend|update|cutoff|exam date|hiring|job market/i.test(lastMsg)
  let liveSearchSnippet = ''
  if (requiresWebSearch) {
    liveSearchSnippet = await fetchFreeDuckDuckGoSearchContext(lastMsg)
  }

  // Match user message against all 100 SkillBun roadmap slugs & keywords
  const matchedSlugs = ALL_SKILLBUN_ROADMAPS.filter((slug) => {
    const titleTokens = slug.split('_')
    return titleTokens.some((token) => token.length > 2 && lastMsg.includes(token))
  })

  const topMatches = matchedSlugs.slice(0, 4)

  if (topMatches.length === 0) {
    return `${identitySnippet}${domainRefusalSnippet}${liveSearchSnippet}\nSKILLBUN INTERNAL KNOWLEDGE (RAG RETRIEVED):
- Platform: SkillBun (AI-Powered Career Discovery Platform for Indian Tech Students)
- Key Roadmaps: 100 catalog roadmaps available including Frontend ([Frontend](/roadmap/frontend)), Fullstack ([Fullstack](/roadmap/fullstack)), AI/ML ([AI/ML](/roadmap/ai_ml_engineer)), Data Science ([Data Science](/roadmap/data_science)), DevOps ([DevOps](/roadmap/devops_cloud)), Cybersecurity ([Cybersecurity](/roadmap/cybersecurity)).
- Certification: Verifiable Certificates awarded upon reaching 60% roadmap progress & scoring 70%+ on proctored assessment (/roadmap/[slug]/certify).
- Support Contact: harsh@skillbun.tech`
  }

  const ragSnippets = topMatches.map((slug) => {
    const title = formatRoadmapTitle(slug)
    return `- SkillBun Track: ${title} | Roadmap Link: [${title}](/roadmap/${slug}) | Available on SkillBun`
  }).join('\n')

  return `${identitySnippet}${domainRefusalSnippet}${liveSearchSnippet}\nSKILLBUN INTERNAL KNOWLEDGE BASE (RETRIEVED FOR THIS USER QUERY):
${ragSnippets}
- SkillBun Platform Links: Always include the exact markdown roadmap links provided above in your response so students can click directly into SkillBun roadmaps!
- Support Contact: harsh@skillbun.tech`
}

async function convertContentsToOpenAiMessages(contents = []) {
  const ragContext = await retrieveSkillbunKnowledge(contents)
  const messages = []

  for (let i = 0; i < contents.length; i += 1) {
    const entry = contents[i]
    if (!entry || typeof entry !== 'object') continue
    const role = entry.role === 'model' ? 'assistant' : entry.role === 'user' ? 'user' : 'system'
    let text = Array.isArray(entry.parts)
      ? entry.parts.map((p) => p?.text || '').join('\n')
      : ''

    if (i === 0 && role === 'user') {
      text = `${text}\n\n${ragContext}`
    }

    if (text) {
      messages.push({ role, content: text })
    }
  }

  return messages
}

async function fetchGroqResponse(apiKey, contents) {
  const messages = await convertContentsToOpenAiMessages(contents)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.75,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`)
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchOpenRouterResponse(apiKey, contents) {
  const messages = await convertContentsToOpenAiMessages(contents)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages,
        temperature: 0.75,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`)
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchHuggingFaceResponse(apiKey, contents) {
  const messages = await convertContentsToOpenAiMessages(contents)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        messages,
        temperature: 0.75,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`HuggingFace HTTP ${res.status}`)
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchOllamaResponse(baseUrl, contents) {
  const messages = await convertContentsToOpenAiMessages(contents)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages,
        temperature: 0.75,
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchFreeOpenSourceLlamaResponse(contents) {
  const messages = await convertContentsToOpenAiMessages(contents)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Math.min(getGeminiTimeoutMs(), 10_000))

  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: 'openai',
      }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Free OpenSource LLM HTTP ${res.status}`)
    const text = await res.text()
    if (!text || text.includes('"error":')) return ''
    return text.trim()
  } catch (err) {
    console.warn('Free OpenSource LLM endpoint failed, falling back:', err?.message)
    return ''
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchGeminiResponse(apiKey, contents) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), getGeminiTimeoutMs())

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } finally {
    clearTimeout(timeout)
  }
}

function formatCounsellorResponse(text) {
  return {
    candidates: [
      {
        content: {
          parts: [{ text }],
        },
        finishReason: 'STOP',
      },
    ],
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuthenticatedUser(request)
    if (authResult.error) {
      return authResult.error
    }

    const token = request.headers.get('x-skillbun-human') || ''
    const verification = verifyHumanProofToken(token)

    if (!verification.valid) {
      return NextResponse.json({ error: 'Human verification required.' }, { status: 403 })
    }

    const rawBody = await request.text()
    if (rawBody.length > MAX_BODY_CHARS) {
      return NextResponse.json({ error: 'Conversation payload is too large.' }, { status: 400 })
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Payload must be valid JSON.' }, { status: 400 })
    }

    const validationError = validatePayload(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    let rateLimit
    try {
      rateLimit = await checkServerRateLimit({
        namespace: 'counsellor',
        subject: getRateLimitSubject(request, authResult.user.uid),
        limits: RATE_LIMIT_BUCKETS,
      })
    } catch (error) {
      console.error('Counsellor rate limit check failed:', error?.message || error)
      return NextResponse.json({ error: 'AI protection check is temporarily unavailable.' }, { status: 503 })
    }

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many AI requests at once. Please wait a moment.' },
        { status: 429 }
      )
    }

    const preferredProvider = getCounsellorAiProvider()
    const contents = body.contents || []
    const mode = body.mode || 'deep'

    let textResponse = ''

    // Fast Mode: Instant 0ms SkillBun Knowledge Engine
    if (mode === 'fast') {
      textResponse = generateOfflineCounsellorResponse(contents)
    }

    // Deep Mode: Execute based on preferred provider or auto fallback strategy
    if (!textResponse && mode === 'deep') {
      if (preferredProvider === 'groq' && getGroqApiKey()) {
        try { textResponse = await fetchGroqResponse(getGroqApiKey(), contents) } catch (e) { console.warn('Groq provider error:', e?.message) }
      } else if (preferredProvider === 'openrouter' && getOpenRouterApiKey()) {
        try { textResponse = await fetchOpenRouterResponse(getOpenRouterApiKey(), contents) } catch (e) { console.warn('OpenRouter provider error:', e?.message) }
      } else if (preferredProvider === 'huggingface' && getHuggingFaceApiKey()) {
        try { textResponse = await fetchHuggingFaceResponse(getHuggingFaceApiKey(), contents) } catch (e) { console.warn('HuggingFace provider error:', e?.message) }
      } else if (preferredProvider === 'ollama' && getOllamaBaseUrl()) {
        try { textResponse = await fetchOllamaResponse(getOllamaBaseUrl(), contents) } catch (e) { console.warn('Ollama provider error:', e?.message) }
      } else if (preferredProvider === 'gemini' && getGeminiApiKey()) {
        try { textResponse = await fetchGeminiResponse(getGeminiApiKey(), contents) } catch (e) { console.warn('Gemini provider error:', e?.message) }
      }
    }

    // Auto strategy: Try available free open-source provider first, then configured keys
    if (!textResponse && (preferredProvider === 'auto' || preferredProvider === 'free-opensource')) {
      // 1. Try Free Online Open-Source Llama 3.3 70B Model (Zero API key required!)
      try {
        textResponse = await fetchFreeOpenSourceLlamaResponse(contents)
      } catch (e) {
        console.warn('Free OpenSource Llama error:', e?.message)
      }

      // 2. Try configured provider keys if available
      if (!textResponse && getGroqApiKey()) {
        try { textResponse = await fetchGroqResponse(getGroqApiKey(), contents) } catch (e) {}
      }
      if (!textResponse && getHuggingFaceApiKey()) {
        try { textResponse = await fetchHuggingFaceResponse(getHuggingFaceApiKey(), contents) } catch (e) {}
      }
      if (!textResponse && getOpenRouterApiKey()) {
        try { textResponse = await fetchOpenRouterResponse(getOpenRouterApiKey(), contents) } catch (e) {}
      }
      if (!textResponse && getOllamaBaseUrl()) {
        try { textResponse = await fetchOllamaResponse(getOllamaBaseUrl(), contents) } catch (e) {}
      }
      if (!textResponse && getGeminiApiKey()) {
        try { textResponse = await fetchGeminiResponse(getGeminiApiKey(), contents) } catch (e) {}
      }
    }

    // Ultimate Zero-Failure Fallback: Offline SkillBun Knowledge Engine
    if (!textResponse) {
      textResponse = generateOfflineCounsellorResponse(contents)
    }

    return NextResponse.json(formatCounsellorResponse(textResponse))
  } catch (err) {
    console.error('Counsellor route error:', err?.message || err)
    // Always return valid offline knowledge response instead of 500 error
    const contents = []
    return NextResponse.json(formatCounsellorResponse(generateOfflineCounsellorResponse(contents)))
  }
}
