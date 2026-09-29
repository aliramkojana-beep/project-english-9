import React, { useState } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { VocabularySection } from './components/VocabularySection';
import { ConversationSection } from './components/ConversationSection';
import { GrammarSection } from './components/GrammarSection';
import { QuizSection } from './components/QuizSection';
import { VeoVideoGenerator } from './components/VeoVideoGenerator';
import { AiTutor } from './components/AiTutor';
import { ALL_LESSONS } from './data/lessonData';
import { LessonData } from './types';
import { Heart, GraduationCap } from 'lucide-react';

export default function App() {
  const [currentLesson, setCurrentLesson] = useState<LessonData>(ALL_LESSONS[0]);
  const [activeTab, setActiveTab] = useState<TabType>('vocab');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar with Lesson Selector */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLesson={currentLesson}
        onSelectLesson={setCurrentLesson}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeTab === 'vocab' && <VocabularySection lesson={currentLesson} />}
        {activeTab === 'conversation' && <ConversationSection lesson={currentLesson} />}
        {activeTab === 'grammar' && <GrammarSection lesson={currentLesson} />}
        {activeTab === 'quiz' && <QuizSection lesson={currentLesson} />}
        {activeTab === 'veo' && <VeoVideoGenerator lesson={currentLesson} />}
        {activeTab === 'tutor' && <AiTutor lesson={currentLesson} />}
      </main>

      {/* Lesson Summary & Footer */}
      <footer className="mt-16 bg-slate-900 border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Active Lesson Summary Card */}
          <div className="rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-800/80 to-purple-950/60 p-6 sm:p-8 border border-indigo-500/20 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">
                  جمع‌بندی درس {currentLesson.id}: {currentLesson.title} ({currentLesson.titleFarsi})
                </span>
                <h4 className="text-lg font-bold text-white">
                  کلمات و الگوهای کلیدی این درس:
                </h4>
              </div>
              <div className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1.5 rounded-full border border-emerald-500/30">
                Great job! See you next time! 🌟
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {currentLesson.summaryChips.map((item) => (
                <div
                  key={item.en}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span className="font-en font-bold text-indigo-300">{item.en}</span>
                  <span className="text-slate-400 text-[11px] font-normal">({item.fa})</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Requested Attribution Banner */}
          <div className="text-center py-4 border-t border-slate-800/80">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-800/90 to-pink-950/60 border border-purple-500/30 shadow-lg text-sm sm:text-base font-bold text-slate-200">
              <span>ساخته شده توسط</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-extrabold font-mono text-lg">
                arx
              </span>
              <span>با</span>
              <span className="text-rose-400 flex items-center gap-1">
                <span>عشق</span>
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              </span>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>آموزش زبان انگلیسی پایه نهم (Prospect 3) • شامل تمام ۶ درس کتاب درسی</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                مجهز به مدل ویدیویی <span className="font-mono text-indigo-300">Veo 3</span> و دستیار هوشمند <span className="font-mono text-purple-300">Gemini 3.8</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
