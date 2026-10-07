/**
 * Session token tests — ECDSA P-256 sign/verify roundtrip.
 *
 * jsdom's window.crypto has no subtle, so inject Node's webcrypto before
 * lib/session.ts runs (WebCrypto is required by the module).
 */
import { webcrypto } from 'crypto';

if (!(globalThis.crypto as unknown as { subtle?: unknown })?.subtle) {
  (globalThis as unknown as { crypto: Crypto }).crypto = webcrypto as unknown as Crypto;
}

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
  deriveAccessState,
} from '@/lib/session';
import type { SubscriptionSnapshot } from '@/lib/test-access';

const ACTIVE_SUB: SubscriptionSnapshot = {
  plan: 'pro',
  status: 'active',
  expiresAt: Date.now() + 24 * 60 * 60 * 1000,
};

/** Mint a token, verify it, and derive the access state in one step. */
async function mintAndDerive(sub?: SubscriptionSnapshot | null) {
  const token = await createSessionToken({ uid: 'u', email: 'u@test.com', sub: sub ?? null });
  const payload = await verifySessionToken(token);
  return deriveAccessState(payload);
}

describe('session tokens (ECDSA P-256)', () => {
  it('exports the expected cookie name and max age', () => {
    expect(SESSION_COOKIE).toBe('ielts_session');
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 7);
  });

  it('roundtrips a signed token (create → verify)', async () => {
    const token = await createSessionToken({
      uid: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      role: 'student',
      sub: ACTIVE_SUB,
    });

    expect(token).toBeTruthy();
    expect(token!.split('.')).toHaveLength(2);

    const payload = await verifySessionToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.uid).toBe('user-1');
    expect(payload!.email).toBe('user@test.com');
    expect(payload!.name).toBe('Test User');
    expect(payload!.role).toBe('student');
    expect(payload!.sub?.plan).toBe('pro');
    expect(payload!.v).toBe(1);
  });

  it('rejects a tampered payload (forged premium plan)', async () => {
    const token = (await createSessionToken({ uid: 'user-1', email: 'user@test.com' }))!;
    const [, sig] = token.split('.');

    // Re-encode the payload with an upgraded plan — signature no longer matches.
    const forged = Buffer.from(
      JSON.stringify({ v: 1, uid: 'user-1', email: 'user@test.com', sub: ACTIVE_SUB, iat: 1, exp: 9999999999 }),
    ).toString('base64url');

    expect(await verifySessionToken(`${forged}.${sig}`)).toBeNull();
  });

  it('rejects garbage, empty and malformed tokens', async () => {
    expect(await verifySessionToken(null)).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken('')).toBeNull();
    expect(await verifySessionToken('not-a-token')).toBeNull();
    expect(await verifySessionToken('a.b.c')).toBeNull();
    expect(await verifySessionToken('!!!.???')).toBeNull();
  });

  it('deriveAccessState: anonymous → free, locked', () => {
    const state = deriveAccessState(null);
    expect(state.authenticated).toBe(false);
    expect(state.subscriptionActive).toBe(false);
    expect(state.plan).toBe('free');
  });

  it('deriveAccessState: active sub → premium unlocked with expiry', async () => {
    const state = await mintAndDerive(ACTIVE_SUB);
    expect(state.authenticated).toBe(true);
    expect(state.subscriptionActive).toBe(true);
    expect(state.plan).toBe('pro');
    expect(state.expiresAt).toBeTruthy();
  });

  it('deriveAccessState: expired sub → locked again (acceptance #8)', async () => {
    const state = await mintAndDerive({
      plan: 'basic',
      status: 'active',
      expiresAt: Date.now() - 1000, // expired 1s ago
    });
    expect(state.authenticated).toBe(true);
    expect(state.subscriptionActive).toBe(false); // premium locked
    expect(state.plan).toBe('free');
  });

  it('deriveAccessState: pending_payment never grants premium (acceptance #12)', async () => {
    const state = await mintAndDerive({
      plan: 'start',
      status: 'pending_payment',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    expect(state.subscriptionActive).toBe(false);
  });
});
