// ═══════════════════════════════════════════════════════════════════════
//  SESSION TOKEN — ECDSA P-256 signed (asymmetric), Edge-compatible
//
//  Why asymmetric: middleware runs in the Edge runtime where only
//  NEXT_PUBLIC_* env vars exist. With HMAC, the verification secret would
//  have to be public (= forgeable). With ECDSA the server signs with a
//  PRIVATE key (Node runtime only) and middleware verifies with the
//  PUBLIC key — safe to expose, impossible to forge.
//
//  The payload carries the server-verified subscription snapshot; expiry
//  is enforced on every verification (token exp + sub expiresAt), so an
//  expired subscription loses premium access automatically.
// ═══════════════════════════════════════════════════════════════════════

import { isSubscriptionSnapshotActive, type SubscriptionSnapshot } from './test-access';

// Re-export so route handlers can import everything session-related from
// this one module (single import surface for server code).
export { isSubscriptionSnapshotActive };

export const SESSION_COOKIE = 'ielts_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const SESSION_VERSION = 1;
const ALG = { name: 'ECDSA', namedCurve: 'P-256' } as const;
const SIGN_ALG = { name: 'ECDSA', hash: 'SHA-256' } as const;

export interface SessionPayload {
  v: number;
  uid: string;
  email: string;
  name: string;
  role: string;
  /** Server-verified subscription snapshot (null = free user). */
  sub: SubscriptionSnapshot | null;
  iat: number; // issued at (seconds)
  exp: number; // token expiry (seconds)
}

interface Jwk {
  kty: string;
  crv: string;
  x?: string;
  y?: string;
  d?: string;
}

// ─── Keys ───────────────────────────────────────────────────────────────
// Production: set SESSION_PRIVATE_JWK (server) + NEXT_PUBLIC_SESSION_PUBLIC_JWK.
// Dev/demo fallback pair below (private key is public knowledge — fine for
// local dev, never rely on it in production).

const DEV_PUBLIC_JWK: Jwk = {
  kty: 'EC',
  crv: 'P-256',
  x: 'whYm0OEtn-1YZb-3oym8YHv9_VHuLWg8MNcGgzlK0bY',
  y: 'aG93nBgkYrj2tGfBD7yBby4QbGl2RERsNe8SPDLttzg',
};

const DEV_PRIVATE_JWK: Jwk = {
  kty: 'EC',
  crv: 'P-256',
  x: 'whYm0OEtn-1YZb-3oym8YHv9_VHuLWg8MNcGgzlK0bY',
  y: 'aG93nBgkYrj2tGfBD7yBby4QbGl2RERsNe8SPDLttzg',
  d: '4GtHkd-sJrlzk-vczHveV0eOGllpZz7fXKiKESyPbks',
};

function parseJwk(raw: string | undefined, fallback: Jwk): Jwk | null {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Jwk;
    if (parsed && parsed.kty === 'EC' && parsed.crv === 'P-256') return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}

let cachedPublic: CryptoKey | null = null;
let cachedPrivate: CryptoKey | null = null;

async function getPublicKey(): Promise<CryptoKey | null> {
  if (cachedPublic) return cachedPublic;
  const jwk = parseJwk(process.env.NEXT_PUBLIC_SESSION_PUBLIC_JWK, DEV_PUBLIC_JWK);
  try {
    cachedPublic = await crypto.subtle.importKey('jwk', jwk as JsonWebKey, ALG, false, ['verify']);
    return cachedPublic;
  } catch {
    return null;
  }
}

async function getPrivateKey(): Promise<CryptoKey | null> {
  if (cachedPrivate) return cachedPrivate;
  const raw = process.env.SESSION_PRIVATE_JWK;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[session] SESSION_PRIVATE_JWK not set — using DEV key. Set it in production env!');
    }
  }
  const jwk = parseJwk(raw, DEV_PRIVATE_JWK);
  try {
    cachedPrivate = await crypto.subtle.importKey('jwk', jwk as JsonWebKey, ALG, false, ['sign']);
    return cachedPrivate;
  } catch {
    return null;
  }
}

// ─── base64url helpers (Edge-safe) ──────────────────────────────────────

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64 + '==='.slice((b64.length + 3) % 4);
  const bin = atob(pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64 + '==='.slice((b64.length + 3) % 4);
  const bin = atob(pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ─── Public API ─────────────────────────────────────────────────────────

export interface CreateSessionInput {
  uid: string;
  email: string;
  name?: string;
  role?: string;
  sub?: SubscriptionSnapshot | null;
}

export async function createSessionToken(input: CreateSessionInput): Promise<string | null> {
  const priv = await getPrivateKey();
  if (!priv) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    v: SESSION_VERSION,
    uid: input.uid,
    email: input.email,
    name: input.name || input.email.split('@')[0],
    role: input.role || 'student',
    sub: input.sub || null,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const body = b64urlEncode(JSON.stringify(payload));
  const sigBuf = await crypto.subtle.sign(SIGN_ALG, priv, new TextEncoder().encode(body));
  const sig = bytesToB64url(new Uint8Array(sigBuf));
  return `${body}.${sig}`;
}

/** Verify signature + token expiry. Returns null on ANY failure/tampering. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
  } catch {
    return null;
  }
  if (!payload || payload.v !== SESSION_VERSION || !payload.uid || !payload.email) return null;

  const pub = await getPublicKey();
  if (!pub) return null;

  let ok = false;
  try {
    ok = await crypto.subtle.verify(SIGN_ALG, pub, b64urlToBytes(sig), new TextEncoder().encode(body));
  } catch {
    ok = false;
  }
  if (!ok) return null;

  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSec) return null; // token expired → treated as signed out

  return payload;
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

// ─── Derived access state (single source for API responses) ─────────────

export interface DerivedAccessState {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  plan: string;
  subscriptionStatus: string;
  subscriptionActive: boolean;
  /** ISO date or null */
  expiresAt: string | null;
}

export function deriveAccessState(payload: SessionPayload | null): DerivedAccessState {
  if (!payload) {
    return {
      authenticated: false,
      userId: null,
      email: null,
      name: null,
      role: null,
      plan: 'free',
      subscriptionStatus: 'free',
      subscriptionActive: false,
      expiresAt: null,
    };
  }
  const active = isSubscriptionSnapshotActive(payload.sub);
  return {
    authenticated: true,
    userId: payload.uid,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    plan: active && payload.sub ? payload.sub.plan : 'free',
    subscriptionStatus: payload.sub ? payload.sub.status : 'free',
    subscriptionActive: active,
    expiresAt: payload.sub?.expiresAt ? new Date(payload.sub.expiresAt).toISOString() : null,
  };
}
