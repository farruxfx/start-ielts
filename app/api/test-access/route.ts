// ═══════════════════════════════════════════════════════════════════════
//  /api/test-access — server-side ALLOW/DENY decision for a single test
//
//  GET /api/test-access?skill=listening&slug=<slug>
//    → { accessType, allowed, reason }
//
//  This endpoint NEVER returns test content (questions, answers,
//  passages, audio). It only returns the authorization decision —
//  the content itself is protected by middleware.ts (static HTML gate).
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, deriveAccessState, verifySessionToken } from '@/lib/session';
import { evaluateTestAccess, isFreeTest, type Skill } from '@/lib/test-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug') || '';
    const skill = (req.nextUrl.searchParams.get('skill') || '') as Skill;
    if (!slug || (skill !== 'listening' && skill !== 'reading')) {
      return NextResponse.json({ error: 'skill and slug are required' }, { status: 400 });
    }

    const payload = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    const state = deriveAccessState(payload);

    const decision = evaluateTestAccess(slug, {
      authenticated: state.authenticated,
      subscriptionActive: state.subscriptionActive,
    });

    return NextResponse.json({
      skill,
      slug,
      accessType: isFreeTest(slug) ? 'FREE' : 'PREMIUM',
      allowed: decision.allowed,
      reason: decision.reason,
      authenticated: state.authenticated,
      subscriptionActive: state.subscriptionActive,
    });
  } catch (e) {
    console.error('[api/test-access] GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
