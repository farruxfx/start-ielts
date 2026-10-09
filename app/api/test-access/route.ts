// ═══════════════════════════════════════════════════════════════════════
//  /api/test-access — server-side ALLOW/DENY decision for a single test
//
//  GET /api/test-access?skill=listening&slug=<slug>
//  GET /api/test-access?skill=mock-exam&slug=<examId>
//    → { accessType, allowed, reason }
//
//  This endpoint NEVER returns test content (questions, answers,
//  passages, audio). It only returns the authorization decision —
//  the content itself is protected by middleware.ts (static HTML gate).
// ═══════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, deriveAccessState, verifySessionToken } from '@/lib/session';
import {
  evaluateTestAccess,
  isFreeTest,
  isFreeMockExam,
  type Skill,
} from '@/lib/test-access';
import { getFreeAccessConfig } from '@/lib/free-access-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Cache cookie life: 10 min. Middleware falls back to static defaults on miss. */
const CACHE_TPL_LABEL = 'ielts_free_mocks';

function freeMocksCookie(ids: string[]) {
  return {
    name: CACHE_TPL_LABEL,
    value: JSON.stringify(ids),
    httpOnly: false, // must be readable in middleware (Edge)
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 10,
  };
}

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug') || '';
    const rawSkill = req.nextUrl.searchParams.get('skill') || '';
    const skill = rawSkill as Skill;

    if (!slug || !['listening', 'reading', 'mock-exam'].includes(rawSkill)) {
      return NextResponse.json({ error: 'Unknown skill or missing slug' }, { status: 400 });
    }

    const payload = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    const state = deriveAccessState(payload);

    // Admin-manageable free mock ids (DB truth with static fallback).
    const freeConfig = skill === 'mock-exam' ? await getFreeAccessConfig() : null;
    const freeMockIds = freeConfig?.freeMockIds ?? null;

    let allowed = false;
    let reason: string;

    if (rawSkill === 'mock-exam') {
      if (isFreeMockExam(slug, freeMockIds ?? undefined)) {
        allowed = state.authenticated;
        reason = state.authenticated ? 'free_test' : 'not_authenticated';
      } else {
        allowed = state.authenticated && state.subscriptionActive;
        reason = allowed
          ? 'active_subscription'
          : state.authenticated
            ? 'subscription_required'
            : 'not_authenticated';
      }
    } else {
      const decision = evaluateTestAccess(slug, {
        authenticated: state.authenticated,
        subscriptionActive: state.subscriptionActive,
      });
      allowed = decision.allowed;
      reason = decision.reason;
    }

    const base = {
      skill: rawSkill,
      slug,
      accessType:
        rawSkill === 'mock-exam'
          ? isFreeMockExam(slug, freeMockIds ?? undefined)
            ? 'FREE'
            : 'PREMIUM'
          : isFreeTest(slug)
            ? 'FREE'
            : 'PREMIUM',
      allowed,
      reason,
      authenticated: state.authenticated,
      subscriptionActive: state.subscriptionActive,
    };

    const res = NextResponse.json(base);
    if (skill === 'mock-exam' && freeMockIds) {
      res.cookies.set(freeMocksCookie(freeMockIds));
    }
    return res;
  } catch (e) {
    console.error('[api/test-access] GET error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
