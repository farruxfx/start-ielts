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
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-[#080808]" />
      
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mb-16 text-center transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            How it works.
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/[0.06] lg:block" />
          <div
            className={`absolute left-0 top-6 hidden h-px bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-[3000ms] lg:block ${isInView ? 'w-full' : 'w-0'}`}
          />

          <div className="grid gap-8 lg:grid-cols-5">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative text-center transition-all duration-700 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Dot */}
                <div className="relative mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-[#080808] z-10">
                  <span className="text-xs font-bold text-white/60">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/35">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
