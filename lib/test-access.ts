// ═══════════════════════════════════════════════════════════════════════
//  TEST ACCESS CONTROL — Single source of truth (server-safe)
//
//  No 'use client', no Node APIs, no localStorage imports.
//  Safe to import from: middleware.ts (Edge), API route handlers (Node),
//  server components AND client components.
//
//  Access rules (acceptance criteria):
//    FREE test    + any authenticated user          → ALLOW
//    PREMIUM test + no session                      → DENY (signin)
//    PREMIUM test + session, no active subscription → DENY (subscribe)
//    PREMIUM test + session, active subscription    → ALLOW
// ═══════════════════════════════════════════════════════════════════════

export type Skill = 'listening' | 'reading';

/**
 * The ONLY tests a free (non-subscribed) user may open.
 * Identified by unique slug (never by title or index).
 * Changing this list = changing which tests are FREE (server-controlled).
 */
export const FREE_TEST_SLUGS: readonly string[] = [
  'african-clawed-frog-listening',        // Listening — 1 free test
  '200-years-of-australian-landscapes',   // Reading — free test 1
  'airborne-dentists',                    // Reading — free test 2
];

export const TOTAL_FREE_TESTS = FREE_TEST_SLUGS.length; // 3

export type AccessReason =
  | 'free_test'            // one of the 3 public free tests
  | 'active_subscription'  // premium unlocked by paid subscription
  | 'admin_override'       // server-side admin override for this test
  | 'not_authenticated'    // no session cookie
  | 'subscription_required';// authenticated but subscription not active

export interface AccessContext {
  /** Valid signed session cookie present? */
  authenticated: boolean;
  /** Active (non-expired) subscription from server-verified state? */
  subscriptionActive: boolean;
  /** Optional server-side per-test override resolved on the server. */
  adminOverride?: boolean;
}

export interface AccessDecision {
  allowed: boolean;
  reason: AccessReason;
}

export function isFreeTest(slug: string): boolean {
  return FREE_TEST_SLUGS.includes(slug);
}

/**
 * Central authorization layer — `canAccessTest(user, test)`.
 * Every page / route / middleware must call THIS, never reimplement.
 */
export function evaluateTestAccess(slug: string, ctx: AccessContext): AccessDecision {
  if (isFreeTest(slug)) return { allowed: true, reason: 'free_test' };
  if (!ctx.authenticated) return { allowed: false, reason: 'not_authenticated' };
  if (ctx.adminOverride) return { allowed: true, reason: 'admin_override' };
  if (ctx.subscriptionActive) return { allowed: true, reason: 'active_subscription' };
  return { allowed: false, reason: 'subscription_required' };
}

export function canAccessTest(slug: string, ctx: AccessContext): boolean {
  return evaluateTestAccess(slug, ctx).allowed;
}

// ─── Subscription snapshot helpers ─────────────────────────────────────

export type SubscriptionPlanId = 'free' | 'daily' | 'start' | 'basic' | 'pro';
export type SubscriptionState = 'free' | 'pending_payment' | 'trial' | 'active' | 'expired' | 'cancelled';

/** Milliseconds epoch. `null` = never expires (not used for paid plans). */
export interface SubscriptionSnapshot {
  plan: SubscriptionPlanId;
  status: SubscriptionState;
  expiresAt: number | null;
}

const ACTIVE_STATUSES: ReadonlySet<string> = new Set(['active', 'trial']);

/**
 * Expiration handling: pending_payment / expired / cancelled never grant
 * premium; an active sub with expiresAt in the past is also NOT active.
 */
export function isSubscriptionSnapshotActive(sub: SubscriptionSnapshot | null | undefined): boolean {
  if (!sub) return false;
  if (!ACTIVE_STATUSES.has(sub.status)) return false;
  if (sub.expiresAt !== null && sub.expiresAt <= Date.now()) return false;
  return true;
}

/** Paid plans unlock ALL premium tests (daily/start/basic/pro). */
export function isPaidPlan(plan: SubscriptionPlanId | string): boolean {
  return plan === 'daily' || plan === 'start' || plan === 'basic' || plan === 'pro';
}
