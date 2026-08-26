'use client';

import { useState } from 'react';
import { Headphones, BookOpen, Clock, ChevronLeft, ChevronRight, Filter, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TestCard {
  id: string;
  title: string;
  subtitle: string;
  skill: 'listening' | 'reading';
  duration: string;
  volume: string;
  file: string;
}

const allTests: TestCard[] = [
  {
    id: 'cambridge-21-test-3-listening',
    title: 'Cambridge IELTS 21 — Test 3 (Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 21',
    file: '/listening/cambridge-21-test-3',
  },
  {
    id: 'cambridge-21-test-4-listening',
    title: 'Cambridge IELTS 21 — Test 4 (Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 21',
    file: '/listening/cambridge-21-test-4',
  },
  {
    id: 'cambridge-21-test-1-reading',
    title: 'Cambridge IELTS 21 — Test 1 (Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 21',
    file: '/test/t1',
  },
  {
    id: 'cambridge-21-test-2-reading',
    title: 'Cambridge IELTS 21 — Test 2 (Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 21',
    file: '/test/t2',
  },
  {
    id: 'cambridge-20-test-1-listening',
    title: 'Cambridge IELTS 20 — Test 1 (Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 20',
    file: '/listening/cambridge-21-test-3',
  },
  {
    id: 'cambridge-20-test-1-reading',
    title: 'Cambridge IELTS 20 — Test 1 (Academic Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 20',
    file: '/test/t1',
  },
  {
    id: 'cambridge-19-test-1-listening',
    title: 'Cambridge IELTS 19 — Test 1 (Academic Listening)',
    subtitle: 'Digitised from the source book',
    skill: 'listening',
    duration: '33m',
    volume: 'Cambridge 19',
    file: '/listening/cambridge-21-test-4',
  },
  {
    id: 'cambridge-19-test-1-reading',
    title: 'Cambridge IELTS 19 — Test 1 (Academic Reading)',
    subtitle: 'Digitised from the source book',
    skill: 'reading',
    duration: '60m',
    volume: 'Cambridge 19',
    file: '/test/t2',
  },
];

const filterTabs = ['All', 'Exam Library', 'Recent Actual Tests', 'Volume Tests', 'Cambridge 21', 'Cambridge 20', 'Cambridge 19'];

const skillConfig = {
  listening: {
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
    dot: 'bg-violet-500',
    icon: Headphones,
  },
  reading: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    icon: BookOpen,
  },
};

function TestCardComponent({ test }: { test: TestCard }) {
  const config = skillConfig[test.skill];
  const Icon = config.icon;

  return (
    <Link href={test.file}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 min-h-[160px] flex flex-col">
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
        <h3 className="text-base font-bold text-foreground leading-snug mb-2 pr-8">
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

export default function ListeningTestsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const tabsContainerRef = useState<HTMLDivElement | null>(null);

  const filteredTests = allTests.filter((test) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Exam Library') return true;
    if (activeTab === 'Recent Actual Tests') return true;
    if (activeTab === 'Volume Tests') return true;
    if (activeTab.startsWith('Cambridge')) return test.volume === activeTab;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/practice"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Practice
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Test Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filteredTests.length} tests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="relative">
        <div
          ref={(el) => (tabsContainerRef as any).current = el}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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

      {/* Tests Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => (
          <TestCardComponent key={test.id} test={test} />
        ))}
      </div>

      {/* Empty state */}
      {filteredTests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No tests found for this filter.</p>
        </div>
      )}
    </div>
  );
}
