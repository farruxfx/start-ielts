'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Flame,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  ArrowRight,
  Trophy,
  CheckCircle2,
  Star,
  Settings,
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
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  buildDashboardData,
  getStoredAchievements,
  setTargetBand,
  setExamDate,
  getTargetBand,
  getExamDate,
  getUserProfile,
  setUserProfile,
} from '@/lib/store';
import { useAuth } from '@/components/auth/use-auth';
import { SubscriptionWidget } from '@/components/subscription/subscription-widget';

const skillConfig: Record<string, { icon: typeof BookOpen; bg: string }> = {
  reading: { icon: BookOpen, bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700' },
  listening: { icon: Headphones, bg: 'bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700' },
  writing: { icon: PenLine, bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700' },
  speaking: { icon: Mic, bg: 'bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600' },
};

const achievementDefs = [
  { id: 'a1', title: 'First Test', description: 'Complete your first practice test', icon: 'flag' },
  { id: 'a2', title: '7.0 Club', description: 'Score 7.0 or higher on any test', icon: 'award' },
  { id: 'a3', title: '7.5 Club', description: 'Score 7.5 or higher on any test', icon: 'trophy' },
  { id: 'a4', title: '8.0 Club', description: 'Score 8.0 or higher on any test', icon: 'crown' },
  { id: 'a5', title: '10 Tests Completed', description: 'Complete 10 practice tests', icon: 'book-open' },
  { id: 'a6', title: '30 Days Streak', description: 'Practice for 30 consecutive days', icon: 'flame' },
  { id: 'a7', title: '100 Questions', description: 'Answer 100 questions correctly', icon: 'check-circle' },
  { id: 'a8', title: 'Perfect Listening', description: 'Get all listening questions correct', icon: 'headphones' },
  { id: 'a9', title: 'Perfect Reading', description: 'Get all reading questions correct', icon: 'book' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [targetInput, setTargetInput] = useState('7.5');
  const [examDateInput, setExamDateInput] = useState('');

  useEffect(() => {
    // Sync auth user into store profile
    if (user) {
      const existing = getUserProfile();
      const userEmail = user.email || '';
      const userName = (user as any).name || userEmail.split('@')[0] || 'Student';
      if (!existing || existing.email !== userEmail) {
        setUserProfile({
          name: userName,
          email: userEmail,
          targetBand: existing?.targetBand || 7.5,
          createdAt: new Date().toISOString(),
        });
      }
    }
    setData(buildDashboardData());
    setTargetInput(getTargetBand().toString());
    const ed = getExamDate();
    if (ed) setExamDateInput(ed);
  }, [user]);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const storedAchievements = getStoredAchievements();
  const achievementMap = new Map(storedAchievements.map(a => [a.id, a]));

  const mergedAchievements = achievementDefs.map(a => ({
    ...a,
    unlocked: achievementMap.get(a.id)?.unlocked || false,
    date: achievementMap.get(a.id)?.date,
  }));

  const unlockedCount = mergedAchievements.filter(a => a.unlocked).length;
  const hasData = data.totalTests > 0;

  const handleSaveSettings = () => {
    const band = parseFloat(targetInput);
    if (!isNaN(band) && band >= 4 && band <= 9) {
      setTargetBand(band);
    }
    if (examDateInput) {
      setExamDate(examDateInput);
    }
    setData(buildDashboardData());
    setShowSettings(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">{data.userName}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your IELTS preparation progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-base font-semibold transition-all hover:shadow-md"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <Link
            href="/practice"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-7 py-3 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
          >
            Start practicing
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Subscription Widget */}
      <SubscriptionWidget />

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Dashboard Settings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Set your target band score and exam date</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Target Band Score</label>
              <input
                type="number"
                min="4"
                max="9"
                step="0.5"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Exam Date</label>
              <input
                type="date"
                value={examDateInput}
                onChange={(e) => setExamDateInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveSettings}
              className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="rounded-xl border border-border px-6 py-3 text-base font-semibold hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Welcome to IELTS PRO!</h3>
          <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
            Start practicing to see your progress here. Take your first test and track your band score improvement over time.
          </p>
          <Link
            href="/practice"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Take your first test
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Top stats */}
      {hasData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current band</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{data.currentBand.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ {data.targetBand.toFixed(1)}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-600 transition-all"
                style={{ width: `${(data.currentBand / 9) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-background to-blue-500/5 p-5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-violet-500/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target band</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Target className="h-4 w-4 text-violet-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{data.targetBand.toFixed(1)}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {Math.max(0, (data.targetBand - data.currentBand)).toFixed(1)} bands to go
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5 p-5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Exam countdown</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Calendar className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{data.examCountdownDays || '—'}</span>
              {data.examCountdownDays > 0 && <span className="text-sm text-muted-foreground">days</span>}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {data.examCountdownDays > 0 ? 'Keep practicing daily' : 'Set exam date in settings'}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-red-500/5 p-5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-500/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current streak</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{data.streak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Don&apos;t break the chain</p>
          </div>
        </div>
      )}

      {/* Skill bands - Gradient Cards */}
      {hasData && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your Skills</h2>
              <p className="text-sm text-muted-foreground">Track your progress across all IELTS skills</p>
            </div>
            <Link href="/practice" className="text-sm font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.skillBands.map((skill: any) => {
              const config = skillConfig[skill.skill] || skillConfig.reading;
              const Icon = config.icon;
              const progress = skill.band > 0 ? (skill.band / skill.target) * 100 : 0;
              return (
                <Link
                  key={skill.skill}
                  href="/practice"
                  className={cn(
                    'group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl',
                    config.bg
                  )}
                >
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 opacity-10" />
                  <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 opacity-10" />

                  <div className="relative z-10 mb-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    {skill.skill}
                  </div>

                  <h3 className="relative z-10 text-xl font-bold capitalize">{skill.skill}</h3>

                  <p className="relative z-10 mt-1 text-sm text-white/80">
                    {skill.band === 0 ? 'Not started yet' : skill.band >= skill.target ? '✓ On target' : `${(skill.target - skill.band).toFixed(1)} bands to go`}
                  </p>

                  <div className="relative z-10 mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="relative z-10 mt-3 flex items-center justify-between">
                    <span className="text-2xl font-bold">{skill.band > 0 ? skill.band.toFixed(1) : '—'}</span>
                    <span className="text-xs text-white/70">Target: {skill.target.toFixed(1)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      {hasData && data.progressHistory.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Progress over time</h3>
                <p className="text-sm text-muted-foreground">Overall band score progression</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.progressHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[4, 9]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} ticks={[4, 5, 6, 7, 8, 9]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <ReferenceLine y={data.targetBand} stroke="hsl(var(--primary))" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Weekly activity</h3>
                <p className="text-sm text-muted-foreground">Minutes practiced</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Clock className="h-4 w-4 text-violet-500" />
              </div>
            </div>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats */}
      {hasData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total tests', value: data.totalTests, icon: BookOpen, color: 'bg-primary/10 text-primary' },
            { label: 'Average band', value: data.averageBand > 0 ? data.averageBand.toFixed(1) : '—', icon: Star, color: 'bg-amber-500/10 text-amber-500' },
            { label: 'Best band', value: data.bestBand > 0 ? data.bestBand.toFixed(1) : '—', icon: Trophy, color: 'bg-success/10 text-success' },
            { label: 'Time spent', value: data.timeSpentHours > 0 ? `${data.timeSpentHours}h` : '0h', icon: Clock, color: 'bg-violet-500/10 text-violet-500' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mock Exam Section */}
      {hasData && (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Mock Exam Progress</h3>
              <p className="text-sm text-muted-foreground">
                {data.mockExamsCompleted} exam{data.mockExamsCompleted !== 1 ? 's' : ''} completed • {data.practiceTestsCompleted} practice tests taken
              </p>
            </div>
            <Link href="/mock-exam" className="text-sm font-medium text-primary hover:underline">
              Take a mock exam →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{data.mockExamsCompleted}</div>
              <div className="text-xs text-muted-foreground">Mock Exams</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{data.bestBand > 0 ? data.bestBand.toFixed(1) : '—'}</div>
              <div className="text-xs text-muted-foreground">Best Overall</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold">{data.accuracy > 0 ? data.accuracy + '%' : '—'}</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Achievements</h3>
            <p className="text-sm text-muted-foreground">
              {unlockedCount} of {mergedAchievements.length} unlocked
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mergedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-all',
                achievement.unlocked
                  ? 'border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 shadow-sm'
                  : 'border-border bg-muted/30 opacity-60'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  achievement.unlocked ? 'bg-amber-500/15' : 'bg-muted'
                )}
              >
                {achievement.unlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                ) : (
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{achievement.title}</div>
                <div className="truncate text-xs text-muted-foreground">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
