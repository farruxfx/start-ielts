import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// GET /api/vocabulary — Get user's vocabulary words
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
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
        .from('vocabulary_words')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Vocabulary fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data || []);
    }

    // localStorage fallback
    const storedWords = localStorage.getItem('ieltspro_vocabulary');
    let words = storedWords ? JSON.parse(storedWords) : [];
    
    if (category) {
      words = words.filter((w: { category: string }) => w.category === category);
    }
    
    words = words.slice(0, limit);
    return NextResponse.json(words);
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// POST /api/vocabulary — Add a new vocabulary word
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.word || body.word.trim() === '') {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
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

    const newWord = {
      user_id: userId,
      word: body.word.trim(),
      definition: body.definition || '',
      example: body.example || '',
      synonyms: body.synonyms || [],
      word_family: body.word_family || null,
      difficulty: body.difficulty || 'medium',
      category: body.category || 'general',
      mastery_level: 0,
      next_review_at: null,
      created_at: new Date().toISOString(),
    };

    // Insert into database
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('vocabulary_words')
        .insert(newWord)
        .select()
        .single();

      if (error) {
        console.error('Vocabulary insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data, { status: 201 });
    }

    // localStorage fallback
    const storedWords = localStorage.getItem('ieltspro_vocabulary');
    const words = storedWords ? JSON.parse(storedWords) : [];
    
    const wordWithId = {
      ...newWord,
      id: crypto.randomUUID(),
    };
    
    words.push(wordWithId);
    localStorage.setItem('ieltspro_vocabulary', JSON.stringify(words));

    return NextResponse.json(wordWithId, { status: 201 });
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/vocabulary — Delete a vocabulary word
// ============================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wordId = searchParams.get('id');
    
    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
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

    // Delete from database
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('vocabulary_words')
        .delete()
        .eq('id', wordId)
        .eq('user_id', userId);

      if (error) {
        console.error('Vocabulary delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // localStorage fallback
    const storedWords = localStorage.getItem('ieltspro_vocabulary');
    if (storedWords) {
      const words = JSON.parse(storedWords);
      const filteredWords = words.filter((w: { id: string }) => w.id !== wordId);
      localStorage.setItem('ieltspro_vocabulary', JSON.stringify(filteredWords));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
