
import React, { useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onPasteText: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, onPasteText }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="group relative">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden border-4 border-dashed rounded-[3rem] p-16 transition-all duration-700
            flex flex-col items-center justify-center cursor-pointer
            ${isDragging 
              ? 'border-indigo-600 bg-indigo-50/50 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] scale-[1.02]' 
              : 'border-slate-200 bg-white hover:border-indigo-400 hover:shadow-2xl hover:bg-slate-50/30 shadow-sm'}
          `}
        >
          <input 
            type="file" 
            accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={handleFileInput}
          />
          
          <div className={`
            p-6 rounded-[1.5rem] mb-6 transition-all duration-500 shadow-inner
            ${isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}
          `}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">UPLOAD ARABIC PDF</h3>
            <p className="text-lg text-slate-500 font-bold tracking-tight">Drop your document here or click to browse</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center w-full max-w-xs">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">OR</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button 
          onClick={onPasteText}
          className="w-full max-w-lg bg-white border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 px-10 py-6 rounded-[2rem] flex items-center justify-center space-x-4 shadow-sm hover:shadow-xl transition-all duration-300 group/paste"
        >
          <div className="p-3 bg-slate-50 rounded-xl group-hover/paste:bg-indigo-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover/paste:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-slate-950 group-hover/paste:text-indigo-600 transition-colors uppercase tracking-widest leading-none mb-1">Paste from Clipboard</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Instant text analysis with full Tashkeel</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
