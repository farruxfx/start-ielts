'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'AI-powered writing & speaking evaluation',
  'Real exam interface with timer',
  'Detailed analytics dashboard',
  'Unlimited practice tests',
];

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-mw container-px">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-16 sm:px-12 lg:px-20 lg:py-24">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4" />
                Start your journey today
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to achieve your target band?
              </h2>

              <p className="mt-5 max-w-lg text-lg text-white/80">
                Bepul boshlang. Kredit karta talab qilinmaydi. Target band score ingizga bugun
                erishing.
              </p>

              {/* Benefits */}
              <div className="mt-8 space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-white/80" />
                    <span className="text-sm text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="group w-full bg-white text-blue-600 px-8 py-4 text-lg font-bold shadow-xl shadow-black/10 transition-all hover:bg-white/90 hover:shadow-2xl sm:w-auto"
                  >
                    Start practicing free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-white/30 bg-transparent text-white px-8 py-4 text-lg font-bold hover:bg-white/10 sm:w-auto"
                  >
                    View pricing
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Floating Cards */}
                <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                  <div className="space-y-4">
                    {/* Score Card */}
                    <div className="rounded-xl bg-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white/80">Your Band Score</p>
                          <p className="mt-1 text-3xl font-bold text-white">7.5</p>
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                          <span className="text-2xl font-bold text-white">A</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full bg-white/30"
                          />
                        ))}
                        <div className="h-1.5 w-2 rounded-full bg-white/30" />
                      </div>
                    </div>

                    {/* Progress Card */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-white/60">Reading</p>
                        <p className="mt-1 text-xl font-bold text-white">8.0</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-white/60">Writing</p>
                        <p className="mt-1 text-xl font-bold text-white">7.0</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-white/60">Listening</p>
                        <p className="mt-1 text-xl font-bold text-white">7.5</p>
                      </div>
                      <div className="rounded-xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-white/60">Speaking</p>
                        <p className="mt-1 text-xl font-bold text-white">7.5</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -right-4 -top-4 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  🎉 +1.5 Band
                </div>
                <div className="absolute -bottom-4 -left-4 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  ⭐ 4.9 Rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
