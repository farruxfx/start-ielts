'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Calendar, ArrowRight, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/use-auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface MockResult {
  id: string;
  overall_band: number;
  listening_band: number;
  reading_band: number;
  writing_band: number;
  speaking_band: number;
  created_at: string;
}

export default function MockExamHistoryPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<MockResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetBand, setTargetBand] = useState(7.5);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('target_band')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.target_band) setTargetBand(parseFloat(profile.target_band));

      const { data } = await supabase
        .from('mock_results')
        .select('id, overall_band, listening_band, reading_band, writing_band, speaking_band, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      setResults(data || []);
      setLoading(false);
    })();
  }, [user]);

  const chartData = results.map((r, i) => ({
    name: `Mock ${i + 1}`,
    band: r.overall_band,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mock Exam History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your progress across all mock exams.</p>
      </div>

      {/* Score trend */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Score Trend</h3>
              <p className="text-sm text-muted-foreground">Overall band progression with target line</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[4, 9]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} ticks={[4, 5, 6, 7, 8, 9]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '13px' }} />
                <ReferenceLine y={targetBand} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: `Target ${targetBand}`, position: 'right', fontSize: 11 }} />
                <Line type="monotone" dataKey="band" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History list */}
      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">No mock exams completed yet.</p>
          <Link href="/mock-exam" className="mt-4">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Take your first mock exam
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {[...results].reverse().map((r, i) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {r.overall_band.toFixed(1)}
                </div>
                <div>
                  <div className="font-medium">Mock #{results.length - i}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="hidden gap-4 text-sm sm:flex">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">L</div>
                  <div className="font-medium">{r.listening_band?.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">R</div>
                  <div className="font-medium">{r.reading_band?.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">W</div>
                  <div className="font-medium">{r.writing_band?.toFixed(1)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">S</div>
                  <div className="font-medium">{r.speaking_band?.toFixed(1)}</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
