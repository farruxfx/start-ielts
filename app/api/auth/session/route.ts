// ═══════════════════════════════════════════════════════════════════════
//  /api/auth/session — issues/clears the signed httpOnly session cookie
//
//  POST   { uid, email, name?, role? } → Set-Cookie (ECDSA-signed, 7d)
//  DELETE                             → clears the cookie (sign out)
//
//  The cookie payload carries ONLY identity + the subscription snapshot
//  the SERVER knows about (Supabase row / env grant). Forging a uid here
//  grants nothing: premium requires a server-side paid record.
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  createSessionToken,
  deriveAccessState,
  sessionCookieOptions,
  verifySessionToken,
} from '@/lib/session';
import { readServerSubscription } from '@/lib/server-subscription-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!uid || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'uid and email are required' }, { status: 400 });
    }

    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : email.split('@')[0];
    const role = typeof body.role === 'string' && body.role ? body.role : 'student';

    // Fresh server-truth subscription snapshot (if any) at session mint time.
    const serverSub = await readServerSubscription(uid);

    const token = await createSessionToken({ uid, email, name, role, sub: serverSub });
    if (!token) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, state: deriveAccessState({ ...{}, ...parseFast(token) }) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (e) {
    console.error('[api/auth/session] POST error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const payload = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ state: deriveAccessState(payload) });
}

/** Minimal local parse to echo state without a second verify pass. */
function parseFast(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}
