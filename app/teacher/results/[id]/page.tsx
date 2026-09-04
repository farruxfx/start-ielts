'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, BarChart3, Clock, Users, Trophy, Download, Eye,
  ChevronDown, ChevronUp, CheckCircle, XCircle, MessageSquare
} from 'lucide-react';
import {
  getTestById, getSubmissionsForTest, getTestStats, updateSubmission,
  type TeacherTest, type TestSubmission
} from '@/lib/teacher-test-store';
import { cn } from '@/lib/utils';

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [test, setTest] = useState<TeacherTest | null>(null);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, avgBand: 0, avgTime: 0 });
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  useEffect(() => {
    const found = getTestById(testId);
    if (!found) {
      router.push('/teacher');
      return;
    }
    setTest(found);
    const subs = getSubmissionsForTest(testId);
    setSubmissions(subs);
    setStats(getTestStats(testId));
  }, [testId, router]);

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const sorted = [...submissions].sort((a, b) => {
    if (sortBy === 'score') return b.band - a.band;
    if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  const bandDistribution = [9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 4.5, 4, 3.5, 3].map(band => ({
    band,
    count: submissions.filter(s => s.band === band).length,
  })).filter(d => d.count > 0);

  const maxCount = Math.max(...bandDistribution.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{test.title} — Results</h1>
            <p className="text-sm text-muted-foreground">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submissions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Band</p>
              <p className="text-2xl font-bold">{stats.avgBand}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Time</p>
              <p className="text-2xl font-bold">{Math.floor(stats.avgTime / 60)}m</p>
            </div>
          </div>
        </div>
      </div>

      {/* Band distribution chart */}
      {bandDistribution.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-4">Band Distribution</h2>
          <div className="space-y-2">
            {bandDistribution.map(d => (
              <div key={d.band} className="flex items-center gap-3">
                <span className="w-10 text-sm font-bold text-right">{d.band}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm font-medium text-muted-foreground">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissions list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold">Submissions ({submissions.length})</h2>
          <div className="flex gap-2">
            {(['date', 'score', 'name'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  sortBy === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No submissions yet. Share the test link with students.</p>
          </div>
        ) : (
          <div>
            {sorted.map(sub => {
              const isExpanded = expandedSub === sub.id;
              return (
                <div key={sub.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                    className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {sub.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{sub.studentName}</p>
                        <p className="text-xs text-muted-foreground">{sub.studentEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-bold">{sub.correctCount}/{sub.totalQuestions}</p>
                        <p className="text-xs text-muted-foreground">{sub.score}%</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                        {sub.band.toFixed(1)}
                      </div>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        sub.status === 'auto_graded' ? 'bg-emerald-50 text-emerald-700' :
                        sub.status === 'pending_review' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      )}>
                        {sub.status.replace('_', ' ')}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-muted/10 p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{new Date(sub.submittedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time Spent</p>
                          <p className="font-medium">{Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className="font-medium">{sub.band.toFixed(1)} band</p>
                        </div>
                      </div>

                      {/* Show answers comparison */}
                      {test.questions.map((q, i) => {
                        const userAnswer = sub.answers[q.id] || sub.answers[`${q.id}_0`] || '';
                        const isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                        return (
                          <div key={q.id} className="flex items-center gap-2 text-xs">
                            <span className="font-bold w-6">Q{i + 1}.</span>
                            <span className="truncate flex-1 max-w-xs">{q.text.substring(0, 60)}...</span>
                            <span className="text-muted-foreground">Your: <b>{userAnswer || '—'}</b></span>
                            <span className="text-muted-foreground">Correct: <b>{q.correctAnswer}</b></span>
                            {isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
