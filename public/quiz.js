// ===== QUIZ PAGE - Gemini API Integration =====

// --- State ---
let conversationHistory = [];
let questionCount = 0;
let totalQuestions = 15; // Initial estimate, AI may finish early or take longer
let lastSelectedOption = null; // stores last answer for retry
let userProfile = {};
let quizResults = null;

// --- Configuration ---
const SUPPORT_EMAIL = 'anonymousgrouphp@gmail.com';
const HUMAN_PROOF_HEADER = 'x-skillbun-human';

let securityConfig = {
    captchaEnabled: false,
    captchaSiteKey: ''
};
let humanProofToken = '';
let humanProofExpiresAt = 0;
let captchaWidgetId = null;
let captchaToken = '';

// --- SECURITY: Sanitize HTML to prevent XSS ---
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function setCaptchaStatus(message, tone) {
    const statusEl = document.getElementById('captchaStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.classList.remove('ok', 'error');
    if (tone === 'ok') statusEl.classList.add('ok');
    if (tone === 'error') statusEl.classList.add('error');
}

async function fetchSecurityConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) return;

        const data = await response.json();
        const captcha = data?.captcha || {};

        securityConfig.captchaEnabled = captcha.enabled === true && typeof captcha.siteKey === 'string' && captcha.siteKey.length > 0;
        securityConfig.captchaSiteKey = securityConfig.captchaEnabled ? captcha.siteKey : '';
    } catch (err) {
        securityConfig.captchaEnabled = false;
        securityConfig.captchaSiteKey = '';
    }
}

function loadTurnstileScript() {
    return new Promise((resolve, reject) => {
        if (window.turnstile) {
            resolve();
            return;
        }

        const existing = document.querySelector('script[data-turnstile="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Turnstile script'));
        document.head.appendChild(script);
    });
}

async function initCaptcha() {
    if (!securityConfig.captchaEnabled) return;

    const wrap = document.getElementById('captchaWrap');
    const widget = document.getElementById('captchaWidget');

    if (!wrap || !widget) return;

    wrap.style.display = 'block';
    setCaptchaStatus('Complete the verification below to start the quiz.');

    try {
        await loadTurnstileScript();
    } catch (err) {
        setCaptchaStatus('Captcha failed to load. Please refresh and try again.', 'error');
        return;
    }

    if (!window.turnstile) {
        setCaptchaStatus('Captcha unavailable. Please refresh and try again.', 'error');
        return;
    }

    captchaWidgetId = window.turnstile.render('#captchaWidget', {
        sitekey: securityConfig.captchaSiteKey,
        theme: 'dark',
        callback: (token) => {
            captchaToken = token;
            setCaptchaStatus('Verification complete. You can start now.', 'ok');
        },
        'expired-callback': () => {
            captchaToken = '';
            setCaptchaStatus('Verification expired. Please verify again.', 'error');
        },
        'error-callback': () => {
            captchaToken = '';
            setCaptchaStatus('Verification failed. Please retry.', 'error');
        }
    });
}

async function verifyHumanProof() {
    const now = Date.now();
    if (humanProofToken && humanProofExpiresAt > now + 10_000) {
        return true;
    }

    if (securityConfig.captchaEnabled && !captchaToken) {
        setCaptchaStatus('Please complete verification before starting.', 'error');
        return false;
    }

    const body = securityConfig.captchaEnabled ? { token: captchaToken } : {};

    try {
        const response = await fetch('/api/human/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            setCaptchaStatus('Verification failed. Please retry.', 'error');
            return false;
        }

        const data = await response.json();
        humanProofToken = data.humanToken || '';
        const parsedExpiresAt = Number.parseInt(data.expiresAt, 10);
        humanProofExpiresAt = Number.isFinite(parsedExpiresAt) ? parsedExpiresAt : 0;

        if (!humanProofToken) {
            setCaptchaStatus('Verification failed. Please retry.', 'error');
            return false;
        }

        if (securityConfig.captchaEnabled && window.turnstile && captchaWidgetId !== null) {
            window.turnstile.reset(captchaWidgetId);
            captchaToken = '';
        }

        return true;
    } catch (err) {
        setCaptchaStatus('Verification failed. Please check your internet and retry.', 'error');
        return false;
    }
}

