
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center space-y-8 pt-6">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-25 rounded-full animate-pulse"></div>
        <div className="relative inline-flex items-center justify-center p-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] shadow-2xl border border-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      <div className="space-y-4">
        <h1 className="text-6xl font-black text-slate-950 tracking-tighter leading-none">
          ARABIC <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800">LEXICON</span> STUDIO
        </h1>
        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-bold leading-snug tracking-tight">
          High-Definition Extraction with Full <span className="text-slate-900 border-b-4 border-indigo-200">Tashkeel</span> & Parallel Translation.
        </p>
      </div>
    </header>
  );
};

export default Header;
