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
  fetchGeminiPayload,
  fetchQuizQuestions
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

export function mountQuizRuntime() {
  const eventController = new AbortController();
  const state = createState(eventController);

  let nextInsight = '';

  function getDominantPillar() {
    if (state.identifiedPillar && state.pillarScores[state.identifiedPillar] !== undefined) {
      return state.identifiedPillar;
    }
    const sorted = Object.entries(state.pillarScores).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'systems';
  }

  function getAiCall1Prompt() {
    const qSummary = state.userAnswers
      .map((ans, idx) => `Q${idx + 1}: ${ans.question} -> Answered [${ans.optionLabel}]: ${ans.optionText}`)
      .join('\n');

    const dominantPillar = getDominantPillar();
    const topTags = Object.entries(state.tagScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t, s]) => `${t}: ${s}`)
      .join(', ');

    return `You are SkillBun's AI Tech Mentor for Indian students.
STUDENT PROFILE:
- Name: ${state.userProfile.name}
- Degree: ${state.userProfile.degree}
- Year: ${state.userProfile.year}
- Stated Interest: ${state.userProfile.interest || 'Not specified'}
- Dominant Pillar: ${dominantPillar}
- Top Tag Scores: ${topTags || 'None'}

STUDENT ANSWERS SO FAR (Questions 1-7):
${qSummary}

YOUR TASK:
Based on their answers above, generate ONE highly tailored, realistic Indian tech workplace scenario question for Question 8 (Phase 3: AI Niche Deep-Dive).
Test their preference between 2 competing technical sub-specializations inside their dominant pillar (${dominantPillar}).

RESPONSE FORMAT (JSON ONLY, no markdown):
{
  "type": "question",
  "phase": 3,
  "questionNumber": 8,
  "insight": "1-2 sentence mentor observation reflecting on ${state.userProfile.name}'s technical traits revealed so far.",
  "question": "Your dynamic situational question text?",
  "options": [
    {"label": "A", "text": "Option A text", "pillar": "${dominantPillar}", "tags": ["tag1"]},
    {"label": "B", "text": "Option B text", "pillar": "${dominantPillar}", "tags": ["tag2"]},
    {"label": "C", "text": "Option C text", "pillar": "${dominantPillar}", "tags": ["tag3"]},
    {"label": "D", "text": "Option D text", "pillar": "${dominantPillar}", "tags": ["tag4"]}
  ]
}`;
  }

  function getAiCall2Prompt() {
    const qSummary = state.userAnswers
      .map((ans, idx) => `Q${idx + 1}: ${ans.question} -> Answered [${ans.optionLabel}]: ${ans.optionText}`)
      .join('\n');

    const topPillars = Object.entries(state.pillarScores)
      .sort((a, b) => b[1] - a[1])
      .map(([pillar, score]) => `${pillar}: ${score} pts`)
      .join(', ');

    const topTags = Object.entries(state.tagScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t, s]) => `${t}: ${s}pts`)
      .join(', ');

    return `You are SkillBun's Elite Tech Mentor. Synthesize the student's complete 10-question diagnostic quiz into top 3 career recommendations.

STUDENT PROFILE:
- Name: ${state.userProfile.name}
- Degree: ${state.userProfile.degree}
- Year: ${state.userProfile.year}
- Interest: ${state.userProfile.interest || 'Not specified'}

PILLAR SCORES:
${topPillars}

TOP TAG SCORES:
${topTags}

FULL 10-QUESTION QUIZ ANSWERS:
${qSummary}

YOUR TASK:
Return EXACTLY 3 ranked career recommendations in JSON format.
Each "roadmapUrl" MUST be an exact bare local roadmap slug from SkillBun's 100 roadmaps (e.g., 'fullstack', 'frontend', 'backend', 'ai_ml_engineer', 'data_science', 'devops_cloud', 'cybersecurity', 'ui_ux_design', 'product_manager', 'cloud_architect', 'android', 'flutter_developer', 'react_native_developer', 'java_developer', 'python_developer', 'go_developer', 'rust_developer', 'nextjs_developer', 'data_engineering', 'data_analyst', 'site_reliability_engineer', 'qa_automation', 'technical_writing', 'penetration_tester', 'business_analyst', 'cloud_security_engineer').

RESPONSE FORMAT (JSON ONLY, no markdown):
{
  "type": "result",
  "careers": [
    {
      "rank": 1,
      "title": "Career Title",
      "matchPercent": 94,
      "description": "2-3 sentences explaining WHY based on their specific answers.",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "salaryRange": "₹X - ₹Y LPA (entry level in India)",
      "demand": "High/Medium/Growing",
      "nextSteps": "Specific, actionable steps for an Indian student.",
      "roadmapUrl": "exact_slug_from_list"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ]
}`;
  }

  async function callGemini(promptText) {
    const verified = await verifyHumanProof(state, async () => {
      await initCaptcha(state);
    });
    if (!verified) {
      throw new Error('Human verification required');
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    const data = await fetchGeminiPayload(state, payload);
    const parts = data?.candidates?.[0]?.content?.parts;
    let text = '';
    if (Array.isArray(parts)) {
      const textPart = parts.find(part => typeof part?.text === 'string' && part.text.trim());
      text = textPart?.text || '';
    }

    if (!text) throw new Error('Empty response from AI service');

    const parsedJSON = JSON.parse(text.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
    return normalizeQuizResponse(state, parsedJSON);
  }

  function getLocalFallbackResults() {
    const sortedTags = Object.entries(state.tagScores).sort((a, b) => b[1] - a[1]);
    const topSlug1 = sortedTags[0]?.[0] || 'fullstack';
    const topSlug2 = sortedTags[1]?.[0] || 'backend';
    const topSlug3 = sortedTags[2]?.[0] || 'ai_ml_engineer';

    const fallbackCatalog = {
      fullstack: { title: 'Full Stack Web Developer', desc: 'Build scalable web applications end-to-end with modern frameworks.', salary: '₹6 - ₹14 LPA', demand: 'High' },
      frontend: { title: 'Frontend Developer', desc: 'Craft high-performance, responsive web interfaces and design systems.', salary: '₹5 - ₹13 LPA', demand: 'High' },
      backend: { title: 'Backend Systems Engineer', desc: 'Design microservices, high-throughput APIs, and database models.', salary: '₹7 - ₹16 LPA', demand: 'High' },
      nextjs_developer: { title: 'Next.js & React Developer', desc: 'Build modern server-rendered web applications with Next.js & React.', salary: '₹6 - ₹15 LPA', demand: 'High' },
      ai_ml_engineer: { title: 'AI & Machine Learning Engineer', desc: 'Develop intelligent AI models, neural networks, and LLM applications.', salary: '₹8 - ₹18 LPA', demand: 'High' },
      data_science: { title: 'Data Scientist', desc: 'Extract strategic insights from massive datasets using statistical modeling.', salary: '₹6 - ₹15 LPA', demand: 'High' },
      data_engineering: { title: 'Data Engineer', desc: 'Build distributed data pipelines, ETL flows, and data warehouses.', salary: '₹7 - ₹16 LPA', demand: 'High' },
      devops_cloud: { title: 'DevOps & Cloud Engineer', desc: 'Automate CI/CD pipelines, Docker containers, and cloud infrastructure.', salary: '₹7 - ₹16 LPA', demand: 'High' },
      cybersecurity: { title: 'Cybersecurity Analyst', desc: 'Protect corporate assets, audit network security, and perform threat analysis.', salary: '₹6 - ₹15 LPA', demand: 'High' },
      ui_ux_design: { title: 'UI/UX Product Designer', desc: 'Craft delightful, user-centered digital interfaces and design systems.', salary: '₹5 - ₹12 LPA', demand: 'High' },
      product_manager: { title: 'Technical Product Manager', desc: 'Bridge business strategy, user empathy, and engineering execution.', salary: '₹8 - ₹18 LPA', demand: 'Growing' }
    };

    const getMeta = (slug) => fallbackCatalog[slug] || {
      title: slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      desc: 'Master the core skills and technology stack for this high-demand career path.',
      salary: '₹6 - ₹14 LPA',
      demand: 'High'
    };

    const m1 = getMeta(topSlug1);
    const m2 = getMeta(topSlug2);
    const m3 = getMeta(topSlug3);

    return {
      type: 'result',
      careers: [
        {
          rank: 1,
          title: m1.title,
          matchPercent: 93,
          description: m1.desc,
          skills: ['Problem Solving', 'Architecture', 'Clean Code', 'Git', 'Agile'],
          salaryRange: m1.salary,
          demand: m1.demand,
          nextSteps: 'Start mastering the core fundamentals on SkillBun roadmap.',
          roadmapUrl: topSlug1
        },
        {
          rank: 2,
          title: m2.title,
          matchPercent: 87,
          description: m2.desc,
          skills: ['System Design', 'API Integration', 'Data Structures', 'Testing'],
          salaryRange: m2.salary,
          demand: m2.demand,
          nextSteps: 'Explore real-world projects in this career domain.',
          roadmapUrl: topSlug2
        },
        {
          rank: 3,
          title: m3.title,
          matchPercent: 82,
          description: m3.desc,
          skills: ['Cloud & Tools', 'Analytics', 'Security', 'Automation'],
          salaryRange: m3.salary,
          demand: m3.demand,
          nextSteps: 'Check out the detailed step-by-step roadmap for your career.',
          roadmapUrl: topSlug3
        }
      ]
    };
  }

  function pickQuestionForStep(qNum) {
    const questionsObj = state.quizQuestions;
    if (!questionsObj) return null;

    const used = new Set(state.usedQuestionIds || []);

    if (qNum <= 3) {
      if (state.identifiedPillar && Array.isArray(questionsObj.phase2?.[state.identifiedPillar])) {
        const p2Pool = questionsObj.phase2[state.identifiedPillar].filter(q => !used.has(q.id));
        if (p2Pool.length > 0) {
          const picked = p2Pool[Math.floor(Math.random() * p2Pool.length)];
          state.usedQuestionIds.push(picked.id);
          return picked;
        }
      }
      const p1Pool = (questionsObj.phase1 || []).filter(q => !used.has(q.id));
      if (p1Pool.length > 0) {
        const picked = p1Pool[Math.floor(Math.random() * p1Pool.length)];
        state.usedQuestionIds.push(picked.id);
        return picked;
      }
    }

    if (qNum >= 4 && qNum <= 7) {
      const dominantPillar = getDominantPillar();
      let pool = (questionsObj.phase2?.[dominantPillar] || []).filter(q => !used.has(q.id));
      if (pool.length === 0) {
        pool = (questionsObj.phase1 || []).filter(q => !used.has(q.id));
      }
      if (pool.length > 0) {
        const picked = pool[Math.floor(Math.random() * pool.length)];
        state.usedQuestionIds.push(picked.id);
        return picked;
      }
    }

    if (qNum >= 9 && qNum <= 10) {
      const p4Pool = (questionsObj.phase4 || []).filter(q => !used.has(q.id));
      if (p4Pool.length > 0) {
        const picked = p4Pool[Math.floor(Math.random() * p4Pool.length)];
        state.usedQuestionIds.push(picked.id);
        return picked;
      }
    }

    const fallbackAll = [
      ...(questionsObj.phase1 || []),
      ...Object.values(questionsObj.phase2 || {}).flat(),
      ...(questionsObj.phase4 || [])
    ].filter(q => !used.has(q.id));

    if (fallbackAll.length > 0) {
      const picked = fallbackAll[Math.floor(Math.random() * fallbackAll.length)];
      state.usedQuestionIds.push(picked.id);
      return picked;
    }

    return null;
  }

  async function advanceQuestion() {
    const qNum = state.questionCount + 1;
    state.questionCount = qNum;

    if (qNum <= 10) {
      if (qNum === 8) {
        document.getElementById('optionsContainer').style.display = 'none';
        document.getElementById('quizLoading').style.display = 'flex';
        const loadingP = document.getElementById('quizLoading').querySelector('p');
        if (loadingP) loadingP.textContent = 'SkillBun AI is generating your custom niche scenario...';

        try {
          const aiQuestion = await callGemini(getAiCall1Prompt());
          document.getElementById('quizLoading').style.display = 'none';
          document.getElementById('optionsContainer').style.display = 'grid';

          showQuestion(state, {
            type: 'question',
            phase: 3,
            questionNumber: 8,
            insight: aiQuestion.insight || nextInsight || 'AI Niche Deep-Dive based on your Q1-Q7 answers.',
            question: aiQuestion.question,
            options: aiQuestion.options
          }, selectOption);
          nextInsight = '';
        } catch (err) {
          console.warn('AI Call 1 failed, using seamless local fallback Q8:', err.message);
          document.getElementById('quizLoading').style.display = 'none';
          document.getElementById('optionsContainer').style.display = 'grid';

          const dominantPillar = getDominantPillar();
          const fallbackList = state.quizQuestions?.phase3Fallback?.[dominantPillar] || state.quizQuestions?.phase3Fallback?.systems || [];
          const localQ8 = fallbackList[0] || {
            q: 'In a real enterprise environment, what aspect of project quality matters most to you?',
            options: [
              { l: 'A', t: 'Clean, test-driven codebase that other developers can easily read and extend.', pillar: 'systems', tags: ['backend', 'fullstack'] },
              { l: 'B', t: 'High accuracy, statistical validity, and reproducible results.', pillar: 'data_ai', tags: ['ai_ml_engineer', 'data_science'] },
              { l: 'C', t: 'Delighting the user and driving business retention metrics.', pillar: 'design_product', tags: ['product_manager', 'ui_ux_design'] },
              { l: 'D', t: 'Security compliance, fault tolerance, and zero vulnerabilities.', pillar: 'cloud_infra', tags: ['devops_cloud', 'cybersecurity'] }
            ]
          };

          showQuestion(state, {
            type: 'question',
            phase: 3,
            questionNumber: 8,
            insight: nextInsight || 'Enterprise quality & engineering trade-off scenario.',
            question: localQ8.q || localQ8.question,
            options: localQ8.options
          }, selectOption);
          nextInsight = '';
        }
      } else {
        const rawQ = pickQuestionForStep(qNum);
        if (rawQ) {
          let phaseNum = rawQ.phase || 1;
          if (qNum >= 4 && qNum <= 7) phaseNum = 2;
          if (qNum >= 9) phaseNum = 3;

          showQuestion(state, {
            type: 'question',
            phase: phaseNum,
            questionNumber: qNum,
            insight: nextInsight || (qNum > 1 ? `Tracking your technical DNA preferences.` : ''),
            question: rawQ.q || rawQ.question,
            options: rawQ.options
          }, selectOption);
          nextInsight = '';
        }
      }
    } else {
      document.getElementById('optionsContainer').style.display = 'none';
      document.getElementById('quizLoading').style.display = 'flex';
      const loadingP = document.getElementById('quizLoading').querySelector('p');
      if (loadingP) loadingP.textContent = 'SkillBun AI is synthesizing your 10-question career matches...';

      try {
        const aiResults = await callGemini(getAiCall2Prompt());
        document.getElementById('quizLoading').style.display = 'none';
        showResults(state, aiResults);
      } catch (err) {
        console.warn('AI Call 2 failed, rendering instant score-based recommendations:', err.message);
        document.getElementById('quizLoading').style.display = 'none';
        const fallbackResults = getLocalFallbackResults();
        showResults(state, fallbackResults);
      }
    }
  }

  function selectOption(option, element) {
    state.lastSelectedOption = option;

    const optPillar = option.pillar;
    if (optPillar && state.pillarScores[optPillar] !== undefined) {
      state.pillarScores[optPillar] += 1;
    }

    const tags = Array.isArray(option.tags) ? option.tags : [];
    tags.forEach((tag) => {
      state.tagScores[tag] = (state.tagScores[tag] || 0) + 1;
    });

    if (option.i) {
      nextInsight = option.i;
    }

    const optText = option.t || option.text || '';
    const optLabel = option.l || option.label || 'A';

    state.userAnswers.push({
      questionNumber: state.questionCount,
      question: document.getElementById('questionText')?.textContent || '',
      optionLabel: optLabel,
      optionText: optText,
      pillar: optPillar || 'general',
      tags: tags
    });

    document.querySelectorAll('.quiz-option').forEach(el => {
      el.classList.remove('selected');
      el.disabled = true;
    });
    element.classList.add('selected');

    setTimeout(() => {
      advanceQuestion();
    }, 250);
  }

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
        Array.from(container.querySelectorAll('.result-card h3')).map(el => el.textContent.toLowerCase().trim())
      );
      const existingSlugs = new Set(
        Array.from(container.querySelectorAll('.result-card'))
          .map(el => el.dataset.roadmapSlug)
          .filter(Boolean)
      );

      const prompt = `Based on our previous quiz results, suggest 3 MORE unique career paths that are DIFFERENT from: ${Array.from(existingSlugs).join(', ')}. Use the exact same JSON format with "type": "result" and "careers" array. Use bare local roadmap slugs for "roadmapUrl".`;
      const response = await callGemini(prompt);
      let careers = extractCareers(response);

      if (careers.length === 0) {
        throw new Error('No additional career paths returned');
      }

      const uniqueCareers = careers.filter((career) => {
        const slug = resolveRoadmapSlug(career);
        return !existingTitles.has(career.title.toLowerCase().trim()) && (!slug || slug === 'general' || !existingSlugs.has(slug));
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

      state.questionCount = 0;
      state.userAnswers = [];
      state.tagScores = {};
      state.usedQuestionIds = [];
      state.pillarScores = { systems: 0, data_ai: 0, design_product: 0, cloud_infra: 0, security: 0, operations: 0 };
      nextInsight = '';

      if (state.quizQuestions?.profileMapping && state.userProfile) {
        const interest = state.userProfile.interest;
        const mappedPillar = state.quizQuestions.profileMapping.interestToPillar?.[interest];
        if (mappedPillar) {
          state.identifiedPillar = mappedPillar;
          state.pillarScores[mappedPillar] = (state.pillarScores[mappedPillar] || 0) + 2;
        }

        const degree = state.userProfile.degree;
        const degreeBoosts = state.quizQuestions.profileMapping.degreeBoosts?.[degree];
        if (degreeBoosts) {
          Object.entries(degreeBoosts).forEach(([p, boost]) => {
            state.pillarScores[p] = (state.pillarScores[p] || 0) + boost;
          });
        }
      }

      advanceQuestion();
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

    try {
      state.quizQuestions = await fetchQuizQuestions(state);
    } catch (err) {
      console.error('Could not load encrypted quiz questions:', err.message);
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
