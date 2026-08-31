'use client';

import { type ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { AuthProvider } from '@/components/auth/auth-provider';
import { MockAuthProvider } from '@/components/auth/mock-auth-provider';

/**
 * Client-side providers wrapper.
 * Both providers are always mounted — use-auth.ts picks the right one
 * based on isSupabaseConfigured, but React hooks must always be called
 * in the same order, so both contexts must exist.
 */
export function Providers({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) {
    return (
      <MockAuthProvider>
        <AuthProvider>{children}</AuthProvider>
      </MockAuthProvider>
    );
  }
  return (
    <MockAuthProvider>
      <AuthProvider>{children}</AuthProvider>
    </MockAuthProvider>
  );
}
