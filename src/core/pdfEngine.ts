import { PDFDocument, setTextRenderingMode, TextRenderingMode, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { computeBoundingBox, InjectionPosition } from './boundingBox';
import { fitFontSize } from './autoFit';

export type InjectionMethod = 'render_mode_3' | 'white' | 'underlay';

export interface InjectionOptions {
  method?: InjectionMethod;
  position?: InjectionPosition;
  pageIndex?: number | 'all';
  fontsize?: number;
  margin?: number;
  fontBytes?: Uint8Array | ArrayBuffer;
}

export interface InjectionResult {
  modifiedPdfBytes: Uint8Array;
  pagesModified: number[];
  method: InjectionMethod;
  position: InjectionPosition;
  appliedFontSize: number;
  wordsInjected: number;
  charsInjected: number;
}

// Pamięć podręczna na zbuforowaną czcionkę NotoSans
let cachedFontBytes: Uint8Array | null = null;

export async function getOrLoadFontBytes(customBytes?: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  if (customBytes) {
    return customBytes instanceof Uint8Array ? customBytes : new Uint8Array(customBytes);
  }
  if (cachedFontBytes) {
    return cachedFontBytes;
  }

  // W środowisku przeglądarkowym pobieramy font z katalogu publicznego
  const response = await fetch('/fonts/NotoSans-Regular.ttf');
  if (!response.ok) {
    throw new Error(`Nie udało się pobrać czcionki NotoSans-Regular.ttf (HTTP ${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  cachedFontBytes = new Uint8Array(buffer);
  return cachedFontBytes;
}

export async function injectInvisibleText(
  pdfBytes: Uint8Array | ArrayBuffer,
  text: string,
  options: InjectionOptions = {}
): Promise<InjectionResult> {
  const method = options.method || 'render_mode_3';
  const position = options.position || 'bottom_margin';
  const pageIndex = options.pageIndex !== undefined ? options.pageIndex : -1;
  const initialFontSize = options.fontsize || 1.0;
  const margin = options.margin || 15.0;

  const cleanedText = text.trim();
  if (!cleanedText) {
    throw new Error('Tekst do wstrzyknięcia nie może być pusty.');
  }

  // 1. Otwarcie dokumentu PDF
  const data = (pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)).slice();
  const pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  pdfDoc.registerFontkit(fontkit);

  const totalPages = pdfDoc.getPageCount();
  if (totalPages === 0) {
    throw new Error('Dokument PDF nie zawiera żadnych stron.');
  }

  // 2. Określenie stron docelowych
  const targetPages: number[] = [];
  if (pageIndex === 'all') {
    for (let i = 0; i < totalPages; i++) targetPages.push(i);
  } else {
    let idx = typeof pageIndex === 'number' ? pageIndex : parseInt(String(pageIndex), 10);
    if (idx < 0) {
      idx = totalPages + idx;
    }
    if (idx < 0 || idx >= totalPages) {
      throw new Error(`Nieprawidłowy indeks strony: ${pageIndex}. Dokument ma ${totalPages} stron.`);
    }
    targetPages.push(idx);
  }

  // 3. Załadowanie i osadzenie czcionki Noto Sans (pełne wsparcie UTF-8, w tym ąćęłńóśźż)
  const fontBytes = await getOrLoadFontBytes(options.fontBytes);
  const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  const pagesModified: number[] = [];
  let finalFontSize = initialFontSize;

  // 4. Wstrzykiwanie do wyznaczonych stron
  for (const pIdx of targetPages) {
    const page = pdfDoc.getPage(pIdx);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    const box = computeBoundingBox(pageWidth, pageHeight, position, margin);
    const fittedFontSize = fitFontSize(cleanedText, box, customFont, initialFontSize);
    finalFontSize = fittedFontSize;

    if (method === 'render_mode_3') {
      // PDF Standard 3 Tr - Neither fill nor stroke text (Niewidzialny tekst dla OCR i ATS)
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Invisible));
      page.drawText(cleanedText, {
        x: box.x,
        y: box.y,
        size: fittedFontSize,
        font: customFont,
        maxWidth: box.width,
        lineHeight: fittedFontSize * 1.15,
      });
      // Przywrócenie normalnego trybu
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Fill));

    } else if (method === 'white') {
      // Biały kolor tekstu
      page.drawText(cleanedText, {
        x: box.x,
        y: box.y,
        size: fittedFontSize,
        font: customFont,
        color: rgb(1, 1, 1),
        maxWidth: box.width,
        lineHeight: fittedFontSize * 1.15,
      });

    } else if (method === 'underlay') {
      // Podkład pod treść z render mode 3
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Invisible));
      page.drawText(cleanedText, {
        x: box.x,
        y: box.y,
        size: fittedFontSize,
        font: customFont,
        color: rgb(1, 1, 1),
        maxWidth: box.width,
        lineHeight: fittedFontSize * 1.15,
      });
      page.pushOperators(setTextRenderingMode(TextRenderingMode.Fill));
    }

    pagesModified.push(pIdx + 1);
  }

  // 5. Zapisanie wynikowego pliku PDF do tablicy bajtów
  const modifiedPdfBytes = await pdfDoc.save();

  return {
    modifiedPdfBytes,
    pagesModified,
    method,
    position,
    appliedFontSize: finalFontSize,
    wordsInjected: cleanedText.split(/\s+/).filter(Boolean).length,
    charsInjected: cleanedText.length,
  };
}
