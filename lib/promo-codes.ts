// ═══════════════════════════════════════════════════════════════════════
//  PROMO CODES — admin-manageable discount codes (server-safe lib)
//
//  Stored in the Supabase `promo_codes` table (admin panel CRUD).
//  Applied at subscription purchase: discount is deducted from the plan
//  price BEFORE the unique exact_amount is generated, so the payment page
//  and the Telegram listener match the discounted sum exactly.
//
//  Supported kinds:
//    - percentage  → value = percent off (e.g. 20 = −20%)
//    - fixed       → value = fixed amount off in UZS (e.g. 5000)
//
//  Expiry: valid_until timestamp. Usage limits: max_uses + used_count.
// ═══════════════════════════════════════════════════════════════════════

export type PromoKind = 'percentage' | 'fixed';

export interface PromoCodeRow {
  id: string;
  code: string;              // uppercase, trimmed — always the lookup key
  kind: PromoKind;
  value: number;
  plan_ids: string[] | null; // null = applies to all paid plans
  max_uses: number | null;   // null = unlimited
  used_count: number;
  valid_until: string | null; // ISO timestamp or null = never expires
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PromoValidation {
  valid: boolean;
  error?: string;
  discount: number;              // UZS off (0 when invalid)
  promoCodeId?: string;
  finalBasePrice: number;        // plan price after discount
}

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function computeDiscount(
  discountBasePrice: number,
  kind: PromoKind,
  value: number,
): number {
  if (discountBasePrice <= 0) return 0;
  if (kind === 'percentage') {
    return Math.round(discountBasePrice * Math.min(Math.max(value, 0), 100) / 100);
  }
  return Math.min(Math.max(value, 0), discountBasePrice);
}

export function rowToValidation(
  row: PromoCodeRow | null,
  planId: string,
  basePrice: number,
): PromoValidation {
  if (!row) {
    return { valid: false, error: "Promo kod topilmadi", discount: 0, finalBasePrice: basePrice };
  }
  if (!row.active) {
    return { valid: false, error: "Promo kod faol emas", discount: 0, finalBasePrice: basePrice };
  }
  if (row.valid_until && new Date(row.valid_until).getTime() < Date.now()) {
    return { valid: false, error: "Promo kod muddati tugagan", discount: 0, finalBasePrice: basePrice };
  }
  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return { valid: false, error: "Promo kod ishlatilgan limitga yetdi", discount: 0, finalBasePrice: basePrice };
  }
  if (row.plan_ids && row.plan_ids.length > 0 && !row.plan_ids.includes(planId)) {
    return {
      valid: false,
      error: "Bu promo kod ushbu plan uchun emas",
      discount: 0,
      finalBasePrice: basePrice,
    };
  }
  const discount = computeDiscount(basePrice, row.kind, row.value);
  return {
    valid: true,
    discount,
    promoCodeId: row.id,
    finalBasePrice: Math.max(basePrice - discount, 0),
  };
}

// ─── Supabase access ──────────────────────────────────────────────────

export function isPromoSupabaseConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getPromoClient(): Promise<any | null> {
  if (!isPromoSupabaseConfigured()) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

/** Validate a code against a plan + base price. Returns validation result. */
export async function validatePromoCode(
  rawCode: string,
  planId: string,
  basePrice: number,
): Promise<PromoValidation> {
  const code = normalizeCode(rawCode);
  if (!code) {
    return { valid: false, error: "Promo kod kiriting", discount: 0, finalBasePrice: basePrice };
  }
  const client = await getPromoClient();
  if (!client) {
    // Demo mode: accept a couple of built-in codes so the flow is testable
    const demo = demoCodeRow(code, planId, basePrice);
    return rowToValidation(demo, planId, basePrice);
  }
  try {
    const { data } = await client
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    return rowToValidation(data as PromoCodeRow | null, planId, basePrice);
  } catch {
    return { valid: false, error: "Server bilan aloqa xatosi", discount: 0, finalBasePrice: basePrice };
  }
}

/** Increment usage counter (call once, at order creation). */
export async function incrementPromoUsage(promoCodeId: string): Promise<void> {
  const client = await getPromoClient();
  if (!client) return;
  try {
    const { data } = await client
      .from('promo_codes')
      .select('used_count')
      .eq('id', promoCodeId)
      .maybeSingle();
    if (!data) return;
    await client
      .from('promo_codes')
      .update({ used_count: (data.used_count || 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', promoCodeId);
  } catch {
    /* best effort */
  }
}

// Demo-mode helpers (no Supabase) — mirrors a few realistic rows
function demoCodeRow(code: string, planId: string, basePrice: number): PromoCodeRow {
  const now = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const table: Record<string, Partial<PromoCodeRow>> = {
    WELCOME10: { kind: 'percentage', value: 10 },
    START25: { kind: 'fixed', value: 25000, plan_ids: ['start'] },
    DAILY50: { kind: 'fixed', value: 5000, plan_ids: ['daily'] },
  };
  const found = table[code];
  if (!found) return null as unknown as PromoCodeRow;
  return {
    id: 'demo_' + code,
    code,
    kind: (found.kind as PromoKind) || 'percentage',
    value: found.value || 0,
    plan_ids: found.plan_ids || null,
    max_uses: null,
    used_count: 0,
    valid_until: now,
    active: true,
    created_at: new Date().toISOString(),
  };
}
