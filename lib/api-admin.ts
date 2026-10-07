// ═══════════════════════════════════════════════════════════════════════
//  ADMIN API GUARD — authorization for /api/admin/* routes
//
//  • Verifies the signed ECDSA session cookie (identity).
//  • When Supabase is configured, the role is re-checked against the
//    profiles table (server truth — the cookie role alone is never enough).
//  • Demo mode (no Supabase): trusts the cookie role minted by
//    /api/auth/session. Documented demo-mode limitation.
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './session';
import { isSupabaseServerConfigured, } from './server-subscription-store';
import type { SessionPayload } from './session';

export interface AdminGuardResult {
  ok: boolean;
  status?: number;
  error?: string;
  payload?: SessionPayload;
}

async function isAdminInDatabase(uid: string): Promise<boolean> {
  if (!isSupabaseServerConfigured()) return true; // demo mode: cookie role is the truth
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await client.from('profiles').select('role').eq('id', uid).maybeSingle();
    return data?.role === 'admin';
  } catch {
    return false;
  }
}

export async function requireAdmin(req: NextRequest): Promise<AdminGuardResult> {
  const payload = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!payload) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }
  const cookieSaysAdmin = payload.role === 'admin';
  if (!cookieSaysAdmin) {
    return { ok: false, status: 403, error: 'Admin access required' };
  }
  // In production, double-check the role server-side.
  if (isSupabaseServerConfigured()) {
    const dbAdmin = await isAdminInDatabase(payload.uid);
    if (!dbAdmin) {
      return { ok: false, status: 403, error: 'Admin access required' };
    }
  }
  return { ok: true, payload };
}
