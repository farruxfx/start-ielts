'use client';

// Admin API Keys page (Site config via /api/admin/ai-key — create API route path when present)
// Edit point: Groq API key + service links. NO secret is committed to the repo.

import { useEffect, useState } from 'react';
import { KeyRound, Save, Trash2, AlertCircle, CheckCircle2, Loader2, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface KeyStatus {
  configured: boolean;
  keyMasked: string;
  model: string;
}

function ApiKeysPage() {
  const [status, setStatus] = useState<KeyStatus>({ configured: false, keyMasked: '', model: '' });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/ai-key');
        const data = await res.json();
        if (res.ok) setStatus(data);
        else setNotice({ ok: false, text: data.error || 'Yuklanmadi' });
      } catch {
        setNotice({ ok: false, text: 'Server bilan aloqa xatosi' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', apiKey }),
      });
      const data = await res.json();
      if (!res.ok) setNotice({ ok: false, text: data.error || 'Saqlanmadi' });
      else {
        setNotice({ ok: true, text: 'Groq API key saqlandi (platform_secrets). Env talab qilinmaydi.' });
        setApiKey('');
        const refreshed = await fetch('/api/admin/ai-key');
        if (refreshed.ok) setStatus(await refreshed.json());
      }
    } catch {
      setNotice({ ok: false, text: 'Server bilan aloqa xatosi' });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke' }),
      });
      const data = await res.json();
      if (!res.ok) setNotice({ ok: false, text: data.error || 'O‘chirilmadi' });
      else {
        setNotice({ ok: true, text: 'Key o‘chirildi (env fallback qoldi bo‘lsa ishlayveradi).' });
        const refreshed = await fetch('/api/admin/ai-key');
        if (refreshed.ok) setStatus(await refreshed.json());
      }
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/ai-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', apiKey: apiKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setNotice({ ok: false, text: data.error || 'Test xato' });
      else setNotice({ ok: true, text: 'Groq javob berdi: ' + data.reply });
    } catch {
      setNotice({ ok: false, text: 'Server bilan aloqa xatosi' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-primary" />
          API Keys
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Barcha API maxfiyliklarni admin paneldan kuzatish. GitHub-reponing ichida umumiy secret yo
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Groq AI API key</h3>
          <Badge variant={status.configured ? 'default' : 'outline'} className="ml-auto">
            {status.configured ? 'Faol' : 'Sozlanmagan'}
          </Badge>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            console.groq.com/keys da bepul key oling va shu yerga kiriting — server uni bazada (platform_secrets)
            saqlaydi. Gayhub-ga hech qanday secret bo'maydi. Model: {status.model || 'openai/gpt-oss-120b'}.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {status.configured && (
              <p className="text-sm text-muted-foreground">
                Saqlangan key: <span className="font-mono">{status.keyMasked}</span>
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="groq-key" className="text-xs text-muted-foreground">
                GROQ_API_KEY {status.configured && '(yangilash uchun kiriting)'}
              </Label>
              <Input
                id="groq-key"
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                className="font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={saving || !apiKey} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Saqlash
              </Button>
              <Button variant="outline" onClick={test} disabled={testing || (!apiKey && !status.configured)} className="gap-1.5">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Test qilish
              </Button>
              <Button
                variant="outline"
                onClick={revoke}
                disabled={saving || !status.configured}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                O‘chirish
              </Button>
            </div>

            {notice && (
              <div
                className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                  notice.ok
                    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300'
                    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
                }`}
              >
                {notice.ok ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{notice.text}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <h3 className="font-semibold text-foreground">Keyin bu yerda kiritaladigan bo‘ladi</h3>
        <ul className="mt-2 list-disc list-inside space-y-1">
          <li>Telegram MTProto (api_id / api_hash) — <a href="/admin/telegram" className="text-primary underline">Telegram Listener</a> sahifasida.</li>
          <li>To‘lov webhook secret — Telegram Listener sahifasidagi MTProto kartida.</li>
        </ul>
      </div>
    </div>
  );
}

export default ApiKeysPage;
