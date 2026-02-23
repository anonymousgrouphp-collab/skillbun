require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Trust the Vercel reverse proxy for correct IP identification by express-rate-limit
app.set('trust proxy', 1);

// ===== SECURITY: Helmet for HTTP security headers =====
try {
    const helmet = require('helmet');
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
                "script-src-attr": ["'self'", "'unsafe-inline'", "'unsafe-hashes'"],
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
                "img-src": ["'self'", "data:", "https:"]
            }
        }
    }));
} catch (e) {
    console.warn('⚠️  helmet not installed — run: npm install helmet');
}

// ===== SECURITY: Rate limiting =====
try {
    const rateLimit = require('express-rate-limit');

    // General rate limit
    const generalLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 60,
        message: { error: 'Too many requests. Please slow down.' }
    });

    // Strict rate limit for Gemini API
    const apiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 25, // Increased from 20 to accommodate the new 18-question dynamic length + Load More
        message: { error: 'Too many API requests. Please wait a moment.' }
    });

    app.use(generalLimiter);
    app.use('/api/gemini', apiLimiter);
} catch (e) {
    console.warn('⚠️  express-rate-limit not installed — run: npm install express-rate-limit');
}

// ===== SECURITY: Body size limit =====
app.use(express.json({ limit: '100kb' }));

// ===== SECURITY: CORS =====
try {
    const cors = require('cors');
    // For local development, allow all origins so mobile testing works.
    // In production, restrict this to your actual deployed domain.
    app.use(cors());
} catch (e) {
    console.warn('⚠️  cors not installed — run: npm install cors');
}

// ===== SECURITY: Block .env and dotfiles from static serving =====
app.use((req, res, next) => {
    const blocked = ['.env', '.gitignore', '.git'];
    const reqPath = decodeURIComponent(req.path).toLowerCase();
    if (blocked.some(f => reqPath.includes(f))) {
        return res.status(403).send('Access denied');
    }
    next();
});

// Serve static files from the public folder (prevents exposing backend JS)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// ===== Gemini API proxy endpoint =====
app.post('/api/gemini', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
        return res.status(500).json({ error: 'API key not configured. Please contact the team.' });
    }

    // ===== SECURITY: Validate request body structure =====
    const body = req.body;
    if (!body || !body.contents || !Array.isArray(body.contents)) {
        return res.status(400).json({ error: 'Invalid request format.' });
    }

    // Ensure each content item has valid role and parts
    for (const item of body.contents) {
        if (!item.role || !['user', 'model'].includes(item.role)) {
            return res.status(400).json({ error: 'Invalid request format.' });
        }
        if (!item.parts || !Array.isArray(item.parts)) {
            return res.status(400).json({ error: 'Invalid request format.' });
        }
    }

    // Cap conversation length to prevent abuse
    if (body.contents.length > 60) {
        return res.status(400).json({ error: 'Conversation too long. Please start a new quiz.' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {
            // ===== SECURITY: Don't leak raw API error details =====
            const statusCode = response.status;
            console.error(`Gemini API error: ${statusCode} — ${await response.text()}`);

            if (statusCode === 429) {
                return res.status(429).json({ error: 'AI is busy. Please try again in a moment.' });
            }
            return res.status(502).json({ error: 'Something went wrong with our AI service. Please try again.' });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Gemini API error:', err.message);
        res.status(500).json({ error: 'Could not reach AI service. Please check your internet connection.' });
    }
});

// Let Vercel handle the port binding, but keep it for local dev
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🐰 SkillBun server running at http://localhost:${PORT}`);
        console.log(`📝 Quiz page: http://localhost:${PORT}/quiz.html`);
        console.log(`🏠 Homepage:  http://localhost:${PORT}/index.html\n`);
    });
}

module.exports = app;
