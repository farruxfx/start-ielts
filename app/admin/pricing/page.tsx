'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tag, RotateCcw, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface AdminPlanRow {
  id: string;
  name: string;
  price: number;
  defaultPrice: number;
  overridden: boolean;
}

const formatUZS = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + " so'm";
const EDITABLE = ['daily', 'start', 'basic', 'pro'];

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<AdminPlanRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plan-overrides');
      const data = await res.json();
      if (res.ok && Array.isArray(data.plans)) {
        setPlans(data.plans);
        const d: Record<string, string> = {};
        data.plans.forEach((p: AdminPlanRow) => {
          d[p.id] = String(p.price);
        });
        setDrafts(d);
      } else {
        setMessage({ kind: 'err', text: data.error || "Yuklanmadi" });
      }
  } catch {
      setMessage({ kind: 'err', text: 'Server bilan aloqa xatosi' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (planId: string, reset = false) => {
    setSavingPlan(planId);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/plan-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          reset
            ? { planId, price: null, dailyPrice: null }
            : { planId, price: Number(drafts[planId]), dailyPrice: Number(drafts[planId]) },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ kind: 'err', text: data.error || 'Saqlanmadi' });
        return;
      }
      setMessage({ kind: 'ok', text: 'Narx saqlandi — pricing sahifasi va to‘lovlar darhol yangilanadi.' });
      load();
    } catch {
      setMessage({ kind: 'err', text: 'Server bilan aloqa xatosi' });
    } finally {
      setSavingPlan(null);
    }
  };

  const dirty = (p: AdminPlanRow) => drafts[p.id] !== String(p.price);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" />
          Pricing boshqaruvi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plan narxlarini shu yerda o‘zgartiring — o‘zgarishlar pricing sahifasi va to‘lov
          buyurtmalariga darhol ta‘sir qiladi (redeploy shart emas).
        </p>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            message.kind === 'ok'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {message.kind === 'ok' ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans
            .filter((p) => EDITABLE.includes(p.id))
            .map((plan) => (
              <Card key={plan.id} className="rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                    {plan.overridden ? (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        O‘zgartirilgan
                      </Badge>
                    ) : (
                      <Badge variant="outline">Standart narx</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`price-${plan.id}`} className="text-xs text-muted-foreground">
                      Narx (so‘m) — standart: {formatUZS(plan.defaultPrice)}
                    </Label>
                    <Input
                      id={`price-${plan.id}`}
                      type="number"
                      min={0}
                      step={100}
                      value={drafts[plan.id] ?? ''}
                      onChange={(e) => setDrafts((d) => ({ ...d, [plan.id]: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={!dirty(plan) || savingPlan === plan.id}
                      onClick={() => save(plan.id)}
                      className="gap-1.5"
                    >
                      {savingPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Saqlash
                    </Button>
                    {plan.overridden && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingPlan === plan.id}
                        onClick={() => save(plan.id, true)}
                        className="gap-1.5"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Standartga qaytarish
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
