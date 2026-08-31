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
    <section id="pricing" className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div ref={ref} className={`mb-16 text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600 mb-4">
            Pricing
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-5xl">
            Start today.
            <br />
            <span className="text-slate-400">Grow at your own pace.</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition-all duration-500 ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/40'
              } ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price === '0' ? 'Free' : plan.price}</span>
                {plan.period && <span className="text-sm text-slate-400 ml-1">UZS{plan.period}</span>}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? 'text-blue-500' : 'text-slate-300'}`} />
                    <span className="text-sm text-slate-600">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/20'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Daily Pass */}
        <div className={`mt-10 text-center transition-all duration-700 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <span className="text-xl">⚡</span>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">Daily Pass</div>
              <div className="text-xs text-slate-500">Full access for 24 hours — 7,900 UZS</div>
            </div>
            <Link href="/signup" className="ml-4 rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200">
              Get Pass
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
