#!/usr/bin/env node
/**
 * SkillBun - Document Template Scaffolding Utility
 *
 * Helper command to safely scaffold a new template version (e.g. V2) from previous version
 * without touching or mutating frozen production templates.
 *
 * Usage:
 *   npm run template:new -- <target> <version>
 *
 * Targets:
 *   web | certificate      -> app/certificate/[id]/templates/CertificateRenderer<V>.jsx
 *   offerLetter            -> utils/server/pdf/templates/offerLetter/<v>.js
 *   extensionLetter        -> utils/server/pdf/templates/extensionLetter/<v>.js
 *   terminationNotice      -> utils/server/pdf/templates/terminationNotice/<v>.js
 *   all                    -> Scaffolds all 4 templates for the specified version
 *
 * Example:
 *   npm run template:new -- web v2
 *   npm run template:new -- all v2
 */

import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

const TARGETS = {
  web: {
    name: 'Web Certificate Renderer',
    source: path.join(rootDir, 'app', 'certificate', '[id]', 'templates', 'CertificateRendererV1.jsx'),
    dest: (vUpper, vLower) => path.join(rootDir, 'app', 'certificate', '[id]', 'templates', `CertificateRenderer${vUpper}.jsx`),
    transform: (code, vUpper, vLower) => {
      return code
        .replace(/CertificateRendererV1/g, `CertificateRenderer${vUpper}`)
        .replace(/\(V1\)/g, `(${vUpper})`);
    },
  },
  offerLetter: {
    name: 'Offer Letter PDF Generator',
    source: path.join(rootDir, 'utils', 'server', 'pdf', 'templates', 'offerLetter', 'v1.js'),
    dest: (vUpper, vLower) => path.join(rootDir, 'utils', 'server', 'pdf', 'templates', 'offerLetter', `${vLower}.js`),
    transform: (code, vUpper, vLower) => {
      return code
        .replace(/generateOfferLetterV1/g, `generateOfferLetter${vUpper}`)
        .replace(/\(V1\)/g, `(${vUpper})`)
        .replace(/\|\|\s*'v1'/g, `|| '${vLower}'`);
    },
  },
  extensionLetter: {
    name: 'Extension Letter PDF Generator',
    source: path.join(rootDir, 'utils', 'server', 'pdf', 'templates', 'extensionLetter', 'v1.js'),
    dest: (vUpper, vLower) => path.join(rootDir, 'utils', 'server', 'pdf', 'templates', 'extensionLetter', `${vLower}.js`),
    transform: (code, vUpper, vLower) => {
      return code
        .replace(/generateExtensionLetterV1/g, `generateExtensionLetter${vUpper}`)
        .replace(/\(V1\)/g, `(${vUpper})`)
        .replace(/\|\|\s*'v1'/g, `|| '${vLower}'`);
    },
  },
  terminationNotice: {
    name: 'Termination Notice PDF Generator',
    source: path.join(rootDir, 'utils', 'server', 'pdf', 'templates', 'terminationNotice', 'v1.js'),
    dest: (vUpper, vLower) => path.join(rootDir, 'utils', 'server', 'pdf', 'templates', 'terminationNotice', `${vLower}.js`),
    transform: (code, vUpper, vLower) => {
      return code
        .replace(/generateTerminationNoticeV1/g, `generateTerminationNotice${vUpper}`)
        .replace(/\(V1\)/g, `(${vUpper})`)
        .replace(/\|\|\s*'v1'/g, `|| '${vLower}'`);
    },
  },
};

TARGETS.certificate = TARGETS.web;

function printUsage() {
  console.log(`
SkillBun Document Template Scaffolding Utility

Usage:
  npm run template:new -- <target> <version>

Targets:
  web | certificate   Scaffold React web certificate renderer (CertificateRenderer<V>.jsx)
  offerLetter         Scaffold 4-page Offer Letter PDF generator (<v>.js)
  extensionLetter     Scaffold 1-page Extension Letter PDF generator (<v>.js)
  terminationNotice   Scaffold 1-page Termination Notice PDF generator (<v>.js)
  all                 Scaffold all document templates for the given version

Examples:
  npm run template:new -- web v2
  npm run template:new -- offerLetter v2
  npm run template:new -- all v2
`);
}

export function scaffoldTemplate(targetKey, rawVersion) {
  if (!rawVersion) {
    throw new Error('Missing required argument <version> (e.g. "v2")');
  }

  const vLower = rawVersion.trim().toLowerCase();
  const vUpper = vLower.toUpperCase();

  if (!/^v[2-9][0-9]*$/.test(vLower)) {
    throw new Error(`Invalid version "${rawVersion}". Expected format like "v2", "v3", etc.`);
  }

  const targetsToRun = targetKey === 'all'
    ? ['web', 'offerLetter', 'extensionLetter', 'terminationNotice']
    : [targetKey];

  const results = [];

  for (const tKey of targetsToRun) {
    const target = TARGETS[tKey];
    if (!target) {
      throw new Error(`Unknown target "${tKey}". Valid targets: ${Object.keys(TARGETS).join(', ')}, all`);
    }

    if (!fs.existsSync(target.source)) {
      throw new Error(`Source template does not exist: ${target.source}`);
    }

    const destPath = target.dest(vUpper, vLower);
    if (fs.existsSync(destPath)) {
      console.warn(`⚠️  Target file already exists (skipping overwrite): ${destPath}`);
      results.push({ target: tKey, dest: destPath, created: false });
      continue;
    }

    const sourceContent = fs.readFileSync(target.source, 'utf8');
    const transformed = target.transform(sourceContent, vUpper, vLower);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, transformed, 'utf8');
    console.log(`✅ Created: ${path.relative(rootDir, destPath)}`);
    results.push({ target: tKey, dest: destPath, created: true });
  }

  return results;
}

const args = process.argv.slice(2).filter((a) => a !== '--');
if (args.length < 2) {
  printUsage();
  process.exit(1);
}

try {
  const [target, version] = args;
  const created = scaffoldTemplate(target, version);
  const vLower = version.trim().toLowerCase();

  console.log(`
🎉 Successfully scaffolded template "${vLower}"!

Next Steps:
1. Customize visual layout and styling in the newly created file(s).
2. If new images/assets are required:
   - Place them under a versioned path (e.g. /public/templates/${vLower}/...).
   - NEVER overwrite released V1 assets!
3. Register "${vLower}" in utils/common/docTemplateRegistry.js:
   - Add "${vLower}" to supportedVersions: ['v1', '${vLower}'] for target categories.
4. Register the new renderer/generator in:
   - app/certificate/[id]/templates/certificateRegistry.js (for web)
   - utils/server/pdf/documentPdfService.js (for PDF)
5. When ready to activate for new document issuance:
   - Update activeVersion: '${vLower}' in utils/common/docTemplateRegistry.js.
`);
} catch (err) {
  console.error(`\n❌ Scaffolding Error: ${err.message}\n`);
  process.exit(1);
}
