'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Play, Pause, ChevronLeft, ChevronRight, Clock, Star, MessageCircle, CheckCircle, AlertCircle, BookOpen, Volume2, RotateCcw, Send, Trophy, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addTestResult } from '@/lib/store';
import {
  SPEAKING_TOPICS,
  SPEAKING_CATEGORIES,
  evaluateSpeaking,
  getWordCount,
  type SpeakingTopic,
} from '@/lib/speaking-practice-data';

type SpeakingPart = 1 | 2 | 3;

// ═══ Web Speech API types ═══
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

function getSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  if (w.SpeechRecognition) return new (window.SpeechRecognition as new () => SpeechRecognition)();
  if (w.webkitSpeechRecognition) return new (window.webkitSpeechRecognition as new () => SpeechRecognition)();
  return null;
}

export default function SpeakingPracticePage() {
  const router = useRouter();

  // ═══ State ═══
  const [selectedCategory, setSelectedCategory] = useState('All Topics');
  const [currentTopic, setCurrentTopic] = useState<SpeakingTopic | null>(null);
  const [currentPart, setCurrentPart] = useState<SpeakingPart>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);

  // Part 2 specific
  const [prepTime, setPrepTime] = useState(60);
  const [isPrepping, setIsPrepping] = useState(false);
  const [part2SpeakTime, setPart2SpeakTime] = useState(120);

  // Results
  const [evaluation, setEvaluation] = useState<ReturnType<typeof evaluateSpeaking> | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);

  // Tracking state
  const [hasMovedForward, setHasMovedForward] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<string, string>>(new Map());
  const [sessionResults, setSessionResults] = useState<Array<{part: number; question: string; transcript: string; score: number; wordCount: number}>>([]);

  // ═══ Filtered topics ═══
  const filteredTopics = SPEAKING_TOPICS.filter(
    t => selectedCategory === 'All Topics' || t.category === selectedCategory,
  );

  // ═══ Current questions ═══
  const getQuestions = useCallback(() => {
    if (!currentTopic) return [];
    if (currentPart === 1) return currentTopic.part1.questions;
    if (currentPart === 3) return currentTopic.part3.questions;
    return [];
  }, [currentTopic, currentPart]);

  // ═══ Cleanup ═══
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  // ═══ Start Recording ═══
  const startRecording = useCallback(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = transcript;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
          setTranscript(finalTranscript.trim());
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      isRecordingRef.current = false;
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      // Auto-restart if still recording (use refs to avoid stale closures)
      if (isRecordingRef.current && !isPausedRef.current) {
        try { recognition.start(); } catch { /* ignore */ }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);
      setIsPaused(false);
      isRecordingRef.current = true;
      isPausedRef.current = false;

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch {
      alert('Could not start speech recognition. Please try again.');
    }
  }, [transcript, isRecording, isPaused]);

  // ═══ Stop Recording ═══
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    isPausedRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');
  }, []);

  // ═══ Pause Recording ═══
  const pauseRecording = useCallback(() => {
    isPausedRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(true);
    setPauseCount(prev => prev + 1);
    setInterimTranscript('');
  }, []);

  // ═══ Resume Recording ═══
  const resumeRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      setTranscript(prev => {
        let updated = prev;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            updated += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }
        setInterimTranscript(interim);
        return updated.trim();
      });
    };

    recognitionRef.current.onend = () => {
      if (isRecordingRef.current && !isPausedRef.current) {
        try { recognitionRef.current?.start(); } catch { /* ignore */ }
      }
    };

    try {
      recognitionRef.current.start();
      setIsPaused(false);
      isPausedRef.current = false;
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch { /* ignore */ }
  }, []);

  // ═══ Reset Recording ═══
  const resetRecording = useCallback(() => {
    stopRecording();
    setTranscript('');
    setInterimTranscript('');
    setRecordingTime(0);
    setPauseCount(0);
    setEvaluation(null);
    setShowResults(false);
    setPrepTime(60);
    setPart2SpeakTime(120);
    setIsPrepping(false);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
  }, [stopRecording]);

  // ═══ AI Evaluation state ═══
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // ═══ Evaluate ═══
  const handleEvaluate = useCallback(async () => {
    if (!transcript.trim()) {
      alert('Please record something first!');
      return;
    }

    // Local heuristic evaluation
    const result = evaluateSpeaking(transcript, recordingTime, pauseCount);
    setEvaluation(result);
    setShowResults(true);
    setAiFeedback(null);

    // Also call AI for detailed feedback
    setIsEvaluating(true);
    try {
      const questionText = currentPart === 2
        ? currentTopic!.part2.cueCard.topic
        : getQuestions()[currentQuestionIndex] || '';
      const res = await fetch('/api/speaking-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          answer: transcript,
          part: `Part ${currentPart}`,
        }),
      });
      const data = await res.json();
      if (data.response) {
        setAiFeedback(data.response);
      }
    } catch {
      // AI evaluation failed — local evaluation still shows
    } finally {
      setIsEvaluating(false);
    }
  }, [transcript, recordingTime, pauseCount, currentTopic, currentPart, currentQuestionIndex, getQuestions]);

  // ═══ Submit result ═══
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!currentTopic) return;

    // Save current answer if recording exists
    const currentKey = `p${currentPart}q${currentQuestionIndex}`;
    const updatedAnswers = new Map(answeredQuestions);
    if (transcript && !updatedAnswers.has(currentKey)) {
      updatedAnswers.set(currentKey, transcript);
    }
    setAnsweredQuestions(updatedAnswers);

    // Build results for all parts
    const p1Questions = currentTopic.part1.questions;
    const p3Questions = currentTopic.part3.questions;
    const results: Array<{part: number; question: string; transcript: string; score: number; wordCount: number}> = [];

    // Part 1
    p1Questions.forEach((q, i) => {
      const key = `p1q${i}`;
      const t = updatedAnswers.get(key) || '';
      const words = t.split(/\s+/).filter(Boolean).length;
      // Score based on word count and content
      let score = 0;
      if (words >= 20) score = 8;
      else if (words >= 15) score = 7;
      else if (words >= 10) score = 6;
      else if (words >= 5) score = 5;
      else if (words > 0) score = 4;
      results.push({part: 1, question: q, transcript: t || '[No response]', score, wordCount: words});
    });

    // Part 2
    const p2Transcript = updatedAnswers.get('p2cue') || transcript || '';
    const p2Words = p2Transcript.split(/\s+/).filter(Boolean).length;
    let p2Score = 0;
    if (p2Words >= 100) p2Score = 9;
    else if (p2Words >= 80) p2Score = 8;
    else if (p2Words >= 60) p2Score = 7;
    else if (p2Words >= 40) p2Score = 6;
    else if (p2Words >= 20) p2Score = 5;
    else if (p2Words > 0) p2Score = 4;
    results.push({part: 2, question: currentTopic.part2.cueCard.topic, transcript: p2Transcript || '[No response]', score: p2Score, wordCount: p2Words});

    // Part 3
    p3Questions.forEach((q, i) => {
      const key = `p3q${i}`;
      const t = updatedAnswers.get(key) || '';
      const words = t.split(/\s+/).filter(Boolean).length;
      let score = 0;
      if (words >= 30) score = 8;
      else if (words >= 20) score = 7;
      else if (words >= 15) score = 6;
      else if (words >= 10) score = 5;
      else if (words > 0) score = 4;
      results.push({part: 3, question: q, transcript: t || '[No response]', score, wordCount: words});
    });

    // Calculate overall band
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const overallBand = Math.min(9, (totalScore / results.length));

    setSessionResults(results);

    // Create evaluation object
    setEvaluation({
      overallBand,
      fluency: Math.min(9, overallBand + 0.5),
      lexicalResource: Math.min(9, overallBand + 0.2),
      grammaticalRange: Math.min(9, overallBand - 0.3),
      pronunciation: Math.min(9, overallBand + 0.1),
      strengths: ['Good attempt at answering all questions', 'Showed willingness to communicate'],
      improvements: ['Work on extending answers with more detail', 'Practice using a wider range of vocabulary', 'Focus on grammar accuracy in complex sentences'],
      feedback: overallBand >= 7 ? 'Good speaking performance!' : 'Keep practicing to improve your score.',
    });

    addTestResult({
      id: `speaking-${Date.now()}`,
      testId: currentTopic.id,
      testTitle: `${currentTopic.title} (Speaking Full Session)`,
      skill: 'speaking',
      overallBand,
      correctAnswers: Math.round((overallBand / 9) * 10),
      totalQuestions: results.length,
      accuracy: Math.round((overallBand / 9) * 100),
      timeSpentMinutes: Math.floor(recordingTime / 60) || 1,
      completedAt: new Date().toISOString(),
    });

    setShowResults(true);
    setIsSubmitted(true);
  }, [currentTopic, currentPart, currentQuestionIndex, recordingTime, answeredQuestions, transcript]);

  // ═══ Part 2 Prep Timer ═══
  const startPrepTimer = useCallback(() => {
    setIsPrepping(true);
    setPrepTime(60);
    prepTimerRef.current = setInterval(() => {
      setPrepTime(prev => {
        if (prev <= 1) {
          if (prepTimerRef.current) clearInterval(prepTimerRef.current);
          setIsPrepping(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ═══ Format time ═══
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ═══ Select topic ═══
  const selectTopic = (topic: SpeakingTopic) => {
    setCurrentTopic(topic);
    setCurrentPart(1);
    setCurrentQuestionIndex(0);
    resetRecording();
    setHasMovedForward(false);
    setAnsweredQuestions(new Map());
    setSessionResults([]);
  };

  // ═══ Reset to topic list ═══
  const backToTopics = () => {
    stopRecording();
    setCurrentTopic(null);
    setTranscript('');
    setRecordingTime(0);
    setEvaluation(null);
    setShowResults(false);
    setSessionResults([]);
    setAnsweredQuestions(new Map());
    setHasMovedForward(false);
  };

  // ═══ Navigation ═══
  const goToNextQuestion = () => {
    const questions = getQuestions();
    // Save current answer
    const key = `p${currentPart}q${currentQuestionIndex}`;
    setAnsweredQuestions(prev => {
      const next = new Map(prev);
      if (!prev.has(key)) next.set(key, transcript || '');
      return next;
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setHasMovedForward(true);
      resetRecording();
    } else if (currentPart < 3) {
      setCurrentPart(prev => (prev + 1) as SpeakingPart);
      setCurrentQuestionIndex(0);
      setHasMovedForward(true);
      resetRecording();
    }
  };

  const goToPrevQuestion = () => {
    // Prev is disabled when hasMovedForward — no going back
    return;
  };

  // Prev is always disabled — questions are forward-only

  // ═══════════════════════════════════════════
  //  TOPIC SELECTION VIEW
  // ═══════════════════════════════════════════
  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Practice
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Speaking Practice</h1>
                <p className="text-sm text-muted-foreground">IELTS Speaking with Web Speech API</p>
              </div>
            </div>
          </div>

          {/* Browser support notice */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Browser Microphone Required</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  This feature uses Web Speech API. Please use <strong>Chrome, Edge, or Safari</strong> for best results. 
                  Make sure to allow microphone access when prompted.
                </p>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {SPEAKING_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => selectTopic(topic)}
                className="group text-left rounded-xl border border-border bg-card p-4 sm:p-5 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
                    <Mic className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                    topic.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    topic.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  )}>
                    {topic.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{topic.category}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Part 1: {topic.part1.questions.length} Q
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Part 2: Cue Card
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    Part 3: {topic.part3.questions.length} Q
                  </span>
                </div>
              </button>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No topics in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  //  PRACTICE VIEW
  // ═══════════════════════════════════════════
  const questions = getQuestions();
  const isPart2 = currentPart === 2;
  const currentQuestion = isPart2 ? currentTopic.part2.cueCard.topic : questions[currentQuestionIndex] || '';
  const totalQuestions = isPart2 ? 1 : questions.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={backToTopics}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Topics
          </button>
          <h2 className="text-sm sm:text-base font-semibold truncate max-w-[200px] sm:max-w-none">{currentTopic.title}</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(recordingTime)}
          </div>
        </div>

        {/* Part Tabs */}
        <div className="flex gap-2 mb-4 sm:mb-6">
          {([1, 2, 3] as SpeakingPart[]).map(part => (
            <button
              key={part}
              onClick={() => {
                setCurrentPart(part);
                setCurrentQuestionIndex(0);
                resetRecording();
              }}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-sm font-medium transition-all',
                currentPart === part
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              Part {part}
            </button>
          ))}
        </div>

        {/* Question Card */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {currentPart}
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Part {currentPart} {isPart2 ? '— Cue Card' : `— Question ${currentQuestionIndex + 1}/${totalQuestions}`}
            </span>
          </div>

          {isPart2 ? (
            // ═══ Part 2 Cue Card ═══
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4">{currentTopic.part2.cueCard.topic}</h3>
              <div className="rounded-lg bg-muted/50 p-3 sm:p-4 mb-3">
                <ul className="space-y-2">
                  {currentTopic.part2.cueCard.prompts.map((prompt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground italic">{currentTopic.part2.cueCard.notes}</p>
            </div>
          ) : (
            // ═══ Part 1 or Part 3 Question ═══
            <div>
              <p className="text-base sm:text-lg font-medium">{currentQuestion}</p>
            </div>
          )}
        </div>

        {/* ═══ Show Results ═══ */}
        {showResults && evaluation ? (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-3">
                <span className="text-3xl font-bold text-primary">{evaluation.overallBand.toFixed(1)}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">Speaking Band Score</h3>
              <p className="text-sm text-muted-foreground mb-4">{evaluation.feedback}</p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Fluency & Coherence', score: evaluation.fluency, icon: '🗣️' },
                  { label: 'Lexical Resource', score: evaluation.lexicalResource, icon: '📚' },
                  { label: 'Grammatical Range', score: evaluation.grammaticalRange, icon: '✏️' },
                  { label: 'Pronunciation', score: evaluation.pronunciation, icon: '🔊' },
                ].map(c => (
                  <div key={c.label} className="rounded-lg border border-border p-3">
                    <div className="text-lg mb-1">{c.icon}</div>
                    <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
                    <div className={cn(
                      'text-lg font-bold',
                      c.score >= 7 ? 'text-green-600' : c.score >= 5.5 ? 'text-amber-600' : 'text-red-500',
                    )}>
                      {c.score.toFixed(1)}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700',
                          c.score >= 7 ? 'bg-green-500' : c.score >= 5.5 ? 'bg-amber-500' : 'bg-red-500',
                        )}
                        style={{ width: `${(c.score / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Areas for Improvement
              </h4>
              <ul className="space-y-1.5">
                {evaluation.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Transcript */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h4 className="font-semibold text-sm mb-3">Your Response</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Words: {getWordCount(transcript)}</span>
                <span>Time: {formatTime(recordingTime)}</span>
                <span>Pauses: {pauseCount}</span>
              </div>
            </div>

            {/* Sample Answer */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Sample Answer
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isPart2 ? currentTopic.part2.sampleAnswer :
                 currentPart === 1 ? currentTopic.part1.sampleAnswer : currentTopic.part3.sampleAnswer}
              </p>
            </div>

            {/* AI Feedback */}
            {isEvaluating && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm font-medium text-primary">AI is analysing your response...</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Groq AI is evaluating your fluency, vocabulary, grammar, and pronunciation...</p>
              </div>
            )}

            {aiFeedback && (
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-blue-50 dark:to-blue-950/20 p-4 sm:p-5">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  AI Detailed Feedback
                </h4>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{aiFeedback}</div>
              </div>
            )}

            {/* Session Results */}
            {isSubmitted && sessionResults.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 mb-4 sm:mb-6">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Speaking Session Results
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3].map(part => {
                    const partResults = sessionResults.filter(r => r.part === part);
                    if (partResults.length === 0) return null;
                    const partAvg = partResults.reduce((s, r) => s + r.score, 0) / partResults.length;
                    return (
                      <div key={part} className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
                          <span className="text-xs font-bold uppercase text-muted-foreground">Part {part}</span>
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full',
                            partAvg >= 7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            partAvg >= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                          )}>
                            {partAvg.toFixed(1)}
                          </span>
                        </div>
                        {partResults.map((r, i) => (
                          <div key={i} className="px-3 py-2 border-t border-border">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate">Q{i + 1}: {r.question}</p>
                                <p className="text-xs text-foreground/80 mt-0.5 line-clamp-2">{r.transcript}</p>
                              </div>
                              <span className={cn(
                                'text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                                r.score >= 7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                r.score >= 5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                r.score > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                              )}>
                                {r.score > 0 ? r.score.toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{r.wordCount} words</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            {isSubmitted ? (
              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-5 text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-green-800 dark:text-green-200 mb-1">Result Saved!</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Speaking practice saved to your dashboard. Overall band: <strong>{evaluation?.overallBand.toFixed(1)}</strong>
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/analytics"
                    className="rounded-xl border border-green-300 dark:border-green-700 px-4 py-2.5 text-sm font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    View Analytics
                  </Link>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setShowResults(false);
                      setEvaluation(null);
                      setAiFeedback(null);
                      resetRecording();
                      setSessionResults([]);
                    }}
                    className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    Practice Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setEvaluation(null);
                    resetRecording();
                  }}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-xl border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/20 py-3 text-sm font-semibold text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Submit Result
                </button>
                <button
                  onClick={goToNextQuestion}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ═══ Recording Area ═══ */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-8 mb-4 sm:mb-6">
              {/* Microphone Button */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                  )}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={cn(
                      'relative z-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full transition-all duration-300 shadow-lg',
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25',
                    )}
                  >
                    {isRecording ? (
                      <MicOff className="h-8 w-8 sm:h-10 sm:w-10" />
                    ) : (
                      <Mic className="h-8 w-8 sm:h-10 sm:w-10" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {isRecording
                    ? isPaused
                      ? 'Paused — tap mic to resume'
                      : 'Listening... Speak now'
                    : 'Tap microphone to start recording'}
                </p>


                {/* Controls */}
                {isRecording && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-1.5 rounded-full bg-red-500 text-white px-4 py-2 text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                      Stop
                    </button>
                  </div>
                )}

                {/* Part 2 prep button */}
                {isPart2 && !isRecording && transcript === '' && !isPrepping && (
                  <button
                    onClick={startPrepTimer}
                    className="mt-2 flex items-center gap-1.5 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    1-min Prep Time
                  </button>
                )}

                {/* Prep Timer */}
                {isPrepping && (
                  <div className="mt-3 text-center">
                    <div className={cn(
                      'text-3xl font-bold tabular-nums',
                      prepTime <= 10 ? 'text-red-500' : 'text-amber-600',
                    )}>
                      {formatTime(prepTime)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Prepare your answer — take notes if needed</p>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ Live Transcript ═══ */}
            {(transcript || interimTranscript) && (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold">Your Response</h4>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getWordCount(transcript)} words
                  </span>
                </div>
                <div className="text-sm leading-relaxed min-h-[60px]">
                  <span className="text-foreground">{transcript}</span>
                  {interimTranscript && (
                    <span className="text-muted-foreground/50 italic">{interimTranscript}</span>
                  )}
                </div>
              </div>
            )}

            {/* ═══ Actions ═══ */}
            {!isRecording && transcript && (
              <div className="flex gap-3 mb-4 sm:mb-6">
                <button
                  onClick={resetRecording}
                  className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Re-record
                </button>
                <button
                  onClick={handleEvaluate}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Evaluate
                </button>
              </div>
            )}

            {/* ═══ Submit on Last Question ═══ */}
            {currentPart === 3 && currentQuestionIndex >= questions.length - 1 && !showResults && (
              <div className="mb-4 sm:mb-6">
                <button
                  onClick={() => handleSubmit()}
                  className="w-full rounded-xl bg-green-600 hover:bg-green-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Finish & Submit Speaking Session
                </button>
              </div>
            )}

            {/* ═══ Navigation ═══ */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPrevQuestion}
                disabled={currentPart === 1 && currentQuestionIndex === 0 || hasMovedForward}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="text-xs text-muted-foreground">
                {isPart2 ? 'Cue Card' : `${currentQuestionIndex + 1} / ${totalQuestions}`}
              </span>
              <button
                onClick={goToNextQuestion}
                disabled={currentPart === 3 && currentQuestionIndex >= questions.length - 1}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
