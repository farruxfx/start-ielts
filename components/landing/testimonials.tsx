'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Dilnoza K.',
    score: 'Band 7.5',
    university: 'University of Edinburgh',
    text: 'IELTS PRO ning AI writing evaluation i juda foydali boldi. Har bir essay im uchun batafsil feedback oldim va writing im 5.5 dan 7.0 ga kotarildi.',
    initial: 'D',
    rating: 5,
    improvement: '+2.0',
    avatarBg: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Jasur T.',
    score: 'Band 8.0',
    university: 'University of Melbourne',
    text: 'The mock exams felt exactly like the real test. The timer, the interface, everything was spot on. I scored 8.0 on my actual IELTS.',
    initial: 'J',
    rating: 5,
    improvement: '+2.5',
    avatarBg: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Malika R.',
    score: 'Band 7.0',
    university: 'UCL',
    text: 'Speaking simulator is amazing. I practiced every day for a month and my fluency improved dramatically. Got 7.0 in speaking!',
    initial: 'M',
    rating: 5,
    improvement: '+1.5',
    avatarBg: 'from-purple-500 to-pink-500',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="container-mw container-px relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Student success stories
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Students achieve their{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              dreams
            </span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Minglab talabalar IELTS PRO bilan o z target band score lariga yetdi.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-3 lg:mt-20">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 sm:p-8 dark:hover:border-amber-800"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="h-8 w-8 text-amber-500/30" />
              </div>

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="flex-1 text-sm leading-relaxed text-foreground/90 sm:text-base">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* User Info */}
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarBg} text-sm font-bold text-white shadow-lg`}
                >
                  {t.initial}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.university}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {t.score}
                  </div>
                  <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    {t.improvement} improvement
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-col items-center justify-center gap-8 border-t border-border pt-16 lg:mt-20">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['D', 'J', 'M', 'A', 'R'].map((initial, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-muted to-muted-foreground/20 text-xs font-bold"
                >
                  {initial}
                </div>
              ))}
            </div>
            <div className="ml-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">10,000+</span> students trust IELTS
              PRO
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span>
                <span className="font-semibold text-foreground">4.9/5</span> average rating
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>
                <span className="font-semibold text-foreground">95%</span> success rate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌍</span>
              <span>
                <span className="font-semibold text-foreground">50+</span> countries
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
