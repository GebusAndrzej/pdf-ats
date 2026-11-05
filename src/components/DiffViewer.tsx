import React from 'react';
import { Tag } from 'lucide-react';

interface DiffViewerProps {
  diffText: string;
  addedWords: string[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ diffText, addedWords }) => {
  return (
    <div className="space-y-4">
      {/* Sekcja nowo wykrytych słów kluczowych */}
      {addedWords.length > 0 && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800">
            <Tag className="w-4 h-4" />
            <span>DODANE SŁOWA KLUCZOWE W STRUMIENIU ATS (+{addedWords.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {addedWords.map((word, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-mono rounded shadow-2xs font-semibold"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kolorowany Unified Diff */}
      <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
        <div className="bg-slate-800 px-4 py-2 text-xs font-mono font-semibold text-slate-300 border-b border-slate-700 flex justify-between items-center">
          <span>Unified Diff (Różnice strumienia tekstu)</span>
          <span className="text-slate-400 text-[11px]">+ zielony (dodano) | - czerwony (usunięto)</span>
        </div>
        <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-96 text-slate-200 whitespace-pre-wrap break-all">
          {diffText ? (
            diffText.split('\n').map((line, idx) => {
              if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
                return (
                  <div key={idx} className="text-blue-400 font-bold bg-blue-950/40 px-1 rounded">
                    {line}
                  </div>
                );
              }
              if (line.startsWith('+')) {
                return (
                  <div key={idx} className="text-emerald-400 font-semibold bg-emerald-950/40 px-1 rounded">
                    {line}
                  </div>
                );
              }
              if (line.startsWith('-')) {
                return (
                  <div key={idx} className="text-rose-400 bg-rose-950/40 px-1 rounded">
                    {line}
                  </div>
                );
              }
              return (
                <div key={idx} className="text-slate-300 px-1">
                  {line}
                </div>
              );
            })
          ) : (
            <div className="text-slate-500 italic py-4 text-center">
              [Brak zmian w tekście - wygeneruj zmodyfikowany plik PDF]
            </div>
          )}
        </pre>
      </div>
    </div>
  );
};
