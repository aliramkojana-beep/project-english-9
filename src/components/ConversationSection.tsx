import React, { useState } from 'react';
import { Volume2, Play, Pause, MessageCircle, CheckCircle2 } from 'lucide-react';
import { LessonData } from '../types';
import { speakEnglish, stopSpeech } from '../utils/audio';

interface ConversationSectionProps {
  lesson: LessonData;
}

export const ConversationSection: React.FC<ConversationSectionProps> = ({ lesson }) => {
  const [activeTurnId, setActiveTurnId] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [rolePlayMode, setRolePlayMode] = useState<string | null>(null);
  const [rolePlayStep, setRolePlayStep] = useState(0);

  const conv = lesson.conversation;
  const script = conv.script;

  // Extract unique speaker names
  const speakers = Array.from(new Set(script.map((s) => s.speaker)));

  const playSingleTurn = (turn: typeof script[0]) => {
    setActiveTurnId(turn.id);
    speakEnglish(turn.textEn, 0.85);
    setTimeout(() => {
      setActiveTurnId(null);
    }, 2500);
  };

  const handlePlayFullConversation = async () => {
    if (isPlayingAll) {
      stopSpeech();
      setIsPlayingAll(false);
      setActiveTurnId(null);
      return;
    }

    setIsPlayingAll(true);
    for (let i = 0; i < script.length; i++) {
      const turn = script[i];
      setActiveTurnId(turn.id);
      speakEnglish(turn.textEn, 0.85);
      await new Promise((res) => setTimeout(res, 2800));
    }
    setIsPlayingAll(false);
    setActiveTurnId(null);
  };

  const startRolePlay = (speaker: string) => {
    setRolePlayMode(speaker);
    setRolePlayStep(0);
    // If user is not the first speaker, play first turn
    if (script[0]?.speaker !== speaker) {
      setActiveTurnId(script[0].id);
      speakEnglish(script[0].textEn, 0.85);
    }
  };

  const handleRolePlayNext = () => {
    const nextStep = rolePlayStep + 1;
    if (nextStep >= script.length) {
      setRolePlayStep(0);
      setRolePlayMode(null);
      return;
    }
    setRolePlayStep(nextStep);

    const nextTurn = script[nextStep];
    if (nextTurn.speaker !== rolePlayMode) {
      setActiveTurnId(nextTurn.id);
      speakEnglish(nextTurn.textEn, 0.85);
    }
  };

  return (
    <section className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-800/90 to-indigo-900/60 p-6 sm:p-8 border border-blue-500/20 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>مکالمه درس {lesson.id} ({conv.speakers})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {conv.title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {conv.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayFullConversation}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-xl ${
                isPlayingAll
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isPlayingAll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlayingAll ? 'توقف مکالمه' : 'پخش کامل مکالمه'}</span>
            </button>
          </div>
        </div>

        {/* Role-play Bar */}
        <div className="mt-6 border-t border-slate-700/60 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">تمرین نقش‌آفرینی (Role-Play):</span>
            {speakers.map((spk) => (
              <button
                key={spk}
                onClick={() => startRolePlay(spk)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  rolePlayMode === spk
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                من «{spk}» هستم 🎭
              </button>
            ))}
            {rolePlayMode && (
              <button
                onClick={() => setRolePlayMode(null)}
                className="text-xs text-rose-400 hover:underline px-2"
              >
                لغو
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="max-w-4xl mx-auto space-y-4">
        {script.map((turn, index) => {
          const isActive = activeTurnId === turn.id;
          const isUserTurnInRolePlay = rolePlayMode === turn.speaker && rolePlayStep === index;

          return (
            <div
              key={turn.id}
              className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 border ${
                isActive
                  ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/30 shadow-2xl scale-[1.01]'
                  : isUserTurnInRolePlay
                  ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/40 shadow-2xl'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center text-3xl shadow-lg shrink-0">
                    {turn.avatar}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {turn.speaker}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-400 border border-slate-700">
                        {turn.speakerFarsi}
                      </span>
                      {isUserTurnInRolePlay && (
                        <span className="text-xs font-bold text-amber-300 animate-pulse bg-amber-500/20 px-2 py-0.5 rounded-md">
                          نوبت صحبت شما 🎤
                        </span>
                      )}
                    </div>

                    <p className="text-lg sm:text-xl font-bold text-white tracking-wide font-en leading-relaxed">
                      {turn.textEn}
                    </p>

                    <p className="text-sm text-slate-300">
                      {turn.textFa}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => playSingleTurn(turn)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50 scale-105'
                        : 'bg-slate-900 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-slate-700'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>تلفظ صوتی</span>
                  </button>

                  {rolePlayMode && rolePlayStep === index && (
                    <button
                      onClick={handleRolePlayNext}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg"
                    >
                      ادامه مکالمه →
                    </button>
                  )}
                </div>
              </div>

              {turn.notes && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-2 text-xs text-indigo-300/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>نکته آموزشی: {turn.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
