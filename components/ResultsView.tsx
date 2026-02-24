import React, { useState } from 'react';
import { TranslatedSegment, SegmentType } from '../types';

interface ResultsViewProps {
  segments: TranslatedSegment[];
  fileName: string;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ segments, fileName, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // 1. Generate Plain Text / TSV (Tab-Separated Values)
    const tsvHeader = "English\tFilipino (Tagalog)\tArabic Text\n";
    const tsvRows = segments.map(s => {
      let englishCol = s.english;
      if (s.teachingScript) englishCol += `\n[GUIDE]: ${s.teachingScript}`;
      if (s.exerciseAnswers) {
        s.exerciseAnswers.forEach((ans, i) => {
          englishCol += `\n[ANSWER ${i+1}]: ${ans.english}`;
        });
      }

      let filipinoCol = s.filipino;
      if (s.teachingScriptFilipino) filipinoCol += `\n[GABAY]: ${s.teachingScriptFilipino}`;
      if (s.exerciseAnswers) {
        s.exerciseAnswers.forEach((ans, i) => {
          filipinoCol += `\n[SAGOT ${i+1}]: ${ans.filipino}`;
        });
      }
      
      let arabicCol = s.arabic;
      if (s.teachingScriptArabic) arabicCol += `\n[GUIDE]: ${s.teachingScriptArabic}`;
      if (s.exerciseAnswers) {
        s.exerciseAnswers.forEach((ans, i) => {
          arabicCol += `\n[الإجابة ${i+1}]: ${ans.arabic}`;
        });
      }
      
      const clean = (str: string) => str.replace(/\t/g, " ").replace(/\n/g, " ");
      return `${clean(englishCol)}\t${clean(filipinoCol)}\t${clean(arabicCol)}`;
    }).join('\n');
    const plainText = tsvHeader + tsvRows;

