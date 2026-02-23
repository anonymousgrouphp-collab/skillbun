// ===== QUIZ PAGE - Gemini API Integration =====

// --- State ---
let conversationHistory = [];
let questionCount = 0;
let totalQuestions = 15; // Initial estimate, AI may finish early or take longer
let lastSelectedOption = null; // stores last answer for retry
let userProfile = {};

// --- Configuration ---
const SUPPORT_EMAIL = 'anonymousgrouphp@gmail.com';

// --- SECURITY: Sanitize HTML to prevent XSS ---
function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Load User Profile ---
function loadProfile() {
    const name = localStorage.getItem('sb_name') || 'Student';
    const degree = localStorage.getItem('sb_degree') || 'Not specified';
    const year = localStorage.getItem('sb_year') || 'Not specified';

    userProfile = { name, degree, year };

    document.getElementById('userName').textContent = name;
    document.getElementById('userBadge').textContent = `👤 ${name}`;
    document.getElementById('welcomeProfile').innerHTML = `
    <div class="profile-tag">📚 ${sanitize(degree)}</div>
    <div class="profile-tag">📅 ${sanitize(year)}</div>
  `;

    // Populate Dropdown Profile specific elements
    document.getElementById('dropdownName').textContent = name;
    document.getElementById('dropdownDegree').textContent = degree;
    document.getElementById('dropdownYear').textContent = year;
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
        const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

// --- Load More Careers ---
async function loadMoreCareers() {
    const loadBtn = document.getElementById('loadMoreBtn');
    loadBtn.textContent = '⏳ Finding more paths...';
    loadBtn.disabled = true;

    try {
        const response = await callGemini(
            'Based on our conversation, suggest 3 MORE different career paths that could also be a good fit. Provide careers that are DIFFERENT from the ones you already recommended. Use the same JSON result format with "type": "result". Make sure to include the "roadmapUrl" field for each career. Default to "coming-soon.html" if no exact roadmap.sh URL matches.'
        );

        if (response.type === 'result' && response.careers) {
            const container = document.getElementById('resultCards');
            response.careers.forEach((career, i) => {
                const existingCount = container.children.length;
                container.insertAdjacentHTML('beforeend', renderCareerCard(career, existingCount + i + 1));
            });

            // Animate new cards in
            const newCards = container.querySelectorAll('.result-card.new');
            newCards.forEach((card, i) => {
                setTimeout(() => card.classList.add('visible'), i * 200);
            });
        }

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
            // SAFETY: Validate URL to prevent XSS and crashes from hallucinated AI output
            const rawUrl = typeof career.roadmapUrl === 'string' ? career.roadmapUrl.trim() : '';
            let finalUrl = rawUrl || 'coming-soon.html';

            // Comprehensive list of actual roadmap.sh slugs to prevent 404s
            const VALID_ROADMAPS = [
                'frontend', 'backend', 'devops', 'full-stack', 'android', 'ios',
                'postgresql', 'ai-data-scientist', 'data-analyst', 'qa', 'software-architect',
                'cyber-security', 'game-developer', 'blockchain', 'react-native', 'flutter',
                'python', 'java', 'go', 'rust', 'cplusplus', 'javascript', 'typescript', 'react', 'vue', 'angular', 'node-js',
                'graphql', 'design-system', 'react-native', 'system-design', 'computer-science'
            ];

            // Only allow http/https or the specific internal fallback
            if (!finalUrl.startsWith('http') && finalUrl !== 'coming-soon.html') {
                finalUrl = 'coming-soon.html';
            } else if (finalUrl.includes('roadmap.sh/')) {
                // If it's a roadmap link, verify it actually exists on their site
                try {
                    const urlObj = new URL(finalUrl);
                    // Extract the first path segment (e.g. 'frontend' from '/frontend')
                    const slug = urlObj.pathname.split('/')[1]?.toLowerCase();
                    if (!slug || !VALID_ROADMAPS.includes(slug)) {
                        finalUrl = 'coming-soon.html'; // Override hallucinated/missing endpoints
                    }
                } catch (e) {
                    finalUrl = 'coming-soon.html';
                }
            }

            const isExternal = finalUrl.startsWith('http');

            return `
            <a href="${sanitize(finalUrl)}" ${isExternal ? 'target="_blank"' : ''} class="btn-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; text-decoration: none; font-size: 0.9rem;">
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

    data.careers.forEach((career, i) => {
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
    <button class="quiz-option" onclick="retryLastQuestion()">
      <span class="option-label">🔄</span>
      <span class="option-text">Try Again</span>
    </button>
  `;
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
document.getElementById('startQuizBtn').addEventListener('click', () => {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';
    startNextQuestion();
});

document.getElementById('retakeBtn').addEventListener('click', () => {
    conversationHistory = [];
    questionCount = 0;
    quizResults = null;
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'block';
});

document.getElementById('loadMoreBtn').addEventListener('click', loadMoreCareers);

// --- Init ---
loadProfile();
