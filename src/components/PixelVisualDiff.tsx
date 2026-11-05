import React, { useState, useRef, useEffect } from 'react';
import { PagePixelResult } from '../core/pixelChecker';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Columns,
  FileText,
  Layers,
} from 'lucide-react';

interface PixelVisualDiffProps {
  pageResults: PagePixelResult[];
}

export const PixelVisualDiff: React.FC<PixelVisualDiffProps> = ({ pageResults }) => {
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);

  // Tryby prezentacji:
  // 'single' = Pojedyncza strona A4
  // 'side-by-side' = Obok siebie (oryginał vs zmodyfikowany)
  // 'slider' = Interaktywny suwak Before / After
  const [compareMode, setCompareMode] = useState<'single' | 'side-by-side' | 'slider'>('slider');

  // Aktywna warstwa w trybie pojedynczej strony: 'mod' | 'orig' | 'diff'
  const [singleLayer, setSingleLayer] = useState<'mod' | 'orig' | 'diff'>('mod');

  // Powiększenie i dopasowanie
  const [zoomLevel, setZoomLevel] = useState<number>(85); // procent (50% - 175%)
  const [fitMode, setFitMode] = useState<'fit-page' | 'fit-width' | 'custom'>('fit-page');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Stan suwaka Before/After
  const [sliderPos, setSliderPos] = useState(50); // 0 - 100%
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Obsługa przeciągania suwaka
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = () => setIsDraggingSlider(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingSlider(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDraggingSlider]);

  if (pageResults.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 italic bg-slate-50 border border-slate-200 rounded-xl">
        Brak danych wizualnych. Uruchom weryfikację, aby wyrenderować strony w 150 DPI i porównać piksele.
      </div>
    );
  }

  const currentPage = pageResults[selectedPageIdx] || pageResults[0];
  const totalPages = pageResults.length;

  const handlePrevPage = () => {
    if (selectedPageIdx > 0) setSelectedPageIdx(selectedPageIdx - 1);
  };

  const handleNextPage = () => {
    if (selectedPageIdx < totalPages - 1) setSelectedPageIdx(selectedPageIdx + 1);
  };

  // Obliczenie szerokości arkusza A4 w zależności od zoomu / trybu
  const getSheetWidthClass = () => {
    if (fitMode === 'fit-page') {
      return compareMode === 'side-by-side' ? 'max-w-[420px]' : 'max-w-[540px]';
    }
    if (fitMode === 'fit-width') {
      return compareMode === 'side-by-side' ? 'w-[48%]' : 'w-full max-w-[840px]';
    }
    // Custom zoom
    return '';
  };

  const customZoomStyle = fitMode === 'custom' ? { width: `${zoomLevel * 6.5}px` } : {};

  return (
    <div
      className={`space-y-4 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-900 p-6 overflow-y-auto flex flex-col'
          : 'relative'
      }`}
    >
      {/* 1. GŁÓWNY PASEK NARZĘDZIOWY (TOOLBAR) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
        {/* Paginator i status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={selectedPageIdx === 0}
              className="p-1.5 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Poprzednia strona"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2.5">
              Strona {selectedPageIdx + 1} z {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={selectedPageIdx === totalPages - 1}
              className="p-1.5 rounded hover:bg-white text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Następna strona"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
            {currentPage.visuallyIdentical ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% Identyczna (0 px w 150 DPI)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Różnice: +{currentPage.diffPixels} px
              </span>
            )}
          </div>
        </div>

        {/* Wybór trybu porównania: Suwak / Obok siebie / Pojedyncza strona */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setCompareMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              compareMode === 'slider'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Suwak Przed/Po</span>
          </button>

          <button
            type="button"
            onClick={() => setCompareMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              compareMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Obok siebie (A4)</span>
          </button>

          <button
            type="button"
            onClick={() => setCompareMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              compareMode === 'single'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pojedyncza</span>
          </button>
        </div>

        {/* Kontrola powiększenia (Zoom / Fit) i Pełny ekran */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setFitMode('fit-page');
              setZoomLevel(85);
            }}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
              fitMode === 'fit-page'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Dopasuj do ekranu
          </button>

          <button
            type="button"
            onClick={() => {
              setFitMode('fit-width');
              setZoomLevel(120);
            }}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
              fitMode === 'fit-width'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Dopasuj do szerokości
          </button>

          <div className="flex items-center bg-slate-100 rounded border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => {
                setFitMode('custom');
                setZoomLevel(Math.max(50, zoomLevel - 15));
              }}
              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Pomniejsz"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 font-bold text-slate-700">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => {
                setFitMode('custom');
                setZoomLevel(Math.min(180, zoomLevel + 15));
              }}
              className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Powiększ"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 cursor-pointer"
            title={isFullscreen ? 'Zamknij pełny ekran' : 'Pełny ekran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. GŁÓWNY OBSZAR ROBOCZY: SIDEBAR MINIATUREK + BIURKO A4 */}
      <div className={`flex flex-col md:flex-row gap-4 ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
        {/* LEWY PASEK MINIATUR STRON (THUMBNAILS) */}
        <div className="w-full md:w-36 shrink-0 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[140px] md:max-h-[680px]">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1 pb-1 border-b border-slate-100 hidden md:block">
            Strony ({totalPages})
          </div>

          {pageResults.map((p, idx) => (
            <button
              key={p.page}
              type="button"
              onClick={() => setSelectedPageIdx(idx)}
              className={`flex md:flex-col items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer shrink-0 ${
                selectedPageIdx === idx
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {/* Miniaturka w proporcji A4 */}
              <div className="w-14 h-20 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden relative shrink-0 aspect-[1/1.414]">
                {p.modImageDataUrl && (
                  <img
                    src={p.modImageDataUrl}
                    alt={`Miniaturka str. ${p.page}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Znacznik statusu */}
                <div className="absolute top-1 right-1">
                  {p.visuallyIdentical ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white block" title="100% OK" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-1 ring-white block animate-pulse" title="Różnice pikseli" />
                  )}
                </div>
              </div>

              <div className="text-center md:w-full">
                <span className="text-xs font-bold text-slate-800 block">Str. {p.page}</span>
                <span
                  className={`text-[10px] font-semibold block ${
                    p.visuallyIdentical ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {p.visuallyIdentical ? '0 px' : `+${p.diffPixels} px`}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* CENTRALNE BIURKO MONTAŻOWE DOKUMENTU A4 */}
        <div className="flex-1 bg-slate-800/90 rounded-xl p-4 md:p-6 border border-slate-700/80 overflow-auto flex flex-col items-center justify-start min-h-[500px] shadow-inner">
          {/* TRYB 1: INTERAKTYWNY SUWAK BEFORE / AFTER */}
          {compareMode === 'slider' && (
            <div className="w-full flex flex-col items-center">
              <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-2">
                <span>◀ Oryginał ({Math.round(sliderPos)}%)</span>
                <span className="text-slate-500">• Przeciągnij suwak w poprzek kartki •</span>
                <span>Zmodyfikowany ({Math.round(100 - sliderPos)}%) ▶</span>
              </div>

              <div
                ref={sliderContainerRef}
                className={`relative bg-white rounded-lg shadow-2xl overflow-hidden aspect-[1/1.414] select-none cursor-ew-resize border border-slate-300 ${getSheetWidthClass()}`}
                style={customZoomStyle}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
              >
                {/* 1. Spód: Oryginalny dokument */}
                {currentPage.origImageDataUrl && (
                  <img
                    src={currentPage.origImageDataUrl}
                    alt="Oryginał A4"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                )}

                {/* 2. Góra z obcięciem: Zmodyfikowany dokument */}
                {currentPage.modImageDataUrl && (
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  >
                    <img
                      src={currentPage.modImageDataUrl}
                      alt="Zmodyfikowany A4"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                )}

                {/* Linia podziału suwaka */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)] pointer-events-none z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                    ◀▶
                  </div>
                </div>

                {/* Etykiety narożnikowe */}
                <span className="absolute bottom-3 left-3 px-2 py-1 bg-slate-900/70 text-white text-[10px] font-bold rounded shadow pointer-events-none">
                  ORYGINAŁ
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-1 bg-blue-600/90 text-white text-[10px] font-bold rounded shadow pointer-events-none">
                  ZMODYFIKOWANY
                </span>
              </div>
            </div>
          )}

          {/* TRYB 2: OBOK SIEBIE (SIDE-BY-SIDE A4) */}
          {compareMode === 'side-by-side' && (
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6">
              {/* Lewa kartka: Oryginał */}
              <div className={`flex flex-col items-center ${getSheetWidthClass()}`} style={customZoomStyle}>
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Oryginalny PDF (Strona {currentPage.page})
                </div>
                <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden aspect-[1/1.414] border border-slate-300">
                  {currentPage.origImageDataUrl && (
                    <img
                      src={currentPage.origImageDataUrl}
                      alt="Oryginał"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Prawa kartka: Zmodyfikowany */}
              <div className={`flex flex-col items-center ${getSheetWidthClass()}`} style={customZoomStyle}>
                <div className="text-xs font-bold text-blue-300 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Zmodyfikowany PDF (Strona {currentPage.page})
                </div>
                <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden aspect-[1/1.414] border border-slate-300">
                  {currentPage.modImageDataUrl && (
                    <img
                      src={currentPage.modImageDataUrl}
                      alt="Zmodyfikowany"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TRYB 3: POJEDYNCZA STRONA Z PRZEŁĄCZNIKIEM WARSTWY */}
          {compareMode === 'single' && (
            <div className="w-full flex flex-col items-center">
              {/* Przełącznik warstw */}
              <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-700 mb-3">
                <button
                  type="button"
                  onClick={() => setSingleLayer('mod')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                    singleLayer === 'mod' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Zmodyfikowany PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSingleLayer('orig')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                    singleLayer === 'orig' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Oryginalny PDF
                </button>
                {currentPage.diffImageDataUrl && (
                  <button
                    type="button"
                    onClick={() => setSingleLayer('diff')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                      singleLayer === 'diff' ? 'bg-rose-600 text-white' : 'text-rose-300 hover:bg-slate-800'
                    }`}
                  >
                    Mapa Różnic Pikseli (+{currentPage.diffPixels} px)
                  </button>
                )}
              </div>

              {/* Kartka A4 */}
              <div
                className={`bg-white rounded-lg shadow-2xl overflow-hidden aspect-[1/1.414] border border-slate-300 ${getSheetWidthClass()}`}
                style={customZoomStyle}
              >
                {singleLayer === 'mod' && currentPage.modImageDataUrl && (
                  <img
                    src={currentPage.modImageDataUrl}
                    alt="Zmodyfikowany PDF"
                    className="w-full h-full object-contain"
                  />
                )}
                {singleLayer === 'orig' && currentPage.origImageDataUrl && (
                  <img
                    src={currentPage.origImageDataUrl}
                    alt="Oryginalny PDF"
                    className="w-full h-full object-contain"
                  />
                )}
                {singleLayer === 'diff' && currentPage.diffImageDataUrl && (
                  <img
                    src={currentPage.diffImageDataUrl}
                    alt="Mapa różnic"
                    className="w-full h-full object-contain bg-slate-900"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
