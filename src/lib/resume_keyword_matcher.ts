export function extractKeywords(text: string, dictionary: Set<string>): string[] {
    const words = text.toLowerCase().match(/\b[a-z0-9+#.-]+\b/g) || [];
    return Array.from(new Set(words.filter(w => dictionary.has(w))));
}
