'use client';

import { useCallback, useEffect, useState } from 'react';
import { Gift, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MockListItem {
  id: string;
  title: string;
}

export default function AdminFreeAccessPage() {
  const [mocks, setMocks] = useState<MockListItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mocksRes, cfgRes] = await Promise.all([
        fetch('/api/admin/free-access'),
        fetch('/api/admin/free-access', { method: 'POST' }),
      ]);
      const mocksData = await mocksRes.json();
      const cfgData = await cfgRes.json();
      if (mocksRes.ok) {
        setMocks(mocksData.mocks || []);
      }
      if (cfgRes.ok && Array.isArray(cfgData.freeMockIds)) {
        setSelected(new Set(cfgData.freeMockIds));
      }
    } catch {
      setResult({ ok: false, text: 'Server bilan aloqa xatosi' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/free-access', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freeMockIds: Array.from(selected) }),
      });
      const data = await res.json();
      setResult(
        res.ok
          ? { ok: true, text: 'Saqlandi — o‘zgarish darhol amal qiladi.' }
          : { ok: false, text: data.error || 'Saqlanmadi' },
      );
    } catch {
      setResult({ ok: false, text: 'Server bilan aloqa xatosi' });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Gift className="h-6 w-6 text-primary" />
          Bepul kontent sozlamalari
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bepul Listening (5 ta) va Reading (4 ta) testlar kodda belgilangan. Mock exam'larni
          shu yerda tanlaysiz — tanlanganlar obunasiz ham ochiq bo'ladi.
        </p>
      </div>

      {result && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            result.ok
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {result.ok ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{result.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base font-bold">
              <span>Bepul Mock exam'lar</span>
              <Badge variant="outline">{selected.size} tanlangan</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {mocks.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 p-3 text-sm transition-all ${
                    selected.has(m.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    className="h-4 w-4"
                  />
                  <span className="line-clamp-2">{m.title}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={save} disabled={saving || mocks.length === 0} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Saqlash
              </Button>
              <Button variant="outline" disabled={saving} onClick={() => setSelected(new Set())}>
                Tozalash
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
