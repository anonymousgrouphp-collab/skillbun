#!/usr/bin/env node
/**
 * SkillBun - Document Template Immutability Guard
 *
 * Enforces the version-pinned / append-only template architecture:
 * 1. Checks that no released, frozen document template files or visual assets were modified.
 * 2. Validates that all declared supportedVersions in TEMPLATE_REGISTRY have concrete
 *    renderer/generator implementations on disk.
 * 3. Ensures activeVersion exists in supportedVersions.
 *
 * If a developer or AI agent attempts to edit a frozen V1 file directly, this guard
 * blocks the build with clear instructions on how to scaffold and register V2.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  ALL_FROZEN_TEMPLATE_PATHS,
  CATEGORY_CAPABILITIES,
  DOCUMENT_CATEGORIES,
  TEMPLATE_REGISTRY,
  validateTemplateRegistry,
} from '../utils/common/docTemplateRegistry.js';

/**
 * Normalizes a file path to forward slashes relative to the repository root.
 *
 * @param {string} filePath
 * @returns {string}
 */
export function normalizePath(filePath) {
  return String(filePath).replace(/\\/g, '/').replace(/^\.\//, '').trim();
}

/**
 * Checks a list of changed file paths against the frozen template paths manifest.
 *
 * @param {string[]} changedFiles - List of repo-relative paths
 * @param {readonly string[]} [frozenPaths=ALL_FROZEN_TEMPLATE_PATHS]
 * @returns {{ hasViolations: boolean, violations: string[] }}
 */
export function checkFrozenFilesModified(changedFiles, frozenPaths = ALL_FROZEN_TEMPLATE_PATHS) {
  const normalizedFrozen = new Set(frozenPaths.map(normalizePath));
  const violations = [];

  for (const rawFile of changedFiles) {
    const file = normalizePath(rawFile);
    if (normalizedFrozen.has(file)) {
      violations.push(file);
    }
  }

  return {
    hasViolations: violations.length > 0,
    violations: Array.from(new Set(violations)).sort(),
  };
}

/**
 * Verifies that all declared supported versions in the registry have corresponding
 * implementation files on disk.
 *
 * @param {Object} [registry=TEMPLATE_REGISTRY]
 * @param {string} [rootDir=process.cwd()]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function verifyTemplateImplementations(registry = TEMPLATE_REGISTRY, rootDir = process.cwd()) {
  const errors = [];

  for (const [category, config] of Object.entries(registry)) {
    const capability = CATEGORY_CAPABILITIES[category];

    for (const version of config.supportedVersions) {
      const vUpper = version.toUpperCase();
      const vLower = version.toLowerCase();

      if (capability === 'web') {
        const rendererFile = path.join(
          rootDir,
          'app',
          'certificate',
          '[id]',
          'templates',
          `CertificateRenderer${vUpper}.jsx`
        );
        if (!fs.existsSync(rendererFile)) {
          errors.push(
            `Missing Web Renderer for category "${category}" version "${version}": Expected "${normalizePath(
              path.relative(rootDir, rendererFile)
            )}"`
          );
        }
      } else if (capability === 'pdf') {
        let generatorSubdir = '';
        if (category === DOCUMENT_CATEGORIES.OFFER_LETTER) generatorSubdir = 'offerLetter';
        else if (category === DOCUMENT_CATEGORIES.EXTENSION_LETTER) generatorSubdir = 'extensionLetter';
        else if (category === DOCUMENT_CATEGORIES.TERMINATION_NOTICE) generatorSubdir = 'terminationNotice';

        if (generatorSubdir) {
          const generatorFile = path.join(
            rootDir,
            'utils',
            'server',
            'pdf',
            'templates',
            generatorSubdir,
            `${vLower}.js`
          );
          if (!fs.existsSync(generatorFile)) {
            errors.push(
              `Missing PDF Generator for category "${category}" version "${version}": Expected "${normalizePath(
                path.relative(rootDir, generatorFile)
              )}"`
            );
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Retrieves the set of changed files from Git.
 * In CI, compares against base branch or previous commit.
 * In local dev, includes working directory modifications and staging area.
 *
 * @param {string} [customBase] - Optional git ref to compare against
 * @returns {string[]} List of changed file paths relative to repo root
 */
export function getGitChangedFiles(customBase) {
  const files = new Set();

  function runGit(cmd) {
    try {
      const output = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      return output
        .split(/\r?\n/)
        .map((f) => f.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  if (customBase) {
    runGit(`git diff --name-only ${customBase}`).forEach((f) => files.add(f));
    return Array.from(files);
  }

  // 1. CI Pull Request: Compare against base ref
  if (process.env.GITHUB_BASE_REF) {
    const base = `origin/${process.env.GITHUB_BASE_REF}`;
    runGit(`git diff --name-only ${base}...HEAD`).forEach((f) => files.add(f));
  } else if (process.env.GITHUB_BEFORE && process.env.GITHUB_BEFORE !== '0000000000000000000000000000000000000000') {
    // 2. CI Push Event: Compare against before SHA
    runGit(`git diff --name-only ${process.env.GITHUB_BEFORE} HEAD`).forEach((f) => files.add(f));
  } else {
    // 3. Fallback / Local commit compare
    runGit('git diff-tree --no-commit-id --name-only -r HEAD').forEach((f) => files.add(f));
  }

  // 4. Also check unstaged and staged local changes
  runGit('git diff --name-only HEAD').forEach((f) => files.add(f));
  runGit('git diff --name-only --cached').forEach((f) => files.add(f));

  return Array.from(files);
}

/**
 * Main validation runner.
 */
export function runImmutabilityGuard(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  console.log('🛡️  SkillBun Document Template Immutability Guard running...');

  // Step 1: Validate registry structural integrity
  const registryCheck = validateTemplateRegistry();
  if (!registryCheck.valid) {
    console.error('\n❌ Registry Configuration Error:');
    registryCheck.errors.forEach((err) => console.error(`  - ${err}`));
    return { success: false, reason: 'REGISTRY_INVALID', errors: registryCheck.errors };
  }

  // Step 2: Verify concrete file existence for all declared versions
  const fileCheck = verifyTemplateImplementations(TEMPLATE_REGISTRY, rootDir);
  if (!fileCheck.valid) {
    console.error('\n❌ Missing Template Implementation Files:');
    fileCheck.errors.forEach((err) => console.error(`  - ${err}`));
    return { success: false, reason: 'IMPLEMENTATIONS_MISSING', errors: fileCheck.errors };
  }

  // Step 3: Check Git modifications against frozen template manifest
  const changedFiles = options.changedFiles || getGitChangedFiles(options.baseRef);
  const immutabilityCheck = checkFrozenFilesModified(changedFiles);

  if (immutabilityCheck.hasViolations) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ ERROR: Released document template file was modified in-place!');
    console.error('='.repeat(80));
    console.error('The following frozen template files or assets have been modified:\n');
    immutabilityCheck.violations.forEach((f) => console.error(`  - ${f}`));
    console.error('\n' + '-'.repeat(80));
    console.error('RULES FOR DOCUMENT TEMPLATE IMMUTABILITY:');
    console.error('1. Released template versions (such as V1) are permanently frozen and immutable.');
    console.error('   Do NOT modify existing V1 files, as doing so alters historical records.');
    console.error('2. Implement your visual, structural, or layout changes as a NEW version:');
    console.error('     npm run template:new -- web v2');
    console.error('     npm run template:new -- offerLetter v2');
    console.error('3. If new images are needed, create new asset paths (e.g. /templates/certificate/v2/...).');
    console.error('   Never overwrite frozen V1 assets.');
    console.error('4. Register "v2" under supportedVersions in utils/common/docTemplateRegistry.js.');
    console.error('5. Update activeVersion to "v2" when ready for new documents to be issued with V2.');
    console.error('='.repeat(80) + '\n');
    return { success: false, reason: 'FROZEN_FILES_MODIFIED', violations: immutabilityCheck.violations };
  }

  console.log('✅ Document template immutability verified. Zero frozen template violations.\n');
  return { success: true };
}

// Direct CLI invocation
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const result = runImmutabilityGuard();
  if (!result.success) {
    process.exit(1);
  }
}
