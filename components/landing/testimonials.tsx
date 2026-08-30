'use client';

import { useInView } from '@/lib/animations';

const testimonials = [
  {
    text: 'More confident before my mock exams. The practice tests feel exactly like the real thing.',
    name: 'Student A',
    score: 'Band 7.5',
  },
  {
    text: 'Finally, I can see where I need to improve. The analytics changed my study approach completely.',
    name: 'Student B',
    score: 'Band 8.0',
  },
  {
    text: 'The AI writing feedback helped me identify patterns I never noticed before.',
    name: 'Student C',
    score: 'Band 7.0',
  },
];

export function Testimonials() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-[#080808]" />
      
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mb-16 text-center transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Success stories.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-700 hover:border-white/[0.1] ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <p className="text-[15px] leading-relaxed text-white/50 mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">{t.name}</span>
                <span className="text-xs text-indigo-400/70">{t.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
