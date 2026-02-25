import { isValidCertHash } from '../../src/lib/validators/certificate_hash_validator';
describe('Certificate Hash Verification', () => {
    it('validates 64-character hex strings', () => {
        expect(isValidCertHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).toBe(true);
        expect(isValidCertHash('short-invalid')).toBe(false);
    });
});
