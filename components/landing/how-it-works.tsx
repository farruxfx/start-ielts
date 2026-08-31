'use client';

import { useInView } from '@/lib/animations';

const steps = [
  { num: '01', title: 'Choose your goal', desc: 'Set your target band score and exam date.' },
  { num: '02', title: 'Practice every skill', desc: 'Reading, Listening, Writing, Speaking.' },
  { num: '03', title: 'Take a mock exam', desc: 'Experience the real IELTS format.' },
  { num: '04', title: 'Track your progress', desc: 'See analytics and improve.' },
  { num: '05', title: 'Reach your target', desc: 'Achieve your dream band score.' },
];

export function HowItWorks() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-24 sm:py-32 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={ref} className={`mb-16 text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-5xl">
            Simple steps to success.
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-slate-200 lg:block" />
          <div
            className={`absolute left-0 top-6 hidden h-px bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-[3000ms] lg:block ${isInView ? 'w-full' : 'w-0'}`}
          />

          <div className="grid gap-8 lg:grid-cols-5">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative text-center transition-all duration-500 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Dot */}
                <div className="relative mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 bg-white z-10 shadow-sm">
                  <span className="text-xs font-bold text-blue-500">{step.num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
