export type Skill = 'reading' | 'listening' | 'writing' | 'speaking';
export type TestType = 'reading' | 'listening' | 'writing' | 'speaking' | 'mock';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ExamType = 'academic' | 'general';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'matching_headings'
  | 'matching_information'
  | 'matching_features'
  | 'sentence_completion'
  | 'summary_completion'
  | 'note_completion'
  | 'table_completion'
  | 'flowchart_completion'
  | 'diagram_label_completion'
  | 'short_answer';

export type WritingTaskType =
  | 'academic_task1'
  | 'general_task1'
  | 'opinion'
  | 'discussion'
  | 'advantages_disadvantages'
  | 'problem_solution'
  | 'two_part';

export type SpeakingPart = 'part1' | 'part2' | 'part3';

export type SubscriptionTier = 'free' | 'plus' | 'pro';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
export type UserRole = 'student' | 'teacher' | 'admin';

export interface Test {
  id: string;
  title: string;
  skill: TestType;
  examType: ExamType;
  difficulty: Difficulty;
  questionCount: number;
  estimatedMinutes: number;
  bestScore?: number;
  status: 'not_started' | 'in_progress' | 'completed';
  description: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  questionNumber: number;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
  category: string;
  passageId?: string;
}

export interface Passage {
  id: string;
  title: string;
  content: string;
  wordCount: number;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  skill: TestType;
  overallBand: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentMinutes: number;
  completedAt: string;
}

export interface WritingEvaluation {
  overallBand: number;
  taskAchievement: number;
  coherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  strengths: string[];
  weaknesses: string[];
  corrections: { original: string; corrected: string; explanation: string }[];
  vocabularyImprovements: { original: string; suggestion: string }[];
  grammarMistakes: { mistake: string; correction: string; rule: string }[];
  suggestedStructure: string;
  sampleAnswer: string;
}

export interface SpeakingEvaluation {
  overallBand: number;
  fluency: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  feedback: string;
  corrections: string[];
  betterVocabulary: { original: string; suggestion: string }[];
  sampleAnswers: string[];
  followUpQuestions: string[];
}

export interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  synonyms: string[];
  wordFamily: { form: string; word: string }[];
  difficulty: Difficulty;
  category: string;
}

export interface Mistake {
  id: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: Difficulty;
  skill: Skill;
  mastered: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

export interface DashboardData {
  userName: string;
  targetBand: number;
  currentBand: number;
  examCountdownDays: number;
  skillBands: { skill: Skill; band: number; target: number }[];
  progressHistory: { date: string; overall: number }[];
  totalTests: number;
  averageBand: number;
  bestBand: number;
  weakestSkill: Skill;
  accuracy: number;
  timeSpentHours: number;
  weeklyActivity: { day: string; minutes: number }[];
  streak: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: { monthly: number; quarterly: number; halfYearly: number; yearly: number };
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

// Mock Exam Types
export type MockExamStatus = 'not_started' | 'in_progress' | 'completed';

export interface MockExamDef {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  sections: ('listening' | 'reading' | 'writing' | 'speaking')[];
  examType: ExamType;
  difficulty: Difficulty;
  totalMinutes: number;
  htmlFile: string;
  listeningAudioUrl?: string;
  listeningBankId?: string;
}

export type MockExamSectionName = 'listening' | 'reading' | 'writing' | 'speaking';

export interface MockExamSession {
  id: string;
  examId: string;
  startedAt: string;
  completedAt?: string;
  status: MockExamStatus;
  currentSection: MockExamSectionName;
  timeSpentMinutes: number;
  sectionScores: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
  };
  overallBand?: number;
}
