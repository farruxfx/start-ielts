'use client';

import type { PlanId } from './subscription';

// ═══════════════════════════════════════════════════════════════════════
//  LOCAL STORAGE PAYMENT STORE
//  Fallback when Supabase is not configured
// ═══════════════════════════════════════════════════════════════════════

const KEYS = {
  PAYMENT_METHODS: 'ielts_payment_methods',
  PAYMENT_ORDERS: 'ielts_payment_orders',
  TRANSACTION_LOGS: 'ielts_transaction_logs',
  LISTENER_HEALTH: 'ielts_listener_health',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Payment Methods ──────────────────────────────────────────────────

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

export function getPaymentMethodsLocal(): PaymentMethod[] {
  return safeGet<PaymentMethod[]>(KEYS.PAYMENT_METHODS, []);
}

export function getActivePaymentMethodLocal(): PaymentMethod | null {
  const methods = getPaymentMethodsLocal();
  return methods.find(m => m.is_active) || methods[0] || null;
}

export function savePaymentMethodLocal(method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): PaymentMethod {
  const methods = getPaymentMethodsLocal();
  const id = `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const newMethod: PaymentMethod = { ...method, id, created_at: now, updated_at: now };
  
  if (newMethod.is_active) {
    methods.forEach(m => m.is_active = false);
  }
  methods.push(newMethod);
  safeSet(KEYS.PAYMENT_METHODS, methods);
  return newMethod;
}

export function updatePaymentMethodLocal(id: string, updates: Partial<PaymentMethod>): void {
  const methods = getPaymentMethodsLocal();
  const idx = methods.findIndex(m => m.id === id);
  if (idx >= 0) {
    methods[idx] = { ...methods[idx], ...updates, updated_at: new Date().toISOString() };
    safeSet(KEYS.PAYMENT_METHODS, methods);
  }
}

export function deletePaymentMethodLocal(id: string): void {
  const methods = getPaymentMethodsLocal().filter(m => m.id !== id);
  safeSet(KEYS.PAYMENT_METHODS, methods);
}

export function togglePaymentMethodActiveLocal(id: string): void {
  const methods = getPaymentMethodsLocal();
  const target = methods.find(m => m.id === id);
  if (!target) return;
  
  if (target.is_active) {
    target.is_active = false;
  } else {
    methods.forEach(m => m.is_active = false);
    target.is_active = true;
  }
  safeSet(KEYS.PAYMENT_METHODS, methods);
}

// ─── Payment Orders ───────────────────────────────────────────────────

export interface PaymentOrder {
  id: string;
  user_id: string;
  plan_id: PlanId;
  payment_method_id: string;
  base_amount: number;
  exact_amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';
  expires_at: string;
  paid_at: string | null;
  transaction_message_id: string | null;
  transaction_sender_id: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function getPaymentOrdersLocal(): PaymentOrder[] {
  return safeGet<PaymentOrder[]>(KEYS.PAYMENT_ORDERS, []);
}

export function getPaymentOrderLocal(orderId: string): PaymentOrder | null {
  return getPaymentOrdersLocal().find(o => o.id === orderId) || null;
}

export function getPendingOrdersLocal(): PaymentOrder[] {
  const now = new Date().toISOString();
  return getPaymentOrdersLocal().filter(o => o.status === 'pending' && o.expires_at > now);
}

export function getUserOrdersLocal(userId: string): PaymentOrder[] {
  return getPaymentOrdersLocal().filter(o => o.user_id === userId);
}

export function savePaymentOrderLocal(order: PaymentOrder): void {
  const orders = getPaymentOrdersLocal();
  const idx = orders.findIndex(o => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.push(order);
  }
  safeSet(KEYS.PAYMENT_ORDERS, orders);
}

export function updatePaymentOrderLocal(orderId: string, updates: Partial<PaymentOrder>): void {
  const orders = getPaymentOrdersLocal();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...updates, updated_at: new Date().toISOString() };
    safeSet(KEYS.PAYMENT_ORDERS, orders);
  }
}

// ─── Unique Amount Generator ─────────────────────────────────────────

export function generateUniqueAmountLocal(baseAmount: number): number {
  for (let attempt = 0; attempt < 50; attempt++) {
    const suffix = Math.floor(Math.random() * 990) + 10;
    const exactAmount = baseAmount + suffix;
    const existing = getPendingOrdersLocal().find(o => o.exact_amount === exactAmount);
    if (!existing) return exactAmount;
  }
  return baseAmount + (Date.now() % 900) + 100;
}

// ─── Transaction Log ──────────────────────────────────────────────────

export interface TransactionLogEntry {
  id: string;
  source: string;
  source_message_id: string;
  amount: number;
  direction: 'incoming' | 'outgoing';
  raw_message: string;
  processing_status: string;
  matched_payment_order_id: string | null;
  created_at: string;
}

export function getTransactionLogsLocal(): TransactionLogEntry[] {
  return safeGet<TransactionLogEntry[]>(KEYS.TRANSACTION_LOGS, []);
}

export function saveTransactionLogLocal(entry: Omit<TransactionLogEntry, 'id' | 'created_at'>): void {
  const logs = getTransactionLogsLocal();
  logs.unshift({
    ...entry,
    id: `txlog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
  });
  safeSet(KEYS.TRANSACTION_LOGS, logs.slice(0, 200));
}

// ─── Listener Health ──────────────────────────────────────────────────

export interface ListenerHealth {
  status: 'online' | 'offline' | 'error';
  last_message_at: string | null;
  messages_processed: number;
  payments_matched: number;
}

export function getListenerHealthLocal(): ListenerHealth {
  return safeGet<ListenerHealth>(KEYS.LISTENER_HEALTH, {
    status: 'offline',
    last_message_at: null,
    messages_processed: 0,
    payments_matched: 0,
  });
}

export function updateListenerHealthLocal(updates: Partial<ListenerHealth>): void {
  const current = getListenerHealthLocal();
  safeSet(KEYS.LISTENER_HEALTH, { ...current, ...updates });
}
