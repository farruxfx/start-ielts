// GET  → current Groq key status (masked)
// POST { action: 'save' | 'revoke' | 'test', apiKey? } — admin-managed key stored
//      in the platform_secrets table (service-only). Nothing is committed to git.

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import { getGroqApiKey, maskSecret } from '@/lib/platform-secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const key = await getGroqApiKey();
  return NextResponse.json({
    configured: !!key,
    keyMasked: key ? maskSecret(key) : '',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const adminUid = guard.payload?.uid || null;
  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === 'string' ? body.action : 'save';

  if (action === 'revoke') {
    const ok = await saveSecret('groq_api_key', null, adminUid);
    if (!ok) return NextResponse.json({ error: "O'chirilmadi (DB ulanmagan?)" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'test') {
    const key = (typeof body.apiKey === 'string' && body.apiKey.trim()) || (await getGroqApiKey());
    if (!key) return NextResponse.json({ ok: false, error: 'Key mavjud emas' }, { status: 400 });
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: 'Reply with the single word: OK' }],
          max_tokens: 8,
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
          { ok: false, error: `Groq API xatosi (${res.status}): ${text.slice(0, 200)}` },
          { status: 400 },
        );
      }
      const json = await res.json();
      return NextResponse.json({ ok: true, reply: json.choices?.[0]?.message?.content || '' });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: 'Groq API ga ulanmadi: ' + (e as Error).message },
        { status: 400 },
      );
    }
  }

  // action === 'save'
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  if (apiKey.length < 20 || !apiKey.startsWith('gsk_')) {
    return NextResponse.json(
      { error: "Groq key to'g'ri emas (console.groq.com/keys — gsk_ bilan boshlanadi)" },
      { status: 400 },
    );
  }
  const ok = await saveSecret('groq_api_key', apiKey, adminUid);
  if (!ok) {
    return NextResponse.json(
      { error: "Saqlanmadi. Demo rejimda GROQ_API_KEY env o'zgaruvchisidan foydalaning." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}

// ─── storage helper ─────────────────────────────────────────────────────

async function saveSecret(key: string, value: string | null, adminUid: string | null): Promise<boolean> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const skey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !skey) return false;
    const client = createClient(url, skey, { auth: { persistSession: false, autoRefreshToken: false } });

    if (value === null) {
      // Revoke: disable the row rather than delete (audit trail).
      const { error } = await client.from('platform_secrets').update({ enabled: false }).eq('key', key);
      return !error;
    }

    const { error } = await client.from('platform_secrets').upsert(
      {
        key,
        value,
        enabled: true,
        updated_at: new Date().toISOString(),
        updated_by: adminUid,
      },
      { onConflict: 'key' },
    );
    return !error;
  } catch {
    return false;
  }
}
