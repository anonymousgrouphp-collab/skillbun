import { getFirebaseServices } from './firebaseClient';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export function mountCounsellorRuntime() {
// ===== AI COUNSELLOR CHAT - Gemini API Integration =====

const eventController = new AbortController();
const { signal } = eventController;

// --- State ---
let conversationHistory = [];
let userProfile = {};
let isSending = false;

// --- Configuration ---
const HUMAN_PROOF_HEADER = 'x-skillbun-human';
const HUMAN_PROOF_STORAGE_KEY = 'sb_human_proof';
const SKILLBUN_CONTACT_EMAIL = 'harsh@skillbun.tech';
const MAX_HISTORY_ITEMS = 48;
const MAX_HISTORY_TEXT = 22000;
const AI_CLIENT_MAX_RETRIES = 1;
const AI_RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

// --- Rate Limiting ---
const RATE_LIMIT_MAX = 15;           // max messages per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_KEY = 'sb_counsel_rl';

function getRateLimitData() {
    try {
        const raw = localStorage.getItem(RATE_LIMIT_KEY);
        if (!raw) return { count: 0, windowStart: Date.now() };

        const parsed = JSON.parse(raw);
        const count = Number.parseInt(parsed?.count, 10);
        const windowStart = Number.parseInt(parsed?.windowStart, 10);

        if (!Number.isFinite(count) || count < 0 || !Number.isFinite(windowStart) || windowStart <= 0) {
            return { count: 0, windowStart: Date.now() };
        }

        return { count, windowStart };
    } catch {
        return { count: 0, windowStart: Date.now() };
    }
}

function checkRateLimit() {
    const now = Date.now();
    let data = getRateLimitData();

    // Reset window if expired
    if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
        data = { count: 0, windowStart: now };
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    }

    if (data.count >= RATE_LIMIT_MAX) {
        const msLeft = RATE_LIMIT_WINDOW_MS - (now - data.windowStart);
        const minsLeft = Math.ceil(msLeft / 60000);
        return {
            allowed: false,
            message: `⏳ You've reached the limit of ${RATE_LIMIT_MAX} messages per hour. Please wait ~${minsLeft} minute${minsLeft !== 1 ? 's' : ''} before sending again.`
        };
    }

    return { allowed: true };
}

function incrementRateLimit() {
    const now = Date.now();
    let data = getRateLimitData();

    if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
        data = { count: 0, windowStart: now };
    }

    data.count += 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

function hasMarkdown() {
    return typeof marked?.parse === 'function';
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
        return `AI is cooling down. Please wait ${formatWaitTime(retryAfterMs)} and send again.`;
    }

    if (/quota|too many|rate|busy|limit/i.test(message)) {
        return 'AI is receiving too many requests right now. Please wait a moment and send again.';
    }

    if (/authentication|credential|api key|not configured/i.test(message)) {
        return 'AI is not configured correctly right now. Please contact the SkillBun team.';
    }

    if (/empty response|temporarily unavailable|timed out|could not reach|network/i.test(message)) {
        return 'Bun-Bot could not reach AI reliably. Please send again and I will continue from here.';
    }

    if (/security|human verification/i.test(message)) {
        return message;
    }

    return message || 'Bun-Bot could not answer right now. Please try again.';
}

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

if (hasMarkdown()) {
    marked.setOptions({
        headerIds: false,
        mangle: false,
        breaks: true
    });
}

function getEl(id) {
    return document.getElementById(id);
}

