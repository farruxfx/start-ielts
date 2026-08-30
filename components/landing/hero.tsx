'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, CheckCircle2, Star, Zap, Trophy, Users, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Floating 3D Shape component
function FloatingShape({ className, delay = 0, duration = 20, children }: { className?: string; delay?: number; duration?: number; children?: React.ReactNode }) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      }}
    >{children}</div>
  );
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, started]);

  return { count, ref };
}

export function Hero() {
  const stats1 = useCounter(75, 2000);
  const stats2 = useCounter(10000, 2500);
  const stats3 = useCounter(95, 2000);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.05]" />
        
        {/* Animated gradient orbs */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/20 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/20 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-400/20 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* 3D Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating cube */}
        <FloatingShape delay={0} duration={8} className="left-[10%] top-[20%]">
          <div
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-white/20 shadow-xl"
            style={{
              transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) rotateX(${mousePos.y}deg) rotateY(${mousePos.x}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </FloatingShape>

        {/* Floating circle */}
        <FloatingShape delay={1} duration={10} className="right-[15%] top-[15%]">
          <div
            className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 shadow-xl"
            style={{
              transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </FloatingShape>

        {/* Small triangle */}
        <FloatingShape delay={2} duration={12} className="left-[20%] top-[60%]">
          <div
            className="h-12 w-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-white/20 shadow-xl"
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px) rotate(${mousePos.x * 2}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </FloatingShape>

        {/* Floating diamond */}
        <FloatingShape delay={3} duration={9} className="right-[20%] top-[55%]">
          <div
            className="h-14 w-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 shadow-xl rotate-45"
            style={{
              transform: `translate(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px) rotate(45deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </FloatingShape>

        {/* Floating hexagon */}
        <FloatingShape delay={4} duration={11} className="left-[5%] top-[40%]">
          <div
            className="h-10 w-10 bg-gradient-to-br from-rose-500/20 to-red-500/20 backdrop-blur-sm border border-white/20 shadow-xl"
            style={{
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              transform: `translate(${mousePos.x * 0.7}px, ${mousePos.y * 0.7}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </FloatingShape>

        {/* Tiny dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingShape key={i} delay={i * 0.5} duration={6 + (i % 4) * 2} className={`left-[${10 + (i * 4) % 80}%] top-[${10 + (i * 7) % 80}%]`}>
            <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40" />
          </FloatingShape>
        ))}
      </div>

      <div className="container-mw container-px relative z-10">
        {/* Top Badge */}
        <div className="mb-8 flex justify-center" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <Badge
            variant="secondary"
            className="gap-2 rounded-full border-blue-200 bg-blue-50/80 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
          >
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            AI-powered Speaking & Writing Evaluation
          </Badge>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.1s both' }}
          >
            Prepare smarter.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Score higher.
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl lg:mt-8 lg:text-2xl"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
          >
            Professional IELTS preparation with real exam interface, AI-powered feedback, and
            detailed analytics. Join 10,000+ students who achieved their target band.
          </p>

          {/* CTA Buttons */}
          <div
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:mt-10"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-lg font-bold shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] lg:px-12 lg:py-4.5"
              >
                <span className="relative z-10 flex items-center">
                  Start practicing free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button
                size="lg"
                variant="outline"
                className="group px-10 py-4 text-lg font-bold transition-all hover:bg-muted/50 backdrop-blur-sm lg:px-12 lg:py-4.5"
              >
                <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Explore tests
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground lg:mt-10"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              4.9/5 from 2,000+ students
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Instant AI feedback
            </span>
          </div>
        </div>

        {/* Stats Bar with Animated Counters */}
        <div
          className="mx-auto mt-16 max-w-3xl lg:mt-20"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}
        >
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/20 bg-white/50 p-6 shadow-xl backdrop-blur-sm dark:bg-gray-950/50 sm:p-8">
            <div className="text-center" ref={stats1.ref}>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold sm:text-3xl">{(stats1.count / 10).toFixed(1)}+</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Avg. Band Score</p>
            </div>
            <div className="border-x border-border/50 text-center" ref={stats2.ref}>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold sm:text-3xl">{(stats2.count / 1000).toFixed(0)}K+</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Active Students</p>
            </div>
            <div className="text-center" ref={stats3.ref}>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className="text-2xl font-bold sm:text-3xl">{stats3.count}%</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Success Rate</p>
            </div>
          </div>
        </div>

        {/* App Preview with 3D tilt effect */}
        <div
          className="mx-auto mt-16 max-w-5xl lg:mt-20"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
        >
          <div
            className="group relative rounded-2xl border border-white/20 bg-white/50 p-2 shadow-2xl shadow-blue-500/10 backdrop-blur-sm transition-all duration-500 hover:shadow-blue-500/20 dark:bg-gray-950/50 sm:p-3"
            style={{
              transform: `perspective(1000px) rotateX(${mousePos.y * 0.02}deg) rotateY(${mousePos.x * 0.02}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <div className="overflow-hidden rounded-xl bg-gradient-to-b from-muted/40 to-background p-4 sm:p-6">
              {/* Browser Chrome */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
                  ieltspro.app/practice/reading
                </div>
                <div className="w-16" />
              </div>

              {/* App Content */}
              <div className="mt-4 grid gap-4 sm:mt-6 md:grid-cols-2">
                {/* Reading Passage */}
                <div className="rounded-xl border border-border bg-background p-4 transition-all hover:border-blue-200 hover:shadow-sm dark:hover:border-blue-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Reading Passage
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Academic
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-full rounded-full bg-muted" />
                    <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                    <div className="h-2.5 w-full rounded-full bg-muted" />
                    <div className="h-2.5 w-4/6 rounded-full bg-muted" />
                    <div className="h-2.5 w-full rounded-full bg-muted" />
                    <div className="h-2.5 w-3/4 rounded-full bg-muted" />
                    <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                  </div>
                </div>

                {/* Question Panel */}
                <div className="rounded-xl border border-border bg-background p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:hover:border-indigo-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      Question 7 of 40
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                      In Progress
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3.5 w-full rounded bg-muted" />
                    <div className="space-y-2.5">
                      {['A', 'B', 'C', 'D'].map((opt, i) => (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 rounded-lg border p-2.5 text-sm transition-all ${
                            i === 1
                              ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold ${
                              i === 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {opt}
                          </span>
                          <div className="h-2.5 flex-1 rounded-full bg-muted/60" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-8 rounded-full transition-all ${
                        i < 6
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <div className="rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  Question 7 / 40
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(3deg); }
          66% { transform: translateY(10px) rotate(-2deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
