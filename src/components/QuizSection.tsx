import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Award, Sparkles, Volume2, ArrowLeft } from 'lucide-react';
import { LessonData } from '../types';
import { speakEnglish } from '../utils/audio';

interface QuizSectionProps {
  lesson: LessonData;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ lesson }) => {
  const [activeTab, setActiveTab] = useState<'mcq' | 'scramble'>('mcq');

  // MCQ State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Scramble State
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [scrambleResult, setScrambleResult] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Reset when lesson changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
    setScrambleIndex(0);
    setSelectedWords([]);
    setScrambleResult('idle');
  }, [lesson.id]);

  const questions = lesson.quizQuestions;
  const currentQ = questions[currentQuestionIndex] || questions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswerChecked) return;
    setIsAnswerChecked(true);
    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  // Scramble handlers
  const builders = lesson.sentenceBuilders;
  const currentScramble = builders[scrambleIndex] || builders[0];

  const handleAddWord = (word: string) => {
    if (scrambleResult === 'correct') return;
    setSelectedWords((prev) => [...prev, word]);
    setScrambleResult('idle');
  };

  const handleRemoveWord = (index: number) => {
    if (scrambleResult === 'correct') return;
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    setScrambleResult('idle');
  };

  const handleVerifyScramble = () => {
    if (!currentScramble) return;
    const isCorrect =
      selectedWords.length === currentScramble.correctOrder.length &&
      selectedWords.every((w, i) => w === currentScramble.correctOrder[i]);

    if (isCorrect) {
      setScrambleResult('correct');
      speakEnglish(currentScramble.correctOrder.join(' '));
    } else {
      setScrambleResult('wrong');
    }
  };

  const handleNextScramble = () => {
    setSelectedWords([]);
    setScrambleResult('idle');
    setScrambleIndex((prev) => (prev + 1) % builders.length);
  };

  return (
    <section className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/60 via-slate-800/80 to-teal-900/60 p-6 sm:p-8 border border-emerald-500/20 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>ارزیابی یادگیری درس {lesson.id}: {lesson.title}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              تمرین و آزمون آنلاین {lesson.titleFarsi}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              با پاسخگویی به تست‌های گزینش‌شده کتاب و جمله‌سازی، آمادگی خود را در درس {lesson.id} بسنجید.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80">
            <button
              onClick={() => setActiveTab('mcq')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'mcq'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تست چهارگزینه‌ای ({questions.length})
            </button>
            {builders.length > 0 && (
              <button
                onClick={() => setActiveTab('scramble')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'scramble'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                مرتب‌سازی جمله
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode 1: MCQ Quiz */}
      {activeTab === 'mcq' && currentQ ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {!quizFinished ? (
            <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/60 pb-4">
                <span>
                  سؤال {currentQuestionIndex + 1} از {questions.length} (درس {lesson.id})
                </span>
                <span className="font-bold text-emerald-400">
                  امتیاز: {score} از {currentQuestionIndex}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white font-en tracking-wide leading-relaxed">
                    {currentQ.question}
                  </h3>
                  <button
                    onClick={() => speakEnglish(currentQ.question)}
                    className="p-2 rounded-xl bg-slate-900 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-slate-700 transition-all shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {currentQ.questionFarsi && (
                  <p className="text-xs sm:text-sm text-slate-400">
                    {currentQ.questionFarsi}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let optionStyle = 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-slate-500';
                  if (isSelected && !isAnswerChecked) {
                    optionStyle = 'bg-indigo-950/80 border-indigo-400 text-white ring-2 ring-indigo-500/30';
                  } else if (isAnswerChecked) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/40';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-950/80 border-rose-400 text-rose-100 ring-2 ring-rose-500/40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerChecked}
                      className={`w-full text-right p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-en text-base font-medium">
                          {option}
                        </span>
                      </div>
                      {isAnswerChecked && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerChecked && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswerChecked && (
                <div className="rounded-2xl bg-indigo-950/50 border border-indigo-500/30 p-4 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>پاسخ تشریحی:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              <div className="border-t border-slate-700/60 pt-4 flex items-center justify-between">
                {!isAnswerChecked ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={selectedOption === null}
                    className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg ${
                      selectedOption !== null
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    بررسی پاسخ
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg flex items-center gap-2"
                  >
                    <span>{currentQuestionIndex + 1 < questions.length ? 'سؤال بعدی' : 'مشاهده کارنامه'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-8 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-4xl border border-emerald-500/30">
                🎉
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">
                  آزمون درس {lesson.id} با موفقیت به پایان رسید!
                </h3>
                <p className="text-slate-300 text-sm">
                  نتیجه آزمون {lesson.titleFarsi} ({lesson.title}):
                </p>
              </div>

              <div className="max-w-xs mx-auto bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-2">
                <span className="text-4xl font-extrabold text-amber-300 font-mono">
                  {score} / {questions.length}
                </span>
                <p className="text-xs text-slate-400">
                  {score === questions.length
                    ? 'عالی و بی‌نظیر! تسلط کامل بر این درس.'
                    : 'بسیار خوب! مرور مجدد لغات توصیه می‌شود.'}
                </p>
              </div>

              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>شروع مجدد آزمون</span>
              </button>
            </div>
          )}
        </div>
      ) : activeTab === 'scramble' && currentScramble ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/60 pb-3">
              <span>جمله {scrambleIndex + 1} از {builders.length} (درس {lesson.id})</span>
              <span className="text-teal-400">روی کلمات ضربه بزنید</span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-xs text-teal-400 font-medium">جمله هدف (ترجمه فارسی):</span>
              <h4 className="text-lg font-bold text-white">
                «{currentScramble.farsiMeaning}»
              </h4>
            </div>

            <div className="min-h-[80px] rounded-2xl bg-slate-950/70 border-2 border-dashed border-slate-700 p-4 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-500">
                  کلمات را انتخاب کنید...
                </span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveWord(idx)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600/30 hover:bg-rose-600/40 text-teal-200 hover:text-rose-200 border border-teal-500/40 font-en text-sm font-semibold transition-all"
                  >
                    {word} ✕
                  </button>
                ))
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-400">کلمات موجود:</span>
              <div className="flex flex-wrap gap-2">
                {currentScramble.words.map((word, idx) => {
                  const isUsed = selectedWords.includes(word);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAddWord(word)}
                      disabled={isUsed}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold font-en transition-all ${
                        isUsed
                          ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-40'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 shadow-md'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {scrambleResult === 'correct' && (
              <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/40 p-4 flex items-center justify-between text-emerald-200 text-sm animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>آفرین! جمله انگلیسی دقیقاً درست شد.</span>
                </div>
                <button
                  onClick={() => speakEnglish(currentScramble.correctOrder.join(' '))}
                  className="text-xs bg-emerald-800/60 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 font-en"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>پخش صوتی</span>
                </button>
              </div>
            )}

            {scrambleResult === 'wrong' && (
              <div className="rounded-2xl bg-rose-950/60 border border-rose-500/40 p-4 flex items-center gap-2 text-rose-200 text-sm animate-fadeIn">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>ترتیب کلمات درست نیست؛ دوباره تلاش کنید.</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-700/60 pt-4">
              <button
                onClick={() => {
                  setSelectedWords([]);
                  setScrambleResult('idle');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                پاک کردن
              </button>

              <div className="flex items-center gap-2">
                {scrambleResult !== 'correct' ? (
                  <button
                    onClick={handleVerifyScramble}
                    disabled={selectedWords.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg"
                  >
                    بررسی جمله
                  </button>
                ) : (
                  <button
                    onClick={handleNextScramble}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                  >
                    <span>جمله بعدی</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
