// GET  → list current effective plans (base catalog + admin overrides merged)
// POST { planId, price?, dailyPrice? } → upsert override (null price = reset to default)

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/api-admin';
import {
  getEffectivePlans,
  getPlanOverrides,
  savePlanOverride,
  clearPlanOverride,
} from '@/lib/plan-overrides';
import { PLANS, type PlanDefinition } from '@/lib/plans-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const plans = await getEffectivePlans();
  const overrides = await getPlanOverrides();
  return NextResponse.json({
    plans: plans.map((p: PlanDefinition) => ({
      id: p.id,
      name: p.name,
      price: p.id === 'daily' ? p.dailyPrice || 0 : p.price,
      defaultPrice: (() => {
        const base = PLANS.find((b) => b.id === p.id);
        if (!base) return 0;
        return p.id === 'daily' ? base.dailyPrice || 0 : base.price;
      })(),
      overridden: !!overrides[p.id],
    })),
  });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const planId = typeof body.planId === 'string' ? body.planId.trim() : '';
    if (!PLANS.some((p) => p.id === planId)) {
      return NextResponse.json({ error: "Noma'lum plan" }, { status: 400 });
    }
    if (planId === 'free') {
      return NextResponse.json({ error: "Free plan narxi o'zgartirilmaydi" }, { status: 400 });
    }

    const parsePrice = (v: unknown): number | null => {
      if (v === null || v === undefined || v === '') return null; // reset to default
      const n = Math.round(Number(v));
      return Number.isFinite(n) && n >= 0 ? n : null;
    };

    const price = planId === 'daily' ? null : parsePrice(body.price);
    const dailyPrice = planId === 'daily' ? parsePrice(body.dailyPrice) : null;
    if (planId === 'daily' && dailyPrice === null && body.dailyPrice !== null && body.dailyPrice !== '' && body.dailyPrice !== undefined) {
      return NextResponse.json({ error: "Narx noto'g'ri (musbat son bo'lishi kerak)" }, { status: 400 });
    }
    if (planId !== 'daily' && price === null && body.price !== null && body.price !== '' && body.price !== undefined) {
      return NextResponse.json({ error: "Narx noto'g'ri (musbat son bo'lishi kerak)" }, { status: 400 });
    }

    const isReset = (planId === 'daily' ? dailyPrice : price) === null;
    if (isReset) {
      await clearPlanOverride(planId);
    } else {
      await savePlanOverride(planId, { price, dailyPrice });
    }
    revalidatePath('/pricing');
    revalidatePath('/admin/pricing');

    const plans = await getEffectivePlans();
    return NextResponse.json({ ok: true, plans });
  } catch (e) {
    console.error('[api/admin/plan-overrides] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
