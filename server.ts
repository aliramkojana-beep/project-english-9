import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Veo 3 Video Generation: Start operation
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'کلید API تنظیم نشده است. لطفاً کلید معتبر Gemini را در تنظیمات وارد کنید.',
      });
    }

    const selectedRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    // Model specified: veo-3.1-fast-generate-preview
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt.trim(),
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: selectedRatio,
      },
    });

    return res.json({
      operationName: operation.name,
      model: 'veo-3.1-fast-generate-preview',
      aspectRatio: selectedRatio,
      prompt,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-video:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در آغاز تولید ویدیو با Veo 3',
    });
  }
});

// 2. Veo 3 Video Generation: Check Operation Status
app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;

    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    const hasVideo = !!updated.response?.generatedVideos?.[0]?.video?.uri;

    return res.json({
      done: !!updated.done,
      error: updated.error || null,
      hasVideo,
    });
  } catch (error: any) {
    console.error('Error in /api/video-status:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در استعلام وضعیت ساخت ویدیو',
    });
  }
});

// 3. Veo 3 Video Generation: Download / Proxy video stream
app.post('/api/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;

    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'ویدیوی تولید شده یافت نشد یا هنوز آماده نشده است.' });
    }

    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `خطا در دریافت ویدیوی Veo 3: ${videoRes.statusText}`,
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="prospect3-lesson1.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    console.error('Error in /api/video-download:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در دانلود ویدیوی تولید شده',
    });
  }
});

// 4. AI Interactive Tutor & Sentence Practice (gemini-3.8-flash)
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const promptContext = `You are a friendly, encouraging English teacher for Iranian 9th-grade students (کتاب زبان انگلیسی پایه نهم - Prospect 3).
The current lesson is Lesson 1: "Personality" (شخصیت).
Key concepts:
- Adjectives: clever (باهوش), kind (مهربان), hard-working (سخت‌کوش), helpful (کمک‌رسان), friendly (دوستانه/خونگرم), brave (شجاع), shy (خجالتی), talkative (پرحرف), serious (جدی), quiet (آرام/ساکت), patient (صبور), polite (مودب).
- Key questions: "What's your friend like?" (دوستت چه جور شخصیتی دارد؟) -> "He's clever and kind."
- Difference: "What is he like?" (شخصیت) vs "What does he look like?" (ظاهر فیزیکی).
- Yes/No questions: "Are you hard-working? - Yes, I am. / No, I'm not.", "Is he clever? - Yes, he is. / No, he isn't."
- The conversation between Ehsan and Parham about Parham's best friend Reza.

Answer the student warmly in fluent Persian and simple English examples. If they write an English sentence, evaluate it gently and give tips. Keep answers concise, clear, and pedagogically sound.`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction: promptContext,
      },
    });

    const reply = chatResponse.text || 'پاسخی دریافت نشد.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai-chat:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در ارتباط با معلم هوشمند',
    });
  }
});

// Dev vs Prod Vite setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
