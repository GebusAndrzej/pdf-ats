/**
 * Obsługa dekodowania plików tekstowych (.txt) z automatycznym wykrywaniem kodowań:
 * UTF-8 (z BOM lub bez) oraz Windows-1250 (CP1250 / ISO-8859-2 dla starszych polskich plików).
 */

export async function readTextFileWithEncoding(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  // 1. Próba dekodowania w standardzie UTF-8
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    return utf8Decoder.decode(buffer);
  } catch {
    // 2. Jeśli wystąpił błąd dekodowania UTF-8, próbujemy Windows-1250 (częste dla plików z Windowsa w PL)
    try {
      const win1250Decoder = new TextDecoder('windows-1250');
      return win1250Decoder.decode(buffer);
    } catch {
      // 3. Fallback na domyślny TextDecoder
      const fallback = new TextDecoder();
      return fallback.decode(buffer);
    }
  }
}
