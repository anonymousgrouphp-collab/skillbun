import { getFirebaseServices } from './firebaseClient';

export function mountQuizRuntime() {
// ===== QUIZ PAGE - Gemini API Integration =====

const eventController = new AbortController();
const { signal } = eventController;

// --- State ---
let conversationHistory = [];
let questionCount = 0;
let totalQuestions = 15; // Initial estimate, AI may finish early or take longer
let lastSelectedOption = null; // stores last answer for retry
let retryCount = 0;
const MAX_RETRIES_PER_QUESTION = 3;
let userProfile = {};
let quizResults = null;

// --- Configuration ---
const SUPPORT_EMAIL = 'harsh@skillbun.tech';
const HUMAN_PROOF_HEADER = 'x-skillbun-human';
const HUMAN_PROOF_STORAGE_KEY = 'sb_human_proof';
const AI_CLIENT_MAX_RETRIES = 1;
const AI_RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

let securityConfig = {
    captchaEnabled: false,
    captchaSiteKey: ''
};
let humanProofToken = '';
let humanProofExpiresAt = 0;
let captchaWidgetId = null;
let captchaToken = '';
let captchaInitPromise = null;

function hasFreshHumanProof() {
    return Boolean(humanProofToken) && humanProofExpiresAt > Date.now() + 10_000;
}

function persistHumanProof(token, expiresAt) {
    humanProofToken = token;
    humanProofExpiresAt = expiresAt;

    try {
        localStorage.setItem(HUMAN_PROOF_STORAGE_KEY, JSON.stringify({ token, expiresAt }));
    } catch (err) {
        console.warn('Could not persist human proof token:', err.message);
    }
}

function clearHumanProof() {
    humanProofToken = '';
    humanProofExpiresAt = 0;

    try {
        localStorage.removeItem(HUMAN_PROOF_STORAGE_KEY);
    } catch (err) {
        console.warn('Could not clear human proof token:', err.message);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFirebaseIdToken() {
    const services = getFirebaseServices();
    const currentUser = services.auth?.currentUser;

    if (!currentUser) {
        const error = new Error('Login required');
        error.status = 401;
        throw error;
    }

    return currentUser.getIdToken();
}

function parseRetryAfterMs(value) {
    if (!value) return 0;

    const seconds = Number.parseInt(value, 10);
    if (Number.isFinite(seconds)) {
        return Math.max(0, seconds * 1000);
    }

    const retryDate = Date.parse(value);
    if (Number.isFinite(retryDate)) {
        return Math.max(0, retryDate - Date.now());
    }

    return 0;
}

function formatWaitTime(ms) {
    const seconds = Math.max(1, Math.ceil(ms / 1000));
    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;

    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

function getRetryDelayMs(error, attempt) {
    if (Number.isFinite(error?.retryAfterMs) && error.retryAfterMs > 0) {
        return Math.min(error.retryAfterMs, 30_000);
    }

    return Math.min(700 * (2 ** attempt), 4_000);
}

function getFriendlyAiErrorMessage(error) {
    const message = String(error?.message || '').trim();
    const retryAfterMs = Number.parseInt(error?.retryAfterMs, 10);

    if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
        return `AI is cooling down. Please wait ${formatWaitTime(retryAfterMs)} and tap Try Again.`;
    }

    if (/quota|too many|rate|busy|limit|429/i.test(message)) {
        return 'AI is receiving too many requests right now. Please wait a moment and tap Try Again.';
    }

    if (/authentication|credential|api key|not configured|401|403/i.test(message)) {
        return 'AI is not configured correctly right now. Please report this to the SkillBun team.';
    }

    if (/empty response|temporarily unavailable|timed out|could not reach|network|failed to fetch|fetch failed|500|502|503|504/i.test(message)) {
        return 'AI took too long to answer or network dropped. Please tap Try Again and we will continue from the same question.';
    }

    if (/parse|json|token|format/i.test(message)) {
        return 'AI returned an answer in the wrong format or generated invalid JSON. Please tap Try Again and I will request a clean answer.';
    }

    if (/blocked|safety/i.test(message)) {
        return 'AI blocked the request due to safety filters. Please tap Try Again and we will try to resolve it.';
    }

    return message || "Our AI bunny tripped! Don't worry - our team is on it.";
}

function createFriendlyAiError(error) {
    const friendly = new Error(getFriendlyAiErrorMessage(error));
    friendly.status = Number.isFinite(error?.status) ? error.status : 0;
    friendly.retryAfterMs = Number.parseInt(error?.retryAfterMs, 10) || 0;
    friendly.code = error?.code || (friendly.status ? `AI_${friendly.status}` : 'AI_UNKNOWN');
    friendly.retryable = friendly.status === 0 || AI_RETRYABLE_STATUSES.has(friendly.status) || /parse|json|format|network|fetch|timed out/i.test(String(error?.message || ''));
    friendly.originalMessage = String(error?.message || '').trim();
    return friendly;
}

function getAiErrorCause({ code, message, originalMessage, status }) {
    const text = `${code || ''} ${message || ''} ${originalMessage || ''}`.toLowerCase();

    if (status === 429 || /quota|too many|rate|busy|limit/.test(text)) {
        return 'AI rate limit or quota pressure';
    }

    if (status === 403 || /human verification|captcha|turnstile/.test(text)) {
        return 'Human verification session was missing or expired';
    }

    if (status === 401 || /authentication|credential|api key|not configured/.test(text)) {
        return 'AI service authentication or configuration issue';
    }

    if (/json|parse|format|response_shape|result_shape|question_shape/.test(text)) {
        return 'AI returned a response that did not match the quiz JSON format';
    }

    if (/blocked|safety/.test(text)) {
        return 'AI safety filter blocked the request';
    }

    if (status === 504 || /timeout|timed out/.test(text)) {
        return 'AI request timed out';
    }

    if (status >= 500 || /network|fetch|could not reach|temporarily unavailable/.test(text)) {
        return 'Network or AI service availability issue';
    }

    return 'Unexpected quiz runtime error';
}

function buildErrorReportBody({ code, message, originalMessage, retryAfterMs, status }) {
    const cause = getAiErrorCause({ code, message, originalMessage, status });
    const reference = code || (status ? `AI_${status}` : 'AI_CLIENT');
    const statusText = status ? String(status) : 'N/A';
    const waitText = retryAfterMs > 0 ? formatWaitTime(retryAfterMs) : 'N/A';
    const technicalMessage = String(originalMessage || message || 'N/A').slice(0, 300);

    return [
        'Hi Team,',
        '',
        'I encountered an error during the SkillBun career quiz.',
        '',
        `Short brief: ${message || 'Quiz could not continue.'}`,
        `Error code: ${reference}`,
        `HTTP status: ${statusText}`,
        `Likely cause: ${cause}`,
        `Suggested wait: ${waitText}`,
        `Question number: ${questionCount || 'N/A'}`,
        `Attempt: ${retryCount} of ${MAX_RETRIES_PER_QUESTION}`,
        `Technical message: ${technicalMessage}`,
        '',
        'Please look into it. Thanks!'
    ].join('\n');
}

function restoreHumanProof() {
    try {
        const raw = localStorage.getItem(HUMAN_PROOF_STORAGE_KEY);
        if (!raw) return false;

        const parsed = JSON.parse(raw);
        const token = typeof parsed?.token === 'string' ? parsed.token : '';
        const expiresAt = Number.parseInt(parsed?.expiresAt, 10);

        if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now() + 10_000) {
            clearHumanProof();
            return false;
        }

        humanProofToken = token;
        humanProofExpiresAt = expiresAt;
        return true;
    } catch (err) {
        clearHumanProof();
        return false;
    }
}

async function refreshHumanProofSession() {
    if (!restoreHumanProof()) return false;

    try {
        const response = await fetch('/api/human/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [HUMAN_PROOF_HEADER]: humanProofToken
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            clearHumanProof();
            return false;
        }

        const data = await response.json();
        const token = typeof data?.humanToken === 'string' ? data.humanToken : '';
        const expiresAt = Number.parseInt(data?.expiresAt, 10);

        if (!token || !Number.isFinite(expiresAt)) {
            clearHumanProof();
            return false;
        }

        persistHumanProof(token, expiresAt);
        return true;
    } catch (err) {
        return hasFreshHumanProof();
    }
}

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

function getCaptchaErrorMessage(errorCode) {
    const code = String(errorCode || '').trim();

    if (code === '110200') {
        return `Turnstile domain is not authorized for this site key (${code}). Add this hostname in Cloudflare Turnstile Hostname Management.`;
    }

    if (code === '110100' || code === '110110' || code === '400020') {
        return `Turnstile site key is invalid or not found (${code}). Check the deployed TURNSTILE_SITE_KEY.`;
    }

    if (code === '400070') {
        return `Turnstile site key is disabled (${code}). Enable it in Cloudflare.`;
    }

    if (code === '200500') {
        return `Turnstile iframe could not load (${code}). Check browser extensions, network, or challenges.cloudflare.com blocking.`;
    }

    if (code === '110600' || code === '110620') {
        return `Verification timed out (${code}). Please retry.`;
    }

    return code ? `Verification failed (${code}). Please retry.` : 'Verification failed. Please retry.';
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
            existing.addEventListener('load', () => resolve(), { once: true, signal });
            existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script')), { once: true, signal });
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
    if (!securityConfig.captchaEnabled || hasFreshHumanProof()) return;

    const wrap = document.getElementById('captchaWrap');
    const widget = document.getElementById('captchaWidget');

    if (!wrap || !widget) return;

    wrap.style.display = 'block';
    if (captchaWidgetId !== null && window.turnstile) {
        setCaptchaStatus('Complete the verification below to start the quiz.');
        return;
    }

    if (captchaInitPromise) {
        await captchaInitPromise;
        return;
    }

    captchaInitPromise = (async () => {
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
            theme: localStorage.getItem('sb_theme') || 'dark',
            callback: (token) => {
                captchaToken = token;
                setCaptchaStatus('Verification complete. You can start now.', 'ok');
            },
            'expired-callback': () => {
                captchaToken = '';
                setCaptchaStatus('Verification expired. Please verify again.', 'error');
            },
            'error-callback': (errorCode) => {
                captchaToken = '';
                setCaptchaStatus(getCaptchaErrorMessage(errorCode), 'error');
            }
        });
    })();

    try {
        await captchaInitPromise;
    } finally {
        captchaInitPromise = null;
    }
}

