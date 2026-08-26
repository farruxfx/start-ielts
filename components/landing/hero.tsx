'use client';

import Link from 'next/link';
import { ArrowRight, Play, CheckCircle2, Star, Zap, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-30" />
      <div className="absolute left-1/4 top-0 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute right-1/4 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 -z-10 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-purple-500/5 blur-[80px]" />

      <div className="container-mw container-px relative">
        {/* Top Badge */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <Badge
            variant="secondary"
            className="gap-2 rounded-full border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
          >
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Now with AI-powered Speaking Evaluation
          </Badge>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            Prepare smarter.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Score higher.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl lg:mt-8 lg:text-2xl">
            Professional IELTS preparation with real exam interface, AI-powered feedback, and
            detailed analytics. Join 10,000+ students who achieved their target band.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-lg font-bold shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] lg:px-12 lg:py-4.5"
              >
                <span className="relative z-10 flex items-center">
                  Start practicing free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link href="/practice">
              <Button
                size="lg"
                variant="outline"
                className="group px-10 py-4 text-lg font-bold transition-all hover:bg-muted/50 lg:px-12 lg:py-4.5"
              >
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Explore tests
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:mt-10">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              4.9/5 from 2,000+ students
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Instant AI feedback
            </span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mx-auto mt-16 max-w-3xl lg:mt-20">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/20 bg-white/50 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-950/50 sm:p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold sm:text-3xl">7.5+</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Avg. Band Score</p>
            </div>
            <div className="border-x border-border/50 text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold sm:text-3xl">10K+</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Active Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-2xl font-bold sm:text-3xl">95%</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Success Rate</p>
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="mx-auto mt-16 max-w-5xl lg:mt-20">
          <div className="group relative rounded-2xl border border-white/20 bg-white/50 p-2 shadow-2xl shadow-blue-500/10 backdrop-blur-sm transition-all duration-500 hover:shadow-blue-500/20 dark:bg-gray-950/50 sm:p-3">
            <div className="overflow-hidden rounded-xl bg-gradient-to-b from-muted/40 to-background p-4 sm:p-6">
              {/* Browser Chrome */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
                  ieltspro.app/practice/reading
                </div>
                <div className="w-16" />
              </div>

              {/* App Content */}
              <div className="mt-4 grid gap-4 sm:mt-6 md:grid-cols-2">
                {/* Reading Passage */}
                <div className="rounded-xl border border-border bg-background p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:hover:border-blue-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Reading Passage
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Academic
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-full rounded-full bg-muted" />
                    <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                    <div className="h-2.5 w-full rounded-full bg-muted" />
                    <div className="h-2.5 w-4/6 rounded-full bg-muted" />
                    <div className="h-2.5 w-full rounded-full bg-muted" />
                    <div className="h-2.5 w-3/4 rounded-full bg-muted" />
                    <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Question Panel */}
                <div className="rounded-xl border border-border bg-background p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:hover:border-indigo-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      Question 7 of 40
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      In Progress
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3.5 w-full rounded bg-muted" />
                    <div className="space-y-2.5">
                      {['A', 'B', 'C', 'D'].map((opt, i) => (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm transition-all ${
                            i === 1
                              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold ${
                              i === 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {opt}
                          </span>
                          <div className="h-2.5 flex-1 rounded-full bg-muted/60" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-8 rounded-full transition-all ${
                        i < 6
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Question 7 / 40
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
