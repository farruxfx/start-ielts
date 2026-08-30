'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getPaymentMethodsLocal,
  savePaymentMethodLocal,
  updatePaymentMethodLocal,
  deletePaymentMethodLocal,
  togglePaymentMethodActiveLocal,
  type PaymentMethod,
} from '@/lib/payment-store-local';

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    card_number: '',
    card_holder: '',
    bank_name: 'HUMO',
    instructions: '',
    is_active: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMethods(getPaymentMethodsLocal());
  }, []);

  const refresh = () => setMethods(getPaymentMethodsLocal());

  const handleSave = () => {
    if (!form.card_number || !form.card_holder) {
      setError('Card number and holder name are required');
      return;
    }
    setError(null);

    if (editing) {
      updatePaymentMethodLocal(editing, {
        card_number: form.card_number.replace(/\s/g, ''),
        card_holder: form.card_holder,
        bank_name: form.bank_name,
        instructions: form.instructions,
        is_active: form.is_active,
      });
    } else {
      if (form.is_active) {
        // Deactivate others first
        methods.forEach(m => {
          if (m.is_active) updatePaymentMethodLocal(m.id, { is_active: false });
        });
      }
      savePaymentMethodLocal({
        card_number: form.card_number.replace(/\s/g, ''),
        card_holder: form.card_holder,
        bank_name: form.bank_name,
        instructions: form.instructions,
        is_active: form.is_active,
      });
    }

    setShowForm(false);
    setEditing(null);
    setForm({ card_number: '', card_holder: '', bank_name: 'HUMO', instructions: '', is_active: false });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refresh();
  };

  const handleEdit = (method: PaymentMethod) => {
    setForm({
      card_number: method.card_number,
      card_holder: method.card_holder,
      bank_name: method.bank_name,
      instructions: method.instructions,
      is_active: method.is_active,
    });
    setEditing(method.id);
    setShowForm(true);
  };

  const handleToggleActive = (id: string) => {
    togglePaymentMethodActiveLocal(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this payment method?')) return;
    deletePaymentMethodLocal(id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage HUMO card details for automated payments.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ card_number: '', card_holder: '', bank_name: 'HUMO', instructions: '', is_active: false });
            setEditing(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Method
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm text-green-700 dark:text-green-400">
          <Check className="h-4 w-4" />
          Payment method saved successfully.
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editing ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number</Label>
              <Input
                id="card_number"
                placeholder="9860 1234 5678 9012"
                value={form.card_number}
                onChange={(e) => setForm({ ...form, card_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_holder">Card Holder</Label>
              <Input
                id="card_holder"
                placeholder="FARRUX ISMOILOV"
                value={form.card_holder}
                onChange={(e) => setForm({ ...form, card_holder: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank</Label>
              <Input
                id="bank_name"
                placeholder="HUMO"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Payment Instructions</Label>
              <Input
                id="instructions"
                placeholder="Ko'rsatilgan summani to'lang"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium">Active (used for payments)</span>
          </label>

          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave}>
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Methods List */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">All Payment Methods</h3>
        </div>
        <div className="divide-y divide-border">
          {methods.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No payment methods configured. Add one to start accepting payments.
            </div>
          ) : (
            methods.map((method) => (
              <div key={method.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
                  method.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted',
                )}>
                  <CreditCard className={cn('h-6 w-6', method.is_active ? 'text-green-600' : 'text-muted-foreground')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{method.bank_name}</p>
                    {method.is_active && (
                      <Badge variant="default" className="bg-green-600 text-xs">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm font-mono text-muted-foreground">
                    {method.card_number.replace(/(.{4})/g, '$1 ').trim()}
                  </p>
                  <p className="text-xs text-muted-foreground">{method.card_holder}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(method.id)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      method.is_active
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                    )}
                  >
                    {method.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleEdit(method)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
