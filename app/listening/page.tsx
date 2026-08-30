'use client';

import { useState, useMemo } from 'react';
import { Headphones, Clock, ChevronLeft, Search, Filter, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LISTENING_TESTS, LISTENING_CATEGORIES, type ListeningTest } from '@/lib/listening-tests';

const diffColors: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

function TestCard({ test }: { test: ListeningTest }) {
  return (
    <Link href={`/listening/${test.slug}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 hover:border-violet-300/30 min-h-[150px] flex flex-col">
        {/* Decorative icon */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.05] transition-transform duration-500 group-hover:scale-110">
          <Headphones className="h-32 w-32 text-violet-500" strokeWidth={1} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide dark:bg-violet-900 dark:text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Listening
          </span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', diffColors[test.difficulty])}>
            {test.difficulty}
          </span>
        </div>

        <h3 className="text-[14px] font-bold text-foreground leading-snug mb-2 pr-4 line-clamp-2">
          {test.title}
        </h3>

        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="rounded-md bg-muted/60 px-2 py-0.5 font-medium">{test.category}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {test.duration}m · {test.questionCount}Q
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ListeningTestsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const allTabs = LISTENING_CATEGORIES;

  const filtered = useMemo(() => {
    return LISTENING_TESTS.filter(t => {
      if (activeTab !== 'All' && t.category !== activeTab) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activeTab, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: LISTENING_TESTS.length };
    LISTENING_TESTS.forEach(t => { c[t.category] = (c[t.category] || 0) + 1; });
    return c;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/practice" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Practice
        </Link>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
            <Headphones className="h-5 w-5 text-violet-600" />
          </div>
          Listening Tests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{LISTENING_TESTS.length} tests available · Audio included</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {allTabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              activeTab === tab ? 'bg-violet-600 text-white shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}>
            {tab} <span className="ml-1 text-xs opacity-70">({counts[tab] || 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(test => <TestCard key={test.id} test={test} />)}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No tests found.</p>
        </div>
      )}
    </div>
  );
}
