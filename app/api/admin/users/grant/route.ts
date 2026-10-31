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

/** Exact match first, then a unique partial match. Falls back to auth.users. */
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
  if (!data?.length) {
    ({ data } = await client
      .from('profiles')
      .select('id, email, full_name, role')
      .ilike('email', `%${termNorm}%`)
      .limit(2));
  }
  if (!data?.length && uuidRe.test(termNorm)) {
    // Profile row missing — resolve straight from auth.users via admin API.
    try {
      const { data: au } = await client.auth.admin.getUserById(termNorm);
      const auUser = (au as { user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null)?.user;
      if (auUser) {
        return {
          id: auUser.id,
          email: auUser.email || '',
          full_name: String(auUser.user_metadata?.name || '') || (auUser.email || '').split('@')[0],
          role: 'student',
        };
      }
    } catch {
      /* service key missing or lookup failed */
    }
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
  const q = (sp.get('q') || '').trim().toLowerCase();
  const client = await getClient();

  // Primary source: auth.users via the admin API — every registered user
  // appears here even if their profiles row is missing. profiles/user_subscriptions
  // are merged in afterwards; fall back to profiles-only when the service key is absent.
  try {
    const { data: au, error } = await client.auth.admin.listUsers({ page, perPage: pageSize });
    const auUsers = (au as { users?: { id: string; email?: string; created_at?: string; user_metadata?: Record<string, unknown> }[] } | null)?.users;
    if (!error && Array.isArray(auUsers)) {
      const total = (au as unknown as { total?: number }).total ?? auUsers.length;
      const ids = auUsers.map((u) => u.id);

      const profMap: Record<string, { full_name: string; role: string; target_band: number | null }> = {};
      if (ids.length) {
        const { data: profs } = await client
          .from('profiles')
          .select('id, full_name, role, target_band')
          .in('id', ids);
        for (const p of profs || []) {
          profMap[p.id] = { full_name: p.full_name || '', role: p.role || 'student', target_band: p.target_band ?? null };
        }
      }

      const subsMap: Record<string, { plan: string; status: string; expires_at: string | null }> = {};
      if (ids.length) {
        const { data: subData } = await client
          .from('user_subscriptions')
          .select('user_id, plan_id, status, expires_at')
          .in('user_id', ids);
        for (const s of subData || []) {
          subsMap[s.user_id] = { plan: s.plan_id, status: s.status, expires_at: s.expires_at };
        }
      }

      let users = auUsers.map((u) => {
        const p = profMap[u.id];
        return {
          id: u.id,
          email: u.email || '',
          full_name: p?.full_name || String(u.user_metadata?.name || '') || (u.email || '').split('@')[0],
          role: p?.role || 'student',
          target_band: p?.target_band ?? null,
          has_profile: !!p,
          created_at: u.created_at || '',
        };
      });
      if (q) {
        users = users.filter(
          (u) => u.email.toLowerCase().includes(q) || u.full_name.toLowerCase().includes(q) || u.id.includes(q),
        );
      }
      return NextResponse.json({ users, subs: subsMap, total: q ? users.length : total });
    }
  } catch {
    // admin API unavailable (no service key) — profiles fallback below
  }

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
    // Upsert so the grant also works for a user whose profiles row is missing.
    const { error } = await client
      .from('profiles')
      .upsert(
        { id: user.id, email: user.email, full_name: user.full_name, role },
        { onConflict: 'id' },
      );
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