async function verifyHumanProof() {
    restoreHumanProof();
    if (hasFreshHumanProof()) {
        return true;
    }

    if (securityConfig.captchaEnabled && !captchaToken) {
        await initCaptcha();
        if (!captchaToken) {
            setCaptchaStatus('Please complete verification before starting.', 'error');
            return false;
        }
    }

    const body = securityConfig.captchaEnabled ? { token: captchaToken } : {};

    try {
        const response = await fetch('/api/human/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            clearHumanProof();
            setCaptchaStatus('Verification failed. Please retry.', 'error');
            return false;
        }

        const data = await response.json();
        const token = typeof data?.humanToken === 'string' ? data.humanToken : '';
        const parsedExpiresAt = Number.parseInt(data?.expiresAt, 10);

        if (!token || !Number.isFinite(parsedExpiresAt)) {
            clearHumanProof();
            setCaptchaStatus('Verification failed. Please retry.', 'error');
            return false;
        }

        persistHumanProof(token, parsedExpiresAt);

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
    const degree = localStorage.getItem('sb_degree') || '';
    const year = localStorage.getItem('sb_year') || '';
    return { name, degree, year };
}

function redirectToProfileSetup(destination) {
    window.location.href = `/onboarding?next=${encodeURIComponent('/' + destination.replace('.html', ''))}`;
}

// --- Load User Profile ---
function loadProfile() {
    const { name, degree, year } = getStoredProfile();
    if (!degree || !year) {
        redirectToProfileSetup('quiz');
        return false;
    }

    userProfile = { name: name || 'Student', degree, year };

    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = name;

    const userBadgeEl = document.getElementById('userBadge');
    if (userBadgeEl) userBadgeEl.textContent = `User: ${name}`;

    const welcomeProfileEl = document.getElementById('welcomeProfile');
    if (welcomeProfileEl) {
        welcomeProfileEl.innerHTML = `
        <div class="profile-tag">Degree: ${sanitize(degree)}</div>
        <div class="profile-tag">Year: ${sanitize(year)}</div>
        `;
    }

    // Populate Dropdown Profile specific elements (may not exist in Next.js layout)
    const dropdownNameEl = document.getElementById('dropdownName');
    if (dropdownNameEl) dropdownNameEl.textContent = name;
    const dropdownDegreeEl = document.getElementById('dropdownDegree');
    if (dropdownDegreeEl) dropdownDegreeEl.textContent = degree;
    const dropdownYearEl = document.getElementById('dropdownYear');
    if (dropdownYearEl) dropdownYearEl.textContent = year;
    return true;
}

function resetQuizState() {
    conversationHistory = [];
    questionCount = 0;
    totalQuestions = 15;
    lastSelectedOption = null;
    retryCount = 0;
    quizResults = null;

    const welcomeScreen = document.getElementById('welcomeScreen');
    const quizScreen = document.getElementById('quizScreen');
    const resultScreen = document.getElementById('resultScreen');
    const resultCards = document.getElementById('resultCards');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const quizLoading = document.getElementById('quizLoading');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const captchaWrap = document.getElementById('captchaWrap');

    if (welcomeScreen) welcomeScreen.style.display = 'block';
    if (quizScreen) quizScreen.style.display = 'none';
    if (resultScreen) resultScreen.style.display = 'none';
    if (resultCards) resultCards.innerHTML = '';
    if (questionText) questionText.textContent = 'Loading your first question...';
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        optionsContainer.style.display = 'grid';
        optionsContainer.style.opacity = '1';
    }
    if (quizLoading) quizLoading.style.display = 'none';

    const aiInsight = document.getElementById('aiInsight');
    if (aiInsight) aiInsight.style.display = 'none';

    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('quizPhase').textContent = 'Phase 1: Discovery';
    document.getElementById('qNum').textContent = '1';
    document.getElementById('qTotal').textContent = '15';

    restoreHumanProof();
    if (captchaWrap) {
        if (hasFreshHumanProof()) {
            captchaWrap.style.display = 'none';
            setCaptchaStatus('Security already verified for this session.', 'ok');
        } else if (securityConfig.captchaEnabled) {
            captchaWrap.style.display = 'block';
            setCaptchaStatus('Complete the verification below to start the quiz.');
        } else {
            captchaWrap.style.display = 'none';
        }
    }

    if (loadMoreBtn) {
        const defaultLabel = loadMoreBtn.dataset.defaultLabel || loadMoreBtn.textContent;
        loadMoreBtn.dataset.defaultLabel = defaultLabel;
        loadMoreBtn.textContent = defaultLabel;
        loadMoreBtn.disabled = false;
    }
}

// ===== HAMBURGER MENU =====
{
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        }, { signal });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            }, { signal });
        });
    }
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

    // Only close if clicking outside the dropdown and outside the button
    if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(event.target) && event.target !== badge) {
        dropdown.classList.remove('show');
    }
}, { signal });

// --- Logout functionality ---
function logoutUser() {
    // Clear the active session details from local storage
    localStorage.removeItem('sb_name');
    localStorage.removeItem('sb_email');
    localStorage.removeItem('sb_degree');
    localStorage.removeItem('sb_year');
    clearHumanProof();

    // Redirect back to homepage
    window.location.href = '/';
}

