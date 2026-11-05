import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, RefreshCw, ArrowRightLeft, Search, Loader2, Eye } from 'lucide-react';
import { renderSinglePageThumbnail } from '../core/pixelChecker';

interface CompareDropzoneProps {
  onCompare: (origFile: File, origBytes: Uint8Array, modFile: File, modBytes: Uint8Array) => void;
  isProcessing: boolean;
}

export const CompareDropzone: React.FC<CompareDropzoneProps> = ({
  onCompare,
  isProcessing,
}) => {
  const [origFile, setOrigFile] = useState<File | null>(null);
  const [origBytes, setOrigBytes] = useState<Uint8Array | null>(null);
  const [origThumb, setOrigThumb] = useState<string | null>(null);
  const [origPageCount, setOrigPageCount] = useState<number>(0);

  const [modFile, setModFile] = useState<File | null>(null);
  const [modBytes, setModBytes] = useState<Uint8Array | null>(null);
  const [modThumb, setModThumb] = useState<string | null>(null);
  const [modPageCount, setModPageCount] = useState<number>(0);

  const [isDragOrig, setIsDragOrig] = useState(false);
  const [isDragMod, setIsDragMod] = useState(false);

  const origInputRef = useRef<HTMLInputElement>(null);
  const modInputRef = useRef<HTMLInputElement>(null);

  const handleOrigFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Wybierz poprawny plik PDF.');
      return;
    }
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setOrigFile(file);
    setOrigBytes(bytes);

    try {
      const thumb = await renderSinglePageThumbnail(bytes, 1, 72);
      setOrigThumb(thumb.dataUrl);
      setOrigPageCount(thumb.pageCount);
    } catch (e) {
      console.warn('Nie udało się wyrenderować miniatury oryginału:', e);
    }
  };

  const handleModFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Wybierz poprawny plik PDF.');
      return;
    }
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setModFile(file);
    setModBytes(bytes);

    try {
      const thumb = await renderSinglePageThumbnail(bytes, 1, 72);
      setModThumb(thumb.dataUrl);
      setModPageCount(thumb.pageCount);
    } catch (e) {
      console.warn('Nie udało się wyrenderować miniatury zmodyfikowanego:', e);
    }
  };

  const handleExecuteCompare = () => {
    if (!origFile || !origBytes || !modFile || !modBytes) return;
    onCompare(origFile, origBytes, modFile, modBytes);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
          Porównanie dwóch plików PDF (Weryfikacja różnic & Test pikselowy 150 DPI)
        </h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto font-medium">
          Format A4 • Wskaźnik zmian per strona • Diff ATS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Oryginalny PDF */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              1. Oryginalny plik PDF (np. przed zmianami):
            </label>
            {origPageCount > 0 && (
              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                {origPageCount} str.
              </span>
            )}
          </div>

          {!origFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!isProcessing) setIsDragOrig(true);
              }}
              onDragLeave={() => setIsDragOrig(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOrig(false);
                if (!isProcessing && e.dataTransfer.files?.[0]) {
                  handleOrigFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => !isProcessing && origInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOrig
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={origInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleOrigFile(e.target.files[0])}
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <UploadCloud className="w-8 h-8 text-blue-500" />
                <p className="text-xs font-semibold text-slate-700">Wybierz lub upuść oryginał (PDF)</p>
                <p className="text-[11px] text-slate-400">Plik wzorcowy przed wstrzyknięciem tekstu</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-1.5 bg-blue-600 text-white rounded-lg shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{origFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(origFile.size / 1024).toFixed(1)} KB • {origPageCount} str.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => origInputRef.current?.click()}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Zmień
                </button>
                <input
                  ref={origInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleOrigFile(e.target.files[0])}
                  disabled={isProcessing}
                />
              </div>

              {/* Miniaturka pierwszej strony */}
              {origThumb && (
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100">
                  <img
                    src={origThumb}
                    alt="Podgląd oryginału"
                    className="w-14 h-20 object-contain bg-white shadow-xs border border-slate-200 rounded"
                  />
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-0.5">Podgląd str. 1:</span>
                    <span>Format A4 załadowany poprawnie.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Box 2: Zmodyfikowany PDF */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              2. Zmodyfikowany plik PDF (do weryfikacji):
            </label>
            {modPageCount > 0 && (
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                {modPageCount} str.
              </span>
            )}
          </div>

          {!modFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!isProcessing) setIsDragMod(true);
              }}
              onDragLeave={() => setIsDragMod(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragMod(false);
                if (!isProcessing && e.dataTransfer.files?.[0]) {
                  handleModFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => !isProcessing && modInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragMod
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={modInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleModFile(e.target.files[0])}
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <UploadCloud className="w-8 h-8 text-emerald-500" />
                <p className="text-xs font-semibold text-slate-700">Wybierz lub upuść plik zmodyfikowany (PDF)</p>
                <p className="text-[11px] text-slate-400">Dokument z dodanymi słowami kluczowymi</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{modFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(modFile.size / 1024).toFixed(1)} KB • {modPageCount} str.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => modInputRef.current?.click()}
                  disabled={isProcessing}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-200 bg-white hover:bg-emerald-50 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Zmień
                </button>
                <input
                  ref={modInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleModFile(e.target.files[0])}
                  disabled={isProcessing}
                />
              </div>

              {/* Miniaturka pierwszej strony */}
              {modThumb && (
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-emerald-100">
                  <img
                    src={modThumb}
                    alt="Podgląd zmodyfikowanego"
                    className="w-14 h-20 object-contain bg-white shadow-xs border border-slate-200 rounded"
                  />
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-0.5">Podgląd str. 1:</span>
                    <span>Format A4 załadowany poprawnie.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Przycisk uruchomienia porównania */}
      <button
        type="button"
        onClick={handleExecuteCompare}
        disabled={!origBytes || !modBytes || isProcessing}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all ${
          origBytes && modBytes && !isProcessing
            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.99] shadow-blue-500/20'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Porównywanie strumieni tekstu ATS i renderowanie stron 150 DPI...</span>
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            <span>🔍 Porównaj oba dokumenty i zweryfikuj integralność</span>
          </>
        )}
      </button>
    </div>
  );
};
