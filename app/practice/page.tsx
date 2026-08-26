'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Clock, ChevronLeft, ChevronRight, Headphones, BookOpen, PenLine, Mic, FileCheck } from 'lucide-react';
import { getTestResults } from '@/lib/store';
import type { TestType, TestResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SkillCardsGrid, MockExamCard } from '@/components/practice/skill-cards';

interface TestCard {
  id: string;
  title: string;
  subtitle: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  duration: string;
  volume: string;
  href: string;
}

const allTests: TestCard[] = [
  {
    id: 'c21-l-t3',
    title: 'Cambridge IELTS 21 — Test 3 (Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 21',
    href: '/listening/cambridge-21-test-3',
  },
  {
    id: 'c21-l-t4',
    title: 'Cambridge IELTS 21 — Test 4 (Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 21',
    href: '/listening/cambridge-21-test-4',
  },
  {
    id: 'c21-r-t1',
    title: 'Cambridge IELTS 21 — Test 1 (Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 21',
    href: '/test/t1',
  },
  {
    id: 'c21-r-t2',
    title: 'Cambridge IELTS 21 — Test 2 (Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 21',
    href: '/test/t2',
  },
  {
    id: 'c20-l-t1',
    title: 'Cambridge IELTS 20 — Test 1 (Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 20',
    href: '/listening/cambridge-21-test-3',
  },
  {
    id: 'c20-r-t1',
    title: 'Cambridge IELTS 20 — Test 1 (Academic Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 20',
    href: '/test/t1',
  },
  {
    id: 'c19-l-t1',
    title: 'Cambridge IELTS 19 — Test 1 (Academic Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 19',
    href: '/listening/cambridge-21-test-4',
  },
  {
    id: 'c19-r-t1',
    title: 'Cambridge IELTS 19 — Test 1 (Academic Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 19',
    href: '/test/t2',
  },
  {
    id: 'mock-academic',
    title: 'Full Mock Exam — Academic',
    subtitle: 'Complete IELTS simulation',
    skill: 'reading',
    duration: '180m',
    volume: 'Mock Exam',
    href: '/mock-exam',
  },
  {
    id: 'mock-general',
    title: 'Full Mock Exam — General Training',
    subtitle: 'Complete IELTS simulation',
    skill: 'reading',
    duration: '180m',
    volume: 'Mock Exam',
    href: '/mock-exam',
  },
  {
    id: 'writing-task1',
    title: 'Academic Writing Task 1 — Data Description',
    subtitle: 'Describe visual data in formal report',
    skill: 'writing',
    duration: '20m',
    volume: 'Writing',
    href: '/practice?skill=writing',
  },
  {
    id: 'writing-task2',
    title: 'Writing Task 2 — Opinion Essay',
    subtitle: 'Write a formal opinion essay',
    skill: 'writing',
    duration: '40m',
    volume: 'Writing',
    href: '/practice?skill=writing',
  },
  {
    id: 'speaking-mock',
    title: 'Speaking Practice — Full Mock Interview',
    subtitle: 'Part 1, Part 2, Part 3 with AI feedback',
    skill: 'speaking',
    duration: '15m',
    volume: 'Speaking',
    href: '/practice?skill=speaking',
  },
];

const filterTabs = ['All', 'Cambridge 21', 'Cambridge 20', 'Cambridge 19', 'Mock Exam', 'Writing', 'Speaking'];

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
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 min-h-[170px] flex flex-col">
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

  const [activeTab, setActiveTab] = useState(initialSkill === 'all' ? 'All' : initialSkill);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    setResults(getTestResults());
  }, []);

  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      // Tab filter
      if (activeTab === 'All') return true;
      if (activeTab === 'Cambridge 21') return test.volume === 'Cambridge 21';
      if (activeTab === 'Cambridge 20') return test.volume === 'Cambridge 20';
      if (activeTab === 'Cambridge 19') return test.volume === 'Cambridge 19';
      if (activeTab === 'Mock Exam') return test.volume === 'Mock Exam';
      if (activeTab === 'Writing') return test.volume === 'Writing';
      if (activeTab === 'Speaking') return test.volume === 'Speaking';
      // Skill filter from URL
      if (activeTab === 'reading' || activeTab === 'listening' || activeTab === 'writing' || activeTab === 'speaking') {
        return test.skill === activeTab;
      }
      return true;
    }).filter((test) => {
      if (!search) return true;
      return test.title.toLowerCase().includes(search.toLowerCase());
    });
  }, [activeTab, search]);

  // Recent results
  const recentResults = useMemo(() => {
    return results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()).slice(0, 6);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Skill Cards */}
      <SkillCardsGrid testCounts={{}} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Test Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">{filteredTests.length} tests available</p>
      </div>

      {/* Filter Tabs */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                activeTab === tab
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <TestCardComponent key={test.id} test={test} />
        ))}
      </div>

      {/* Empty state */}
      {filteredTests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No tests found.</p>
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
