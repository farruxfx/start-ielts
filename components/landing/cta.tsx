'use client';

import Link from 'next/link';
import { useInView } from '@/lib/animations';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-32 sm:py-40 overflow-hidden">
      <div className="absolute inset-0 bg-[#080808]" />
      
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/[0.1]"
          style={{
            left: `${10 + (i * 4.3) % 80}%`,
            top: `${10 + (i * 5.7) % 80}%`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            animation: `float ${5 + (i % 3)}s ease-in-out ${i * 0.5}s infinite`,
          }}
        />
      ))}

      <div ref={ref} className={`relative z-10 mx-auto max-w-3xl px-6 text-center transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <h2 className="text-5xl font-bold tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
          Your next band
          <br />
          <span className="text-gradient">starts today.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-white/40">
          Start practicing smarter and take the next step toward your IELTS goal.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-[15px] font-semibold text-black transition-all hover:bg-white/90"
          >
            Start for Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <p className="mt-4 text-sm text-white/25">Join StartIELTS today.</p>
      </div>
    </section>
  );
}
