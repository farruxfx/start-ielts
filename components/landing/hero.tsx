'use client';

import Link from 'next/link';
import { useInView } from '@/lib/animations';
import { ArrowRight, Play, Headphones, BookOpen, PenTool, Mic } from 'lucide-react';

export function Hero() {
  const { ref: heroRef, isInView } = useInView();

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft blue gradient orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-sky-100/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-50/30 blur-3xl" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating skill icons */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <div className="absolute top-[20%] left-[10%] animate-[float_6s_ease-in-out_infinite]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100">
            <Headphones className="h-7 w-7 text-blue-500" />
          </div>
        </div>
        <div className="absolute top-[25%] right-[12%] animate-[float_7s_ease-in-out_1s_infinite]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100">
            <BookOpen className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        <div className="absolute bottom-[25%] left-[15%] animate-[float_8s_ease-in-out_2s_infinite]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100">
            <PenTool className="h-6 w-6 text-orange-500" />
          </div>
        </div>
        <div className="absolute bottom-[20%] right-[10%] animate-[float_6s_ease-in-out_3s_infinite]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100">
            <Mic className="h-7 w-7 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-24">
        {/* Badge */}
        <div
          className={`mb-8 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            The Smart Way to Prepare for IELTS
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`text-4xl font-extrabold tracking-[-0.02em] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="text-slate-900">Prepare smarter.</span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Perform better.</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg md:text-xl transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          Practice all four IELTS skills, take realistic mock exams, track your progress,
          and understand exactly what to improve.
        </p>

        {/* CTAs */}
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-2xl bg-blue-500 px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 hover:shadow-blue-500/35 hover:scale-[1.02]"
          >
            Start Learning for Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/practice"
            className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-[15px] font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          >
            <Play className="h-4 w-4" />
            Explore the Platform
          </Link>
        </div>

        {/* Trust */}
        <p
          className={`mt-6 text-[13px] text-slate-400 transition-all duration-700 delay-[400ms] ${isInView ? 'opacity-100' : 'opacity-0'}`}
        >
          No credit card required. Free to start.
        </p>

        {/* Stats */}
        <div
          className={`mt-16 flex items-center justify-center gap-8 sm:gap-16 transition-all duration-700 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">7.5+</div>
            <div className="text-[13px] text-slate-400 mt-1">Avg. Band Score</div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">10K+</div>
            <div className="text-[13px] text-slate-400 mt-1">Students</div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">95%</div>
            <div className="text-[13px] text-slate-400 mt-1">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  );
}
