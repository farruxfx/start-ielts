import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ============================================================
// GET /api/analytics — Get user's analytics data
// ============================================================
export async function GET() {
  try {
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

    let testResults: Array<{
      skill: string;
      overall_band: number;
      accuracy: number;
      time_spent_minutes: number;
      completed_at: string;
    }> = [];

    // Fetch test results
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('test_results')
        .select('skill, overall_band, accuracy, time_spent_minutes, completed_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Analytics fetch error:', error);
      } else {
        testResults = data || [];
      }
    } else {
      // localStorage fallback
      const storedResults = localStorage.getItem('ieltspro_test_results');
      testResults = storedResults ? JSON.parse(storedResults) : [];
    }

    // Calculate analytics
    const totalTests = testResults.length;
    
    // Skill breakdown
    const skills = ['reading', 'listening', 'writing', 'speaking'];
    const skillBands = skills.map(skill => {
      const skillResults = testResults.filter(r => r.skill === skill);
      const bestBand = skillResults.length > 0 
        ? Math.max(...skillResults.map(r => r.overall_band))
        : 0;
      const avgBand = skillResults.length > 0
        ? skillResults.reduce((a, r) => a + r.overall_band, 0) / skillResults.length
        : 0;
      
      return {
        skill,
        bestBand: Math.round(bestBand * 10) / 10,
        averageBand: Math.round(avgBand * 10) / 10,
        testCount: skillResults.length,
      };
    });

    // Overall band (average of all skills)
    const allBands = skillBands.filter(s => s.bestBand > 0).map(s => s.bestBand);
    const overallBand = allBands.length > 0
      ? Math.round((allBands.reduce((a, b) => a + b, 0) / allBands.length) * 10) / 10
      : 0;

    // Average accuracy
    const avgAccuracy = totalTests > 0
      ? Math.round(testResults.reduce((a, r) => a + r.accuracy, 0) / totalTests)
      : 0;

    // Total time spent (hours)
    const totalMinutes = testResults.reduce((a, r) => a + r.time_spent_minutes, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // Weekly activity (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyResults = testResults.filter(r => new Date(r.completed_at) >= weekAgo);
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyActivity = days.map(day => ({ day, minutes: 0 }));
    
    weeklyResults.forEach(r => {
      const date = new Date(r.completed_at);
      const dayIdx = date.getDay();
      const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      weeklyActivity[adjustedIdx].minutes += r.time_spent_minutes;
    });

    // Progress history (group by date)
    const dateMap = new Map<string, number>();
    testResults.forEach(r => {
      const date = new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap.set(date, r.overall_band);
    });
    
    const progressHistory = Array.from(dateMap.entries())
      .map(([date, overall]) => ({ date, overall }))
      .slice(-10); // Last 10 entries

    // Streak calculation
    const today = new Date().toISOString().split('T')[0];
    const streakData = { current: 0, best: 0, lastDate: '' };
    
    // Simple streak calculation
    const uniqueDates = Array.from(new Set(testResults.map(r => new Date(r.completed_at).toISOString().split('T')[0])));
    uniqueDates.sort().reverse();
    
    if (uniqueDates.length > 0) {
      streakData.lastDate = uniqueDates[0];
      
      // Calculate current streak
      let streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i]);
        const prev = new Date(uniqueDates[i + 1]);
        const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
      
      streakData.current = streak;
      streakData.best = Math.max(streak, uniqueDates.length);
    }

    // Weakest skill
    const weakestSkill = skillBands
      .filter(s => s.bestBand > 0)
      .sort((a, b) => a.bestBand - b.bestBand)[0]?.skill || 'writing';

    const analytics = {
      overallBand,
      totalTests,
      averageAccuracy: avgAccuracy,
      totalHours,
      skillBands,
      weeklyActivity,
      progressHistory,
      streak: streakData,
      weakestSkill,
      mockExamsCompleted: testResults.filter(r => r.skill === 'mock').length,
      practiceTestsCompleted: totalTests - testResults.filter(r => r.skill === 'mock').length,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
