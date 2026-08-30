'use client';

import { useInView, useMouseParallax } from '@/lib/animations';
import { Check, Clock, BarChart3, Target, ArrowRight } from 'lucide-react';

export function MockExamShowcase() {
  const { ref, isInView } = useInView();
  const mouse = useMouseParallax(0.008);

  return (
    <section id="mock-exam" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-[#080808]" />
      
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left - Content */}
          <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
              Practice like it&apos;s the
              <br />
              <span className="text-white/30">real exam.</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 leading-relaxed">
              Experience realistic IELTS mock exams designed to simulate the real test environment.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Target, text: 'Full exam experience with all 4 sections' },
                { icon: Clock, text: 'Timed sessions matching real IELTS format' },
                { icon: BarChart3, text: 'Detailed results and band score analysis' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                    <item.icon className="h-4 w-4 text-white/40" />
                  </div>
                  <span className="text-[15px] text-white/50">{item.text}</span>
                </div>
              ))}
            </div>

            <a
              href="/signup"
              className="mt-10 inline-flex items-center gap-2 text-[15px] font-medium text-white/60 transition-colors hover:text-white"
            >
              Start practicing <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Right - 3D Dashboard Mockup */}
          <div
            className={`relative transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            style={{
              transform: `perspective(1200px) rotateY(${mouse.x * 0.3}deg) rotateX(${-mouse.y * 0.2}deg)`,
            }}
          >
            {/* Glow behind */}
            <div className="absolute -inset-10 bg-indigo-500/[0.05] rounded-full blur-[80px]" />
            
            {/* Dashboard */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-2xl shadow-black/40">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-xl border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-white/[0.04] px-3 py-1 text-[11px] text-white/30">
                  startielts.app/mock-exam/1
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Mock Exam #1</div>
                    <div className="text-xs text-white/30">Academic • Reading Section</div>
                  </div>
                  <div className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                    32:15 remaining
                  </div>
                </div>

                {/* Progress */}
                <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
                  <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400" />
                </div>

                {/* Question area */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="text-xs text-white/30 mb-3">Question 26 of 40</div>
                  <div className="h-3 w-full rounded bg-white/[0.06] mb-2" />
                  <div className="h-3 w-4/5 rounded bg-white/[0.06] mb-4" />
                  
                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D'].map((opt, i) => (
                      <div
                        key={opt}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                          i === 2
                            ? 'border-indigo-500/30 bg-indigo-500/[0.06]'
                            : 'border-white/[0.04] bg-white/[0.01]'
                        }`}
                      >
                        <div className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-medium ${
                          i === 2 ? 'bg-indigo-500 text-white' : 'bg-white/[0.06] text-white/30'
                        }`}>
                          {opt}
                        </div>
                        <div className="h-2 flex-1 rounded bg-white/[0.04]" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score preview */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Listening', score: '8.0', color: 'text-emerald-400' },
                    { label: 'Reading', score: '7.5', color: 'text-indigo-400' },
                    { label: 'Writing', score: '7.0', color: 'text-amber-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-center">
                      <div className="text-[10px] text-white/30">{s.label}</div>
                      <div className={`text-lg font-bold ${s.color}`}>{s.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