// --- System Prompt ---
function getSystemPrompt() {
    return `You are SkillBun's Elite Tech Mentor — an experienced, radically honest, and analytical career advisor deeply embedded in the Indian tech industry. You have mentored engineers at top Indian product startups (Zomato, Cred, Razorpay) and massive Service/Enterprise MNCs (TCS, Infosys, IBM).

STUDENT PROFILE:
- Name: ${userProfile.name}
- Degree: ${userProfile.degree}
- Current Year: ${userProfile.year}

YOUR GOAL:
Act as a ruthless but fair diagnostician to uncover the absolute best career fit for this specific student. Avoid generic, fluffy answers. Dive deep into their psychology, risk tolerance, and problem-solving style. 

THE 6 PILLARS OF TECH (Do not assume they want to code!):
1. Software Engineering & Systems (Logic, algorithms, distributed systems, legacy code)
2. Data & AI (Math, statistical modeling, data pipelines, LLM fine-tuning)
3. Design & Product (User empathy, business metrics, scope negotiation, Figma)
4. Cloud & Infrastructure (Reliability, cost-optimization, Kubernetes, incident response)
5. Cybersecurity & Risk (Offensive/Defensive security, compliance, zero-trust)
6. Operations & Specialized (Technical writing, QA automation, RPA, Game Dev)

DIAGNOSTIC DEPTH RULES:
- Track evidence across these axes: domain pull, problem-solving style, math/data comfort, user empathy, systems/reliability mindset, security/risk mindset, communication/ownership, ambiguity tolerance, and preferred work environment.
- Do not lock onto the first attractive answer. Keep at least two plausible career hypotheses alive until the student has answered enough niche-discovery questions.
- Every option should test a tradeoff, not a vibe: speed vs correctness, breadth vs specialization, user impact vs technical depth, autonomy vs structured delivery, risk-taking vs reliability.
- By questions 6-10, narrow to a pillar but compare sub-specializations inside that pillar using realistic work samples.
- In final recommendations, explain the evidence from the student's answers and avoid generic "you like coding" reasoning.

ASSESSMENT STRUCTURE (10-18 Questions, 4 Phases):

PHASE 1 — Core Tech DNA & Grit (Questions 1-5):
Ask orthogonal situational questions to identify their core pillar and work ethic. 
Present harsh, realistic mini-scenarios.
Example: "Your company's production server just crashed during a massive Diwali sale. You are expected to..."
A) Dig into the logs to find the root cause (Infra/Backend) B) Coordinate with the business team to handle customer complaints (Product/Support) C) Patch the security vulnerability that caused it (Security) D) Analyze the data loss and write a recovery script (Data)

PHASE 2 — Indian Market Realities & Niche Discovery (Questions 6-10):
Once a pillar is identified, ABANDON the others completely.
Present scenarios specific to Indian work culture: tight deadlines, changing client requirements, service-based vs product-based dynamics, and legacy systems.
Example: "Your manager in an MNC asks you to use an outdated tech stack for a new client project because 'it is what the client asked for'. What do you do?"

PHASE 3 — Execution & Complexity Handling (Questions 11-14):
Determine their technical depth and working style. How do they handle extreme complexity? 
Do they prefer hacking together a quick MVP (Startups) or writing highly scalable, robust enterprise code (Big Tech/GICs)?

PHASE 4 — The Curveball / Final Polish (Questions 15-18):
Throw a challenging scenario that forces them to choose between two good (or two bad) options to test their conviction. 
Only proceed to this phase if you are not yet 95% confident.

RULES:
1. Ask exactly ONE question per response.
2. Provide exactly 4 options (A, B, C, D) — each must represent a meaningfully different path or approach.
3. Every question MUST adapt dynamically based on ALL previous answers. Ask "What would you do?" scenario-based questions, NOT "Which do you prefer?".
4. Keep questions engaging, conversational, and grounded in real Indian tech industry situations (startups, MNCs, freelancing, open-source, competitive programming, toxic managers, legacy codebases).
5. NEVER assume 'Tech' means 'Software Developer'. Actively explore non-coding roles like Product Management, UX Research, Technical Writing, DevOps, Security, etc.
6. After question 1, ALWAYS provide a highly analytical 2-sentence "insight" field reflecting on the psychological traits and professional leanings revealed by their previous answer. Make it sound like a seasoned mentor's observation (e.g., "You showed a preference for systemic stability over rapid prototyping. This suggests you'd thrive in Enterprise environments over chaotic startups.")
7. DYNAMIC LENGTH: Ask between 10 and 18 questions. Only output the final recommendation ("type": "result") when you have reached 95%+ confidence. If by question 10 you are very confident, you may finish. Do NOT always stop at exactly 10.
8. When generating the final result, you MUST use the exact roadmap ID from the provided list for EVERY career. This is critical. Cross-reference the career title with the slug list carefully. If unsure, use the closest reasonable match, not 'general'.
9. Because SkillBun has many niche roadmaps, prefer the most specific matching roadmap. For example, choose 'react_native_developer' over 'frontend' for React Native, 'llmops_engineer' over 'ai_ml_engineer' for LLM production operations, and 'application_security_engineer' over 'cybersecurity' for secure code review.

RESPONSE FORMAT (for questions):
You MUST respond in this exact JSON format, with no markdown, no code fences, just raw JSON:
{
  "type": "question",
  "phase": 1,
  "questionNumber": 1,
  "insight": "",
  "question": "Your situational question text here?",
  "options": [
    {"label": "A", "text": "Option A text"},
    {"label": "B", "text": "Option B text"},
    {"label": "C", "text": "Option C text"},
    {"label": "D", "text": "Option D text"}
  ]
}

RESPONSE FORMAT (for final recommendation):
When you are ready to give the final result, return EXACTLY this structure:
{
  "type": "result",
  "careers": [
    {
      "rank": 1,
      "title": "Career Title",
      "matchPercent": 92,
      "description": "2-3 sentences explaining WHY this is a great fit based on their specific answers",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "salaryRange": "₹X - ₹Y LPA (entry level in India)",
      "demand": "High/Medium/Growing",
      "nextSteps": "Specific, actionable advice for an Indian student to start this career path",
      "roadmapUrl": "exact_slug_from_list"
    }
  ]
}

Provide EXACTLY 3 careers in the final recommendation, ranked by match quality. Be highly specific to the Indian tech market (mention Indian companies, exact salary ranges in LPA, relevant certifications like AWS/GCP, or platforms like NPTEL/CDAC if relevant).

CRITICAL — ROADMAP SLUG MAPPING:
For the "roadmapUrl" field, you MUST use ONLY an exact slug from this list. Do NOT invent slugs. Do NOT use full URLs. Just the bare ID string:
['ai_ml_engineer', 'ai_research_engineer', 'analytics_engineer', 'android', 'angular_developer', 'api_platform_engineer', 'application_security_engineer', 'ar_vr_developer', 'aws_cloud_engineer', 'azure_cloud_engineer', 'backend', 'bi_developer', 'blockchain_web3', 'business_analyst', 'c_cpp_systems_developer', 'cloud_architect', 'cloud_security_engineer', 'computer_vision_engineer', 'content_designer', 'cybersecurity', 'data_analyst', 'data_engineering', 'data_governance_specialist', 'data_science', 'data_visualization_specialist', 'database_admin', 'design_systems_engineer', 'desktop_app_developer', 'devops_cloud', 'dfir_analyst', 'digital_marketing_analyst', 'dotnet_developer', 'elixir_phoenix_developer', 'embedded_iot', 'finops_engineer', 'flutter_developer', 'frontend', 'fullstack', 'game_development', 'gcp_cloud_engineer', 'generative_ai_app_developer', 'geospatial_data_scientist', 'go_developer', 'graphql_api_developer', 'grc_analyst', 'iam_engineer', 'ios_developer', 'java_developer', 'kubernetes_engineer', 'linux_system_admin', 'llmops_engineer', 'macos_developer', 'malware_analyst', 'mlops_engineer', 'network_engineer', 'nextjs_developer', 'nlp_engineer', 'no_code_low_code_developer', 'observability_engineer', 'penetration_tester', 'php_laravel_developer', 'platform_engineer', 'product_designer', 'product_manager', 'prompt_engineer', 'python_developer', 'qa_automation', 'react_native_developer', 'recommendation_systems_engineer', 'red_team_operator', 'reinforcement_learning_engineer', 'release_engineer', 'robotics_engineer', 'rpa_developer', 'ruby_on_rails_developer', 'rust_developer', 'salesforce_developer', 'scala_developer', 'scrum_master_agile_coach', 'seo_specialist', 'serverless_developer', 'service_designer', 'shopify_developer', 'site_reliability_engineer', 'soc_analyst', 'speech_ai_engineer', 'svelte_developer', 'technical_artist', 'technical_support_engineer', 'technical_writing', 'terraform_iac_engineer', 'threat_intelligence_analyst', 'ui_ux_design', 'unity_developer', 'unreal_engine_developer', 'ux_researcher', 'vue_developer', 'windows_app_developer', 'wordpress_developer', 'general'].

Common mapping hints:
- "Full Stack Developer" → 'fullstack'
- "Frontend Developer" → 'frontend'  
- "Backend Developer" → 'backend'
- "Data Scientist" → 'data_science'
- "ML Engineer" / "AI Engineer" → 'ai_ml_engineer'
- "DevOps Engineer" → 'devops_cloud'
- "UX/UI Designer" → 'ui_ux_design'
- "Product Manager" → 'product_manager'
- "Cybersecurity Analyst" → 'cybersecurity'
- "Cloud Architect" → 'cloud_architect'
- "Mobile Developer (Android)" → 'android'
- "Mobile Developer (iOS)" → 'ios_developer'
- "Mobile Developer (Flutter)" → 'flutter_developer'
- "Game Developer" → 'game_development'
- "Blockchain Developer" → 'blockchain_web3'
- "QA Engineer" → 'qa_automation'
- "Technical Writer" → 'technical_writing'
- "Ethical Hacker / Pentester" → 'penetration_tester'
- "SRE" → 'site_reliability_engineer'
- "Business Analyst" → 'business_analyst'
- Only use 'general' as an absolute last resort when nothing else fits.

Start with the first question now.`;
}