function toggleSecurityBanner(show) {
    const banner = getEl('securityBanner');
    if (!banner) return;
    banner.style.display = show ? 'block' : 'none';
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

// --- Initialize ---
async function initCounsellorPage() {
    const hasProfile = loadProfile();
    if (!hasProfile) return;

    const textarea = getEl('chatInput');
    const sendBtn = getEl('sendBtn');
    const userBadge = getEl('userBadge');
    const logoutBtn = getEl('logoutBtn');

    if (userBadge) userBadge.addEventListener('click', toggleDropdown, { signal });
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser, { signal });

    if (!textarea || !sendBtn) {
        console.error('Counsellor UI is missing required elements.');
        return;
    }

    // Auto-resize textarea
    textarea.addEventListener('input', function () {
        this.style.height = '52px';
        this.style.height = `${this.scrollHeight}px`;
        this.style.overflowY = this.scrollHeight > 150 ? 'auto' : 'hidden';
    }, { signal });

    // Enter key to send (Shift+Enter for newline)
    textarea.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }, { signal });

    sendBtn.addEventListener('click', sendMessage, { signal });

    // Suggestion chips
    document.querySelectorAll('.suggestion-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            const suggestionsEl = getEl('chatSuggestions');
            if (suggestionsEl) suggestionsEl.style.display = 'none';
            const inputEl = getEl('chatInput');
            if (inputEl) {
                inputEl.value = chip.textContent.replace(/^[^\w]+/, '').trim();
                inputEl.dispatchEvent(new Event('input'));
            }
            sendMessage();
        }, { signal });
    });

    // Clear chat button
    const clearBtn = getEl('clearChatBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const container = getEl('chatMessages');
            if (!container) return;
            container.innerHTML = '';
            conversationHistory = [];
            const suggestionsEl = getEl('chatSuggestions');
            if (suggestionsEl) suggestionsEl.style.display = 'flex';
        }, { signal });
    }

    try {
        await fetchSecurityConfig();
        const hasReusableProof = await refreshHumanProofSession();

        if (hasReusableProof) {
            toggleSecurityBanner(false);
            setCaptchaStatus('Security already verified for this session.', 'ok');
        } else if (securityConfig.captchaEnabled) {
            toggleSecurityBanner(true);
            await initCaptcha();
        } else {
            await verifyHumanProof();
        }
    } catch (err) {
        console.error('Security init error:', err);
    }
    
    // Auto-send query if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery && hasFreshHumanProof()) {
        const inputEl = getEl('chatInput');
        if (inputEl) {
            inputEl.value = initialQuery;
            sendMessage();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
}

// --- Security / Captcha ---
function setCaptchaStatus(message, tone) {
    const statusEl = getEl('captchaStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.color = tone === 'error' ? 'var(--danger)' : tone === 'ok' ? 'var(--success)' : 'var(--text)';
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
        return `Security check timed out (${code}). Please retry.`;
    }

    return code ? `Security check failed (${code}). Please refresh.` : 'Security check failed. Please refresh.';
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
        if (window.turnstile) return resolve();

        const existing = document.querySelector('script[data-turnstile="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true, signal });
            existing.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true, signal });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Turnstile script failed to load'));
        document.head.appendChild(script);
    });
}

async function initCaptcha() {
    if (!securityConfig.captchaEnabled || hasFreshHumanProof()) return;

    if (captchaWidgetId !== null && window.turnstile) {
        toggleSecurityBanner(true);
        setCaptchaStatus('Complete the security check below.', 'error');
        return;
    }

    if (captchaInitPromise) {
        await captchaInitPromise;
        return;
    }

    captchaInitPromise = (async () => {
        toggleSecurityBanner(true);
        setCaptchaStatus('Completing security check...');

        try {
            await loadTurnstileScript();
            if (!window.turnstile) throw new Error('Turnstile failed');

            captchaWidgetId = window.turnstile.render('#captchaWidget', {
                sitekey: securityConfig.captchaSiteKey,
                theme: localStorage.getItem('sb_theme') || 'dark',
                callback: (token) => {
                    captchaToken = token;
                    setCaptchaStatus('Security check passed.', 'ok');
                    setTimeout(() => toggleSecurityBanner(false), 2000);
                },
                'expired-callback': () => {
                    captchaToken = '';
                    setCaptchaStatus('Security check expired. Please verify again.', 'error');
                    toggleSecurityBanner(true);
                },
                'error-callback': (errorCode) => {
                    captchaToken = '';
                    setCaptchaStatus(getCaptchaErrorMessage(errorCode), 'error');
                }
            });
        } catch (err) {
            setCaptchaStatus('Security widget failed to load.', 'error');
        }
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
            toggleSecurityBanner(true);
            setCaptchaStatus('Please complete verification below.', 'error');
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
            setCaptchaStatus('Verification failed. Please try again.', 'error');
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

        if (securityConfig.captchaEnabled && window.turnstile && captchaWidgetId !== null) {
            window.turnstile.reset(captchaWidgetId);
            captchaToken = '';
        }

        toggleSecurityBanner(false);
        return true;
    } catch (err) {
        toggleSecurityBanner(true);
        setCaptchaStatus('Verification failed. Please try again.', 'error');
        return false;
    }
}

// --- User Profile Handling ---
function loadProfile() {
    const { name, degree, year } = getStoredProfile();
    if (!degree || !year) {
        redirectToProfileSetup('counsellor.html');
        return false;
    }

    userProfile = { name: name || 'Student', degree, year };

    const badge = getEl('userBadge');
    const dropdownName = getEl('dropdownName');
    const dropdownDegree = getEl('dropdownDegree');
    const dropdownYear = getEl('dropdownYear');

    if (badge) badge.textContent = `User: ${name}`;
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownDegree) dropdownDegree.textContent = degree;
    if (dropdownYear) dropdownYear.textContent = year;
    return true;
}