function getStoredProfile() {
    const name = localStorage.getItem('sb_name') || '';
    const email = localStorage.getItem('sb_email') || '';
    const degree = localStorage.getItem('sb_degree') || '';
    const year = localStorage.getItem('sb_year') || '';
    return { name, email, degree, year };
}

function redirectToProfileSetup(destination) {
    window.location.href = `index.html?next=${encodeURIComponent(destination)}`;
}

// --- Load User Profile ---
function loadProfile() {
    const { name, email, degree, year } = getStoredProfile();
    if (!name || !email || !degree || !year) {
        redirectToProfileSetup('quiz.html');
        return false;
    }

    userProfile = { name, email, degree, year };

    document.getElementById('userName').textContent = name;
    document.getElementById('userBadge').textContent = `User: ${name}`;
    document.getElementById('welcomeProfile').innerHTML = `
    <div class="profile-tag">Degree: ${sanitize(degree)}</div>
    <div class="profile-tag">Year: ${sanitize(year)}</div>
  `;

    // Populate Dropdown Profile specific elements
    document.getElementById('dropdownName').textContent = name;
    document.getElementById('dropdownDegree').textContent = degree;
    document.getElementById('dropdownYear').textContent = year;
    return true;
}

// --- Menu Interactions ---
function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Close Dropdown when clicking outside
document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('userDropdown');
    const badge = document.getElementById('userBadge');

    // Only close if clicking outside the dropdown and outside the button
    if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(event.target) && event.target !== badge) {
        dropdown.classList.remove('show');
    }
});

// --- Logout functionality ---
function logoutUser() {
    // Clear the active session details from local storage
    localStorage.removeItem('sb_name');
    localStorage.removeItem('sb_email');
    localStorage.removeItem('sb_degree');
    localStorage.removeItem('sb_year');

    // Redirect back to homepage
    window.location.href = 'index.html';
}

// --- System Prompt ---
function getSystemPrompt() {
    return `You are SkillBun's Master AI Career Counselor — an elite, highly empathetic, and analytical career advisor specializing in the Indian tech industry.

STUDENT PROFILE:
- Name: ${userProfile.name}
- Degree: ${userProfile.degree}
- Current Year: ${userProfile.year}

YOUR GOAL:
Uncover the absolute perfect tech career for this specific student by acting as an expert diagnostician. Do not let them settle for generic answers.

THE 6 PILLARS OF TECH (Do not assume they want to code!):
1. Software Engineering (Logic, coding, building)
2. Data & AI (Math, patterns, analysis)
3. Design & UX (Empathy, visuals, psychology)
4. Product & Management (Business, leadership, communication)
5. Cloud & Infrastructure (Systems, architecture, reliability)
6. Cybersecurity (Protection, rules, hacking/defense)

PHASE 1 (Discovery):
Ask orthogonal (completely different) questions testing which of the 6 pillars they naturally belong to. Option A might be Data, Option B UX, Option C Code, Option D Management.

PHASE 2 (Narrowing):
Once a pillar is identified, abandon the others. Violently pivot into deep niche questions for that pillar (e.g., if Design -> UX vs UI vs Interaction Design).

RULES:
1. Ask exactly ONE question per response.
2. Provide exactly 4 options (A, B, C, D) representing distinct paths.
3. Every question MUST adapt dynamically based on previous answers.
4. Keep questions engaging, conversational, and tailored to the Indian tech market context.
5. NEVER assume 'Tech' means 'Software Developer'. Actively explore non-coding roles.
6. DYNAMIC LENGTH: Ask between 10 and 18 questions. Only output the final recommendation ("type": "result") when you have reached 95%+ confidence in the optimal career array. Do not stop at question 10 just to stop.

RESPONSE FORMAT (for questions):
You MUST respond in this exact JSON format, with no markdown, no code fences, just raw JSON:
{
  "type": "question",
  "phase": 1,
  "questionNumber": 1,
  "question": "Your question text here?",
  "options": [
    {"label": "A", "text": "Option A text"},
    {"label": "B", "text": "Option B text"},
    {"label": "C", "text": "Option C text"},
    {"label": "D", "text": "Option D text"}
  ]
}

RESPONSE FORMAT (for final recommendation):
{
  "type": "result",
  "careers": [
    {
      "rank": 1,
      "title": "Career Title",
      "matchPercent": 92,
      "description": "Why this is a great fit for them",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
      "salaryRange": "₹X - ₹Y LPA",
      "demand": "High/Medium/Growing",
      "nextSteps": "What they should do next",
      "roadmapUrl": "https://roadmap.sh/..."
    }
  ]
}

Provide exactly 3 careers in the final recommendation. Be specific to the Indian tech market.
For every career, provide the closest matching exact URL from roadmap.sh (e.g., https://roadmap.sh/frontend, https://roadmap.sh/backend, https://roadmap.sh/devops, https://roadmap.sh/ai-data-scientist, etc.) in the 'roadmapUrl' field. If no exact match exists, or if you are unsure, default to 'coming-soon.html'.
Start with the first question now.`;
}