// --- Gemini API Call ---
async function callGemini(userMessage) {
    const verified = await verifyHumanProof();
    if (!verified) {
        throw new Error('Human verification required');
    }

    let startedConversation = false;
    let appendedUserMessage = false;

    // Build messages
    if (conversationHistory.length === 0) {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: getSystemPrompt() }]
        });
        startedConversation = true;
    } else if (userMessage) {
        conversationHistory.push({
            role: 'user',
            parts: [{ text: buildQuizUserMessage(userMessage) }]
        });
        appendedUserMessage = true;
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
        const data = await fetchGeminiPayload(payload);
        const text = extractGeminiText(data);

        if (!text) throw new Error('Empty response from Gemini');

        const parsed = normalizeQuizResponse(parseGeminiJSON(text));

        // Add assistant response to history only after it is usable.
        conversationHistory.push({
            role: 'model',
            parts: [{ text }]
        });

        return parsed;

    } catch (err) {
        console.error('Gemini API Error:', err);

        if (startedConversation) {
            conversationHistory = [];
        } else if (appendedUserMessage && conversationHistory[conversationHistory.length - 1]?.role === 'user') {
            conversationHistory.pop();
        }

        throw createFriendlyAiError(err);
    }
}

function buildQuizUserMessage(userMessage) {
    if (!quizResults && questionCount >= 18) {
        return userMessage + '\n\nIMPORTANT: You have now asked 18 questions. You MUST return the final recommendation JSON now with "type": "result" and exactly 3 careers. Each career MUST have a valid roadmapUrl slug from the provided list. Use the most specific local roadmap slug that fits the answer evidence.';
    }

    if (!quizResults && questionCount >= 14) {
        return userMessage + '\n\nNote: You have asked ' + questionCount + ' questions. If you have 95%+ confidence, return the final recommendation now. Otherwise, you may ask up to ' + (18 - questionCount) + ' more questions. Make sure your scenarios are increasingly complex and specific to Indian tech realities. Push for edge cases (Phase 4). Before finalizing, compare the top 2-3 niche roadmap options and choose specific slugs rather than generic umbrellas.';
    }

    if (!quizResults && questionCount === 3) {
        return userMessage + '\n\nNote: If two or more pillars are still plausible, ask a scenario that separates them sharply. Do not ask preference-only questions.';
    }

    if (!quizResults && questionCount === 5) {
        return userMessage + '\n\nNote: You should now transition to PHASE 2 (Indian Market Realities & Niche Discovery). Abandon the pillars the user rejected. Present complex scenarios specific to Indian work culture (e.g., service vs product company dynamics, legacy code, client pressure).';
    }

    if (!quizResults && questionCount === 8) {
        return userMessage + '\n\nNote: You should now test niche fit inside the strongest pillar. Use a work-sample scenario that can distinguish between nearby roadmap paths such as generic software, framework-specific, cloud-specific, security-specific, data-specific, or product/design-specific roles.';
    }

    if (!quizResults && questionCount === 10) {
        return userMessage + '\n\nNote: You should now transition to PHASE 3 (Execution & Complexity Handling). Ask about their working style under extreme complexity. Start wrapping up if your confidence is high.';
    }

    return userMessage;
}

function extractGeminiText(data) {
    // Check for blocked content
    if (data?.promptFeedback?.blockReason) {
        throw new Error('AI blocked the request: ' + data.promptFeedback.blockReason);
    }

    const candidate = data?.candidates?.[0];
    if (!candidate) return '';

    // Check for safety filter finish reason
    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
        console.warn('Gemini finish reason:', candidate.finishReason);
    }

    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) return '';

    const textPart = parts.find(part => typeof part?.text === 'string' && part.text.trim());
    return textPart?.text || '';
}

async function fetchGeminiPayload(payload) {
    let lastError = null;

    for (let attempt = 0; attempt <= AI_CLIENT_MAX_RETRIES; attempt += 1) {
        try {
            const idToken = await getFirebaseIdToken();
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            };
            if (humanProofToken) headers[HUMAN_PROOF_HEADER] = humanProofToken;

            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 403) {
                    clearHumanProof();
                }

                const error = new Error(errData.error || `API request failed (${res.status})`);
                error.status = res.status;
                error.retryAfterMs = Number.parseInt(errData.retryAfterMs, 10) || parseRetryAfterMs(res.headers.get('retry-after'));

                if (AI_RETRYABLE_STATUSES.has(res.status) && attempt < AI_CLIENT_MAX_RETRIES) {
                    lastError = error;
                    await sleep(getRetryDelayMs(error, attempt));
                    continue;
                }

                throw error;
            }

            return await res.json();
        } catch (error) {
            if (error?.status || attempt >= AI_CLIENT_MAX_RETRIES) {
                if (!error?.status && !error?.code) {
                    error.code = 'NETWORK_OR_CLIENT_ERROR';
                }
                throw error;
            }

            lastError = error;
            await sleep(getRetryDelayMs(error, attempt));
        }
    }

    throw lastError || new Error('AI request failed');
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

    const parseError = new Error('Could not parse Gemini response as JSON');
    parseError.code = 'AI_JSON_PARSE';
    throw parseError;
}

function createQuizFormatError(message, code) {
    const error = new Error(message);
    error.code = code;
    return error;
}

function normalizeQuizResponse(response) {
    if (!response || typeof response !== 'object') {
        throw createQuizFormatError('AI response was not a JSON object', 'AI_RESPONSE_SHAPE');
    }

    if (response.type === 'result' || Array.isArray(response.careers) || (response.careers && typeof response.careers === 'object') || Array.isArray(response.results)) {
        const careers = extractCareers(response).slice(0, 3);
        if (careers.length === 0) {
            throw createQuizFormatError('AI result did not include usable careers', 'AI_RESULT_SHAPE');
        }

        return {
            ...response,
            type: 'result',
            careers
        };
    }

    let options = normalizeQuestionOptions(response.options);
    if (!String(response.question || '').trim() || options.length === 0) {
        throw createQuizFormatError('AI question did not include a question with options', 'AI_QUESTION_SHAPE');
    }

    // Pad options to 4 if AI returned fewer (graceful recovery)
    while (options.length < 4) {
        options.push({ label: String.fromCharCode(65 + options.length), text: 'Other / None of the above' });
    }

    options = options.slice(0, 4).map((option, index) => ({
        ...option,
        label: ['A', 'B', 'C', 'D'][index]
    }));

    const parsedPhase = Number.parseInt(response.phase, 10);
    const parsedQuestionNumber = Number.parseInt(response.questionNumber, 10);

    return {
        ...response,
        type: 'question',
        phase: Number.isFinite(parsedPhase) ? Math.max(1, Math.min(parsedPhase, 4)) : 1,
        questionNumber: Number.isFinite(parsedQuestionNumber) ? parsedQuestionNumber : questionCount + 1,
        insight: String(response.insight || '').trim(),
        question: String(response.question).trim(),
        options
    };
}

function normalizeQuestionOptions(options) {
    const rawOptions = Array.isArray(options)
        ? options
        : options && typeof options === 'object'
            ? Object.entries(options).map(([label, text]) => ({ label, text }))
            : [];
    const seenTexts = new Set();

    return rawOptions
        .map((option, index) => {
            const label = String(option?.label || String.fromCharCode(65 + index)).trim().slice(0, 1).toUpperCase();
            const rawText = typeof option === 'string' ? option : option?.text || option?.value || option?.description || '';
            const text = String(rawText).trim();
            const dedupeKey = normalizeMatchText(text);

            if (!text || seenTexts.has(dedupeKey)) return null;
            seenTexts.add(dedupeKey);
            return { label: ['A', 'B', 'C', 'D'][index] || label || 'A', text };
        })
        .filter(Boolean)
        .slice(0, 4);
}

const ROADMAP_FALLBACK_URL = '/roadmap/general';

