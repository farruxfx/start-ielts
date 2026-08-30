'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/lib/payment-system';
import {
  getPaymentOrdersLocal,
  getTransactionLogsLocal,
  getListenerHealthLocal,
  type PaymentOrder,
  type TransactionLogEntry,
  type ListenerHealth,
} from '@/lib/payment-store-local';

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  paid: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  expired: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  cancelled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  matched: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  unmatched: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ambiguous: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  ignored: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
};

export default function AdminPaymentOrdersPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [transactions, setTransactions] = useState<TransactionLogEntry[]>([]);
  const [listenerHealth, setListenerHealth] = useState<ListenerHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'listener'>('orders');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setOrders(getPaymentOrdersLocal().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    setTransactions(getTransactionLogsLocal());
    setListenerHealth(getListenerHealthLocal());
    setLoading(false);
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.exact_amount, 0);
  const unmatchedTx = transactions.filter(t => t.processing_status === 'unmatched').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor payment orders, transactions, and listener status.</p>
        </div>
        <button onClick={fetchData} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Orders</span>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Pending</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600">{pendingOrders}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Paid</span>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">{paidOrders}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Revenue</span>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">{formatAmount(totalRevenue)}</p>
          <p className="text-[10px] text-muted-foreground">UZS</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Unmatched</span>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-600">{unmatchedTx}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {([
          { key: 'orders' as const, label: 'Orders' },
          { key: 'transactions' as const, label: 'Transactions' },
          { key: 'listener' as const, label: 'Listener Status' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No payment orders yet.</td></tr>
                ) : orders.map(order => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium">{order.user_id.slice(0, 16)}...</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary capitalize">{order.plan_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-mono font-bold">{formatAmount(order.exact_amount)}</div>
                        <div className="text-[10px] text-muted-foreground">Base: {formatAmount(order.base_amount)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize', sc.bg, sc.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(order.expires_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet.</td></tr>
                ) : transactions.map(tx => {
                  const sc = statusConfig[tx.processing_status] || statusConfig.error;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-mono font-bold">{formatAmount(tx.amount)} UZS</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold capitalize',
                          tx.direction === 'incoming' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {tx.direction === 'incoming' ? '💰 In' : '📤 Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize', sc.bg, sc.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {tx.processing_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listener Status */}
      {activeTab === 'listener' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Telegram Listener Status</h3>
            </div>
            {listenerHealth ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={cn('h-3 w-3 rounded-full',
                      listenerHealth.status === 'online' ? 'bg-green-500 animate-pulse' :
                      listenerHealth.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    )} />
                    <span className="text-sm font-semibold capitalize">{listenerHealth.status}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Messages Processed</p>
                  <p className="text-2xl font-bold">{listenerHealth.messages_processed}</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Payments Matched</p>
                  <p className="text-2xl font-bold text-green-600">{listenerHealth.payments_matched}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Listener not started yet.</p>
                <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted rounded-lg p-2 inline-block">
                  npx tsx scripts/telegram-listener.ts
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-3">Setup Instructions</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary mt-0.5">1</span>
                <p>Get API credentials from <a href="https://my.telegram.org" target="_blank" rel="noopener" className="text-primary hover:underline">my.telegram.org</a></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary mt-0.5">2</span>
                <p>Add to <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code>: TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_PHONE, PAYMENT_WEBHOOK_SECRET</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary mt-0.5">3</span>
                <p>Install: <code className="rounded bg-muted px-1 py-0.5 text-xs">npm install telegram</code></p>
              </div>
              <div className="flex items-start gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary mt-0.5">4</span>
                <p>Run: <code className="rounded bg-muted px-1 py-0.5 text-xs">npx tsx scripts/telegram-listener.ts</code></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
