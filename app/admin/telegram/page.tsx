'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Radio,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Power,
  Activity,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ListenerResult {
  ok: boolean;
  error?: string;
  scanned: number;
  amountsFound: number;
  matched: number;
  unmatched: number;
  duplicates: number;
  lastUpdateId: number;
}

export default function AdminTelegramPage() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [tokenMasked, setTokenMasked] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [polling, setPolling] = useState(false);
  const [autoPoll, setAutoPoll] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastResult, setLastResult] = useState<ListenerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/telegram/settings');
      const data = await res.json();
      if (res.ok) {
        setConfigured(data.configured);
        setTokenMasked(data.botTokenMasked || '');
        setChatId(data.chatId || '');
        setEnabled(!!data.enabled);
      } else {
        setError(data.error || 'Yuklanmadi');
      }
    } catch {
      setError('Server bilan aloqa xatosi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-poll loop (client-driven; endpoint is admin-guarded)
  const runPoll = useCallback(async () => {
    setPolling(true);
    try {
      const res = await fetch('/api/admin/telegram/poll', { method: 'POST' });
      const data = await res.json();
      setLastResult(data);
      if (!res.ok) setError(data.error || 'Poll xatosi');
      else setError(null);
    } catch {
      setError('Server bilan aloqa xatosi');
    } finally {
      setPolling(false);
    }
  }, []);

  useEffect(() => {
    if (autoPoll) {
      runPoll();
      autoTimer.current = setInterval(runPoll, 15000);
    }
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
      autoTimer.current = null;
    };
  }, [autoPoll, runPoll]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/telegram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId, enabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Saqlanmadi');
        return;
      }
      setBotToken('');
      load();
    } catch {
      setError('Server bilan aloqa xatosi');
    } finally {
      setSaving(false);
    }
  };

  const verify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/admin/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken }),
      });
      const data = await res.json();
      if (data.ok) {
        setVerifyResult({ ok: true, text: `Bot tasdiqlandi: ${data.name} (@${data.username})` });
      } else {
        setVerifyResult({ ok: false, text: data.error || 'Token noto‘g‘ri' });
      }
    } catch {
      setVerifyResult({ ok: false, text: 'Telegram API ga ulanmadi' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radio className="h-6 w-6 text-primary" />
          Telegram to‘lov listener
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bank/bot kanalidan kelgan to‘lov xabarlarini avtomatik o‘qiydi va summaga mos
          kutilayotgan buyurtmani (unique exact_amount) tasdiqlaydi.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Settings card */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Sozlamalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {configured && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                    <p className="text-muted-foreground">
                      Saqlangan token: <span className="font-mono">{tokenMasked}</span>
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Holat:{' '}
                      {enabled ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                          Faol
                        </Badge>
                      ) : (
                        <Badge variant="outline">O‘chirilgan</Badge>
                      )}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bot-token" className="text-xs text-muted-foreground">
                    Bot token {configured && '(yangilash uchun kiriting)'}
                  </Label>
                  <Input
                    id="bot-token"
                    type="password"
                    placeholder="123456789:AAF..."
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    @BotFather dan olingan token. Bot to‘lov xabarlari keladigan kanalga
                    <span className="font-medium"> admin</span> bo‘lishi kerak.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chat-id" className="text-xs text-muted-foreground">
                    Manba chat / kanal ID (ixtiyoriy)
                  </Label>
                  <Input
                    id="chat-id"
                    placeholder="-1001234567890"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bo‘sh bo‘lsa barcha chatlar tekshiriladi. Faqat kerakli kanalni cheklash
                    tavsiya etiladi.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Power className="h-4 w-4 text-primary" />
                  Listener faol
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={verify} disabled={!botToken || verifying} className="gap-1.5">
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Tokenni tekshirish
                  </Button>
                  <Button onClick={save} disabled={!botToken || saving} className="gap-1.5">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Saqlash
                  </Button>
                </div>

                {verifyResult && (
                  <div
                    className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                      verifyResult.ok
                        ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
                        : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                    }`}
                  >
                    {verifyResult.ok ? (
                      <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{verifyResult.text}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Listener run card */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Listener holati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p className="flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                Har bir xabardagi summalar kutilayotgan buyurtmalar bilan solishtiriladi.
                Buyurtma summasi unique (bazaga 10–999 qo‘shimcha) — shu tufayli xato match
                bo‘lmaydi.
              </p>
              <p className="flex items-start gap-1.5">
                <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                To‘lov tasdiqlanganda obuna avtomatik faollashadi (24h / 30 kun) va premium
                testlar ochiladi.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoPoll}
                onChange={(e) => setAutoPoll(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <RefreshCw className="h-4 w-4 text-primary" />
              Avtomatik tekshirish (har 15 soniyada)
            </label>

            <Button onClick={runPoll} disabled={polling || !configured} className="gap-1.5 w-full sm:w-auto">
              {polling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Hozir tekshirish
            </Button>

            {lastResult && (
              <div
                className={`rounded-xl border p-4 text-sm space-y-2 ${
                  lastResult.ok
                    ? 'border-border bg-card'
                    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {!lastResult.ok ? (
                  <p>{lastResult.error}</p>
                ) : (
                  <>
                    <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">
                      Oxirgi sikl natijasi
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: 'Xabarlar', value: lastResult.scanned },
                        { label: 'Summalar', value: lastResult.amountsFound },
                        { label: 'Mos keldi', value: lastResult.matched },
                        { label: 'Mos kelmadi', value: lastResult.unmatched },
                      ].map((s) => (
                        <div key={s.label} className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-lg font-bold">{s.value}</p>
                          <p className="text-[11px] text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {lastResult.duplicates > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {lastResult.duplicates} xabar allaqachon qayta ishlangan (dublikat o‘tkazildi).
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