const KNOWN_ROADMAP_SLUGS = new Set([
    'ai_ml_engineer',
    'ai_research_engineer',
    'analytics_engineer',
    'android',
    'angular_developer',
    'api_platform_engineer',
    'application_security_engineer',
    'ar_vr_developer',
    'aws_cloud_engineer',
    'azure_cloud_engineer',
    'backend',
    'bi_developer',
    'blockchain_web3',
    'business_analyst',
    'c_cpp_systems_developer',
    'cloud_architect',
    'cloud_security_engineer',
    'computer_vision_engineer',
    'content_designer',
    'cybersecurity',
    'data_analyst',
    'data_engineering',
    'data_governance_specialist',
    'data_science',
    'data_visualization_specialist',
    'database_admin',
    'design_systems_engineer',
    'desktop_app_developer',
    'devops_cloud',
    'dfir_analyst',
    'digital_marketing_analyst',
    'dotnet_developer',
    'elixir_phoenix_developer',
    'embedded_iot',
    'finops_engineer',
    'flutter_developer',
    'frontend',
    'fullstack',
    'game_development',
    'gcp_cloud_engineer',
    'generative_ai_app_developer',
    'geospatial_data_scientist',
    'go_developer',
    'graphql_api_developer',
    'grc_analyst',
    'iam_engineer',
    'ios_developer',
    'java_developer',
    'kubernetes_engineer',
    'linux_system_admin',
    'llmops_engineer',
    'macos_developer',
    'malware_analyst',
    'mlops_engineer',
    'network_engineer',
    'nextjs_developer',
    'nlp_engineer',
    'no_code_low_code_developer',
    'observability_engineer',
    'penetration_tester',
    'php_laravel_developer',
    'platform_engineer',
    'product_designer',
    'product_manager',
    'prompt_engineer',
    'python_developer',
    'qa_automation',
    'react_native_developer',
    'recommendation_systems_engineer',
    'red_team_operator',
    'reinforcement_learning_engineer',
    'release_engineer',
    'robotics_engineer',
    'rpa_developer',
    'ruby_on_rails_developer',
    'rust_developer',
    'salesforce_developer',
    'scala_developer',
    'scrum_master_agile_coach',
    'seo_specialist',
    'serverless_developer',
    'service_designer',
    'shopify_developer',
    'site_reliability_engineer',
    'soc_analyst',
    'speech_ai_engineer',
    'svelte_developer',
    'technical_artist',
    'technical_support_engineer',
    'technical_writing',
    'terraform_iac_engineer',
    'threat_intelligence_analyst',
    'ui_ux_design',
    'unity_developer',
    'unreal_engine_developer',
    'ux_researcher',
    'vue_developer',
    'windows_app_developer',
    'wordpress_developer',
    'general'
]);

