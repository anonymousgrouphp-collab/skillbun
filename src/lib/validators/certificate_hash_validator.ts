export function isValidCertHash(hash: string): boolean {
    return /^[a-f0-9]{64}$/i.test(hash);
}
