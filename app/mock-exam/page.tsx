'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock, Headphones, BookOpen, PenLine, Mic,
  ArrowRight, FileText, Trophy, BarChart3,
  ChevronRight, Zap, Shield, Timer,
} from 'lucide-react';
import {
  MOCK_EXAMS, getCompletedMockCount, getInProgressMockSession,
  getMockExamBestBand, getMockExamAttempts,
} from '@/lib/mock-exam-data';
import type { MockExamDef, MockExamSession } from '@/lib/types';
import { cn } from '@/lib/utils';

const sectionIcons: Record<string, typeof Headphones> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};

const sectionColors: Record<string, string> = {
  listening: 'text-emerald-500',
  reading: 'text-blue-500',
  writing: 'text-orange-500',
  speaking: 'text-purple-500',
};

const sectionBg: Record<string, string> = {
  listening: 'bg-emerald-500/10',
  reading: 'bg-blue-500/10',
  writing: 'bg-orange-500/10',
  speaking: 'bg-purple-500/10',
};

export default function MockExamPage() {
  const [completedCount, setCompletedCount] = useState(0);
  const [inProgressSession, setInProgressSession] = useState<MockExamSession | null>(null);

  useEffect(() => {
    setCompletedCount(getCompletedMockCount());
    setInProgressSession(getInProgressMockSession());
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Full IELTS Mock Exam</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Simulate the complete IELTS exam experience with all four sections under real timed conditions.
          Each mock exam follows the official IELTS format.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{MOCK_EXAMS.length}</div>
              <div className="text-xs text-muted-foreground">Available Exams</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Trophy className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">~3h</div>
              <div className="text-xs text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-muted-foreground">Sections Each</div>
            </div>
          </div>
        </div>
      </div>

      {/* In-progress session banner */}
      {inProgressSession && (
        <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-semibold text-orange-700 dark:text-orange-300">Mock exam in progress</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  Current section: {inProgressSession.currentSection} — Started {new Date(inProgressSession.startedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Link
              href={`/mock-exam/${inProgressSession.examId}?session=${inProgressSession.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
            >
              Resume
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* What to expect */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-muted/30 p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">What to expect</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The full mock exam follows the real IELTS format. You will complete all sections
              in sequence with strict timing. Each section unlocks automatically after the previous one completes.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Results saved automatically to your profile</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['listening', 'reading', 'writing', 'speaking'].map((section) => {
              const Icon = sectionIcons[section];
              const minutes = section === 'listening' ? 40 : section === 'reading' ? 60 : section === 'writing' ? 60 : 15;
              return (
                <div key={section} className={cn('flex items-center gap-3 rounded-xl border border-border bg-card p-4')}>
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', sectionBg[section])}>
                    <Icon className={cn('h-5 w-5', sectionColors[section])} />
                  </div>
                  <div>
                    <div className="text-sm font-medium capitalize">{section}</div>
                    <div className="text-xs text-muted-foreground">{minutes} min</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Exam cards */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Available Mock Exams</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          {MOCK_EXAMS.map((exam) => (
            <MockExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </div>

      {/* History link */}
      {completedCount > 0 && (
        <div className="text-center">
          <Link
            href="/mock-exam/history"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View all mock exam results
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

function MockExamCard({ exam }: { exam: MockExamDef }) {
  const [bestBand, setBestBand] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setBestBand(getMockExamBestBand(exam.id));
    setAttempts(getMockExamAttempts(exam.id));
  }, [exam.id]);

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className={cn(
          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold',
          exam.difficulty === 'hard' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          exam.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        )}>
          {exam.difficulty}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {exam.totalMinutes} min
        </div>
      </div>

      <h4 className="mt-3 text-lg font-semibold">{exam.title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{exam.subtitle}</p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{exam.description}</p>

      {/* Section icons */}
      <div className="mt-4 flex items-center gap-3">
        {exam.sections.map((section) => {
          const Icon = sectionIcons[section];
          return (
            <div key={section} className={cn('flex h-8 w-8 items-center justify-center rounded-lg', sectionBg[section])} title={section}>
              <Icon className={cn('h-4 w-4', sectionColors[section])} />
            </div>
          );
        })}
        {attempts > 0 && (
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            {bestBand && (
              <span className="font-semibold text-primary">Best: {bestBand.toFixed(1)}</span>
            )}
            <span>• {attempts} attempt{attempts > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="mt-5 border-t border-border pt-4">
        <Link
          href={`/mock-exam/${exam.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01]"
        >
          Begin Exam
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