// --- Gemini API Call ---
async function callGemini(userMessage) {
    const verified = await verifyHumanProof();
    if (!verified) {
        throw new Error('Human verification required');
    }

    // Build messages
    if (conversationHistory.length === 0) {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: getSystemPrompt() }]
        });
    } else if (userMessage) {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
    }

    const payload = {
        contents: conversationHistory,
        generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
        }
    };

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (humanProofToken) headers[HUMAN_PROOF_HEADER] = humanProofToken;

        const res = await fetch('/api/gemini', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'API request failed');
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error('Empty response from Gemini');

        // Add assistant response to history
        conversationHistory.push({
            role: 'model',
            parts: [{ text }]
        });

        // Robust JSON parsing
        return parseGeminiJSON(text);

    } catch (err) {
        console.error('Gemini API Error:', err);
        throw err;
    }
}

// --- Robust JSON Parser ---
function parseGeminiJSON(text) {
    // Try direct parse first
    try {
        return JSON.parse(text.trim());
    } catch (e) {
        console.debug('Direct JSON parse failed:', e.message);
    }

    // Strip markdown code fences
    let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.debug('Markdown stripped JSON parse failed:', e.message);
    }

    // Extract JSON object from anywhere in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.debug('Regex matched JSON parse failed:', e.message);
        }
    }

    // Last resort: find the first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(text.substring(firstBrace, lastBrace + 1));
        } catch (e) {
            console.debug('Substring JSON parse failed:', e.message);
        }
    }

    throw new Error('Could not parse Gemini response as JSON');
}

const ROADMAP_FALLBACK_URL = 'coming-soon.html';
const ROADMAP_HOSTS = new Set(['roadmap.sh', 'www.roadmap.sh']);
const KNOWN_ROADMAP_SLUGS = new Set([
    'frontend', 'backend', 'full-stack', 'devops', 'cyber-security',
    'ai-data-scientist', 'data-analyst', 'bi-analyst', 'data-engineer', 'machine-learning',
    'software-architect', 'software-design', 'system-design', 'computer-science', 'qa',
    'product-manager', 'ux-design', 'design-system', 'api-design',
    'android', 'ios', 'flutter', 'react-native', 'game-developer', 'blockchain',
    'javascript', 'typescript', 'node-js', 'react', 'vue', 'angular', 'nextjs',
    'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'php', 'kotlin', 'swift-ui',
    'sql', 'postgresql', 'mongodb', 'graphql', 'linux', 'kubernetes', 'docker', 'terraform',
    'aws', 'gcp', 'spring-boot', 'django', 'laravel', 'wordpress', 'shell-bash',
    'mlops', 'devsecops', 'elasticsearch', 'ai-agents', 'ai-red-teaming'
]);

