'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Headphones, BookOpen, PenLine, Mic, TrendingUp, Target, Clock, ArrowRight } from 'lucide-react';
import { bandToLevel, bandToDescription } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function MockExamResultPage() {
  const sp = useSearchParams();
  const listening = parseFloat(sp.get('listening') || '0');
  const reading = parseFloat(sp.get('reading') || '0');
  const writing = parseFloat(sp.get('writing') || '0');
  const speaking = parseFloat(sp.get('speaking') || '0');
  const overall = parseFloat(sp.get('overall') || '0');
  const lr = parseInt(sp.get('lr') || '0');
  const lt = parseInt(sp.get('lt') || '0');
  const rr = parseInt(sp.get('rt') || '0');
  const rt = parseInt(sp.get('rt') || '0');
  const wc1 = parseInt(sp.get('wc1') || '0');
  const wc2 = parseInt(sp.get('wc2') || '0');

  const skills = [
    { name: 'Listening', band: listening, icon: Headphones, color: 'text-green-600', raw: `${lr}/${lt}` },
    { name: 'Reading', band: reading, icon: BookOpen, color: 'text-blue-600', raw: `${rr}/${rt}` },
    { name: 'Writing', band: writing, icon: PenLine, color: 'text-orange-600', raw: `${wc1}+${wc2} words` },
    { name: 'Speaking', band: speaking, icon: Mic, color: 'text-purple-600', raw: 'Estimated' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Mock Result</h1>
        <p className="mt-2 text-muted-foreground">Here is your estimated IELTS band score breakdown.</p>
      </div>

      {/* Overall band */}
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-card p-8 text-center">
        <div className="text-sm font-medium text-muted-foreground">Overall Band Score</div>
        <div className="mt-2 text-6xl font-bold text-primary">{overall.toFixed(1)}</div>
        <div className="mt-2 text-sm font-medium">{bandToLevel(overall)}</div>
        <p className="mt-3 text-xs text-muted-foreground">{bandToDescription(overall)}</p>
        <div className="mt-4 rounded-lg bg-warning/10 p-3 text-xs text-warning">
          This is an estimated score, not an official IELTS result.
        </div>
      </div>

      {/* Skill breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((s) => (
          <div key={s.name} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <s.icon className={cn('h-6 w-6', s.color)} />
              <span className="text-sm font-medium">{s.name}</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{s.band.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">{s.raw}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(s.band / 9) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Raw scores */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold">Detailed Breakdown</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Listening correct answers</span>
            <span className="font-medium">{lr} out of {lt}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Reading correct answers</span>
            <span className="font-medium">{rr} out of {rt}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">Writing Task 1 word count</span>
            <span className={cn('font-medium', wc1 < 150 ? 'text-destructive' : 'text-success')}>{wc1} words</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Writing Task 2 word count</span>
            <span className={cn('font-medium', wc2 < 250 ? 'text-destructive' : 'text-success')}>{wc2} words</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/mock-exam/history">
          <Button variant="outline">View History</Button>
        </Link>
        <Link href="/mock-exam">
          <Button variant="outline">Take Another Exam</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
}
