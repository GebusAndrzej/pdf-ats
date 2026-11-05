import * as pdfjsLib from 'pdfjs-dist';
import pixelmatch from 'pixelmatch';

export interface PagePixelResult {
  page: number;
  visuallyIdentical: boolean;
  diffPixels: number;
  width: number;
  height: number;
  diffImageDataUrl?: string;
  origImageDataUrl?: string;
  modImageDataUrl?: string;
}

export interface VisualCheckResult {
  visualCheckPassed: boolean;
  totalPagesCompared: number;
  totalDiffPixels: number;
  pageCountMismatch?: boolean;
  origPageCount: number;
  modPageCount: number;
  pages: PagePixelResult[];
}

/**
 * Renderuje szybką miniaturkę wybranej strony PDF (np. do podglądu w dropzone).
 */
export async function renderSinglePageThumbnail(
  pdfBytes: Uint8Array | ArrayBuffer,
  pageNumber: number = 1,
  dpi: number = 72
): Promise<{ dataUrl: string; width: number; height: number; pageCount: number }> {
  const data = (pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)).slice();
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const safePageNum = Math.min(Math.max(1, pageNumber), doc.numPages);
  const page = await doc.getPage(safePageNum);

  const scale = dpi / 72;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx as any, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    pageCount: doc.numPages,
  };
}

/**
 * Porównuje strony obu dokumentów piksel po pikselu w rozdzielczości 150 DPI.
 */
export async function verifyVisualPixels(
  origBytes: Uint8Array | ArrayBuffer,
  modBytes: Uint8Array | ArrayBuffer,
  dpi: number = 150
): Promise<VisualCheckResult> {
  const origData = (origBytes instanceof Uint8Array ? origBytes : new Uint8Array(origBytes)).slice();
  const modData = (modBytes instanceof Uint8Array ? modBytes : new Uint8Array(modBytes)).slice();

  const origDoc = await pdfjsLib.getDocument({ data: origData }).promise;
  const modDoc = await pdfjsLib.getDocument({ data: modData }).promise;

  const minPages = Math.min(origDoc.numPages, modDoc.numPages);
  const isPageCountMismatch = origDoc.numPages !== modDoc.numPages;
  const scale = dpi / 72; // Przeliczenie DPI na skalę (PDF bazowo = 72 DPI)
  const pageResults: PagePixelResult[] = [];
  let totalDiff = 0;

  for (let i = 1; i <= minPages; i++) {
    const pageOrig = await origDoc.getPage(i);
    const pageMod = await modDoc.getPage(i);

    const vpOrig = pageOrig.getViewport({ scale });
    const vpMod = pageMod.getViewport({ scale });

    const width = Math.floor(vpOrig.width);
    const height = Math.floor(vpOrig.height);

    // Utworzenie canvasów w środowisku DOM
    const canvasOrig = document.createElement('canvas');
    canvasOrig.width = width;
    canvasOrig.height = height;
    const ctxOrig = canvasOrig.getContext('2d')!;

    const canvasMod = document.createElement('canvas');
    canvasMod.width = width;
    canvasMod.height = height;
    const ctxMod = canvasMod.getContext('2d')!;

    await pageOrig.render({ canvasContext: ctxOrig as any, viewport: vpOrig }).promise;
    await pageMod.render({ canvasContext: ctxMod as any, viewport: vpMod }).promise;

    const imgOrig = ctxOrig.getImageData(0, 0, width, height);
    const imgMod = ctxMod.getImageData(0, 0, width, height);

    // Canvas na podświetlenie różnic (diff image)
    const canvasDiff = document.createElement('canvas');
    canvasDiff.width = width;
    canvasDiff.height = height;
    const ctxDiff = canvasDiff.getContext('2d')!;
    const imgDiff = ctxDiff.createImageData(width, height);

    const diffPixels = pixelmatch(
      imgOrig.data,
      imgMod.data,
      imgDiff.data,
      width,
      height,
      { threshold: 0.05 }
    );
    ctxDiff.putImageData(imgDiff, 0, 0);

    totalDiff += diffPixels;
    const isPageIdentical = diffPixels === 0;

    pageResults.push({
      page: i,
      visuallyIdentical: isPageIdentical,
      diffPixels,
      width,
      height,
      diffImageDataUrl: !isPageIdentical ? canvasDiff.toDataURL('image/png') : undefined,
      origImageDataUrl: canvasOrig.toDataURL('image/png'),
      modImageDataUrl: canvasMod.toDataURL('image/png'),
    });
  }

  const visualCheckPassed = (totalDiff === 0) && !isPageCountMismatch;

  return {
    visualCheckPassed,
    totalPagesCompared: minPages,
    totalDiffPixels: totalDiff,
    pageCountMismatch: isPageCountMismatch,
    origPageCount: origDoc.numPages,
    modPageCount: modDoc.numPages,
    pages: pageResults,
  };
}
