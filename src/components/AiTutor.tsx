import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Volume2, Loader2 } from 'lucide-react';
import { LessonData } from '../types';
import { speakEnglish } from '../utils/audio';

interface AiTutorProps {
  lesson: LessonData;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
}

export const AiTutor: React.FC<AiTutorProps> = ({ lesson }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'tutor',
        text: `سلام! من معلم هوشمند زبان انگلیسی پایه نهم هستم. هم‌اکنون در درس ${lesson.id} (${lesson.title} - ${lesson.titleFarsi}) هستیم. هر سؤالی درباره واژگان، تلفظ، گرامر (${lesson.grammar.ruleName})، یا تمرین جمله‌سازی داری بپرس تا کمکت کنم! 🎓`,
      },
    ]);
  }, [lesson.id]);

  const quickPrompts = [
    `مهم‌ترین کلمات درس ${lesson.id} چیا هستن؟`,
    `یک مکالمه جدید درباره ${lesson.titleFarsi} برام بنویس`,
    `گرامر درس ${lesson.id} رو با یک مثال توضیح بده`,
    `جمله من رو بررسی کن: "I am ready for the exam"`,
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageContent,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Current Lesson: Lesson ${lesson.id} - ${lesson.title} (${lesson.titleFarsi})] ${messageContent}`,
        }),
      });

      const data = await response.json();
      const tutorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: data.reply || 'متأسفانه پاسخی دریافت نشد.',
      };

      setMessages((prev) => [...prev, tutorReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'tutor',
          text: 'در برقراری ارتباط با معلم هوشمند خطایی رخ داد. لطفاً دوباره تلاش فرمایید.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-8 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-800/80 to-purple-900/60 p-6 sm:p-8 border border-indigo-500/20 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>معلم هوشمند پایه نهم • درس {lesson.id}: {lesson.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            دستیار هوشمند رفع اشکال {lesson.titleFarsi}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            پرسش درباره لغات، اصطلاحات، گرامر، یا تصحیح جملات انگلیسی درس {lesson.id}.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl flex flex-col h-[580px] overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isTutor = msg.sender === 'tutor';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isTutor ? 'justify-start' : 'justify-end'}`}
              >
                {isTutor && (
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                    isTutor
                      ? 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md'
                      : 'bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/25'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {isTutor && (
                    <button
                      onClick={() => speakEnglish(msg.text)}
                      className="text-[11px] text-indigo-400 hover:text-white flex items-center gap-1 pt-1 border-t border-slate-800/80"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>شنیدن متن انگلیسی</span>
                    </button>
                  )}
                </div>

                {!isTutor && (
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>معلم هوشمند در حال پاسخگویی...</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-2.5 bg-slate-900/70 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] text-slate-500 shrink-0">پیشنهادات:</span>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="text-xs text-indigo-300 hover:text-white bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 px-3 py-1 rounded-xl whitespace-nowrap transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="سؤال خود را اینجا بنویسید..."
              className="flex-1 bg-slate-800 text-sm text-white placeholder-slate-400 px-4 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>ارسال</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
