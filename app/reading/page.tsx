'use client';

import { useState } from 'react';
import { ChevronLeft, BookOpen, Search, Clock, HelpCircle, Headphones } from 'lucide-react';
import Link from 'next/link';
import { READING_TESTS, READING_CATEGORIES } from '@/lib/reading-tests';

export default function ReadingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
            <Link
              key={test.slug}
              href={`/reading/${test.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5"
            >
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
            </Link>
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
