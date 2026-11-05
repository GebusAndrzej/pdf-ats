import { BoundingBox } from './boundingBox';

/**
 * Dobiera rozmiar czcionki (od wybranego w dół do 0.1 pt), tak aby tekst
 * zmieścił się w zadanym prostokącie bez ucinania słów.
 */
export function fitFontSize(
  text: string,
  box: BoundingBox,
  font: any,
  initialSize: number = 1.0
): number {
  const testSizes = [initialSize, 1.0, 0.8, 0.5, 0.3, 0.2, 0.1];
  const uniqueSizes = Array.from(new Set(testSizes.filter(s => s <= initialSize))).sort((a, b) => b - a);

  for (const size of uniqueSizes) {
    const lineHeight = size * 1.15;
    const words = text.split(/\s+/).filter(Boolean);

    let lines = 1;
    let currentLineWidth = 0;
    let fits = true;

    for (const word of words) {
      const wordWidth = font.widthOfTextAtSize(word + ' ', size);
      if (wordWidth > box.width) {
        // Pojedyncze słowo jest szersze niż cały boks
        fits = false;
        break;
      }

      if (currentLineWidth + wordWidth > box.width) {
        lines++;
        currentLineWidth = wordWidth;
      } else {
        currentLineWidth += wordWidth;
      }
    }

    if (fits && lines * lineHeight <= box.height) {
      return size;
    }
  }

  return 0.1; // Minimalny bezpieczny rozmiar czcionki
}
