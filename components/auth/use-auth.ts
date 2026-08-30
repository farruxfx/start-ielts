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
 * Unified auth hook that automatically uses Supabase or mock auth
 * based on whether Supabase is configured.
 */
export function useAuth(): UnifiedAuth {
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
      signInWithGoogle: mockAuth.signInWithGoogle,
      signOut: mockAuth.signOut,
    };
  }

  // When Supabase is configured, use Supabase auth
  const supabaseGoogleSignIn = async (_googleUser?: GoogleUserInfo) => {
    return supabaseAuth.signInWithGoogle();
  };

  return {
    ...supabaseAuth,
    signInWithGoogle: supabaseGoogleSignIn,
  };
}
