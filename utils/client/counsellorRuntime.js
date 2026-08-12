'use client';

import {
  createState,
  hasFreshHumanProof,
  clearHumanProof,
  restoreHumanProof
} from './counsellor/counsellorState';
import {
  checkRateLimit,
  incrementRateLimit,
  fetchSecurityConfig,
  verifyHumanProof,
  refreshHumanProofSession,
  fetchCounsellorPayload,
  getFriendlyAiErrorMessage,
  RATE_LIMIT_KEY,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS
} from './counsellor/counsellorApi';
import {
  getEl,
  toggleSecurityBanner,
  loadProfile,
  appendMessage,
  appendStreamingMessage,
  setCaptchaStatus,
  toggleDropdown,
  logoutUser,
  sanitizeHTML,
  updateUsageLimitCard,
  renderSuggestionChips,
  hideSuggestionsSection
} from './counsellor/counsellorDom';
import {
  getPersonalizedInitialChips,
  getFollowUpSuggestions,
  getRandomShuffledChips
} from './counsellor/smartSuggestions';
import posthog from 'posthog-js';

const HUMAN_PROOF_HEADER = 'x-skillbun-human';
const SKILLBUN_CONTACT_EMAIL = 'harsh@skillbun.tech';
const MAX_HISTORY_ITEMS = 48;
const MAX_HISTORY_TEXT = 22000;

