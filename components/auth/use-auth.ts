'use client';

import { useAuth as useSupabaseAuth } from '@/components/auth/auth-provider';
import { useMockAuth } from '@/components/auth/mock-auth-provider';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { GoogleUserInfo } from '@/lib/google-auth';

export interface UnifiedAuth {
  user: any;
  session: any;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (googleUser?: GoogleUserInfo) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

/**
 * Unified auth hook. Both providers are always mounted in the tree,
 * so we always call both hooks (same order every render).
 * We pick the active one via the config flag.
 */
export function useAuth(): UnifiedAuth {
  // IMPORTANT: Always call both hooks (same order) to satisfy rules of hooks
  const supabaseAuth = useSupabaseAuth();
  const mockAuth = useMockAuth();

  // When Supabase is not configured, use mock auth directly
  if (!isSupabaseConfigured) {
    return {
      user: mockAuth.user,
      session: mockAuth.session,
      loading: mockAuth.loading,
      role: mockAuth.role,
      signIn: mockAuth.signIn,
      signUp: mockAuth.signUp,
      signInWithGoogle: mockAuth.signInWithGoogle,
      signOut: mockAuth.signOut,
    };
  }

  // Helper: run a promise with a timeout so fallback can kick in
  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), ms)),
    ]);

  const TIMEOUT_MS = 3000;

  // When Supabase is configured, try Supabase auth with mock fallback
  const signIn = async (email: string, password: string) => {
    try {
      const result = await withTimeout(supabaseAuth.signIn(email, password), TIMEOUT_MS);
      if (result.error) {
        return mockAuth.signIn(email, password);
      }
      return result;
    } catch {
      return mockAuth.signIn(email, password);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await withTimeout(supabaseAuth.signUp(email, password, name), TIMEOUT_MS);
      if (result.error) {
        return mockAuth.signUp(email, password, name);
      }
      return result;
    } catch {
      return mockAuth.signUp(email, password, name);
    }
  };

  const signInWithGoogle = async (googleUser?: GoogleUserInfo) => {
    try {
      const result = await withTimeout(supabaseAuth.signInWithGoogle(), TIMEOUT_MS);
      if (result.error) {
        return mockAuth.signInWithGoogle(googleUser);
      }
      return result;
    } catch {
      return mockAuth.signInWithGoogle(googleUser);
    }
  };

  const signOut = async () => {
    try { await supabaseAuth.signOut(); } catch { /* ignore */ }
    try { await mockAuth.signOut(); } catch { /* ignore */ }
  };

  // Use mock auth's user/session/role if Supabase has none
  // (Supabase isn't connecting, so mock auth is the active session)
  const activeUser = supabaseAuth.user ?? mockAuth.user;
  const activeSession = supabaseAuth.session ?? mockAuth.session;
  const activeRole = supabaseAuth.role ?? mockAuth.role;
  const activeLoading = supabaseAuth.loading && mockAuth.loading;

  return {
    user: activeUser,
    session: activeSession,
    loading: activeLoading,
    role: activeRole,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };
}