const ROADMAP_KEYWORD_RULES = [
    { slug: 'scala_developer', keywords: ['scala developer', 'scala programming', 'akka', 'sbt', 'functional programming scala'] },
    { slug: 'ruby_on_rails_developer', keywords: ['ruby on rails developer', 'ruby on rails', 'rails developer', 'ruby developer', 'active record'] },
    { slug: 'elixir_phoenix_developer', keywords: ['elixir/phoenix developer', 'elixir phoenix developer', 'elixir developer', 'phoenix developer', 'liveview', 'otp', 'beam'] },
    { slug: 'c_cpp_systems_developer', keywords: ['c/c++ systems developer', 'c cpp systems developer', 'c++ developer', 'cpp developer', 'c developer', 'systems programming', 'memory management'] },
    { slug: 'angular_developer', keywords: ['angular developer', 'angular', 'rxjs', 'typescript angular'] },
    { slug: 'vue_developer', keywords: ['vue developer', 'vue.js', 'vue js', 'pinia', 'nuxt'] },
    { slug: 'svelte_developer', keywords: ['svelte developer', 'sveltekit', 'svelte', 'svelte js'] },
    { slug: 'nextjs_developer', keywords: ['next.js developer', 'nextjs developer', 'next.js', 'next js', 'app router', 'server components'] },
    { slug: 'graphql_api_developer', keywords: ['graphql api developer', 'graphql developer', 'graphql api', 'apollo graphql', 'schema federation'] },
    { slug: 'api_platform_engineer', keywords: ['api platform engineer', 'api design', 'openapi', 'api gateway', 'developer portal'] },
    { slug: 'serverless_developer', keywords: ['serverless developer', 'aws lambda', 'event driven', 'serverless framework'] },
    { slug: 'kubernetes_engineer', keywords: ['kubernetes engineer', 'k8s', 'helm', 'cluster operations', 'container orchestration'] },
    { slug: 'platform_engineer', keywords: ['platform engineer', 'internal developer platform', 'backstage', 'developer platform', 'golden path'] },
    { slug: 'terraform_iac_engineer', keywords: ['terraform/iac engineer', 'terraform iac engineer', 'terraform engineer', 'iac engineer', 'infrastructure as code', 'hashicorp terraform'] },
    { slug: 'aws_cloud_engineer', keywords: ['aws cloud engineer', 'aws engineer', 'ec2', 's3', 'vpc', 'iam aws'] },
    { slug: 'azure_cloud_engineer', keywords: ['azure cloud engineer', 'azure engineer', 'microsoft azure', 'azure devops'] },
    { slug: 'gcp_cloud_engineer', keywords: ['gcp cloud engineer', 'google cloud engineer', 'gke', 'cloud run', 'bigquery cloud'] },
    { slug: 'finops_engineer', keywords: ['finops engineer', 'cloud cost', 'cost optimization', 'cloud economics', 'finops'] },
    { slug: 'observability_engineer', keywords: ['observability engineer', 'opentelemetry', 'prometheus', 'grafana', 'logs metrics traces'] },
    { slug: 'release_engineer', keywords: ['release engineer', 'release engineering', 'ci cd release', 'deployment pipeline'] },
    { slug: 'application_security_engineer', keywords: ['application security engineer', 'appsec', 'secure code review', 'sast', 'dast', 'owasp asvs'] },
    { slug: 'malware_analyst', keywords: ['malware analyst', 'malware analysis', 'reverse engineering', 'yara', 'remnux'] },
    { slug: 'dfir_analyst', keywords: ['dfir analyst', 'digital forensics', 'incident response', 'memory forensics', 'volatility'] },
    { slug: 'threat_intelligence_analyst', keywords: ['threat intelligence analyst', 'cyber threat intelligence', 'cti analyst', 'osint', 'mitre attack'] },
    { slug: 'red_team_operator', keywords: ['red team operator', 'red team', 'adversary simulation', 'purple team', 'atomic red team'] },
    { slug: 'grc_analyst', keywords: ['grc analyst', 'governance risk compliance', 'risk analyst', 'security compliance', 'iso 27001'] },
    { slug: 'iam_engineer', keywords: ['iam engineer', 'identity access management', 'sso', 'mfa', 'rbac', 'entra', 'okta'] },
    { slug: 'analytics_engineer', keywords: ['analytics engineer', 'dbt', 'semantic layer', 'data modeling', 'warehouse analytics'] },
    { slug: 'bi_developer', keywords: ['bi developer', 'business intelligence developer', 'power bi developer', 'tableau developer', 'dax'] },
    { slug: 'data_visualization_specialist', keywords: ['data visualization specialist', 'dashboard designer', 'd3', 'tableau visualization', 'data storytelling'] },
    { slug: 'data_governance_specialist', keywords: ['data governance specialist', 'data stewardship', 'data catalog', 'data lineage', 'data quality'] },
    { slug: 'geospatial_data_scientist', keywords: ['geospatial data scientist', 'gis data scientist', 'geopandas', 'qgis', 'spatial analysis'] },
    { slug: 'nlp_engineer', keywords: ['nlp engineer', 'natural language processing', 'transformers', 'hugging face', 'text classification'] },
    { slug: 'reinforcement_learning_engineer', keywords: ['reinforcement learning engineer', 'rl engineer', 'deep reinforcement learning', 'gymnasium', 'stable baselines'] },
    { slug: 'ai_research_engineer', keywords: ['ai research engineer', 'research engineer', 'machine learning research', 'pytorch experiments', 'benchmarks'] },
    { slug: 'llmops_engineer', keywords: ['llmops engineer', 'llm ops', 'llm monitoring', 'rag evaluation', 'langsmith'] },
    { slug: 'speech_ai_engineer', keywords: ['speech ai engineer', 'speech recognition', 'asr', 'text to speech', 'audio ai'] },
    { slug: 'recommendation_systems_engineer', keywords: ['recommendation systems engineer', 'recommender systems', 'ranking models', 'collaborative filtering'] },
    { slug: 'desktop_app_developer', keywords: ['desktop app developer', 'desktop application', 'electron', 'tauri', 'qt'] },
    { slug: 'windows_app_developer', keywords: ['windows app developer', 'winui', 'windows app sdk', 'xaml', 'uwp'] },
    { slug: 'macos_developer', keywords: ['macos developer', 'mac app developer', 'swiftui macos', 'appkit'] },
    { slug: 'unity_developer', keywords: ['unity developer', 'unity game developer', 'unity c#', 'game engine unity'] },
    { slug: 'unreal_engine_developer', keywords: ['unreal engine developer', 'unreal developer', 'blueprints', 'ue5', 'unreal c++'] },
    { slug: 'technical_artist', keywords: ['technical artist', 'tech artist', 'shader artist', 'game art pipeline', 'procedural tools'] },
    { slug: 'ux_researcher', keywords: ['ux researcher', 'user researcher', 'usability testing', 'research synthesis', 'user interviews'] },
    { slug: 'product_designer', keywords: ['product designer', 'digital product design', 'interaction design', 'figma designer'] },
    { slug: 'service_designer', keywords: ['service designer', 'service design', 'journey mapping', 'service blueprint'] },
    { slug: 'design_systems_engineer', keywords: ['design systems engineer', 'design system developer', 'storybook', 'design tokens', 'component library'] },
    { slug: 'content_designer', keywords: ['content designer', 'ux writer', 'content design', 'product content', 'microcopy'] },
    { slug: 'scrum_master_agile_coach', keywords: ['scrum master / agile coach', 'scrum master agile coach', 'scrum master', 'agile coach', 'scrum', 'kanban', 'agile delivery'] },
    { slug: 'fullstack', keywords: ['full stack', 'full-stack', 'fullstack'] },
    { slug: 'frontend', keywords: ['frontend', 'front end', 'front-end', 'web ui', 'react', 'vue', 'angular'] },
    { slug: 'backend', keywords: ['backend', 'back end', 'back-end', 'server side', 'api developer', 'microservice'] },
    { slug: 'flutter_developer', keywords: ['flutter', 'dart', 'cross platform mobile'] },
    { slug: 'react_native_developer', keywords: ['react native', 'expo', 'mobile react'] },
    { slug: 'python_developer', keywords: ['python developer', 'python backend', 'fastapi', 'django developer', 'python automation'] },
    { slug: 'java_developer', keywords: ['java developer', 'spring boot', 'spring developer', 'java backend'] },
    { slug: 'dotnet_developer', keywords: ['.net', 'dotnet', 'c#', 'asp.net', 'asp net', 'microsoft stack'] },
    { slug: 'go_developer', keywords: ['go developer', 'golang', 'go backend'] },
    { slug: 'rust_developer', keywords: ['rust developer', 'rust programming', 'systems programming'] },
    { slug: 'php_laravel_developer', keywords: ['php', 'laravel', 'php developer', 'laravel developer'] },
    { slug: 'wordpress_developer', keywords: ['wordpress', 'wordpress developer', 'woocommerce developer'] },
    { slug: 'shopify_developer', keywords: ['shopify', 'shopify developer', 'liquid theme', 'ecommerce developer'] },
    { slug: 'computer_vision_engineer', keywords: ['computer vision', 'opencv', 'image processing', 'object detection', 'vision engineer'] },
    { slug: 'mlops_engineer', keywords: ['mlops', 'ml ops', 'machine learning operations', 'model deployment', 'model monitoring', 'mlflow', 'dvc', 'model registry'] },
    { slug: 'generative_ai_app_developer', keywords: ['generative ai app', 'genai app', 'ai app developer', 'rag', 'retrieval augmented generation', 'llm app'] },
    { slug: 'prompt_engineer', keywords: ['prompt engineer', 'prompt engineering', 'prompt designer', 'llm prompt'] },
    { slug: 'ai_ml_engineer', keywords: ['ai engineer', 'artificial intelligence', 'llm', 'genai', 'nlp', 'machine learning', 'ml engineer', 'deep learning'] },
    { slug: 'digital_marketing_analyst', keywords: ['digital marketing analyst', 'marketing analyst', 'campaign analyst', 'performance marketing', 'ga4', 'google analytics'] },
    { slug: 'seo_specialist', keywords: ['seo', 'search engine optimization', 'seo specialist', 'technical seo'] },
    { slug: 'data_analyst', keywords: ['data analyst', 'business intelligence analyst', 'bi analyst', 'power bi', 'tableau', 'excel analyst', 'dashboard analyst', 'reporting analyst'] },
    { slug: 'data_science', keywords: ['data scientist', 'analytics', 'statistics', 'predictive modeling'] },
    { slug: 'data_engineering', keywords: ['data engineer', 'etl', 'elt', 'spark', 'kafka', 'airflow', 'warehouse', 'pipeline'] },
    { slug: 'site_reliability_engineer', keywords: ['site reliability engineer', 'sre engineer', 'sre', 'slo', 'error budget', 'incident response', 'prometheus'] },
    { slug: 'devops_cloud', keywords: ['devops', 'ci/cd', 'docker', 'kubernetes', 'terraform'] },
    { slug: 'cloud_architect', keywords: ['cloud architect', 'solution architect', 'solutions architect', 'aws architect', 'azure architect', 'gcp architect'] },
    { slug: 'network_engineer', keywords: ['network engineer', 'network administrator', 'ccna', 'routing', 'switching', 'subnetting', 'networking'] },
    { slug: 'linux_system_admin', keywords: ['linux administrator', 'linux admin', 'system administrator', 'sysadmin', 'server administrator', 'linux server'] },
    { slug: 'database_admin', keywords: ['database administrator', 'dba', 'postgres admin', 'mysql admin', 'database admin', 'database operations'] },
    { slug: 'technical_support_engineer', keywords: ['technical support', 'it support', 'helpdesk', 'desktop support', 'support engineer'] },
    { slug: 'qa_automation', keywords: ['qa', 'quality assurance', 'test automation', 'automation tester', 'sdet', 'playwright', 'selenium'] },
    { slug: 'ui_ux_design', keywords: ['ui ux', 'ux designer', 'ui designer', 'product designer', 'figma', 'user research'] },
    { slug: 'product_manager', keywords: ['product manager', 'product management', 'associate product manager', 'apm', 'product owner'] },
    { slug: 'business_analyst', keywords: ['business analyst', 'business analysis', 'requirements analyst', 'process analyst', 'functional analyst'] },
    { slug: 'game_development', keywords: ['game developer', 'game development', 'unity', 'godot', 'unreal'] },
    { slug: 'ar_vr_developer', keywords: ['ar developer', 'vr developer', 'xr developer', 'augmented reality', 'virtual reality', 'mixed reality', 'webxr'] },
    { slug: 'embedded_iot', keywords: ['embedded', 'iot', 'internet of things', 'firmware', 'microcontroller', 'arduino', 'esp32'] },
    { slug: 'robotics_engineer', keywords: ['robotics', 'robotics engineer', 'ros', 'ros2', 'autonomous robot', 'slam'] },
    { slug: 'blockchain_web3', keywords: ['blockchain', 'web3', 'solidity', 'smart contract', 'ethereum', 'dapp'] },
    { slug: 'cloud_security_engineer', keywords: ['cloud security', 'cloud security engineer', 'aws security', 'azure security', 'gcp security', 'guardduty', 'security hub', 'cloud iam', 'cspm'] },
    { slug: 'cybersecurity', keywords: ['cybersecurity', 'cyber security', 'information security', 'infosec', 'security engineer'] },
    { slug: 'soc_analyst', keywords: ['soc analyst', 'security operations', 'siem', 'blue team', 'threat hunting'] },
    { slug: 'penetration_tester', keywords: ['penetration tester', 'pentester', 'ethical hacker', 'web app pentest', 'bug bounty'] },
    { slug: 'salesforce_developer', keywords: ['salesforce', 'apex', 'lightning web components', 'lwc', 'crm developer', 'salesforce developer'] },
    { slug: 'technical_writing', keywords: ['technical writer', 'documentation', 'docs writer', 'api writer', 'developer documentation'] },
    { slug: 'no_code_low_code_developer', keywords: ['no code', 'low code', 'nocode', 'bubble', 'webflow', 'appsheet', 'power platform'] },
    { slug: 'rpa_developer', keywords: ['rpa', 'robotic process automation', 'uipath', 'power automate', 'automation developer'] },
    { slug: 'ios_developer', keywords: ['ios', 'swift', 'swiftui', 'iphone app'] },
    { slug: 'android', keywords: ['android', 'mobile', 'kotlin', 'app developer'] }
];

const ROADMAP_STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'app',
    'apps',
    'career',
    'cloud',
    'code',
    'developer',
    'development',
    'engineer',
    'engineering',
    'for',
    'in',
    'of',
    'platform',
    'specialist',
    'systems',
    'the',
    'with'
]);

const ROADMAP_LOW_SIGNAL_TOKENS = new Set([
    'app',
    'cloud',
    'code',
    'data',
    'developer',
    'engineer',
    'management',
    'mobile',
    'product',
    'security',
    'software',
    'support',
    'system',
    'systems',
    'tech',
    'web'
]);

const BROAD_ROADMAP_SLUGS = new Set([
    'ai_ml_engineer',
    'backend',
    'cloud_architect',
    'cybersecurity',
    'data_analyst',
    'data_science',
    'devops_cloud',
    'frontend',
    'fullstack',
    'game_development',
    'general',
    'product_manager',
    'ui_ux_design'
]);

