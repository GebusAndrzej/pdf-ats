import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface AtsTextViewerProps {
  fullText: string;
}

export const AtsTextViewer: React.FC<AtsTextViewerProps> = ({ fullText }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 border-b border-slate-200 flex justify-between items-center">
        <span>Strumień tekstu widziany przez parser ATS (bez OCR):</span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!fullText}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md shadow-2xs transition-colors disabled:opacity-50"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Skopiowano!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Kopiuj tekst</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-96 text-slate-800 whitespace-pre-wrap break-all bg-slate-50/50">
        {fullText || (
          <span className="text-slate-400 italic">
            [Wykonaj wstrzyknięcie, aby zobaczyć pełen strumień tekstu wyodrębniony przez parser ATS]
          </span>
        )}
      </pre>
    </div>
  );
};
