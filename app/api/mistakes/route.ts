import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// GET /api/mistakes — Get user's mistakes
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skill = searchParams.get('skill');
    const limit = parseInt(searchParams.get('limit') || '100');
    
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
        .from('mistakes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (skill) {
        query = query.eq('skill', skill);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Mistakes fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // localStorage fallback
    const storedMistakes = localStorage.getItem('ieltspro_mistakes');
    let mistakes = storedMistakes ? JSON.parse(storedMistakes) : [];
    
    if (skill) {
      mistakes = mistakes.filter((m: { skill: string }) => m.skill === skill);
    }
    
    mistakes = mistakes.slice(0, limit);
    return NextResponse.json(mistakes);
  } catch (error) {
    console.error('Mistakes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// POST /api/mistakes — Add a new mistake
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.question || body.question.trim() === '') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
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

    const newMistake = {
      user_id: userId,
      question: body.question.trim(),
      your_answer: body.your_answer || '',
      correct_answer: body.correct_answer || '',
      explanation: body.explanation || '',
      category: body.category || '',
      difficulty: body.difficulty || 'medium',
      skill: body.skill || '',
      mastered: false,
      created_at: new Date().toISOString(),
    };

    // Insert into database
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('mistakes')
        .insert(newMistake)
        .select()
        .single();

      if (error) {
        console.error('Mistakes insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 201 });
    }

    // localStorage fallback
    const storedMistakes = localStorage.getItem('ieltspro_mistakes');
    const mistakes = storedMistakes ? JSON.parse(storedMistakes) : [];
    
    const mistakeWithId = {
      ...newMistake,
      id: crypto.randomUUID(),
    };
    
    mistakes.push(mistakeWithId);
    localStorage.setItem('ieltspro_mistakes', JSON.stringify(mistakes));

    return NextResponse.json(mistakeWithId, { status: 201 });
  } catch (error) {
    console.error('Mistakes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// PUT /api/mistakes — Update a mistake (mark as mastered)
// ============================================================
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Mistake ID is required' }, { status: 400 });
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

    const updateData: Record<string, unknown> = {};
    if (body.mastered !== undefined) updateData.mastered = body.mastered;

    // Update in database
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('mistakes')
        .update(updateData)
        .eq('id', body.id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Mistakes update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // localStorage fallback
    const storedMistakes = localStorage.getItem('ieltspro_mistakes');
    if (storedMistakes) {
      const mistakes = JSON.parse(storedMistakes);
      const index = mistakes.findIndex((m: { id: string }) => m.id === body.id);
      
      if (index !== -1) {
        mistakes[index] = { ...mistakes[index], ...updateData };
        localStorage.setItem('ieltspro_mistakes', JSON.stringify(mistakes));
        return NextResponse.json(mistakes[index]);
      }
    }

    return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
  } catch (error) {
    console.error('Mistakes API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
