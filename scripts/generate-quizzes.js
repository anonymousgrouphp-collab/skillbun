const fs = require('fs');
const path = require('path');

// Simple regex helper to load environment variables from .env
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      });
    }
  } catch (error) {
    console.error('Warning: Failed to load .env file:', error.message);
  }
}

loadEnv();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is not defined in .env');
  process.exit(1);
}

const ROADMAPS_DIR = path.join(__dirname, '..', 'public', 'data', 'roadmaps');
const QUIZZES_DIR = path.join(__dirname, '..', 'public', 'data', 'quizzes');

// Ensure quizzes output directory exists
if (!fs.existsSync(QUIZZES_DIR)) {
  fs.mkdirSync(QUIZZES_DIR, { recursive: true });
}

// Helper to extract clean topic metadata from a roadmap JSON
function extractTopics(roadmap) {
  const topics = [];

  function walk(node) {
    if (node.name) {
      topics.push({ name: node.name, description: node.description || '' });
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(walk);
    }
  }

  if (roadmap.format === 'tree' && Array.isArray(roadmap.tree)) {
    roadmap.tree.forEach(walk);
  } else if (Array.isArray(roadmap.stages)) {
    roadmap.stages.forEach((stage) => {
      if (stage.title) {
        topics.push({ name: stage.title, description: stage.description || '' });
      }
      if (Array.isArray(stage.topics)) {
        stage.topics.forEach(walk);
      }
      if (stage.project) {
        topics.push({ name: `Project: ${stage.project.title}`, description: stage.project.description || '' });
      }
    });
  }

  return topics;
}

// Call Gemini API with structured JSON Schema output configuration
async function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              correctIndex: { type: 'INTEGER' },
              explanation: { type: 'STRING' },
              difficulty: { type: 'STRING', enum: ['easy', 'moderate', 'hard'] },
            },
            required: ['question', 'options', 'correctIndex', 'explanation', 'difficulty'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error [${response.status}]: ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Validate the questions array constraints
function validateQuizData(questions) {
  if (!Array.isArray(questions)) return false;
  if (questions.length !== 25) return false;

  let easyCount = 0;
  let moderateCount = 0;
  let hardCount = 0;

  for (const q of questions) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) return false;
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) return false;
    if (!q.explanation) return false;

    if (q.difficulty === 'easy') easyCount++;
    else if (q.difficulty === 'moderate') moderateCount++;
    else if (q.difficulty === 'hard') hardCount++;
    else return false;
  }

  // Allow small wiggle room, but try to enforce 7/13/5
  return easyCount >= 5 && moderateCount >= 10 && hardCount >= 3;
}

async function processRoadmap(fileName, apiKey) {
  const slug = fileName.replace(/\.json$/, '');
  const roadmapPath = path.join(ROADMAPS_DIR, fileName);
  const quizPath = path.join(QUIZZES_DIR, `${slug}.json`);

  // Checkpoint: Skip if quiz file already exists
  if (fs.existsSync(quizPath)) {
    console.log(`[SKIPPED] Quiz for '${slug}' already exists.`);
    return;
  }

  console.log(`[PROCESSING] Reading roadmap: ${slug}`);
  let roadmap;
  try {
    const content = fs.readFileSync(roadmapPath, 'utf8');
    roadmap = JSON.parse(content);
  } catch (err) {
    console.error(`[ERROR] Failed to read or parse roadmap JSON file: ${fileName}`, err.message);
    return;
  }

  const topics = extractTopics(roadmap);
  if (topics.length === 0) {
    console.warn(`[WARNING] No topics found for roadmap: ${slug}. Skipping.`);
    return;
  }

  const prompt = `You are a professional certification exam writer for SkillBun.
Your task is to generate exactly 25 multiple-choice questions (MCQs) for a certification quiz based strictly on the topics of the following career roadmap.

Roadmap Title: ${roadmap.title}
Roadmap Description: ${roadmap.description}
Roadmap Topics:
${JSON.stringify(topics, null, 2)}

You must return a JSON array containing exactly 25 question objects.
Each question object MUST have:
1. "question": string, the text of the question. Must be scenario-based or conceptual (testing practical, applied knowledge rather than simple dictionary definitions).
2. "options": array of 4 strings (options/choices).
3. "correctIndex": integer (0 to 3), the 0-indexed index of the correct answer in the options array.
4. "explanation": string, a concise explanation of why the correct answer is right and why others are wrong.
5. "difficulty": string, must be exactly "easy", "moderate", or "hard".

Difficulty Distribution Requirement:
- Exactly 7 questions must be marked "easy".
- Exactly 13 questions must be marked "moderate".
- Exactly 5 questions must be marked "hard".

Ensure all questions are strictly relevant to the skills and terms listed in the topics list above. Do not include external trivia. Make sure options are distinct.`;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Calling Gemini API (Attempt ${attempt}/${maxRetries})...`);
      const questions = await callGemini(apiKey, prompt);

      if (validateQuizData(questions)) {
        fs.writeFileSync(quizPath, JSON.stringify(questions, null, 2), 'utf8');
        console.log(`  [SUCCESS] Quiz generated and written to ${quizPath}`);
        return;
      } else {
        console.warn(`  [WARNING] Received invalid quiz structure or bad difficulty counts (expected 25 questions, approx 7/13/5 ratio).`);
        if (attempt === maxRetries) {
          // If final attempt, save it anyway if it is at least an array of questions, to prevent blocking
          if (Array.isArray(questions) && questions.length > 15) {
            fs.writeFileSync(quizPath, JSON.stringify(questions, null, 2), 'utf8');
            console.log(`  [PARTIAL SUCCESS] Quiz saved despite slight layout deviations.`);
            return;
          }
        }
      }
    } catch (error) {
      console.error(`  [ERROR] Attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        const delay = attempt * 5000;
        console.log(`  Waiting ${delay / 1000}s before retrying...`);
        await sleep(delay);
      }
    }
  }

  console.error(`[FAILED] Could not generate quiz for '${slug}' after ${maxRetries} attempts.`);
}

async function main() {
  console.log('SkillBun Certification Quiz Generator Script started.');
  try {
    const allFiles = fs.readdirSync(ROADMAPS_DIR).filter((file) => file.endsWith('.json'));
    
    // Filter out already processed files
    const files = allFiles.filter(file => {
      const slug = file.replace(/\.json$/, '');
      const quizPath = path.join(QUIZZES_DIR, `${slug}.json`);
      if (fs.existsSync(quizPath)) {
        console.log(`[SKIPPED] Quiz for '${slug}' already exists.`);
        return false;
      }
      return true;
    });

    console.log(`Found ${files.length} roadmaps remaining to process.`);

    const apiKeys = [
      GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2 || GEMINI_API_KEY // Fallback to first key if second is missing
    ];

    const mid = Math.ceil(files.length / 2);
    const chunk1 = files.slice(0, mid);
    const chunk2 = files.slice(mid);

    async function processChunk(chunk, apiKey, chunkId) {
      for (let i = 0; i < chunk.length; i++) {
        const file = chunk[i];
        console.log(`\n[Worker ${chunkId}] Progress: ${i + 1}/${chunk.length} (${file})`);
        await processRoadmap(file, apiKey);
        await sleep(100);
      }
    }

    await Promise.all([
      processChunk(chunk1, apiKeys[0], 1),
      processChunk(chunk2, apiKeys[1], 2)
    ]);

    console.log('\nAll roadmaps processed successfully.');
  } catch (error) {
    console.error('Fatal execution error:', error.message);
  }
}

main();
