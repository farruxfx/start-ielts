// ═══════════════════════════════════════════════════════════════════════
//  PAYMENT SYSTEM — Types, Constants, and Core Logic
//  Supports both Supabase and localStorage fallback
// ═══════════════════════════════════════════════════════════════════════

import { supabase, isSupabaseConfigured } from './supabase';
import { type PlanId, PLANS } from './subscription';
import {
  getPaymentMethodsLocal,
  getActivePaymentMethodLocal,
  getPaymentOrdersLocal,
  getPaymentOrderLocal,
  getPendingOrdersLocal,
  generateUniqueAmountLocal,
  savePaymentOrderLocal,
  updatePaymentOrderLocal,
  saveTransactionLogLocal,
  type PaymentMethod as LocalPaymentMethod,
  type PaymentOrder as LocalPaymentOrder,
  type TransactionLogEntry,
} from './payment-store-local';

// ─── Types ────────────────────────────────────────────────────────────

export type PaymentOrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

export interface PaymentOrder {
  id: string;
  user_id: string;
  plan_id: PlanId;
  payment_method_id: string;
  base_amount: number;
  exact_amount: number;
  status: PaymentOrderStatus;
  expires_at: string;
  paid_at: string | null;
  transaction_message_id: string | null;
  transaction_sender_id: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  card_number: string;
  card_holder: string;
  bank_name: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionLog {
  id: string;
  source: string;
  source_message_id: string;
  amount: number;
  direction: 'incoming' | 'outgoing';
  raw_message: string;
  parsed_data: Record<string, unknown>;
  matched_payment_order_id: string | null;
  processing_status: 'matched' | 'unmatched' | 'ambiguous' | 'error' | 'duplicate' | 'ignored';
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────

export const PAYMENT_ORDER_TTL_MINUTES = 30;

// ─── Unique Amount Generator ─────────────────────────────────────────

export async function generateUniqueAmount(baseAmount: number): Promise<number> {
  if (!isSupabaseConfigured) {
    return generateUniqueAmountLocal(baseAmount);
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const suffix = Math.floor(Math.random() * 990) + 10;
    const exactAmount = baseAmount + suffix;
    const { data } = await supabase
      .from('payment_orders')
      .select('id')
      .eq('exact_amount', exactAmount)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .limit(1);
    if (!data || data.length === 0) return exactAmount;
  }
  return baseAmount + (Date.now() % 900) + 100;
}

// ─── Payment Order Operations ─────────────────────────────────────────

export async function createPaymentOrder(
  userId: string,
  planId: PlanId,
  paymentMethodId: string,
): Promise<PaymentOrder | null> {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan || planId === 'free') return null;
  const baseAmount = planId === 'daily' ? (plan.dailyPrice || 0) : plan.price;
  if (baseAmount <= 0) return null;

  const exactAmount = await generateUniqueAmount(baseAmount);
  const expiresAt = new Date(Date.now() + PAYMENT_ORDER_TTL_MINUTES * 60 * 1000).toISOString();
  const orderId = `po_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const orderData = {
    id: orderId,
    user_id: userId,
    plan_id: planId,
    payment_method_id: paymentMethodId,
    base_amount: baseAmount,
    exact_amount: exactAmount,
    status: 'pending' as PaymentOrderStatus,
    expires_at: expiresAt,
    paid_at: null,
    transaction_message_id: null,
    transaction_sender_id: null,
    processed_at: null,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured) {
    savePaymentOrderLocal(orderData);
    return orderData;
  }

  const { data, error } = await supabase
    .from('payment_orders')
    .insert(orderData)
    .select()
    .single();

  if (error) return null;
  return data as PaymentOrder;
}

export async function getPaymentOrder(orderId: string): Promise<PaymentOrder | null> {
  if (!isSupabaseConfigured) {
    return getPaymentOrderLocal(orderId);
  }

  const { data, error } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data as PaymentOrder;
}

export async function getPendingOrders(): Promise<PaymentOrder[]> {
  if (!isSupabaseConfigured) {
    return getPendingOrdersLocal();
  }

  const { data } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  return (data || []) as PaymentOrder[];
}

export async function getAllOrders(): Promise<PaymentOrder[]> {
  if (!isSupabaseConfigured) {
    return getPaymentOrdersLocal().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const { data } = await supabase
    .from('payment_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (data || []) as PaymentOrder[];
}

export async function getUserOrders(userId: string): Promise<PaymentOrder[]> {
  if (!isSupabaseConfigured) {
    return getPaymentOrdersLocal().filter(o => o.user_id === userId);
  }

  const { data } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (data || []) as PaymentOrder[];
}

// ─── Payment Confirmation ─────────────────────────────────────────────

export async function confirmPaymentOrder(
  orderId: string,
  telegramMessageId: string,
  telegramSenderId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const order = getPaymentOrderLocal(orderId);
    if (!order || order.status !== 'pending' || order.processed_at) return false;
    const now = new Date().toISOString();
    updatePaymentOrderLocal(orderId, {
      status: 'paid',
      paid_at: now,
      transaction_message_id: telegramMessageId,
      transaction_sender_id: telegramSenderId,
      processed_at: now,
    });
    return true;
  }

  const { data: existing } = await supabase
    .from('payment_orders')
    .select('status, processed_at')
    .eq('id', orderId)
    .single();

  if (!existing || existing.status !== 'pending' || existing.processed_at) return false;

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('payment_orders')
    .update({ status: 'paid', paid_at: now, transaction_message_id: telegramMessageId, transaction_sender_id: telegramSenderId, processed_at: now, updated_at: now })
    .eq('id', orderId)
    .eq('status', 'pending')
    .is('processed_at', null);

  return !error;
}

export async function matchTransactionToOrder(amount: number, telegramSenderId: string): Promise<PaymentOrder | null> {
  if (!isSupabaseConfigured) {
    const pending = getPendingOrdersLocal().filter(o => o.exact_amount === amount);
    return pending.length === 1 ? pending[0] : null;
  }

  const { data: orders } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('exact_amount', amount)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (!orders || orders.length !== 1) return null;
  return orders[0] as PaymentOrder;
}

// ─── Payment Methods ──────────────────────────────────────────────────

export async function getActivePaymentMethod(): Promise<PaymentMethod | null> {
  if (!isSupabaseConfigured) {
    return getActivePaymentMethodLocal();
  }

  const { data } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();

  return (data as PaymentMethod) || null;
}

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  if (!isSupabaseConfigured) {
    return getPaymentMethodsLocal();
  }

  const { data } = await supabase
    .from('payment_methods')
    .select('*')
    .order('created_at', { ascending: false });

  return (data || []) as PaymentMethod[];
}

// ─── Transaction Log ──────────────────────────────────────────────────

export async function logTransaction(entry: Omit<TransactionLog, 'id' | 'created_at'>): Promise<void> {
  if (!isSupabaseConfigured) {
    saveTransactionLogLocal(entry);
    return;
  }

  const id = `txlog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await supabase.from('transaction_logs').insert({
    ...entry, id, created_at: new Date().toISOString(),
  });
}

export async function getUnmatchedTransactions(): Promise<TransactionLog[]> {
  if (!isSupabaseConfigured) {
    const logs = (await import('./payment-store-local')).getTransactionLogsLocal();
    return logs.filter(l => l.processing_status === 'unmatched') as TransactionLog[];
  }

  const { data } = await supabase
    .from('transaction_logs')
    .select('*')
    .eq('processing_status', 'unmatched')
    .order('created_at', { ascending: false })
    .limit(100);

  return (data || []) as TransactionLog[];
}

export async function getAllTransactions(): Promise<TransactionLog[]> {
  if (!isSupabaseConfigured) {
    const logs = (await import('./payment-store-local')).getTransactionLogsLocal();
    return logs as TransactionLog[];
  }

  const { data } = await supabase
    .from('transaction_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return (data || []) as TransactionLog[];
}

// ─── Subscription Activation ──────────────────────────────────────────

export async function activateSubscriptionFromPayment(order: PaymentOrder): Promise<boolean> {
  if (order.status !== 'paid' || !order.processed_at) return false;

  const now = new Date();
  let expiresAt: Date;

  if (order.plan_id === 'daily') {
    expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else {
    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  // Use the client-side subscription system
  const { activatePlan } = await import('./subscription');
  activatePlan(order.user_id, order.plan_id, order.id);

  return true;
}

// ─── Expiration Cleanup ───────────────────────────────────────────────

export async function expireOldOrders(): Promise<number> {
  if (!isSupabaseConfigured) {
    const orders = getPaymentOrdersLocal();
    const now = new Date().toISOString();
    let count = 0;
    orders.forEach(o => {
      if (o.status === 'pending' && o.expires_at < now) {
        updatePaymentOrderLocal(o.id, { status: 'expired' });
        count++;
      }
    });
    return count;
  }

  const { data } = await supabase
    .from('payment_orders')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select('id');

  return data?.length || 0;
}

// ─── Format Helpers ───────────────────────────────────────────────────

export function formatAmount(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatUZS(amount: number): string {
  if (amount === 0) return 'Bepul';
  return formatAmount(amount) + " so'm";
}

export function getTimeUntilExpiry(expiresAt: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
}