function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = getEl('userDropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('show');
}

document.addEventListener('click', (event) => {
    const dropdown = getEl('userDropdown');
    const badge = getEl('userBadge');
    if (!dropdown || !dropdown.classList.contains('show')) return;

    const clickedBadge = badge && badge.contains(event.target);
    if (!dropdown.contains(event.target) && !clickedBadge) {
        dropdown.classList.remove('show');
    }
}, { signal });

function logoutUser(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('sb_name');
    localStorage.removeItem('sb_email');
    localStorage.removeItem('sb_degree');
    localStorage.removeItem('sb_year');
    localStorage.removeItem(RATE_LIMIT_KEY); // Fix #4: clear rate-limit on logout
    clearHumanProof();
    window.location.href = '/';
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
}

function sanitizeHTML(unsafeHtml) {
    return DOMPurify.sanitize(String(unsafeHtml ?? ''), {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form', 'input', 'textarea', 'select', 'option', 'img', 'video', 'audio', 'source', 'picture'],
        FORBID_ATTR: ['style'],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/(?!\/)|#)/i
    });
}

function renderBotHTML(text) {
    const safeText = String(text ?? '');

    if (hasMarkdown()) {
        return sanitizeHTML(marked.parse(safeText));
    }

    const escaped = escapeHTML(safeText)
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br>');
    return `<p>${escaped}</p>`;
}

function ensureSeedContext() {
    if (conversationHistory.length >= 2) return;

    conversationHistory = [
        {
            role: 'user',
            parts: [{ text: getSystemPrompt() }]
        },
        {
            role: 'model',
            parts: [{ text: "Understood. I'm ready to help." }]
        }
    ];
}

function getHistoryTextLength() {
    return conversationHistory.reduce((total, item) => {
        const itemLength = (item.parts || []).reduce((partTotal, part) => {
            return partTotal + (typeof part.text === 'string' ? part.text.length : 0);
        }, 0);
        return total + itemLength;
    }, 0);
}

function trimConversationHistory() {
    while (conversationHistory.length > MAX_HISTORY_ITEMS && conversationHistory.length > 4) {
        conversationHistory.splice(2, 2);
    }

    while (getHistoryTextLength() > MAX_HISTORY_TEXT && conversationHistory.length > 4) {
        conversationHistory.splice(2, 2);
    }
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
            const idToken = await getFirebaseIdToken();
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            };
            if (humanProofToken) headers[HUMAN_PROOF_HEADER] = humanProofToken;

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let apiError = '';
                let retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'));

                try {
                    const errorData = await response.json();
                    apiError = typeof errorData?.error === 'string' ? errorData.error : '';
                    retryAfterMs = Number.parseInt(errorData?.retryAfterMs, 10) || retryAfterMs;
                } catch (err) {
                    apiError = '';
                }

                if (response.status === 403) {
                    clearHumanProof();
                }

                const error = new Error(apiError || 'AI is unavailable right now. Please try again.');
                error.status = response.status;
                error.retryAfterMs = retryAfterMs;

                if (AI_RETRYABLE_STATUSES.has(response.status) && attempt < AI_CLIENT_MAX_RETRIES) {
                    lastError = error;
                    await sleep(getRetryDelayMs(error, attempt));
                    continue;
                }

                throw error;
            }

            return await response.json();
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

