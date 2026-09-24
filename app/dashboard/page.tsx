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
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  buildDashboardData,
  getStoredAchievements,
  getTargetBand,
  getExamDate,
  getUserProfile,
  setUserProfile,
} from '@/lib/store';
import { useAuth } from '@/components/auth/use-auth';
import { SubscriptionWidget } from '@/components/subscription/subscription-widget';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Phase 6: heavy widgets load lazily to shrink the initial bundle
const DailyGoalsWidget = dynamic(
  () => import('@/components/dashboard/daily-goals-widget').then(m => m.DailyGoalsWidget),
  { loading: () => <WidgetSkeleton /> }
);
const StudyPlanCard = dynamic(
  () => import('@/components/dashboard/study-plan-card').then(m => m.StudyPlanCard),
  { loading: () => <WidgetSkeleton /> }
);
const ProgressCharts = dynamic(
  () => import('@/components/dashboard/progress-charts').then(m => m.ProgressCharts),
  { loading: () => <ChartSkeleton /> }
);
const ExamCountdown = dynamic(
  () => import('@/components/dashboard/exam-countdown').then(m => m.ExamCountdown),
  { loading: () => <WidgetSkeleton /> }
);

function WidgetSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-3 h-[260px] w-full" />
    </div>
  );
}

const skillConfig: Record<string, { icon: typeof BookOpen; color: string; bg: string; ring: string }> = {
  listening: { icon: Headphones, color: 'text-violet-600', bg: 'bg-violet-100', ring: 'ring-violet-200' },
  reading: { icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-200' },
  writing: { icon: PenLine, color: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-200' },
  speaking: { icon: Mic, color: 'text-orange-500', bg: 'bg-orange-100', ring: 'ring-orange-200' },
};

const achievementDefs = [
  { id: 'a1', title: 'First Test', description: 'Complete your first practice test', icon: 'flag' },
  { id: 'a2', title: '7.0 Club', description: 'Score 7.0 or higher on any test', icon: 'award' },
  { id: 'a3', title: '7.5 Club', description: 'Score 7.5 or higher on any test', icon: 'trophy' },
  { id: 'a4', title: '8.0 Master', description: 'Score 8.0 or higher on any test', icon: 'crown' },
  { id: 'a5', title: '10 Tests', description: 'Complete 10 practice tests', icon: 'book-open' },
  { id: 'a6', title: '30 Day Streak', description: 'Practice for 30 consecutive days', icon: 'flame' },
  { id: 'a7', title: '100 Questions', description: 'Answer 100 questions correctly', icon: 'check-circle' },
  { id: 'a8', title: 'Perfect Listening', description: 'Get all listening questions correct', icon: 'headphones' },
  { id: 'a9', title: 'Perfect Reading', description: 'Get all reading questions correct', icon: 'book' },
];

const quickActions = [
  { label: 'Listening', href: '/listening', icon: Headphones, color: 'bg-violet-500' },
  { label: 'Reading', href: '/reading', icon: BookOpen, color: 'bg-emerald-500' },
  { label: 'Writing', href: '/writing', icon: PenLine, color: 'bg-blue-500' },
  { label: 'Speaking', href: '/speaking', icon: Mic, color: 'bg-orange-500' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const existing = getUserProfile();
      const userEmail = user.email || '';
      const anyUser = user as any;
      const userName =
        anyUser.name ||
        anyUser.user_metadata?.name ||
        userEmail.split('@')[0] ||
        'Student';
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
  }));
  const unlockedCount = mergedAchievements.filter(a => a.unlocked).length;
  const hasData = data.totalTests > 0;

  return (
    <div className="space-y-5 overflow-hidden">
      {/* ═══ Greeting Card ═══ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20 sm:p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold sm:text-2xl">
            {greeting}, {data.userName} 👋
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            Here's your IELTS preparation progress.
          </p>
          <Link
            href="/practice"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30"
          >
            Start practicing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ═══ Subscription Widget ═══ */}
      <SubscriptionWidget />

      {/* ═══ Quick Actions — Circular Badges ═══ */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Practice</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2"
            >
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all hover:scale-105 active:scale-95',
                action.color,
                `shadow-${action.color.replace('bg-', '')}/30`
              )}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-600">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ Skill Progress — Circular Badges ═══ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Skills</h2>
          <Link href="/practice" className="text-xs font-medium text-blue-500">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.skillBands.map((skill: any) => {
            const config = skillConfig[skill.skill] || skillConfig.reading;
            const Icon = config.icon;
            const progress = skill.band > 0 ? (skill.band / 9) * 100 : 0;
            return (
              <Link
                key={skill.skill}
                href="/practice"
                className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md active:scale-[0.98]"
              >
                {/* Circular progress ring */}
                <div className="relative mb-3">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke={skill.band > 0 ? (skill.skill === 'listening' ? '#7c3aed' : skill.skill === 'reading' ? '#059669' : skill.skill === 'writing' ? '#2563eb' : '#f97316') : '#e2e8f0'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 1.76} 176`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center',
                  )}>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.bg)}>
                      <Icon className={cn('h-5 w-5', config.color)} />
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold capitalize text-gray-700">{skill.skill}</span>
                <span className="text-lg font-bold text-gray-900">
                  {skill.band > 0 ? skill.band.toFixed(1) : '—'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {skill.band === 0 ? 'Not started' : skill.band >= skill.target ? '✓ On target' : `Target: ${skill.target.toFixed(1)}`}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══ Stats Row — Compact Cards ═══ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Target</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.targetBand.toFixed(1)}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-100">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Current</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {data.currentBand > 0 ? data.currentBand.toFixed(1) : '—'}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Streak</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.streak}<span className="text-sm font-normal text-gray-400">d</span></div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
              <Zap className="h-4 w-4 text-violet-600" />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Tests</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.totalTests}</div>
        </div>
      </div>

      {/* ═══ Exam Countdown ═══ */}
      <ExamCountdown />

      {/* ═══ Study Plan ═══ */}
      <StudyPlanCard />

      {/* ═══ Daily Goals ═══ */}
      <DailyGoalsWidget />

      {/* ═══ Achievements — Horizontal Scroll ═══ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Achievements</h2>
            <p className="text-[11px] text-gray-400">{unlockedCount} of {mergedAchievements.length} unlocked</p>
          </div>
          <Link href="/analytics" className="flex items-center gap-0.5 text-xs font-medium text-blue-500">
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {mergedAchievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                'flex-shrink-0 flex flex-col items-center rounded-2xl p-3 min-w-[88px] transition-all',
                a.unlocked
                  ? 'bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200 shadow-sm'
                  : 'bg-gray-50 border border-gray-100 opacity-50'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                a.unlocked ? 'bg-amber-100' : 'bg-gray-100'
              )}>
                {a.unlocked ? (
                  <Trophy className="h-6 w-6 text-amber-500" />
                ) : (
                  <Trophy className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <span className="mt-2 text-[10px] font-semibold text-center leading-tight text-gray-700">{a.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Progress Charts ═══ */}
      <ProgressCharts />

      {/* ═══ Empty State ═══ */}
      {!hasData && (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Welcome to StartIELTS! 🎉</h3>
          <p className="mt-2 max-w-sm mx-auto text-sm text-gray-500">
            Start practicing to see your progress here. Take your first test and track your band score.
          </p>
          <Link
            href="/practice"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Take your first test <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
