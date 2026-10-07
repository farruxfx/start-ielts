// ═══════════════════════════════════════════════════════════════════════
//  /api/subscription/state — the ONE server-side access-status endpoint
//
//  Returns the server-verified access state for the current session.
//  Client components call this ONCE (cached via lib/access-client.ts)
//  instead of re-checking on every page (performance requirement #19).
//
//  Merge rule: when Supabase is configured, the DB row wins over the
//  cookie (fresher). When the server truth is active but the cookie is
//  stale, the cookie is silently re-minted so middleware unlocks too.
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  createSessionToken,
  deriveAccessState,
  isSubscriptionSnapshotActive,
  sessionCookieOptions,
  verifySessionToken,
  type SessionPayload,
} from '@/lib/session';
import {
  isSupabaseServerConfigured,
  readServerSubscription,
} from '@/lib/server-subscription-store';
import { TOTAL_FREE_TESTS } from '@/lib/test-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const payload = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    let state = deriveAccessState(payload);

    // Prefer fresher server truth (Supabase / env grant) when available.
    if (payload && isSupabaseServerConfigured()) {
      const serverSub = await readServerSubscription(payload.uid);
      if (serverSub && isSubscriptionSnapshotActive(serverSub) && !state.subscriptionActive) {
        const merged: SessionPayload = { ...payload, sub: serverSub };
        const token = await createSessionToken({
          uid: merged.uid,
          email: merged.email,
          name: merged.name,
          role: merged.role,
          sub: serverSub,
        });
        state = deriveAccessState(merged);
        const res = NextResponse.json({
          ok: true,
          state,
          freeTests: { total: TOTAL_FREE_TESTS, slugs: undefined },
        });
        if (token) res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
        return res;
      }
    }

    return NextResponse.json({
      ok: true,
      state,
      freeTests: { total: TOTAL_FREE_TESTS },
    });
  } catch (e) {
    console.error('[api/subscription/state] GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
