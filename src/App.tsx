import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { KeywordEditor } from './components/KeywordEditor';
import { ControlPanel } from './components/ControlPanel';
import { StatusBanner } from './components/StatusBanner';
import { DiffViewer } from './components/DiffViewer';
import { AtsTextViewer } from './components/AtsTextViewer';
import { PixelVisualDiff } from './components/PixelVisualDiff';
import { DownloadBar } from './components/DownloadBar';

import { injectInvisibleText, InjectionMethod } from './core/pdfEngine';
import { InjectionPosition } from './core/boundingBox';
import { extractTextAts } from './core/atsExtractor';
import { computeTextDiff, formatDiffReport, DiffResult } from './core/diffChecker';
import { verifyVisualPixels, VisualCheckResult } from './core/pixelChecker';

import { Search, Bot, Eye } from 'lucide-react';

export const App: React.FC = () => {
  // Stan pliku i tekstu
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [keywordsText, setKeywordsText] = useState<string>('');

  // Stan opcji
  const [method, setMethod] = useState<InjectionMethod>('render_mode_3');
  const [position, setPosition] = useState<InjectionPosition>('bottom_margin');
  const [pageTarget, setPageTarget] = useState<number | 'all'>(-1);
  const [fontSize, setFontSize] = useState<number>(1.0);

  // Stan przetwarzania i wyników
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Wybierz plik CV (PDF) i wprowadź słowa kluczowe przed uruchomieniem wstrzykiwania.'
  );

  const [activeTab, setActiveTab] = useState<'diff' | 'ats' | 'visual'>('diff');
  const [modifiedPdfBytes, setModifiedPdfBytes] = useState<Uint8Array | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [visualResult, setVisualResult] = useState<VisualCheckResult | null>(null);
  const [reportText, setReportText] = useState<string>('');

  const handleFileLoaded = (file: File, bytes: Uint8Array) => {
    setSelectedFile(file);
    setOriginalBytes(bytes);

    // Automatyczna propozycja nazwy wyjściowej
    const dotIdx = file.name.lastIndexOf('.');
    const baseName = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
    setOutputFileName(`${baseName}_ats.pdf`);

    setStatus('idle');
    setStatusMessage(`Wczytano plik: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Wpisz słowa kluczowe.`);
  };

  const handleExecute = async () => {
    if (!originalBytes || !selectedFile) {
      alert('Wybierz najpierw plik CV w formacie PDF!');
      return;
    }
    if (!keywordsText.trim()) {
      alert('Wprowadź słowa kluczowe przed wykonaniem wstrzykiwania.');
      return;
    }

    setIsProcessing(true);
    setStatus('idle');
    setStatusMessage('Trwa wstrzykiwanie tekstu, ekstrakcja ATS i weryfikacja pikselowa...');

    try {
      // 1. Wstrzyknięcie tekstu metodą render_mode_3 / white / underlay
      const injResult = await injectInvisibleText(originalBytes, keywordsText, {
        method,
        position,
        pageIndex: pageTarget,
        fontsize: fontSize,
      });

      // 2. Ekstrakcja tekstu ATS z obu wersji dokumentu (oryginał i po modyfikacji)
      const origAts = await extractTextAts(originalBytes);
      const modAts = await extractTextAts(injResult.modifiedPdfBytes);

      // 3. Wyliczenie różnic tekstu (unified diff i dodane unikalne słowa)
      const diffRes = computeTextDiff(origAts, modAts);

      // 4. Test pikselowy w 150 DPI (porównanie bitmap)
      const visualRes = await verifyVisualPixels(originalBytes, injResult.modifiedPdfBytes, 150);

      // 5. Wygenerowanie pełnego raportu tekstowego
      const report = formatDiffReport(diffRes, visualRes.visualCheckPassed);

      setModifiedPdfBytes(injResult.modifiedPdfBytes);
      setDiffResult(diffRes);
      setVisualResult(visualRes);
      setReportText(report);

      if (visualRes.visualCheckPassed) {
        setStatus('success');
        setStatusMessage(
          `✔ SUKCES: Tekst wstrzyknięty (${injResult.position}, ${injResult.appliedFontSize} pt). Plik w 100% niewidoczny dla oka ludzkiego! Dodano +${diffRes.addedWordsCount} nowych słów kluczowych.`
        );
      } else {
        setStatus('warning');
        setStatusMessage(
          `⚠ UWAGA: Wstrzyknięto tekst, ale wykryto ${visualRes.totalDiffPixels} zmienionych pikseli w 150 DPI. Sprawdź zakładkę 'Wizualny Podgląd'.`
        );
      }
    } catch (err: any) {
      console.error('Błąd operacji:', err);
      setStatus('error');
      setStatusMessage(`Wystąpił błąd: ${err?.message || String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOriginalBytes(null);
    setOutputFileName('');
    setKeywordsText('');
    setModifiedPdfBytes(null);
    setDiffResult(null);
    setVisualResult(null);
    setReportText('');
    setStatus('idle');
    setStatusMessage('Wybierz plik CV (PDF) i wprowadź słowa kluczowe.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Krok 1 & Krok 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Dropzone
            onFileLoaded={handleFileLoaded}
            selectedFile={selectedFile}
            outputFileName={outputFileName}
            onOutputFileNameChange={setOutputFileName}
            disabled={isProcessing}
          />

          <KeywordEditor
            text={keywordsText}
            onChange={setKeywordsText}
            disabled={isProcessing}
          />
        </div>

        {/* Krok 3: Opcje i Przycisk */}
        <ControlPanel
          method={method}
          onMethodChange={setMethod}
          position={position}
          onPositionChange={setPosition}
          pageTarget={pageTarget}
          onPageTargetChange={setPageTarget}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onExecute={handleExecute}
          isProcessing={isProcessing}
          canExecute={!!originalBytes && !!keywordsText.trim()}
        />

        {/* Krok 4: Wyniki i Zakładki */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">4</span>
            Wyniki weryfikacji i podgląd ATS
          </h2>

          <StatusBanner status={status} message={statusMessage} />

          {/* Zakładki */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-2" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'diff'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                Różnice (Diff tekstu)
                {diffResult && diffResult.addedWordsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                    +{diffResult.addedWordsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ats')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'ats'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bot className="w-4 h-4" />
                Co widzi parser ATS (Raw Text)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`py-2.5 px-4 text-xs font-bold rounded-t-lg border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'visual'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                Wizualny Podgląd (150 DPI)
              </button>
            </nav>
          </div>

          {/* Zawartość zakładek */}
          <div>
            {activeTab === 'diff' && (
              <DiffViewer
                diffText={diffResult?.diffText || ''}
                addedWords={diffResult?.addedWords || []}
              />
            )}

            {activeTab === 'ats' && (
              <AtsTextViewer fullText={diffResult?.modifiedFullText || ''} />
            )}

            {activeTab === 'visual' && (
              <PixelVisualDiff pageResults={visualResult?.pages || []} />
            )}
          </div>

          {/* Pasek pobierania pliku */}
          <DownloadBar
            modifiedPdfBytes={modifiedPdfBytes}
            outputFileName={outputFileName}
            reportText={reportText}
            onReset={handleReset}
          />
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 mt-auto">
        PDF Invisible Text Injector & ATS Checker • Architektura 100% Client-Side • Licencja MIT
      </footer>
    </div>
  );
};