function normalizeMatchText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/c\+\+/g, 'cplusplus')
        .replace(/c#/g, 'csharp')
        .replace(/\.net/g, 'dotnet')
        .replace(/ci\/cd/g, 'cicd')
        .replace(/ui\/ux/g, 'ui ux')
        .replace(/ar\/vr/g, 'ar vr')
        .replace(/no-code/g, 'no code')
        .replace(/low-code/g, 'low code')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeRoadmapSlug(value) {
    if (!value) return '';
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\.(json|html)$/i, '')
        .replace(/roadmap\.sh/gi, '')
        .replace(/roadmaps?/gi, ' ')
        .replace(/&/g, ' and ')
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function getRoadmapSlugCandidates(rawUrl) {
    if (typeof rawUrl !== 'string') return [];
    const input = rawUrl.trim();
    if (!input || /coming-soon/i.test(input)) return [];

    const candidates = [];
    const pushCandidate = (value) => {
        const normalized = normalizeRoadmapSlug(value);
        if (normalized && !candidates.includes(normalized)) {
            candidates.push(normalized);
        }
    };

    pushCandidate(input);

    try {
        const parsed = new URL(input, window.location.origin);
        parsed.pathname
            .split('/')
            .filter(Boolean)
            .forEach(pushCandidate);
    } catch (err) {
        input.split(/[/?#=&]+/g).forEach(pushCandidate);
    }

    return candidates;
}

function extractRoadmapSlug(rawUrl) {
    const candidates = getRoadmapSlugCandidates(rawUrl);
    return candidates.find(slug => KNOWN_ROADMAP_SLUGS.has(slug)) || candidates[0] || '';
}

function getCareerTextParts(career) {
    const skills = Array.isArray(career?.skills) ? career.skills : [career?.skills];
    return [
        career?.title,
        career?.roadmapUrl,
        career?.description,
        career?.nextSteps,
        ...skills
    ].filter(part => typeof part === 'string' && part.trim().length > 0);
}

function containsNormalizedPhrase(text, phrase) {
    if (!text || !phrase) return false;
    return ` ${text} `.includes(` ${phrase} `);
}

function getRoadmapTokens(value) {
    return normalizeMatchText(value)
        .split(' ')
        .filter(token => token.length > 1 && !ROADMAP_STOP_WORDS.has(token));
}

function countSharedTokens(leftTokens, rightTokens) {
    const left = new Set(leftTokens);
    return rightTokens.reduce((count, token) => count + (left.has(token) ? 1 : 0), 0);
}

function getKeywordScore(text, titleText, keyword) {
    const normalizedKeyword = normalizeMatchText(keyword);
    if (!containsNormalizedPhrase(text, normalizedKeyword)) return 0;

    const keywordTokens = normalizedKeyword.split(' ').filter(Boolean);
    const titleHit = containsNormalizedPhrase(titleText, normalizedKeyword);
    const lowSignalOnly = keywordTokens.length === 1 && ROADMAP_LOW_SIGNAL_TOKENS.has(keywordTokens[0]);
    let score = 6 + Math.min(14, normalizedKeyword.length / 2) + Math.max(0, keywordTokens.length - 1) * 3;

    if (titleHit) score += 12;
    if (lowSignalOnly) score *= 0.35;

    return score;
}

function scoreRoadmapRule(career, rule) {
    const titleText = normalizeMatchText(career?.title);
    const text = normalizeMatchText(getCareerTextParts(career).join(' '));
    const slugTokens = getRoadmapTokens(rule.slug.replace(/_/g, ' '));
    const titleTokens = getRoadmapTokens(career?.title);
    const allTokens = getRoadmapTokens(text);
    let score = 0;

    if (!text && !titleText) return 0;

    if (normalizeRoadmapSlug(career?.title) === rule.slug) {
        score += 45;
    }

    for (const keyword of rule.keywords) {
        score += getKeywordScore(text, titleText, keyword);
    }

    const titleOverlap = countSharedTokens(titleTokens, slugTokens);
    if (titleOverlap > 0) {
        score += titleOverlap * 5;
        if (titleOverlap === slugTokens.length) score += 10;
    }

    const overallOverlap = countSharedTokens(allTokens, slugTokens);
    if (overallOverlap > 0) {
        score += overallOverlap * 1.2;
    }

    return score;
}

function inferRoadmapSlugFromCareer(career) {
    const ranked = ROADMAP_KEYWORD_RULES
        .map(rule => ({ slug: rule.slug, score: scoreRoadmapRule(career, rule) }))
        .filter(match => match.score > 0)
        .sort((left, right) => right.score - left.score);

    const best = ranked[0];
    const second = ranked[1];
    if (!best || best.score < 9) return '';
    if (second && best.score - second.score < 2 && best.score < 24) return '';

    return best.slug;
}

function resolveRoadmapSlug(career) {
    const fromAiUrl = extractRoadmapSlug(career?.roadmapUrl);
    const fromKeywords = inferRoadmapSlugFromCareer(career);

    if (fromKeywords && KNOWN_ROADMAP_SLUGS.has(fromKeywords)) {
        if (!fromAiUrl || fromAiUrl === fromKeywords || BROAD_ROADMAP_SLUGS.has(fromAiUrl)) {
            return fromKeywords;
        }
    }

    if (fromAiUrl && KNOWN_ROADMAP_SLUGS.has(fromAiUrl)) {
        return fromAiUrl;
    }

    if (fromKeywords && KNOWN_ROADMAP_SLUGS.has(fromKeywords)) {
        return fromKeywords;
    }

    if (fromAiUrl) {
        const fuzzyMatch = fuzzyMatchRoadmapSlug(fromAiUrl);
        if (fuzzyMatch) {
            return fuzzyMatch;
        }
    }

    if (career?.title) {
        const titleSlug = normalizeRoadmapSlug(career.title);
        if (KNOWN_ROADMAP_SLUGS.has(titleSlug)) {
            return titleSlug;
        }

        const titleFuzzy = fuzzyMatchRoadmapSlug(titleSlug);
        if (titleFuzzy) {
            return titleFuzzy;
        }
    }

    return 'general';
}

function resolveRoadmapUrl(career) {
    const slug = resolveRoadmapSlug(career);
    return KNOWN_ROADMAP_SLUGS.has(slug) ? `/roadmap/${slug}` : ROADMAP_FALLBACK_URL;
}


function fuzzyMatchRoadmapSlug(input) {
    if (!input) return '';
    const normalizedInput = normalizeMatchText(input).replace(/\s/g, '');
    if (!normalizedInput) return '';

    let bestMatch = '';
    let bestScore = 0;

    for (const slug of KNOWN_ROADMAP_SLUGS) {
        if (slug === 'general') continue;
        const normalizedSlug = normalizeMatchText(slug.replace(/_/g, ' ')).replace(/\s/g, '');
        let score = getStringSimilarityScore(normalizedInput, normalizedSlug);

        if (normalizedSlug.includes(normalizedInput) || normalizedInput.includes(normalizedSlug)) {
            score += 0.15;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = slug;
        }
    }

    return bestScore >= 0.72 ? bestMatch : '';
}

function getStringSimilarityScore(left, right) {
    if (!left || !right) return 0;
    if (left === right) return 1;

    const distance = getLevenshteinDistance(left, right);
    return 1 - (distance / Math.max(left.length, right.length));
}

function getLevenshteinDistance(left, right) {
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

    for (let i = 1; i <= left.length; i += 1) {
        let diagonal = previous[0];
        previous[0] = i;

        for (let j = 1; j <= right.length; j += 1) {
            const temp = previous[j];
            const cost = left[i - 1] === right[j - 1] ? 0 : 1;
            previous[j] = Math.min(
                previous[j] + 1,
                previous[j - 1] + 1,
                diagonal + cost
            );
            diagonal = temp;
        }
    }

    return previous[right.length];
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
    const normalizedCareer = {
        title,
        description: String(career.description || 'Recommended based on your quiz answers.').trim(),
        skills: normalizeSkills(career.skills),
        salaryRange: String(career.salaryRange || 'Varies by role and experience').trim(),
        demand: String(career.demand || 'Growing').trim(),
        nextSteps: String(career.nextSteps || 'Start with the roadmap and build small projects.').trim(),
        matchPercent,
        roadmapUrl: String(career.roadmapUrl || '').trim()
    };

    return {
        ...normalizedCareer,
        roadmapUrl: resolveRoadmapSlug(normalizedCareer)
    };
}

function getCareerDedupeKey(career) {
    const slug = resolveRoadmapSlug(career);
    if (slug && slug !== 'general') return `slug:${slug}`;
    return `title:${normalizeMatchText(career?.title)}`;
}

function dedupeCareers(careers) {
    const seen = new Set();
    return careers.filter((career) => {
        const key = getCareerDedupeKey(career);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
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

    return dedupeCareers(rawCareers
        .map((career, index) => normalizeCareerEntry(career, index))
        .filter(Boolean));
}

// --- Load More Careers ---
async function loadMoreCareers() {
    const loadBtn = document.getElementById('loadMoreBtn');
    if (!loadBtn) return;
    const defaultLabel = loadBtn.dataset.defaultLabel || loadBtn.textContent;
    loadBtn.dataset.defaultLabel = defaultLabel;
    loadBtn.textContent = '⏳ Finding more paths...';
    loadBtn.disabled = true;

    try {
        const container = document.getElementById('resultCards');
        if (!container) throw new Error('Results container not found');

        const existingTitles = new Set(
            Array.from(container.querySelectorAll('.result-card h3')).map(el => normalizeMatchText(el.textContent))
        );
        const existingSlugs = new Set(
            Array.from(container.querySelectorAll('.result-card'))
                .map(el => el.dataset.roadmapSlug)
                .filter(Boolean)
        );
        const excludedTitles = Array.from(existingTitles).filter(Boolean).slice(0, 8).join(', ') || 'none';
        const excludedSlugs = Array.from(existingSlugs).filter(Boolean).slice(0, 8).join(', ') || 'none';

        const response = await callGemini(
            'Based on our conversation, suggest 3 MORE different career paths that could also be a good fit. Provide careers that are DIFFERENT from the ones you already recommended. Avoid these normalized titles: ' + excludedTitles + '. Avoid these roadmap slugs: ' + excludedSlugs + '. Use the same JSON result format with "type": "result". The "roadmapUrl" field MUST be one exact bare local roadmap slug from the provided list; do not use full URLs or coming-soon.'
        );

        let careers = extractCareers(response);

        if (careers.length === 0) {
            const strictResponse = await callGemini(
                'Return only JSON with {"type":"result","careers":[...]} and exactly 3 unique careers. Avoid titles: ' + excludedTitles + '. Avoid roadmap slugs: ' + excludedSlugs + '. Keep fields: title, matchPercent, description, skills, salaryRange, demand, nextSteps, roadmapUrl. roadmapUrl must be an exact bare local roadmap slug.'
            );
            careers = extractCareers(strictResponse);
        }

        if (careers.length === 0) {
            throw new Error('No career paths returned');
        }

        const uniqueCareers = careers.filter((career) => {
            const titleKey = normalizeMatchText(career.title);
            const slug = resolveRoadmapSlug(career);
            return !existingTitles.has(titleKey) && (!slug || slug === 'general' || !existingSlugs.has(slug));
        });

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
    const roadmapSlug = resolveRoadmapSlug(career);

    return `
    <div class="result-card new" data-roadmap-slug="${sanitize(roadmapSlug)}" style="animation-delay:${(index - 1) * 0.15}s">
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
            const finalUrl = resolveRoadmapUrl({ ...career, roadmapUrl: roadmapSlug });
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
    retryCount = 0; // Reset retry counter on successful question
    questionCount = data.questionNumber || questionCount + 1;
    updateProgress(questionCount, data.phase || 1);

    const insightEl = document.getElementById('aiInsight');
    if (insightEl) {
        if (data.insight && questionCount > 1) {
            insightEl.textContent = '💡 ' + data.insight;
            insightEl.style.display = 'block';
            insightEl.style.animation = 'none';
            insightEl.offsetHeight; // trigger reflow
            insightEl.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
            insightEl.style.display = 'none';
        }
    }

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
            optEl.addEventListener('click', () => selectOption(opt, optEl), { signal });
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
            showErrorUI(err);
        }
    }, 500);
}

// --- Show Results ---
function showResults(data) {
    retryCount = 0;
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
    if (lastSelectedOption) {
        // Re-send the last selected answer
        selectOption(lastSelectedOption, document.createElement('button'));
    } else {
        startNextQuestion();
    }
}

// --- Error UI ---
function showErrorUI(errorOrMessage) {
    retryCount++;

    const message = typeof errorOrMessage === 'string'
        ? errorOrMessage
        : String(errorOrMessage?.message || '').trim();
    const status = Number.isFinite(errorOrMessage?.status) && errorOrMessage.status > 0 ? errorOrMessage.status : 0;
    const retryAfterMs = Number.parseInt(errorOrMessage?.retryAfterMs, 10) || 0;
    const code = String(errorOrMessage?.code || (status ? `AI_${status}` : 'AI_CLIENT')).trim();
    const detail = message
        ? sanitize(message)
        : "Our AI bunny tripped! Don't worry - our team is on it.";
    const waitNote = retryAfterMs > 0
        ? '<div style="color:var(--muted);font-size:0.8rem;margin-top:0.55rem;">Suggested wait: ' + sanitize(formatWaitTime(retryAfterMs)) + '</div>'
        : '';
    const codeNote = code
        ? '<div style="color:var(--muted);font-size:0.75rem;margin-top:0.4rem;">Reference: ' + sanitize(code) + (status ? ' / HTTP ' + sanitize(String(status)) : '') + '</div>'
        : '';

    const isMaxRetries = retryCount >= MAX_RETRIES_PER_QUESTION;
    const retryNote = isMaxRetries
        ? '<div style="color:var(--danger);font-size:0.8rem;margin-top:0.6rem;font-weight:700;">Multiple attempts failed. Please try again later or report this issue.</div>'
        : '<div style="color:var(--muted);font-size:0.8rem;margin-top:0.6rem;">Attempt ' + retryCount + ' of ' + MAX_RETRIES_PER_QUESTION + '</div>';

    document.getElementById('questionText').innerHTML = [
        '<div style="text-align:center;">',
        '  <div style="font-size:2.5rem;margin-bottom:0.8rem;">🐰💔</div>',
        '  <div style="font-weight:800;font-size:1.1rem;margin-bottom:0.5rem;">Oops! Something went wrong on our side.</div>',
        '  <div style="color:var(--muted);font-size:0.9rem;line-height:1.6;">' + detail + '</div>',
        waitNote,
        retryNote,
        codeNote,
        '</div>'
    ].join('');
    const subject = encodeURIComponent('SkillBun Quiz Error');
    const body = encodeURIComponent(buildErrorReportBody({
        code,
        message,
        originalMessage: errorOrMessage?.originalMessage,
        retryAfterMs,
        status
    }));
    const retryBtnHtml = !isMaxRetries
        ? '<button class="quiz-option" id="retryLastQuestionBtn"><span class="option-label">🔄</span><span class="option-text">Try Again (' + (MAX_RETRIES_PER_QUESTION - retryCount) + ' left)</span></button>'
        : '<button class="quiz-option" id="retryLastQuestionBtn"><span class="option-label">🏠</span><span class="option-text">Back to Home</span></button>';
    document.getElementById('optionsContainer').innerHTML = '<a class="quiz-option" href="mailto:' + encodeURIComponent(SUPPORT_EMAIL) + '?subject=' + subject + '&body=' + body + '" style="text-decoration:none;"><span class="option-label">📧</span><span class="option-text">Report to Team</span></a>' + retryBtnHtml;
    const retryBtn = document.getElementById('retryLastQuestionBtn');
    if (retryBtn) {
        if (isMaxRetries) {
            retryBtn.addEventListener('click', () => { window.location.href = '/'; }, { signal });
        } else {
            retryBtn.addEventListener('click', retryLastQuestion, { signal });
        }
    }
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
        showErrorUI(err);
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
    }, { signal });
}

const retakeBtnEl = document.getElementById('retakeBtn');
if (retakeBtnEl) {
    retakeBtnEl.addEventListener('click', () => {
        resetQuizState();
    }, { signal });
}

const loadMoreBtnEl = document.getElementById('loadMoreBtn');
if (loadMoreBtnEl) {
    loadMoreBtnEl.dataset.defaultLabel = loadMoreBtnEl.textContent;
    loadMoreBtnEl.addEventListener('click', loadMoreCareers, { signal });
}

async function initQuizPage() {
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) startBtn.disabled = true;

    const hasProfile = loadProfile();
    if (!hasProfile) return;

    await fetchSecurityConfig();
    const hasReusableProof = await refreshHumanProofSession();

    if (hasReusableProof) {
        const wrap = document.getElementById('captchaWrap');
        if (wrap) wrap.style.display = 'none';
        setCaptchaStatus('Security already verified for this session.', 'ok');
    } else if (securityConfig.captchaEnabled) {
        await initCaptcha();
    } else {
        await verifyHumanProof();
    }

    const userBadge = document.getElementById('userBadge');
    if (userBadge) userBadge.addEventListener('click', toggleDropdown, { signal });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser, { signal });

    if (startBtn) startBtn.disabled = false;
}

    void initQuizPage();

    return () => {
        eventController.abort();
    };
}
