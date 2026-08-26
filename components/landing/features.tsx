'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Headphones, PenLine, Mic, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Headphones,
    title: 'Listening',
    description:
      'Real audio, auto-save, and instant scoring across all 4 sections.',
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
    link: '/practice?skill=listening',
  },
  {
    icon: BookOpen,
    title: 'Reading',
    description:
      '13+ question types with highlight, notes, and real exam interface.',
    gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
    link: '/practice?skill=reading',
  },
  {
    icon: PenLine,
    title: 'Writing',
    description:
      'AI evaluates Task 1 & 2 across all IELTS criteria with detailed feedback.',
    gradient: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600',
    link: '/practice?skill=writing',
  },
  {
    icon: Mic,
    title: 'Speaking',
    description:
      'Record yourself, get AI pronunciation analysis and improvement tips.',
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500',
    link: '/practice?skill=speaking',
  },
  {
    icon: FileCheck,
    title: 'Mock Exams',
    description:
      'Full IELTS simulation with realistic timer and automatic band scoring.',
    gradient: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black',
    link: '/mock-exam',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 -translate-x-1/2 rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="container-mw container-px relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            All-in-one platform
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ace IELTS
            </span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Complete IELTS preparation ecosystem with specialized tools for every skill, AI-powered
            evaluation, and professional analytics.
          </p>
        </div>

        {/* Gradient Feature Cards */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-20">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.link}>
              <div
                className={`group relative overflow-hidden rounded-3xl ${feature.gradient} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:p-8`}
              >
                {/* Decorative Icon */}
                <div className="absolute -bottom-6 -right-6 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30">
                  <feature.icon className="h-28 w-28 sm:h-36 sm:w-36 text-white" />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {feature.title}
                </div>

                {/* Title */}
                <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{feature.title}</h3>

                {/* Description */}
                <p className="mt-2 max-w-xs text-sm font-medium text-white/80">
                  {feature.description}
                </p>

                {/* Button */}
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:gap-3">
                  Practice
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link href="/practice">
            <Button
              variant="outline"
              size="lg"
              className="group border-2 px-8 transition-all hover:bg-muted/50"
            >
              Explore all features
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
