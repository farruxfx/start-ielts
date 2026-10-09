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

export type Skill = 'listening' | 'reading' | 'mock-exam';

/**
 * The ONLY tests a free (non-subscribed) user may open.
 * Identified by unique slug (never by title or index).
 * Changing this list = changing which tests are FREE (server-controlled).
 */
export const FREE_TEST_SLUGS: readonly string[] = [
  // ── Listening (5) ──
  'african-clawed-frog-listening',        // Listening — teaser 1
  'listening-test-2',                     // Listening — teaser 2
  'listening-test-3',                     // Listening — teaser 3
  'listening-test-4',                     // Listening — teaser 4
  'cambridge-21-test-1-listening',        // Listening — teaser 5 (Cambridge)
  // ── Reading (4) ──
  '200-years-of-australian-landscapes',   // Reading — teaser 1
  'airborne-dentists',                    // Reading — teaser 2
  'bees-and-pollination',                 // Reading — teaser 3
  'emperor-penguins',                     // Reading — teaser 4
];

export const TOTAL_FREE_TESTS = 9;

/**
 * Free mock exams (admin-manageable via app_free_access table; falls back
 * to this static default when the table has no row for 'mock_exam').
 * Exam ids follow lib/mock-exams.ts (`mock-1` .. `mock-N`).
 */
export const FREE_MOCK_EXAM_IDS: readonly string[] = ['mock-1', 'mock-2'];
export const TOTAL_FREE_MOCKS = 2;

/** General free-access configuration row keys in app_free_access. */
export type FreeAccessConfigKey = 'mock_exam';

export function isFreeMockExam(examId: string, freeIds?: string[]): boolean {
  const list = freeIds && freeIds.length > 0 ? freeIds : FREE_MOCK_EXAM_IDS;
  return list.includes(examId);
}

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
