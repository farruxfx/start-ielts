// ═══════════════════════════════════════════════════════════════════════
//  /api/subscription/activate — payment confirmed → subscription ACTIVE
//
//  Flow: upgrade-modal detects a PAID order → calls this endpoint →
//  server verifies the order (Supabase) → computes expiry ITSELF
//  (client never supplies expiry) → writes the server record → re-mints
//  the signed session cookie → premium unlocks everywhere without
//  re-login.
//
//  Security notes:
//   • Requires a valid session cookie.
//   • With Supabase: the order must exist in payment_orders with
//     status='paid' and belong to the session user.
//   • Demo mode (no Supabase): payment verification stays client-side
//     (existing Telegram/manual flow); the server still owns expiry
//     computation and cookie issuance. Documented limitation — see
//     MONETIZATION.md. Pending/failed payments never reach this route.
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  createSessionToken,
  deriveAccessState,
  sessionCookieOptions,
  verifySessionToken,
} from '@/lib/session';
import {
  isSupabaseServerConfigured,
  planDurationMs,
  writeServerSubscription,
} from '@/lib/server-subscription-store';
import type { SubscriptionPlanId } from '@/lib/test-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAID_PLANS: ReadonlySet<string> = new Set(['daily', 'start', 'basic', 'pro']);

async function verifyPaidOrder(orderId: string, uid: string): Promise<SubscriptionPlanId | null> {
  if (!isSupabaseServerConfigured()) return null; // demo mode handled by caller
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data, error } = await supabase
      .from('payment_orders')
      .select('plan_id, status, user_id')
      .eq('id', orderId)
      .maybeSingle();
    if (error || !data) return null;
    if (data.status !== 'paid') return null;
    if (data.user_id !== uid) return null;
    return data.plan_id as SubscriptionPlanId;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!payload) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const planId = typeof body.planId === 'string' ? (body.planId as SubscriptionPlanId) : null;

    if (!orderId && !planId) {
      return NextResponse.json({ error: 'orderId or planId required' }, { status: 400 });
    }

    let effectivePlan: SubscriptionPlanId | null = null;

    if (isSupabaseServerConfigured() && orderId) {
      // Production path: server verifies the paid order in the database.
      effectivePlan = await verifyPaidOrder(orderId, payload.uid);
      if (!effectivePlan) {
        return NextResponse.json(
          { error: 'Payment order not found, not paid, or not owned by this user' },
          { status: 403 },
        );
      }
    } else {
      // Demo path: plan comes from the (client-confirmed) order flow.
      if (!planId || !PAID_PLANS.has(planId)) {
        return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });
      }
      effectivePlan = planId;
      console.warn(
        `[activate] DEMO MODE activation without server-side payment verification (user=${payload.uid}, plan=${planId}). Configure Supabase for production.`,
      );
    }

    // Server computes expiry — client input cannot extend it.
    const snapshot = await writeServerSubscription(payload.uid, effectivePlan!, orderId || null);

    const token = await createSessionToken({
      uid: payload.uid,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      sub: snapshot,
    });

    const res = NextResponse.json({ ok: true, state: deriveAccessState({ ...payload, sub: snapshot }) });
    if (token) res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    console.error('[api/subscription/activate] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
