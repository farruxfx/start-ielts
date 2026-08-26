'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  Trophy,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { cn } from '@/lib/utils';
import { buildDashboardData, getTestResults } from '@/lib/store';
import { useAuth } from '@/components/auth/use-auth';
import type { TestResult } from '@/lib/types';

const skillConfig: Record<string, { icon: typeof BookOpen; color: string; bg: string; trackBg: string }> = {
  reading: { icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-500', trackBg: 'bg-emerald-100' },
  listening: { icon: Headphones, color: 'text-violet-600', bg: 'bg-violet-500', trackBg: 'bg-violet-100' },
  writing: { icon: PenLine, color: 'text-rose-600', bg: 'bg-rose-500', trackBg: 'bg-rose-100' },
  speaking: { icon: Mic, color: 'text-amber-600', bg: 'bg-amber-500', trackBg: 'bg-amber-100' },
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    setData(buildDashboardData());
    setResults(getTestResults());
  }, [user]);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const hasData = data.totalTests > 0;
  const skills = data.skillBands || [];
  const recentResults = results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your IELTS preparation progress</p>
      </div>

      {!hasData ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No data yet</h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
            Complete some practice tests to see your analytics here.
          </p>
          <Link href="/practice" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25">
            Start practicing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-5">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Band</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
              </div>
              <div className="mt-3 text-3xl font-bold">{data.currentBand.toFixed(1)}</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-600" style={{ width: `${(data.currentBand / 9) * 100}%` }} />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-blue-500/5 p-5">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-500/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tests Taken</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10"><BookOpen className="h-4 w-4 text-violet-500" /></div>
              </div>
              <div className="mt-3 text-3xl font-bold">{data.totalTests}</div>
              <p className="mt-2 text-xs text-muted-foreground">{data.timeSpentHours}h total practice</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 p-5">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Band</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10"><Target className="h-4 w-4 text-amber-500" /></div>
              </div>
              <div className="mt-3 text-3xl font-bold">{data.averageBand > 0 ? data.averageBand.toFixed(1) : '—'}</div>
              <p className="mt-2 text-xs text-muted-foreground">Target: {data.targetBand.toFixed(1)}</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-red-500/5 p-5">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Streak</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10"><Flame className="h-4 w-4 text-orange-500" /></div>
              </div>
              <div className="mt-3 text-3xl font-bold">{data.streak}</div>
              <p className="mt-2 text-xs text-muted-foreground">days in a row</p>
            </div>
          </div>

          {/* Skill Breakdown - matching AI Coach style */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-bold">Skill Breakdown</h3>
            <div className="space-y-4">
              {skills.map((skill: any) => {
                const config = skillConfig[skill.skill];
                const Icon = config.icon;
                const progress = skill.band > 0 ? (skill.band / 9) * 100 : 0;
                return (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', config.color)} />
                        <span className="text-sm font-semibold capitalize">{skill.skill}</span>
                      </div>
                      <span className="text-sm font-bold">{skill.band > 0 ? skill.band.toFixed(1) : '—'}</span>
                    </div>
                    <div className={cn('h-2.5 overflow-hidden rounded-full', config.trackBg)}>
                      <div className={cn('h-full rounded-full transition-all duration-700', config.bg)} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {skill.band > 0 ? `${Math.round((skill.band / skill.target) * 100)}% of target` : 'Not practised yet'}
                      </p>
                      <p className="text-xs text-muted-foreground">Target: {skill.target.toFixed(1)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {data.progressHistory.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Band Progress</h3>
                    <p className="text-sm text-muted-foreground">Overall score over time</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.progressHistory}>
                      <defs>
                        <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={[4, 9]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '13px' }} />
                      <Area type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#bandGradient)" dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Weekly Activity</h3>
                  <p className="text-sm text-muted-foreground">Minutes practiced per day</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10"><Clock className="h-4 w-4 text-violet-500" /></div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '13px' }} />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Test Results */}
          {recentResults.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Test Results</h3>
                <span className="text-xs text-muted-foreground">{recentResults.length} tests</span>
              </div>
              <div className="space-y-3">
                {recentResults.map((result) => {
                  const config = skillConfig[result.skill] || skillConfig.reading;
                  const Icon = config.icon;
                  return (
                    <div key={result.id} className="flex items-center gap-4 rounded-xl border border-border p-4 transition-all hover:shadow-md">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0', config.trackBg)}>
                        <Icon className={cn('h-5 w-5', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{result.testTitle}</p>
                        <p className="text-xs text-muted-foreground capitalize">{result.skill} • {new Date(result.completedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right flex-shrink-0">
                        <div>
                          <div className="text-lg font-bold">{result.overallBand.toFixed(1)}</div>
                          <div className="text-[10px] text-muted-foreground">Band</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{result.accuracy}%</div>
                          <div className="text-[10px] text-muted-foreground">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{result.correctAnswers}/{result.totalQuestions}</div>
                          <div className="text-[10px] text-muted-foreground">Correct</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10"><Trophy className="h-5 w-5 text-emerald-500" /></div>
                <div>
                  <div className="text-2xl font-bold">{data.bestBand > 0 ? data.bestBand.toFixed(1) : '—'}</div>
                  <div className="text-xs text-muted-foreground">Best Band Score</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"><Target className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <div className="text-2xl font-bold">{data.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Average Accuracy</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10"><Calendar className="h-5 w-5 text-blue-500" /></div>
                <div>
                  <div className="text-2xl font-bold">{data.timeSpentHours}h</div>
                  <div className="text-xs text-muted-foreground">Total Practice Time</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
