'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Clock, Headphones, BookOpen, PenLine, Mic,
  AlertTriangle, CheckCircle, ChevronRight, ChevronLeft, Volume2, VolumeX,
} from 'lucide-react';
import {
  getMockExamDef, createMockSession, completeMockSession, getMockSessions,
  LISTENING_QUESTION_BANKS, MOCK_READING_QUESTIONS, MOCK_READING_PASSAGES,
  MOCK_WRITING_TASKS, MOCK_SPEAKING_PARTS,
  listeningScoreToBand, readingScoreToBand,
} from '@/lib/mock-exam-data';
import { BarChart, LineGraph, PieChart } from '@/components/writing/charts';
import { analyseWriting } from '@/lib/writing-analysis';
import { addTestResult } from '@/lib/store';
import type { MockExamDef, MockExamSession, MockExamSectionName } from '@/lib/types';
import { cn } from '@/lib/utils';

const sectionIcons = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic };
const sectionColors = { listening: 'violet', reading: 'emerald', writing: 'blue', speaking: 'amber' };
const SECTION_ORDER: MockExamSectionName[] = ['listening', 'reading', 'writing', 'speaking'];

type ExamState = 'intro' | 'listening' | 'reading' | 'writing' | 'speaking' | 'results';

export default function MockExamRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<MockExamDef | null>(null);
  const [session, setSession] = useState<MockExamSession | null>(null);
  const [examState, setExamState] = useState<ExamState>('intro');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Listening answers ──
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [listeningPart, setListeningPart] = useState(1);

  // ── Reading answers ──
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});
  const [readingPassage, setReadingPassage] = useState(0);

  // ── Writing answers ──
  const [writingTask1, setWritingTask1] = useState('');
  const [writingTask2, setWritingTask2] = useState('');
  const [writingActiveTask, setWritingActiveTask] = useState<1 | 2>(1);

  // ── Speaking ──
  const [speakingPart, setSpeakingPart] = useState(0);
  const [speakingRecording, setSpeakingRecording] = useState(false);
  const [speakingTimers, setSpeakingTimers] = useState({ prepare: 0, speak: 0 });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // ── Listening Audio ──
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  // ── Results ──
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const def = getMockExamDef(examId);
    if (!def) { router.push('/mock-exam'); return; }
    setExam(def);
    const existing = getMockSessions().find(s => s.status === 'in_progress' && s.examId === def.id);
    if (existing) {
      setSession(existing);
      setExamState(existing.currentSection as ExamState);
    } else {
      const newSession = createMockSession(def.id);
      setSession(newSession);
    }
  }, [examId, router]);

  // Timer
  useEffect(() => {
    if (examState === 'intro' || examState === 'results') return;
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examState]);

  // Auto-play listening audio when entering listening section
  useEffect(() => {
    if (examState === 'listening' && exam?.listeningAudioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(exam.listeningAudioUrl);
        audioRef.current.preload = 'auto';
        setAudioReady(true);
      }
      // Auto-play after a short delay
      const timeout = setTimeout(() => {
        audioRef.current?.play().catch(() => {
          // Browser blocked auto-play, user needs to click
          setAudioPlaying(false);
        });
        setAudioPlaying(true);
        setAudioDuration(audioRef.current?.duration || 2400);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [examState, exam]);

  // Track audio progress
  useEffect(() => {
    if (!audioRef.current || !audioPlaying) return;
    const audio = audioRef.current;
    const onTimeUpdate = () => {
      setAudioProgress(audio.currentTime);
      setAudioDuration(audio.duration || 0);
    };
    const onEnded = () => {
      setAudioPlaying(false);
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioPlaying]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // ── Current exam's listening questions from the matching bank ──
  const listeningQuestions = exam ? (LISTENING_QUESTION_BANKS[exam.listeningBankId || 'cambridge-21-1'] || []) : [];

  // ── Listening scoring ──
  const scoreListening = useCallback(() => {
    let correct = 0;
    listeningQuestions.forEach(q => {
      const userAns = (listeningAnswers[q.questionNum] || '').trim().toLowerCase();
      const correctAns = q.correctAnswer.toLowerCase();
      const alts = (q.acceptAlts || []).map(a => a.toLowerCase());
      if (userAns === correctAns || alts.includes(userAns)) correct++;
    });
    return { correct, total: listeningQuestions.length, band: listeningScoreToBand(correct) };
  }, [listeningAnswers, listeningQuestions]);

  // ── Reading scoring ──
  const scoreReading = useCallback(() => {
    let correct = 0;
    MOCK_READING_QUESTIONS.forEach(q => {
      const userAns = (readingAnswers[q.questionNum] || '').trim().toUpperCase();
      const correctAns = q.correctAnswer.toUpperCase();
      if (userAns === correctAns || userAns === correctAns.replace(' ', '')) correct++;
    });
    return { correct, total: MOCK_READING_QUESTIONS.length, band: readingScoreToBand(correct) };
  }, [readingAnswers]);

  // ── Writing scoring ──
  const scoreWriting = useCallback(() => {
    const analysis = analyseWriting(writingTask1, writingTask2);
    return analysis.overallBand;
  }, [writingTask1, writingTask2]);

  // ── Finish exam ──
  const finishExam = useCallback(() => {
    if (!session || !exam) return;

    const lScore = scoreListening();
    const rScore = scoreReading();
    const wBand = scoreWriting();
    const sBand = 6.5; // Estimated speaking band

    const overallBand = (lScore.band + rScore.band + wBand + sBand) / 4;
    const roundedBand = Math.round(overallBand * 2) / 2;

    const completed = completeMockSession(session.id, {
      listening: lScore.band,
      reading: rScore.band,
      writing: wBand,
      speaking: sBand,
    }, roundedBand);

    addTestResult({
      id: `mock-${session.id}`,
      testId: session.examId,
      testTitle: exam.title,
      skill: 'mock',
      overallBand: roundedBand,
      correctAnswers: lScore.correct + rScore.correct,
      totalQuestions: lScore.total + rScore.total,
      accuracy: Math.round(((lScore.correct + rScore.correct) / (lScore.total + rScore.total)) * 100),
      timeSpentMinutes: completed.timeSpentMinutes || Math.floor(elapsed / 60),
      completedAt: new Date().toISOString(),
    });

    setResults({
      listening: lScore,
      reading: rScore,
      writingBand: wBand,
      speakingBand: sBand,
      overallBand: roundedBand,
      writingAnalysis: analyseWriting(writingTask1, writingTask2),
    });
    setSession(completed);
    setExamState('results');
  }, [session, exam, scoreListening, scoreReading, scoreWriting, elapsed, writingTask1, writingTask2]);

  const goToSection = (section: MockExamSectionName) => {
    if (session) {
      const updated = { ...session, currentSection: section };
      setSession(updated);
    }
    setExamState(section);
  };

  const nextSection = () => {
    const currentIdx = SECTION_ORDER.indexOf(examState as MockExamSectionName);
    if (currentIdx < SECTION_ORDER.length - 1) {
      goToSection(SECTION_ORDER[currentIdx + 1]);
    } else {
      finishExam();
    }
  };

  const prevSection = () => {
    const currentIdx = SECTION_ORDER.indexOf(examState as MockExamSectionName);
    if (currentIdx > 0) goToSection(SECTION_ORDER[currentIdx - 1]);
  };

  if (!exam) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  // ═══════ INTRO ═══════
  if (examState === 'intro') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-3xl">📝</span>
            </div>
            <h1 className="text-xl font-bold">{exam.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{exam.subtitle} · {exam.totalMinutes} min total</p>
          </div>

          <div className="space-y-2 mb-6">
            {SECTION_ORDER.map(s => {
              const Icon = sectionIcons[s];
              const mins = s === 'listening' ? 40 : s === 'reading' ? 60 : s === 'writing' ? 60 : 15;
              return (
                <div key={s} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Icon className={cn('h-4 w-4', `text-${sectionColors[s]}-500`)} />
                  <span className="text-sm font-medium capitalize">{s}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{mins} min</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-200 p-3 mb-6 text-xs text-amber-800">
            <p className="font-semibold mb-1">⚠️ Important:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Once started, sections progress in order</li>
              <li>You can go back to previous sections</li>
              <li>All answers are scored automatically</li>
              <li>Writing is analysed across 4 IELTS criteria</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link href="/mock-exam" className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium hover:bg-muted transition-colors">Cancel</Link>
            <button onClick={() => setExamState('listening')} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Begin Exam →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ RESULTS ═══════
  if (examState === 'results' && results) {
    const overall = results.overallBand;
    const bandLevel = overall >= 8 ? 'Very Good User' : overall >= 7 ? 'Good User' : overall >= 6 ? 'Competent User' : overall >= 5 ? 'Modest User' : 'Limited User';
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-4xl font-bold text-primary">{overall.toFixed(1)}</span>
            </div>
            <h1 className="text-2xl font-bold">Mock Exam Complete!</h1>
            <p className="text-muted-foreground mt-1">{exam.title}</p>
            <p className="text-sm text-muted-foreground">{bandLevel} · {formatTime(elapsed)} total</p>
          </div>

          {/* Overall band bar */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Overall Band Score</h2>
            <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-1000', overall >= 7 ? 'bg-emerald-500' : overall >= 5 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${(overall / 9) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0</span><span>3</span><span>5</span><span>7</span><span>9</span>
            </div>
          </div>

          {/* Section scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Listening', band: results.listening.band, correct: results.listening.correct, total: results.listening.total, icon: Headphones, color: 'violet' },
              { label: 'Reading', band: results.reading.band, correct: results.reading.correct, total: results.reading.total, icon: BookOpen, color: 'emerald' },
              { label: 'Writing', band: results.writingBand, correct: null, total: null, icon: PenLine, color: 'blue' },
              { label: 'Speaking', band: results.speakingBand, correct: null, total: null, icon: Mic, color: 'amber' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={cn('h-4 w-4', `text-${s.color}-500`)} />
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                <div className="text-2xl font-bold">{s.band.toFixed(1)}</div>
                {s.correct !== null && (
                  <p className="text-xs text-muted-foreground mt-1">{s.correct}/{s.total} correct</p>
                )}
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full', `bg-${s.color}-500`)} style={{ width: `${(s.band / 9) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Writing Analysis */}
          {results.writingAnalysis && (
            <div className="rounded-2xl border border-border bg-card p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Writing Analysis</h2>
              <div className="space-y-3">
                {[
                  { label: 'Task Achievement', band: results.writingAnalysis.taskAchievement.band, desc: results.writingAnalysis.taskAchievement.description },
                  { label: 'Coherence & Cohesion', band: results.writingAnalysis.coherenceCohesion.band, desc: results.writingAnalysis.coherenceCohesion.description },
                  { label: 'Lexical Resource', band: results.writingAnalysis.lexicalResource.band, desc: results.writingAnalysis.lexicalResource.description },
                  { label: 'Grammar', band: results.writingAnalysis.grammar.band, desc: results.writingAnalysis.grammar.description },
                ].map(c => (
                  <div key={c.label} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className={cn('text-sm font-bold rounded px-2 py-0.5', c.band >= 7 ? 'bg-emerald-500/10 text-emerald-600' : c.band >= 5.5 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600')}>
                        {c.band.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listening wrong answers review */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Listening Review</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {listeningQuestions.filter(q => {
                const userAns = (listeningAnswers[q.questionNum] || '').trim().toLowerCase();
                const correctAns = q.correctAnswer.toLowerCase();
                const alts = (q.acceptAlts || []).map(a => a.toLowerCase());
                return userAns !== correctAns && !alts.includes(userAns);
              }).map(q => (
                <div key={q.questionNum} className="flex items-start gap-3 rounded-lg bg-red-500/5 p-2 text-sm">
                  <span className="font-bold text-red-500 flex-shrink-0">Q{q.questionNum}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{q.prompt}</p>
                    <p className="text-xs">Your: <span className="text-red-500">{listeningAnswers[q.questionNum] || '(blank)'}</span> → Correct: <span className="text-emerald-600 font-medium">{q.correctAnswer}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reading wrong answers review */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Reading Review</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {MOCK_READING_QUESTIONS.filter(q => {
                const userAns = (readingAnswers[q.questionNum] || '').trim().toUpperCase();
                return userAns !== q.correctAnswer.toUpperCase();
              }).map(q => (
                <div key={q.questionNum} className="flex items-start gap-3 rounded-lg bg-red-500/5 p-2 text-sm">
                  <span className="font-bold text-red-500 flex-shrink-0">Q{q.questionNum}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{q.prompt}</p>
                    <p className="text-xs">Your: <span className="text-red-500">{readingAnswers[q.questionNum] || '(blank)'}</span> → Correct: <span className="text-emerald-600 font-medium">{q.correctAnswer}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/mock-exam" className="rounded-xl border border-border px-5 py-3 text-sm font-medium hover:bg-muted transition-colors">Take Another Exam</Link>
            <Link href="/dashboard" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Dashboard →</Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ LISTENING ═══════
  if (examState === 'listening') {
    const partQuestions = listeningQuestions.filter(q => q.part === listeningPart);
    return (
      <div className="flex h-screen flex-col bg-background">
        <Header exam={exam} elapsed={elapsed} formatTime={formatTime} section="listening" sectionState={examState} goToSection={goToSection} prevSection={prevSection} nextSection={nextSection} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full">
          <div className="rounded-2xl bg-card border border-border p-4 sm:p-6 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Headphones className="h-5 w-5 text-violet-500" />
              <h2 className="text-lg font-bold">Listening Part {listeningPart}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-violet-500/10 p-3 text-sm text-violet-700">
              <Volume2 className="h-4 w-4 flex-shrink-0" />
              <p>In the real exam, audio plays automatically. Type your answers below for each question.</p>
            </div>

            {/* Audio Player */}
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <button onClick={() => {
                  if (!audioRef.current && exam?.listeningAudioUrl) {
                    audioRef.current = new Audio(exam.listeningAudioUrl);
                    audioRef.current.preload = 'auto';
                    setAudioReady(true);
                  }
                  if (audioRef.current) {
                    if (audioPlaying) {
                      audioRef.current.pause();
                      setAudioPlaying(false);
                    } else {
                      audioRef.current.play().catch(() => {});
                      setAudioPlaying(true);
                    }
                  }
                }} className={cn('flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors',
                  audioPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-violet-500 hover:bg-violet-600'
                )}>
                  {audioPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-violet-700 mb-1">
                    <span>{audioPlaying ? '▶ Playing IELTS Listening Audio' : 'Audio paused — tap play to continue'}</span>
                    <span className="font-mono">{formatTime(audioProgress)} / {formatTime(audioDuration || 0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-violet-200 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${audioDuration ? (audioProgress / audioDuration) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
              {audioPlaying && (
                <div className="flex items-center gap-2 text-xs text-violet-600 animate-pulse">
                  <div className="h-3 w-3 rounded-full bg-violet-400 animate-pulse" />
                  <span>🎧 Listen carefully and write your answers below — audio plays once like the real IELTS exam</span>
                </div>
              )}
              {!audioPlaying && audioProgress > 0 && audioProgress >= (audioDuration || 0) - 1 && (
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <span>✅ Audio finished. Check your answers and move to the next section.</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {partQuestions.map(q => (
              <div key={q.questionNum} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 flex-shrink-0">
                    {q.questionNum}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-2">{q.prompt}</p>
                    {q.type === 'choice' && q.options ? (
                      <div className="space-y-1.5">
                        {q.options.map(opt => (
                          <label key={opt} className={cn('flex items-center gap-2 rounded-lg border p-2.5 text-sm cursor-pointer transition-colors',
                            listeningAnswers[q.questionNum] === opt.charAt(0) ? 'border-violet-300 bg-violet-50 dark:bg-violet-950/30' : 'border-border hover:bg-muted'
                          )}>
                            <input type="radio" name={`q${q.questionNum}`} value={opt.charAt(0)}
                              checked={listeningAnswers[q.questionNum] === opt.charAt(0)}
                              onChange={() => setListeningAnswers(p => ({ ...p, [q.questionNum]: opt.charAt(0) }))}
                              className="accent-violet-500" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input type="text" value={listeningAnswers[q.questionNum] || ''}
                        onChange={e => setListeningAnswers(p => ({ ...p, [q.questionNum]: e.target.value }))}
                        placeholder="Type your answer..."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Part navigation */}
          <div className="flex items-center justify-between mt-6 mb-20">
            <button onClick={() => setListeningPart(p => Math.max(1, p - 1))} disabled={listeningPart === 1}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" /> Part {listeningPart - 1 || 1}
            </button>
            <div className="flex gap-1.5">
              {[1,2,3,4].map(p => (
                <button key={p} onClick={() => setListeningPart(p)} className={cn('h-8 w-8 rounded-full text-xs font-bold transition-colors',
                  p === listeningPart ? 'bg-violet-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}>{p}</button>
              ))}
            </div>
            {listeningPart < 4 ? (
              <button onClick={() => setListeningPart(p => p + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                Part {listeningPart + 1} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={nextSection}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Reading → <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════ READING ═══════
  if (examState === 'reading') {
    const passage = MOCK_READING_PASSAGES[readingPassage];
    const passageQuestions = MOCK_READING_QUESTIONS.filter(q => q.passage === readingPassage + 1);
    return (
      <div className="flex h-screen flex-col bg-background">
        <Header exam={exam} elapsed={elapsed} formatTime={formatTime} section="reading" sectionState={examState} goToSection={goToSection} prevSection={prevSection} nextSection={nextSection} />
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Passage panel */}
          <div className="md:w-1/2 overflow-y-auto p-4 sm:p-6 border-r border-border">
            <h2 className="text-lg font-bold mb-2">{passage.title}</h2>
            <p className="text-xs text-muted-foreground mb-4">Passage {readingPassage + 1} of 3</p>
            <div className="space-y-3">
              {passage.paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/90">{p}</p>
              ))}
            </div>
          </div>
          {/* Questions panel */}
          <div className="md:w-1/2 overflow-y-auto p-4 sm:p-6">
            <h3 className="font-bold mb-4">Questions</h3>
            <div className="space-y-4">
              {passageQuestions.map(q => (
                <div key={q.questionNum} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 flex-shrink-0">{q.questionNum}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-2">{q.prompt}</p>
                      {(q.type === 'tfng' || q.type === 'ynng') ? (
                        <div className="flex flex-wrap gap-2">
                          {(q.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map(opt => (
                            <button key={opt} onClick={() => setReadingAnswers(p => ({ ...p, [q.questionNum]: opt }))}
                              className={cn('rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                                readingAnswers[q.questionNum] === opt ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30' : 'border-border hover:bg-muted'
                              )}>{opt}</button>
                          ))}
                        </div>
                      ) : q.type === 'mcq' && q.options ? (
                        <div className="space-y-1.5">
                          {q.options.map(opt => (
                            <label key={opt} className={cn('flex items-center gap-2 rounded-lg border p-2.5 text-sm cursor-pointer transition-colors',
                              readingAnswers[q.questionNum] === opt.charAt(0) ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'border-border hover:bg-muted'
                            )}>
                              <input type="radio" name={`rq${q.questionNum}`} value={opt.charAt(0)}
                                checked={readingAnswers[q.questionNum] === opt.charAt(0)}
                                onChange={() => setReadingAnswers(p => ({ ...p, [q.questionNum]: opt.charAt(0) }))}
                                className="accent-emerald-500" />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input type="text" value={readingAnswers[q.questionNum] || ''}
                          onChange={e => setReadingAnswers(p => ({ ...p, [q.questionNum]: e.target.value }))}
                          placeholder="Type your answer..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 mb-20">
              <button onClick={() => setReadingPassage(p => Math.max(0, p - 1))} disabled={readingPassage === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" /> Passage {readingPassage || 1}
              </button>
              <div className="flex gap-1.5">
                {[0,1,2].map(p => (
                  <button key={p} onClick={() => setReadingPassage(p)} className={cn('h-8 w-8 rounded-full text-xs font-bold transition-colors',
                    p === readingPassage ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}>{p + 1}</button>
                ))}
              </div>
              {readingPassage < 2 ? (
                <button onClick={() => setReadingPassage(p => p + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                  Passage {readingPassage + 2} <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={nextSection}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  Writing → <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ WRITING ═══════
  if (examState === 'writing') {
    const task = MOCK_WRITING_TASKS[0];
    const currentText = writingActiveTask === 1 ? writingTask1 : writingTask2;
    const setCurrentText = writingActiveTask === 1 ? setWritingTask1 : setWritingTask2;
    const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;
    const minWords = writingActiveTask === 1 ? 150 : 250;

    return (
      <div className="flex h-screen flex-col bg-background">
        <Header exam={exam} elapsed={elapsed} formatTime={formatTime} section="writing" sectionState={examState} goToSection={goToSection} prevSection={prevSection} nextSection={nextSection} />
        {/* Mobile task tabs */}
        <div className="flex md:hidden border-b border-border bg-muted/30">
          <button onClick={() => setWritingActiveTask(1)} className={cn('flex-1 py-2.5 text-xs font-semibold', writingActiveTask === 1 ? 'bg-card border-b-2 border-primary text-foreground' : 'text-muted-foreground')}>Task 1</button>
          <button onClick={() => setWritingActiveTask(2)} className={cn('flex-1 py-2.5 text-xs font-semibold', writingActiveTask === 2 ? 'bg-card border-b-2 border-primary text-foreground' : 'text-muted-foreground')}>Task 2</button>
        </div>
        <div className="flex flex-1 min-h-0">
          {/* Instructions */}
          <div className={cn('md:w-1/2 border-r border-border overflow-y-auto p-4 sm:p-6', writingActiveTask !== 1 ? 'hidden md:block' : '')}>
            <div className="space-y-4">
              <div>
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2', writingActiveTask === 1 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-violet-500/10 text-violet-600')}>
                  Task {writingActiveTask}
                </span>
                <h2 className="text-lg font-bold">Writing Task {writingActiveTask}</h2>
                <p className="text-xs text-muted-foreground mt-1">You should spend about {writingActiveTask === 1 ? '20' : '40'} minutes on this task.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm leading-relaxed whitespace-pre-line">{writingActiveTask === 1 ? task.task1.prompt : task.task2.prompt}</p>
                {writingActiveTask === 1 && task.task1.chartData && (
                  <div className="mt-4">
                    {task.task1.chartData.type === 'bar' && (
                      <BarChart
                        title={task.task1.chartData.title}
                        data={{
                          labels: task.task1.chartData.categories,
                          datasets: task.task1.chartData.datasets.map((ds: any, i: number) => ({
                            name: ds.label,
                            values: ds.data,
                            color: task.task1.chartData.colors[i],
                          })),
                        }}
                      />
                    )}
                    {task.task1.chartData.type === 'line' && (
                      <LineGraph
                        title={task.task1.chartData.title}
                        data={{
                          labels: task.task1.chartData.categories,
                          datasets: task.task1.chartData.datasets.map((ds: any, i: number) => ({
                            name: ds.label,
                            values: ds.data,
                            color: task.task1.chartData.colors[i],
                          })),
                        }}
                      />
                    )}
                    {task.task1.chartData.type === 'pie' && (
                      <PieChart
                        title={task.task1.chartData.title}
                        data={{
                          segments: task.task1.chartData.datasets.map((ds: any, i: number) => ({
                            name: ds.label,
                            value: ds.data,
                            color: task.task1.chartData.colors[i],
                          })),
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Writing area */}
          <div className={cn('flex flex-col flex-1 min-h-0', writingActiveTask !== 2 ? 'hidden md:flex' : '')}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-sm font-medium">Task {writingActiveTask} Response</span>
              <span className={cn('text-xs font-medium', wordCount >= minWords ? 'text-emerald-600' : wordCount > 0 ? 'text-amber-600' : 'text-muted-foreground')}>
                {wordCount} / {minWords} words {wordCount >= minWords && '✓'}
              </span>
            </div>
            <textarea value={currentText} onChange={e => setCurrentText(e.target.value)}
              className="flex-1 resize-none p-6 text-sm leading-relaxed focus:outline-none bg-card placeholder:text-muted-foreground/50"
              placeholder={writingActiveTask === 1 ? 'Write your Task 1 response here...' : 'Write your Task 2 essay here...'} />
            <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
              <div className="flex gap-2">
                {writingActiveTask === 2 && (
                  <button onClick={() => setWritingActiveTask(1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted">
                    <ChevronLeft className="h-3.5 w-3.5" /> Task 1
                  </button>
                )}
              </div>
              {writingActiveTask === 2 ? (
                <button onClick={nextSection} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Speaking → <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={() => setWritingActiveTask(2)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Task 2 <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════ SPEAKING ═══════
  if (examState === 'speaking') {
    const parts = MOCK_SPEAKING_PARTS[0];
    const part = parts[speakingPart];
    return (
      <div className="flex h-screen flex-col bg-background">
        <Header exam={exam} elapsed={elapsed} formatTime={formatTime} section="speaking" sectionState={examState} goToSection={goToSection} prevSection={prevSection} nextSection={nextSection} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">
          <div className="rounded-2xl bg-card border border-border p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Mic className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold">Speaking Part {part.part}</h2>
            </div>

            {part.part === 2 && part.cueCard && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-200 p-4 mb-4">
                <p className="text-sm font-semibold text-amber-700 mb-2">📋 Cue Card</p>
                <p className="text-sm whitespace-pre-line">{part.cueCard}</p>
              </div>
            )}

            <div className="space-y-3">
              {part.questions.map((q, i) => (
                <div key={i} className="rounded-lg border border-border p-3 text-sm">
                  <span className="font-medium text-amber-600">Q{i + 1}: </span>{q}
                </div>
              ))}
            </div>
          </div>

          {/* Recording */}
          <div className="rounded-2xl bg-card border border-border p-6 text-center">
            <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-colors',
              speakingRecording ? 'bg-red-500/10 animate-pulse' : 'bg-amber-500/10'
            )}>
              <Mic className={cn('h-8 w-8', speakingRecording ? 'text-red-500' : 'text-amber-500')} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {speakingRecording ? 'Recording... Click to stop' : 'Click to start recording your response'}
            </p>
            <button onClick={async () => {
              if (speakingRecording) {
                mediaRecorderRef.current?.stop();
                setSpeakingRecording(false);
              } else {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  const recorder = new MediaRecorder(stream);
                  audioChunksRef.current = [];
                  recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                  recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
                  recorder.start();
                  mediaRecorderRef.current = recorder;
                  setSpeakingRecording(true);
                } catch (err) {
                  alert('Microphone access is required for speaking practice.');
                }
              }
            }} className={cn('inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all',
              speakingRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
            )}>
              {speakingRecording ? <><VolumeX className="h-4 w-4" /> Stop Recording</> : <><Volume2 className="h-4 w-4" /> Start Recording</>}
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 mb-10">
            <button onClick={() => setSpeakingPart(p => Math.max(0, p - 1))} disabled={speakingPart === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" /> Part {part.part - 1 || 1}
            </button>
            <div className="flex gap-1.5">
              {[0,1,2].map(p => (
                <button key={p} onClick={() => setSpeakingPart(p)} className={cn('h-8 w-8 rounded-full text-xs font-bold transition-colors',
                  p === speakingPart ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}>{p + 1}</button>
              ))}
            </div>
            <button onClick={nextSection}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              {speakingPart < 2 ? `Part ${speakingPart + 2}` : 'See Results'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ═══════ HEADER ═══════
function Header({ exam, elapsed, formatTime, section, sectionState, goToSection, prevSection, nextSection }: {
  exam: MockExamDef; elapsed: number; formatTime: (s: number) => string;
  section: string; sectionState: string;
  goToSection: (s: MockExamSectionName) => void; prevSection: () => void; nextSection: () => void;
}) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-3 sm:px-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Link href="/mock-exam" className="inline-flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-4 w-px bg-border flex-shrink-0" />
        <span className="text-xs sm:text-sm font-semibold truncate">{exam.title}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 rounded-lg border px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-mono border-border bg-muted/50">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="font-semibold">{formatTime(elapsed)}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {SECTION_ORDER.map(s => {
            const Icon = sectionIcons[s];
            return (
              <button key={s} onClick={() => goToSection(s)} className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                s === sectionState ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )} title={s}>
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
        <button onClick={nextSection} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {sectionState === 'speaking' ? 'Finish' : 'Next'} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
