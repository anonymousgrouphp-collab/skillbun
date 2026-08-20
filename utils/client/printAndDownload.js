'use client';

/**
 * Unified Client Print & Download Utilities (Pillar 2)
 *
 * Provides device-independent, deterministic utilities for:
 * 1. Triggering browser print with custom document title restoration.
 * 2. Downloading base64 PDF and binary documents safely cross-browser (Chrome, Safari, Firefox, Edge, iOS, Android).
 * 3. Downloading standard Blobs.
 */

/**
 * Dispatches a standardized window.print() execution while ensuring:
 * - Dynamic document title is set before printing (so the default PDF save filename is pristine).
 * - Original document title is reliably restored afterwards.
 * - Device and screen independence is guaranteed through CSS @media print specifications.
 *
 * @param {Object} options
 * @param {string} options.title - The desired filename / document title during print (e.g. "Candidate Name - Certificate - SkillBun")
 * @param {Function} [options.onBeforePrint] - Optional callback before print trigger
 * @param {Function} [options.onAfterPrint] - Optional callback after print dialog closes
 */
export function triggerDocumentPrint({ title, onBeforePrint, onAfterPrint } = {}) {
  if (typeof window === 'undefined') return;

  const originalTitle = document.title;

  try {
    if (title && typeof title === 'string') {
      document.title = title.trim();
    }

    if (typeof onBeforePrint === 'function') {
      try {
        onBeforePrint();
      } catch (err) {
        console.warn('[triggerDocumentPrint:onBeforePrint error]', err);
      }
    }

    window.print();
  } finally {
    // Restore title after standard print dialog interaction delay
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.title = originalTitle;
      }
      if (typeof onAfterPrint === 'function') {
        try {
          onAfterPrint();
        } catch (err) {
          console.warn('[triggerDocumentPrint:onAfterPrint error]', err);
        }
      }
    }, 2000);
  }
}

/**
 * Converts a base64 string to a Uint8Array byte array safely.
 * @param {string} base64String
 * @returns {Uint8Array}
 */
export function base64ToUint8Array(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    throw new TypeError('base64ToUint8Array requires a non-empty string.');
  }

  // Strip possible data URI prefix if present
  const cleanBase64 = base64String.replace(/^data:[^;]+;base64,/, '').trim();
  const binaryString = typeof atob === 'function' ? atob(cleanBase64) : Buffer.from(cleanBase64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Downloads a base64 encoded PDF or file directly to the user's device.
 * Converts to a Blob with ObjectURL for optimal memory and native mobile/desktop browser support.
 *
 * @param {string} base64Content - Base64 encoded payload
 * @param {string} [filename='document.pdf'] - Download filename
 * @param {string} [mimeType='application/pdf'] - MIME type
 * @returns {boolean} True if download was initiated successfully
 */
export function downloadBase64Pdf(base64Content, filename = 'document.pdf', mimeType = 'application/pdf') {
  if (typeof window === 'undefined') return false;
  if (!base64Content) {
    throw new Error('downloadBase64Pdf: base64Content is missing or empty.');
  }

  try {
    const bytes = base64ToUint8Array(base64Content);
    const blob = new Blob([bytes], { type: mimeType });
    return downloadBlob(blob, filename);
  } catch (blobErr) {
    console.warn('[downloadBase64Pdf] Blob creation failed, falling back to data URI:', blobErr);
    // Fallback for older browsers
    const cleanBase64 = base64Content.replace(/^data:[^;]+;base64,/, '').trim();
    const linkSource = `data:${mimeType};base64,${cleanBase64}`;
    const downloadLink = document.createElement('a');
    downloadLink.href = linkSource;
    downloadLink.download = filename || 'document.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      downloadLink.remove();
    }, 150);
    return true;
  }
}

/**
 * Downloads a Blob directly by creating a temporary object URL.
 *
 * @param {Blob} blob - The file Blob
 * @param {string} filename - Filename with extension
 * @returns {boolean}
 */
export function downloadBlob(blob, filename = 'download.pdf') {
  if (typeof window === 'undefined' || !blob) return false;

  const url = window.URL ? window.URL.createObjectURL(blob) : null;
  if (!url) return false;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    try {
      a.remove();
      if (window.URL && typeof window.URL.revokeObjectURL === 'function') {
        window.URL.revokeObjectURL(url);
      }
    } catch {
      // Cleanup safety
    }
  }, 300);

  return true;
}
