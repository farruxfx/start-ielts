import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server-side use (API routes, Server Components).
 * Uses cookies for session management.
 */
export function createRouteClient() {
  const cookieStore = cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: false,
      },
      global: {
        headers: {
          'x-my-custom-header': 'startielts',
        },
      },
    }
  );
}
