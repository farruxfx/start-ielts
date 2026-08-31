'use client';

import { useInView } from '@/lib/animations';
import { TrendingUp, Brain, Zap } from 'lucide-react';

export function Analytics() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600 mb-4">
            Analytics
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-5xl">
            See your progress.
            <br />
            <span className="text-slate-400">Know what to improve.</span>
          </h2>
        </div>

        <div className={`grid gap-6 sm:grid-cols-3 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Chart Card */}
          <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Band Score Progress</h3>
                <p className="text-sm text-slate-500 mt-1">Last 12 weeks</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                +1.5 improvement
              </div>
            </div>

            {/* Simple SVG Chart */}
            <div className="relative h-48">
              <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="0" y1={i * 37.5} x2="400" y2={i * 37.5} stroke="#e2e8f0" strokeWidth="1" />
                ))}
                {/* Area fill */}
                <path
                  d="M0,130 Q50,120 100,110 T200,85 T300,55 T400,30 L400,150 L0,150 Z"
                  fill="url(#gradient)"
                  opacity="0.3"
                />
                {/* Line */}
                <path
                  d="M0,130 Q50,120 100,110 T200,85 T300,55 T400,30"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] text-slate-400 -mb-5">
                <span>Week 1</span>
                <span>Week 4</span>
                <span>Week 8</span>
                <span>Week 12</span>
              </div>
            </div>
          </div>

          {/* Side Cards */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mb-4">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <h4 className="font-bold text-slate-900">Smart Analysis</h4>
              <p className="text-sm text-slate-500 mt-1">AI identifies your weak areas automatically</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>
              <h4 className="font-bold text-slate-900">Instant Feedback</h4>
              <p className="text-sm text-slate-500 mt-1">Get detailed results immediately after each test</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
