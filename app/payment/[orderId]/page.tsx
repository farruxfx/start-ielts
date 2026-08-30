'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  CreditCard,
  Shield,
  AlertCircle,
  RefreshCw,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { cn } from '@/lib/utils';
import { formatAmount, formatUZS } from '@/lib/payment-system';

interface OrderData {
  id: string;
  planId: string;
  planName: string;
  planIcon: string;
  baseAmount: number;
  exactAmount: number;
  status: string;
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
}

interface PaymentMethodData {
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  instructions: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodData | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, expired: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`);
      if (!res.ok && res.status !== 200) {
        if (res.status === 404) {
          setError('Payment order not found');
          setLoading(false);
          return;
        }
      }
      const data = await res.json();

      if (data.useClientSide) {
        // No Supabase — fetch from localStorage
        const { getPaymentOrderLocal, getActivePaymentMethodLocal } = await import('@/lib/payment-store-local');
        const localOrder = getPaymentOrderLocal(orderId);
        const localMethod = getActivePaymentMethodLocal();
        
        if (!localOrder) {
          setError('Payment order not found');
          setLoading(false);
          return;
        }

        const plan = (await import('@/lib/subscription')).PLANS.find(p => p.id === localOrder.plan_id);
        
        setOrder({
          id: localOrder.id,
          planId: localOrder.plan_id,
          planName: plan?.name || localOrder.plan_id,
          planIcon: plan?.icon || '📋',
          baseAmount: localOrder.base_amount,
          exactAmount: localOrder.exact_amount,
          status: localOrder.status,
          expiresAt: localOrder.expires_at,
          paidAt: localOrder.paid_at,
          createdAt: localOrder.created_at,
        });
        setPaymentMethod(localMethod ? {
          cardNumber: localMethod.card_number,
          cardHolder: localMethod.card_holder,
          bankName: localMethod.bank_name,
          instructions: localMethod.instructions,
        } : null);
        
        const diff = new Date(localOrder.expires_at).getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        } else {
          setTimeLeft({
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            expired: false,
          });
        }
        
        if (localOrder.status !== 'pending') setPolling(false);
        setLoading(false);
        return;
      }

      // Server-side data
      setOrder(data.order);
      setPaymentMethod(data.paymentMethod);
      setTimeLeft(data.timeLeft);
      setLoading(false);
      if (data.order.status !== 'pending') setPolling(false);
    } catch (err) {
      console.error('Status fetch error:', err);
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll for status updates every 3 seconds
  useEffect(() => {
    if (!polling) return;

    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [polling, fetchStatus]);

  // Countdown timer
  useEffect(() => {
    if (!order || order.status !== 'pending') return;

    const timer = setInterval(() => {
      const now = Date.now();
      const exp = new Date(order.expiresAt).getTime();
      const diff = exp - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        setPolling(false);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        expired: false,
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // ─── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading payment details...</p>
          </div>
        </main>
      </>
    );
  }

  // ─── Error State ────────────────────────────────────────────
  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold">Payment Not Found</h1>
            <p className="text-muted-foreground">{error || 'This payment order does not exist.'}</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Pricing
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ─── Expired State ──────────────────────────────────────────
  if (order.status === 'expired' || timeLeft.expired) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-xl font-bold">⏰ To&apos;lov vaqti tugadi</h1>
            <p className="text-muted-foreground">
              Ushbu to&apos;lov buyurtmasi muddati tugagan. Yangi to&apos;lov yarating.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Yangi to&apos;lov yaratish
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </>
    );
  }

  // ─── Paid State ─────────────────────────────────────────────
  if (order.status === 'paid') {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-bold">🎉 To&apos;lov muvaffaqiyatli qabul qilindi!</h1>
            <p className="text-muted-foreground">
              <span className="font-semibold">{order.planIcon} {order.planName}</span> tarifi faollashtirildi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Dashboardga o&apos;tish
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/subscription"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                Obunani boshqarish
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ─── Pending State (Main Checkout UI) ───────────────────────
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-muted/30">
        <div className="max-w-lg mx-auto px-4 py-6 sm:px-6 sm:py-10">
          {/* Back link */}
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Pricing
          </Link>

          {/* Order Summary Card */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-2xl">{order.planIcon}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">{order.planName} reja</h1>
                <p className="text-sm text-muted-foreground">To&apos;lov buyurtmasi</p>
              </div>
            </div>

            {/* Exact Amount */}
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-blue-50/50 dark:from-primary/10 dark:to-blue-950/30 border border-primary/20 p-5 text-center mb-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                To&apos;lash uchun aniq summa
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-foreground">
                {formatAmount(order.exactAmount)} <span className="text-lg text-muted-foreground">so&apos;m</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Asosiy narx: {formatUZS(order.baseAmount)}
              </p>
            </div>

            {/* Warning */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 mb-5">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                ⚠️ To&apos;lovni avtomatik aniqlash uchun <strong>aynan ko&apos;rsatilgan summani</strong> yuboring. Boshqa summa yuborsangiz, to&apos;lov avtomatik aniqlanmaydi.
              </p>
            </div>

            {/* Payment Details */}
            {paymentMethod && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {paymentMethod.bankName} karta raqami
                </h3>

                {/* Card Number */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Karta raqami</p>
                    <p className="text-lg font-bold font-mono tracking-wider">
                      {paymentMethod.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentMethod.cardNumber, 'card')}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                      copied === 'card'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {copied === 'card' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Exact Amount (copyable) */}
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Aniq summa</p>
                    <p className="text-lg font-bold font-mono">{formatAmount(order.exactAmount)} so&apos;m</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(String(order.exactAmount), 'amount')}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-all',
                      copied === 'amount'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {copied === 'amount' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {/* Card Holder */}
                <div className="rounded-xl border border-border bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Karta egasi</p>
                  <p className="text-sm font-semibold">{paymentMethod.cardHolder}</p>
                </div>

                {/* Instructions */}
                {paymentMethod.instructions && (
                  <div className="rounded-xl border border-border bg-muted/50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Ko&apos;rsatmalar</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{paymentMethod.instructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timer + Status */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                To&apos;lov holati
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Kutilmoqda...
              </span>
            </div>

            {/* Countdown */}
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">Qolgan vaqt</p>
              <div className="flex items-center justify-center gap-2">
                <div className="rounded-lg bg-muted px-3 py-2 min-w-[60px]">
                  <p className="text-2xl font-bold font-mono">{String(timeLeft.hours).padStart(2, '0')}</p>
                  <p className="text-[10px] text-muted-foreground">soat</p>
                </div>
                <span className="text-xl font-bold text-muted-foreground">:</span>
                <div className="rounded-lg bg-muted px-3 py-2 min-w-[60px]">
                  <p className="text-2xl font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</p>
                  <p className="text-[10px] text-muted-foreground">daqiqa</p>
                </div>
                <span className="text-xl font-bold text-muted-foreground">:</span>
                <div className="rounded-lg bg-muted px-3 py-2 min-w-[60px]">
                  <p className="text-2xl font-bold font-mono">{String(timeLeft.seconds).padStart(2, '0')}</p>
                  <p className="text-[10px] text-muted-foreground">soniya</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-3">
              Tizim to&apos;lovni avtomatik tekshiradi. Sahifani yopmang.
            </p>
          </div>

          {/* Security Note */}
          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Xavfsiz to&apos;lov</p>
              <p className="text-xs text-muted-foreground">
                Barcha to&apos;lovlar xavfsiz ravishda tekshiriladi. To&apos;lov avtomatik aniqlanganda obuna faollashtiriladi.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
