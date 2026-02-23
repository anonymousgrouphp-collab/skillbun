// ===== INITIAL SHUFFLE STATE =====
document.querySelectorAll('.shuffle-text').forEach(el => {
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    const len = el.getAttribute('data-final').length;
    let s = '';
    for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
    el.textContent = s;
});

// ===== CODE RAIN (Splash Screen) =====
const rainEl = document.getElementById('codeRain');
if (rainEl) {
    const codeChars = ['0', '1', '</>', '{}', '[]', '//', 'def', 'fn', 'var', '&&', '||', '!=', 'if', 'for', 'git'];

    for (let i = 0; i < 20; i++) {
        const col = document.createElement('div');
        col.className = 'code-col';
        col.style.left = Math.random() * 100 + '%';
        col.style.animationDuration = (6 + Math.random() * 8) + 's';
        col.style.animationDelay = (Math.random() * 5) + 's';

        let content = '';
        for (let j = 0; j < 15; j++) {
            content += codeChars[Math.floor(Math.random() * codeChars.length)] + '<br>';
        }
        col.innerHTML = content;
        rainEl.appendChild(col);
    }
}



// ===== SPLASH → MAIN PAGE TRANSITION =====
setTimeout(() => {
    const splash = document.getElementById('splash');
    const mainPage = document.getElementById('main-page');

    if (splash) splash.classList.add('hide');
    if (mainPage) mainPage.classList.add('show');

    // Start shuffle animation after page appears
    setTimeout(() => {
        document.querySelectorAll('.shuffle-text').forEach((el, i) => {
            shuffleText(el, i * 400); // stagger each word
        });
    }, 500);
}, 3000);

// ===== LETTER SHUFFLE ANIMATION =====
function shuffleText(el, delay) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    const finalText = el.getAttribute('data-final');
    const duration = 1200;
    const iterations = 12;
    let currentIteration = 0;

    setTimeout(() => {
        const interval = setInterval(() => {
            currentIteration++;
            const progress = currentIteration / iterations;

            // Gradually reveal correct letters from left to right
            let display = '';
            for (let i = 0; i < finalText.length; i++) {
                if (i / finalText.length < progress) {
                    display += finalText[i]; // locked in
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

// ===== AUTH MODAL =====
const authModal = document.getElementById('signupModal');

function openModal() {
    if (!authModal) return;
    authModal.classList.add('open');

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.style.display = 'block';

    const modalDesc = document.getElementById('modalDesc');
    if (modalDesc) modalDesc.textContent = 'Create your free account and take the career quiz.';
}

function closeModal() {
    if (!authModal) return;
    authModal.classList.remove('open');
}

// ===== SIGNUP → QUIZ REDIRECT =====
function submitSignup() {
    const name = document.getElementById('signupName').value.trim();
    const degree = document.getElementById('signupDegree').value;
    const year = document.getElementById('signupYear').value;

    if (!name) {
        alert('Please enter your name 🐰');
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

    // Save to localStorage
    localStorage.setItem('sb_name', name);
    localStorage.setItem('sb_degree', degree);
    localStorage.setItem('sb_year', year);

    // Redirect to quiz
    window.location.href = 'quiz.html';
}

// Wire up modal buttons
document.querySelectorAll('.btn-signup, #heroStartQuizBtn, #ctaStartQuizBtn, #footerStartQuizBtn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
    });
});

const closeModalBtn = document.getElementById('closeModalBtn');
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

const submitSignupBtn = document.getElementById('submitSignupBtn');
if (submitSignupBtn) submitSignupBtn.addEventListener('click', submitSignup);

// Close modal when clicking outside
if (authModal) {
    authModal.addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });
}

// ===== COUNT-UP ANIMATION (Stats Section) =====
function animateCount(el) {
    const target = +el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        el.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target + suffix;
        }
    }

    requestAnimationFrame(update);
}

// Trigger count-up when stats section scrolls into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-num').forEach(el => animateCount(el));
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsRow = document.querySelector('.stats-row');
if (statsRow) statsObserver.observe(statsRow);
