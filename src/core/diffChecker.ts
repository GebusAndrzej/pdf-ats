import * as diff from 'diff';
import { AtsExtractionResult } from './atsExtractor';

export interface DiffResult {
  diffText: string;
  addedWords: string[];
  addedWordsCount: number;
  originalStats: {
    pages: number;
    words: number;
    chars: number;
  };
  modifiedStats: {
    pages: number;
    words: number;
    chars: number;
  };
  modifiedFullText: string;
}

export function computeTextDiff(
  origAts: AtsExtractionResult,
  modAts: AtsExtractionResult
): DiffResult {
  // 1. Unified Diff wiersz po wierszu
  const patch = diff.createPatch(
    'CV.pdf',
    origAts.fullText,
    modAts.fullText,
    'Oryginalny_PDF',
    'Zmodyfikowany_PDF',
    { context: 2 }
  );

  // 2. Wykrycie słów / tokenów, które pojawiły się nowo
  const origWords = new Set(
    origAts.fullText
      .split(/\s+/)
      .map(w => w.replace(/^[.,;:]+|[.,;:]+$/g, ''))
      .filter(Boolean)
  );

  const modWords = modAts.fullText
    .split(/\s+/)
    .map(w => w.replace(/^[.,;:]+|[.,;:]+$/g, ''))
    .filter(Boolean);

  const addedWordsSet = new Set<string>();
  for (const word of modWords) {
    if (!origWords.has(word)) {
      addedWordsSet.add(word);
    }
  }

  const addedWords = Array.from(addedWordsSet).sort();

  return {
    diffText: patch,
    addedWords,
    addedWordsCount: addedWords.length,
    originalStats: {
      pages: origAts.pageCount,
      words: origAts.totalWords,
      chars: origAts.totalChars,
    },
    modifiedStats: {
      pages: modAts.pageCount,
      words: modAts.totalWords,
      chars: modAts.totalChars,
    },
    modifiedFullText: modAts.fullText,
  };
}

export function formatDiffReport(
  diffResult: DiffResult,
  visualCheckPassed: boolean
): string {
  const lines: string[] = [];
  lines.push('='.repeat(70));
  lines.push('            RAPORT WERYFIKACJI ATS I INTEGRALNOŚCI WIZUALNEJ');
  lines.push('='.repeat(70));
  lines.push('STATYSTYKI DANYCH TEKSTOWYCH (DLA PARSERA ATS):');
  const o_s = diffResult.originalStats;
  const m_s = diffResult.modifiedStats;
  lines.push(`  • Oryginał:       ${o_s.pages} str. | ${o_s.words} słów | ${o_s.chars} znaków`);
  lines.push(`  • Po modyfikacji: ${m_s.pages} str. | ${m_s.words} słów | ${m_s.chars} znaków`);
  const diffWords = m_s.words - o_s.words;
  const diffChars = m_s.chars - o_s.chars;
  lines.push(`  • Zmiana netto:   +${diffWords} słów (+${diffChars} znaków)`);

  lines.push('-'.repeat(70));
  lines.push('INTEGRALNOŚĆ WIZUALNA (CZY CZŁOWIEK COKOLWIEK ZOBACZY?):');
  if (visualCheckPassed) {
    lines.push('  [OK] PLIK JEST W 100% WIZUALNIE IDENTYCZNY Z ORYGINAŁEM.');
    lines.push('       (Tekst jest całkowicie niewidoczny dla oka ludzkiego).');
  } else {
    lines.push('  [UWAGA] Wykryto drobne różnice w pikselach (np. biały tekst na nieidealnie białym tle).');
  }

  lines.push('-'.repeat(70));
  lines.push('DODANE SŁOWA KLUCZOWE / FRAZY (WYCIĄG Z PARSERA ATS):');
  if (diffResult.addedWords.length > 0) {
    const preview = diffResult.addedWords.slice(0, 30).join(', ');
    const suffix = diffResult.addedWords.length > 30 ? ` ... oraz ${diffResult.addedWords.length - 30} innych` : '';
    lines.push(`  ${preview}${suffix}`);
  } else {
    lines.push('  (Brak unikalnych nowych słów)');
  }

  lines.push('-'.repeat(70));
  lines.push('RÓŻNICE STRUMIENIA TEKSTU (UNIFIED DIFF):');
  if (diffResult.diffText) {
    lines.push(diffResult.diffText);
  } else {
    lines.push('  (Brak różnic w tekście)');
  }

  lines.push('='.repeat(70));
  return lines.join('\n');
}
