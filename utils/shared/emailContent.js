/** Decode once, after removing markup; encoded user text must remain literal. */
export function decodeEmailEntities(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', bull: '•', rarr: '→', middot: '·' };
  return String(value ?? '').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key) => {
    if (!key.startsWith('#')) return named[key.toLowerCase()] ?? entity;
    const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : entity;
  });
}

/** Plain-text alternative for our table-based templates and admin HTML. */
export function emailHtmlToText(html) {
  const content = String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(head|style|script)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<div\b[^>]*style="[^"]*display\s*:\s*none[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, quote, href, label) => {
      const text = label.replace(/<[^>]*>/g, '').trim();
      return text ? `${text} (${href})` : '';
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|tr|table|li)>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]*>/g, '');
  return decodeEmailEntities(content)
    .split('\n').map(line => line.replace(/\s+/g, ' ').replace(/^[ |]+|[ |]+$/g, '').trim())
    .filter(Boolean).join('\n\n');
}

export function isEmailDocument(html) {
  return /<html(?:\s|>)/i.test(String(html ?? ''));
}

/** Browser diagnostics only. Never pass this derived HTML to mail dispatch. */
export function prepareEmailPreview(html, { theme = 'light', stripStyles = false, blockImages = false } = {}) {
  let preview = String(html ?? '');
  if (stripStyles) {
    preview = preview.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<link\b[^>]*>/gi, '');
  } else {
    preview = preview.replace(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/gi, theme === 'dark' ? '@media all' : '@media not all');
  }
  if (blockImages) {
    preview = preview.replace(/<img\b[^>]*>/gi, tag => tag.replace(/\s(?:src|srcset)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, ''));
  }
  // Prevent the browser's own color-scheme from painting controls in the opposite theme.
  const scheme = `<style>:root{color-scheme:${stripStyles ? 'light' : theme} !important}</style>`;
  return preview.replace(/<\/head\s*>/i, `${scheme}</head>`);
}
