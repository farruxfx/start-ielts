'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, Crown, Zap, Star, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/use-auth';
import {
  PLANS,
  FEATURE_COMPARISON,
  formatUZS,
  getUserPlan,
  type PlanId,
} from '@/lib/subscription';

export default function PricingPage() {
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState<PlanId | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const currentPlan = user ? getUserPlan(user.id) : 'free';

  const handlePurchase = async (planId: PlanId) => {
    if (!user) {
      window.location.href = '/signin';
      return;
    }
    setPurchasing(planId);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId }),
      });
      const data = await res.json();
      
      if (data.success && data.order) {
        // Server-side order (Supabase configured)
        window.location.href = `/payment/${data.order.id}`;
      } else if (data.success && data.useClientSide) {
        // No Supabase — create order client-side
        const { savePaymentOrderLocal, getActivePaymentMethodLocal, generateUniqueAmountLocal } = await import('@/lib/payment-store-local');
        const method = getActivePaymentMethodLocal();
        if (!method) {
          alert('No payment method configured. Please contact admin.');
          setPurchasing(null);
          return;
        }
        const exactAmount = generateUniqueAmountLocal(data.baseAmount);
        const orderId = `po_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        
        savePaymentOrderLocal({
          id: orderId,
          user_id: user.id,
          plan_id: planId,
          payment_method_id: method.id,
          base_amount: data.baseAmount,
          exact_amount: exactAmount,
          status: 'pending',
          expires_at: expiresAt,
          paid_at: null,
          transaction_message_id: null,
          transaction_sender_id: null,
          processed_at: null,
          created_at: now,
          updated_at: now,
        });
        
        window.location.href = `/payment/${orderId}`;
      } else {
        alert(data.error || 'Failed to create payment order');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      alert('Payment error. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {/* ═══ Hero Section ═══ */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
                Choose the plan that fits your{' '}
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  IELTS journey
                </span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Start for free, practice at your own pace, and upgrade whenever you&apos;re ready to reach your target band.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ Daily Pass Highlight ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 mb-10">
          <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-800 dark:text-amber-200">
                    Need full access for just one day?
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Daily Pass — {formatUZS(7900)} · 24 hours of extended access
                  </p>
                </div>
              </div>
              <button
                onClick={() => handlePurchase('daily')}
                disabled={purchasing === 'daily'}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 text-sm font-bold transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2"
              >
                {purchasing === 'daily' ? 'Processing...' : 'Get Daily Pass'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ═══ Pricing Cards ═══ */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {PLANS.filter(p => p.id !== 'daily').map((plan) => {
              const isCurrent = currentPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300',
                    plan.highlighted
                      ? 'border-primary shadow-xl shadow-primary/10 scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent'
                      : 'border-border hover:border-primary/30 hover:shadow-lg bg-card',
                    isCurrent && 'ring-2 ring-primary ring-offset-2',
                  )}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <Star className="h-3 w-3" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-3.5 right-4">
                      <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                        Current
                      </span>
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="mb-4">
                    <div className="text-3xl mb-2">{plan.icon}</div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-bold">Bepul</span>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground">/oyiga</span>
                          <span className="text-3xl font-bold">{formatUZS(plan.price)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id || isCurrent}
                    className={cn(
                      'w-full rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2',
                      plan.highlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
                        : 'border-2 border-border hover:border-primary/50 hover:bg-muted',
                      isCurrent && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    {purchasing === plan.id ? (
                      'Processing...'
                    ) : isCurrent ? (
                      'Joriy rejangiz'
                    ) : plan.price === 0 ? (
                      'Boshlash'
                    ) : (
                      <>
                        {plan.name} olish
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ Feature Comparison ═══ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="flex items-center gap-2 mx-auto text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-6"
          >
            {showComparison ? 'Hide' : 'Show'} Feature Comparison
            {showComparison ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showComparison && (
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-semibold">Feature</th>
                      {PLANS.map(p => (
                        <th key={p.id} className={cn(
                          'text-center p-3 font-semibold',
                          p.highlighted && 'text-primary',
                        )}>
                          {p.icon} {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_COMPARISON.map((feat, i) => (
                      <tr key={feat.key} className={cn('border-b border-border', i % 2 === 0 && 'bg-muted/20')}>
                        <td className="p-3 font-medium">{feat.label}</td>
                        {(['free', 'daily', 'start', 'basic', 'pro'] as const).map(planId => (
                          <td key={planId} className="text-center p-3">
                            {renderFeatureValue(feat[planId])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-border">
                {FEATURE_COMPARISON.map((feat) => (
                  <div key={feat.key} className="p-3">
                    <p className="font-medium text-sm mb-2">{feat.label}</p>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      {(['free', 'daily', 'start', 'basic', 'pro'] as const).map(planId => (
                        <div key={planId} className="text-center">
                          <p className="text-[10px] text-muted-foreground mb-1 capitalize">{planId}</p>
                          {renderFeatureValue(feat[planId])}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ═══ Founder Offer ═══ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/10 dark:via-purple-950/20 dark:to-blue-950/20 p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Sparkles className="h-3 w-3" />
              Founder Offer — Limited Time
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Early Supporter Pricing</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Lock in special founder pricing before regular rates apply.
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="rounded-xl bg-background/80 border border-border p-3">
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="font-bold text-sm">19,000 <span className="text-[10px] text-muted-foreground">so'm</span></p>
                <p className="text-[10px] text-green-600 line-through">29,000</p>
              </div>
              <div className="rounded-xl bg-primary/10 border-2 border-primary/30 p-3">
                <p className="text-xs font-bold text-primary">Basic</p>
                <p className="font-bold text-sm">39,000 <span className="text-[10px] text-muted-foreground">so'm</span></p>
                <p className="text-[10px] text-green-600 line-through">59,000</p>
              </div>
              <div className="rounded-xl bg-background/80 border border-border p-3">
                <p className="text-xs text-muted-foreground">Pro</p>
                <p className="font-bold text-sm">69,000 <span className="text-[10px] text-muted-foreground">so'm</span></p>
                <p className="text-[10px] text-green-600 line-through">99,000</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ-like section ═══ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Tez-tez beriladigan savollar</h2>
          <div className="space-y-4">
            {[
              {
                q: "Bepul rejada nimalar bor?",
                a: "Bepul rejada cheklangan miqdordagi practice testlar, basic dashboard va test tarixi mavjud. Platformani sinab ko'rish uchun yetarli.",
              },
              {
                q: "Obunani bekor qilsam, progressim saqlanadimi?",
                a: "Ha, barcha progress, statistika va tarix saqlanadi. Faqat premium kontentga kirish cheklanadi.",
              },
              {
                q: "Daily Pass qanday ishlaydi?",
                a: "Daily Pass 24 soat davomida to'liq kirish huquqi beradi. Vaqt tugagach avtomatik bekor bo'ladi.",
              },
              {
                q: "To'lov qanday usullar bilan amalga oshiriladi?",
                a: "Click, Payme va boshqa o'zbek to'lov tizimlari orqali to'lov qilish mumkin.",
              },
            ].map((item, i) => (
              <details key={i} className="group rounded-xl border border-border bg-card overflow-hidden">
                <summary className="p-4 sm:p-5 cursor-pointer font-semibold text-sm sm:text-base flex items-center justify-between">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function renderFeatureValue(val: string | boolean) {
  if (val === true) return <Check className="h-4 w-4 text-green-500 mx-auto" />;
  if (val === false || val === '—') return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  if (val === '✓') return <Check className="h-4 w-4 text-green-500 mx-auto" />;
  return <span className="text-xs text-muted-foreground">{val}</span>;
}
