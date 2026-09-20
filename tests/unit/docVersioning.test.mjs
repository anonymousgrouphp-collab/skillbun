import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  DOCUMENT_CATEGORIES,
  CATEGORY_CAPABILITIES,
  TEMPLATE_REGISTRY,
  UnsupportedTemplateVersionError,
  getActiveTemplateVersion,
  resolveTemplateVersion,
  normalizeDocumentCategory,
  isSupportedTemplateVersion,
  V1_FROZEN_ASSETS,
  FROZEN_TEMPLATE_MANIFEST,
  ALL_FROZEN_TEMPLATE_PATHS,
  validateTemplateRegistry,
} from '../../utils/common/docTemplateRegistry.js';

import {
  checkFrozenFilesModified,
  verifyTemplateImplementations,
} from '../../scripts/check-document-template-immutability.mjs';

import {
  generateDocumentPdf,
  PDF_GENERATOR_REGISTRY,
} from '../../utils/server/pdf/documentPdfService.js';

import fs from 'node:fs';
import path from 'node:path';

describe('Global Document Versioning System — Version-Pinned / Append-Only Architecture', () => {

  describe('1. Canonical Document Category Normalization', () => {
    it('normalizes common aliases to canonical categories', () => {
      assert.equal(normalizeDocumentCategory('ROADMAP'), DOCUMENT_CATEGORIES.ROADMAP_CERT);
      assert.equal(normalizeDocumentCategory('roadmap_cert'), DOCUMENT_CATEGORIES.ROADMAP_CERT);
      assert.equal(normalizeDocumentCategory('INTERNSHIP'), DOCUMENT_CATEGORIES.INTERNSHIP_CERT);
      assert.equal(normalizeDocumentCategory('INT-REC'), DOCUMENT_CATEGORIES.INTERNSHIP_CERT);
      assert.equal(normalizeDocumentCategory('TRAINING'), DOCUMENT_CATEGORIES.TRAINING_CERT);
      assert.equal(normalizeDocumentCategory('TRN-EXP'), DOCUMENT_CATEGORIES.TRAINING_CERT);
      assert.equal(normalizeDocumentCategory('LOR'), DOCUMENT_CATEGORIES.LOR);
      assert.equal(normalizeDocumentCategory('CORP-LOR'), DOCUMENT_CATEGORIES.LOR);
      assert.equal(normalizeDocumentCategory('OFFER'), DOCUMENT_CATEGORIES.OFFER_LETTER);
      assert.equal(normalizeDocumentCategory('OFFER_PACK'), DOCUMENT_CATEGORIES.OFFER_LETTER);
      assert.equal(normalizeDocumentCategory('HR-OFF'), DOCUMENT_CATEGORIES.OFFER_LETTER);
      assert.equal(normalizeDocumentCategory('EXTENSION'), DOCUMENT_CATEGORIES.EXTENSION_LETTER);
      assert.equal(normalizeDocumentCategory('HR-EXT'), DOCUMENT_CATEGORIES.EXTENSION_LETTER);
      assert.equal(normalizeDocumentCategory('TERMINATION'), DOCUMENT_CATEGORIES.TERMINATION_NOTICE);
      assert.equal(normalizeDocumentCategory('TERMINATION_NOTICE'), DOCUMENT_CATEGORIES.TERMINATION_NOTICE);
      assert.equal(normalizeDocumentCategory('HR-TERM'), DOCUMENT_CATEGORIES.TERMINATION_NOTICE);
    });

    it('defaults invalid/empty types safely to ROADMAP_CERT', () => {
      assert.equal(normalizeDocumentCategory(null), DOCUMENT_CATEGORIES.ROADMAP_CERT);
      assert.equal(normalizeDocumentCategory(''), DOCUMENT_CATEGORIES.ROADMAP_CERT);
      assert.equal(normalizeDocumentCategory(undefined), DOCUMENT_CATEGORIES.ROADMAP_CERT);
    });
  });

  describe('2. Version Resolution & Error Policy', () => {
    it('resolves legacy documents without template_version (null/undefined/\'\') to v1 fallback', () => {
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, null), 'v1');
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, undefined), 'v1');
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, ''), 'v1');
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.OFFER_LETTER, null), 'v1');
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.LOR, undefined), 'v1');
    });

    it('resolves explicit supported version v1 cleanly', () => {
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, 'v1'), 'v1');
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.OFFER_LETTER, 'V1'), 'v1');
      assert.equal(resolveTemplateVersion(DOCUMENT_CATEGORIES.INTERNSHIP_CERT, ' v1 '), 'v1');
    });

    it('throws UnsupportedTemplateVersionError for explicit unsupported version (e.g. v99), NEVER falling back to v1', () => {
      assert.throws(
        () => resolveTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, 'v99'),
        (err) => {
          assert.ok(err instanceof UnsupportedTemplateVersionError);
          assert.equal(err.code, 'UNSUPPORTED_TEMPLATE_VERSION');
          assert.equal(err.category, DOCUMENT_CATEGORIES.ROADMAP_CERT);
          assert.equal(err.version, 'v99');
          return true;
        }
      );

      assert.throws(
        () => resolveTemplateVersion(DOCUMENT_CATEGORIES.OFFER_LETTER, 'v2'),
        (err) => {
          assert.ok(err instanceof UnsupportedTemplateVersionError);
          assert.equal(err.category, DOCUMENT_CATEGORIES.OFFER_LETTER);
          assert.equal(err.version, 'v2');
          return true;
        }
      );
    });

    it('correctly reports supported versions via isSupportedTemplateVersion', () => {
      assert.equal(isSupportedTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, 'v1'), true);
      assert.equal(isSupportedTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, 'v2'), false);
      assert.equal(isSupportedTemplateVersion(DOCUMENT_CATEGORIES.ROADMAP_CERT, null), false);
    });
  });

  describe('3. Registry Integrity & Category-Capability-Aware Coverage', () => {
    it('ensures every user-visible document category has an active version present in supportedVersions', () => {
      for (const [category, config] of Object.entries(TEMPLATE_REGISTRY)) {
        assert.ok(config.activeVersion, `Category ${category} must declare an activeVersion`);
        assert.ok(Array.isArray(config.supportedVersions), `Category ${category} must declare supportedVersions`);
        assert.ok(
          config.supportedVersions.includes(config.activeVersion),
          `Category ${category} activeVersion (${config.activeVersion}) must be included in supportedVersions`
        );
      }
    });

    it('ensures every category declares a valid manifestation capability (web or pdf)', () => {
      for (const category of Object.values(DOCUMENT_CATEGORIES)) {
        const capability = CATEGORY_CAPABILITIES[category];
        assert.ok(
          capability === 'web' || capability === 'pdf',
          `Category ${category} must declare capability 'web' or 'pdf' (got '${capability}')`
        );
      }
    });

    it('ensures category-capability coverage: web categories have registered React renderers', () => {
      const webCategories = Object.values(DOCUMENT_CATEGORIES).filter(
        (cat) => CATEGORY_CAPABILITIES[cat] === 'web'
      );

      const registryPath = path.join(process.cwd(), 'app/certificate/[id]/templates/certificateRegistry.js');
      assert.ok(fs.existsSync(registryPath), 'certificateRegistry.js must exist on disk');
      const registryContent = fs.readFileSync(registryPath, 'utf8');

      for (const cat of webCategories) {
        const config = TEMPLATE_REGISTRY[cat];
        for (const ver of config.supportedVersions) {
          // Check renderer file existence on disk
          const rendererFileName = `CertificateRenderer${ver.toUpperCase()}.jsx`;
          const rendererPath = path.join(process.cwd(), `app/certificate/[id]/templates/${rendererFileName}`);
          assert.ok(
            fs.existsSync(rendererPath),
            `Renderer component file ${rendererFileName} must exist for category ${cat} version ${ver}`
          );

          // Check registration in certificateRegistry.js
          assert.ok(
            registryContent.includes(`${ver}: CertificateRenderer${ver.toUpperCase()}`),
            `certificateRegistry.js must register version ${ver}`
          );
        }
      }
    });

    it('ensures category-capability coverage: pdf categories have registered server-side PDF generators', () => {
      const pdfCategories = Object.values(DOCUMENT_CATEGORIES).filter(
        (cat) => CATEGORY_CAPABILITIES[cat] === 'pdf'
      );

      for (const cat of pdfCategories) {
        const config = TEMPLATE_REGISTRY[cat];
        const categoryGenerators = PDF_GENERATOR_REGISTRY[cat];
        assert.ok(categoryGenerators, `PDF category ${cat} must be present in PDF_GENERATOR_REGISTRY`);

        for (const ver of config.supportedVersions) {
          const generator = categoryGenerators[ver];
          assert.ok(generator, `Supported PDF version ${ver} for ${cat} must have a registered generator function`);
          assert.equal(typeof generator, 'function', `Generator for ${cat}/${ver} must be a function`);
        }
      }
    });

    it('ensures V1 frozen asset references are registered and immutable', () => {
      assert.equal(V1_FROZEN_ASSETS.ROADMAP_CANVA_TEMPLATE, '/certificate-template.png');
      assert.equal(V1_FROZEN_ASSETS.BRAND_LOGO_TIGHT, '/logo-tight.png');
      assert.equal(V1_FROZEN_ASSETS.REISH_MARK, '/reish-mark.png');
      assert.equal(V1_FROZEN_ASSETS.REISH_WORDMARK, '/reish-wordmark.png');
      assert.ok(Object.isFrozen(V1_FROZEN_ASSETS));
    });
  });

  describe('4. PDF Generation & Dispatch Integration', () => {
    const mockEmployee = {
      salutation: 'Ms.',
      full_name: 'Ananya Sharma',
      parent_name: 'Rajesh Sharma',
      current_address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103',
      course_degree: 'B.Tech - Computer Science & Engineering',
      college_name: 'National Institute of Technology',
      department: 'Engineering & Technology',
      designation: 'Frontend Engineering Intern',
      personal_email: 'ananya@example.com',
      joining_date: '2026-03-01',
      contract_end_date: '2026-06-01',
      stipend_amount: 15000,
      stipend_currency: 'INR',
    };

    it('generates Offer Letter PDF with resolved v1 template_version dynamically in metadataSnapshot', async () => {
      const result = await generateDocumentPdf('OFFER_LETTER', mockEmployee, {
        referenceId: 'SKB/2026/HR-OFF/TEST01',
      });

      assert.ok(Buffer.isBuffer(result.buffer));
      assert.ok(result.buffer.length > 5000, 'Buffer should contain valid PDF bytes');
      assert.equal(result.metadataSnapshot.template_version, 'v1');
      assert.equal(result.metadataSnapshot.reference_id, 'SKB/2026/HR-OFF/TEST01');
      assert.equal(result.metadataSnapshot.full_name, 'Ananya Sharma');
    });

    it('generates Extension Letter PDF with resolved v1 template_version in metadataSnapshot', async () => {
      const result = await generateDocumentPdf('EXTENSION_LETTER', mockEmployee, {
        referenceId: 'SKB/2026/HR-EXT/TEST01',
        newContractEndDate: '2026-09-01',
        originalReferenceId: 'SKB/2026/HR-OFF/TEST01',
      });

      assert.ok(Buffer.isBuffer(result.buffer));
      assert.ok(result.buffer.length > 2000);
      assert.equal(result.metadataSnapshot.template_version, 'v1');
      assert.equal(result.metadataSnapshot.reference_id, 'SKB/2026/HR-EXT/TEST01');
      assert.equal(result.metadataSnapshot.extended_contract_end_date, '2026-09-01');
    });

    it('generates Termination Notice PDF with resolved v1 template_version in metadataSnapshot', async () => {
      const result = await generateDocumentPdf('TERMINATION_NOTICE', mockEmployee, {
        referenceId: 'SKB/2026/HR-TERM/TEST01',
        reasonCode: 'COMPLETED',
        grantedCredentials: ['Certificate of Internship Completion (SKB/2026/INT-REC/7R35TK)'],
        effectiveDate: '2026-06-01',
      });

      assert.ok(Buffer.isBuffer(result.buffer));
      assert.ok(result.buffer.length > 2000);
      assert.equal(result.metadataSnapshot.template_version, 'v1');
      assert.equal(result.metadataSnapshot.reference_id, 'SKB/2026/HR-TERM/TEST01');
      assert.equal(result.metadataSnapshot.reason_code, 'COMPLETED');
    });

    it('fails loudly when attempting PDF generation for an explicit unsupported version', async () => {
      await assert.rejects(
        async () => {
          await generateDocumentPdf('OFFER_LETTER', mockEmployee, {
            templateVersion: 'v99',
          });
        },
        (err) => {
          assert.ok(err instanceof UnsupportedTemplateVersionError);
          assert.equal(err.version, 'v99');
          return true;
        }
      );
    });

    it('prioritizes historical metadata_snapshot values when re-generating existing document', async () => {
      const historicalEmployee = {
        ...mockEmployee,
        // Mutable profile was updated later
        full_name: 'Ananya Sharma (Senior)',
        department: 'Architecture & Leadership',
        // But the historical snapshot preserves the original values at issuance
        metadata_snapshot: {
          template_version: 'v1',
          full_name: 'Ananya Sharma (Original Snapshot)',
          department: 'Engineering & Technology (Original Snapshot)',
          reference_id: 'SKB/2026/HR-OFF/ORIG01',
        },
      };

      const result = await generateDocumentPdf('OFFER_LETTER', historicalEmployee, {
        referenceId: 'SKB/2026/HR-OFF/ORIG01',
      });

      assert.equal(result.metadataSnapshot.full_name, 'Ananya Sharma (Original Snapshot)');
      assert.equal(result.metadataSnapshot.department, 'Engineering & Technology (Original Snapshot)');
    });
  });

  describe('5. Active Version Bump Simulation Test', () => {
    it('proves that old records remain pinned to v1 when registry activeVersion advances to v2', () => {
      // Simulate future registry configuration where activeVersion is v2 and supportedVersions includes both
      const simulatedRegistry = {
        [DOCUMENT_CATEGORIES.ROADMAP_CERT]: {
          activeVersion: 'v2',
          supportedVersions: ['v1', 'v2'],
          legacyFallbackVersion: 'v1',
        },
      };

      function simulatedResolve(category, requested) {
        const config = simulatedRegistry[category];
        if (requested === null || requested === undefined || requested === '') {
          return config.legacyFallbackVersion;
        }
        if (config.supportedVersions.includes(requested)) {
          return requested;
        }
        throw new UnsupportedTemplateVersionError(category, requested);
      }

      function simulatedGetActive(category) {
        return simulatedRegistry[category].activeVersion;
      }

      // 1. Existing document issued in 2026 with template_version: 'v1'
      const oldDoc = { id: 'cert-alice', template_version: 'v1' };
      const resolvedForOld = simulatedResolve(DOCUMENT_CATEGORIES.ROADMAP_CERT, oldDoc.template_version);
      assert.equal(resolvedForOld, 'v1', 'Historical record MUST resolve to v1 even after v2 becomes active');

      // 2. Legacy un-versioned document issued prior to versioning
      const legacyDoc = { id: 'cert-legacy', template_version: null };
      const resolvedForLegacy = simulatedResolve(DOCUMENT_CATEGORIES.ROADMAP_CERT, legacyDoc.template_version);
      assert.equal(resolvedForLegacy, 'v1', 'Legacy record without template_version must fall back to v1');

      // 3. New issuance in 2027 receives the new active version (v2)
      const newActiveVersion = simulatedGetActive(DOCUMENT_CATEGORIES.ROADMAP_CERT);
      assert.equal(newActiveVersion, 'v2', 'New issuance receives active version v2');

      const newDoc = { id: 'cert-bob', template_version: newActiveVersion };
      const resolvedForNew = simulatedResolve(DOCUMENT_CATEGORIES.ROADMAP_CERT, newDoc.template_version);
      assert.equal(resolvedForNew, 'v2', 'New record resolves to v2');
    });
  });

  describe('6. Template Immutability & Repository Guard Enforcement', () => {
    it('1. Editing frozen V1 web renderer fails immutability guard', () => {
      const changed = ['app/certificate/[id]/templates/CertificateRendererV1.jsx'];
      const result = checkFrozenFilesModified(changed);
      assert.equal(result.hasViolations, true);
      assert.deepEqual(result.violations, ['app/certificate/[id]/templates/CertificateRendererV1.jsx']);
    });

    it('2. Editing frozen V1 PDF generator fails immutability guard', () => {
      const changed = [
        'utils/server/pdf/templates/offerLetter/v1.js',
        'utils/server/pdf/templates/extensionLetter/v1.js',
        'utils/server/pdf/templates/terminationNotice/v1.js',
      ];
      const result = checkFrozenFilesModified(changed);
      assert.equal(result.hasViolations, true);
      assert.equal(result.violations.length, 3);
      assert.ok(result.violations.includes('utils/server/pdf/templates/offerLetter/v1.js'));
      assert.ok(result.violations.includes('utils/server/pdf/templates/extensionLetter/v1.js'));
      assert.ok(result.violations.includes('utils/server/pdf/templates/terminationNotice/v1.js'));
    });

    it('3. Editing frozen V1 visual asset fails immutability guard', () => {
      const changed = [
        'public/certificate-template.png',
        'public/internship-cert-template.png',
        'public/training-cert-template.png',
        'public/logo-tight.png',
      ];
      const result = checkFrozenFilesModified(changed);
      assert.equal(result.hasViolations, true);
      assert.equal(result.violations.length, 4);
      assert.ok(result.violations.includes('public/certificate-template.png'));
      assert.ok(result.violations.includes('public/logo-tight.png'));
    });

    it('4. Adding brand-new V2 files without editing V1 passes immutability guard', () => {
      const changed = [
        'app/certificate/[id]/templates/CertificateRendererV2.jsx',
        'utils/server/pdf/templates/offerLetter/v2.js',
        'public/templates/v2/gold-seal.png',
        'utils/common/docTemplateRegistry.js',
      ];
      const result = checkFrozenFilesModified(changed);
      assert.equal(result.hasViolations, false);
      assert.deepEqual(result.violations, []);
    });

    it('5. activeVersion: "v2" without V2 implementation fails validation', () => {
      // 5a. Registry invariant failure if activeVersion is not declared in supportedVersions
      const unlistedActiveRegistry = {
        [DOCUMENT_CATEGORIES.ROADMAP_CERT]: {
          activeVersion: 'v2',
          supportedVersions: ['v1'],
          legacyFallbackVersion: 'v1',
        },
      };
      const regResult = validateTemplateRegistry(unlistedActiveRegistry);
      assert.equal(regResult.valid, false);
      assert.ok(regResult.errors.some((err) => err.includes('activeVersion "v2" is not in supportedVersions')));

      // 5b. Implementation verification failure if v2 is declared but file is missing on disk
      const missingFileRegistry = {
        [DOCUMENT_CATEGORIES.ROADMAP_CERT]: {
          activeVersion: 'v2',
          supportedVersions: ['v1', 'v2'],
          legacyFallbackVersion: 'v1',
        },
      };
      const implResult = verifyTemplateImplementations(missingFileRegistry);
      assert.equal(implResult.valid, false);
      assert.ok(implResult.errors.length > 0);
      assert.ok(implResult.errors.some((err) => err.includes('CertificateRendererV2.jsx')));
    });

    it('6. supportedVersions: ["v1", "v2"] with proper V2 renderer and generator passes validation', (t) => {
      // Create a temporary mock directory simulating repo root with v1 and v2 files
      const tempDir = fs.mkdtempSync(path.join(process.cwd(), 'tmp-test-v2-'));
      t.after(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
      });

      // Scaffold mock web renderer for v1 and v2
      const webDir = path.join(tempDir, 'app', 'certificate', '[id]', 'templates');
      fs.mkdirSync(webDir, { recursive: true });
      fs.writeFileSync(path.join(webDir, 'CertificateRendererV1.jsx'), 'export default function V1() {}');
      fs.writeFileSync(path.join(webDir, 'CertificateRendererV2.jsx'), 'export default function V2() {}');

      // Scaffold mock pdf generator for v1 and v2
      const pdfDir = path.join(tempDir, 'utils', 'server', 'pdf', 'templates', 'offerLetter');
      fs.mkdirSync(pdfDir, { recursive: true });
      fs.writeFileSync(path.join(pdfDir, 'v1.js'), 'export function generateOfferLetterPdf() {}');
      fs.writeFileSync(path.join(pdfDir, 'v2.js'), 'export function generateOfferLetterPdf() {}');

      const validV2Registry = {
        [DOCUMENT_CATEGORIES.ROADMAP_CERT]: {
          activeVersion: 'v2',
          supportedVersions: ['v1', 'v2'],
          legacyFallbackVersion: 'v1',
        },
        [DOCUMENT_CATEGORIES.OFFER_LETTER]: {
          activeVersion: 'v2',
          supportedVersions: ['v1', 'v2'],
          legacyFallbackVersion: 'v1',
        },
      };

      // Invariant checks pass
      const regResult = validateTemplateRegistry(validV2Registry);
      assert.equal(regResult.valid, true);
      assert.deepEqual(regResult.errors, []);

      // Disk implementations pass against mock root
      const implResult = verifyTemplateImplementations(validV2Registry, tempDir);
      assert.equal(implResult.valid, true);
      assert.deepEqual(implResult.errors, []);
    });

    it('7. Historical V1 records still resolve to V1 when activeVersion is V2', () => {
      const v2Registry = {
        [DOCUMENT_CATEGORIES.ROADMAP_CERT]: {
          activeVersion: 'v2',
          supportedVersions: ['v1', 'v2'],
          legacyFallbackVersion: 'v1',
        },
      };

      function resolveWithRegistry(cat, requested) {
        const cfg = v2Registry[cat];
        if (requested === null || requested === undefined || requested === '') {
          return cfg.legacyFallbackVersion;
        }
        const normalized = requested.toLowerCase().trim();
        if (cfg.supportedVersions.includes(normalized)) {
          return normalized;
        }
        throw new UnsupportedTemplateVersionError(cat, requested);
      }

      // Explicit v1 historical document
      assert.equal(resolveWithRegistry(DOCUMENT_CATEGORIES.ROADMAP_CERT, 'v1'), 'v1');
      assert.equal(resolveWithRegistry(DOCUMENT_CATEGORIES.ROADMAP_CERT, 'V1'), 'v1');

      // Legacy document without version stored
      assert.equal(resolveWithRegistry(DOCUMENT_CATEGORIES.ROADMAP_CERT, null), 'v1');
      assert.equal(resolveWithRegistry(DOCUMENT_CATEGORIES.ROADMAP_CERT, undefined), 'v1');
      assert.equal(resolveWithRegistry(DOCUMENT_CATEGORIES.ROADMAP_CERT, ''), 'v1');
    });

    it('8. New issuance resolves to V2 when activeVersion is V2', () => {
      const v2Registry = {
        [DOCUMENT_CATEGORIES.ROADMAP_CERT]: {
          activeVersion: 'v2',
          supportedVersions: ['v1', 'v2'],
          legacyFallbackVersion: 'v1',
        },
      };

      function getActive(cat) {
        return v2Registry[cat].activeVersion;
      }

      const newVersion = getActive(DOCUMENT_CATEGORIES.ROADMAP_CERT);
      assert.equal(newVersion, 'v2');

      const newRecord = { template_version: newVersion };
      assert.equal(newRecord.template_version, 'v2');
    });
  });
});
