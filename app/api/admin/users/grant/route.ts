// ═══════════════════════════════════════════════════════════════════════
//  ADMIN GRANT — set a user's role and/or subscription by user ID.
//
//  GET  ?q=<id|partial>            → { user, subscription }
//  POST { id?, q?, role?, plan?, days? }
//    • id    exact or unique partial user ID
//    • role  'student' | 'teacher' | 'admin'
//    • plan  'free' | 'daily' | 'start' | 'basic' | 'pro'  (+ days override)
//
//  Server truth written via the service role key:
//    profiles.role                → role
//    user_subscriptions           → plan_id / status / expires_at /
//                                   source='admin_grant'
//  This is the same table the auth middleware / premium access check reads,
//  so the change takes effect on the user's next request.
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-admin';
import { isSupabaseServerConfigured } from '@/lib/server-subscription-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES = ['student', 'teacher', 'admin'] as const;
const PLANS = ['free', 'daily', 'start', 'basic', 'pro'] as const;

const PLAN_DEFAULT_DAYS: Record<string, number> = {
  free: 0,
  daily: 1,
  start: 30,
  basic: 30,
  pro: 30,
};

async function getClient() {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

interface ResolvedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

/** Exact match first, then a unique partial match. */
async function resolveUser(term: string): Promise<ResolvedUser | { error: string }> {
  const termNorm = term.trim();
  if (!termNorm) return { error: 'Foydalanuvchi ID kiritilmagan.' };
  const client = await getClient();

  let data: ResolvedUser[] | null = null;
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRe.test(termNorm)) {
    ({ data } = await client.from('profiles').select('id, email, full_name, role').eq('id', termNorm).limit(2));
  }
  if (!data?.length) {
    ({ data } = await client
      .from('profiles')
      .select('id, email, full_name, role')
      .ilike('id', `%${termNorm}%`)
      .limit(2));
  }
  if (!data?.length) return { error: `Bu ID bo'yicha foydalanuvchi topilmadi` };
  if (data.length > 1) return { error: 'Bu ID bir nechta foydalanuvchiga mos keldi — toliq ID kiriting.' };
  return data[0];
}

async function readSubscription(userId: string) {
  const client = await getClient();
  const { data } = await client
    .from('user_subscriptions')
    .select('plan_id, status, expires_at, source')
    .eq('user_id', userId)
    .maybeSingle();
  return data || null;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Supabase sozlanmagan — demo rejimda DB yozuv yoq.' }, { status: 400 });
  }

  // ?list=1 → paginated user directory with current subscriptions.
  if (req.nextUrl.searchParams.get('list') === '1') {
    return listUsers(req);
  }

  const q = req.nextUrl.searchParams.get('q') || '';
  const user = await resolveUser(q);
  if ('error' in user) return NextResponse.json({ error: user.error }, { status: 404 });
  const subscription = await readSubscription(user.id);
  return NextResponse.json({ user, subscription });
}

async function listUsers(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(0, Number(sp.get('page') || 0));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get('pageSize') || 10)));
  const q = (sp.get('q') || '').trim();
  const client = await getClient();

  let query = client
    .from('profiles')
    .select('id, email, full_name, role, target_band, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%,id.ilike.%${q}%`);
  }
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const users = (data || []) as ResolvedUser[] & { target_band?: number; created_at: string }[];
  const userIds = users.map((u) => u.id);
  const subsMap: Record<string, { plan: string; status: string; expires_at: string | null }> = {};
  if (userIds.length) {
    const { data: subData } = await client
      .from('user_subscriptions')
      .select('user_id, plan_id, status, expires_at')
      .in('user_id', userIds);
    for (const s of subData || []) {
      subsMap[s.user_id] = { plan: s.plan_id, status: s.status, expires_at: s.expires_at };
    }
  }
  return NextResponse.json({ users, subs: subsMap, total: count || 0 });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Supabase sozlanmagan — demo rejimda DB yozuv yoq.' }, { status: 400 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const userIdTerm = String(body.id || body.q || '').trim();
  const role = typeof body.role === 'string' ? body.role : null;
  const plan = typeof body.plan === 'string' ? body.plan : null;
  const days = body.days != null ? Number(body.days) : null;

  if (!role && !plan) return NextResponse.json({ error: 'role yoki plan koertilgan emas' }, { status: 400 });
  if (role && !(ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: 'Rol notogri' }, { status: 400 });
  }
  if (plan && !(PLANS as readonly string[]).includes(plan)) {
    return NextResponse.json({ error: 'Plan notogri' }, { status: 400 });
  }
  if (days != null && (!Number.isFinite(days) || days < 0 || days > 3650)) {
    return NextResponse.json({ error: 'days notogri (0-3650)' }, { status: 400 });
  }

  const user = await resolveUser(userIdTerm);
  if ('error' in user) return NextResponse.json({ error: user.error }, { status: 404 });

  const client = await getClient();
  let resultProof: Record<string, unknown> = {};

  if (role) {
    const { error } = await client.from('profiles').update({ role }).eq('id', user.id);
    if (error) {
      return NextResponse.json({ error: 'Rol yozilmadi: ' + error.message }, { status: 500 });
    }
    resultProof.role = role;
  }

  if (plan) {
    if (plan === 'free') {
      const { error } = await client
        .from('user_subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan_id: 'free',
            status: 'free',
            source: 'admin_grant',
            expires_at: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
      if (error) return NextResponse.json({ error: 'Obuna yozilmadi: ' + error.message }, { status: 500 });
      resultProof.plan = 'free';
      resultProof.expires_at = null;
    } else {
      const durationDays = days != null && days > 0 ? days : PLAN_DEFAULT_DAYS[plan] || 30;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await client
        .from('user_subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan_id: plan,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt,
            source: 'admin_grant',
            payment_order_id: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
      if (error) return NextResponse.json({ error: 'Obuna yozilmadi: ' + error.message }, { status: 500 });
      resultProof.plan = plan;
      resultProof.expires_at = expiresAt;
    }
  }

  const subscription = await readSubscription(user.id);
  return NextResponse.json({ ok: true, user: { ...user, ...(role ? { role } : {}) }, resultProof, subscription });
}
