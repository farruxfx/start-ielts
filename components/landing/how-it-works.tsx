'use client';

import { Monitor, Brain, TrendingUp, Award, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Monitor,
    title: 'Practice in real exam environment',
    description:
      'Our interface mirrors the official computer-delivered IELTS exam. Timer, navigation, highlight, notes — everything for test-day confidence.',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-950',
    number: '01',
  },
  {
    icon: Brain,
    title: 'Get AI-powered feedback',
    description:
      'Submit Writing and Speaking responses for instant evaluation across all IELTS criteria — task achievement, coherence, lexical resource, grammar, and pronunciation.',
    color: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950',
    number: '02',
  },
  {
    icon: TrendingUp,
    title: 'Track your progress',
    description:
      'Monitor band score progression over time. Identify weak areas, compare skills against targets, and receive personalized recommendations.',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-950',
    number: '03',
  },
  {
    icon: Award,
    title: 'Achieve your target band',
    description:
      'Follow a personalized study plan, practice consistently, and watch scores improve. Join thousands who reached their target band.',
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100 dark:bg-amber-950',
    number: '04',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-32">
      <div className="container-mw container-px">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            Simple process
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            How it works
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Four simple steps from your first practice test to your target band score.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-16 grid gap-8 lg:mt-20 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="group relative">
              {/* Connector Line (Desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-4 top-8 hidden h-px w-8 bg-gradient-to-r from-border to-transparent lg:block" />
              )}

              {/* Card */}
              <div className="relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:border-indigo-800 sm:p-8">
                {/* Step Number */}
                <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-bold text-gray-600 shadow-sm dark:from-gray-800 dark:to-gray-700 dark:text-gray-300">
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.iconBg} transition-transform duration-300 group-hover:scale-110`}
                >
                  <step.icon
                    className={`h-7 w-7 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                    style={{
                      color: 'transparent',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                    }}
                  />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Get started now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
