import React from 'react';
import { Brain, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { LessonData } from '../types';
import { speakEnglish } from '../utils/audio';

interface GrammarSectionProps {
  lesson: LessonData;
}

export const GrammarSection: React.FC<GrammarSectionProps> = ({ lesson }) => {
  const g = lesson.grammar;

  return (
    <section className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/60 via-slate-800/80 to-indigo-900/60 p-6 sm:p-8 border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5" />
            <span>دستور زبان درس {lesson.id} ({g.ruleName})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {g.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {g.explanation}
          </p>
        </div>
      </div>

      {/* Comparison & Concept Cards */}
      <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">
            الگوهای سؤالی و تفاوت‌های کاربردی در آزمون‌های پایه نهم
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {g.comparisonCards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-indigo-950/70 border border-indigo-500/40 p-5 space-y-3 relative overflow-hidden shadow-lg"
            >
              <div className="text-xs font-bold text-indigo-400 px-2.5 py-1 rounded-md bg-indigo-900/60 inline-block">
                {card.title}
              </div>
              <h4 className="text-lg font-extrabold text-white font-en">
                {card.enQuestion}
              </h4>
              <p className="text-xs font-bold text-amber-300">
                «{card.faQuestion}»
              </p>
              <div className="border-t border-indigo-900/80 pt-3 text-xs text-slate-300 space-y-1">
                <span className="text-indigo-300 font-medium">پاسخ نمونه:</span>
                <p className="font-en text-sm font-semibold text-white">
                  {card.enAnswer}
                </p>
                <p className="text-[11px] text-slate-400">{card.faAnswer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grammar Formula Matrix */}
      <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">
            فرمول‌های ساختاری درس {lesson.id}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {g.formulas.map((item, idx) => (
            <div key={idx} className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">{item.type}</span>
                <button
                  onClick={() => speakEnglish(item.en)}
                  className="text-xs text-indigo-400 hover:text-white flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>پخش</span>
                </button>
              </div>
              <p className="text-base font-bold text-white font-en leading-relaxed">{item.en}</p>
              <p className="text-xs text-slate-400">{item.fa}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
