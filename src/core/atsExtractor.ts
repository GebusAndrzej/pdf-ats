import * as pdfjsLib from 'pdfjs-dist';

// Konfiguracja workera pdfjs dla środowiska przeglądarkowego
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback dla środowisk testowych Node / Vitest
  }
}

export interface AtsPageData {
  pageNumber: number;
  text: string;
  wordCount: number;
  charCount: number;
}

export interface AtsExtractionResult {
  pageCount: number;
  totalWords: number;
  totalChars: number;
  fullText: string;
  pages: AtsPageData[];
}

export async function extractTextAts(pdfBytes: Uint8Array | ArrayBuffer): Promise<AtsExtractionResult> {
  const data = (pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)).slice();
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;

  const pagesData: AtsPageData[] = [];
  const fullTextParts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    // Łączenie stringów z zachowaniem spacji
    const rawTokens: string[] = [];
    for (const item of content.items) {
      if ('str' in item && typeof item.str === 'string') {
        const trimmed = item.str.trim();
        if (trimmed.length > 0) {
          rawTokens.push(item.str);
        }
      }
    }

    const pageText = rawTokens.join(' ').trim();
    const words = pageText ? pageText.split(/\s+/).filter(Boolean).length : 0;
    const chars = pageText.length;

    pagesData.push({
      pageNumber: i,
      text: pageText,
      wordCount: words,
      charCount: chars,
    });

    fullTextParts.push(pageText);
  }

  const fullText = fullTextParts.join('\n\n--- [Strona / Koniec strony] ---\n\n');

  return {
    pageCount: doc.numPages,
    totalWords: pagesData.reduce((acc, p) => acc + p.wordCount, 0),
    totalChars: pagesData.reduce((acc, p) => acc + p.charCount, 0),
    fullText,
    pages: pagesData,
  };
}
