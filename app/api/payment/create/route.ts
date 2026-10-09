import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { PLANS, type PlanId } from '@/lib/plans-data';
import { getEffectivePlanPrice } from '@/lib/plan-overrides';

// When Supabase is not configured, return instructions for client-side handling
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, planId, promoCode } = body as {
      userId: string;
      planId: PlanId;
      promoCode?: string | null;
    };

    if (!userId || !planId) {
      return NextResponse.json({ error: 'Missing userId or planId' }, { status: 400 });
    }

    if (planId === 'free') {
      return NextResponse.json({ error: 'Cannot create payment order for free plan' }, { status: 400 });
    }

    // Admin-editable effective price (plan_overrides merged over defaults)
    let baseAmount = await getEffectivePlanPrice(planId);

    if (!isSupabaseConfigured) {
      // No Supabase — honor promo for the client-side path, then hand off.
      let finalBase = baseAmount;
      if (promoCode && promoCode.trim()) {
        const { validatePromoCode } = await import('@/lib/promo-codes');
        const validation = await validatePromoCode(promoCode, planId, baseAmount);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        finalBase = validation.finalBasePrice;
      }
      // No Supabase — tell client to create order locally
      return NextResponse.json({
        success: true,
        useClientSide: true,
        baseAmount: finalBase,
        originalBaseAmount: baseAmount,
        promoCode: promoCode || null,
        planId,
      });
    }

    // Supabase available — create order server-side
    const { createPaymentOrder, getActivePaymentMethod } = await import('@/lib/payment-system');
    const paymentMethod = await getActivePaymentMethod();
    if (!paymentMethod) {
      return NextResponse.json({ error: 'No active payment method configured' }, { status: 500 });
    }

    const order = await createPaymentOrder(userId, planId, paymentMethod.id, promoCode);
    if (!order) {
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        exactAmount: order.exact_amount,
        baseAmount: order.base_amount,
        planId: order.plan_id,
        promoCode: order.promo_code,
        discountAmount: order.discount_amount,
        expiresAt: order.expires_at,
        status: order.status,
      },
      paymentMethod: {
        cardNumber: paymentMethod.card_number,
        cardHolder: paymentMethod.card_holder,
        bankName: paymentMethod.bank_name,
        instructions: paymentMethod.instructions,
      },
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
