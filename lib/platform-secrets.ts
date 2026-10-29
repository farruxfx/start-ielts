// ═══════════════════════════════════════════════════════════════════════
//  PLATFORM SECRETS — admin-managed API credentials (Groq, etc.)
//
//  Values are stored in the `platform_secrets` Supabase table (service-role
//  only, RLS denies every client read) and edited through the admin panel.
//  Nothing is hard-coded in the repository. When Supabase is not configured
//  (demo mode) we fall back to environment variables.
// ═══════════════════════════════════════════════════════════════════════

import { isSupabaseConfigured } from './supabase';

export type PlatformSecretKey = 'groq_api_key';

async function getServiceClient(): Promise<any | null> {
  if (!isSupabaseConfigured) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

export async function getPlatformSecret(key: PlatformSecretKey): Promise<string | null> {
  if (isSupabaseConfigured) {
    const client = await getServiceClient();
    try {
      const { data } = await client
        ?.from('platform_secrets')
        .select('value, enabled')
        .eq('key', key)
        .maybeSingle();
      if (data?.value && data?.enabled) return String(data.value);
    } catch { /* fall through */ }
  }
  // Env fallback (demo mode / bootstrap)
  if (key === 'groq_api_key') return process.env.GROQ_API_KEY || null;
  return null;
}

export function maskSecret(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '••••';
  return value.slice(0, 4) + '••••' + value.slice(-4);
}

export async function getGroqApiKey(): Promise<string | null> {
  const fromDb = await getPlatformSecret('groq_api_key');
  if (fromDb) return fromDb;
  return process.env.GROQ_API_KEY || null;
}
