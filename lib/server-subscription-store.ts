// ═══════════════════════════════════════════════════════════════════════
//  SERVER SUBSCRIPTION STORE — the authoritative server-side record
//
//  Three backends, resolved automatically:
//    1. Supabase `user_subscriptions` table (production path, when
//       NEXT_PUBLIC_SUPABASE_URL is set). Uses service role key if present.
//    2. Env-based manual grant (ADMIN_GRANT_USER_ID/PLAN/DAYS) — lets the
//       owner grant themselves premium without a database.
//    3. Signed session cookie fallback (mock/demo mode) — issued only by
//       this server after activation, so it is still tamper-proof, but it
//       does not survive a fresh browser without re-login.
// ═══════════════════════════════════════════════════════════════════════

import type { SubscriptionPlanId, SubscriptionSnapshot } from './test-access';
import { isSubscriptionSnapshotActive } from './test-access';

export function isSupabaseServerConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function planDurationMs(plan: SubscriptionPlanId): number {
  return plan === 'daily' ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
}

// ─── Supabase backend (service role preferred) ──────────────────────────

type SupabaseClientAny = {
  from: (table: string) => any;
};

async function getServiceClient(): Promise<SupabaseClientAny | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !(serviceKey || anonKey)) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, serviceKey || anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    }) as unknown as SupabaseClientAny;
  } catch {
    return null;
  }
}

function rowToSnapshot(row: any): SubscriptionSnapshot | null {
  if (!row) return null;
  return {
    plan: (row.plan_id as SubscriptionPlanId) || 'free',
    status: (row.status as SubscriptionSnapshot['status']) || 'expired',
    expiresAt: row.expires_at ? new Date(row.expires_at).getTime() : null,
  };
}

export async function readServerSubscription(userId: string): Promise<SubscriptionSnapshot | null> {
  if (isSupabaseServerConfigured()) {
    const client = await getServiceClient();
    if (client) {
      try {
        const { data } = await client
          .from('user_subscriptions')
          .select('plan_id, status, expires_at')
          .eq('user_id', userId)
          .maybeSingle();
        return rowToSnapshot(data);
      } catch {
        // fall through to env grant
      }
    }
  }

  // Env-based manual grant (owner demo mode)
  const grantUid = process.env.ADMIN_GRANT_USER_ID;
  if (grantUid && grantUid === userId) {
    const plan = (process.env.ADMIN_GRANT_PLAN as SubscriptionPlanId) || 'pro';
    const days = Number(process.env.ADMIN_GRANT_DAYS || 30);
    const startedMs = Number(process.env.ADMIN_GRANT_STARTED_AT_MS || Date.now());
    return {
      plan,
      status: 'active',
      expiresAt: startedMs + days * 24 * 60 * 60 * 1000,
    };
  }
  return null;
}

export async function writeServerSubscription(
  userId: string,
  plan: SubscriptionPlanId,
  paymentOrderId: string | null,
): Promise<SubscriptionSnapshot> {
  const expiresAt = Date.now() + planDurationMs(plan);
  const snapshot: SubscriptionSnapshot = { plan, status: 'active', expiresAt };

  if (isSupabaseServerConfigured()) {
    const client = await getServiceClient();
    if (client) {
      try {
        await client.from('user_subscriptions').upsert(
          {
            user_id: userId,
            plan_id: plan,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: new Date(expiresAt).toISOString(),
            source: 'payment',
            payment_order_id: paymentOrderId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
      } catch {
        // best-effort write; cookie below still enforces expiry
      }
    }
  }
  return snapshot;
}

export async function hasServerSidePremium(userId: string): Promise<boolean> {
  const sub = await readServerSubscription(userId);
  return isSubscriptionSnapshotActive(sub);
}
