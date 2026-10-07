'use client';

import { useState } from 'react';
import { ChevronLeft, BookOpen, Search, Clock, HelpCircle, Lock, Check } from 'lucide-react';
import Link from 'next/link';
import { READING_TESTS, READING_CATEGORIES } from '@/lib/reading-tests';
import { isFreeTest } from '@/lib/test-access';
import { useAccessState } from '@/lib/access-client';
import { PremiumTestModal } from '@/components/subscription/premium-test-modal';

function ReadingCard({ test, subscriptionActive }: { test: typeof READING_TESTS[number]; subscriptionActive: boolean }) {
  const free = isFreeTest(test.slug);
  const unlocked = free || subscriptionActive;
  const [modalOpen, setModalOpen] = useState(false);

  const body = (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-border/50 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5">
      {/* Top badges */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          📖 READING
        </span>
        <span className="text-xs font-medium text-muted-foreground">{test.difficulty}</span>
      </div>

      {/* Title */}
      <h3 className="mb-3 text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {test.name}
      </h3>

      {/* Access badge + CTA */}
      <div className="mb-3 flex items-center justify-between">
        {free ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
            <Check className="h-3 w-3" /> Free
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700">
            <Lock className="h-3 w-3" /> Premium
          </span>
        )}
        <span className="text-[11px] font-bold text-primary">
          {unlocked ? 'Start Test' : 'Unlock with Subscription'}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1">
          <Clock className="h-3 w-3" />
          {test.duration}m
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-1">
          <HelpCircle className="h-3 w-3" />
          {test.questionCount}Q
        </span>
        <span className="rounded-md bg-violet-50 px-2 py-1 text-violet-600 font-medium">
          {test.category}
        </span>
      </div>

      {/* Locked overlay hint */}
      {!unlocked && (
        <div className="pointer-events-none absolute right-3 top-12 rounded-full bg-violet-600/10 p-2 transition-transform duration-300 group-hover:scale-110">
          <Lock className="h-4 w-4 text-violet-600" />
        </div>
      )}
    </div>
  );

  return (
    <>
      {unlocked ? (
        <Link href={`/reading/${test.slug}`} className="h-full">{body}</Link>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="h-full text-left"
          aria-label={`${test.name} — Premium test`}
        >
          {body}
        </button>
      )}
      <PremiumTestModal open={modalOpen} onClose={() => setModalOpen(false)} testName={test.name} />
    </>
  );
}

export default function ReadingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { subscriptionActive } = useAccessState();

  const categories = ['All', ...READING_CATEGORIES];

  const filteredTests = READING_TESTS.filter(test => {
    const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
    const matchesSearch = !searchQuery || test.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-violet-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Practice
            </Link>
          </div>
          <h1 className="text-lg font-bold">
            <span className="text-primary">📖</span> Reading Tests
          </h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              {READING_TESTS.length}
            </span>
            <span className="text-sm text-muted-foreground">tests available · Reading passages</span>
          </div>
        </div>

        {/* Premium banner */}
        {!subscriptionActive && (
          <Link href="/pricing" className="group mb-6 block rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-violet-100/50 p-4 transition-all hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-300 dark:from-violet-950/50 dark:to-violet-900/30 dark:border-violet-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">3 ta test bepul — qolganlari Premium</p>
                  <p className="text-xs text-muted-foreground">Barcha testlarni ochish uchun obunani faollashtiring</p>
                </div>
              </div>
              <span className="text-lg text-violet-500 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        )}

        {/* Category tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(cat => {
            const count = cat === 'All' ? READING_TESTS.length : READING_TESTS.filter(t => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-primary'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Test cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <ReadingCard key={test.slug} test={test} subscriptionActive={subscriptionActive} />
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No tests found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
