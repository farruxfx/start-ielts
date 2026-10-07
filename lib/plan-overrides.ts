// ═══════════════════════════════════════════════════════════════════════
//  PLAN PRICE OVERRIDES — admin-editable pricing (server-safe)
//
//  Base prices live in lib/plans-data.ts (static defaults). Admin edits are
//  stored in the Supabase plan_overrides table and merged at runtime, so
//  pricing changes take effect WITHOUT a redeploy. Reads fall back to the
//  static defaults when Supabase is not configured (demo mode).
// ═══════════════════════════════════════════════════════════════════════

import type { PlanId, PlanDefinition } from './plans-data';
import { PLANS } from './plans-data';

export interface PlanOverride {
  price?: number | null;
  dailyPrice?: number | null;
}

export function isSupabaseServerConfiguredForOverrides(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

async function getServiceClient(): Promise<any | null> {
  if (!isSupabaseServerConfiguredForOverrides()) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

/** Upsert an override row for a plan (price=null → falls back to default). */
export async function savePlanOverride(
  planId: PlanId,
  data: { price?: number | null; dailyPrice?: number | null },
): Promise<boolean> {
  const client = await getServiceClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('plan_overrides')
      .upsert(
        {
          plan_id: planId,
          price: data.price ?? null,
          daily_price: data.dailyPrice ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'plan_id' },
      );
    return !error;
  } catch {
    return false;
  }
}

/** Remove the override row → plan falls back to the static default price. */
export async function clearPlanOverride(planId: PlanId): Promise<boolean> {
  const client = await getServiceClient();
  if (!client) return false;
  try {
    const { error } = await client.from('plan_overrides').delete().eq('plan_id', planId);
    return !error;
  } catch {
    return false;
  }
}

export async function getPlanOverrides(): Promise<Partial<Record<PlanId, PlanOverride>>> {
  const client = await getServiceClient();
  if (!client) return {};
  try {
    const { data, error } = await client.from('plan_overrides').select('plan_id, price, daily_price');
    if (error || !data) return {};
    const map: Partial<Record<PlanId, PlanOverride>> = {};
    (data as any[]).forEach((row) => {
      map[row.plan_id as PlanId] = {
        price: row.price ?? null,
        dailyPrice: row.daily_price ?? null,
      };
    });
    return map;
  } catch {
    return {};
  }
}

/** Static catalog with admin overrides merged in. */
export async function getEffectivePlans(): Promise<PlanDefinition[]> {
  const overrides = await getPlanOverrides();
  return PLANS.map((plan) => {
    const o = overrides[plan.id];
    if (!o) return plan;
    return {
      ...plan,
      price: typeof o.price === 'number' ? o.price : plan.price,
      dailyPrice:
        plan.id === 'daily'
          ? typeof o.dailyPrice === 'number'
            ? o.dailyPrice
            : plan.dailyPrice
          : plan.dailyPrice,
    };
  });
}

/** Effective base price for payment order creation (server truth). */
export async function getEffectivePlanPrice(planId: PlanId): Promise<number> {
  const plans = await getEffectivePlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return 0;
  return planId === 'daily' ? plan.dailyPrice || 0 : plan.price;
}
