'use client';

import { useInView } from '@/lib/animations';
import { Star } from 'lucide-react';

const testimonials = [
  {
    text: 'More confident before my mock exams. The practice tests feel exactly like the real thing.',
    name: 'Dilshod K.',
    score: 'Band 7.5',
    stars: 5,
  },
  {
    text: 'Finally, I can see where I need to improve. The analytics changed my study approach completely.',
    name: 'Nilufar M.',
    score: 'Band 8.0',
    stars: 5,
  },
  {
    text: 'The AI writing feedback helped me identify patterns I never noticed before. Highly recommend!',
    name: 'Sardor T.',
    score: 'Band 7.0',
    stars: 5,
  },
];

export function Testimonials() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-24 sm:py-32 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={ref} className={`mb-16 text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600 mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-5xl">
            Success stories.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`rounded-2xl border border-slate-100 bg-white p-8 transition-all duration-500 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-1 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-[15px] leading-relaxed text-slate-600 mb-6">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-900">{t.name}</span>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{t.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
