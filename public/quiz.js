// ===== QUIZ PAGE - Gemini API Integration =====

// --- State ---
let conversationHistory = [];
let questionCount = 0;
let totalQuestions = 15; // Initial estimate, AI may finish early or take longer
let lastSelectedOption = null; // stores last answer for retry
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

    if (/quota|too many|rate|busy|limit/i.test(message)) {
        return 'AI is receiving too many requests right now. Please wait a moment and tap Try Again.';
    }

    if (/authentication|credential|api key|not configured/i.test(message)) {
        return 'AI is not configured correctly right now. Please report this to the SkillBun team.';
    }

    if (/empty response|temporarily unavailable|timed out|could not reach|network/i.test(message)) {
        return 'AI took too long to answer. Please tap Try Again and we will continue from the same question.';
    }

    if (/parse|json/i.test(message)) {
        return 'AI returned an answer in the wrong format. Please tap Try Again and I will request a clean answer.';
    }

    return message || "Our AI bunny tripped! Don't worry - our team is on it.";
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
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});

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
    clearHumanProof();

    // Redirect back to homepage
    window.location.href = '/';
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
For every career, provide the closest matching exact internal ID in the 'roadmapUrl' field from this exact list: ['ai_ml_engineer', 'ai_research_engineer', 'analytics_engineer', 'android', 'angular_developer', 'api_platform_engineer', 'application_security_engineer', 'ar_vr_developer', 'aws_cloud_engineer', 'azure_cloud_engineer', 'backend', 'bi_developer', 'blockchain_web3', 'business_analyst', 'c_cpp_systems_developer', 'cloud_architect', 'cloud_security_engineer', 'computer_vision_engineer', 'content_designer', 'cybersecurity', 'data_analyst', 'data_engineering', 'data_governance_specialist', 'data_science', 'data_visualization_specialist', 'database_admin', 'design_systems_engineer', 'desktop_app_developer', 'devops_cloud', 'dfir_analyst', 'digital_marketing_analyst', 'dotnet_developer', 'elixir_phoenix_developer', 'embedded_iot', 'finops_engineer', 'flutter_developer', 'frontend', 'fullstack', 'game_development', 'gcp_cloud_engineer', 'generative_ai_app_developer', 'geospatial_data_scientist', 'go_developer', 'graphql_api_developer', 'grc_analyst', 'iam_engineer', 'ios_developer', 'java_developer', 'kubernetes_engineer', 'linux_system_admin', 'llmops_engineer', 'macos_developer', 'malware_analyst', 'mlops_engineer', 'network_engineer', 'nextjs_developer', 'nlp_engineer', 'no_code_low_code_developer', 'observability_engineer', 'penetration_tester', 'php_laravel_developer', 'platform_engineer', 'product_designer', 'product_manager', 'prompt_engineer', 'python_developer', 'qa_automation', 'react_native_developer', 'recommendation_systems_engineer', 'red_team_operator', 'reinforcement_learning_engineer', 'release_engineer', 'robotics_engineer', 'rpa_developer', 'ruby_on_rails_developer', 'rust_developer', 'salesforce_developer', 'scala_developer', 'scrum_master_agile_coach', 'seo_specialist', 'serverless_developer', 'service_designer', 'shopify_developer', 'site_reliability_engineer', 'soc_analyst', 'speech_ai_engineer', 'svelte_developer', 'technical_artist', 'technical_support_engineer', 'technical_writing', 'terraform_iac_engineer', 'threat_intelligence_analyst', 'ui_ux_design', 'unity_developer', 'unreal_engine_developer', 'ux_researcher', 'vue_developer', 'windows_app_developer', 'wordpress_developer', 'general']. If no exact match exists, default to 'general'. Do NOT provide full URLs, just the ID string.
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

        throw new Error(getFriendlyAiErrorMessage(err));
    }
}

function buildQuizUserMessage(userMessage) {
    if (!quizResults && questionCount >= 18) {
        return `${userMessage}\n\nYou have now asked enough questions. Return the final recommendation JSON now with "type": "result" and exactly 3 careers.`;
    }

    return userMessage;
}

