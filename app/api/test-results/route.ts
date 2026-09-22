import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// GET /api/test-results — Get user's test results
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const limit = parseInt(searchParams.get('limit') || '50');
    
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

    // Fetch from database
    if (isSupabaseConfigured) {
      let query = supabase
        .from('test_results')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (skill) {
        query = query.eq('skill', skill);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Test results fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // localStorage fallback
    const storedResults = localStorage.getItem('ieltspro_test_results');
    let results = storedResults ? JSON.parse(storedResults) : [];
    
    if (skill) {
      results = results.filter((r: { skill: string }) => r.skill === skill);
    }
    
    results = results.slice(0, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Test results API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// POST /api/test-results — Add a new test result
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['test_id', 'test_title', 'skill', 'overall_band'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Validate skill
    const validSkills = ['reading', 'listening', 'writing', 'speaking', 'mock'];
    if (!validSkills.includes(body.skill)) {
      return NextResponse.json({ error: 'Invalid skill value' }, { status: 400 });
    }

    // Validate band score
    if (typeof body.overall_band !== 'number' || body.overall_band < 0 || body.overall_band > 9) {
      return NextResponse.json({ error: 'Invalid band score' }, { status: 400 });
    }

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

    const newResult = {
      user_id: userId,
      test_id: body.test_id,
      test_title: body.test_title,
      skill: body.skill,
      overall_band: body.overall_band,
      correct_answers: body.correct_answers || 0,
      total_questions: body.total_questions || 0,
      accuracy: body.accuracy || 0,
      time_spent_minutes: body.time_spent_minutes || 0,
      answers: body.answers || null,
      completed_at: new Date().toISOString(),
    };

    // Insert into database
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('test_results')
        .insert(newResult)
        .select()
        .single();

      if (error) {
        console.error('Test result insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 201 });
    }

    // localStorage fallback
    const storedResults = localStorage.getItem('ieltspro_test_results');
    const results = storedResults ? JSON.parse(storedResults) : [];
    
    const resultWithId = {
      ...newResult,
      id: crypto.randomUUID(),
    };
    
    results.push(resultWithId);
    localStorage.setItem('ieltspro_test_results', JSON.stringify(results));

    return NextResponse.json(resultWithId, { status: 201 });
  } catch (error) {
    console.error('Test results API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
