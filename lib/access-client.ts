'use client';

// ═══════════════════════════════════════════════════════════════════════
//  ACCESS STATE CLIENT — one cached request for the whole app
//
//  All monetization UI (cards, runner gate, dashboard) reads from this
//  hook. It fetches /api/subscription/state ONCE per page load and
//  caches module-wide; `notifyAccessChanged()` invalidates after
//  activation (payment success) so the UI updates without re-login.
// ═══════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react';
import { TOTAL_FREE_TESTS } from './test-access';

export interface AccessState {
  loading: boolean;
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  plan: string;
  subscriptionStatus: string;
  subscriptionActive: boolean;
  expiresAt: string | null;
}

const IDLE: AccessState = {
  loading: true,
  authenticated: false,
  userId: null,
  email: null,
  name: null,
  plan: 'free',
  subscriptionStatus: 'free',
  subscriptionActive: false,
  expiresAt: null,
};

const ACCESS_CHANGED_EVENT = 'startielts:access-changed';

let cache: AccessState | null = null;
let inflight: Promise<AccessState> | null = null;

export async function fetchAccessState(force = false): Promise<AccessState> {
  if (!force && cache) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch('/api/subscription/state', { cache: 'no-store' });
      const data = await res.json();
      const next: AccessState = {
        loading: false,
        authenticated: !!data?.state?.authenticated,
        userId: data?.state?.userId ?? null,
        email: data?.state?.email ?? null,
        name: data?.state?.name ?? null,
        plan: data?.state?.plan ?? 'free',
        subscriptionStatus: data?.state?.subscriptionStatus ?? 'free',
        subscriptionActive: !!data?.state?.subscriptionActive,
        expiresAt: data?.state?.expiresAt ?? null,
      };
      cache = next;
      return next;
    } catch {
      const fallback: AccessState = { ...IDLE, loading: false };
      cache = fallback;
      return fallback;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Call after payment success / activation to refresh every listener. */
export function notifyAccessChanged(): void {
  cache = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ACCESS_CHANGED_EVENT));
  }
}

export function useAccessState(): AccessState {
  const [state, setState] = useState<AccessState>(cache || IDLE);

  useEffect(() => {
    let alive = true;
    fetchAccessState().then((s) => {
      if (alive) setState(s);
    });
    const onChange = () => {
      fetchAccessState(true).then((s) => {
        if (alive) setState(s);
      });
    };
    window.addEventListener(ACCESS_CHANGED_EVENT, onChange);
    return () => {
      alive = false;
      window.removeEventListener(ACCESS_CHANGED_EVENT, onChange);
    };
  }, []);

  return state;
}

/** React hook for a single test's server-side access decision. */
export function useTestAccess(skill: 'listening' | 'reading', slug: string | undefined) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [reason, setReason] = useState<string>('checking');

  const recheck = useCallback(() => {
    if (!slug) {
      setChecking(false);
      setAllowed(false);
      setReason('not_found');
      return;
    }
    setChecking(true);
    fetch(`/api/test-access?skill=${skill}&slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setAllowed(!!data.allowed);
        setReason(data.reason || (data.allowed ? 'allowed' : 'denied'));
        setChecking(false);
      })
      .catch(() => {
        setAllowed(false);
        setReason('error');
        setChecking(false);
      });
  }, [skill, slug]);

  useEffect(() => {
    recheck();
    const onChange = () => recheck();
    window.addEventListener(ACCESS_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(ACCESS_CHANGED_EVENT, onChange);
  }, [recheck]);

  return { checking, allowed, reason, recheck };
}

export { TOTAL_FREE_TESTS };
