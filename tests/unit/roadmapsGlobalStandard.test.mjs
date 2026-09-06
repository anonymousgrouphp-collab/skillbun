import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROADMAPS_DIR = path.join(process.cwd(), 'public', 'data', 'roadmaps');

test('SkillBun 100 Roadmaps Global Standard Suite', async (t) => {
  const files = fs.readdirSync(ROADMAPS_DIR).filter((f) => f.endsWith('.json')).sort();

  await t.test('Exactly 100 roadmap files exist in the catalog', () => {
    assert.equal(files.length, 100, `Expected exactly 100 roadmap files, but found ${files.length}`);
  });

  await t.test('All 100 roadmaps adhere to the global standard schema and pillars', () => {
    const regionalRegex = /\b(in India|Indian landscape|dynamic Indian context)\b/i;

    for (const file of files) {
      const filePath = path.join(ROADMAPS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      
      // JSON integrity
      assert.doesNotThrow(() => JSON.parse(raw), `${file} must be valid JSON`);
      const data = JSON.parse(raw);

      // Core metadata
      assert.ok(data.id, `${file} must have id`);
      assert.ok(data.title, `${file} must have title`);
      assert.ok(data.description && data.description.length > 20, `${file} must have descriptive description`);
      assert.equal(regionalRegex.test(data.description), false, `${file} description must be global standard`);

      // Pillar 1: Goal
      assert.ok(data.goal, `${file} must define goal`);
      assert.ok(data.goal.objective, `${file} goal must define objective`);
      assert.ok(data.goal.salary, `${file} goal must define salary string`);
      assert.ok(data.goal.salary.includes('$'), `${file} salary must include global USD benchmark`);
      assert.ok(data.goal.salary.includes('₹') || data.goal.salary.includes('LPA'), `${file} salary must include regional LPA benchmark`);
      assert.ok(data.goal.salary_range?.usd?.min > 0, `${file} salary_range must define usd.min`);
      assert.ok(data.goal.salary_range?.inr_lpa?.min > 0, `${file} salary_range must define inr_lpa.min`);
      assert.ok(Array.isArray(data.goal.target_roles) && data.goal.target_roles.length >= 2, `${file} goal must define target_roles`);
      assert.ok(Array.isArray(data.goal.career_pillars) && data.goal.career_pillars.length >= 2, `${file} goal must define career_pillars`);

      // Pillar 2: Learn
      assert.ok(data.learn, `${file} must define learn`);
      assert.ok(data.learn.summary, `${file} learn must define summary`);
      assert.ok(Array.isArray(data.learn.key_competencies) && data.learn.key_competencies.length >= 3, `${file} learn must define key_competencies`);
      assert.ok(Array.isArray(data.learn.prerequisites), `${file} learn must define prerequisites`);

      // Pillar 3: Boost
      assert.ok(data.boost, `${file} must define boost`);
      assert.ok(Array.isArray(data.boost.capstone_projects) && data.boost.capstone_projects.length >= 1, `${file} boost must define capstone_projects`);
      assert.ok(Array.isArray(data.boost.certifications) && data.boost.certifications.length >= 1, `${file} boost must define certifications`);
      assert.ok(Array.isArray(data.boost.interview_focus) && data.boost.interview_focus.length >= 2, `${file} boost must define interview_focus`);

      // Structure integrity
      const hasTree = Array.isArray(data.tree) && data.tree.length > 0;
      const hasStages = Array.isArray(data.stages) && data.stages.length > 0;
      assert.ok(hasTree || hasStages, `${file} must contain a valid tree or stages structure`);
    }
  });

  await t.test('Zero regional framing phrases remain anywhere in all 100 files', () => {
    const regionalRegex = /\b(in India|Indian landscape|dynamic Indian context)\b/i;
    for (const file of files) {
      const raw = fs.readFileSync(path.join(ROADMAPS_DIR, file), 'utf8');
      assert.equal(regionalRegex.test(raw), false, `Found regional framing text in ${file}`);
    }
  });
});
