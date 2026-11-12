import React, { useState } from 'react';
import { UploadCloud, FileCheck, RefreshCw } from 'lucide-react';

interface DropzoneProps {
  onFileLoaded: (file: File, bytes: Uint8Array) => void;
  selectedFile: File | null;
  outputFileName: string;
  onOutputFileNameChange: (name: string) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileLoaded,
  selectedFile,
  outputFileName,
  onOutputFileNameChange,
  disabled,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Wybierz poprawny plik w formacie PDF (.pdf).');
      return;
    }
    const buffer = await file.arrayBuffer();
    onFileLoaded(file, new Uint8Array(buffer));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Zresetuj wartość, aby ponowne wybranie tego samego pliku również wyzwoliło zdarzenie
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
        Pliki PDF
      </h2>

      {!selectedFile ? (
        <label
          htmlFor={disabled ? undefined : 'main-pdf-upload'}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        >
          <input
            id="main-pdf-upload"
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={handleInputChange}
            disabled={disabled}
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-blue-100/70 text-blue-600 rounded-full">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Przeciągnij i upuść oryginalny plik CV (PDF) tutaj
              </p>
              <p className="text-xs text-slate-500 mt-1">lub kliknij, aby wybrać dokument z dysku</p>
            </div>
          </div>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  Rozmiar: {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <label
              htmlFor={disabled ? undefined : 'change-pdf-upload'}
              className={`text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Zmień plik
              <input
                id="change-pdf-upload"
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={handleInputChange}
                disabled={disabled}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nazwa wyjściowego pliku PDF:
            </label>
            <input
              type="text"
              value={outputFileName}
              onChange={(e) => onOutputFileNameChange(e.target.value)}
              disabled={disabled}
              className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              placeholder="moje_cv_ats.pdf"
            />
          </div>
        </div>
      )}
    </div>
  );
};
