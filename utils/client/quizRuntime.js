'use client';

import {
  createState,
  hasFreshHumanProof,
  clearHumanProof,
  restoreHumanProof
} from './quiz/quizState';
import {
  fetchSecurityConfig,
  verifyHumanProof,
  refreshHumanProofSession,
  fetchGeminiPayload
} from './quiz/quizApi';
import {
  initCaptcha,
  setCaptchaStatus
} from './quiz/quizCaptcha';
import {
  sanitize,
  loadProfile,
  resetQuizStateUI,
  updateProgress,
  showQuestion,
  showResults,
  renderCareerCard,
  buildErrorReportBody,
  createQuizFormatError,
  normalizeQuizResponse,
  extractCareers,
  resolveRoadmapSlug,
  resolveRoadmapUrl,
  toggleDropdown,
  logoutUser
} from './quiz/quizDom';

const SUPPORT_EMAIL = 'harsh@skillbun.tech';
const MAX_RETRIES_PER_QUESTION = 3;

export function mountQuizRuntime() {
  const eventController = new AbortController();
  const state = createState(eventController);

  // --- Dynamic Message Helpers ---
  function getSystemPrompt() {
    return `You are SkillBun's Elite Tech Mentor — an experienced, radically honest, and analytical career advisor deeply embedded in the Indian tech industry. You have mentored engineers at top Indian product startups (Zomato, Cred, Razorpay) and massive Service/Enterprise MNCs (TCS, Infosys, IBM).

STUDENT PROFILE:
- Name: ${state.userProfile.name}
- Degree: ${state.userProfile.degree}
- Current Year: ${state.userProfile.year}

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

  function buildQuizUserMessage(userMessage) {
    if (!state.quizResults && state.questionCount >= 18) {
      return userMessage + '\n\nIMPORTANT: You have now asked 18 questions. You MUST return the final recommendation JSON now with "type": "result" and exactly 3 careers. Each career MUST have a valid roadmapUrl slug from the provided list. Use the most specific local roadmap slug that fits the answer evidence.';
    }

    if (!state.quizResults && state.questionCount >= 14) {
      return userMessage + '\n\nNote: You have asked ' + state.questionCount + ' questions. If you have 95%+ confidence, return the final recommendation now. Otherwise, you may ask up to ' + (18 - state.questionCount) + ' more questions. Make sure your scenarios are increasingly complex and specific to Indian tech realities. Push for edge cases (Phase 4). Before finalizing, compare the top 2-3 niche roadmap options and choose specific slugs rather than generic umbrellas.';
    }

    if (!state.quizResults && state.questionCount === 3) {
      return userMessage + '\n\nNote: If two or more pillars are still plausible, ask a scenario that separates them sharply. Do not ask preference-only questions.';
    }

    if (!state.quizResults && state.questionCount === 5) {
      return userMessage + '\n\nNote: You should now transition to PHASE 2 (Indian Market Realities & Niche Discovery). Abandon the pillars the user rejected. Present complex scenarios specific to Indian work culture (e.g., service vs product company dynamics, legacy code, client pressure).';
    }

    if (!state.quizResults && state.questionCount === 8) {
      return userMessage + '\n\nNote: You should now test niche fit inside the strongest pillar. Use a work-sample scenario that can distinguish between nearby roadmap paths such as generic software, framework-specific, cloud-specific, security-specific, data-specific, or product/design-specific roles.';
    }

    if (!state.quizResults && state.questionCount === 10) {
      return userMessage + '\n\nNote: You should now transition to PHASE 3 (Execution & Complexity Handling). Ask about their working style under extreme complexity. Start wrapping up if your confidence is high.';
    }

    return userMessage;
  }

  async function callGemini(userMessage) {
    const verified = await verifyHumanProof(state, async () => {
      await initCaptcha(state);
    });
    if (!verified) {
      throw new Error('Human verification required');
    }

    let startedConversation = false;
    let appendedUserMessage = false;

    if (state.conversationHistory.length === 0) {
      state.conversationHistory.push({
        role: 'user',
        parts: [{ text: getSystemPrompt() }]
      });
      startedConversation = true;
    } else if (userMessage) {
      state.conversationHistory.push({
        role: 'user',
        parts: [{ text: buildQuizUserMessage(userMessage) }]
      });
      appendedUserMessage = true;
    }

    const payload = {
      contents: state.conversationHistory,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    };

    try {
      const data = await fetchGeminiPayload(state, payload);
      const parts = data?.candidates?.[0]?.content?.parts;
      let text = '';
      if (Array.isArray(parts)) {
        const textPart = parts.find(part => typeof part?.text === 'string' && part.text.trim());
        text = textPart?.text || '';
      }

      if (!text) throw new Error('Empty response from Gemini');

      // Robust parser helper
      const parsedJSON = JSON.parse(text.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
      const parsed = normalizeQuizResponse(state, parsedJSON);

      state.conversationHistory.push({
        role: 'model',
        parts: [{ text }]
      });

      return parsed;

    } catch (err) {
      console.error('Gemini API Error:', err);

      if (startedConversation) {
        state.conversationHistory = [];
      } else if (appendedUserMessage && state.conversationHistory[state.conversationHistory.length - 1]?.role === 'user') {
        state.conversationHistory.pop();
      }

      const message = String(err?.message || '').trim();
      const status = Number.isFinite(err?.status) ? err.status : 0;
      const retryAfterMs = Number.parseInt(err?.retryAfterMs, 10) || 0;

      const friendly = new Error(message || "Our AI bunny tripped! Don't worry - our team is on it.");
      friendly.status = status;
      friendly.retryAfterMs = retryAfterMs;
      friendly.code = err?.code || (status ? `AI_${status}` : 'AI_UNKNOWN');
      friendly.originalMessage = message;

      throw friendly;
    }
  }

  // --- Start Quiz Action ---
  async function startNextQuestion() {
    document.getElementById('optionsContainer').style.display = 'none';
    document.getElementById('quizLoading').style.display = 'flex';

    try {
      const response = await callGemini(null);
      document.getElementById('quizLoading').style.display = 'none';
      document.getElementById('optionsContainer').style.display = 'grid';

      if (response.type === 'result') {
        showResults(state, response);
      } else {
        showQuestion(state, response, selectOption);
      }
    } catch (err) {
      document.getElementById('quizLoading').style.display = 'none';
      document.getElementById('optionsContainer').style.display = 'grid';
      showErrorUI(state, err, retryLastQuestion);
    }
  }

  // --- Select Option Action ---
  async function selectOption(option, element) {
    state.lastSelectedOption = option;
    document.querySelectorAll('.quiz-option').forEach(el => {
      el.classList.remove('selected');
      el.disabled = true;
    });
    element.classList.add('selected');

    setTimeout(async () => {
      document.getElementById('optionsContainer').style.display = 'none';
      document.getElementById('quizLoading').style.display = 'flex';

      try {
        const response = await callGemini(`My answer: ${option.label}. ${option.text}`);

        document.getElementById('quizLoading').style.display = 'none';
        document.getElementById('optionsContainer').style.display = 'grid';

        if (response.type === 'result') {
          showResults(state, response);
        } else {
          showQuestion(state, response, selectOption);
        }
      } catch (err) {
        document.getElementById('quizLoading').style.display = 'none';
        document.getElementById('optionsContainer').style.display = 'grid';
        showErrorUI(state, err, retryLastQuestion);
      }
    }, 500);
  }

  // --- Retry Last Question Action ---
  function retryLastQuestion() {
    if (state.lastSelectedOption) {
      selectOption(state.lastSelectedOption, document.createElement('button'));
    } else {
      startNextQuestion();
    }
  }

  // --- Load More Careers Action ---
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

  // --- Show Error UI Callback ---
  function showErrorUI(state, err, retryCallback) {
    state.retryCount++;
    const message = String(err?.message || '').trim();
    const status = err?.status || 0;
    const retryAfterMs = err?.retryAfterMs || 0;
    const code = String(err?.code || (status ? `AI_${status}` : 'AI_CLIENT')).trim();
    const detail = message ? sanitize(message) : "Our AI bunny tripped! Don't worry - our team is on it.";
    
    const waitNote = retryAfterMs > 0 ? `<div style="color:var(--muted);font-size:0.8rem;margin-top:0.55rem;">Suggested wait: ${sanitize(formatWaitTime(retryAfterMs))}</div>` : '';
    const codeNote = code ? `<div style="color:var(--muted);font-size:0.75rem;margin-top:0.4rem;">Reference: ${sanitize(code)}${status ? ' / HTTP ' + sanitize(String(status)) : ''}</div>` : '';
    
    const isMaxRetries = state.retryCount >= MAX_RETRIES_PER_QUESTION;
    const retryNote = isMaxRetries
      ? '<div style="color:var(--danger);font-size:0.8rem;margin-top:0.6rem;font-weight:700;">Multiple attempts failed. Please try again later or report this issue.</div>'
      : `<div style="color:var(--muted);font-size:0.8rem;margin-top:0.6rem;">Attempt ${state.retryCount} of ${MAX_RETRIES_PER_QUESTION}</div>`;

    document.getElementById('questionText').innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:0.8rem;">🐰💔</div>
        <div style="font-weight:800;font-size:1.1rem;margin-bottom:0.5rem;">Oops! Something went wrong on our side.</div>
        <div style="color:var(--muted);font-size:0.9rem;line-height:1.6;">${detail}</div>
        ${waitNote}
        ${retryNote}
        ${codeNote}
      </div>
    `;

    const subject = encodeURIComponent('SkillBun Quiz Error');
    const body = encodeURIComponent(buildErrorReportBody(state, {
      code,
      message,
      originalMessage: err?.originalMessage,
      retryAfterMs,
      status
    }));

    const retryBtnHtml = !isMaxRetries
      ? `<button class="quiz-option" id="retryLastQuestionBtn"><span class="option-label">🔄</span><span class="option-text">Try Again (${MAX_RETRIES_PER_QUESTION - state.retryCount} left)</span></button>`
      : '<button class="quiz-option" id="retryLastQuestionBtn"><span class="option-label">🏠</span><span class="option-text">Back to Home</span></button>';

    document.getElementById('optionsContainer').innerHTML = `
      <a class="quiz-option" href="mailto:${encodeURIComponent(SUPPORT_EMAIL)}?subject=${subject}&body=${body}" style="text-decoration:none;">
        <span class="option-label">📧</span><span class="option-text">Report to Team</span>
      </a>
      ${retryBtnHtml}
    `;

    const retryBtn = document.getElementById('retryLastQuestionBtn');
    if (retryBtn) {
      if (isMaxRetries) {
        retryBtn.addEventListener('click', () => { window.location.href = '/'; }, { signal: state.signal });
      } else {
        retryBtn.addEventListener('click', retryCallback, { signal: state.signal });
      }
    }
  }

  // --- Show Question Helper Callback ---
  function showQuestion(state, data, selectOptionCallback) {
    state.retryCount = 0;
    state.questionCount = data.questionNumber || state.questionCount + 1;
    updateProgress(state, state.questionCount, data.phase || 1);

    const insightEl = document.getElementById('aiInsight');
    if (insightEl) {
      if (data.insight && state.questionCount > 1) {
        insightEl.textContent = '💡 ' + data.insight;
        insightEl.style.display = 'block';
        insightEl.style.animation = 'none';
        insightEl.offsetHeight; // trigger reflow
        insightEl.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        insightEl.style.display = 'none';
      }
    }

    const qText = document.getElementById('questionText');
    qText.style.opacity = '0';
    setTimeout(() => {
      qText.textContent = data.question;
      qText.style.opacity = '1';
    }, 200);

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
        optEl.addEventListener('click', () => selectOptionCallback(opt, optEl), { signal: state.signal });
        container.appendChild(optEl);
      });
      container.style.opacity = '1';
    }, 300);
  }

  // --- Event Bindings ---
  const startQuizBtnEl = document.getElementById('startQuizBtn');
  if (startQuizBtnEl) {
    startQuizBtnEl.addEventListener('click', async () => {
      const startBtn = document.getElementById('startQuizBtn');
      if (!startBtn) return;

      const defaultLabel = startBtn.dataset.defaultLabel || startBtn.textContent;
      startBtn.dataset.defaultLabel = defaultLabel;
      startBtn.disabled = true;
      startBtn.textContent = 'Verifying...';

      const verified = await verifyHumanProof(state, async () => {
        await initCaptcha(state);
      });
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
    }, { signal: state.signal });
  }

  const retakeBtnEl = document.getElementById('retakeBtn');
  if (retakeBtnEl) {
    retakeBtnEl.addEventListener('click', () => {
      resetQuizStateUI(state);
    }, { signal: state.signal });
  }

  const loadMoreBtnEl = document.getElementById('loadMoreBtn');
  if (loadMoreBtnEl) {
    loadMoreBtnEl.dataset.defaultLabel = loadMoreBtnEl.textContent;
    loadMoreBtnEl.addEventListener('click', loadMoreCareers, { signal: state.signal });
  }

  async function initQuizPage() {
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) startBtn.disabled = true;

    const hasProfile = loadProfile(state);
    if (!hasProfile) return;

    await fetchSecurityConfig(state);
    const hasReusableProof = await refreshHumanProofSession(state);

    if (hasReusableProof) {
      const wrap = document.getElementById('captchaWrap');
      if (wrap) wrap.style.display = 'none';
      setCaptchaStatus('Security already verified for this session.', 'ok');
    } else if (state.securityConfig.captchaEnabled) {
      await initCaptcha(state);
    } else {
      await verifyHumanProof(state, async () => {
        await initCaptcha(state);
      });
    }

    const userBadge = document.getElementById('userBadge');
    if (userBadge) userBadge.addEventListener('click', toggleDropdown, { signal: state.signal });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => logoutUser(state), { signal: state.signal });

    if (startBtn) startBtn.disabled = false;
  }

  void initQuizPage();

  return () => {
    eventController.abort();
  };
}

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
