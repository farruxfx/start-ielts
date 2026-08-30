'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '',
    description: 'Start exploring IELTS preparation',
    icon: Zap,
    color: 'from-gray-500 to-gray-600',
    popular: false,
    features: [
      'Limited Practice Tests',
      'Basic Dashboard',
      'Vocabulary Practice',
      'Test History',
    ],
  },
  {
    name: 'Start',
    price: '29,000',
    period: '/oyiga',
    description: 'Begin your IELTS journey',
    icon: Star,
    color: 'from-blue-500 to-indigo-500',
    popular: false,
    features: [
      'Extended Practice Access',
      'Reading & Listening',
      'Basic Statistics',
      'Limited Mock Exams',
      'Answer Explanations',
    ],
  },
  {
    name: 'Basic',
    price: '59,000',
    period: '/oyiga',
    description: 'Everything you need to prepare',
    icon: Star,
    color: 'from-primary to-violet-600',
    popular: true,
    features: [
      'Unlimited Practice Library',
      'All Reading & Listening Tests',
      'Writing & Speaking Practice',
      'Full Mock Exam Access',
      'Advanced Statistics',
      'Personal Study Plan',
      'Weak Area Analysis',
    ],
  },
  {
    name: 'Pro',
    price: '99,000',
    period: '/oyiga',
    description: 'AI-powered preparation',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    popular: false,
    features: [
      'Everything in Basic',
      'AI Writing Analysis',
      'AI Speaking Analysis',
      'Advanced Band Analytics',
      'Personalized Recommendations',
      'Weekly Progress Reports',
      'Priority Support',
    ],
  },
];

function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative group rounded-3xl border bg-card p-6 transition-all duration-500 ${
        plan.popular
          ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.02] z-10'
          : 'border-border hover:border-primary/50 hover:shadow-xl'
      } ${isHovered ? '-translate-y-2' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
        transform: isHovered ? `perspective(1000px) rotateX(${2}deg) rotateY(${-2}deg) translateY(-8px)` : undefined,
      }}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-violet-600 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Gradient background */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.color} opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-5' : ''}`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className={`mb-3 inline-flex rounded-xl p-2 bg-gradient-to-r ${plan.color} text-white`}>
            <plan.icon className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-muted-foreground">UZS</span>
            <span className="text-4xl font-bold">{plan.price}</span>
            {plan.period && (
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            )}
          </div>
        </div>

        {/* Features */}
        <ul className="mb-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/signup">
          <Button
            className={`w-full ${
              plan.popular
                ? 'bg-gradient-to-r from-primary to-violet-600 shadow-lg shadow-primary/25'
                : ''
            }`}
            variant={plan.popular ? 'default' : 'outline'}
          >
            {plan.price === '0' ? 'Get Started' : 'Choose Plan'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function PricingPreview() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Decorative orbs */}
      <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="container-mw container-px relative z-10">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Simple Pricing
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Choose your plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free, upgrade when you&apos;re ready. All plans include a 7-day money-back guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        {/* Daily Pass */}
        <div className="mx-auto mt-12 max-w-md">
          <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center dark:border-amber-700 dark:bg-amber-950/20">
            <span className="text-2xl">⚡</span>
            <h3 className="mt-2 font-bold">Daily Pass</h3>
            <p className="mt-1 text-sm text-muted-foreground">Full access for 24 hours</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">7,900 UZS</p>
            <Link href="/signup" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Get Daily Pass</Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
