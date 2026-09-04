'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle,
  GraduationCap, FileText, Send, Lock
} from 'lucide-react';
import {
  getTestByCode, autoGradeTest, addSubmission,
  type TeacherTest, type TestSubmission
} from '@/lib/teacher-test-store';
import { cn } from '@/lib/utils';

type Phase = 'info' | 'taking' | 'submitting' | 'result';

export default function StudentTestPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [test, setTest] = useState<TeacherTest | null>(null);
  const [phase, setPhase] = useState<Phase>('info');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [result, setResult] = useState<TestSubmission | null>(null);
  const [error, setError] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (code) {
      const found = getTestByCode(code);
      if (!found) {
        setError('Test not found. Please check the link.');
      } else if (found.status !== 'active') {
        setError('This test is not currently active.');
      } else {
        setTest(found);
      }
    }
  }, [code]);

  // Timer
  useEffect(() => {
    if (phase !== 'taking' || !test) return;

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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, test]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const startTest = () => {
    if (!studentName.trim() || !studentEmail.trim()) {
      alert('Please enter your name and email.');
      return;
    }
    setTimeLeft((test?.access.timeLimitMinutes || 60) * 60);
    setPhase('taking');
    setCurrentIdx(0);
  };

  const updateAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(() => {
    if (!test) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setPhase('submitting');

    const gradeResult = autoGradeTest(test, answers);

    const submission = addSubmission({
      testId: test.id,
      testCode: test.code,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      answers,
      score: gradeResult.score,
      correctCount: gradeResult.correctCount,
      totalQuestions: gradeResult.band > 0 ? test.questions.filter(q => q.type !== 'essay').length : 0,
      band: gradeResult.band,
      timeSpentSeconds: (test.access.timeLimitMinutes * 60) - timeLeft,
      status: test.questions.some(q => q.type === 'essay') ? 'pending_review' : 'auto_graded',
    });

    setResult(submission);
    setPhase('result');
  }, [test, answers, studentName, studentEmail, timeLeft]);

  const answeredCount = Object.keys(answers).length;

  // ── Error state ──
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold">Test Unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            Go to StartIELTS
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ── Info Phase ──
  if (phase === 'info') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">{test.title}</h1>
            {test.description && (
              <p className="mt-2 text-sm text-muted-foreground">{test.description}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted/50 p-3">
              <FileText className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold">{test.questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold">{test.access.timeLimitMinutes} min</p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <Lock className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold capitalize">{test.skill}</p>
              <p className="text-xs text-muted-foreground">Skill</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name *</label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Email *</label>
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
            ⚠️ Once you start, the timer cannot be paused. Make sure you have a stable internet connection.
          </div>

          <button
            onClick={startTest}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  // ── Taking Phase ──
  if (phase === 'taking') {
    const q = test.questions[currentIdx];
    const isLast = currentIdx === test.questions.length - 1;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold truncate max-w-xs">{test.title}</h1>
            <span className="text-xs text-muted-foreground capitalize">{test.skill}</span>
          </div>
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-mono font-bold',
            timeLeft < 300 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-muted text-foreground'
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question navigation dots */}
        <div className="border-b border-border bg-card px-4 py-2 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {test.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={cn(
                  'h-7 w-7 rounded-md text-xs font-bold transition-all flex-shrink-0',
                  i === currentIdx ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                  answers[test.questions[i].id] ? 'bg-emerald-100 text-emerald-700' :
                  'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Show passage for Reading */}
            {test.passages && test.passages.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-muted-foreground mb-3">PASSAGE</h3>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {test.passages[0].content}
                </div>
              </div>
            )}

            {/* Question */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                  {currentIdx + 1}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {q.type.replace(/_/g, ' ')}
                </span>
                {q.points > 1 && (
                  <span className="text-xs text-muted-foreground">({q.points} points)</span>
                )}
              </div>

              <p className="text-sm font-medium leading-relaxed">{q.text}</p>

              {/* Multiple Choice */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                      <label
                        key={i}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                          answers[q.id] === letter
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/30'
                        )}
                      >
                        <div className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold',
                          answers[q.id] === letter ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground'
                        )}>
                          {letter}
                        </div>
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* True/False/Not Given */}
              {(q.type === 'true_false_not_given' || q.type === 'yes_no_not_given') && (
                <div className="space-y-2">
                  {(q.type === 'true_false_not_given' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map(opt => (
                    <label
                      key={opt}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                        answers[q.id] === opt
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/30'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        answers[q.id] === opt ? 'border-primary' : 'border-border'
                      )}>
                        {answers[q.id] === opt && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-sm font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Short Answer / Fill Blank / Sentence Completion */}
              {['short_answer', 'fill_blank', 'sentence_completion'].includes(q.type) && (
                <input
                  value={answers[q.id] || ''}
                  onChange={e => updateAnswer(q.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}

              {/* Essay */}
              {q.type === 'essay' && (
                <div>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={e => updateAnswer(q.id, e.target.value)}
                    placeholder="Write your essay here..."
                    rows={12}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {answers[q.id]?.length || 0} characters — This essay will be reviewed by your teacher.
                  </p>
                </div>
              )}

              {/* Matching */}
              {q.type === 'matching' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-32 truncate">{opt}</span>
                      <span className="text-muted-foreground">→</span>
                      <input
                        value={answers[`${q.id}_${i}`] || ''}
                        onChange={e => updateAnswer(`${q.id}_${i}`, e.target.value)}
                        placeholder="Match"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="sticky bottom-0 z-40 border-t border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-2xl flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-muted transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-xs text-muted-foreground">
              {answeredCount} / {test.questions.length} answered
            </span>

            {isLast ? (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700 transition-all"
              >
                <Send className="h-4 w-4" />
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Submitting ──
  if (phase === 'submitting') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-lg font-semibold">Submitting your test...</p>
        </div>
      </div>
    );
  }

  // ── Result ──
  if (phase === 'result' && result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Test Submitted ✓</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your test has been submitted successfully.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Correct</p>
              <p className="mt-1 text-2xl font-bold">{result.correctCount}/{result.totalQuestions}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="mt-1 text-2xl font-bold">{result.score}%</p>
            </div>
            <div className="rounded-xl bg-primary/10 p-4">
              <p className="text-xs text-primary font-semibold">Band</p>
              <p className="mt-1 text-2xl font-bold text-primary">{result.band.toFixed(1)}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Time: {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s</p>
            {result.status === 'pending_review' && (
              <p className="text-amber-600 font-medium">⏳ This test includes essays that need teacher review.</p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Your teacher can see your results in their panel.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
