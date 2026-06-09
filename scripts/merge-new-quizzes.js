/**
 * merge-new-quizzes.js
 *
 * Reads new quiz question batch files from scripts/quiz-batches/*.json
 * and merges them into existing quiz files in public/data/quizzes/.
 *
 * Each batch file is a JSON object keyed by slug, where each value is
 * an array of 25 new question objects.
 *
 * Usage: node scripts/merge-new-quizzes.js
 */

const fs = require('fs');
const path = require('path');

const QUIZZES_DIR = path.join(__dirname, '..', 'public', 'data', 'quizzes');
const BATCHES_DIR = path.join(__dirname, 'quiz-batches');

const REQUIRED_FIELDS = ['question', 'options', 'correctIndex', 'explanation', 'difficulty'];
const VALID_DIFFICULTIES = ['easy', 'moderate', 'hard'];

function validateQuestion(q, idx, slug) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!(field in q)) errors.push(`Q${idx}: missing field "${field}"`);
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push(`Q${idx}: options must be an array of exactly 4 strings`);
  }

  if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
    errors.push(`Q${idx}: correctIndex must be 0-3`);
  }

  if (!VALID_DIFFICULTIES.includes(q.difficulty)) {
    errors.push(`Q${idx}: difficulty must be easy/moderate/hard, got "${q.difficulty}"`);
  }

  if (errors.length > 0) {
    console.error(`  [${slug}] Validation errors:`, errors.join('; '));
    return false;
  }
  return true;
}

function validateDifficultyDistribution(questions, slug, expectedTotal) {
  const counts = { easy: 0, moderate: 0, hard: 0 };
  questions.forEach(q => { if (counts[q.difficulty] !== undefined) counts[q.difficulty]++; });

  if (expectedTotal === 50) {
    if (counts.easy !== 14 || counts.moderate !== 26 || counts.hard !== 10) {
      console.warn(`  [${slug}] WARNING: Expected 14e/26m/10h, got ${counts.easy}e/${counts.moderate}m/${counts.hard}h`);
      return false;
    }
  }
  return true;
}

function checkDuplicates(questions, slug) {
  const seen = new Set();
  let dupes = 0;
  questions.forEach((q, i) => {
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) {
      console.warn(`  [${slug}] Duplicate question at index ${i}: "${q.question.substring(0, 60)}..."`);
      dupes++;
    }
    seen.add(key);
  });
  return dupes;
}

function main() {
  if (!fs.existsSync(BATCHES_DIR)) {
    console.error('No quiz-batches directory found at', BATCHES_DIR);
    process.exit(1);
  }

  const batchFiles = fs.readdirSync(BATCHES_DIR).filter(f => f.endsWith('.json')).sort();
  if (batchFiles.length === 0) {
    console.error('No batch JSON files found in', BATCHES_DIR);
    process.exit(1);
  }

  console.log(`Found ${batchFiles.length} batch file(s).\n`);

  let totalMerged = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const batchFile of batchFiles) {
    console.log(`Processing batch: ${batchFile}`);
    const batchPath = path.join(BATCHES_DIR, batchFile);
    let batchData;

    try {
      batchData = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
    } catch (err) {
      console.error(`  Failed to parse ${batchFile}:`, err.message);
      totalErrors++;
      continue;
    }

    for (const [slug, newQuestions] of Object.entries(batchData)) {
      const quizPath = path.join(QUIZZES_DIR, `${slug}.json`);

      if (!fs.existsSync(quizPath)) {
        console.error(`  [${slug}] Quiz file not found, skipping.`);
        totalErrors++;
        continue;
      }

      let existing;
      try {
        existing = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
      } catch (err) {
        console.error(`  [${slug}] Failed to parse existing quiz:`, err.message);
        totalErrors++;
        continue;
      }

      if (existing.length >= 50) {
        console.log(`  [${slug}] Already has ${existing.length} questions, skipping.`);
        totalSkipped++;
        continue;
      }

      if (!Array.isArray(newQuestions) || newQuestions.length !== 25) {
        console.error(`  [${slug}] Expected 25 new questions, got ${Array.isArray(newQuestions) ? newQuestions.length : 'non-array'}`);
        totalErrors++;
        continue;
      }

      // Validate each new question
      let allValid = true;
      newQuestions.forEach((q, i) => {
        if (!validateQuestion(q, i + 25, slug)) allValid = false;
      });

      if (!allValid) {
        console.error(`  [${slug}] Skipped due to validation errors.`);
        totalErrors++;
        continue;
      }

      // Merge
      const merged = [...existing, ...newQuestions];

      // Check for duplicates
      const dupes = checkDuplicates(merged, slug);
      if (dupes > 0) {
        console.warn(`  [${slug}] Found ${dupes} duplicate(s) — merging anyway.`);
      }

      // Validate final distribution
      validateDifficultyDistribution(merged, slug, 50);

      // Write
      fs.writeFileSync(quizPath, JSON.stringify(merged, null, 2) + '\n');
      console.log(`  [${slug}] ✅ Merged: ${existing.length} + ${newQuestions.length} = ${merged.length} questions`);
      totalMerged++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Merged: ${totalMerged}`);
  console.log(`Skipped (already 50+): ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
}

main();