const ROADMAP_SLUG_ALIASES = {
    fullstack: 'full-stack',
    'full-stack-developer': 'full-stack',
    nodejs: 'node-js',
    node: 'node-js',
    'node.js': 'node-js',
    golang: 'go',
    cplusplus: 'cpp',
    'c++': 'cpp',
    'c-plus-plus': 'cpp',
    cybersecurity: 'cyber-security',
    'cyber-security-specialist': 'cyber-security',
    'data-science': 'ai-data-scientist',
    'ml-engineer': 'machine-learning',
    'machine-learning-engineer': 'machine-learning',
    'ui-ux-design': 'ux-design',
    'uiux-design': 'ux-design',
    'business-intelligence': 'bi-analyst'
};

const ROADMAP_KEYWORD_RULES = [
    { slug: 'full-stack', keywords: ['full stack', 'full-stack', 'fullstack'] },
    { slug: 'frontend', keywords: ['frontend', 'front end', 'front-end', 'web ui', 'react', 'vue', 'angular'] },
    { slug: 'backend', keywords: ['backend', 'back end', 'back-end', 'server side', 'api developer', 'microservice'] },
    { slug: 'ai-data-scientist', keywords: ['ai engineer', 'artificial intelligence', 'data scientist', 'llm', 'genai', 'nlp', 'computer vision'] },
    { slug: 'machine-learning', keywords: ['machine learning', 'ml engineer', 'deep learning'] },
    { slug: 'data-analyst', keywords: ['data analyst', 'analytics', 'data analysis'] },
    { slug: 'bi-analyst', keywords: ['business intelligence', 'bi analyst', 'power bi', 'tableau'] },
    { slug: 'data-engineer', keywords: ['data engineer', 'etl', 'data pipeline'] },
    { slug: 'cyber-security', keywords: ['cyber security', 'cybersecurity', 'ethical hacking', 'penetration tester', 'soc analyst', 'infosec'] },
    { slug: 'devops', keywords: ['devops', 'site reliability', 'sre', 'cloud engineer', 'kubernetes', 'docker', 'ci/cd'] },
    { slug: 'software-architect', keywords: ['software architect', 'solution architect'] },
    { slug: 'product-manager', keywords: ['product manager', 'product management', 'product owner'] },
    { slug: 'ux-design', keywords: ['ux design', 'ui ux', 'ui/ux', 'product design', 'interaction design'] },
    { slug: 'qa', keywords: ['qa engineer', 'quality assurance', 'software testing', 'automation testing', 'test engineer'] },
    { slug: 'android', keywords: ['android'] },
    { slug: 'ios', keywords: ['ios', 'swift'] },
    { slug: 'flutter', keywords: ['flutter'] },
    { slug: 'react-native', keywords: ['react native'] },
    { slug: 'game-developer', keywords: ['game developer', 'game development', 'unity', 'unreal'] },
    { slug: 'blockchain', keywords: ['blockchain', 'web3', 'smart contract'] },
    { slug: 'computer-science', keywords: ['software engineer', 'computer science engineer'] }
];

function normalizeRoadmapSlug(value) {
    if (!value) return '';

    let slug = String(value).trim().toLowerCase();
    slug = slug.split('?')[0].split('#')[0];
    slug = slug.replace(/^\/+|\/+$/g, '');
    slug = slug.replace(/_/g, '-').replace(/\s+/g, '-');

    const segments = slug.split('/').filter(Boolean);
    if (segments.length > 0) {
        if ((segments[0] === 'roadmaps' || segments[0] === 'roadmap') && segments[1]) {
            slug = segments[1];
        } else {
            slug = segments[0];
        }
    }

    return ROADMAP_SLUG_ALIASES[slug] || slug;
}

