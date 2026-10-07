'use client';

// Client helpers to sync the httpOnly session cookie with the active
// localStorage auth state. Called from auth providers (mock + Supabase).

export interface CookieSyncUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export async function setSessionCookie(user: CookieSyncUser): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: user.role || 'student',
      }),
    });
  } catch {
    // Cookie sync is best-effort; access APIs fall back to "free" state.
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch {
    /* ignore */
  }
}
