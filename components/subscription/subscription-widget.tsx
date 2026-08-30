'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Zap, Star, Clock, ArrowRight, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/use-auth';
import {
  getUserSubscription,
  getUserPlan,
  getTimeRemaining,
  formatUZS,
  getPlanById,
  type PlanId,
} from '@/lib/subscription';

export function SubscriptionWidget() {
  const { user } = useAuth();
  const [sub, setSub] = useState<ReturnType<typeof getUserSubscription> | null>(null);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeRemaining> | null>(null);

  useEffect(() => {
    if (!user) return;
    const subscription = getUserSubscription(user.id);
    setSub(subscription);
    if (subscription.expiresAt) {
      setTimeLeft(getTimeRemaining(subscription.expiresAt));
    }
  }, [user]);

  // Auto-update countdown for daily pass
  useEffect(() => {
    if (!sub?.expiresAt) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(sub.expiresAt!));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [sub?.expiresAt]);

  if (!user || !sub) return null;

  const plan = getPlanById(sub.plan);
  if (!plan || sub.plan === 'free') {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted flex-shrink-0">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Bepul Reja</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              StartIELTS ni sinab ko&apos;ring va to&apos;liq imkoniyatlarni oching.
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          Rejalarni ko&apos;rish
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Daily pass with countdown
  if (sub.plan === 'daily' && timeLeft) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
            <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Daily Pass Faol</p>
            {timeLeft.expired ? (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Muddati tugadi</p>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {timeLeft.days > 0 && `${timeLeft.days}d `}
                  {timeLeft.hours}soat {timeLeft.minutes}daqiqa
                </span>
              </div>
            )}
          </div>
        </div>
        <Link
          href="/pricing"
          className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-bold transition-all"
        >
          Obunani yangilash
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Active subscription
  const expiresDate = sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString('uz-UZ') : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
          sub.plan === 'pro' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
          sub.plan === 'basic' ? 'bg-gradient-to-br from-primary to-blue-600' :
          'bg-gradient-to-br from-emerald-500 to-teal-600',
        )}>
          {sub.plan === 'pro' ? <Crown className="h-6 w-6 text-white" /> :
           sub.plan === 'basic' ? <Star className="h-6 w-6 text-white" /> :
           <Shield className="h-6 w-6 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">{plan.icon} {plan.name} Reja</p>
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
              Faol
            </span>
          </div>
          {expiresDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {sub.autoRenew ? 'Yangilanadi' : 'Muddati tugaydi'}: {expiresDate}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Link
          href="/subscription"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          Boshqarish
        </Link>
        {sub.plan !== 'pro' && (
          <Link
            href="/pricing"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Upgrade
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
