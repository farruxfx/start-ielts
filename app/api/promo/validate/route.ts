// POST { code, planId, basePrice? } → { valid, error?, discount, finalBasePrice }
// Public pre-check used by the pricing page / checkout modal while typing.

import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo-codes';
import { getEffectivePlanPrice } from '@/lib/plan-overrides';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = typeof body.code === 'string' ? body.code : '';
    const planId = typeof body.planId === 'string' ? body.planId : '';
    if (!code || !planId) {
      return NextResponse.json({ error: 'code and planId are required' }, { status: 400 });
    }
    if (planId === 'free') {
      return NextResponse.json({ error: "Free plan uchun promo qo'llanmaydi" }, { status: 400 });
    }

    // Effective base price from server truth — client can't set its own price.
    const basePrice = await getEffectivePlanPrice(planId);
    if (basePrice <= 0) {
      return NextResponse.json({ error: "Narx noto'g'ri" }, { status: 400 });
    }

    const result = await validatePromoCode(code, planId, basePrice);
    return NextResponse.json(result);
  } catch (e) {
    console.error('[api/promo/validate] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