function extractRoadmapSlug(rawUrl) {
    if (typeof rawUrl !== 'string') return '';
    const input = rawUrl.trim();
    if (!input || input === ROADMAP_FALLBACK_URL) return '';

    if (/^https?:\/\//i.test(input)) {
        try {
            const parsed = new URL(input);
            if (!ROADMAP_HOSTS.has(parsed.hostname.toLowerCase())) return '';
            return normalizeRoadmapSlug(parsed.pathname);
        } catch (err) {
            return '';
        }
    }

    return normalizeRoadmapSlug(input);
}

function inferRoadmapSlugFromCareer(career) {
    const parts = [career?.title, career?.description, ...(Array.isArray(career?.skills) ? career.skills : [])]
        .filter(part => typeof part === 'string' && part.trim().length > 0);
    const text = parts.join(' ').toLowerCase();
    if (!text) return '';

    for (const rule of ROADMAP_KEYWORD_RULES) {
        if (rule.keywords.some(keyword => text.includes(keyword))) {
            return rule.slug;
        }
    }

    return '';
}

function resolveRoadmapUrl(career) {
    const fromAiUrl = extractRoadmapSlug(career?.roadmapUrl);
    if (fromAiUrl && KNOWN_ROADMAP_SLUGS.has(fromAiUrl)) {
        return `https://roadmap.sh/${fromAiUrl}`;
    }

    const fromKeywords = inferRoadmapSlugFromCareer(career);
    if (fromKeywords && KNOWN_ROADMAP_SLUGS.has(fromKeywords)) {
        return `https://roadmap.sh/${fromKeywords}`;
    }

    return ROADMAP_FALLBACK_URL;
}

function normalizeSkills(skills) {
    if (Array.isArray(skills)) {
        return skills
            .map(skill => String(skill || '').trim())
            .filter(Boolean)
            .slice(0, 8);
    }

    if (typeof skills === 'string' && skills.trim()) {
        return skills
            .split(/[,|/]/g)
            .map(skill => skill.trim())
            .filter(Boolean)
            .slice(0, 8);
    }

    return [];
}

function normalizeCareerEntry(career, index) {
    if (!career || typeof career !== 'object') return null;

    const title = String(career.title || '').trim();
    if (!title) return null;

    const matchRaw = Number.parseInt(career.matchPercent, 10);
    const matchPercent = Number.isFinite(matchRaw) ? Math.max(0, Math.min(matchRaw, 100)) : Math.max(60, 95 - index * 5);

    return {
        title,
        description: String(career.description || 'Recommended based on your quiz answers.').trim(),
        skills: normalizeSkills(career.skills),
        salaryRange: String(career.salaryRange || 'Varies by role and experience').trim(),
        demand: String(career.demand || 'Growing').trim(),
        nextSteps: String(career.nextSteps || 'Start with the roadmap and build small projects.').trim(),
        matchPercent,
        roadmapUrl: String(career.roadmapUrl || '').trim()
    };
}

function extractCareers(response) {
    if (!response) return [];

    let rawCareers = [];
    if (Array.isArray(response.careers)) {
        rawCareers = response.careers;
    } else if (response.careers && typeof response.careers === 'object') {
        rawCareers = Object.values(response.careers);
    } else if (Array.isArray(response.results)) {
        rawCareers = response.results;
    }

    return rawCareers
        .map((career, index) => normalizeCareerEntry(career, index))
        .filter(Boolean);
}

