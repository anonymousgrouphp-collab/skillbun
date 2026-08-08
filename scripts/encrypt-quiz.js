/**
 * SkillBun Vault Encryption Script for Quiz Questions (SBV1)
 * 
 * Encrypts public/data/quizQuestions.json into content/quiz/questions.sbv
 * 
 * Usage:
 *   node scripts/encrypt-quiz.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const ENCRYPTION_KEY = process.env.DOCS_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.error('ERROR: DOCS_ENCRYPTION_KEY must be set in .env (64 hex chars = 32 bytes)');
  process.exit(1);
}

const MASTER_KEY = Buffer.from(ENCRYPTION_KEY, 'hex');
const MAGIC_HEADER = Buffer.from('SBV1');
const FORMAT_VERSION = 0x01;
const SB_PEPPER = Buffer.from('SkillBunVault2026!HopIntoSecurity@SBV1#Pepper$Key%Guard', 'utf8');

const SOURCE_FILE = path.join(__dirname, '..', 'public', 'data', 'quizQuestions.json');
const TARGET_FILE = path.join(__dirname, '..', 'content', 'quiz', 'questions.sbv');

function deriveFileKey(masterKey, salt, fileIdentity) {
  const prk = crypto.createHmac('sha256', salt).update(masterKey).digest();
  const info = Buffer.from(`sbv1:quiz:${fileIdentity}`, 'utf8');
  return crypto.createHmac('sha256', prk)
    .update(Buffer.concat([info, Buffer.from([0x01])]))
    .digest();
}

function xorScramble(data) {
  const result = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ SB_PEPPER[i % SB_PEPPER.length] ^ ((i * 7 + 13) & 0xFF);
  }
  return result;
}

function encryptQuizQuestions() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('Source file not found:', SOURCE_FILE);
    process.exit(1);
  }

  const plaintext = fs.readFileSync(SOURCE_FILE);
  const contentHash = crypto.createHash('sha256').update(plaintext).digest();
  const scrambled = xorScramble(plaintext);
  const salt = crypto.randomBytes(16);
  const fileKey = deriveFileKey(MASTER_KEY, salt, 'questions');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', fileKey, iv);
  const encrypted = Buffer.concat([cipher.update(scrambled), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const output = Buffer.concat([
    MAGIC_HEADER,
    Buffer.from([FORMAT_VERSION]),
    salt,
    iv,
    authTag,
    contentHash,
    encrypted,
  ]);

  const outputDir = path.dirname(TARGET_FILE);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(TARGET_FILE, output);

  console.log(`🔐 Encrypted quiz questions into ${TARGET_FILE} using SBV1 protection!`);
}

encryptQuizQuestions();
