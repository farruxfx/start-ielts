'use client';

import { useInView, useCounter } from '@/lib/animations';

function AnimatedBar({ label, value, maxValue, color, delay }: {
  label: string; value: number; maxValue: number; color: string; delay: number;
}) {
  const { ref, isInView } = useInView();
  const { count, ref: countRef } = useCounter(Math.round(value * 10), 1500);
  
  return (
    <div ref={ref} className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm text-white/50">{label}</span>
        <span ref={countRef} className="text-lg font-bold text-white">{(count / 10).toFixed(1)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-[2000ms] ease-out"
          style={{
            width: isInView ? `${(value / maxValue) * 100}%` : '0%',
            background: color,
            transitionDelay: `${delay + 200}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function Analytics() {
  const { ref, isInView } = useInView();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0a0a10] to-[#080808]" />
      
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left - Analytics Visual */}
          <div className={`order-2 lg:order-1 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8">
              {/* Glow */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-500/[0.06] rounded-full blur-[60px]" />
              
              <div className="relative">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Overall Progress</div>
                    <div className="text-xs text-white/30">Last 30 days</div>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    +0.5 improvement
                  </div>
                </div>

                <div className="space-y-6">
                  <AnimatedBar label="Listening" value={7.5} maxValue={9} color="linear-gradient(90deg, #4F46E5, #818CF8)" delay={0} />
                  <AnimatedBar label="Reading" value={7.0} maxValue={9} color="linear-gradient(90deg, #6366F1, #A5B4FC)" delay={150} />
                  <AnimatedBar label="Writing" value={6.5} maxValue={9} color="linear-gradient(90deg, #818CF8, #C7D2FE)" delay={300} />
                  <AnimatedBar label="Speaking" value={7.0} maxValue={9} color="linear-gradient(90deg, #4F46E5, #6366F1)" delay={450} />
                </div>

                {/* Overall band */}
                <div className="mt-8 flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
                  <div className="text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-2">Overall Band</div>
                    <div className="text-5xl font-bold text-white">7.0</div>
                    <div className="mt-1 text-xs text-emerald-400/70">Target: 7.5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className={`order-1 lg:order-2 transition-all duration-1000 delay-200 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
              See your progress.
              <br />
              <span className="text-white/30">Know what to improve.</span>
            </h2>
            <p className="mt-6 text-lg text-white/40 leading-relaxed">
              Detailed analytics show exactly where you stand and what to focus on next.
              Track your band scores across all four skills over time.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { value: '7.5', label: 'Best Band' },
                { value: '156', label: 'Tests Done' },
                { value: '89%', label: 'Accuracy' },
                { value: '12', label: 'Day Streak' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/30 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
