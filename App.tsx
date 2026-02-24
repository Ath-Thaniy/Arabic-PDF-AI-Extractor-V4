
import React, { useState, useEffect, useRef } from 'react';
import { AppStatus, TranslatedSegment } from './types';
import { extractAndTranslateArabicPdf, processArabicText } from './services/geminiService';
import FileUploader from './components/FileUploader';
import ResultsView from './components/ResultsView';
import Header from './components/Header';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [segments, setSegments] = useState<TranslatedSegment[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  const progressInterval = useRef<number | null>(null);

  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) window.clearInterval(progressInterval.current);
    
    progressInterval.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + Math.random() * 2; // Fast start
        if (prev < 70) return prev + Math.random() * 0.5; // Steady middle
        if (prev < 95) return prev + Math.random() * 0.1; // Slow finish
        return prev;
      });
    }, 150);
  };

  const completeProgress = () => {
    if (progressInterval.current) window.clearInterval(progressInterval.current);
    setProgress(100);
  };

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    setError(null);
    setCurrentFileName(file.name);
    setStatus(AppStatus.PROCESSING);
    startProgress();

    try {
      const data = await extractAndTranslateArabicPdf(file);
      completeProgress();
      setTimeout(() => {
        setSegments(data);
        setStatus(AppStatus.SUCCESS);
      }, 500);
    } catch (err: any) {
      if (progressInterval.current) window.clearInterval(progressInterval.current);
      console.error(err);
      setError(err.message || 'An unexpected error occurred during processing.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim().length === 0) {
        setError("Clipboard is empty. Please copy some Arabic text first.");
        return;
      }

      setError(null);
      setCurrentFileName('Clipboard Content');
      setStatus(AppStatus.PROCESSING);
      startProgress();

      const data = await processArabicText(text);
      completeProgress();
      setTimeout(() => {
        setSegments(data);
        setStatus(AppStatus.SUCCESS);
      }, 500);
    } catch (err: any) {
      if (progressInterval.current) window.clearInterval(progressInterval.current);
      console.error(err);
      setError(err.message || 'Failed to read clipboard or process text.');
      setStatus(AppStatus.ERROR);
    }
  };

  const resetApp = () => {
    setStatus(AppStatus.IDLE);
    setSegments([]);
    setCurrentFileName('');
    setError(null);
    setProgress(0);
  };

  const getLoadingLabel = (p: number) => {
    if (p < 20) return "INITIALIZING ENGINE";
    if (p < 40) return "SCANNING INPUT TEXT";
    if (p < 60) return "APPLYING TASHKEEL";
    if (p < 85) return "GENERATING TRANSLATIONS";
    return "FINALIZING DOCUMENT";
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-white to-blue-100/50 py-16 px-6 md:px-12 max-w-[90rem] mx-auto selection:bg-indigo-600 selection:text-white">
      <Header />

      <main className="w-full mt-20 relative">
        {status === AppStatus.IDLE || status === AppStatus.ERROR ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-both">
            {error && (
              <div className="bg-rose-600 border-l-[12px] border-rose-900 p-8 rounded-[2rem] shadow-2xl max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform">
                <div className="flex items-center space-x-4 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-white text-xl font-black uppercase tracking-widest">Processing Fault</p>
                </div>
                <p className="text-rose-100 text-lg font-bold pl-12">{error}</p>
              </div>
            )}
            <FileUploader onFileSelect={handleFileSelect} onPasteText={handlePasteText} />
          </div>
        ) : null}

        {status === AppStatus.PROCESSING && (
          <div className="flex flex-col items-center justify-center p-20 lg:p-32 bg-white rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-slate-100 max-w-4xl mx-auto animate-in fade-in zoom-in-95">
            <div className="w-full space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4 border border-indigo-100 animate-pulse">
                  System in Progress
                </div>
                <h2 className="text-5xl font-black text-slate-950 tracking-tighter uppercase leading-none">
                  {Math.round(progress)}%
                </h2>
                <p className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">
                  {getLoadingLabel(progress)}
                </p>
              </div>

              {/* High-Fidelity Progress Bar */}
              <div className="relative w-full">
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 shadow-inner border border-slate-200">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-[progress_1s_linear_infinite]"></div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full opacity-50 -z-10"></div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Analyzing: {currentFileName}
                </span>
                <span>Powered by Gemini 3 Pro</span>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.SUCCESS && (
          <ResultsView 
            segments={segments} 
            fileName={currentFileName} 
            onReset={resetApp} 
          />
        )}
      </main>

      <footer className="mt-auto pt-24 text-center space-y-3 opacity-40 hover:opacity-100 transition-all duration-500">
        <p className="text-xs font-black text-slate-900 uppercase tracking-[0.5em]">
          Engineered by Gemini 3 Pro • Ultimate Arabic OCR
        </p>
        <div className="flex justify-center items-center space-x-4">
          <span className="h-px w-12 bg-slate-200"></span>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] italic">Precision in every vowel stroke.</p>
          <span className="h-px w-12 bg-slate-200"></span>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          from { background-position: 0 0; }
          to { background-position: 2rem 0; }
        }
      `}} />
    </div>
  );
};

export default App;