export function mountCounsellorRuntime() {
  const eventController = new AbortController();
  const state = createState(eventController);

  const limitInterval = setInterval(() => {
    updateUsageLimitCard();
  }, 1000);

  function getSystemPrompt() {
    const urlParams = new URLSearchParams(window.location.search);
    const contextParam = urlParams.get('context');
    let dynamicContext = "";
    
    if (contextParam) {
      dynamicContext = `
IMMEDIATE SITUATIONAL CONTEXT:
The user clicked the 'Ask BunBot' button directly from the "${contextParam}" page on SkillBun. 
Your primary goal right now is to act as an expert tutor for that specific track. Keep explanations simple, encouraging, and highly tied to the concepts of ${contextParam}.`;
    }

    return `You are BunBot, SkillBun's incredibly helpful, friendly, and expert AI Career Advisor.
You specialize in the Indian tech industry for BCA, BSc, and B.Tech students.
You also know the core SkillBun platform context so students can ask you about SkillBun itself.
${dynamicContext}

STUDENT PROFILE (DIRECT 1-ON-1 DIALOGUE WITH THIS STUDENT):
- Student Name: ${state.userProfile.name}
- Degree: ${state.userProfile.degree}
- Current Year: ${state.userProfile.year}
- CRITICAL CONVERSATION RULE: You are speaking DIRECTLY to ${state.userProfile.name} in 2nd-person ("you", "your", "Hello ${state.userProfile.name}!"). NEVER refer to the student in 3rd-person (do NOT say "students like ${state.userProfile.name}" or "for ${state.userProfile.name}"). Address them directly as their personal counsellor.

SKILLBUN CONTEXT:
- SkillBun is an AI-powered career guidance platform for Indian tech students.
- SkillBun currently helps students through profile onboarding, an adaptive AI career quiz, and this BunBot AI chat.
- SkillBun focuses on practical tech career tracks such as AI/ML, web development, cybersecurity, data science, cloud, UI/UX, app development, and related paths.
- MANDATE: DO NOT append support email or contact details at the end of normal informational responses unless the student explicitly asks how to contact support!

IDENTITY & BRAND PERSONA PROTECTION:
- You are ALWAYS "BunBot", SkillBun's proprietary AI Career Advisor.
- You must NEVER state or reveal that you are powered by Gemini, Llama, OpenAI, ChatGPT, Groq, Pollinations, or any third-party API or LLM model provider.
- If a user asks "Which API are you using?", "Which LLM model is this?", "Are you ChatGPT/Gemini?", "Are you an API?", or "How do you work behind the scenes?", ALWAYS respond proudly: "I am BunBot, SkillBun's custom-built AI Career Advisor! I am powered directly by SkillBun's native career discovery engine built specifically for Indian tech students."

STRICT DOMAIN BOUNDARY & REFUSAL RULE (TECH & CAREER ONLY):
- You MUST ONLY answer questions related to tech careers, software engineering, computer science education, programming, Indian tech market/salaries, entrance exams (GATE/NIMCET/CDAC), and SkillBun platform features/roadmaps.
- If a user asks ANY non-tech, off-topic, recipe, cooking, entertainment, sports, politics, romantic, or unrelated question (such as "chai kaise bante hai", "how to make tea", "tell me a joke", "who won the match", "recipe", etc.), YOU MUST STRICTLY REFUSE TO ANSWER with this exact friendly message:
"I am BunBot, SkillBun's AI Career Advisor specialized strictly in tech careers, computer science, software engineering, and SkillBun roadmaps! 🤖

This question seems to be outside my scope of tech career guidance.

💡 *If you think we made a mistake, please take a screenshot and email us at **${SKILLBUN_CONTACT_EMAIL}**.*"

YOUR ROLE:
- Answer questions politely, directly, and specifically.
- If a student asks how to contact SkillBun, share ${SKILLBUN_CONTACT_EMAIL} clearly.
- When relevant, connect advice back to SkillBun's quiz and native roadmaps (e.g. [Frontend Roadmap](/roadmap/frontend)). Available roadmaps: ai_ml_engineer, ai_research_engineer, analytics_engineer, android, angular_developer, api_platform_engineer, application_security_engineer, ar_vr_developer, aws_cloud_engineer, azure_cloud_engineer, backend, bi_developer, blockchain_web3, business_analyst, c_cpp_systems_developer, cloud_architect, cloud_security_engineer, computer_vision_engineer, content_designer, cybersecurity, data_analyst, data_engineering, data_governance_specialist, data_science, data_visualization_specialist, database_admin, design_systems_engineer, desktop_app_developer, devops_cloud, dfir_analyst, digital_marketing_analyst, dotnet_developer, elixir_phoenix_developer, embedded_iot, finops_engineer, flutter_developer, frontend, fullstack, game_development, gcp_cloud_engineer, general, generative_ai_app_developer, geospatial_data_scientist, go_developer, graphql_api_developer, grc_analyst, iam_engineer, ios_developer, java_developer, kubernetes_engineer, linux_system_admin, llmops_engineer, macos_developer, malware_analyst, mlops_engineer, network_engineer, nextjs_developer, nlp_engineer, no_code_low_code_developer, observability_engineer, penetration_tester, php_laravel_developer, platform_engineer, product_designer, product_manager, prompt_engineer, python_developer, qa_automation, react_native_developer, recommendation_systems_engineer, red_team_operator, reinforcement_learning_engineer, release_engineer, robotics_engineer, rpa_developer, ruby_on_rails_developer, rust_developer, salesforce_developer, scala_developer, scrum_master_agile_coach, seo_specialist, serverless_developer, service_designer, shopify_developer, site_reliability_engineer, soc_analyst, speech_ai_engineer, svelte_developer, technical_artist, technical_support_engineer, technical_writing, terraform_iac_engineer, threat_intelligence_analyst, ui_ux_design, unity_developer, unreal_engine_developer, ux_researcher, vue_developer, windows_app_developer, wordpress_developer.
- Provide Indian context (e.g., salaries in LPA, exams like GATE, Nimcet, CDAC, placements context).
- Compare pros/cons honestly without bias.
- Explain "Day in the life" realistically.
- Do not stray into topics outside of tech careers, education, or SkillBun support/product questions.
- Do not hallucinate. If you don't know a hyper-specific salary, provide a realistic range based on the Indian market.
- Use markdown formatting for your responses (bullet points, bold text for emphasis).
- Keep responses readable. No massive walls of text.

Do not output raw JSON format. Provide standard conversational markdown text only.`;
  }

  function ensureSeedContext() {
    if (state.conversationHistory.length >= 2) return;

    state.conversationHistory = [
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
    return state.conversationHistory.reduce((total, item) => {
      const itemLength = (item.parts || []).reduce((partTotal, part) => {
        return partTotal + (typeof part.text === 'string' ? part.text.length : 0);
      }, 0);
      return total + itemLength;
    }, 0);
  }

  function trimConversationHistory() {
    while (state.conversationHistory.length > MAX_HISTORY_ITEMS && state.conversationHistory.length > 4) {
      state.conversationHistory.splice(2, 2);
    }

    while (getHistoryTextLength() > MAX_HISTORY_TEXT && state.conversationHistory.length > 4) {
      state.conversationHistory.splice(2, 2);
    }
  }

  function extractGeminiText(data) {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';

    const textPart = parts.find(part => typeof part?.text === 'string' && part.text.trim());
    return textPart?.text || '';
  }

  // --- Send Message Action ---
  async function sendMessage() {
    if (state.isSending) return;

    const textarea = getEl('chatInput');
    if (!textarea) return;

    const text = textarea.value.trim();
    if (!text) return;

    // Local Rate Limit check
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      alert(rateCheck.message);
      return;
    }

    // Verify Human Proof validation BEFORE clearing inputs or showing bubbles
    const sendBtn = getEl('sendBtn');
    if (sendBtn) sendBtn.disabled = true;

    const verified = await verifyHumanProof(state, async () => {
      toggleSecurityBanner(true);
      await initCaptcha();
    });

    if (!verified) {
      // Keep user's text in textarea and enable send button so they don't lose typed text
      if (sendBtn) sendBtn.disabled = false;
      return;
    }

    state.isSending = true;
    textarea.value = '';
    textarea.style.height = '52px';
    textarea.dispatchEvent(new Event('input'));

    if (sendBtn) sendBtn.disabled = true;

    // Append user message bubble
    appendMessage(state, 'user', text);
    posthog.capture('counsellor_message_sent', {
      conversation_message_count: state.conversationHistory.filter((message) => message.role === 'user').length + 1,
    });

    // Hide full suggestions section during loading / processing
    hideSuggestionsSection();

    // Append thinking dot loader bubble
    const container = getEl('chatMessages');
    let thinkingRow = null;
    if (container) {
      thinkingRow = document.createElement('div');
      thinkingRow.className = 'message-row bot thinking-row';
      thinkingRow.innerHTML = `
        <div class="msg-avatar bot"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="8" rx="2"/><path d="M12 2v6"/><circle cx="8" cy="14" r="1.5" fill="currentColor"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/><path d="M9 18h6"/></svg></div>
        <div class="message bot thinking">
          <div class="quiz-loading-dots" style="margin:0.2rem 0;">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      container.appendChild(thinkingRow);
      container.scrollTop = container.scrollHeight;
    }

    ensureSeedContext();
    state.conversationHistory.push({
      role: 'user',
      parts: [{ text }]
    });

    trimConversationHistory();

    const payload = {
      contents: state.conversationHistory,
      generationConfig: {
        temperature: 0.75,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    try {
      const data = await fetchCounsellorPayload(state, payload);
      const botResponse = extractGeminiText(data);

      if (thinkingRow) thinkingRow.remove();

      if (!botResponse) {
        throw new Error('AI returned an empty response.');
      }

      state.conversationHistory.push({
        role: 'model',
        parts: [{ text: botResponse }]
      });

      appendStreamingMessage(state, 'bot', botResponse, () => {
        const followUps = getFollowUpSuggestions(text, botResponse);
        const headerTitle = getEl('suggestionsTitle');
        if (headerTitle) headerTitle.textContent = '💡 Suggested Follow-ups';
        renderSuggestionChips(followUps, (chipText) => {
          const inputEl = getEl('chatInput');
          if (inputEl) {
            inputEl.value = chipText;
            inputEl.dispatchEvent(new Event('input'));
          }
          sendMessage();
        });
      });
      incrementRateLimit();
      updateUsageLimitCard();

    } catch (err) {
      if (thinkingRow) thinkingRow.remove();

      if (state.conversationHistory.at(-1)?.role === 'user') {
        state.conversationHistory.pop();
      }

      const friendlyMsg = getFriendlyAiErrorMessage(err);
      appendMessage(state, 'bot', `⚠️ Error: ${friendlyMsg}`);
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      state.isSending = false;
    }
  }

  // --- Turnstile Captcha Lazy load ---
  async function loadTurnstileScript() {
    return new Promise((resolve, reject) => {
      if (window.turnstile) return resolve();

      const existing = document.querySelector('script[data-turnstile="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true, signal: state.signal });
        existing.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true, signal: state.signal });
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
    if (!state.securityConfig.captchaEnabled || hasFreshHumanProof(state)) return;

    if (state.captchaWidgetId !== null && window.turnstile) {
      toggleSecurityBanner(true);
      setCaptchaStatus('Complete the security check below.', 'error');
      return;
    }

    if (state.captchaInitPromise) {
      await state.captchaInitPromise;
      return;
    }

    state.captchaInitPromise = (async () => {
      toggleSecurityBanner(true);
      setCaptchaStatus('Completing security check...');

      try {
        await loadTurnstileScript();
        if (!window.turnstile) throw new Error('Turnstile failed');

        state.captchaWidgetId = window.turnstile.render('#captchaWidget', {
          sitekey: state.securityConfig.captchaSiteKey,
          theme: localStorage.getItem('sb_theme') || 'dark',
          callback: (token) => {
            state.captchaToken = token;
            setCaptchaStatus('Security check passed.', 'ok');
            setTimeout(() => toggleSecurityBanner(false), 2000);

            if (state.pendingAutoSubmit) {
              state.pendingAutoSubmit = false;
              setTimeout(() => {
                sendMessage();
              }, 100);
            }
          },
          'expired-callback': () => {
            state.captchaToken = '';
            setCaptchaStatus('Security check expired. Please verify again.', 'error');
            toggleSecurityBanner(true);
          },
          'error-callback': (errorCode) => {
            state.captchaToken = '';
            setCaptchaStatus(getCaptchaErrorMessage(errorCode), 'error');
          }
        });
      } catch (err) {
        setCaptchaStatus('Security widget failed to load.', 'error');
      }
    })();

    try {
      await state.captchaInitPromise;
    } finally {
      state.captchaInitPromise = null;
    }
  }

  function getCaptchaErrorMessage(errorCode) {
    const code = String(errorCode || '').trim();

    if (code === '110200') {
      return `Turnstile domain is not authorized for this site key (${code}). Add this hostname.`;
    }
    if (code === '110100' || code === '110110' || code === '400020') {
      return `Turnstile site key is invalid or not found (${code}).`;
    }
    if (code === '200500') {
      return `Turnstile iframe could not load (${code}).`;
    }
    if (code === '110600' || code === '110620') {
      return `Security check timed out (${code}). Please retry.`;
    }
    return code ? `Security check failed (${code}). Please refresh.` : 'Security check failed. Please refresh.';
  }

  // --- Initializer ---
  async function initCounsellorPage() {
    const hasProfile = loadProfile(state);
    if (!hasProfile) return;

    updateUsageLimitCard();

    const textarea = getEl('chatInput');
    const sendBtn = getEl('sendBtn');
    const userBadge = getEl('userBadge');
    const logoutBtn = getEl('logoutBtn');

    if (userBadge) userBadge.addEventListener('click', toggleDropdown, { signal: state.signal });
    if (logoutBtn) logoutBtn.addEventListener('click', () => logoutUser(state), { signal: state.signal });

    if (!textarea || !sendBtn) {
      console.error('Counsellor UI is missing required elements.');
      return;
    }

    textarea.addEventListener('input', function () {
      this.style.height = '52px';
      this.style.height = `${this.scrollHeight}px`;
      this.style.overflowY = this.scrollHeight > 150 ? 'auto' : 'hidden';
    }, { signal: state.signal });

    textarea.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }, { signal: state.signal });

    sendBtn.addEventListener('click', sendMessage, { signal: state.signal });

    function handleChipSelection(chipText) {
      const inputEl = getEl('chatInput');
      if (inputEl) {
        inputEl.value = chipText;
        inputEl.dispatchEvent(new Event('input'));
      }
      sendMessage();
    }

    const initialChips = getPersonalizedInitialChips(state.userProfile);
    const headerTitle = getEl('suggestionsTitle');
    if (headerTitle) headerTitle.textContent = '✨ Suggested Questions';
    renderSuggestionChips(initialChips, handleChipSelection);

    const refreshBtn = getEl('refreshSuggestionsBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const randomChips = getRandomShuffledChips();
        renderSuggestionChips(randomChips, handleChipSelection);
      }, { signal: state.signal });
    }

    const clearBtn = getEl('clearChatBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        const container = getEl('chatMessages');
        if (!container) return;
        container.innerHTML = '';
        state.conversationHistory = [];
        const freshChips = getPersonalizedInitialChips(state.userProfile);
        if (headerTitle) headerTitle.textContent = '✨ Suggested Questions';
        renderSuggestionChips(freshChips, handleChipSelection);
      }, { signal: state.signal });
    }

    try {
      await fetchSecurityConfig(state);
      const hasReusableProof = await refreshHumanProofSession(state);

      if (hasReusableProof) {
        toggleSecurityBanner(false);
        setCaptchaStatus('Security already verified for this session.', 'ok');
      } else if (state.securityConfig.captchaEnabled) {
        toggleSecurityBanner(true);
        await initCaptcha();
      } else {
        await verifyHumanProof(state, async () => {
          toggleSecurityBanner(true);
          await initCaptcha();
        });
      }
    } catch (err) {
      console.error('Security init error:', err);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery) {
      const inputEl = getEl('chatInput');
      if (inputEl) {
        inputEl.value = initialQuery;
        inputEl.dispatchEvent(new Event('input'));
        window.history.replaceState({}, '', window.location.pathname);

        if (hasFreshHumanProof(state)) {
          sendMessage();
        } else {
          state.pendingAutoSubmit = true;
          if (state.securityConfig.captchaEnabled) {
            toggleSecurityBanner(true);
            await initCaptcha();
          }
        }
      }
    }
  }

  void initCounsellorPage();

  return () => {
    clearInterval(limitInterval);
    eventController.abort();
  };
}
