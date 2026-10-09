'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  Check,
  ArrowRight,
  CreditCard,
  Copy,
  Clock,
  PartyPopper,
  Shield,
  Zap,
  Star,
  Crown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/use-auth';
import { PLANS, type PlanId, getUserPlan, formatUZS } from '@/lib/subscription';
import { formatAmount } from '@/lib/payment-system';
import { notifyAccessChanged } from '@/lib/access-client';
import {
  getActivePaymentMethodLocal,
  savePaymentOrderLocal,
  generateUniqueAmountLocal,
  getPaymentOrderLocal,
} from '@/lib/payment-store-local';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

type ModalView = 'plans' | 'checkout' | 'success';

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [view, setView] = useState<ModalView>('plans');
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [exactAmount, setExactAmount] = useState(0);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 30, seconds: 0 });
  const [polling, setPolling] = useState(false);
  const [paid, setPaid] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPlan = user ? getUserPlan(user.id) : 'free';

  useEffect(() => {
    if (open) {
      setView('plans');
      setSelectedPlan(null);
      setOrderId(null);
      setPaid(false);
    }
  }, [open]);

  // Server-side activation: payment confirmed → the server verifies the
  // order, computes expiry ITSELF, writes the subscription record and
  // re-mints the signed session cookie — premium unlocks WITHOUT re-login.
  const activateSubscription = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, planId: selectedPlan }),
      });
      if (!res.ok) throw new Error('activation failed');
    } catch {
      // Best-effort: the state endpoint re-syncs the cookie on next load.
    }
    // Refresh every access listener (cards, runner gate, dashboard).
    notifyAccessChanged();
  }, [selectedPlan]);

  // Poll for payment status
  const checkStatus = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/payment/status?orderId=${orderId}`);
      const data = await res.json();

      if (data.useClientSide) {
        const order = getPaymentOrderLocal(orderId);
        if (order && order.status === 'paid') {
          await activateSubscription(orderId);
          setPaid(true);
          setPolling(false);
          setView('success');
        }
      } else if (data.order && data.order.status === 'paid') {
        await activateSubscription(orderId);
        setPaid(true);
        setPolling(false);
        setView('success');
      }
    } catch {}
  }, [orderId, activateSubscription]);

  useEffect(() => {
    if (!polling) return;
    intervalRef.current = setInterval(checkStatus, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [polling, checkStatus]);

  // Countdown
  useEffect(() => {
    if (view !== 'checkout') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) return prev;
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view]);

  const handleSelectPlan = async (planId: PlanId, promoCode?: string | null) => {
    if (!user || planId === 'free') return;

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;

    const method = getActivePaymentMethodLocal();
    if (!method) {
      alert("To'lov usuli hali sozlanmagan. Admin bilan bog'laning.");
      return;
    }

    // Server truth: admin-overridden price + promo validation happen here.
    let baseAmount = planId === 'daily' ? (plan.dailyPrice || 0) : plan.price;
    let discountAmount = 0;
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode || '', planId }),
      });
      if (res.ok) {
        const v = await res.json();
        if (v.error) {
          alert(v.error);
          return;
        }
        if (v.valid) {
          discountAmount = v.discount;
          baseAmount = v.finalBasePrice;
        }
      }
    } catch { /* fall back to base price */ }
    const exact = generateUniqueAmountLocal(baseAmount);
    const id = `po_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    savePaymentOrderLocal({
      id, user_id: user.id, plan_id: planId, payment_method_id: method.id,
      base_amount: baseAmount, discount_amount: discountAmount,
      promo_code: promoCode ? promoCode.trim().toUpperCase() : null,
      exact_amount: exact, status: 'pending',
      expires_at: expiresAt, paid_at: null, transaction_message_id: null,
      transaction_sender_id: null, processed_at: null, created_at: now, updated_at: now,
    } as any);

    setOrderId(id);
    setExactAmount(exact);
    setCardNumber(method.card_number);
    setCardHolder(method.card_holder);
    setSelectedPlan(planId);
    setView('checkout');
    setPolling(true);
  };

  const [promoInputs, setPromoInputs] = useState<Partial<Record<PlanId, string>>>({});
  const [promoErrors, setPromoErrors] = useState<Partial<Record<PlanId, string | null>>>({});

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!open) return null;

  const selectedPlanData = selectedPlan ? PLANS.find(p => p.id === selectedPlan) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full p-1.5 hover:bg-muted transition-colors">
          <X className="h-5 w-5" />
        </button>

        {/* ─── PLANS VIEW ─── */}
        {view === 'plans' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
                <Sparkles className="h-3 w-3" />
                Upgrade
              </div>
              <h2 className="text-xl font-bold">Rejani yangilang</h2>
              <p className="text-sm text-muted-foreground mt-1">IELTS tayyorgarligingizni keyingi darajaga olib chiqing</p>
            </div>

            <div className="space-y-3">
              {PLANS.filter(p => p.id !== 'free' && getPlanLevel(p.id) > getPlanLevel(currentPlan)).map(plan => (
                <div key={plan.id} className="space-y-1.5">
                  <button
                    onClick={() => handleSelectPlan(plan.id, promoInputs[plan.id] || null)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                      plan.highlighted
                        ? 'border-primary/30 bg-primary/5 hover:border-primary hover:shadow-md'
                        : 'border-border hover:border-primary/30 hover:shadow-sm'
                    )}
                  >
                    <span className="text-2xl">{plan.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{plan.name}</span>
                        {plan.badge && (
                          <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">{plan.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                      {promoErrors[plan.id] && (
                        <p className="text-xs text-destructive">{promoErrors[plan.id]}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{formatUZS(plan.price)}</p>
                      <p className="text-[10px] text-muted-foreground">/oyiga</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <div className="flex gap-2 px-1">
                    <input
                      type="text"
                      placeholder="Promo kod (ixtiyoriy)"
                      value={promoInputs[plan.id] || ''}
                      onChange={(e) =>
                        setPromoInputs((p) => ({ ...p, [plan.id]: e.target.value.toUpperCase() }))
                      }
                      className="h-8 flex-1 rounded-lg border border-border bg-background px-2.5 text-xs uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Pass */}
            <button
              onClick={() => handleSelectPlan('daily', promoInputs['daily'] || null)}
              className="w-full mt-3 flex items-center gap-4 p-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-left hover:border-amber-400 transition-all"
            >
              <Zap className="h-5 w-5 text-amber-500" />
              <div className="flex-1">
                <span className="font-bold text-sm text-amber-700 dark:text-amber-300">Daily Pass</span>
                <p className="text-xs text-amber-600 dark:text-amber-400">24 soatlik to'liq kirish — {formatUZS(7900)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-amber-500" />
            </button>
            <div className="flex gap-2 px-1 mt-1.5">
              <input
                type="text"
                placeholder="Daily Pass promo kodi"
                value={promoInputs['daily'] || ''}
                onChange={(e) => setPromoInputs((p) => ({ ...p, daily: e.target.value.toUpperCase() }))}
                className="h-8 flex-1 rounded-lg border border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/20 px-2.5 text-xs uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
          </div>
        )}

        {/* ─── CHECKOUT VIEW ─── */}
        {view === 'checkout' && selectedPlanData && (
          <div className="p-6">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold">{selectedPlanData.icon} {selectedPlanData.name}</h2>
              <p className="text-xs text-muted-foreground">To'lov buyurtmasi</p>
            </div>

            {/* Amount */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center mb-4">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">To'lash uchun aniq summa</p>
              <p className="text-2xl font-bold">{formatAmount(exactAmount)} <span className="text-sm text-muted-foreground">so'm</span></p>
            </div>

            {/* Warning */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2.5 mb-4">
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                ⚠️ <strong>Aynan ko'rsatilgan summani</strong> yuboring. Boshqa summa = avtomatik aniqlanmaydi.
              </p>
            </div>

            {/* Card Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-2.5">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase">Karta raqami</p>
                  <p className="text-sm font-bold font-mono tracking-wider">{cardNumber.replace(/(.{4})/g, '$1 ').trim()}</p>
                </div>
                <button onClick={() => copyToClipboard(cardNumber, 'card')}
                  className={cn('h-8 w-8 flex items-center justify-center rounded-md transition-all',
                    copied === 'card' ? 'bg-green-100 text-green-600' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}>
                  {copied === 'card' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-2.5">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase">Aniq summa</p>
                  <p className="text-sm font-bold font-mono">{formatAmount(exactAmount)} so'm</p>
                </div>
                <button onClick={() => copyToClipboard(String(exactAmount), 'amount')}
                  className={cn('h-8 w-8 flex items-center justify-center rounded-md transition-all',
                    copied === 'amount' ? 'bg-green-100 text-green-600' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}>
                  {copied === 'amount' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase">Karta egasi</p>
                <p className="text-xs font-semibold">{cardHolder}</p>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center py-3 mb-4">
              <p className="text-[10px] text-muted-foreground mb-1">Qolgan vaqt</p>
              <div className="inline-flex items-center gap-1.5">
                <span className="rounded bg-muted px-2 py-1 text-lg font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-lg font-bold text-muted-foreground">:</span>
                <span className="rounded bg-muted px-2 py-1 text-lg font-bold font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-muted-foreground">
              Tizim to'lovni avtomatik tekshiradi. Sahifani yopmang.
            </p>
          </div>
        )}

        {/* ─── SUCCESS VIEW ─── */}
        {view === 'success' && selectedPlanData && (
          <div className="p-6 text-center">
            <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold mb-1">🎉 To'lov qabul qilindi!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              <span className="font-semibold">{selectedPlanData.icon} {selectedPlanData.name}</span> tarifi faollashtirildi.
            </p>
            <button onClick={onClose}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all">
              Davom etish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getPlanLevel(planId: PlanId): number {
  const levels: Record<PlanId, number> = { free: 0, daily: 1, start: 2, basic: 3, pro: 4 };
  return levels[planId] || 0;
}
