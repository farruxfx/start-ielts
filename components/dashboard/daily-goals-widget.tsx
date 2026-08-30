'use client';

import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDailyGoals, type DailyGoal } from '@/lib/daily-goals';

const typeIcons: Record<string, string> = {
  listening: '🎧',
  reading: '📖',
  writing: '✍️',
  speaking: '🎤',
  vocabulary: '📚',
  grammar: '📝',
};

export function DailyGoalsWidget() {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const state = getDailyGoals();
    setGoals(state.goals);
    setCompletedCount(state.goals.filter(g => g.completed).length);
  }, []);

  const percentage = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Kunlik maqsadlar</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {completedCount}/{goals.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Goals list */}
      <div className="space-y-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
              goal.completed ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-muted/50'
            )}
          >
            <span className="text-sm">{typeIcons[goal.type]}</span>
            <span className={cn('flex-1', goal.completed && 'line-through text-muted-foreground')}>
              {goal.title}
            </span>
            {goal.completed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
            )}
          </div>
        ))}
      </div>

      {percentage === 100 && (
        <div className="mt-3 rounded-lg bg-green-50 p-2 text-center text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
          🎉 Barcha maqsadlar bajarildi!
        </div>
      )}
    </div>
  );
}
