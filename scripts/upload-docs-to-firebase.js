/**
 * Upload all study guide .md files from public/data/docs/ to Firebase Storage.
 *
 * Usage:
 *   node scripts/upload-docs-to-firebase.js path/to/serviceAccount.json
 *
 * This script:
 * 1. Reads the Firebase service account JSON
 * 2. Initializes Firebase Admin SDK
 * 3. Uploads all .md files from public/data/docs/{slug}/{topicId}.md
 *    to Firebase Storage at docs/{slug}/{topicId}.md
 * 4. Reports progress and any errors
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = process.argv[2];
if (!SERVICE_ACCOUNT_PATH) {
  console.error('Usage: node scripts/upload-docs-to-firebase.js <path-to-serviceAccount.json>');
  process.exit(1);
}

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('Service account file not found:', SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.firebasestorage.app`,
});

const bucket = admin.storage().bucket();
const DOCS_DIR = path.join(__dirname, '..', 'public', 'data', 'docs');

async function uploadFile(localPath, storagePath) {
  try {
    await bucket.upload(localPath, {
      destination: storagePath,
      metadata: {
        contentType: 'text/markdown; charset=utf-8',
        cacheControl: 'public, max-age=3600',
      },
    });
    return true;
  } catch (err) {
    console.error(`  FAIL: ${storagePath} — ${err.message}`);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('Docs directory not found:', DOCS_DIR);
    process.exit(1);
  }

  const slugDirs = fs.readdirSync(DOCS_DIR).filter(d =>
    fs.statSync(path.join(DOCS_DIR, d)).isDirectory()
  );

  console.log(`Found ${slugDirs.length} roadmap doc folders\n`);

  let total = 0;
  let success = 0;
  let failed = 0;

  for (const slug of slugDirs) {
    const slugDir = path.join(DOCS_DIR, slug);
    const files = fs.readdirSync(slugDir).filter(f => f.endsWith('.md'));

    if (files.length === 0) continue;

    console.log(`Uploading: ${slug} (${files.length} files)`);

    for (const file of files) {
      const localPath = path.join(slugDir, file);
      const storagePath = `docs/${slug}/${file}`;
      total++;

      const ok = await uploadFile(localPath, storagePath);
      if (ok) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`  ✓ ${slug} done`);
  }

  console.log(`\n=== Upload Complete ===`);
  console.log(`Total files: ${total}`);
  console.log(`Successful: ${success}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n⚠️  Some files failed. Re-run the script to retry.');
    process.exit(1);
  } else {
    console.log('\n✅ All files uploaded successfully!');
    console.log('You can now safely remove public/data/docs/ from git.');
  }

  process.exit(0);
}

main();
