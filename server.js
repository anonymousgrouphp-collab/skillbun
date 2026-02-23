require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const TURNSTILE_SITE_KEY = (process.env.TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SECRET_KEY = (process.env.TURNSTILE_SECRET_KEY || '').trim();
const CAPTCHA_ENABLED = Boolean(TURNSTILE_SITE_KEY && TURNSTILE_SECRET_KEY);
const HUMAN_PROOF_SECRET = process.env.HUMAN_PROOF_SECRET || process.env.GEMINI_API_KEY || 'development-human-proof-secret';
const HUMAN_PROOF_TTL_MS = Number.parseInt(process.env.HUMAN_PROOF_TTL_MS || '1800000', 10); // 30 min
const HUMAN_PROOF_HEADER = 'x-skillbun-human';

if (IS_PRODUCTION && (TURNSTILE_SITE_KEY || TURNSTILE_SECRET_KEY) && !CAPTCHA_ENABLED) {
    console.warn('Turnstile is partially configured. Set both TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY.');
}

function getClientIp(req) {
    return req.ip || req.socket?.remoteAddress || 'unknown';
}

function hashIp(ip) {
    return crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 32);
}

function signHumanProofToken(payload) {
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', HUMAN_PROOF_SECRET).update(payloadB64).digest('base64url');
    return `${payloadB64}.${signature}`;
}

function issueHumanProofToken(ip) {
    const safeTtl = Number.isFinite(HUMAN_PROOF_TTL_MS) ? Math.max(HUMAN_PROOF_TTL_MS, 60_000) : 1_800_000;
    const expiresAt = Date.now() + safeTtl;
    const token = signHumanProofToken({ exp: expiresAt, ip: hashIp(ip) });
    return { token, expiresAt };
}

function verifyHumanProofToken(token, ip) {
    if (typeof token !== 'string' || token.length < 20 || !token.includes('.')) {
        return false;
    }

    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) {
        return false;
    }

    const expectedSignature = crypto.createHmac('sha256', HUMAN_PROOF_SECRET).update(payloadB64).digest('base64url');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return false;
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    } catch (err) {
        return false;
    }

    if (!payload || typeof payload.exp !== 'number' || typeof payload.ip !== 'string') {
        return false;
    }

    if (payload.exp < Date.now()) {
        return false;
    }

    return payload.ip === hashIp(ip);
}

async function verifyTurnstileToken(token, remoteIp) {
    if (!CAPTCHA_ENABLED) {
        return { success: true };
    }

    if (typeof token !== 'string' || token.length < 10 || token.length > 2048) {
        return { success: false };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    try {
        const formBody = new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: token
        });

        if (remoteIp) {
            formBody.set('remoteip', remoteIp);
        }

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formBody.toString(),
            signal: controller.signal
        });

        if (!response.ok) {
            return { success: false };
        }

        const data = await response.json();
        return { success: data?.success === true };
    } catch (err) {
        if (err.name === 'AbortError') {
            return { success: false };
        }

        return { success: false };
    } finally {
        clearTimeout(timeout);
    }
}

// Trust reverse proxy only in production deployments.
if (IS_PRODUCTION) {
    app.set('trust proxy', 1);
}

// ===== SECURITY: Helmet for HTTP security headers =====
try {
    const helmet = require('helmet');
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'", "https://challenges.cloudflare.com"],
                "script-src-attr": ["'none'"],
                "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
                "img-src": ["'self'", "data:", "https:"],
                "connect-src": ["'self'", "https://challenges.cloudflare.com"],
                "frame-src": ["'self'", "https://challenges.cloudflare.com"],
                "object-src": ["'none'"],
                "base-uri": ["'self'"],
                "frame-ancestors": ["'none'"]
            }
        }
    }));
} catch (e) {
    console.warn('helmet not installed - run: npm install helmet');
}

// ===== SECURITY: Rate limiting =====
try {
    const rateLimit = require('express-rate-limit');

    // General rate limit
    const generalLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 60,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Too many requests. Please slow down.' }
    });

    // Strict rate limit for Gemini API
    const apiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 25,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Too many API requests. Please wait a moment.' }
    });

    app.use(generalLimiter);
    app.use('/api/gemini', apiLimiter);
} catch (e) {
    console.warn('express-rate-limit not installed - run: npm install express-rate-limit');
}

// ===== SECURITY: Body size limit =====
app.use(express.json({ limit: '100kb' }));

// ===== SECURITY: CORS =====
try {
    const cors = require('cors');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    if (!IS_PRODUCTION) {
        // Local development: allow all origins for LAN/mobile testing.
        app.use(cors());
    } else if (allowedOrigins.length > 0) {
        // Production: only allow explicit trusted origins.
        app.use(cors({
            origin: allowedOrigins,
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'X-Skillbun-Human'],
            maxAge: 86400
        }));
    }
} catch (e) {
    console.warn('cors not installed - run: npm install cors');
}

