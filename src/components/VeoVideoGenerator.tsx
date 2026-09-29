import React, { useState, useEffect, useRef } from 'react';
import { Video, Sparkles, Download, Loader2, AlertCircle, RefreshCw, Wand2, Film, Monitor, Smartphone } from 'lucide-react';
import { LessonData, VideoPreset } from '../types';

interface VeoVideoGeneratorProps {
  lesson: LessonData;
}

export const VeoVideoGenerator: React.FC<VeoVideoGeneratorProps> = ({ lesson }) => {
  const presets = lesson.videoPresets;
  const initialPreset = presets[0] || {
    id: 'default',
    title: lesson.title,
    farsiTitle: lesson.titleFarsi,
    description: lesson.description,
    prompt: `Cinematic educational scene illustrating ${lesson.title} for high school students, 4k detail.`,
    suggestedRatio: '16:9' as const,
    trait: lesson.title,
    badge: `درس ${lesson.id}`,
  };

  const [prompt, setPrompt] = useState(initialPreset.prompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>(initialPreset.suggestedRatio || '16:9');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);

  // Status
  const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'completed' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState<string>('');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update prompt when lesson changes
  useEffect(() => {
    if (presets[0]) {
      setSelectedPresetId(presets[0].id);
      setPrompt(presets[0].prompt);
      setAspectRatio(presets[0].suggestedRatio || '16:9');
    }
  }, [lesson.id]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const handleSelectPreset = (preset: VideoPreset) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setAspectRatio(preset.suggestedRatio);
  };

  const handleInsertWord = (word: string) => {
    setPrompt((prev) => `${prev.trim()} showing ${word}`);
  };

  const startGeneration = async () => {
    if (!prompt.trim()) return;

    setStatus('generating');
    setErrorMessage(null);
    setVideoUrl(null);
    setElapsedSeconds(0);
    setProgressStep('در حال ارسال درخواست به مدل Veo 3...');

    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'خطا در آغاز ساخت ویدیو');
      }

      setStatus('polling');
      setProgressStep('ویدیو در صف پردازش مدل Veo 3 قرار گرفت. در حال رندر فریم‌ها...');
      startPolling(data.operationName);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'خطا در ارتباط با سرور یا سهمیه مدل');
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
  };

  const startPolling = (opName: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    const steps = [
      `تفسیر مفاهیم درس ${lesson.id} (${lesson.title})...`,
      'رندر فریم‌ها با مدل veo-3.1-fast-generate-preview...',
      'تولید نورپردازی سینمایی و فضاسازی واقع‌گرایانه...',
      'کدگذاری نهایی و استخراج استریم MP4...',
    ];
    let stepIndex = 0;

    pollTimerRef.current = setInterval(async () => {
      try {
        stepIndex = (stepIndex + 1) % steps.length;
        setProgressStep(steps[stepIndex]);

        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const statusData = await statusRes.json();

        if (statusData.error) {
          throw new Error(statusData.error.message || 'خطا در تولید ویدیو');
        }

        if (statusData.done) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

          setProgressStep('در حال دریافت مستقیم ویدیو...');
          await downloadAndDisplayVideo(opName);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        setStatus('error');
        setErrorMessage(err.message || 'خطا در استعلام وضعیت ساخت ویدیو');
      }
    }, 6000);
  };

  const downloadAndDisplayVideo = async (opName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!res.ok) {
        throw new Error('خطا در دریافت استریم ویدیو');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'خطا در بارگیری و نمایش ویدیو');
    }
  };

  return (
    <section className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/70 via-indigo-900/80 to-slate-900/90 p-6 sm:p-8 border border-purple-500/30 backdrop-blur-xl shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Film className="w-3.5 h-3.5" />
            <span>استودیو ویدیویی Veo 3 • درس {lesson.id}: {lesson.title}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            تولید ویدیوی آموزشی {lesson.titleFarsi} با مدل Veo 3
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            محتوای درس {lesson.id} ({lesson.title}) را با مدل قدرتمند <span className="font-mono text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-700/50">veo-3.1-fast-generate-preview</span> در نسبت‌های <span className="font-mono text-amber-300">16:9</span> (افقی) یا <span className="font-mono text-amber-300">9:16</span> (عمودی) به ویدیوهای آموزشی متحرک تبدیل نمایید.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">مدل اختصاصی:</span>
            <span className="font-mono text-indigo-300 font-bold">veo-3.1-fast-generate-preview</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400">کیفیت:</span>
            <span className="text-white font-semibold">720p HD سینمایی</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          {/* Preset Prompts */}
          {presets.length > 0 && (
            <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>سناریوهای درس {lesson.id}: {lesson.titleFarsi}</span>
                </h3>
                <span className="text-xs text-slate-400">کلیک برای انتخاب سناریو</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-right p-4 rounded-2xl border transition-all text-xs space-y-2 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-950/70 border-purple-400 text-white ring-2 ring-purple-500/30 shadow-lg'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-sm text-white">{preset.farsiTitle}</span>
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span>نسبت پیشنهادی: {preset.suggestedRatio}</span>
                        <span className="text-purple-400 font-en font-medium">{preset.trait}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompt Editor & Aspect Ratio Switcher */}
          <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 space-y-5 shadow-xl">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-bold block">
                نسبت تصویر خروجی (Aspect Ratio):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-3 transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 font-bold'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  <Monitor className="w-5 h-5" />
                  <div className="text-right">
                    <span className="block text-sm font-en">16:9 (Landscape)</span>
                    <span className="text-[10px] opacity-80">صفحه‌عریض / کلاس درس / لپ‌تاپ</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-3 transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 font-bold'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <div className="text-right">
                    <span className="block text-sm font-en">9:16 (Portrait)</span>
                    <span className="text-[10px] opacity-80">عمودی / موبایل / ریلز و استوری</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-bold">
                  متن سناریوی ویدیویی برای Veo 3:
                </label>
                <span className="text-[11px] text-slate-400 font-en">English recommended</span>
              </div>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="توصیف صحنه به انگلیسی برای هوش مصنوعی..."
                className="w-full bg-slate-900/90 text-sm font-en text-slate-100 p-4 rounded-2xl border border-slate-700 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 block font-medium">
                افزودن واژگان درس {lesson.id} به پرامپت:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lesson.vocabulary.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleInsertWord(item.word)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-indigo-300 hover:bg-purple-600 hover:text-white border border-slate-700 font-en text-xs transition-all"
                  >
                    + {item.word}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGeneration}
              disabled={status === 'generating' || status === 'polling' || !prompt.trim()}
              className={`w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl ${
                status === 'generating' || status === 'polling'
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white shadow-purple-600/30'
              }`}
            >
              {status === 'generating' || status === 'polling' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span>در حال ساخت ویدیو با Veo 3 ({elapsedSeconds} ثانیه)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-300" />
                  <span>تولید ویدیوی آموزشی با Veo 3 ({aspectRatio})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>پخش‌کننده ویدیوی Veo 3</span>
            </h3>

            <div
              className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto transition-all duration-300 ${
                aspectRatio === '16:9' ? 'aspect-video w-full' : 'aspect-[9/16] max-w-[280px] w-full'
              }`}
            >
              {videoUrl ? (
                <div className="w-full h-full relative group">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white border border-slate-700 font-mono">
                    Veo 3 • {aspectRatio}
                  </div>
                </div>
              ) : status === 'generating' || status === 'polling' ? (
                <div className="p-6 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <Film className="w-6 h-6 text-purple-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-white block">
                      مدل Veo 3 در حال ساخت ویدیو
                    </span>
                    <p className="text-[11px] text-purple-300 animate-pulse">
                      {progressStep}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      زمان: {elapsedSeconds}s
                    </span>
                  </div>
                </div>
              ) : status === 'error' ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <span className="text-xs font-bold text-white block">خطا در فرآیند تولید</span>
                  <p className="text-[11px] text-rose-300 max-w-xs leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    onClick={startGeneration}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تلاش مجدد</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
                    <Video className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-300 block">
                      ویدیو آماده نیست
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      یکی از سناریوهای درس {lesson.id} را انتخاب و دکمه را بزنید.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {videoUrl && (
              <div className="space-y-3 animate-fadeIn pt-2">
                <a
                  href={videoUrl}
                  download={`prospect3-lesson${lesson.id}.mp4`}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل ویدیو (MP4)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