    // 2. Generate HTML Table
    const htmlTable = `
      <table border="1" style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
        <thead>
          <tr style="background-color: #0f172a; color: white;">
            <th style="padding: 12px; text-align: left;">English & Guidance</th>
            <th style="padding: 12px; text-align: left;">Filipino (Tagalog)</th>
            <th style="padding: 12px; text-align: right;">Arabic Text & Explanations</th>
          </tr>
        </thead>
        <tbody>
          ${segments.map(s => `
            <tr>
              <td style="padding: 12px; vertical-align: top; border: 1px solid #e2e8f0;">
                <div style="font-weight: bold; margin-bottom: 8px;">${s.english}</div>
                ${s.teachingScript ? `<div style="color: #059669; font-style: italic; font-size: 0.9em; margin-top: 8px;">Guide: ${s.teachingScript}</div>` : ''}
                ${s.exerciseAnswers ? s.exerciseAnswers.map((ans, i) => `<div style="color: #1e40af; font-size: 0.8em; margin-top: 4px;">Ans ${i+1}: ${ans.english}</div>`).join('') : ''}
              </td>
              <td style="padding: 12px; vertical-align: top; border: 1px solid #e2e8f0;">
                <div style="font-weight: bold; margin-bottom: 8px; color: #b91c1c;">${s.filipino}</div>
                ${s.teachingScriptFilipino ? `<div style="color: #059669; font-style: italic; font-size: 0.9em; margin-top: 8px;">Gabay: ${s.teachingScriptFilipino}</div>` : ''}
                ${s.exerciseAnswers ? s.exerciseAnswers.map((ans, i) => `<div style="color: #991b1b; font-size: 0.8em; margin-top: 4px;">Sagot ${i+1}: ${ans.filipino}</div>`).join('') : ''}
              </td>
              <td dir="rtl" style="padding: 12px; vertical-align: top; text-align: right; border: 1px solid #e2e8f0; font-size: 1.2em;">
                <div style="font-weight: bold; margin-bottom: 8px;">${s.arabic}</div>
                ${s.teachingScriptArabic ? `<div style="color: #065f46; font-size: 0.85em; margin-top: 8px; background: #f0fdf4; padding: 4px;">${s.teachingScriptArabic}</div>` : ''}
                ${s.exerciseAnswers ? s.exerciseAnswers.map((ans, i) => `<div style="color: #713f12; font-size: 0.9em; margin-top: 4px; background: #fefce8; padding: 4px;">${ans.arabic}</div>`).join('') : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    try {
      const typeHtml = 'text/html';
      const typeText = 'text/plain';
      const blobHtml = new Blob([htmlTable], { type: typeHtml });
      const blobText = new Blob([plainText], { type: typeText });
      const data = [new ClipboardItem({ [typeHtml]: blobHtml, [typeText]: blobText })];
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const fullText = segments.map(s => {
      let text = `[${s.type}] Arabic: ${s.arabic}\nEnglish: ${s.english}\nFilipino: ${s.filipino}`;
      if (s.teachingScript) text += `\nTeaching Guide (EN): ${s.teachingScript}`;
      if (s.teachingScriptFilipino) text += `\nTeaching Guide (PH): ${s.teachingScriptFilipino}`;
      if (s.teachingScriptArabic) text += `\nTeaching Guide (AR): ${s.teachingScriptArabic}`;
      if (s.exerciseAnswers) {
        s.exerciseAnswers.forEach((ans, i) => {
          text += `\nAnswer ${i+1} (AR): ${ans.arabic}\nAnswer ${i+1} (EN): ${ans.english}\nAnswer ${i+1} (PH): ${ans.filipino}`;
        });
      }
      return text;
    }).join('\n\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace('.pdf', '')}_comprehensive_lesson.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSegmentStyles = (type: SegmentType) => {
    const styles = {
      english: "text-slate-600 font-normal",
      filipino: "text-rose-700 font-medium",
      arabic: "arabic-text leading-[2.2] font-normal"
    };

    if (['TITLE', 'HEADING', 'WORD'].includes(type)) {
      styles.english = "text-slate-950 font-black uppercase tracking-tight";
      styles.filipino = "text-rose-950 font-black uppercase tracking-tight";
      styles.arabic = "arabic-text text-slate-950 font-black leading-[2.0]";
    }

    if (type === 'DEFINITION') {
      styles.english = "text-blue-600 font-medium";
      styles.filipino = "text-rose-600 font-medium";
      styles.arabic = "arabic-text text-blue-700 font-medium leading-[2.2]";
    } else if (type === 'EXAMPLE') {
      styles.english = "text-orange-600 font-medium italic";
      styles.filipino = "text-rose-600 font-medium italic";
      styles.arabic = "arabic-text text-orange-600 font-medium leading-[2.2]";
    } else if (type === 'EXERCISE') {
      styles.english = "text-amber-700 font-bold underline decoration-amber-300 decoration-4 underline-offset-4";
      styles.filipino = "text-rose-800 font-bold underline decoration-rose-200 decoration-4 underline-offset-4";
      styles.arabic = "arabic-text text-amber-900 font-bold leading-[2.2]";
    } else if (type === 'NUMBER') {
      styles.english = "text-violet-600 font-bold";
      styles.filipino = "text-rose-600 font-bold";
      styles.arabic = "arabic-text text-violet-700 font-bold leading-[2.2]";
    } else if (type === 'TEXT') {
      styles.english = "text-slate-500 font-normal";
      styles.filipino = "text-rose-500 font-normal";
      styles.arabic = "arabic-text text-slate-800 font-normal leading-[2.2]";
    }

    if (type === 'TITLE') {
      styles.english += " text-3xl";
      styles.filipino += " text-2xl";
      styles.arabic += " text-5xl";
    } else if (type === 'HEADING' || type === 'WORD') {
      styles.english += " text-xl";
      styles.filipino += " text-lg";
      styles.arabic += " text-4xl";
    } else {
      styles.english += " text-lg";
      styles.filipino += " text-base";
      styles.arabic += " text-3xl";
    }

    return styles;
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in zoom-in-95 duration-700">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white border-2 border-slate-100 px-8 py-6 rounded-[2.5rem] shadow-xl gap-6">
        <div className="flex items-center space-x-6 truncate w-full lg:w-auto">
          <div className="p-4 bg-indigo-600 rounded-[1.5rem] shrink-0 shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="truncate">
            <h2 className="text-xl font-black text-slate-950 truncate tracking-tight uppercase leading-none mb-1">
              {fileName}
            </h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Trilingual Analysis Profile</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <button onClick={onReset} className="px-6 py-3 text-sm font-black text-slate-500 hover:text-slate-900 transition-all rounded-2xl hover:bg-slate-50 uppercase tracking-widest">
            Clear
          </button>
          <button onClick={handleDownload} className="p-4 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-all rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button 
            onClick={handleCopy}
            className={`flex-1 lg:flex-none flex items-center justify-center space-x-3 px-10 py-4 rounded-2xl text-sm font-black transition-all duration-300 uppercase tracking-[0.15em]
              ${copied ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}
          >
            <span>{copied ? 'Copied as Table' : 'Copy All (Table)'}</span>
          </button>
        </div>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center gap-8 px-8 py-2">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-blue-600 rounded-md"></div>
          <span className="text-xs font-black uppercase text-blue-600 tracking-widest">Definitions</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-rose-600 rounded-md"></div>
          <span className="text-xs font-black uppercase text-rose-600 tracking-widest">Filipino / Tagalog</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-orange-500 rounded-md"></div>
          <span className="text-xs font-black uppercase text-orange-500 tracking-widest">Examples</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-amber-500 rounded-md"></div>
          <span className="text-xs font-black uppercase text-amber-500 tracking-widest">Exercises</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-emerald-600 rounded-md"></div>
          <span className="text-xs font-black uppercase text-emerald-600 tracking-widest">Guidance</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[3.5rem] bg-white shadow-2xl border-2 border-slate-100 group">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-white">
                <th className="px-12 py-10 text-left text-sm font-black uppercase tracking-[0.4em] w-1/2 border-r border-white/10">Translations & Guidance</th>
                <th className="px-12 py-10 text-right text-sm font-black uppercase tracking-[0.4em] w-1/2">النص العربي والحلول</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {segments.map((segment, idx) => {
                const styles = getSegmentStyles(segment.type);
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/40 transition-colors group/row">
                    <td className="px-12 py-12 align-top text-left border-r-2 border-slate-50">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            {segment.type === 'NUMBER' && (
                              <span className="shrink-0 p-1.5 bg-violet-100 text-violet-600 rounded-lg text-xs font-black">#</span>
                            )}
                            <div className={`${styles.english} leading-relaxed`}>
                              {segment.english}
                            </div>
                          </div>
                          {/* Filipino Translation Display */}
                          <div className={`${styles.filipino} leading-relaxed border-l-2 border-rose-100 pl-4`}>
                            {segment.filipino}
                          </div>
                        </div>
                        
                        {/* Teaching Script (Green) */}
                        {(segment.teachingScript || segment.teachingScriptFilipino) && (
                          <div className="mt-6 p-7 bg-emerald-50/50 rounded-[2rem] border-2 border-emerald-100/50 flex flex-col space-y-6 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 bg-emerald-600 rounded-lg text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.394 2.827a1 1 0 00-.788 0l-7 3a1 1 0 000 1.846l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.846l-7-3z" />
                                  <path d="M3 10.746v3.347a1 1 0 00.448.832l4 2.667a1 1 0 001.104 0l4-2.667a1 1 0 00.448-.832V10.746l-4 1.714a1 1 0 01-.788 0l-4-1.714z" />
                                </svg>
                              </span>
                              <p className="text-xs font-black text-emerald-800 uppercase tracking-[0.2em] opacity-80">Teacher's Insight</p>
                            </div>
                            {segment.teachingScript && (
                              <p className="text-lg font-bold text-emerald-900 leading-relaxed italic border-l-4 border-emerald-300 pl-6 py-2">
                                {segment.teachingScript}
                              </p>
                            )}
                            {segment.teachingScriptFilipino && (
                              <p className="text-lg font-bold text-rose-800 leading-relaxed italic border-l-4 border-rose-300 pl-6 py-2">
                                {segment.teachingScriptFilipino}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Exercise Answers (Yellow) */}
                        {segment.exerciseAnswers && segment.exerciseAnswers.length > 0 && (
                          <div className="mt-6 p-7 bg-yellow-50/50 rounded-[2rem] border-2 border-yellow-200/50 flex flex-col space-y-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 bg-yellow-600 rounded-lg text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                              </span>
                              <p className="text-xs font-black text-yellow-800 uppercase tracking-[0.2em] opacity-80">Proposed Answers (Tagalog Enabled)</p>
                            </div>
                            <div className="space-y-4 divide-y divide-yellow-200/50">
                              {segment.exerciseAnswers.map((ans, i) => (
                                <div key={i} className="pt-4 first:pt-0 flex flex-col space-y-3">
                                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1">
                                      <span className="text-[10px] font-black text-yellow-700 uppercase mb-1 block">Solution {i+1}</span>
                                      <p className="text-sm font-bold text-yellow-900">{ans.english}</p>
                                      <p className="text-xs font-bold text-rose-800 italic mt-1">{ans.filipino}</p>
                                    </div>
                                    <div dir="rtl" className="arabic-text text-xl font-bold text-yellow-900 bg-white/60 px-4 py-2 rounded-xl shadow-sm border border-yellow-100">
                                      {ans.arabic}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-12 py-12 align-top text-right bg-slate-50/10 group-hover/row:bg-transparent">
                      <div dir="rtl" className={styles.arabic}>
                        {segment.arabic}
                      </div>
                      {segment.teachingScriptArabic && (
                        <div className="mt-6 p-7 bg-emerald-50/50 rounded-[2rem] border-2 border-emerald-100/50 flex flex-col space-y-4 shadow-sm">
                          <div className="flex items-center justify-end gap-2">
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-[0.2em] opacity-80">رؤية المعلم</p>
                            <span className="p-1.5 bg-emerald-600 rounded-lg text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.394 2.827a1 1 0 00-.788 0l-7 3a1 1 0 000 1.846l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.846l-7-3z" />
                                <path d="M3 10.746v3.347a1 1 0 00.448.832l4 2.667a1 1 0 001.104 0l4-2.667a1 1 0 00.448-.832V10.746l-4 1.714a1 1 0 01-.788 0l-4-1.714z" />
                              </svg>
                            </span>
                          </div>
                          <div dir="rtl" className="arabic-text text-2xl font-bold text-emerald-900 leading-[2.2] bg-white/80 p-6 rounded-2xl shadow-sm border border-emerald-100">
                            {segment.teachingScriptArabic}
                          </div>
                        </div>
                      )}
                      {segment.type === 'NUMBER' && (
                        <div className="mt-2 text-[10px] font-black text-violet-400 uppercase tracking-widest">
                          Numerical Pronunciation
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-900 border-t border-white/10 px-12 py-6 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Pedagogical Studio v8.0 • Tagalog Translation Engine Active</span>
          <div className="flex gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse delay-75"></span>
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse delay-100"></span>
            <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse delay-150"></span>
            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse delay-200"></span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse delay-300"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
