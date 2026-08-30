'use client';

import { useEffect, useRef, useState } from 'react';
import { UserPlus, Target, BookOpen, Trophy, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Account',
    description: 'Sign up for free with email or Google. Takes less than 30 seconds.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Target,
    step: '02',
    title: 'Set Your Goal',
    description: 'Choose your target band score and we\'ll create a personalized study plan.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    step: '03',
    title: 'Practice Daily',
    description: 'Complete reading, listening, writing, and speaking exercises every day.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Achieve Your Band',
    description: 'Track your progress and reach your target IELTS band score.',
    color: 'from-emerald-500 to-teal-500',
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center text-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="absolute left-[calc(50%+40px)] top-10 hidden h-0.5 w-[calc(100%-80px)] bg-gradient-to-r from-border to-transparent lg:block" />
      )}

      {/* Step number */}
      <div className="relative mb-6">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-xl transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
          <step.icon className="h-8 w-8" />
        </div>
        <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border text-xs font-bold">
          {step.step}
        </span>
      </div>

      <h3 className="text-xl font-bold">{step.title}</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-mw container-px">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Start in 4 simple steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started with IELTS PRO in minutes. No complicated setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-4">
          {steps.map((step, index) => (
            <StepCard key={step.step} step={step} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a href="/signup" className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:underline">
            Get started now
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