// --- Gemini Prompt Logic ---
function getSystemPrompt() {
    const urlParams = new URLSearchParams(window.location.search);
    const contextParam = urlParams.get('context');
    let dynamicContext = "";
    
    if (contextParam) {
        dynamicContext = `
IMMEDIATE SITUATIONAL CONTEXT:
The user clicked the 'Ask Bun-Bot' button directly from the "${contextParam}" page on SkillBun. 
Your primary goal right now is to act as an expert tutor for that specific track. Keep explanations simple, encouraging, and highly tied to the concepts of ${contextParam}.`;
    }

    return `You are Bun-Bot, SkillBun's incredibly helpful, friendly, and expert AI Career Counsellor.
You specialize in the Indian tech industry for BCA, BSc, and B.Tech students.
You also know the core SkillBun platform context so students can ask you about SkillBun itself.
${dynamicContext}

STUDENT PROFILE:
- Name: ${userProfile.name}
- Degree: ${userProfile.degree}
- Current Year: ${userProfile.year}

SKILLBUN CONTEXT:
- SkillBun is an AI-powered career guidance platform for Indian tech students.
- SkillBun currently helps students through profile onboarding, an adaptive AI career quiz, and this AI counsellor chat.
- SkillBun focuses on practical tech career tracks such as AI/ML, web development, cybersecurity, data science, cloud, UI/UX, app development, and related paths.
- Students can contact the SkillBun team at ${SKILLBUN_CONTACT_EMAIL}.

YOUR ROLE:
- Answer questions politely, directly, and specifically.
- If a student asks how to contact SkillBun, share ${SKILLBUN_CONTACT_EMAIL} clearly.
- When relevant, connect advice back to SkillBun's quiz and native roadmaps (e.g. [Frontend Roadmap](/roadmap/frontend)). Available roadmaps: ai_ml_engineer, ai_research_engineer, analytics_engineer, android, angular_developer, api_platform_engineer, application_security_engineer, ar_vr_developer, aws_cloud_engineer, azure_cloud_engineer, backend, bi_developer, blockchain_web3, business_analyst, c_cpp_systems_developer, cloud_architect, cloud_security_engineer, computer_vision_engineer, content_designer, cybersecurity, data_analyst, data_engineering, data_governance_specialist, data_science, data_visualization_specialist, database_admin, design_systems_engineer, desktop_app_developer, devops_cloud, dfir_analyst, digital_marketing_analyst, dotnet_developer, elixir_phoenix_developer, embedded_iot, finops_engineer, flutter_developer, frontend, fullstack, game_development, gcp_cloud_engineer, generative_ai_app_developer, geospatial_data_scientist, go_developer, graphql_api_developer, grc_analyst, iam_engineer, ios_developer, java_developer, kubernetes_engineer, linux_system_admin, llmops_engineer, macos_developer, malware_analyst, mlops_engineer, network_engineer, nextjs_developer, nlp_engineer, no_code_low_code_developer, observability_engineer, penetration_tester, php_laravel_developer, platform_engineer, product_designer, product_manager, prompt_engineer, python_developer, qa_automation, react_native_developer, recommendation_systems_engineer, red_team_operator, reinforcement_learning_engineer, release_engineer, robotics_engineer, rpa_developer, ruby_on_rails_developer, rust_developer, salesforce_developer, scala_developer, scrum_master_agile_coach, seo_specialist, serverless_developer, service_designer, shopify_developer, site_reliability_engineer, soc_analyst, speech_ai_engineer, svelte_developer, technical_artist, technical_support_engineer, technical_writing, terraform_iac_engineer, threat_intelligence_analyst, ui_ux_design, unity_developer, unreal_engine_developer, ux_researcher, vue_developer, windows_app_developer, wordpress_developer, general.
- Provide Indian context (e.g., salaries in LPA, exams like GATE, Nimcet, CDAC, placements context).
- Compare pros/cons honestly without bias.
- Explain "Day in the life" realistically.
- Do not stray into topics outside of tech careers, education, or SkillBun support/product questions.
- Do not hallucinate. If you don't know a hyper-specific salary, provide a realistic range based on the Indian market.
- Use markdown formatting for your responses (bullet points, bold text for emphasis).
- Keep responses readable. No massive walls of text.

Do not output raw JSON format. Provide standard conversational markdown text only.`;
}

