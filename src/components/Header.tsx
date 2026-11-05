import React from 'react';
import { ShieldCheck, FileText, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 py-5 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                PDF Invisible Text Injector & ATS Checker
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Niewidzialne wstrzykiwanie słów kluczowych do CV z automatyczną weryfikacją ATS i testem pikselowym 150 DPI.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side (RODO / Zero-Backend)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Cpu className="w-3.5 h-3.5" />
            Web Edition (pdf-lib & pdf.js)
          </span>
        </div>
      </div>
    </header>
  );
};
