// app.js - Main Frontend Logic for SkillBun (CSP Compliant)

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

function openModal() {
    document.getElementById('authModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e) e.stopPropagation();
    document.getElementById('authModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitSignup() {
    const name = document.getElementById('nameInput').value.trim();
    const degree = document.getElementById('degreeInput').value.trim();
    const year = document.getElementById('yearInput').value;

    if (!name || !degree || !year) {
        alert('Please fill in all fields to start the quiz!');
        return;
    }

    const payload = {
        name: name,
        degree: degree,
        year: year
    };

    localStorage.setItem('skillBunProfile', JSON.stringify(payload));
    window.location.href = 'quiz.html';
}

// Light/Dark Theme Logic
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

const currentTheme = localStorage.getItem("theme");
if (currentTheme == "light") {
    document.body.classList.toggle("light-theme");
    themeToggle.textContent = '☀️';
} else if (currentTheme == "dark") {
    themeToggle.textContent = '🌙';
} else if (!prefersDarkScheme.matches) {
    document.body.classList.toggle("light-theme");
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("light-theme");
    let theme = "dark";
    if (document.body.classList.contains("light-theme")) {
        theme = "light";
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    localStorage.setItem("theme", theme);
});

// Event Bindings setup for Content Security Policy (No inline onclicks allowed)
document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu
    const hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMenu);

    // Close mobile menu when a link is clicked
    const navLinksDiv = document.getElementById('navLinks');
    if (navLinksDiv) {
        navLinksDiv.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // Modal Triggers
    const ctaBtns = document.querySelectorAll('.btn-signup, #heroStartQuizBtn, #footerStartQuizBtn, #ctaStartQuizBtn');
    ctaBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    }));

    // Modal Closers
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());

    const authModal = document.getElementById('authModal');
    if (authModal) authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeModal();
    });

    // Signup Submit
    const submitBtn = document.getElementById('submitSignupBtn');
    if (submitBtn) submitBtn.addEventListener('click', submitSignup);

    // Auto-fill form if data exists
    const saved = localStorage.getItem('skillBunProfile');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (document.getElementById('nameInput')) document.getElementById('nameInput').value = parsed.name || '';
            if (document.getElementById('degreeInput')) document.getElementById('degreeInput').value = parsed.degree || '';
            if (document.getElementById('yearInput')) document.getElementById('yearInput').value = parsed.year || '';
        } catch (e) {
            console.error(e);
        }
    }
});
