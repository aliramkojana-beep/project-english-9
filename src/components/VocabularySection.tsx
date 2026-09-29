import React, { useState } from 'react';
import { Volume2, Sparkles, Search, Layers, RotateCcw } from 'lucide-react';
import { VocabularyItem, LessonData } from '../types';
import { speakEnglish } from '../utils/audio';

interface VocabularySectionProps {
  lesson: LessonData;
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({ lesson }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'positive' | 'neutral' | 'challenging'>('all');
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);

  const filteredWords = lesson.vocabulary.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farsi.includes(searchQuery) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSpeak = (text: string, id: string, rate = 0.85) => {
    setSpeakingWordId(id);
    speakEnglish(text, rate);
    setTimeout(() => {
      setSpeakingWordId(null);
    }, 2200);
  };

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev + 1) % lesson.vocabulary.length);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setCurrentFlashcardIndex((prev) => (prev - 1 + lesson.vocabulary.length) % lesson.vocabulary.length);
  };

  const currentCard = lesson.vocabulary[currentFlashcardIndex] || lesson.vocabulary[0];

  return (
    <section className="space-y-8 py-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-800/80 to-purple-900/60 p-6 sm:p-8 border border-indigo-500/20 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>گنجینه واژگان درس {lesson.id} ({lesson.title} - {lesson.titleFarsi})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            کلمات کلیدی {lesson.titleFarsi} ({lesson.title})
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {lesson.description}
          </p>
        </div>

        {/* View Toggle */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-700/60 pt-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlashcardMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                !flashcardMode
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>نمای شبکه‌ای کارت‌ها</span>
            </button>
            <button
              onClick={() => {
                setFlashcardMode(true);
                setIsFlipped(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                flashcardMode
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>جعبه فلش‌کارت تمرینی</span>
            </button>
          </div>

          {!flashcardMode && (
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="جستجوی کلمه یا معنی..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 text-sm text-white placeholder-slate-400 pr-9 pl-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: Flashcard Mode */}
      {flashcardMode && currentCard ? (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-sm text-slate-400 px-2">
            <span>کارت {currentFlashcardIndex + 1} از {lesson.vocabulary.length}</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full">
              برای دیدن پاسخ روی کارت کلیک کنید
            </span>
          </div>

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[340px] rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700 p-8 shadow-2xl transition-all duration-300 hover:border-indigo-500/50 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-4xl">{currentCard.emoji}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                درس {lesson.id}
              </span>
            </div>

            {!isFlipped ? (
              <div className="text-center space-y-4 my-8">
                <h3 className="text-4xl font-black text-white tracking-wide font-en">
                  {currentCard.word}
                </h3>
                <p className="text-indigo-400 text-sm font-mono font-en">
                  {currentCard.phonetic}
                </p>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  {currentCard.definition}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-5 my-6 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-xs text-indigo-400 font-medium">معنی دقیق فارسی:</span>
                  <h4 className="text-3xl font-extrabold text-amber-300">
                    {currentCard.farsi}
                  </h4>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-right">
                  <div className="text-xs text-slate-400 font-en flex items-center justify-between">
                    <span className="text-indigo-300">مثال کتاب نهم:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(currentCard.exampleEn, `ex-${currentCard.id}`);
                      }}
                      className="text-xs text-indigo-400 hover:text-white flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>پخش صوتی</span>
                    </button>
                  </div>
                  <p className="text-sm font-en text-slate-200">
                    "{currentCard.exampleEn}"
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentCard.exampleFa}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-700/60 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.word, currentCard.id);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>تلفظ صوتی کلمه</span>
              </button>
              <span className="text-xs text-slate-500">
                {isFlipped ? 'کلیک برای بازگشت' : 'کلیک برای نمایش معنی'}
              </span>
            </div>
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevFlashcard}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all border border-slate-700"
            >
              کارت قبلی
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="py-3 px-5 rounded-2xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 font-medium text-sm transition-all border border-purple-500/40"
            >
              چرخش کارت
            </button>
            <button
              onClick={handleNextFlashcard}
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              کارت بعدی
            </button>
          </div>
        </div>
      ) : (
        /* Mode 2: Grid Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWords.map((item) => {
            const isPlaying = speakingWordId === item.id;
            return (
              <div
                key={item.id}
                className="group relative rounded-3xl bg-slate-800/70 border border-slate-700/70 p-6 shadow-xl hover:shadow-2xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900/90 flex items-center justify-center text-2xl border border-slate-700 group-hover:scale-110 transition-transform">
                        {item.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors font-en">
                          {item.word}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono font-en">
                          {item.phonetic}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        title="پخش با سرعت معمولی"
                        onClick={() => handleSpeak(item.word, item.id, 0.9)}
                        className={`p-2 rounded-xl transition-all ${
                          isPlaying
                            ? 'bg-indigo-600 text-white animate-bounce'
                            : 'bg-slate-900 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-slate-700'
                        }`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        title="پخش با سرعت آهسته (برای یادگیری)"
                        onClick={() => handleSpeak(item.word, `${item.id}-slow`, 0.65)}
                        className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:bg-purple-600 hover:text-white border border-slate-700 transition-all text-[11px] font-bold"
                      >
                        0.7x
                      </button>
                    </div>
                  </div>

                  {/* Farsi Meaning */}
                  <div className="mb-4">
                    <span className="text-xs text-indigo-300 font-medium block mb-1">
                      معنی درس {lesson.id}:
                    </span>
                    <p className="text-base font-bold text-amber-300">
                      {item.farsi}
                    </p>
                  </div>

                  {/* English Definition */}
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {item.definition}
                  </p>
                </div>

                {/* Example Sentence Box */}
                <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-indigo-400 font-medium">جمله نمونه:</span>
                    <button
                      onClick={() => handleSpeak(item.exampleEn, `ex-${item.id}`)}
                      className="hover:text-white flex items-center gap-1 text-[10px] text-slate-400"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>پخش جمله</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-200 font-en leading-relaxed">
                    "{item.exampleEn}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.exampleFa}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
