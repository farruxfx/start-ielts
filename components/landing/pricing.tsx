'use client';

import Link from 'next/link';
import { useInView } from '@/lib/animations';
import { Check, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    desc: 'Explore the platform and start practicing.',
    features: ['Limited practice tests', 'Basic dashboard', 'Vocabulary tools', 'Test history'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Start',
    price: '29,000',
    period: '/mo',
    desc: 'For students beginning their IELTS journey.',
    features: ['Extended practice access', 'Reading & Listening', 'Basic statistics', 'Answer explanations'],
    cta: 'Choose Start',
    popular: false,
  },
  {
    name: 'Basic',
    price: '59,000',
    period: '/mo',
    desc: 'For serious learners who practice consistently.',
    features: ['Unlimited practice library', 'All 4 skills', 'Full mock exams', 'Advanced analytics', 'Study plan', 'Weak area analysis'],
    cta: 'Choose Basic',
    popular: true,
  },
  {
    name: 'Pro',
    price: '99,000',
    period: '/mo',
    desc: 'For students who want the complete experience.',
    features: ['Everything in Basic', 'AI Writing analysis', 'AI Speaking analysis', 'Personalized recommendations', 'Weekly reports', 'Priority support'],
    cta: 'Choose Pro',
    popular: false,
  },
];

export function Pricing() {
  const { ref, isInView } = useInView();

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0a0a10] to-[#080808]" />
      
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mb-16 text-center transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Start today.
            <br />
            <span className="text-white/30">Grow at your own pace.</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-6 transition-all duration-700 ${
                plan.popular
                  ? 'border-indigo-500/30 bg-indigo-500/[0.04]'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
              } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Recommended
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-white/35">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price === '0' ? 'Free' : `${plan.price}`}</span>
                {plan.period && <span className="text-sm text-white/30 ml-1">UZS{plan.period}</span>}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? 'text-indigo-400' : 'text-white/20'}`} />
                    <span className="text-sm text-white/50">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                    : 'border border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Daily Pass */}
        <div className={`mt-8 text-center transition-all duration-1000 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-4">
            <span className="text-lg">⚡</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Daily Pass</div>
              <div className="text-xs text-white/30">Full access for 24 hours — 7,900 UZS</div>
            </div>
            <Link href="/signup" className="ml-4 rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1]">
              Get Pass
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
