import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  WORKFORCE_PREFIXES,
  getRandomAlphanumeric,
  generateCertificateId,
  generateWorkforceId,
  formatWorkforceDisplayId,
  normalizeWorkforceDbId,
  isValidCertificateId,
  isValidWorkforceId,
  parseWorkforceId,
} from '../../utils/server/workforceId.js';

describe('SkillBun ID Generation & Verification Suite', () => {
  describe('Cryptographic Certificate Fingerprint (generateCertificateId)', () => {
    test('generates valid 12-character token formatted as SKBXXXX-XX-XX-XXXX', () => {
      const id = generateCertificateId();
      assert.match(id, /^SKB[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{2}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
    });

    test('never generates ambiguous characters (0, O, 1, I, L)', () => {
      for (let i = 0; i < 200; i++) {
        const id = generateCertificateId();
        assert.doesNotMatch(id, /[0O1IL]/);
      }
    });

    test('generates collision-free IDs across 1,000 samples', () => {
      const set = new Set();
      const count = 1000;
      for (let i = 0; i < count; i++) {
        const id = generateCertificateId();
        assert.equal(set.has(id), false, `Collision detected on ${id}`);
        set.add(id);
      }
      assert.equal(set.size, count);
    });

    test('isValidCertificateId validates crypto tokens and legacy IDs', () => {
      const validCrypto = generateCertificateId();
      assert.equal(isValidCertificateId(validCrypto), true);
      assert.equal(isValidCertificateId('SKB8F92-4C-10-9A7E'), true);
      assert.equal(isValidCertificateId('SKB-8F92-4C10-9A7E'), true);
      // Legacy Firestore 20-char UID
      assert.equal(isValidCertificateId('abc123XYZ456def78901'), true);
      // Invalid tokens
      assert.equal(isValidCertificateId('INVALID-TOKEN'), false);
      assert.equal(isValidCertificateId('SKB-123-456'), false);
      assert.equal(isValidCertificateId(null), false);
    });
  });

  describe('Workforce Corporate IDs (generateWorkforceId & formatters)', () => {
    test('generates expected format for all valid workforce prefixes', () => {
      const prefixes = Object.values(WORKFORCE_PREFIXES);
      for (const prefix of prefixes) {
        const id = generateWorkforceId(prefix, 2026);
        assert.match(id, new RegExp(`^SKB-2026-${prefix}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$`));
        assert.equal(isValidWorkforceId(id), true);
      }
    });

    test('supports legacy prefix aliases smoothly', () => {
      const offerId = generateWorkforceId('SB-OFF', 2026);
      assert.match(offerId, /^SKB-2026-HR-OFF-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);

      const intId = generateWorkforceId('SB-INT', 2026);
      assert.match(intId, /^SKB-2026-INT-REC-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    });

    test('throws error on invalid prefix', () => {
      assert.throws(() => generateWorkforceId('UNKNOWN-PREFIX'), /Invalid workforce ID prefix/);
    });

    test('formatWorkforceDisplayId converts hyphen format to corporate slash format', () => {
      const dbId = 'SKB-2026-HR-OFF-8K29DF';
      const displayId = formatWorkforceDisplayId(dbId);
      assert.equal(displayId, 'SKB/2026/HR-OFF/8K29DF');

      // Idempotency
      assert.equal(formatWorkforceDisplayId('SKB/2026/HR-OFF/8K29DF'), 'SKB/2026/HR-OFF/8K29DF');

      // Legacy format migration
      assert.equal(formatWorkforceDisplayId('SB-OFF-2026-8K29DF'), 'SKB/2026/HR-OFF/8K29DF');
      assert.equal(formatWorkforceDisplayId('SB-INT-2026-7R35TK'), 'SKB/2026/INT-REC/7R35TK');
    });

    test('normalizeWorkforceDbId converts corporate slash format to DB hyphen format', () => {
      const displayId = 'SKB/2026/HR-OFF/8K29DF';
      const dbId = normalizeWorkforceDbId(displayId);
      assert.equal(dbId, 'SKB-2026-HR-OFF-8K29DF');
    });

    test('isValidWorkforceId handles both new slashed/hyphenated and legacy IDs', () => {
      assert.equal(isValidWorkforceId('SKB-2026-HR-OFF-8K29DF'), true);
      assert.equal(isValidWorkforceId('SKB/2026/HR-OFF/8K29DF'), true);
      assert.equal(isValidWorkforceId('SKB/2026/INT-REC/7R35TK'), true);
      assert.equal(isValidWorkforceId('SB-OFF-2026-8K29DF'), true);
      assert.equal(isValidWorkforceId('SB-INT-2026-7R35TK'), true);

      // Rejections
      assert.equal(isValidWorkforceId('SKB/2026/UNKNOWN/123456'), false);
      assert.equal(isValidWorkforceId('SKB-2026-HR-OFF-1'), false);
      assert.equal(isValidWorkforceId(''), false);
      assert.equal(isValidWorkforceId(undefined), false);
    });

    test('parseWorkforceId decomposes ID components correctly', () => {
      const parsedNew = parseWorkforceId('SKB/2026/HR-OFF/8K29DF');
      assert.deepEqual(parsedNew, {
        prefix: 'HR-OFF',
        type: 'HR-OFF',
        year: 2026,
        code: '8K29DF',
        displayId: 'SKB/2026/HR-OFF/8K29DF',
        dbId: 'SKB-2026-HR-OFF-8K29DF',
      });

      const parsedLegacy = parseWorkforceId('SB-OFF-2026-8K29DF');
      assert.deepEqual(parsedLegacy, {
        prefix: 'HR-OFF',
        type: 'HR-OFF',
        year: 2026,
        code: '8K29DF',
        displayId: 'SKB/2026/HR-OFF/8K29DF',
        dbId: 'SB-OFF-2026-8K29DF',
      });
    });
  });
});
