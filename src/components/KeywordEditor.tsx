import React, { useRef } from 'react';
import { FolderOpen, Sparkles, Trash2, Languages } from 'lucide-react';
import { readTextFileWithEncoding } from '../utils/textEncoding';
import { deduplicateWords, countWordsAndChars } from '../core/textUtils';

interface KeywordEditorProps {
  text: string;
  onChange: (newText: string) => void;
  disabled?: boolean;
}

export const KeywordEditor: React.FC<KeywordEditorProps> = ({
  text,
  onChange,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { words, chars } = countWordsAndChars(text);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const content = await readTextFileWithEncoding(file);
        onChange(content);
      } catch (err) {
        alert('Nie udało się odczytać pliku tekstowego: ' + err);
      }
    }
  };

  const handleDeduplicate = () => {
    const deduped = deduplicateWords(text);
    onChange(deduped);
  };

  const handleClear = () => {
    onChange('');
  };

  const handleInsertPolishSample = () => {
    const sample = 'Docker Kubernetes AWS Terraform FastAPI Python Zażółć gęślą jaźń ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ Zarządzanie Doświadczenie Inżynieria CI/CD Microservices';
    onChange(text ? `${text.trim()} ${sample}` : sample);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
          Słowa kluczowe / Tekst do wstrzyknięcia
        </h2>

        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          Słowa: <strong className="text-slate-800">{words}</strong> | Znaki: <strong className="text-slate-800">{chars}</strong>
        </span>
      </div>

      {/* Pasek narzędziowy */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
          📁 Wczytaj z pliku .txt...
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          type="button"
          onClick={handleDeduplicate}
          disabled={disabled || !text.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          🧹 Usuń powtórzenia słów
        </button>

        <button
          type="button"
          onClick={handleInsertPolishSample}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          🇵🇱 Dodaj polskie znaki
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || !text.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          ✕ Wyczyść pole
        </button>
      </div>

      {/* Pole edytora tekstowego */}
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={5}
        placeholder="Wpisz lub wklej słowa kluczowe (np. technologie, umiejętności, frazy z ogłoszenia o pracę)..."
        className="w-full text-sm p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono leading-relaxed resize-y bg-slate-50/50 focus:bg-white transition-all disabled:opacity-50"
      />
    </div>
  );
};
