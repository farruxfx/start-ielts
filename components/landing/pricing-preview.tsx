'use client';

import Link from 'next/link';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'free',
    name: 'Bepul',
    icon: '🆓',
    price: '0',
    period: '',
    description: 'Platformani sinab ko\'ring',
    features: [
      'Cheklangan Practice testlar',
      'Basic Dashboard',
      'Test tarixi',
    ],
    highlighted: false,
    cta: 'Boshlash',
    href: '/signup',
  },
  {
    id: 'daily',
    name: 'Daily Pass',
    icon: '⚡',
    price: "7'900",
    period: '/24 soat',
    description: 'Bir kunlik to\'liq kirish',
    features: [
      'To\'liq Reading & Listening',
      'Writing & Speaking Practice',
      'Tanlangan Mock Exam',
      'Basic Analytics',
    ],
    highlighted: false,
    cta: 'Sotib olish',
    href: '/pricing',
    badge: '24 SOAT',
  },
  {
    id: 'start',
    name: 'Start',
    icon: '🌱',
    price: "29'000",
    period: '/oyiga',
    description: 'IELTS safaringizni boshlang',
    features: [
      'Kengaytirilgan Practice',
      'Reading & Listening',
      'Tushuntirishlar',
      'Progress tarixi',
      'Limited Mock Exam',
    ],
    highlighted: false,
    cta: 'Sotib olish',
    href: '/pricing',
  },
  {
    id: 'basic',
    name: 'Basic',
    icon: '⭐',
    price: "59'000",
    period: '/oyiga',
    description: 'Jiddiy tayyorgarlik uchun hamma narsa',
    features: [
      'Cheksiz Practice Library',
      'To\'liq Reading & Listening',
      'Writing & Speaking Practice',
      'To\'liq Mock Exam',
      'Advanced Statistics',
      'Shaxsiy Study Plan',
    ],
    highlighted: true,
    cta: 'Sotib olish',
    href: '/pricing',
    badge: 'ENG MASHHUR',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '👑',
    price: "99'000",
    period: '/oyiga',
    description: 'AI bilan aqlliroq tayyorlaning',
    features: [
      'Basic dagi hammasi',
      'AI Writing tahlili',
      'AI Speaking tahlili',
      'Advanced Band Analytics',
      'Shaxsiy AI tavsiyalar',
      'Priority Support',
    ],
    highlighted: false,
    cta: 'Sotib olish',
    href: '/pricing',
  },
];

export function PricingPreview() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="container-mw container-px">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            <Zap className="h-4 w-4" />
            Narxlar
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            IELTS tayyorgarligingizga mos rejani tanlang
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Bepul boshlang, o'z tezligingizda o'rganing va tayyor bo'lganingizda yangilang.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl border-2 p-5 transition-all duration-300 flex flex-col',
                plan.highlighted
                  ? 'border-primary shadow-xl shadow-primary/10 bg-gradient-to-b from-primary/5 to-transparent scale-[1.02]'
                  : 'border-border hover:border-primary/30 hover:shadow-lg bg-card'
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold text-white',
                    plan.id === 'daily' ? 'bg-amber-500' : 'bg-primary'
                  )}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Icon & Name */}
              <div className="text-center mb-4">
                <div className="text-2xl mb-1">{plan.icon}</div>
                <h3 className="text-base font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                {plan.price !== '0' && (
                  <p className="text-[10px] text-muted-foreground">so'm</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={cn(
                  'w-full rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2',
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
                    : plan.id === 'daily'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'border-2 border-border hover:border-primary/50 hover:bg-muted'
                )}
              >
                {plan.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Barcha rejalarda 30 kunlik pulni qaytarish kafolati bor.{' '}
            <Link href="/pricing" className="text-primary hover:underline font-medium">
              Batafsil →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