// --- Chat Logic ---
function appendMessage(role, text) {
    const container = getEl('chatMessages');
    if (!container) return;

    const row = document.createElement('div');
    row.className = `message-row ${role}`;

    const avatar = document.createElement('div');
    avatar.className = `msg-avatar ${role}`;
    avatar.textContent = role === 'bot' ? '🤖' : (userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U');

    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;

    if (role === 'user') {
        msgDiv.innerHTML = `<p>${escapeHTML(text)}</p>`;
    } else {
        msgDiv.innerHTML = renderBotHTML(text);
        msgDiv.querySelectorAll('a').forEach((anchor) => {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
        });
    }

    row.appendChild(avatar);
    row.appendChild(msgDiv);
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const inputEl = getEl('chatInput');
    const sendBtn = getEl('sendBtn');
    const typingIndicator = getEl('typingIndicator');
    const container = getEl('chatMessages');

    if (!inputEl || !sendBtn || isSending) return;

    const text = inputEl.value.trim();
    if (!text) return;

    // --- Rate limit check ---
    const rl = checkRateLimit();
    if (!rl.allowed) {
        appendMessage('bot', rl.message);
        return;
    }

    isSending = true;

    try {
        const verified = await verifyHumanProof();
        if (!verified) {
            appendMessage('bot', 'Security check required. Please complete verification and try again.');
            return;
        }

        appendMessage('user', text);

        inputEl.value = '';
        inputEl.style.height = '52px';
        inputEl.style.overflowY = 'hidden';

        inputEl.disabled = true;
        sendBtn.disabled = true;
        if (typingIndicator) typingIndicator.style.display = 'flex';
        if (container) container.scrollTop = container.scrollHeight;

        ensureSeedContext();
        conversationHistory.push({
            role: 'user',
            parts: [{ text }]
        });
        trimConversationHistory();

        const payload = {
            contents: conversationHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        };

        const data = await fetchGeminiPayload(payload);
        const responseText = extractGeminiText(data);

        if (!responseText || !responseText.trim()) {
            throw new Error('Got an empty response. Please try again.');
        }

        conversationHistory.push({
            role: 'model',
            parts: [{ text: responseText }]
        });
        trimConversationHistory();

        incrementRateLimit(); // count only successful exchanges
        appendMessage('bot', responseText);
    } catch (err) {
        console.error(err);

        if (err?.status === 400 && /conversation|payload/i.test(err.message)) {
            conversationHistory = conversationHistory.slice(0, 2);
            appendMessage('bot', 'Chat became too long, so I reset context. Please send your question again.');
        } else if (err?.status === 403) {
            appendMessage('bot', 'Security session expired. Please send again to re-verify.');
        } else {
            appendMessage('bot', getFriendlyAiErrorMessage(err));
        }

        if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === 'user') {
            conversationHistory.pop();
        }
    } finally {
        if (typingIndicator) typingIndicator.style.display = 'none';
        inputEl.disabled = false;
        sendBtn.disabled = false;
        inputEl.focus();
        isSending = false;
    }
}

    void initCounsellorPage();

    return () => {
        eventController.abort();
    };
}
