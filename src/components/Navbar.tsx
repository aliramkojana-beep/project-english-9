import React from 'react';
import { BookOpen, Sparkles, Volume2, Video, Brain, MessageSquare, CheckCircle, GraduationCap, ChevronDown } from 'lucide-react';
import { ALL_LESSONS } from '../data/lessonData';
import { LessonData } from '../types';

export type TabType = 'vocab' | 'conversation' | 'grammar' | 'quiz' | 'veo' | 'tutor';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentLesson: LessonData;
  onSelectLesson: (lesson: LessonData) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentLesson,
  onSelectLesson,
}) => {
  const tabs = [
    { id: 'vocab' as TabType, label: 'واژگان و تلفظ', icon: BookOpen },
    { id: 'conversation' as TabType, label: 'مکالمه کتاب', icon: MessageSquare },
    { id: 'grammar' as TabType, label: 'نکات گرامری', icon: Brain },
    { id: 'quiz' as TabType, label: 'آزمون و تمرین', icon: CheckCircle },
    { id: 'veo' as TabType, label: 'ویدیو ساز Veo 3', icon: Video, badge: 'AI' },
    { id: 'tutor' as TabType, label: 'معلم هوشمند AI', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Lesson Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Prospect 3 • پایه نهم
                </span>
              </div>

              {/* Lesson Picker Dropdown */}
              <div className="relative group">
                <select
                  value={currentLesson.id}
                  onChange={(e) => {
                    const found = ALL_LESSONS.find((l) => l.id === Number(e.target.value));
                    if (found) onSelectLesson(found);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm sm:text-base py-1 px-3 pr-8 rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none transition-all shadow-inner"
                >
                  {ALL_LESSONS.map((lesson) => (
                    <option key={lesson.id} value={lesson.id} className="bg-slate-900 text-white">
                      درس {lesson.id}: {lesson.title} ({lesson.titleFarsi})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded-md animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lesson Quick Selector Bar (Pills for fast switching across all 6 lessons) */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs">
          <span className="text-slate-500 text-[11px] shrink-0 font-medium">سرفصل‌ها:</span>
          {ALL_LESSONS.map((lesson) => {
            const isCurrent = lesson.id === currentLesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                <span>{lesson.icon}</span>
                <span>درس {lesson.id}: {lesson.title}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/70 text-slate-300 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] bg-purple-500 text-white px-1 py-0.2 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
