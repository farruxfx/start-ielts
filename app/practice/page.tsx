'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, ChevronLeft, ChevronRight, Headphones, BookOpen, PenLine, Mic, FileCheck } from 'lucide-react';
import { getTestResults } from '@/lib/store';
import type { TestType, TestResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SkillCardsGrid, MockExamCard } from '@/components/practice/skill-cards';
import { LISTENING_TESTS, LISTENING_CATEGORIES } from '@/lib/listening-tests';
import { READING_TESTS, READING_CATEGORIES } from '@/lib/reading-tests';
import { WRITING_TESTS } from '@/lib/writing-tests';
import { SPEAKING_CATEGORIES } from '@/lib/speaking-practice-data';

interface TestCard {
  id: string;
  title: string;
  subtitle: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  duration: string;
  volume: string;
  href: string;
}

const listeningCards: TestCard[] = LISTENING_TESTS.map(t => ({
    id: String(t.id),
    title: t.title,
    subtitle: t.category + ' · ' + t.difficulty,
    skill: 'listening' as const,
    duration: t.duration + 'm',
    volume: t.category,
    href: '/listening/' + t.slug,
  }));

const readingCards: TestCard[] = READING_TESTS.map(t => ({
    id: String(t.id),
    title: t.title,
    subtitle: t.category + ' · ' + t.difficulty,
    skill: 'reading' as const,
    duration: t.duration + 'm',
    volume: t.category,
    href: '/reading/' + t.slug,
  }));

const writingCards: TestCard[] = WRITING_TESTS.map(t => ({
  id: t.id,
  title: t.name,
  subtitle: t.task1.type + ' · ' + t.difficulty,
  skill: 'writing' as const,
  duration: t.duration + 'm',
  volume: t.task1.type,
  href: '/writing/test/' + t.slug,
}));

const speakingCards: TestCard[] = [];

const skillTabs = [
  { label: 'All', icon: null },
  { label: 'Listening', icon: Headphones, color: 'bg-violet-500' },
  { label: 'Reading', icon: BookOpen, color: 'bg-emerald-500' },
  { label: 'Writing', icon: PenLine, color: 'bg-blue-500' },
  { label: 'Speaking', icon: Mic, color: 'bg-amber-500' },
];

const categoryTabsBySkill: Record<string, string[]> = {
  All: ['All'],
  Listening: ['All', ...LISTENING_CATEGORIES],
  Reading: ['All', ...READING_CATEGORIES],
  Writing: ['All', 'Bar Chart', 'Line Graph', 'Pie Chart', 'Table', 'Process', 'Map', 'Discussion', 'Opinion', 'Problem-Solution'],
  Speaking: ['All', ...SPEAKING_CATEGORIES.filter(c => c !== 'All Topics')],
};

const skillStyles: Record<string, { badge: string; dot: string; icon: React.ElementType }> = {
  listening: { badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', dot: 'bg-violet-500', icon: Headphones },
  reading: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', dot: 'bg-emerald-500', icon: BookOpen },
  writing: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', dot: 'bg-blue-500', icon: PenLine },
  speaking: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', dot: 'bg-amber-500', icon: Mic },
};

function TestCardComponent({ test }: { test: TestCard }) {
  const config = skillStyles[test.skill];
  const Icon = config.icon;

  return (
    <Link href={test.href}>
      <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 min-h-[140px] sm:min-h-[170px] flex flex-col">
        {/* Decorative background icon */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.06] transition-transform duration-500 group-hover:scale-110">
          <Icon className="h-32 w-32 text-foreground" strokeWidth={1} />
        </div>

        {/* Top row: badge + duration */}
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
            config.badge
          )}>
            <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
            {test.skill}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5" />
            {test.duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-foreground leading-snug mb-2 pr-8">
          {test.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mt-auto">
          {test.subtitle}
        </p>
      </div>
    </Link>
  );
}

export default function PracticePage() {
  const searchParams = useSearchParams();
  const initialSkill = (searchParams.get('skill') as string) || 'All';

  const [activeSkill, setActiveSkill] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);

  const categoryTabs = categoryTabsBySkill[activeSkill] || ['All'];

  const allTests: TestCard[] = [...listeningCards, ...readingCards, ...writingCards, ...speakingCards];

  useEffect(() => {
    setResults(getTestResults());
  }, []);

  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      // Skill filter
      if (activeSkill !== 'All' && test.skill !== activeSkill.toLowerCase()) return false;
      // Category filter
      if (activeCategory !== 'All') {
        const cat = test.volume.toLowerCase();
        const active = activeCategory.toLowerCase();
        if (!cat.includes(active)) return false;
      }
      return true;
    }).filter((test) => {
      if (!search) return true;
      return test.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [activeSkill, activeCategory, search, allTests.length]);

  // Recent results
  const recentResults = useMemo(() => {
    return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 6);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Skill Cards */}
      <SkillCardsGrid testCounts={{}} />

      {/* Listening Quick Access */}
      <Link href="/listening" className="group block rounded-xl sm:rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-violet-100/50 p-4 sm:p-5 transition-all hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-300 dark:from-violet-950/50 dark:to-violet-900/30 dark:border-violet-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-violet-500 text-white">
              <Headphones className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Listening Tests</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">68 tests · Cambridge, Authentic, Pre-IELTS & more</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-violet-500 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">{filteredTests.length} tests available</p>
      </div>

      {/* Skill Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {skillTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => {
                setActiveSkill(tab.label);
                setActiveCategory('All');
              }}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                activeSkill === tab.label
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categoryTabs.map((tab: string) => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={cn(
              'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              activeCategory === tab
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Tests Grid */}
      <div key={`${activeSkill}-${activeCategory}`} className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <TestCardComponent key={`${activeSkill}-${test.id}`} test={test} />
        ))}
      </div>

      {/* Empty state */}
      {filteredTests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          {activeSkill === 'Speaking' ? (
            <Link href="/speaking" className="group flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 transition-colors">
                <Mic className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm font-semibold text-foreground">Go to Speaking Practice</p>
              <p className="text-xs text-muted-foreground">IELTS Speaking with Web Speech API — 15 topics with Part 1, 2, 3</p>
              <span className="mt-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground group-hover:bg-primary/90 transition-colors">
                Start Speaking →
              </span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No tests found.</p>
          )}
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div className="border-t border-border pt-8">
          <h2 className="text-lg font-bold tracking-tight mb-4">Recent Results</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentResults.map((result) => {
              const config = skillStyles[result.skill] || skillStyles.reading;
              return (
                <div key={result.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.badge)}>
                    <config.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{result.testTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Band {result.overallBand.toFixed(1)} • {result.accuracy}% • {result.timeSpentMinutes}m
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
