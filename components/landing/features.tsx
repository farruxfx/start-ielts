'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BookOpen, Headphones, PenLine, Mic, Brain, BarChart3,
  Trophy, Clock, Target, Sparkles, Zap, Shield
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: '130+ Reading Tests',
    description: 'Academic & General reading passages with real IELTS format questions.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Headphones,
    title: '68+ Listening Tests',
    description: 'Full listening sections with audio, transcripts, and answer explanations.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: PenLine,
    title: '130 Writing Topics',
    description: 'Task 1 & Task 2 topics with AI-powered essay evaluation and feedback.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Mic,
    title: 'AI Speaking Practice',
    description: 'Web Speech API + Groq AI for real-time pronunciation and fluency feedback.',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    icon: Brain,
    title: 'AI Writing Evaluator',
    description: 'Get instant band scores, corrections, and vocabulary improvements.',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Track your band scores, weak areas, and study streak over time.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Trophy,
    title: '50 Mock Exams',
    description: 'Full-length IELTS mock exams with 4 sections and timed interface.',
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Clock,
    title: 'Spaced Repetition',
    description: 'Smart vocabulary system that optimizes your learning intervals.',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Target,
    title: 'Study Plans',
    description: 'Personalized 30-day study plans based on your target band and level.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    icon: Sparkles,
    title: 'Daily Goals',
    description: 'Track daily learning goals and maintain your streak.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Automated payment verification via Telegram HUMObot.',
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-500/10',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get your band scores and feedback immediately after submission.',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-500/10',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-5' : ''}`} />
      
      <div className="relative z-10">
        <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bgColor} transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          <feature.icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'currentColor' }} />
        </div>
        <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section className="relative py-20 sm:py-28">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container-mw container-px relative z-10">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Everything you need
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            All IELTS skills,
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> one platform</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From Reading to Speaking, we cover every section with real exam format and AI-powered feedback.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