// --- Load More Careers ---
async function loadMoreCareers() {
    const loadBtn = document.getElementById('loadMoreBtn');
    if (!loadBtn) return;
    loadBtn.textContent = '⏳ Finding more paths...';
    loadBtn.disabled = true;

    try {
        const response = await callGemini(
            'Based on our conversation, suggest 3 MORE different career paths that could also be a good fit. Provide careers that are DIFFERENT from the ones you already recommended. Use the same JSON result format with "type": "result". Make sure to include the "roadmapUrl" field for each career. Default to "coming-soon.html" if no exact roadmap.sh URL matches.'
        );

        const container = document.getElementById('resultCards');
        let careers = extractCareers(response);

        if (careers.length === 0) {
            const strictResponse = await callGemini(
                'Return only JSON with {"type":"result","careers":[...]} and exactly 3 unique careers. Keep fields: title, matchPercent, description, skills, salaryRange, demand, nextSteps, roadmapUrl.'
            );
            careers = extractCareers(strictResponse);
        }

        if (careers.length === 0) {
            throw new Error('No career paths returned');
        }

        const existingTitles = new Set(
            Array.from(container.querySelectorAll('.result-card h3')).map(el => el.textContent.trim().toLowerCase())
        );
        const uniqueCareers = careers.filter(career => !existingTitles.has(career.title.toLowerCase()));

        if (uniqueCareers.length === 0) {
            loadBtn.textContent = '✅ No More Unique Paths';
            loadBtn.disabled = false;
            setTimeout(() => { loadBtn.textContent = '🔍 Load More Career Paths'; }, 2000);
            return;
        }

        const existingCount = container.children.length;
        uniqueCareers.forEach((career, i) => {
            container.insertAdjacentHTML('beforeend', renderCareerCard(career, existingCount + i + 1));
        });

        // Animate new cards in
        const newCards = container.querySelectorAll('.result-card.new:not(.visible)');
        newCards.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), i * 200);
        });

        loadBtn.textContent = '🔍 Load More Career Paths';
        loadBtn.disabled = false;

    } catch (err) {
        loadBtn.textContent = '❌ Failed — Try Again';
        loadBtn.disabled = false;
        setTimeout(() => { loadBtn.textContent = '🔍 Load More Career Paths'; }, 2000);
    }
}

// --- Render Career Card ---
function renderCareerCard(career, index) {
    const medalEmojis = ['🥇', '🥈', '🥉', '🏅', '⭐', '✨', '💎', '🎯', '🚀'];
    const medal = medalEmojis[index - 1] || '⭐';

    return `
    <div class="result-card new" style="animation-delay:${(index - 1) * 0.15}s">
      <div class="result-card-header">
        <span class="result-medal">${medal}</span>
        <span class="result-match">${sanitize(String(career.matchPercent))}% Match</span>
      </div>
      <h3>${sanitize(career.title)}</h3>
      <p class="result-desc">${sanitize(career.description)}</p>
      <div class="result-meta">
        <span class="result-tag salary">💰 ${sanitize(career.salaryRange)}</span>
        <span class="result-tag demand">📈 ${sanitize(career.demand)} Demand</span>
      </div>
      <div class="result-skills">
        <h4>Key Skills</h4>
        <div class="skill-pills">
          ${(career.skills || []).map(s => `<span class="skill-pill">${sanitize(s)}</span>`).join('')}
        </div>
      </div>
      <div class="result-next">
        <h4>Next Steps</h4>
        <p>${sanitize(career.nextSteps)}</p>
      </div>

      <div class="result-action-link" style="margin-top: 1rem; text-align: right;">
        ${(() => {
            const finalUrl = resolveRoadmapUrl(career);
            const isExternal = finalUrl.startsWith('https://roadmap.sh/');

            return `
            <a href="${sanitize(finalUrl)}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''} class="btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; text-decoration: none; font-size: 0.9rem;">
                🗺️ Dive Deeper Roadmap
            </a>
          `;
        })()}
      </div>
    </div>
  `;
}

