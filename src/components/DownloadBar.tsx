import React from 'react';
import { Download, FileText, RotateCcw } from 'lucide-react';

interface DownloadBarProps {
  modifiedPdfBytes: Uint8Array | null;
  outputFileName: string;
  reportText: string;
  onReset: () => void;
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  modifiedPdfBytes,
  outputFileName,
  reportText,
  onReset,
}) => {
  if (!modifiedPdfBytes) return null;

  const handleDownloadPdf = () => {
    const blob = new Blob([modifiedPdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFileName || 'cv_ats.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raport_weryfikacji_ats.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl shadow-lg mt-6">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-300">Wygenerowano dokument gotowy do pobrania:</span>
        <span className="text-xs font-mono font-bold text-blue-300 bg-slate-800 px-2 py-0.5 rounded">
          {outputFileName}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Pobierz zmodyfikowany PDF
        </button>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Pobierz raport (.txt)
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-lg border border-slate-700 hover:border-rose-900 transition-all cursor-pointer ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Nowy dokument
        </button>
      </div>
    </div>
  );
};
