'use client';

import type { Skill } from './types';

// ── Types ────────────────────────────────────────────────────────

export type TeacherQuestionType =
  | 'multiple_choice'
  | 'true_false_not_given'
  | 'yes_no_not_given'
  | 'short_answer'
  | 'fill_blank'
  | 'essay'
  | 'matching'
  | 'sentence_completion';

export interface TeacherQuestion {
  id: string;
  type: TeacherQuestionType;
  number: number;
  text: string;
  options?: string[];          // for MC, matching
  correctAnswer: string;       // for auto-grading
  points: number;
  rubric?: string;             // for essay/writing
  partLabel?: string;          // e.g. "Part 1", "Part 2"
}

export interface TeacherPassage {
  id: string;
  title: string;
  content: string;
}

export interface AccessSettings {
  visibility: 'anyone' | 'students_only' | 'selected_groups';
  groups?: string[];
  maxAttempts: number;
  timeLimitMinutes: number;
  showResultAfterSubmit: boolean;
  allowRetake: boolean;
}

export interface TeacherTest {
  id: string;
  code: string;                 // unique short code for URL
  title: string;
  skill: Skill;
  description: string;
  questions: TeacherQuestion[];
  passages?: TeacherPassage[];
  access: AccessSettings;
  status: 'active' | 'inactive' | 'draft';
  createdBy: string;            // teacher email
  createdAt: string;
  updatedAt: string;
}

export interface TestSubmission {
  id: string;
  testId: string;
  testCode: string;
  studentName: string;
  studentEmail: string;
  answers: Record<string, string>;   // questionId → answer
  score: number;                     // 0-100
  correctCount: number;
  totalQuestions: number;
  band: number;                      // estimated IELTS band
  timeSpentSeconds: number;
  status: 'auto_graded' | 'pending_review' | 'reviewed';
  teacherFeedback?: string;
  submittedAt: string;
}

// ── localStorage helpers ─────────────────────────────────────────

const KEYS = {
  TESTS: 'ieltspro_teacher_tests',
  SUBMISSIONS: 'ieltspro_test_submissions',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* Storage full */ }
}

// ── Code Generator ───────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const existing = new Set(getAllTests().map(t => t.code));
  let code: string;
  do {
    code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existing.has(code));
  return code;
}

// ── Tests CRUD ───────────────────────────────────────────────────

export function getAllTests(): TeacherTest[] {
  return safeGet<TeacherTest[]>(KEYS.TESTS, []);
}

export function getTestById(id: string): TeacherTest | undefined {
  return getAllTests().find(t => t.id === id);
}

export function getTestByCode(code: string): TeacherTest | undefined {
  return getAllTests().find(t => t.code === code);
}

export function getTestsByTeacher(email: string): TeacherTest[] {
  return getAllTests().filter(t => t.createdBy === email);
}

export function createTest(test: Omit<TeacherTest, 'id' | 'code' | 'createdAt' | 'updatedAt'>): TeacherTest {
  const all = getAllTests();
  const newTest: TeacherTest = {
    ...test,
    id: crypto.randomUUID(),
    code: generateCode(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newTest);
  safeSet(KEYS.TESTS, all);
  return newTest;
}

export function updateTest(id: string, updates: Partial<TeacherTest>): TeacherTest | null {
  const all = getAllTests();
  const idx = all.findIndex(t => t.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  safeSet(KEYS.TESTS, all);
  return all[idx];
}

export function deleteTest(id: string): boolean {
  const all = getAllTests();
  const filtered = all.filter(t => t.id !== id);
  if (filtered.length === all.length) return false;
  safeSet(KEYS.TESTS, filtered);
  // Also delete submissions for this test
  const subs = getAllSubmissions().filter(s => s.testId !== id);
  safeSet(KEYS.SUBMISSIONS, subs);
  return true;
}

export function toggleTestStatus(id: string): TeacherTest | null {
  const test = getTestById(id);
  if (!test) return null;
  return updateTest(id, { status: test.status === 'active' ? 'inactive' : 'active' });
}

// ── Submissions ──────────────────────────────────────────────────

export function getAllSubmissions(): TestSubmission[] {
  return safeGet<TestSubmission[]>(KEYS.SUBMISSIONS, []);
}

export function getSubmissionsForTest(testId: string): TestSubmission[] {
  return getAllSubmissions().filter(s => s.testId === testId);
}

export function getSubmissionsByStudent(email: string): TestSubmission[] {
  return getAllSubmissions().filter(s => s.studentEmail === email);
}

export function addSubmission(sub: Omit<TestSubmission, 'id' | 'submittedAt'>): TestSubmission {
  const all = getAllSubmissions();
  const newSub: TestSubmission = {
    ...sub,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  all.push(newSub);
  safeSet(KEYS.SUBMISSIONS, all);
  return newSub;
}

export function updateSubmission(id: string, updates: Partial<TestSubmission>): TestSubmission | null {
  const all = getAllSubmissions();
  const idx = all.findIndex(s => s.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  safeSet(KEYS.SUBMISSIONS, all);
  return all[idx];
}

// ── Auto-Grading ─────────────────────────────────────────────────

export function autoGradeTest(
  test: TeacherTest,
  answers: Record<string, string>,
): { score: number; correctCount: number; band: number } {
  let correct = 0;
  let total = 0;

  for (const q of test.questions) {
    if (['essay', 'short_answer'].includes(q.type) && test.skill === 'writing') continue;
    total++;
    const userAnswer = (answers[q.id] || '').trim().toLowerCase();
    const correctAnswer = q.correctAnswer.trim().toLowerCase();
    if (userAnswer === correctAnswer) {
      correct++;
    }
  }

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const band = scoreToBand(score);

  return { score, correctCount: correct, band };
}

function scoreToBand(score: number): number {
  // IELTS band approximation from percentage
  if (score >= 95) return 9.0;
  if (score >= 90) return 8.5;
  if (score >= 83) return 8.0;
  if (score >= 75) return 7.5;
  if (score >= 65) return 7.0;
  if (score >= 55) return 6.5;
  if (score >= 45) return 6.0;
  if (score >= 38) return 5.5;
  if (score >= 30) return 5.0;
  if (score >= 23) return 4.5;
  if (score >= 15) return 4.0;
  if (score >= 8) return 3.5;
  return 3.0;
}

// ── Stats helpers ────────────────────────────────────────────────

export function getTestStats(testId: string) {
  const subs = getSubmissionsForTest(testId);
  if (subs.length === 0) {
    return { total: 0, avgScore: 0, avgBand: 0, avgTime: 0 };
  }
  const total = subs.length;
  const avgScore = Math.round(subs.reduce((a, s) => a + s.score, 0) / total);
  const avgBand = Math.round((subs.reduce((a, s) => a + s.band, 0) / total) * 10) / 10;
  const avgTime = Math.round(subs.reduce((a, s) => a + s.timeSpentSeconds, 0) / total);
  return { total, avgScore, avgBand, avgTime };
}
