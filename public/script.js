// ===== INITIAL SHUFFLE STATE =====
document.querySelectorAll('.shuffle-text').forEach((el) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    const finalValue = el.getAttribute('data-final') || '';
    let value = '';
    for (let i = 0; i < finalValue.length; i++) {
        value += chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = value;
});

// ===== CODE RAIN (Splash Screen) =====
const rainEl = document.getElementById('codeRain');
if (rainEl) {
    const codeChars = ['0', '1', '</>', '{}', '[]', '//', 'def', 'fn', 'var', '&&', '||', '!=', 'if', 'for', 'git'];

    for (let i = 0; i < 20; i++) {
        const col = document.createElement('div');
        col.className = 'code-col';
        col.style.left = `${Math.random() * 100}%`;
        col.style.animationDuration = `${6 + Math.random() * 8}s`;
        col.style.animationDelay = `${Math.random() * 5}s`;

        let content = '';
        for (let j = 0; j < 15; j++) {
            content += `${codeChars[Math.floor(Math.random() * codeChars.length)]}<br>`;
        }

        col.innerHTML = content;
        rainEl.appendChild(col);
    }
}

// ===== SPLASH -> MAIN PAGE TRANSITION =====
setTimeout(() => {
    const splash = document.getElementById('splash');
    const mainPage = document.getElementById('main-page');

    if (splash) splash.classList.add('hide');
    if (mainPage) mainPage.classList.add('show');

    setTimeout(() => {
        document.querySelectorAll('.shuffle-text').forEach((el, i) => {
            shuffleText(el, i * 400);
        });
    }, 500);
}, 3000);

// ===== LETTER SHUFFLE ANIMATION =====
function shuffleText(el, delay) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    const finalText = el.getAttribute('data-final') || '';
    const duration = 1200;
    const iterations = 12;
    let currentIteration = 0;

    setTimeout(() => {
        const interval = setInterval(() => {
            currentIteration += 1;
            const progress = currentIteration / iterations;

            let display = '';
            for (let i = 0; i < finalText.length; i++) {
                if (i / finalText.length < progress) {
                    display += finalText[i];
                } else {
                    display += chars[Math.floor(Math.random() * chars.length)];
                }
            }

            el.textContent = display;

            if (currentIteration >= iterations) {
                clearInterval(interval);
                el.textContent = finalText;
            }
        }, duration / iterations);
    }, delay);
}

// ===== AUTH MODAL + PROFILE FLOW =====
const authModal = document.getElementById('signupModal');
const PROFILE_STORAGE_KEYS = {
    name: 'sb_name',
    email: 'sb_email',
    degree: 'sb_degree',
    year: 'sb_year'
};
const ALLOWED_DESTINATIONS = new Set(['quiz.html', 'counsellor.html']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
let pendingDestination = 'quiz.html';

function getSafeDestination(rawDestination) {
    const value = String(rawDestination || '').trim().toLowerCase();
    return ALLOWED_DESTINATIONS.has(value) ? value : 'quiz.html';
}

function getSavedProfile() {
    return {
        name: localStorage.getItem(PROFILE_STORAGE_KEYS.name) || '',
        email: localStorage.getItem(PROFILE_STORAGE_KEYS.email) || '',
        degree: localStorage.getItem(PROFILE_STORAGE_KEYS.degree) || '',
        year: localStorage.getItem(PROFILE_STORAGE_KEYS.year) || ''
    };
}

function hasCompleteProfile() {
    const profile = getSavedProfile();
    return Boolean(profile.name && profile.email && profile.degree && profile.year);
}

function saveProfileLocally(profile) {
    localStorage.setItem(PROFILE_STORAGE_KEYS.name, profile.name);
    localStorage.setItem(PROFILE_STORAGE_KEYS.email, profile.email);
    localStorage.setItem(PROFILE_STORAGE_KEYS.degree, profile.degree);
    localStorage.setItem(PROFILE_STORAGE_KEYS.year, profile.year);
}

async function syncProfileToBackend(profile, destination) {
    try {
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: profile.name,
                email: profile.email,
                degree: profile.degree,
                year: profile.year,
                destination
            })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Profile sync failed');
        }
    } catch (err) {
        console.warn('Profile sync warning:', err.message);
    }
}

function openModal(destination = 'quiz.html') {
    if (!authModal) return;

    pendingDestination = getSafeDestination(destination);
    authModal.classList.add('open');

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.style.display = 'block';

    const modalDesc = document.getElementById('modalDesc');
    if (modalDesc) {
        modalDesc.textContent = pendingDestination === 'counsellor.html'
            ? 'Create your free account and start with Bun-Bot counsellor.'
            : 'Create your free account and take the career quiz.';
    }

    const saved = getSavedProfile();
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const degreeInput = document.getElementById('signupDegree');
    const yearInput = document.getElementById('signupYear');

    if (nameInput && saved.name) nameInput.value = saved.name;
    if (emailInput && saved.email) emailInput.value = saved.email;
    if (degreeInput && saved.degree) degreeInput.value = saved.degree;
    if (yearInput && saved.year) yearInput.value = saved.year;
}

function closeModal() {
    if (!authModal) return;
    authModal.classList.remove('open');
}

async function submitSignup() {
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const degreeInput = document.getElementById('signupDegree');
    const yearInput = document.getElementById('signupYear');
    const submitBtn = document.getElementById('submitSignupBtn');

    if (!nameInput || !emailInput || !degreeInput || !yearInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const degree = degreeInput.value;
    const year = yearInput.value;

    if (!name) {
        alert('Please enter your name');
        return;
    }

    if (!email || !EMAIL_REGEX.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    if (!degree) {
        alert('Please select your degree / program');
        return;
    }

    if (!year) {
        alert('Please select your current year');
        return;
    }

    const profile = { name, email, degree, year };
    saveProfileLocally(profile);

    const defaultLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
    }

    await syncProfileToBackend(profile, pendingDestination);

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultLabel;
    }

    closeModal();
    window.location.href = pendingDestination;
}

function bindProfileTriggers() {
    const selector = '[data-auth-destination], .btn-signup, #heroStartQuizBtn, #ctaStartQuizBtn, #footerStartQuizBtn';
    document.querySelectorAll(selector).forEach((el) => {
        el.addEventListener('click', (event) => {
            const destination = getSafeDestination(el.getAttribute('data-auth-destination') || 'quiz.html');

            if (hasCompleteProfile()) {
                event.preventDefault();
                window.location.href = destination;
                return;
            }

            event.preventDefault();
            openModal(destination);
        });
    });
}

bindProfileTriggers();

const closeModalBtn = document.getElementById('closeModalBtn');
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

const submitSignupBtn = document.getElementById('submitSignupBtn');
if (submitSignupBtn) submitSignupBtn.addEventListener('click', submitSignup);

if (authModal) {
    authModal.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
}

const pageName = window.location.pathname.split('/').pop() || 'index.html';
if (pageName === 'index.html') {
    const nextParam = new URLSearchParams(window.location.search).get('next');
    if (nextParam) {
        const destination = getSafeDestination(nextParam);
        if (hasCompleteProfile()) {
            window.location.href = destination;
        } else {
            openModal(destination);
        }
    }
}

// ===== COUNT-UP ANIMATION (Stats Section) =====
function animateCount(el) {
    const target = Number(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        el.textContent = `${current}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = `${target}${suffix}`;
        }
    }

    requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-num').forEach((el) => animateCount(el));
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsRow = document.querySelector('.stats-row');
if (statsRow) statsObserver.observe(statsRow);