// ===== SECURITY: Block .env and dotfiles from static serving =====
app.use((req, res, next) => {
    const blocked = ['.env', '.gitignore', '.git'];
    let reqPath = req.path.toLowerCase();

    try {
        reqPath = decodeURIComponent(req.path).toLowerCase();
    } catch (err) {
        return res.status(400).send('Bad request');
    }

    if (blocked.some(fileName => reqPath.includes(fileName))) {
        return res.status(403).send('Access denied');
    }

    return next();
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public'), {
    etag: true,
    lastModified: true,
    maxAge: IS_PRODUCTION ? '1h' : 0,
    setHeaders: (res, filePath) => {
        if (!IS_PRODUCTION) return;

        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.html') {
            res.setHeader('Cache-Control', 'no-cache');
            return;
        }

        const cacheableExt = new Set([
            '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2'
        ]);

        if (cacheableExt.has(ext)) {
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        }
    }
}));

app.get('/api/config', (req, res) => {
    return res.json({
        captcha: {
            provider: 'turnstile',
            enabled: CAPTCHA_ENABLED,
            siteKey: CAPTCHA_ENABLED ? TURNSTILE_SITE_KEY : ''
        }
    });
});

app.post('/api/human/verify', async (req, res) => {
    const ip = getClientIp(req);

    if (!CAPTCHA_ENABLED) {
        const issued = issueHumanProofToken(ip);
        return res.json({
            captchaEnabled: false,
            humanToken: issued.token,
            expiresAt: issued.expiresAt
        });
    }

    const token = req.body?.token;
    const result = await verifyTurnstileToken(token, ip);

    if (!result.success) {
        return res.status(403).json({ error: 'Captcha verification failed. Please try again.' });
    }

    const issued = issueHumanProofToken(ip);
    return res.json({
        captchaEnabled: true,
        humanToken: issued.token,
        expiresAt: issued.expiresAt
    });
});

// ===== Gemini API proxy endpoint =====
app.post('/api/gemini', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const ip = getClientIp(req);

    if (!apiKey || apiKey === 'your_api_key_here') {
        return res.status(500).json({ error: 'API key not configured. Please contact the team.' });
    }

    if (CAPTCHA_ENABLED) {
        const humanToken = req.get(HUMAN_PROOF_HEADER);
        if (!verifyHumanProofToken(humanToken, ip)) {
            return res.status(403).json({ error: 'Human verification required. Please verify and try again.' });
        }
    }

    const body = req.body;
    if (!body || !body.contents || !Array.isArray(body.contents)) {
        return res.status(400).json({ error: 'Invalid request format.' });
    }

    const MAX_CONTENT_ITEMS = 60;
    const MAX_PARTS_PER_ITEM = 8;
    const MAX_TEXT_LENGTH_PER_PART = 4000;
    const MAX_TOTAL_TEXT_LENGTH = 30000;
    let totalTextLength = 0;

    for (const item of body.contents) {
        if (!item.role || !['user', 'model'].includes(item.role)) {
            return res.status(400).json({ error: 'Invalid request format.' });
        }

        if (!item.parts || !Array.isArray(item.parts) || item.parts.length === 0 || item.parts.length > MAX_PARTS_PER_ITEM) {
            return res.status(400).json({ error: 'Invalid request format.' });
        }

        for (const part of item.parts) {
            if (!part || typeof part.text !== 'string') {
                return res.status(400).json({ error: 'Invalid request format.' });
            }

            const text = part.text.trim();
            if (!text || text.length > MAX_TEXT_LENGTH_PER_PART) {
                return res.status(400).json({ error: 'Invalid request format.' });
            }

            totalTextLength += text.length;
            if (totalTextLength > MAX_TOTAL_TEXT_LENGTH) {
                return res.status(400).json({ error: 'Conversation payload too large.' });
            }
        }
    }

    if (body.contents.length > MAX_CONTENT_ITEMS) {
        return res.status(400).json({ error: 'Conversation too long. Please start a new quiz.' });
    }

    const timeoutMs = Number.parseInt(process.env.GEMINI_TIMEOUT_MS || '20000', 10);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 20000);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal
            }
        );

        if (!response.ok) {
            const statusCode = response.status;
            const upstreamText = (await response.text()).slice(0, 500);
            console.error(`Gemini API error: ${statusCode} -- ${upstreamText}`);

            if (statusCode === 429) {
                return res.status(429).json({ error: 'AI is busy. Please try again in a moment.' });
            }
            return res.status(502).json({ error: 'Something went wrong with our AI service. Please try again.' });
        }

        const data = await response.json();
        return res.json(data);
    } catch (err) {
        if (err.name === 'AbortError') {
            return res.status(504).json({ error: 'AI service timed out. Please try again.' });
        }

        console.error('Gemini API error:', err.message);
        return res.status(500).json({ error: 'Could not reach AI service. Please check your internet connection.' });
    } finally {
        clearTimeout(timeout);
    }
});

// Let Vercel handle the port binding, but keep it for local dev
if (!IS_PRODUCTION) {
    app.listen(PORT, () => {
        console.log(`SkillBun server running at http://localhost:${PORT}`);
        console.log(`Quiz page: http://localhost:${PORT}/quiz.html`);
        console.log(`Homepage:  http://localhost:${PORT}/index.html`);
    });
}

module.exports = app;
