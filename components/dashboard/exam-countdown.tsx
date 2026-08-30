'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExamCountdown() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [examDate, setExamDate] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('ieltspro_exam_date') ||
                   JSON.parse(localStorage.getItem('ieltspro_settings') || '{}').examDate;
    if (!stored) return;

    setExamDate(stored);
    const diff = Math.ceil((new Date(stored).getTime() - Date.now()) / 86400000);
    setDaysLeft(Math.max(0, diff));
  }, []);

  if (daysLeft === null) return null;

  const urgency = daysLeft <= 7 ? 'critical' : daysLeft <= 30 ? 'warning' : 'normal';

  return (
    <div className={cn(
      'rounded-2xl border p-5',
      urgency === 'critical' && 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
      urgency === 'warning' && 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30',
      urgency === 'normal' && 'border-border bg-card'
    )}>
      <div className="flex items-center gap-2">
        <Calendar className={cn(
          'h-5 w-5',
          urgency === 'critical' ? 'text-red-500' : urgency === 'warning' ? 'text-yellow-500' : 'text-primary'
        )} />
        <h3 className="font-semibold">Imtihon sanasi</h3>
      </div>

      <div className="mt-4 text-center">
        <div className={cn(
          'text-5xl font-bold tabular-nums',
          urgency === 'critical' ? 'text-red-500' : urgency === 'warning' ? 'text-yellow-600' : 'text-primary'
        )}>
          {daysLeft}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">kun qoldi</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date(examDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {urgency === 'critical' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-100 p-2 text-xs text-red-600 dark:bg-red-900/30">
          <AlertTriangle className="h-3 w-3" />
          Tezroq tayyorlaning — imtihonga oz qoldi!
        </div>
      )}

      {urgency === 'warning' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-100 p-2 text-xs text-yellow-600 dark:bg-yellow-900/30">
          <Clock className="h-3 w-3" />
          Tayyorgarlikni tezlashtiring!
        </div>
      )}
    </div>
  );
}
