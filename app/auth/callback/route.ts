// OAuth callback: exchange the code, then route New vs Existing users.
// New users (no profile row yet) are sent to /onboarding so the Google
// signup flow shows the preference wizard — previously they were always
// bounced to /dashboard and never saw it.

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = createRouteClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: userData } = await supabase.auth.getUser();

      let destination = next || '/dashboard';

      try {
        const user = userData?.user;
        if (user) {
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          // Brand-new user (no profile row) → onboarding wizard + profile row
          if (!existing) {
            destination = '/onboarding';
            try {
              await supabase.from('profiles').insert({
                id: user.id,
                email: user.email || '',
                full_name:
                  (user.user_metadata?.name as string) ||
                  (user.user_metadata?.full_name as string) ||
                  '',
                avatar_url: (user.user_metadata?.avatar_url as string) || null,
                role: 'student',
              });
            } catch {
              // Insert may fail under RLS if the policy is stricter —
              // destination still routes to onboarding.
            }
          }
        }
      } catch {
        // profile check failed — keep the default destination
      }

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_callback_error`);
}
