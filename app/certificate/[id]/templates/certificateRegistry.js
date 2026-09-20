import CertificateRendererV1 from './CertificateRendererV1';

/**
 * Explicit registry for certificate web renderers.
 * When new design versions (e.g. 'v2') are introduced, they are registered here.
 * Never fall back implicitly if a version key is missing.
 */
const CERTIFICATE_RENDERERS = Object.freeze({
  v1: CertificateRendererV1,
});

/**
 * Resolves a React renderer component for the given template version.
 *
 * @param {string} version - The resolved template version (e.g. 'v1')
 * @returns {React.ComponentType | null} The renderer component or null if not registered
 */
export function getCertificateRenderer(version) {
  if (!version || typeof version !== 'string') return null;
  return CERTIFICATE_RENDERERS[version.trim().toLowerCase()] || null;
}

export { CERTIFICATE_RENDERERS };