// --- Update Progress ---
function updateProgress(qNum, phase) {
    document.getElementById('qNum').textContent = qNum;

    // Dynamic total length
    if (qNum > totalQuestions) totalQuestions = qNum + 1;
    document.getElementById('qTotal').textContent = totalQuestions;

    // Progress bar fill
    const percent = Math.min((qNum / totalQuestions) * 100, 100);
    document.getElementById('progressFill').style.width = `${percent}%`;

    const phaseNames = {
        1: '🔍 Phase 1: Discovery',
        2: '🎯 Phase 2: Narrowing Down',
        3: '🚀 Phase 3: Deep Dive'
    };

    // If the AI creates a phase 4 or higher dynamically, keep it exciting
    document.getElementById('quizPhase').textContent = phaseNames[phase] || '✨ Phase: Finalizing Match';
}

// --- Show Question ---
function showQuestion(data) {
    questionCount = data.questionNumber || questionCount + 1;
    updateProgress(questionCount, data.phase || 1);

    // Animate question text
    const qText = document.getElementById('questionText');
    qText.style.opacity = '0';
    setTimeout(() => {
        qText.textContent = data.question;
        qText.style.opacity = '1';
    }, 200);

    // Render options
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    container.style.opacity = '0';

    setTimeout(() => {
        data.options.forEach((opt, i) => {
            const optEl = document.createElement('button');
            optEl.className = 'quiz-option';
            optEl.style.animationDelay = `${i * 0.1}s`;
            optEl.innerHTML = `
        <span class="option-label">${sanitize(opt.label)}</span>
        <span class="option-text">${sanitize(opt.text)}</span>
      `;
            optEl.addEventListener('click', () => selectOption(opt, optEl));
            container.appendChild(optEl);
        });
        container.style.opacity = '1';
    }, 300);
}

// --- Select Option ---
async function selectOption(option, element) {
    lastSelectedOption = option; // store for retry
    // Visual feedback
    document.querySelectorAll('.quiz-option').forEach(el => {
        el.classList.remove('selected');
        el.disabled = true;
    });
    element.classList.add('selected');

    // Show loading
    setTimeout(async () => {
        document.getElementById('optionsContainer').style.display = 'none';
        document.getElementById('quizLoading').style.display = 'flex';

        try {
            const response = await callGemini(`My answer: ${option.label}. ${option.text}`);

            document.getElementById('quizLoading').style.display = 'none';
            document.getElementById('optionsContainer').style.display = 'grid';

            if (response.type === 'result') {
                showResults(response);
            } else {
                showQuestion(response);
            }
        } catch (err) {
            document.getElementById('quizLoading').style.display = 'none';
            document.getElementById('optionsContainer').style.display = 'grid';
            showErrorUI();
        }
    }, 500);
}

// --- Show Results ---
function showResults(data) {
    quizResults = data;

    document.getElementById('quizScreen').style.display = 'none';
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.style.display = 'block';

    const container = document.getElementById('resultCards');
    container.innerHTML = '';

    const careers = extractCareers(data);
    if (careers.length === 0) {
        container.innerHTML = `
      <div class="result-card visible">
        <h3>Unable to Load Career Paths</h3>
        <p class="result-desc">We could not parse the AI response. Please tap Retake Quiz and try again.</p>
      </div>
    `;
        return;
    }

    careers.forEach((career, i) => {
        container.insertAdjacentHTML('beforeend', renderCareerCard(career, i + 1));
    });

    // Animate cards in
    setTimeout(() => {
        document.querySelectorAll('.result-card').forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), i * 250);
        });
    }, 200);
}

// --- Retry ---
function retryLastQuestion() {
    // Remove the failed user message from history so it can be re-sent cleanly
    if (conversationHistory.length > 1) {
        conversationHistory.pop();
    }
    if (lastSelectedOption) {
        // Re-send the last selected answer
        selectOption(lastSelectedOption, document.createElement('button'));
    } else {
        startNextQuestion();
    }
}

