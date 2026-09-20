'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
  GraduationCap, FileText, Send, Lock, BookOpen, Headphones, PenTool, Mic
} from 'lucide-react';
import {
  getAssignmentByCode, addSubmissionToAssignment, scoreToBand,
  type TestAssignment
} from '@/lib/teacher-test-store';
import { READING_TESTS } from '@/lib/reading-tests';
import { LISTENING_TESTS } from '@/lib/listening-tests';
import { WRITING_TESTS } from '@/lib/writing-tests';
import { SPEAKING_TOPICS } from '@/lib/speaking-practice-data';
import { cn } from '@/lib/utils';

type Phase = 'password' | 'info' | 'taking' | 'submitting' | 'result';

export default function StudentTestPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [assignment, setAssignment] = useState<TestAssignment | null>(null);
  const [phase, setPhase] = useState<Phase>('info');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load assignment
  useEffect(() => {
    if (code) {
      const found = getAssignmentByCode(code);
      if (!found) {
        setError('Test topilmadi. Linkni tekshiring.');
      } else if (found.status !== 'active') {
        setError('Bu test hozir faol emas.');
      } else {
        setAssignment(found);
        if (found.password) {
          setPhase('password');
        }
      }
    }
  }, [code]);

  // Timer
  useEffect(() => {
    if (phase !== 'taking' || !assignment) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, assignment]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === assignment?.password) {
      setPhase('info');
      setPasswordError('');
    } else {
      setPasswordError('Noto\'g\'ri parol. Qaytadan kiriting.');
    }
  };

  const startTest = () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      alert('Ism va email kiriting.');
      return;
    }
    setTimeLeft((assignment?.timeLimitMinutes || 60) * 60);
    setPhase('taking');
    setCurrentIdx(0);
  };

  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(() => {
    if (!assignment) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setPhase('submitting');

    // Simple scoring: count answered vs total
    const totalQ = Object.keys(answers).length;
    const correctCount = 0; // Platform tests use iframe, can't auto-grade from here
    const score = totalQ > 0 ? Math.round((totalQ / getQuestionCount(assignment) ) * 100) : 0;
    const band = scoreToBand(score);

    addSubmissionToAssignment(assignment.id, {
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      answers,
      score,
      correctCount,
      totalQuestions: getQuestionCount(assignment),
      band,
      timeSpentSeconds: (assignment.timeLimitMinutes * 60) - timeLeft,
      status: assignment.testType === 'writing' || assignment.testType === 'speaking' ? 'pending_review' : 'auto_graded',
    });

    setSubmitted(true);
    setPhase('result');
  }, [assignment, answers, studentName, studentEmail, timeLeft]);

  function getQuestionCount(a: TestAssignment): number {
    switch (a.testType) {
      case 'reading': return READING_TESTS.find(t => t.id === a.testId)?.questionCount || 13;
      case 'listening': return LISTENING_TESTS.find(t => t.id === a.testId)?.questionCount || 40;
      case 'writing': return 2;
      case 'speaking': return 9;
      default: return 10;
    }
  }

  function getTestTitle(a: TestAssignment): string {
    switch (a.testType) {
      case 'reading': return READING_TESTS.find(t => t.id === a.testId)?.title || a.testTitle;
      case 'listening': return LISTENING_TESTS.find(t => t.id === a.testId)?.title || a.testTitle;
      case 'writing': return WRITING_TESTS.find(t => t.id === a.testId)?.name || a.testTitle;
      case 'speaking': return SPEAKING_TOPICS.find(t => t.id === a.testId)?.title || a.testTitle;
      default: return a.testTitle;
    }
  }

  function getTestFile(a: TestAssignment): string | null {
    switch (a.testType) {
      case 'reading': return `/reading/${encodeURIComponent(READING_TESTS.find(t => t.id === a.testId)?.filename || '')}`;
      case 'listening': return `/listening/${encodeURIComponent(LISTENING_TESTS.find(t => t.id === a.testId)?.filename || '')}`;
      default: return null;
    }
  }

  const skillIcons: Record<string, React.ReactNode> = {
    reading: <BookOpen className="h-7 w-7" />,
    listening: <Headphones className="h-7 w-7" />,
    writing: <PenTool className="h-7 w-7" />,
    speaking: <Mic className="h-7 w-7" />,
  };

  // ── Error state ──
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold">Test Unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            StartIELTS ga qaytish
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (!assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Password Phase ──
  if (phase === 'password') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold">Password Required</h1>
          <p className="text-sm text-muted-foreground">Bu test parol bilan himoyalangan. O'qituvchingizdan parolni oling.</p>
          <div>
            <input
              type="password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
              onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Parolni kiriting"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {passwordError && <p className="mt-2 text-xs text-red-500">{passwordError}</p>}
          </div>
          <button
            onClick={handlePasswordSubmit}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Info Phase ──
  if (phase === 'info') {
    const testFile = getTestFile(assignment);
    const questionCount = getQuestionCount(assignment);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {skillIcons[assignment.testType]}
            </div>
            <h1 className="mt-4 text-2xl font-bold">{getTestTitle(assignment)}</h1>
            <p className="mt-1 text-sm text-muted-foreground capitalize">{assignment.testType} Test</p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/50 p-3">
              <FileText className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold">{questionCount}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold">{assignment.timeLimitMinutes} min</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <CheckCircle className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold">Auto</p>
              <p className="text-xs text-muted-foreground">Grading</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ismingiz *</label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="To'liq ismingiz"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
              <input
                type="email"
                value={studentEmail}
                onChange={e => setStudentEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            ⚠️ Boshlagandan keyin taymer to'xtamaydi. Barqaror internet aloqasi mavjudligiga ishonch hosil qiling.
          </div>

          <button
            onClick={startTest}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            Testni Boshlash
          </button>
        </div>
      </div>
    );
  }

  // ── Taking Phase (Reading/Listening = iframe, Writing/Speaking = text) ──
  if (phase === 'taking') {
    const testFile = getTestFile(assignment);
    const isIframeTest = assignment.testType === 'reading' || assignment.testType === 'listening';

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold truncate max-w-xs">{getTestTitle(assignment)}</h1>
            <span className="text-xs text-muted-foreground capitalize">{assignment.testType}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-mono font-bold',
              timeLeft < 300 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-muted text-foreground'
            )}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
            >
              <Send className="h-4 w-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Content */}
        {isIframeTest && testFile ? (
          <div className="flex-1">
            <iframe
              src={testFile}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 56px)' }}
              title={getTestTitle(assignment)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-2xl space-y-6">
              {assignment.testType === 'writing' && (
                <WritingTestContent assignment={assignment} answers={answers} updateAnswer={updateAnswer} />
              )}
              {assignment.testType === 'speaking' && (
                <SpeakingTestContent assignment={assignment} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Submitting ──
  if (phase === 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Test topshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // ── Result Phase ──
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Test Topshirildi!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {assignment.testType === 'writing' || assignment.testType === 'speaking'
              ? 'O\'qituvchi baholini kutib turing.'
              : 'Natijangiz tayyor.'}
          </p>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Test:</span>
            <span className="font-medium">{getTestTitle(assignment)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Student:</span>
            <span className="font-medium">{studentName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Savollar:</span>
            <span className="font-medium">{Object.keys(answers).length} / {getQuestionCount(assignment)}</span>
          </div>
        </div>

        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          StartIELTS ga qaytish
        </Link>
      </div>
    </div>
  );
}

// ── Writing Test Content ──
function WritingTestContent({ assignment, answers, updateAnswer }: {
  assignment: TestAssignment;
  answers: Record<string, string>;
  updateAnswer: (id: string, val: string) => void;
}) {
  const writingTest = WRITING_TESTS.find(t => t.id === assignment.testId);
  if (!writingTest) return <p className="text-sm text-muted-foreground">Test content not found.</p>;

  return (
    <div className="space-y-6">
      {/* Task 1 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">TASK 1</span>
          <span className="text-xs text-muted-foreground">{writingTest.task1.type} · 20 min</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{writingTest.task1.prompt}</p>
        <textarea
          value={answers['task1'] || ''}
          onChange={e => updateAnswer('task1', e.target.value)}
          placeholder="Write your answer here (minimum 150 words)..."
          rows={10}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">
          {(answers['task1'] || '').split(/\s+/).filter(Boolean).length} words
        </p>
      </div>

      {/* Task 2 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">TASK 2</span>
          <span className="text-xs text-muted-foreground">{writingTest.task2.type} · 40 min</span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{writingTest.task2.prompt}</p>
        <textarea
          value={answers['task2'] || ''}
          onChange={e => updateAnswer('task2', e.target.value)}
          placeholder="Write your answer here (minimum 250 words)..."
          rows={15}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
        />
        <p className="text-xs text-muted-foreground text-right">
          {(answers['task2'] || '').split(/\s+/).filter(Boolean).length} words
        </p>
      </div>
    </div>
  );
}

// ── Speaking Test Content ──
function SpeakingTestContent({ assignment }: { assignment: TestAssignment }) {
  const topic = SPEAKING_TOPICS.find(t => t.id === assignment.testId);
  if (!topic) return <p className="text-sm text-muted-foreground">Topic not found.</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">SPEAKING PRACTICE</span>
        <h2 className="text-lg font-bold">{topic.title}</h2>
        <p className="text-sm text-muted-foreground">Category: {topic.category}</p>
      </div>

      {/* Part 1 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-bold text-sm">Part 1 — Introduction</h3>
        {topic.part1.questions.map((q, i) => (
          <div key={i} className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm">{q}</p>
          </div>
        ))}
      </div>

      {/* Part 2 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-bold text-sm">Part 2 — Cue Card</h3>
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm font-medium">{topic.part2.cueCard.topic}</p>
          <ul className="mt-2 space-y-1">
            {topic.part2.cueCard.prompts.map((p, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Part 3 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-bold text-sm">Part 3 — Discussion</h3>
        {topic.part3.questions.map((q, i) => (
          <div key={i} className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm">{q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
