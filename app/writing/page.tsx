'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, BookOpen, BarChart3, Filter, ChevronLeft } from 'lucide-react';
import { WRITING_TESTS, WRITING_CATEGORIES } from '@/lib/writing-tests';

export default function WritingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = WRITING_TESTS.filter(test => {
    const matchesCategory = selectedCategory === 'All' || 
      test.task1.type === selectedCategory || 
      test.task2.type === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.task1.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.task2.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4" />
            Back to Practice
          </Link>
          <h1 className="text-2xl font-bold">IELTS Writing Tests</h1>
          <p className="text-muted-foreground mt-1">{WRITING_TESTS.length} ta writing test mavjud</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === 'All' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              All ({WRITING_TESTS.length})
            </button>
            {WRITING_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card border border-border hover:bg-muted'
                }`}
              >
                {cat} ({WRITING_TESTS.filter(t => t.task1.type === cat || t.task2.type === cat).length})
              </button>
            ))}
          </div>
        </div>

        {/* Tests grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => (
            <Link
              key={test.id}
              href={`/writing/test/${test.id}`}
              className="group rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  test.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                  test.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-red-500/10 text-red-600'
                }`}>
                  {test.difficulty}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {test.duration} min
                </div>
              </div>

              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{test.name}</h3>
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 font-semibold flex-shrink-0">
                    T1
                  </span>
                  <span className="line-clamp-2">{test.task1.type}: {test.task1.topic}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="inline-flex items-center rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-600 font-semibold flex-shrink-0">
                    T2
                  </span>
                  <span className="line-clamp-2">{test.task2.type}: {test.task2.topic}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Task 1 + Task 2</span>
                </div>
                <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Start →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tests found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
