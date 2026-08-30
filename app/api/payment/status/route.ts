import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { PLANS } from '@/lib/subscription';

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      // No Supabase — tell client to fetch from localStorage
      return NextResponse.json({ useClientSide: true, orderId });
    }

    const { getPaymentOrder, getActivePaymentMethod, getTimeUntilExpiry } = await import('@/lib/payment-system');
    const order = await getPaymentOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const plan = PLANS.find(p => p.id === order.plan_id);
    const paymentMethod = await getActivePaymentMethod();

    return NextResponse.json({
      order: {
        id: order.id,
        planId: order.plan_id,
        planName: plan?.name || order.plan_id,
        planIcon: plan?.icon || '📋',
        baseAmount: order.base_amount,
        exactAmount: order.exact_amount,
        status: order.status,
        expiresAt: order.expires_at,
        paidAt: order.paid_at,
        createdAt: order.created_at,
      },
      paymentMethod: paymentMethod ? {
        cardNumber: paymentMethod.card_number,
        cardHolder: paymentMethod.card_holder,
        bankName: paymentMethod.bank_name,
        instructions: paymentMethod.instructions,
      } : null,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
