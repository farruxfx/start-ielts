'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Star, Shield, Clock, CreditCard, ArrowRight, Check, X, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/use-auth';
import {
  getUserSubscription,
  getUserPlan,
  getTimeRemaining,
  formatUZS,
  getPlanById,
  getTransactions,
  cancelSubscription,
  processPayment,
  type PlanId,
  type PaymentTransaction,
} from '@/lib/subscription';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState<ReturnType<typeof getUserSubscription> | null>(null);
  const [txns, setTxns] = useState<PaymentTransaction[]>([]);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeRemaining> | null>(null);
  const [purchasing, setPurchasing] = useState<PlanId | null>(null);

  useEffect(() => {
    if (!user) return;
    const subscription = getUserSubscription(user.id);
    setSub(subscription);
    setTxns(getTransactions(user.id));
    if (subscription.expiresAt) {
      setTimeLeft(getTimeRemaining(subscription.expiresAt));
    }
  }, [user]);

  if (!user || !sub) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Please sign in to view your subscription.</p>
        </main>
      </>
    );
  }

  const plan = getPlanById(sub.plan);

  const handleUpgrade = async (planId: PlanId) => {
    setPurchasing(planId);
    try {
      const success = await processPayment(planId, user.id);
      if (success) {
        const updated = getUserSubscription(user.id);
        setSub(updated);
        setTxns(getTransactions(user.id));
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleCancel = () => {
    if (confirm("Obunani bekor qilmoqchimisiz? Progressingiz saqlanib qoladi.")) {
      cancelSubscription(user.id);
      const updated = getUserSubscription(user.id);
      setSub(updated);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Obuna Boshqaruvi</h1>
          </div>

          {/* Current Plan Card */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6">
            <div className="flex items-start gap-4 mb-5">
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-xl flex-shrink-0',
                sub.plan === 'pro' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                sub.plan === 'basic' ? 'bg-gradient-to-br from-primary to-blue-600' :
                sub.plan === 'start' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                sub.plan === 'daily' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                'bg-muted',
              )}>
                {sub.plan === 'pro' ? <Crown className="h-7 w-7 text-white" /> :
                 sub.plan === 'basic' ? <Star className="h-7 w-7 text-white" /> :
                 sub.plan === 'daily' ? <Clock className="h-7 w-7 text-white" /> :
                 sub.plan === 'start' ? <Shield className="h-7 w-7 text-white" /> :
                 <Shield className="h-7 w-7 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold">{plan?.icon} {plan?.name}</h2>
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                    sub.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    sub.status === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    sub.status === 'cancelled' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                  )}>
                    {sub.status === 'active' ? 'Faol' :
                     sub.status === 'expired' ? 'Tugagan' :
                     sub.status === 'cancelled' ? 'Bekor qilingan' : sub.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan?.tagline}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Boshlangan</p>
                <p className="font-semibold">{new Date(sub.startDate).toLocaleDateString('uz-UZ')}</p>
              </div>
              {sub.expiresAt && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{sub.autoRenew ? 'Yangilanadi' : 'Tugaydi'}</p>
                  <p className="font-semibold">{new Date(sub.expiresAt).toLocaleDateString('uz-UZ')}</p>
                </div>
              )}
              {sub.plan !== 'free' && sub.plan !== 'daily' && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Narx</p>
                  <p className="font-semibold">{formatUZS(plan?.price || 0)}/oy</p>
                </div>
              )}
              {timeLeft && !timeLeft.expired && sub.plan === 'daily' && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3">
                  <p className="text-xs text-amber-600">Qolgan vaqt</p>
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    {timeLeft.hours}soat {timeLeft.minutes}daqiqa
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <Link
                href="/pricing"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {sub.plan === 'free' ? 'Obuna sotib olish' : 'Upgrade'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {sub.plan !== 'free' && sub.autoRenew && (
                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Bekor qilish
                </button>
              )}
            </div>
          </div>

          {/* Upgrade Options */}
          {sub.plan !== 'pro' && (
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-6">
              <h3 className="font-bold mb-4">Yangilash imkoniyatlari</h3>
              <div className="space-y-3">
                {(sub.plan === 'free' ? ['start', 'basic', 'pro'] :
                  sub.plan === 'daily' ? ['start', 'basic', 'pro'] :
                  sub.plan === 'start' ? ['basic', 'pro'] :
                  ['pro']
                ).map(planId => {
                  const p = getPlanById(planId as PlanId);
                  if (!p) return null;
                  return (
                    <div key={planId} className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <div>
                          <p className="font-semibold text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{formatUZS(p.price)}/oy</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpgrade(planId as PlanId)}
                        disabled={purchasing === planId}
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {purchasing === planId ? '...' : 'Tanlash'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              To&apos;lov tarixi
            </h3>
            {txns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">To&apos;lov tarixi yo&apos;q</p>
            ) : (
              <div className="space-y-2">
                {txns.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{getPlanById(tx.plan)?.name} reja</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString('uz-UZ')} · {tx.provider}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatUZS(tx.amount)}</p>
                      <span className={cn(
                        'text-xs font-semibold',
                        tx.status === 'completed' ? 'text-green-600' :
                        tx.status === 'failed' ? 'text-red-600' : 'text-amber-600',
                      )}>
                        {tx.status === 'completed' ? 'Tasdiqlangan' :
                         tx.status === 'failed' ? 'Xatolik' : 'Kutilmoqda'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
