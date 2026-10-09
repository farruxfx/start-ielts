// ═══════════════════════════════════════════════════════════════════════
//  /api/admin/promo-codes — admin CRUD for the promo_codes table
//
//  GET          → list codes (newest first)
//  POST         → create { code, kind, value, planIds?, maxUses?, validUntil? }
//  PATCH        → { id, active }
//  DELETE ?id=  → remove
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import { isPromoSupabaseConfigured } from '@/lib/promo-codes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function withAdmin(req: NextRequest): Promise<NextResponse | null> {
  const guard = await requireAdmin(req);
  return guard.ok
    ? null
    : NextResponse.json({ error: guard.error }, { status: guard.status });
}

function getServiceClient(): Promise<any | null> {
  return (async () => {
    if (!isPromoSupabaseConfigured()) return null;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    } catch {
      return null;
    }
  })();
}

export async function GET(req: NextRequest) {
  const guard = await withAdmin(req);
  if (guard) return guard;
  const client = await getServiceClient();
  if (!client) {
    return NextResponse.json({ codes: [], demoMode: true });
  }
  const { data, error } = await client
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ codes: data || [] });
}

export async function POST(req: NextRequest) {
  const guard = await withAdmin(req);
  if (guard) return guard;
  const client = await getServiceClient();
  if (!client) {
    return NextResponse.json({ error: "Demo rejimda promo kodlar saqlanmaydi (Supabase kerak)" }, { status: 500 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
    const kind = body.kind === 'fixed' ? 'fixed' : 'percentage';
    const value = Math.round(Number(body.value));
    const planIds = Array.isArray(body.planIds) && body.planIds.length ? body.planIds.map(String) : null;
    const maxUses = body.maxUses !== null && body.maxUses !== '' && body.maxUses !== undefined
      ? Math.max(0, Math.round(Number(body.maxUses)))
      : null;
    const validUntil = body.validUntil || null;

    if (!code || code.length < 3) {
      return NextResponse.json({ error: "Kod kamida 3 belgidan iborat bo'lsin" }, { status: 400 });
    }
    if (!Number.isFinite(value) || value <= 0 || (kind === 'percentage' && value > 100)) {
      return NextResponse.json({ error: "Narx miqdori noto'g'ri" }, { status: 400 });
    }

    const { error: insertError } = await client.from('promo_codes').insert({
      id: `promo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      code,
      kind,
      value,
      plan_ids: planIds,
      max_uses: maxUses,
      used_count: 0,
      valid_until: validUntil,
      active: true,
    });
    if (insertError) {
      if (String(insertError.message).includes('duplicate')) {
        return NextResponse.json({ error: "Bunday kod allaqachon mavjud" }, { status: 400 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/admin/promo-codes] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await withAdmin(req);
  if (guard) return guard;
  const client = await getServiceClient();
  if (!client) {
    return NextResponse.json({ error: 'Demo rejimda o‘zgartirish mumkin emas' }, { status: 500 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await client
      .from('promo_codes')
      .update({ active: !!body.active, updated_at: new Date().toISOString() })
      .eq('id', id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/admin/promo-codes] PATCH error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await withAdmin(req);
  if (guard) return guard;
  const client = await getServiceClient();
  if (!client) {
    return NextResponse.json({ error: 'Demo rejimda o‘chirish mumkin emas' }, { status: 500 });
  }
  try {
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const { error } = await client.from('promo_codes').delete().eq('id', id);
    return error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/admin/promo-codes] DELETE error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
