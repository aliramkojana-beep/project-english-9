export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  farsi: string;
  definition: string;
  exampleEn: string;
  exampleFa: string;
  category: 'positive' | 'neutral' | 'challenging';
  emoji: string;
  audioText: string;
}

export interface ConversationTurn {
  id: number;
  speaker: string;
  speakerFarsi: string;
  avatar: string;
  textEn: string;
  textFa: string;
  notes?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  questionFarsi?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SentenceBuilderItem {
  id: number;
  farsiMeaning: string;
  words: string[];
  correctOrder: string[];
}

export interface VideoPreset {
  id: string;
  title: string;
  farsiTitle: string;
  description: string;
  prompt: string;
  suggestedRatio: '16:9' | '9:16';
  trait: string;
  badge: string;
}

export interface LessonData {
  id: number;
  title: string;
  titleFarsi: string;
  subtitle: string;
  themeColor: string;
  icon: string;
  description: string;
  vocabulary: VocabularyItem[];
  conversation: {
    title: string;
    speakers: string;
    description: string;
    script: ConversationTurn[];
    grammarNote: string;
  };
  grammar: {
    title: string;
    ruleName: string;
    explanation: string;
    formulas: {
      type: string;
      en: string;
      fa: string;
    }[];
    comparisonCards: {
      title: string;
      enQuestion: string;
      faQuestion: string;
      enAnswer: string;
      faAnswer: string;
    }[];
  };
  quizQuestions: QuizQuestion[];
  sentenceBuilders: SentenceBuilderItem[];
  videoPresets: VideoPreset[];
  summaryChips: { en: string; fa: string }[];
}
