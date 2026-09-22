import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// GET /api/profile — Get current user's profile
// ============================================================
export async function GET() {
  try {
    let userId: string | null = null;
    let userData: { id: string; email?: string; name?: string } | null = null;

    if (isSupabaseConfigured) {
      const supabaseClient = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      userId = session.user.id;
      userData = session.user;
    } else {
      // Mock auth fallback
      if (typeof window === 'undefined') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const mockUser = localStorage.getItem('ieltspro_current_user');
      if (!mockUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const parsed = JSON.parse(mockUser);
      userId = parsed.id;
      userData = { id: parsed.id, email: parsed.email, name: parsed.name };
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile from database
    let profile = null;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
      }
      profile = data;
    }

    // Fallback to localStorage or create new profile
    if (!profile) {
      const storedProfile = localStorage.getItem('ieltspro_user_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        profile = {
          id: userId,
          name: parsed.name || userData?.name || 'Student',
          email: userData?.email || '',
          target_band: parsed.targetBand || 7.5,
          exam_date: null,
          onboarding_completed: false,
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        profile = {
          id: userId,
          name: userData?.name || 'Student',
          email: userData?.email || '',
          target_band: 7.5,
          exam_date: null,
          onboarding_completed: false,
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// PUT /api/profile — Update current user's profile
// ============================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    let userId: string | null = null;

    if (isSupabaseConfigured) {
      const supabaseClient = createRouteHandlerClient({ cookies });
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      userId = session.user.id;
    } else {
      if (typeof window === 'undefined') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const mockUser = localStorage.getItem('ieltspro_current_user');
      if (!mockUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      userId = JSON.parse(mockUser).id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    const allowedFields = ['name', 'target_band', 'exam_date', 'onboarding_completed'];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    // Update in database
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, ...updateData }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // localStorage fallback
    const storedProfile = localStorage.getItem('ieltspro_user_profile');
    const profile = storedProfile ? JSON.parse(storedProfile) : {};
    
    const updatedProfile = {
      ...profile,
      name: updateData.name || profile.name,
      targetBand: updateData.target_band || profile.targetBand,
    };
    
    localStorage.setItem('ieltspro_user_profile', JSON.stringify(updatedProfile));

    return NextResponse.json({
      id: userId,
      name: updatedProfile.name,
      email: '',
      target_band: updatedProfile.targetBand,
      exam_date: updateData.exam_date || null,
      onboarding_completed: updateData.onboarding_completed || false,
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: updateData.updated_at,
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
