import { describe, it, expect, beforeAll } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

import { injectInvisibleText } from '../src/core/pdfEngine';
import { extractTextAts } from '../src/core/atsExtractor';
import { computeTextDiff } from '../src/core/diffChecker';
import { deduplicateWords, countWordsAndChars } from '../src/core/textUtils';
import { computeBoundingBox } from '../src/core/boundingBox';

describe('PDF Web/WASM Engine & ATS Verification', () => {
  let samplePdfBytes: Uint8Array;
  let fontBytes: Uint8Array;

  beforeAll(async () => {
    // Wczytanie czcionki z public/fonts
    const fontPath = path.resolve(__dirname, '../public/fonts/NotoSans-Regular.ttf');
    fontBytes = new Uint8Array(fs.readFileSync(fontPath));

    // Stworzenie przykładowego CV
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    page.drawText('Jan Kowalski - Senior Software Engineer', { x: 50, y: 800, size: 14 });
    page.drawText('Doswiadczenie: Python, SQL, Git, Linux.', { x: 50, y: 770, size: 10 });
    page.drawText('Edukacja: Informatyka Stosowana Politechnika.', { x: 50, y: 740, size: 10 });
    samplePdfBytes = await pdfDoc.save();
  });

  it('powinien poprawnie deduplikować słowa kluczowe', () => {
    const input = 'Docker, docker, Kubernetes, AWS; aws, DOCKER, Terraform!';
    const result = deduplicateWords(input);
    expect(result).toBe('Docker Kubernetes AWS Terraform');
  });

  it('powinien poprawnie liczyć słowa i znaki', () => {
    const text = 'FastAPI Python React Vitest';
    const counts = countWordsAndChars(text);
    expect(counts.words).toBe(4);
    expect(counts.chars).toBe(text.length);
  });

  it('powinien poprawnie wyliczać bezpieczny bounding box dla różnych pozycji', () => {
    const boxBottom = computeBoundingBox(600, 800, 'bottom_margin', 15);
    expect(boxBottom.x).toBe(15);
    expect(boxBottom.y).toBe(2);
    expect(boxBottom.width).toBe(570);
    expect(boxBottom.height).toBe(16);

    const boxCorner = computeBoundingBox(600, 800, 'bottom_right', 15);
    expect(boxCorner.x).toBe(600 - 15 - 150);
    expect(boxCorner.y).toBe(2);
  });

  it('powinien wstrzykiwać niewidzialny tekst (render_mode_3) i zachować polskie znaki UTF-8', async () => {
    const polishKeywords = 'Zażółć gęślą jaźń ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ Zarządzanie Inżynieria CI_CD_TOKEN';

    const injResult = await injectInvisibleText(samplePdfBytes, polishKeywords, {
      method: 'render_mode_3',
      position: 'bottom_margin',
      fontsize: 1.0,
      fontBytes,
    });

    expect(injResult.modifiedPdfBytes.length).toBeGreaterThan(0);
    expect(injResult.method).toBe('render_mode_3');
    expect(injResult.wordsInjected).toBe(polishKeywords.split(/\s+/).length);

    // Ekstrakcja tekstu ATS
    const origAts = await extractTextAts(samplePdfBytes);
    const modAts = await extractTextAts(injResult.modifiedPdfBytes);

    // Sprawdzenie, czy polskie znaki są w pełnym strumieniu tekstu
    expect(modAts.fullText).toContain('CI_CD_TOKEN');
    expect(modAts.fullText).toContain('Zażółć');
    expect(modAts.fullText).toContain('gęślą');
    expect(modAts.fullText).toContain('jaźń');
    expect(modAts.fullText).toContain('Zarządzanie');
    expect(modAts.fullText).toContain('Inżynieria');

    // Upewnienie się, że żaden polski znak nie zamienił się w '?'
    for (const char of 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ') {
      expect(modAts.fullText).toContain(char);
    }

    // Wyliczenie diffa
    const diffRes = computeTextDiff(origAts, modAts);
    expect(diffRes.addedWords).toContain('CI_CD_TOKEN');
    expect(diffRes.addedWords).toContain('Zażółć');
    expect(diffRes.addedWordsCount).toBeGreaterThan(0);
  });

  it('powinien poprawnie obsłużyć metodę white i underlay', async () => {
    const resWhite = await injectInvisibleText(samplePdfBytes, 'WHITE_TOKEN_AWS', {
      method: 'white',
      fontBytes,
    });
    const atsWhite = await extractTextAts(resWhite.modifiedPdfBytes);
    expect(atsWhite.fullText).toContain('WHITE_TOKEN_AWS');

    const resUnderlay = await injectInvisibleText(samplePdfBytes, 'UNDERLAY_TOKEN_K8S', {
      method: 'underlay',
      fontBytes,
    });
    const atsUnderlay = await extractTextAts(resUnderlay.modifiedPdfBytes);
    expect(atsUnderlay.fullText).toContain('UNDERLAY_TOKEN_K8S');
  });
});
