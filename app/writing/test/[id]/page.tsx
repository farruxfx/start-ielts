'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Send, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, BarChart3, Target, BookOpen, Languages } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { analyseWriting, type WritingAnalysis, type CriterionResult } from '@/lib/writing-analysis';
import { getWritingTest, type WritingTest } from '@/lib/writing-tests';
import { BarChart, LineGraph, PieChart, DataTable, ProcessDiagram, MapDiagram } from '@/components/writing/charts';

interface TaskState {
  text: string;
  submitted: boolean;
}

function CriterionCard({ criterion, icon: Icon, color }: { criterion: CriterionResult; icon: React.ElementType; color: string }) {
  const [expanded, setExpanded] = useState(false);
  const bandColor = criterion.band >= 7 ? 'text-emerald-600 bg-emerald-500/10' :
    criterion.band >= 5.5 ? 'text-amber-600 bg-amber-500/10' : 'text-red-600 bg-red-500/10';
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color} flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold">{criterion.label}</h3>
            <span className={`text-lg font-bold rounded-lg px-3 py-1 ${bandColor}`}>
              {criterion.band.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{criterion.description}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {expanded ? 'Kamroq ko\'rsatish' : `${criterion.details.length} ta maslahat ko'rish`}
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1">
              {criterion.details.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed pl-1">{d}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function BandBar({ band, maxBand = 9 }: { band: number; maxBand?: number }) {
  const pct = (band / maxBand) * 100;
  const color = band >= 7 ? 'bg-emerald-500' : band >= 5.5 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function WritingTestPage() {
  const params = useParams();
  const testId = params?.id as string;
  const testData = getWritingTest(testId);
  
  const [activeTask, setActiveTask] = useState<1 | 2>(1);
  const [task1, setTask1] = useState<TaskState>({ text: '', submitted: false });
  const [task2, setTask2] = useState<TaskState>({ text: '', submitted: false });
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTask = activeTask === 1 ? task1 : task2;
  const setCurrentTask = activeTask === 1 ? setTask1 : setTask2;
  const wordCount = currentTask.text.trim() ? currentTask.text.trim().split(/\s+/).length : 0;
  const minWords = activeTask === 1 ? 150 : 250;

  useEffect(() => {
    if (started && !finished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { setFinished(true); return 0; }
          if (prev === 300) setShowWarning(true);
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, timeLeft]);

  useEffect(() => {
    if (finished && !analysis) {
      setAnalyzing(true);
      setTimeout(() => {
        const result = analyseWriting(task1.text, task2.text);
        setAnalysis(result);
        setAnalyzing(false);
      }, 1500);
    }
  }, [finished, analysis, task1.text, task2.text]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (activeTask === 1) {
      setTask1((prev) => ({ ...prev, submitted: true }));
      if (!task2.submitted) setActiveTask(2);
      else { setFinished(true); }
    } else {
      setTask2((prev) => ({ ...prev, submitted: true }));
      if (!task1.submitted) setActiveTask(1);
      else { setFinished(true); }
    }
  };

  // Get test data or fallback
  const task1Data = testData?.task1 || {
    type: 'Bar Chart',
    topic: 'Consumer goods expenditure',
    prompt: 'The bar chart below shows the amount of money spent on five consumer goods in four European countries in 2009.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.',
    chartDescription: 'Consumer Goods Expenditure (GBP)',
  };
  
  const task2Data = testData?.task2 || {
    type: 'Discussion',
    topic: 'University education',
    prompt: 'Some people believe that university students should be required to attend classes, while others believe that going to classes should be optional for students.\n\nDiscuss both views and give your own opinion.',
  };

  // ── Intro screen ──
  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <span className="text-3xl">✏️</span>
            </div>
            <h1 className="text-xl font-bold">{testData?.name || 'IELTS Writing Test'}</h1>
            <p className="text-sm text-muted-foreground mt-2">2 Tasks · 60 Minutes Total</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">Task 1</span>
                <span className="text-xs text-muted-foreground">20 minutes · 150+ words</span>
              </div>
              <p className="text-sm">{task1Data.prompt.split('\n')[0]}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{task1Data.prompt.split('\n').slice(2).join(' ')}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-600">Task 2</span>
                <span className="text-xs text-muted-foreground">40 minutes · 250+ words</span>
              </div>
              <p className="text-sm">{task2Data.prompt.split('\n')[0]}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">{task2Data.prompt.split('\n').slice(2).join(' ')}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-200 p-3 mb-6">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>You have 60 minutes total for both tasks</li>
                <li>Task 2 counts twice as much as Task 1</li>
                <li>Plan your time: ~20 min for Task 1, ~40 min for Task 2</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/writing" className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium hover:bg-muted transition-colors">Cancel</Link>
            <button onClick={() => setStarted(true)} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Start Writing →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Analyzing screen ──
  if (analyzing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Tahlil qilinmoqda...</h1>
          <p className="text-sm text-muted-foreground">Javoblaringiz 4 ta mezon bo'yicha baholanmoqda</p>
          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <p>📊 Task Achievement / Response</p>
            <p>🔗 Coherence &amp; Cohesion</p>
            <p>📖 Lexical Resource</p>
            <p>✍️ Grammatical Range &amp; Accuracy</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ──
  if (finished && analysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <span className="text-4xl font-bold text-primary">{analysis.overallBand.toFixed(1)}</span>
            </div>
            <h1 className="text-2xl font-bold">Writing Test Complete!</h1>
            <p className="text-muted-foreground mt-1">{analysis.estimatedBand}</p>
          </div>

          {/* Overall Band */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Overall Band Score</h2>
            <BandBar band={analysis.overallBand} />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0</span><span>3</span><span>5</span><span>7</span><span>9</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-200 p-3 text-center">
                <p className="text-xs text-emerald-600 font-medium">Task 1</p>
                <p className="text-lg font-bold">{task1.text.trim() ? task1.text.trim().split(/\s+/).length : 0} so'z</p>
              </div>
              <div className="rounded-lg bg-violet-500/5 border border-violet-200 p-3 text-center">
                <p className="text-xs text-violet-600 font-medium">Task 2</p>
                <p className="text-lg font-bold">{task2.text.trim() ? task2.text.trim().split(/\s+/).length : 0} so'z</p>
              </div>
            </div>
          </div>

          {/* 4 Criteria */}
          <h2 className="text-lg font-bold mb-4">4 ta Baholash Mezoni</h2>
          <div className="space-y-4 mb-8">
            <CriterionCard criterion={analysis.taskAchievement} icon={Target} color="bg-blue-500" />
            <CriterionCard criterion={analysis.coherenceCohesion} icon={BookOpen} color="bg-emerald-500" />
            <CriterionCard criterion={analysis.lexicalResource} icon={Languages} color="bg-amber-500" />
            <CriterionCard criterion={analysis.grammar} icon={BarChart3} color="bg-violet-500" />
          </div>

          {/* Band breakdown */}
          <div className="rounded-2xl border border-border bg-card p-6 mb-8">
            <h2 className="text-lg font-bold mb-4">Band Score Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'Task Achievement', band: analysis.taskAchievement.band, color: 'bg-blue-500' },
                { label: 'Coherence & Cohesion', band: analysis.coherenceCohesion.band, color: 'bg-emerald-500' },
                { label: 'Lexical Resource', band: analysis.lexicalResource.band, color: 'bg-amber-500' },
                { label: 'Grammar', band: analysis.grammar.band, color: 'bg-violet-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold">{item.band.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.band / 9) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/writing" className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium hover:bg-muted transition-colors">
              Back to Writing
            </Link>
            <Link href="/practice" className="flex-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Practice Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Writing screen ──
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-3 sm:px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/writing" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Writing</span>
          </Link>
          <div className="h-4 w-px bg-border flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold truncate">{testData?.name || 'IELTS Writing Test'}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className={`flex items-center gap-1.5 rounded-lg border px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-mono ${
            timeLeft <= 300 ? 'border-red-300 bg-red-50 text-red-600 animate-pulse' :
            timeLeft <= 600 ? 'border-amber-300 bg-amber-50 text-amber-600' :
            'border-border bg-muted/50 text-foreground'
          }`}>
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
            <button onClick={() => setActiveTask(1)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${activeTask === 1 ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Task 1 {task1.submitted && '✓'}
            </button>
            <button onClick={() => setActiveTask(2)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${activeTask === 2 ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Task 2 {task2.submitted && '✓'}
            </button>
          </div>
        </div>
      </header>

      {showWarning && (
        <div className="flex items-center gap-2 bg-amber-500/10 border-b border-amber-200 px-4 py-2 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">5 minutes remaining!</span>
        </div>
      )}

      {/* Mobile task tabs */}
      <div className="flex md:hidden border-b border-border bg-muted/30">
        <button onClick={() => setActiveTask(1)} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTask === 1 ? 'bg-card shadow-sm text-foreground border-b-2 border-primary' : 'text-muted-foreground'}`}>
          Instructions {task1.submitted && '✓'}
        </button>
        <button onClick={() => setActiveTask(2)} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTask === 2 ? 'bg-card shadow-sm text-foreground border-b-2 border-primary' : 'text-muted-foreground'}`}>
          Your Response {currentTask.submitted && '✓'}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left — Instructions */}
        <div className={`w-full md:w-1/2 border-r border-border overflow-y-auto p-4 sm:p-6 ${activeTask !== 1 ? 'hidden md:block' : ''}`}>
          {activeTask === 1 ? (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 mb-2">Task 1</span>
                <h2 className="text-lg font-bold">Writing Task 1 — {task1Data.type}</h2>
                <p className="text-xs text-muted-foreground mt-1">You should spend about 20 minutes on this task.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm leading-relaxed">{task1Data.prompt}</p>
                {task1Data.chartData && (
                  <div className="mt-4">
                    {task1Data.chartData.type === 'bar' && <BarChart data={task1Data.chartData} title={task1Data.chartDescription || ''} />}
                    {task1Data.chartData.type === 'line' && <LineGraph data={task1Data.chartData} title={task1Data.chartDescription || ''} />}
                    {task1Data.chartData.type === 'pie' && <PieChart data={task1Data.chartData} title={task1Data.chartDescription || ''} />}
                    {task1Data.chartData.type === 'table' && <DataTable data={task1Data.chartData} title={task1Data.chartDescription || ''} />}
                    {task1Data.chartData.type === 'process' && <ProcessDiagram data={task1Data.chartData} title={task1Data.chartDescription || ''} />}
                    {task1Data.chartData.type === 'map' && <MapDiagram data={task1Data.chartData} title={task1Data.chartDescription || ''} />}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 mb-2">Task 2</span>
                <h2 className="text-lg font-bold">Writing Task 2 — {task2Data.type}</h2>
                <p className="text-xs text-muted-foreground mt-1">You should spend about 40 minutes on this task.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm leading-relaxed">{task2Data.prompt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — Writing area */}
        <div className={`flex flex-col flex-1 min-h-0 ${activeTask !== 2 ? 'hidden md:flex' : ''}`}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <span className="text-sm font-medium">Task {activeTask} — Your Response</span>
            <div className="flex items-center gap-3 text-xs">
              <span className={`font-medium ${wordCount >= minWords ? 'text-emerald-600' : wordCount > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {wordCount} / {minWords} words
              </span>
              {wordCount >= minWords && <span className="text-emerald-600">✓</span>}
            </div>
          </div>
          <textarea
            value={currentTask.text}
            onChange={(e) => setCurrentTask({ ...currentTask, text: e.target.value })}
            className="flex-1 resize-none p-6 text-sm leading-relaxed focus:outline-none bg-card placeholder:text-muted-foreground/50"
            placeholder={activeTask === 1
              ? 'Write your Task 1 response here...\n\nBegin with an overview of the main trends, then describe specific features and make comparisons.'
              : 'Write your Task 2 essay here...\n\nIntroduction → Body Paragraph 1 (View 1) → Body Paragraph 2 (View 2 + Your Opinion) → Conclusion'
            }
            disabled={currentTask.submitted}
          />
          <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              {!task1.submitted && activeTask === 2 && (
                <button onClick={() => setActiveTask(1)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to Task 1
                </button>
              )}
              {!task2.submitted && activeTask === 1 && (
                <button onClick={() => setActiveTask(2)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors">
                  Go to Task 2 <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={currentTask.submitted || wordCount === 0}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                currentTask.submitted ? 'bg-emerald-500/10 text-emerald-600 cursor-default'
                : wordCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {currentTask.submitted ? (
                <><CheckCircle2 className="h-4 w-4" /> Task {activeTask} Submitted</>
              ) : task1.submitted && task2.submitted ? (
                <><Send className="h-4 w-4" /> Submit All</>
              ) : (
                <><Send className="h-4 w-4" /> Submit Task {activeTask}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
