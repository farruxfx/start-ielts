'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="container-mw container-px relative z-10">
        <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-primary via-purple-600 to-indigo-600 p-8 sm:p-12 lg:p-16 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
          </div>

          {/* Floating particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/30"
              style={{
                left: `${10 + (i * 7) % 80}%`,
                top: `${10 + (i * 11) % 80}%`,
                animation: `float ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Limited Time Offer — 30% OFF
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to achieve your target band?
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
              Join 10,000+ students who improved their IELTS scores with IELTS PRO. Start your journey today.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="group bg-white text-primary hover:bg-white/90 px-10 py-4 text-lg font-bold shadow-xl transition-all hover:scale-[1.02]"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg font-bold backdrop-blur-sm"
                >
                  View pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
