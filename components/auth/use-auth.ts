'use client';

import { useAuth as useSupabaseAuth } from '@/components/auth/auth-provider';
import { useMockAuth } from '@/components/auth/mock-auth-provider';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Unified auth hook that automatically uses Supabase or mock auth
 * based on whether Supabase is configured.
 */
export function useAuth() {
  const supabaseAuth = useSupabaseAuth();
  const mockAuth = useMockAuth();

  // When Supabase is not configured, use mock auth
  if (!isSupabaseConfigured) {
    return {
      user: mockAuth.user,
      session: mockAuth.session,
      loading: mockAuth.loading,
      role: mockAuth.role,
      signIn: mockAuth.signIn,
      signUp: mockAuth.signUp,
      signOut: mockAuth.signOut,
    };
  }

  // When Supabase is configured, use Supabase auth
  return supabaseAuth;
}
