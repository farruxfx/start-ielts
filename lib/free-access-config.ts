// ═══════════════════════════════════════════════════════════════════════
//  FREE ACCESS CONFIG — admin-manageable free content (server-safe)
//
//  Backed by the Supabase `app_free_access` key/value table (editable from
//  the admin panel without a redeploy). Falls back to the static defaults
//  in lib/test-access.ts when Supabase is not configured.
//
//  Existing rows:
//    key='mock_exam' → value=JSON array of free mock exam ids (e.g. ["mock-1"])
// ═══════════════════════════════════════════════════════════════════════

export interface FreeAccessConfig {
  freeMockIds: string[] | null; // null = use defaults
}

export function isSupabaseConfiguredForFreeAccess(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

async function getServiceClient(): Promise<any | null> {
  if (!isSupabaseConfiguredForFreeAccess()) return null;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch {
    return null;
  }
}

export async function getFreeAccessConfig(): Promise<FreeAccessConfig> {
  const client = await getServiceClient();
  if (!client) return { freeMockIds: null };
  try {
    const { data } = await client
      .from('app_free_access')
      .select('key, value')
      .eq('key', 'mock_exam')
      .maybeSingle();
    if (data && Array.isArray(data.value)) {
      return { freeMockIds: data.value.map(String) };
    }
  } catch {
    /* fall through */
  }
  return { freeMockIds: null };
}

export async function saveFreeAccessConfig(config: FreeAccessConfig): Promise<boolean> {
  const client = await getServiceClient();
  if (!client) return false;
  try {
    if (config.freeMockIds !== null) {
      const { error } = await client.from('app_free_access').upsert(
        {
          key: 'mock_exam',
          value: config.freeMockIds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' },
      );
      return !error;
    }
    return true;
  } catch {
    return false;
  }
}