function extractGeminiText(data) {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';

    const textPart = parts.find(part => typeof part?.text === 'string' && part.text.trim());
    return textPart?.text || '';
}

async function fetchGeminiPayload(payload) {
    let lastError = null;

    for (let attempt = 0; attempt <= AI_CLIENT_MAX_RETRIES; attempt += 1) {
        try {
            const headers = { 'Content-Type': 'application/json' };
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

    throw new Error('Could not parse Gemini response as JSON');
}

function normalizeQuizResponse(response) {
    if (!response || typeof response !== 'object') {
        throw new Error('AI response was not a JSON object');
    }

    if (response.type === 'result' || Array.isArray(response.careers) || (response.careers && typeof response.careers === 'object') || Array.isArray(response.results)) {
        const careers = extractCareers(response).slice(0, 3);
        if (careers.length === 0) {
            throw new Error('AI result did not include usable careers');
        }

        return {
            ...response,
            type: 'result',
            careers
        };
    }

    const options = normalizeQuestionOptions(response.options);
    if (!String(response.question || '').trim() || options.length !== 4) {
        throw new Error('AI question did not include one question and four options');
    }

    const parsedPhase = Number.parseInt(response.phase, 10);
    const parsedQuestionNumber = Number.parseInt(response.questionNumber, 10);

    return {
        ...response,
        type: 'question',
        phase: Number.isFinite(parsedPhase) ? Math.max(1, Math.min(parsedPhase, 4)) : 1,
        questionNumber: Number.isFinite(parsedQuestionNumber) ? parsedQuestionNumber : questionCount + 1,
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

    return rawOptions
        .map((option, index) => {
            const label = String(option?.label || String.fromCharCode(65 + index)).trim().slice(0, 1).toUpperCase();
            const text = String(option?.text || option?.value || '').trim();

            if (!text) return null;
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

function normalizeRoadmapSlug(value) {
    if (!value) return '';
    let slug = String(value).trim().toLowerCase().replace(/[^a-z_]/g, '');
    return slug;
}

function extractRoadmapSlug(rawUrl) {
    if (typeof rawUrl !== 'string') return '';
    const input = rawUrl.trim();
    if (!input || input.includes('coming-soon')) return '';
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
        return `/roadmap/${fromAiUrl}`;
    }

    const fromKeywords = inferRoadmapSlugFromCareer(career);
    if (fromKeywords && KNOWN_ROADMAP_SLUGS.has(fromKeywords)) {
        return `/roadmap/${fromKeywords}`;
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
    const defaultLabel = loadBtn.dataset.defaultLabel || loadBtn.textContent;
    loadBtn.dataset.defaultLabel = defaultLabel;
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
            showErrorUI(err.message);
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
    if (lastSelectedOption) {
        // Re-send the last selected answer
        selectOption(lastSelectedOption, document.createElement('button'));
    } else {
        startNextQuestion();
    }
}

// --- Error UI ---
function showErrorUI(message) {
    const detail = typeof message === 'string' && message.trim()
        ? sanitize(message.trim())
        : "Our AI bunny tripped! Don't worry - our team is on it.";

    document.getElementById('questionText').innerHTML = [
        '<div style="text-align:center;">',
        '  <div style="font-size:2.5rem;margin-bottom:0.8rem;">🐰💔</div>',
        '  <div style="font-weight:800;font-size:1.1rem;margin-bottom:0.5rem;">Oops! Something went wrong on our side.</div>',
        `  <div style="color:var(--muted);font-size:0.9rem;line-height:1.6;">${detail}</div>`,
        '</div>'
    ].join('');
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
        showErrorUI(err.message);
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
        resetQuizState();
    });
}

const loadMoreBtnEl = document.getElementById('loadMoreBtn');
if (loadMoreBtnEl) {
    loadMoreBtnEl.dataset.defaultLabel = loadMoreBtnEl.textContent;
    loadMoreBtnEl.addEventListener('click', loadMoreCareers);
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
    if (userBadge) userBadge.addEventListener('click', toggleDropdown);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

    if (startBtn) startBtn.disabled = false;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizPage);
} else {
    initQuizPage();
}
