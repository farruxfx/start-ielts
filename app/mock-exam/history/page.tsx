'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, ArrowRight, Trophy, Clock } from 'lucide-react';
import { getMockSessions, getMockExamDef } from '@/lib/mock-exam-data';
import type { MockExamSession } from '@/lib/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export default function MockExamHistoryPage() {
  const [sessions, setSessions] = useState<MockExamSession[]>([]);
  const [targetBand, setTargetBand] = useState(7.5);

  useEffect(() => {
    const allSessions = getMockSessions()
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());
    setSessions(allSessions);
    
    // Get target band from store
    try {
      const profile = JSON.parse(localStorage.getItem('ieltspro_user_profile') || '{}');
      if (profile?.targetBand) setTargetBand(profile.targetBand);
    } catch {}
  }, []);

  const chartData = sessions.map((s, i) => ({
    name: `Mock ${i + 1}`,
    band: s.overallBand || 0,
    exam: getMockExamDef(s.examId)?.title || s.examId,
  }));

  const avgBand = sessions.length > 0
    ? (sessions.reduce((a, s) => a + (s.overallBand || 0), 0) / sessions.length)
    : 0;

  const bestBand = sessions.length > 0
    ? Math.max(...sessions.map(s => s.overallBand || 0))
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mock Exam History</h1>
          <p className="mt-2 text-muted-foreground">Your performance across all completed mock exams.</p>
        </div>
        <Link href="/mock-exam" className="text-sm font-medium text-primary hover:underline">
          Back to Mock Exams
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="text-3xl font-bold">{sessions.length}</div>
          <div className="mt-1 text-sm text-muted-foreground">Exams Completed</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="text-3xl font-bold text-primary">{avgBand.toFixed(1)}</div>
          <div className="mt-1 text-sm text-muted-foreground">Average Band</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center">
          <div className="text-3xl font-bold text-emerald-600">{bestBand.toFixed(1)}</div>
          <div className="mt-1 text-sm text-muted-foreground">Best Band</div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold">Band Score Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis domain={[0, 9]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
              />
              <ReferenceLine y={targetBand} stroke="#ef4444" strokeDasharray="5 5" label={`Target ${targetBand}`} />
              <Line type="monotone" dataKey="band" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Results list */}
      <div>
        <h3 className="mb-4 font-semibold">All Results</h3>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No completed mock exams yet.</p>
            <Link href="/mock-exam" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Take your first mock exam <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {[...sessions].reverse().map((session) => {
              const examDef = getMockExamDef(session.examId);
              return (
                <div key={session.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{examDef?.title || session.examId}</div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.completedAt!).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.timeSpentMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{(session.overallBand || 0).toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Overall Band</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
