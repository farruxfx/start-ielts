'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Ticket, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Copy, Power,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface PromoRow {
  id: string;
  code: string;
  kind: 'percentage' | 'fixed';
  value: number;
  plan_ids: string[] | null;
  max_uses: number | null;
  used_count: number;
  valid_until: string | null;
  active: boolean;
}

const PLANS = ['daily', 'start', 'basic', 'pro'] as const;

export default function AdminPromoCodesPage() {
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // create-draft state
  const [code, setCode] = useState('');
  const [kind, setKind] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('10');
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (res.ok) setRows(data.codes || []);
      else setError(data.error || 'Yuklanmadi');
    } catch {
      setError('Server bilan aloqa xatosi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          kind,
          value: Number(value),
          planIds: planIds.length ? planIds : null,
          maxUses: maxUses ? Number(maxUses) : null,
          validUntil: validUntil || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Saqlanmadi');
        return;
      }
      setCode(''); setValue('10'); setMaxUses(''); setValidUntil('');
      load();
    } catch {
      setError('Server bilan aloqa xatosi');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (row: PromoRow) => {
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, active: !row.active }),
      });
      load();
    } catch { /* best effort */ }
  };

  const remove = async (row: PromoRow) => {
    if (!confirm(`"${row.code}" kodini o'chirish?`)) return;
    try {
      await fetch(`/api/admin/promo-codes?id=${encodeURIComponent(row.id)}`, { method: 'DELETE' });
      load();
    } catch { /* best effort */ }
  };

  const fmt = (row: PromoRow) =>
    row.kind === 'percentage' ? `${row.value}%` : `${new Intl.NumberFormat('ru-RU').format(row.value)} so'm`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          Promo kodlar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Obuna sotib olishda qo'llaniladigan chegirma kodlari. Kod narxni pasaytiradi —
          foydalanuvchi to'lov sahifasida chegirmali aniq summani ko'radi.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create new */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Yangi promo kod
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Kod</Label>
              <Input
                placeholder="WELCOME10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Turi</Label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as 'percentage' | 'fixed')}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="percentage">Foiz (%) chegirma</option>
                <option value="fixed">Aniq summa (so'm)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                {kind === 'percentage' ? 'Foiz miqdori (0-100)' : "Summa (so'm)"}
              </Label>
              <Input type="number" min={0} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Ishlatish limiti (bo'sh = cheksiz)</Label>
              <Input type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Muddati (bo'sh = cheksiz)</Label>
              <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Qaysi planlar uchun (bo'sh = hammasi)</Label>
            <div className="flex flex-wrap gap-2">
              {PLANS.map((p) => (
                <label key={p} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={planIds.includes(p)}
                    onChange={(e) =>
                      setPlanIds((cur) => (e.target.checked ? [...cur, p] : cur.filter((x) => x !== p)))
                    }
                    className="h-3.5 w-3.5"
                  />
                  {p}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={create} disabled={creating || !code.trim() || !value} className="gap-1.5">                          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          {kind === 'percentage' ? 'Yaratish' : 'Yaratish'}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Hali promo kod yo'q.</p>
        ) : (
          rows.map((row) => (
            <Card key={row.id} className="rounded-2xl">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <code className="rounded-lg bg-muted px-3 py-1.5 font-mono text-sm font-bold">{row.code}</code>
                  <Badge variant="outline">{fmt(row)}</Badge>
                  {row.plan_ids && (
                    <span className="text-xs text-muted-foreground">planlar: {row.plan_ids.join(', ')}</span>
                  )}
                  {row.max_uses !== null && (
                    <span className="text-xs text-muted-foreground">
                      {row.used_count}/{row.max_uses} ishlatilgan
                    </span>
                  )}
                  {row.valid_until && (
                    <span className="text-xs text-muted-foreground">
                      muddat: {new Date(row.valid_until).toLocaleDateString('uz-UZ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(row.code)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant={row.active ? 'secondary' : 'outline'} onClick={() => toggleActive(row)}>
                    <Power className="h-4 w-4" />
                    {row.active ? 'Faol' : 'OFF'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(row)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
