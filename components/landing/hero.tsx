'use client';

import Link from 'next/link';
import { useMouseParallax, useInView } from '@/lib/animations';
import { ArrowRight, Play } from 'lucide-react';

// Floating glass card component
function GlassCard({ children, className = '', delay = 0, x = 0, y = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  x?: number;
  y?: number;
}) {
  const mouse = useMouseParallax(0.015);
  return (
    <div
      className={`absolute pointer-events-none transition-transform duration-[2000ms] ease-out ${className}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${mouse.x * (1 + delay * 0.3)}px, ${mouse.y * (1 + delay * 0.3)}px)`,
        animation: `float ${6 + delay * 2}s ease-in-out ${delay}s infinite`,
      }}
    >
      <div className="glass rounded-2xl p-4 shadow-2xl shadow-black/20">
        {children}
      </div>
    </div>
  );
}

// Floating 3D sphere
function FloatingSphere({ size, color, x, y, delay, blur = false }: {
  size: number; color: string; x: number; y: number; delay: number; blur?: boolean;
}) {
  const mouse = useMouseParallax(0.02);
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        transform: `translate(${mouse.x * 1.5}px, ${mouse.y * 1.5}px)`,
        animation: `float-slow ${8 + delay}s ease-in-out ${delay}s infinite`,
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`,
          boxShadow: `0 0 ${size}px ${color}20, inset 0 0 ${size / 2}px ${color}10`,
          filter: blur ? 'blur(1px)' : 'none',
        }}
      />
    </div>
  );
}

// Waveform element
function Waveform({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-[3px] ${className}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full bg-indigo-400/40"
          style={{
            height: `${8 + Math.sin(i * 0.8) * 8}px`,
            animation: `waveform ${1.5 + (i % 3) * 0.3}s ease-in-out ${i * 0.1}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Orbiting letter
function OrbitLetter({ letter, delay }: { letter: string; delay: number }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -ml-3 -mt-3"
      style={{ animation: `orbit ${20 + delay * 5}s linear ${delay}s infinite` }}
    >
      <span className="text-lg font-bold text-white/10">{letter}</span>
    </div>
  );
}

export function Hero() {
  const { ref: heroRef, isInView } = useInView();
  const mouse = useMouseParallax(0.01);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0a0a12] to-[#080808]" />
        
        {/* Ambient glow */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/[0.03] blur-[100px]" />
        
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* 3D Floating Composition */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Spheres */}
        <FloatingSphere size={180} color="#4F46E5" x={15} y={25} delay={0} />
        <FloatingSphere size={120} color="#6366F1" x={75} y={20} delay={2} blur />
        <FloatingSphere size={80} color="#818CF8" x={60} y={65} delay={4} />
        <FloatingSphere size={60} color="#4F46E5" x={25} y={70} delay={1} blur />
        <FloatingSphere size={40} color="#A5B4FC" x={80} y={55} delay={3} />

        {/* Orbiting letters */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
          <OrbitLetter letter="A" delay={0} />
          <OrbitLetter letter="B" delay={3} />
          <OrbitLetter letter="C" delay={6} />
          <OrbitLetter letter="D" delay={9} />
        </div>

        {/* Floating Glass UI Cards */}
        <GlassCard x={8} y={30} delay={0}>
          <div className="min-w-[140px]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Listening</div>
            <div className="text-2xl font-bold text-white">8.0</div>
            <div className="text-[10px] text-emerald-400/70 mt-1">↑ +0.5 this week</div>
          </div>
        </GlassCard>

        <GlassCard x={72} y={18} delay={2}>
          <div className="min-w-[140px]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Reading</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">7.5</span>
            </div>
            <div className="text-[10px] text-indigo-400/70 mt-1">Progress +24%</div>
          </div>
        </GlassCard>

        <GlassCard x={75} y={60} delay={4}>
          <div className="min-w-[130px]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Mock Exam</div>
            <div className="text-lg font-bold text-white">3 / 10</div>
            <div className="mt-2 h-1 w-full rounded-full bg-white/10">
              <div className="h-full w-[30%] rounded-full bg-indigo-500" />
            </div>
          </div>
        </GlassCard>

        <GlassCard x={5} y={62} delay={3}>
          <div className="flex items-center gap-3">
            <Waveform />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">Speaking</div>
              <div className="text-sm font-bold text-white">Recording...</div>
            </div>
          </div>
        </GlassCard>

        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/[0.15]"
            style={{
              left: `${5 + (i * 3.1) % 90}%`,
              top: `${5 + (i * 4.7) % 85}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              animation: `float ${4 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center pt-24">
        {/* Label */}
        <div
          className={`mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            The Smart Way to Prepare for IELTS
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl font-bold tracking-[-0.03em] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[88px] transition-all duration-1000 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="text-white">Prepare smarter.</span>
          <br />
          <span className="text-gradient">Perform better.</span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/40 sm:text-lg md:text-xl transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Practice all four IELTS skills, take realistic mock exams, track your progress,
          and understand exactly what to improve.
        </p>

        {/* CTAs */}
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <Link
            href="/signup"
            className="group relative flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-[15px] font-semibold text-black transition-all hover:bg-white/90 hover:shadow-xl hover:shadow-white/10"
          >
            Start Learning for Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/practice"
            className="group flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-4 text-[15px] font-medium text-white/70 transition-all hover:bg-white/[0.06] hover:text-white hover:border-white/[0.12]"
          >
            <Play className="h-4 w-4" />
            Explore the Platform
          </Link>
        </div>

        {/* Trust */}
        <p
          className={`mt-6 text-[13px] text-white/25 transition-all duration-1000 delay-[400ms] ${isInView ? 'opacity-100' : 'opacity-0'}`}
        >
          No credit card required.
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent" />
    </section>
  );
}
