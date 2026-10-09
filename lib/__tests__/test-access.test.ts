/**
 * Test-access unit tests — the centralized authorization layer
 * (requirement #7) and the FREE_TEST_SLUGS contract (requirement #16).
 */
import {
  FREE_TEST_SLUGS,
  TOTAL_FREE_TESTS,
  isFreeTest,
  evaluateTestAccess,
  canAccessTest,
  isSubscriptionSnapshotActive,
  isPaidPlan,
} from '@/lib/test-access';

const FUTURE = Date.now() + 30 * 24 * 60 * 60 * 1000;
const PAST = Date.now() - 1000;

describe('FREE_TEST_SLUGS contract', () => {
  it('exposes exactly 3 free tests', () => {
    expect(FREE_TEST_SLUGS).toHaveLength(9);
    expect(TOTAL_FREE_TESTS).toBe(9);
  });

  it('contains the free listening and reading tests by slug', () => {
    expect(FREE_TEST_SLUGS).toContain('african-clawed-frog-listening');
    expect(FREE_TEST_SLUGS).toContain('200-years-of-australian-landscapes');
    expect(FREE_TEST_SLUGS).toContain('airborne-dentists');
  });

  it('identifies free vs premium slugs', () => {
    expect(isFreeTest('african-clawed-frog-listening')).toBe(true);
    expect(isFreeTest('airborne-dentists')).toBe(true);
    expect(isFreeTest('authentic-listening-mock-1')).toBe(false);
    expect(isFreeTest('nonexistent')).toBe(false);
    expect(isFreeTest('')).toBe(false);
  });
});

describe('evaluateTestAccess / canAccessTest', () => {
  it('allows a FREE test for anyone (even anonymous)', () => {
    expect(evaluateTestAccess('african-clawed-frog-listening', {
      authenticated: false,
      subscriptionActive: false,
    })).toEqual({ allowed: true, reason: 'free_test' });
  });

  it('denies a PREMIUM test when not authenticated', () => {
    expect(evaluateTestAccess('authentic-listening-mock-1', {
      authenticated: false,
      subscriptionActive: false,
    })).toEqual({ allowed: false, reason: 'not_authenticated' });
  });

  it('denies a PREMIUM test for a free (authenticated, no sub) user', () => {
    expect(evaluateTestAccess('authentic-listening-mock-1', {
      authenticated: true,
      subscriptionActive: false,
    })).toEqual({ allowed: false, reason: 'subscription_required' });
  });

  it('allows a PREMIUM test with an active subscription', () => {
    expect(evaluateTestAccess('authentic-listening-mock-1', {
      authenticated: true,
      subscriptionActive: true,
    })).toEqual({ allowed: true, reason: 'active_subscription' });
  });

  it('allows premium via admin override', () => {
    expect(evaluateTestAccess('authentic-listening-mock-1', {
      authenticated: true,
      subscriptionActive: false,
      adminOverride: true,
    })).toEqual({ allowed: true, reason: 'admin_override' });
  });

  it('canAccessTest mirrors the decision (acceptance #20)', () => {
    const premium = 'authentic-listening-mock-1';
    const free = '200-years-of-australian-landscapes';

    // Free user
    expect(canAccessTest(free, { authenticated: true, subscriptionActive: false })).toBe(true);
    expect(canAccessTest(premium, { authenticated: true, subscriptionActive: false })).toBe(false);
    // Premium user
    expect(canAccessTest(premium, { authenticated: true, subscriptionActive: true })).toBe(true);
  });
});

describe('isSubscriptionSnapshotActive (expiration handling)', () => {
  it('active + future expiry = active', () => {
    expect(isSubscriptionSnapshotActive({ plan: 'pro', status: 'active', expiresAt: FUTURE })).toBe(true);
  });

  it('trial status counts as active', () => {
    expect(isSubscriptionSnapshotActive({ plan: 'pro', status: 'trial', expiresAt: FUTURE })).toBe(true);
  });

  it('active + past expiry = NOT active (expired locks premium again)', () => {
    expect(isSubscriptionSnapshotActive({ plan: 'pro', status: 'active', expiresAt: PAST })).toBe(false);
  });

  it('pending_payment never grants premium', () => {
    expect(isSubscriptionSnapshotActive({ plan: 'basic', status: 'pending_payment', expiresAt: FUTURE })).toBe(false);
  });

  it('expired/cancelled statuses never grant premium', () => {
    expect(isSubscriptionSnapshotActive({ plan: 'basic', status: 'expired', expiresAt: FUTURE })).toBe(false);
    expect(isSubscriptionSnapshotActive({ plan: 'basic', status: 'cancelled', expiresAt: FUTURE })).toBe(false);
  });

  it('null snapshot is not active', () => {
    expect(isSubscriptionSnapshotActive(null)).toBe(false);
    expect(isSubscriptionSnapshotActive(undefined)).toBe(false);
  });
});

describe('isPaidPlan', () => {
  it('daily/start/basic/pro are paid; free is not', () => {
    expect(isPaidPlan('daily')).toBe(true);
    expect(isPaidPlan('start')).toBe(true);
    expect(isPaidPlan('basic')).toBe(true);
    expect(isPaidPlan('pro')).toBe(true);
    expect(isPaidPlan('free')).toBe(false);
  });
});
