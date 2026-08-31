'use client';

import Link from 'next/link';
import { useInView } from '@/lib/animations';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-white">
      <div className="mx-auto max-w-4xl px-6">
        <div
          ref={ref}
          className={`relative rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-8 py-16 text-center shadow-2xl shadow-blue-500/20 sm:px-16 sm:py-20 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Subtle pattern */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
              Your next band
              <br />
              starts today.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/80">
              Start practicing smarter and take the next step toward your IELTS goal.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[15px] font-semibold text-blue-600 shadow-lg transition-all hover:bg-white/90 hover:shadow-xl hover:scale-[1.02]"
              >
                Start for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/60">Join StartIELTS today.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
