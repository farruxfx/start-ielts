// ===== Import System Types =====

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'needs_review';
export type ImportSkill = 'reading' | 'listening' | 'writing' | 'speaking' | 'unknown';
export type ImportTestType = 'academic' | 'general' | 'unknown';
export type ConfidenceLevel = 'ready' | 'review' | 'needs_review';
export type DuplicateAction = 'skip' | 'replace' | 'import_anyway';

export interface ImportedQuestion {
  number: number;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string | null;
  explanation: string | null;
  needsReview: boolean;
}

export interface ImportedPassage {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  questions: ImportedQuestion[];
}

export interface ImportedSection {
  id: string;
  title: string;
  questions: ImportedQuestion[];
  audioUrl?: string;
  audioMissing?: boolean;
}

export interface ImportedTask {
  task: number;
  prompt: string;
  instructions: string;
  imageUrl?: string | null;
}

export interface ImportedSpeakingPart {
  part: number;
  title: string;
  questions: string[];
  cueCard?: string;
  preparationTime?: number;
  speakingTime?: number;
}

export interface ImportedTest {
  id: string;
  filename: string;
  title: string;
  skill: ImportSkill;
  testType: ImportTestType;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  passages: ImportedPassage[];
  sections: ImportedSection[];
  tasks: ImportedTask[];
  speakingParts: ImportedSpeakingPart[];
  totalQuestions: number;
  questionsWithAnswers: number;
  questionsNeedingReview: number;
  audioMissing: boolean;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  warnings: string[];
  errors: string[];
  parsingErrors: string[];
  originalHtml: string;
  contentHash: string;
}

export interface ImportFile {
  id: string;
  filename: string;
  fileSize: number;
  status: ImportStatus;
  importedTest: ImportedTest | null;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ImportJob {
  id: string;
  files: ImportFile[];
  status: ImportStatus;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  startedAt: string;
  completedAt?: string;
}

export interface ImportHistoryEntry {
  id: string;
  filename: string;
  skill: ImportSkill;
  testType: ImportTestType;
  totalQuestions: number;
  questionsWithAnswers: number;
  confidence: number;
  status: ImportStatus;
  importedAt: string;
  publishedAt?: string;
  warnings: string[];
  errors: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedBy: string;
  existingId?: string;
  confidence: number;
}