// --- Error UI ---
function showErrorUI() {
    document.getElementById('questionText').innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:0.8rem;">🐰💔</div>
      <div style="font-weight:800;font-size:1.1rem;margin-bottom:0.5rem;">Oops! Something went wrong on our side.</div>
      <div style="color:var(--muted);font-size:0.9rem;line-height:1.6;">Our AI bunny tripped! Don't worry — our team is on it.</div>
    </div>
  `;
    const subject = encodeURIComponent('SkillBun Quiz Error');
    const body = encodeURIComponent(`Hi Team, I encountered an error during the career quiz at Question ${questionCount}. Please look into it. Thanks!`);
    document.getElementById('optionsContainer').innerHTML = `
    <a class="quiz-option" href="mailto:${encodeURIComponent(SUPPORT_EMAIL)}?subject=${subject}&body=${body}" style="text-decoration:none;">
      <span class="option-label">📧</span>
      <span class="option-text">Report to Team</span>
    </a>
    <button class="quiz-option" id="retryLastQuestionBtn">
      <span class="option-label">🔄</span>
      <span class="option-text">Try Again</span>
    </button>
  `;
    const retryBtn = document.getElementById('retryLastQuestionBtn');
    if (retryBtn) retryBtn.addEventListener('click', retryLastQuestion);
}

// --- Start Quiz ---
async function startNextQuestion() {
    document.getElementById('optionsContainer').style.display = 'none';
    document.getElementById('quizLoading').style.display = 'flex';

    try {
        const response = await callGemini(null);
        document.getElementById('quizLoading').style.display = 'none';
        document.getElementById('optionsContainer').style.display = 'grid';

        if (response.type === 'result') {
            showResults(response);
        } else {
            showQuestion(response);
        }
    } catch (err) {
        document.getElementById('quizLoading').style.display = 'none';
        document.getElementById('optionsContainer').style.display = 'grid';
        showErrorUI();
    }
}

// --- Event Listeners ---
const startQuizBtnEl = document.getElementById('startQuizBtn');
if (startQuizBtnEl) {
    startQuizBtnEl.addEventListener('click', async () => {
        const startBtn = document.getElementById('startQuizBtn');
        if (!startBtn) return;

        const defaultLabel = startBtn.dataset.defaultLabel || startBtn.textContent;
        startBtn.dataset.defaultLabel = defaultLabel;
        startBtn.disabled = true;
        startBtn.textContent = 'Verifying...';

        const verified = await verifyHumanProof();
        if (!verified) {
            startBtn.disabled = false;
            startBtn.textContent = defaultLabel;
            return;
        }

        startBtn.disabled = false;
        startBtn.textContent = defaultLabel;

        const welcomeScreen = document.getElementById('welcomeScreen');
        const quizScreen = document.getElementById('quizScreen');
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (quizScreen) quizScreen.style.display = 'block';
        startNextQuestion();
    });
}

const retakeBtnEl = document.getElementById('retakeBtn');
if (retakeBtnEl) {
    retakeBtnEl.addEventListener('click', () => {
        conversationHistory = [];
        questionCount = 0;
        quizResults = null;

        const resultScreen = document.getElementById('resultScreen');
        const welcomeScreen = document.getElementById('welcomeScreen');
        if (resultScreen) resultScreen.style.display = 'none';
        if (welcomeScreen) welcomeScreen.style.display = 'block';
    });
}

const loadMoreBtnEl = document.getElementById('loadMoreBtn');
if (loadMoreBtnEl) {
    loadMoreBtnEl.addEventListener('click', loadMoreCareers);
}

document.addEventListener('DOMContentLoaded', async () => {
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) startBtn.disabled = true;

    const hasProfile = loadProfile();
    if (!hasProfile) return;
    await fetchSecurityConfig();
    await initCaptcha();

    const userBadge = document.getElementById('userBadge');
    if (userBadge) userBadge.addEventListener('click', toggleDropdown);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

    if (startBtn) startBtn.disabled = false;
});
