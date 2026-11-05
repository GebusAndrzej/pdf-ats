/**
 * Narzędzia operacji na tekście i słowach kluczowych.
 */

/**
 * Usuwa powtórzenia słów, zachowując kolejność ich pierwszego wystąpienia.
 * Ignoruje wielkość liter i znaki interpunkcyjne na brzegach tokenów.
 */
export function deduplicateWords(input: string): string {
  const content = input.trim();
  if (!content) return '';

  const words = content.split(/\s+/);
  const seen = new Set<string>();
  const uniqueWords: string[] = [];

  for (const w of words) {
    const clean = w.replace(/^[.,;:!?\-]+|[.,;:!?\-]+$/g, '');
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase());
      uniqueWords.push(clean);
    }
  }

  return uniqueWords.join(' ');
}

export function countWordsAndChars(text: string): { words: number; chars: number } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { words: 0, chars: 0 };
  }
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  return { words, chars };
}
