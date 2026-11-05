/**
 * Obliczanie bezpiecznych prostokątów (Bounding Box) dla tekstu wstrzykiwanego do PDF.
 * Uwaga: W standardzie PDF i bibliotece pdf-lib układ współrzędnych ma punkt (0, 0)
 * w LEWYM DOLNYM ROGU (oś Y rośnie w górę).
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type InjectionPosition =
  | 'bottom_margin'
  | 'bottom_right'
  | 'bottom_left'
  | 'top_margin'
  | 'top_right'
  | 'full_page';

export function computeBoundingBox(
  pageWidth: number,
  pageHeight: number,
  position: InjectionPosition = 'bottom_margin',
  margin: number = 15.0
): BoundingBox {
  const w = pageWidth;
  const h = pageHeight;

  switch (position) {
    case 'bottom_margin': {
      // Wąski poziomy pasek tuż nad dolną krawędzią (2 pt od brzegu kartki)
      // Poniżej klauzuli RODO i standardowej treści CV
      const stripH = 16.0;
      return {
        x: margin,
        y: 2.0,
        width: w - 2 * margin,
        height: stripH,
      };
    }

    case 'bottom_right': {
      // Mały narożnik w prawym dolnym rogu
      const boxW = Math.min(150.0, w * 0.3);
      const boxH = 20.0;
      return {
        x: w - margin - boxW,
        y: 2.0,
        width: boxW,
        height: boxH,
      };
    }

    case 'bottom_left': {
      // Mały narożnik w lewym dolnym rogu
      const boxW = Math.min(150.0, w * 0.3);
      const boxH = 20.0;
      return {
        x: margin,
        y: 2.0,
        width: boxW,
        height: boxH,
      };
    }

    case 'top_margin': {
      // Wąski pasek tuż pod górną krawędzią strony
      const stripH = 16.0;
      return {
        x: margin,
        y: h - stripH - 2.0,
        width: w - 2 * margin,
        height: stripH,
      };
    }

    case 'top_right': {
      // Mały narożnik w prawym górnym rogu
      const boxW = Math.min(150.0, w * 0.3);
      const boxH = 20.0;
      return {
        x: w - margin - boxW,
        y: h - boxH - 2.0,
        width: boxW,
        height: boxH,
      };
    }

    case 'full_page':
    default: {
      // Pełna strona z marginesami
      return {
        x: margin,
        y: margin,
        width: w - 2 * margin,
        height: h - 2 * margin,
      };
    }
  }
}
