'use client';

import { useInView } from '@/lib/animations';
import { CheckCircle, Clock, BarChart3, Target } from 'lucide-react';

const features = [
  { icon: CheckCircle, text: 'Full exam experience' },
  { icon: Clock, text: 'Timed sessions' },
  { icon: BarChart3, text: 'Detailed results' },
  { icon: Target, text: 'Progress tracking' },
];

export function MockExamShowcase() {
  const { ref, isInView } = useInView();

  return (
    <section id="mock-exam" className="relative py-24 sm:py-32 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={ref} className={`grid gap-12 lg:grid-cols-2 items-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Left — Content */}
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600 mb-4">
              Mock Exams
            </span>
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
              Practice like it&apos;s the real exam.
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Experience realistic IELTS mock exams designed to simulate the real test environment. Build confidence and master time management.
            </p>

            <div className="mt-8 space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <f.icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-[15px] font-medium text-slate-700">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/50">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 h-7 rounded-lg bg-slate-100 flex items-center px-3">
                  <span className="text-[11px] text-slate-400">startielts.uz/mock-exam</span>
                </div>
              </div>

              {/* Mock content */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Mock Exam #12</h4>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">Completed</span>
                </div>

                {/* Score bars */}
                <div className="space-y-3">
                  {[
                    { skill: 'Listening', score: '8.0', pct: 80, color: 'bg-blue-500' },
                    { skill: 'Reading', score: '7.5', pct: 75, color: 'bg-emerald-500' },
                    { skill: 'Writing', score: '6.5', pct: 65, color: 'bg-orange-500' },
                    { skill: 'Speaking', score: '7.0', pct: 70, color: 'bg-purple-500' },
                  ].map((s) => (
                    <div key={s.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-medium text-slate-600">{s.skill}</span>
                        <span className="text-[13px] font-bold text-slate-900">{s.score}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[13px] text-slate-500">Overall Band Score</span>
                  <span className="text-xl font-bold text-slate-900">7.25</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
