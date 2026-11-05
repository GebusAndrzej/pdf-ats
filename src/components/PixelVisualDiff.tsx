import React, { useState } from 'react';
import { PagePixelResult } from '../core/pixelChecker';
import { CheckCircle2, AlertTriangle, Eye } from 'lucide-react';

interface PixelVisualDiffProps {
  pageResults: PagePixelResult[];
}

export const PixelVisualDiff: React.FC<PixelVisualDiffProps> = ({ pageResults }) => {
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'mod' | 'orig' | 'diff'>('mod');

  if (pageResults.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl">
        Brak danych wizualnych. Uruchom wstrzykiwanie, aby wyrenderować strony w 150 DPI i porównać piksele.
      </div>
    );
  }

  const currentPage = pageResults[selectedPageIdx] || pageResults[0];

  return (
    <div className="space-y-4">
      {/* Pasek nawigacji stron i statusu */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Wybór strony:</span>
          <div className="flex gap-1">
            {pageResults.map((p, idx) => (
              <button
                key={p.page}
                type="button"
                onClick={() => setSelectedPageIdx(idx)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  selectedPageIdx === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Strona {p.page}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium">
          {currentPage.visuallyIdentical ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Identyczny z oryginałem (0 zmienionych pikseli w 150 DPI)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-md font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Wykryto {currentPage.diffPixels} zmienionych pikseli
            </span>
          )}
        </div>
      </div>

      {/* Przełącznik widoku: Zmodyfikowany / Oryginał / Różnice */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode('mod')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            viewMode === 'mod'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Zmodyfikowany PDF
        </button>
        <button
          type="button"
          onClick={() => setViewMode('orig')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            viewMode === 'orig'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Oryginalny PDF
        </button>
        {currentPage.diffImageDataUrl && (
          <button
            type="button"
            onClick={() => setViewMode('diff')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'diff'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            Mapa Różnic (Pixel Diff)
          </button>
        )}
      </div>

      {/* Podgląd obrazu wyrenderowanego w 150 DPI */}
      <div className="flex justify-center bg-slate-900/5 p-4 rounded-xl border border-slate-200 overflow-auto max-h-[500px]">
        {viewMode === 'mod' && currentPage.modImageDataUrl && (
          <img
            src={currentPage.modImageDataUrl}
            alt="Zmodyfikowany PDF"
            className="rounded-lg shadow-md max-w-full h-auto bg-white"
          />
        )}
        {viewMode === 'orig' && currentPage.origImageDataUrl && (
          <img
            src={currentPage.origImageDataUrl}
            alt="Oryginalny PDF"
            className="rounded-lg shadow-md max-w-full h-auto bg-white"
          />
        )}
        {viewMode === 'diff' && currentPage.diffImageDataUrl && (
          <img
            src={currentPage.diffImageDataUrl}
            alt="Mapa Różnic Pikseli"
            className="rounded-lg shadow-md max-w-full h-auto bg-white"
          />
        )}
      </div>
    </div>
  );
};
