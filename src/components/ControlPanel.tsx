import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { InjectionMethod } from '../core/pdfEngine';
import { InjectionPosition } from '../core/boundingBox';

interface ControlPanelProps {
  method: InjectionMethod;
  onMethodChange: (m: InjectionMethod) => void;
  position: InjectionPosition;
  onPositionChange: (p: InjectionPosition) => void;
  pageTarget: number | 'all';
  onPageTargetChange: (pt: number | 'all') => void;
  fontSize: number;
  onFontSizeChange: (fs: number) => void;
  onExecute: () => void;
  isProcessing: boolean;
  canExecute: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  method,
  onMethodChange,
  position,
  onPositionChange,
  pageTarget,
  onPageTargetChange,
  fontSize,
  onFontSizeChange,
  onExecute,
  isProcessing,
  canExecute,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
        Opcje wstrzykiwania i weryfikacja
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* 1. Metoda ukrywania */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Metoda ukrywania:
          </label>
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value as InjectionMethod)}
            disabled={isProcessing}
            className="w-full text-xs font-medium px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="render_mode_3">render_mode_3 (Niewidzialny tekst PDF - zalecany)</option>
            <option value="underlay">underlay (Warstwa podkładowa pod grafiką)</option>
            <option value="white">white (Biały kolor tekstu)</option>
          </select>
        </div>

        {/* 2. Położenie tekstu */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Położenie tekstu:
          </label>
          <select
            value={position}
            onChange={(e) => onPositionChange(e.target.value as InjectionPosition)}
            disabled={isProcessing}
            className="w-full text-xs font-medium px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="bottom_margin">Dolny margines (zalecane - poza zaznaczeniem)</option>
            <option value="bottom_right">Prawy dolny róg</option>
            <option value="bottom_left">Lewy dolny róg</option>
            <option value="top_margin">Górny margines</option>
            <option value="top_right">Prawy górny róg</option>
            <option value="full_page">Cała strona (tryb klasyczny)</option>
          </select>
        </div>

        {/* 3. Strona docelowa */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Strona docelowa:
          </label>
          <select
            value={pageTarget === 'all' ? 'all' : String(pageTarget)}
            onChange={(e) => {
              const val = e.target.value;
              onPageTargetChange(val === 'all' ? 'all' : parseInt(val, 10));
            }}
            disabled={isProcessing}
            className="w-full text-xs font-medium px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value="-1">Ostatnia strona (domyślnie)</option>
            <option value="0">Pierwsza strona</option>
            <option value="all">Wszystkie strony</option>
          </select>
        </div>

        {/* 4. Rozmiar czcionki */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Rozmiar czcionki początkowy:
          </label>
          <select
            value={fontSize}
            onChange={(e) => onFontSizeChange(parseFloat(e.target.value))}
            disabled={isProcessing}
            className="w-full text-xs font-medium px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            <option value={1.0}>1.0 pt (mikroskopijna - zalecana)</option>
            <option value={0.5}>0.5 pt (ultra mikroskopijna)</option>
            <option value={2.0}>2.0 pt</option>
            <option value={4.0}>4.0 pt</option>
            <option value={8.0}>8.0 pt (duża)</option>
          </select>
        </div>
      </div>

      {/* Główny przycisk startu */}
      <button
        type="button"
        onClick={onExecute}
        disabled={!canExecute || isProcessing}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all ${
          canExecute && !isProcessing
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-lg active:scale-[0.99]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Przetwarzanie PDF, ekstrakcja tekstu i test pikselowy 150 DPI...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current" />
            <span>🚀 Wstrzyknij i zweryfikuj ATS</span>
          </>
        )}
      </button>
    </div>
  );
};
