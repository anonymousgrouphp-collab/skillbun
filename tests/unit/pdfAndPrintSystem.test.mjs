import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  generateDocumentPdf,
  generateOfferLetterPdf,
  generateExtensionLetterPdf,
  SUPPORTED_DOC_TYPES,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGINS,
  CONTENT_WIDTH,
} from '../../utils/server/pdf/documentPdfService.js';
import {
  base64ToUint8Array,
  triggerDocumentPrint,
} from '../../utils/client/printAndDownload.js';

describe('SkillBun 2-Pillar PDF & Print System Test Suite', () => {

  describe('Pillar 1: Unified Server PDF Service (generateDocumentPdf)', () => {
    const mockEmployeeOffer = {
      salutation: 'Mr.',
      full_name: 'Aarav Sharma',
      parent_name: 'Rajesh Sharma',
      current_address: '123 Tech Park Road, Whitefield, Bangalore, Karnataka 560066',
      permanent_address: '123 Tech Park Road, Whitefield, Bangalore, Karnataka 560066',
      course_degree: 'B.Tech - Computer Science & Engineering',
      college_name: 'National Institute of Technology',
      department: 'Software Engineering & Cloud Architecture',
      designation: 'Full-Stack Engineering Intern',
      joining_date: '2026-09-01',
      contract_end_date: '2027-02-28',
      stipend_amount: 25000,
      stipend_currency: 'INR',
    };

    const mockEmployeeExtension = {
      salutation: 'Ms.',
      full_name: 'Priya Patel',
      parent_name: 'Vikram Patel',
      current_address: '45 Silicon Valley Boulevard, Hyderabad, Telangana 500081',
      department: 'AI & Data Engineering',
      designation: 'Machine Learning Intern',
      joining_date: '2026-03-01',
      contract_end_date: '2026-08-31',
    };

    test('exports standard A4 dimensions and layout margins', () => {
      assert.equal(PAGE_WIDTH, 595.28);
      assert.equal(PAGE_HEIGHT, 841.89);
      assert.equal(CONTENT_WIDTH, 595.28 - MARGINS.left - MARGINS.right);
      assert.equal(SUPPORTED_DOC_TYPES.OFFER_LETTER, 'OFFER_LETTER');
      assert.equal(SUPPORTED_DOC_TYPES.EXTENSION_LETTER, 'EXTENSION_LETTER');
    });

    test('generates valid 4-page Offer Letter PDF buffer via generateDocumentPdf', async () => {
      const result = await generateDocumentPdf('OFFER_LETTER', mockEmployeeOffer);
      assert.ok(result);
      assert.ok(Buffer.isBuffer(result.buffer), 'Result buffer must be a Node.js Buffer');
      assert.ok(result.buffer.length > 5000, 'PDF buffer should be substantial in size');
      assert.match(result.filename, /^SkillBun_Offer_Letter_.*\.pdf$/);
      assert.ok(result.referenceId);
      assert.match(result.referenceId, /^SKB\/2026\/HR-OFF\/[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
      assert.equal(result.metadataSnapshot.full_name, 'Aarav Sharma');
      assert.equal(result.metadataSnapshot.designation, 'Full-Stack Engineering Intern');
    });

    test('generates valid 1-page Extension Letter PDF buffer via generateDocumentPdf', async () => {
      const result = await generateDocumentPdf('EXTENSION_LETTER', mockEmployeeExtension, {
        newContractEndDate: '2026-11-30',
        originalReferenceId: 'SKB/2026/HR-OFF/8K29DF',
      });
      assert.ok(result);
      assert.ok(Buffer.isBuffer(result.buffer), 'Result buffer must be a Node.js Buffer');
      assert.ok(result.buffer.length > 3000, 'PDF buffer should be valid');
      assert.match(result.filename, /^SkillBun_Extension_Letter_.*\.pdf$/);
      assert.ok(result.referenceId);
      assert.match(result.referenceId, /^SKB\/2026\/HR-EXT\/[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
      assert.equal(result.metadataSnapshot.full_name, 'Priya Patel');
      assert.equal(result.metadataSnapshot.extended_contract_end_date, '2026-11-30');
    });

    test('throws TypeError on invalid docType or data', async () => {
      await assert.rejects(
        () => generateDocumentPdf('', mockEmployeeOffer),
        /requires a valid docType string/
      );
      await assert.rejects(
        () => generateDocumentPdf('OFFER_LETTER', null),
        /requires a valid data record object/
      );
      await assert.rejects(
        () => generateDocumentPdf('UNSUPPORTED_TYPE', mockEmployeeOffer),
        /Unsupported document type/
      );
    });
  });

  describe('Pillar 2: Unified Client Print & Download Utilities (printAndDownload)', () => {
    test('base64ToUint8Array correctly converts standard base64 to byte array', () => {
      const sampleText = 'SkillBun Unified PDF & Print Engine';
      const base64Str = Buffer.from(sampleText, 'utf-8').toString('base64');

      const bytes = base64ToUint8Array(base64Str);
      assert.ok(bytes instanceof Uint8Array);
      assert.equal(bytes.length, sampleText.length);

      const decoded = Buffer.from(bytes).toString('utf-8');
      assert.equal(decoded, sampleText);
    });

    test('base64ToUint8Array handles data URI prefix gracefully', () => {
      const sampleText = 'Data URI Prefix Test';
      const rawBase64 = Buffer.from(sampleText, 'utf-8').toString('base64');
      const dataUri = `data:application/pdf;base64,${rawBase64}`;

      const bytes = base64ToUint8Array(dataUri);
      const decoded = Buffer.from(bytes).toString('utf-8');
      assert.equal(decoded, sampleText);
    });

    test('base64ToUint8Array throws on empty or invalid input', () => {
      assert.throws(() => base64ToUint8Array(''), /requires a non-empty string/);
      assert.throws(() => base64ToUint8Array(null), /requires a non-empty string/);
      assert.throws(() => base64ToUint8Array(123), /requires a non-empty string/);
    });

    test('triggerDocumentPrint is safe in SSR / non-browser environments', () => {
      assert.doesNotThrow(() => {
        triggerDocumentPrint({ title: 'Test Certificate Title' });
      });
      assert.doesNotThrow(() => {
        triggerDocumentPrint({
          title: 'Test LOR Title',
          orientation: 'portrait',
        });
      });
      assert.doesNotThrow(() => {
        triggerDocumentPrint({
          title: 'Test Landscape Cert Title',
          orientation: 'landscape',
        });
      });
    });
  });
});
