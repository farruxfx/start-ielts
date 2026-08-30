'use client';

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredAchievements, type StoredAchievement } from '@/lib/store';

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'a1', title: 'First Step', description: 'First test completed', icon: '🎯', requirement: '1 test' },
  { id: 'a2', title: '7.0 Club', description: 'Score 7.0 or higher', icon: '⭐', requirement: 'Band 7.0' },
  { id: 'a3', title: '7.5 Achiever', description: 'Score 7.5 or higher', icon: '🌟', requirement: 'Band 7.5' },
  { id: 'a4', title: '8.0 Master', description: 'Score 8.0 or higher', icon: '👑', requirement: 'Band 8.0' },
  { id: 'a5', title: '10 Tests', description: 'Complete 10 tests', icon: '📝', requirement: '10 tests' },
  { id: 'a6', title: '30 Day Streak', description: '30 day learning streak', icon: '🔥', requirement: '30 days' },
  { id: 'a7', title: '100 Questions', description: 'Answer 100 questions', icon: '💯', requirement: '100 Q' },
  { id: 'a8', title: 'Perfect Listening', description: '100% on listening test', icon: '🎧', requirement: '100%' },
  { id: 'a9', title: 'Perfect Reading', description: '100% on reading test', icon: '📖', requirement: '100%' },
  { id: 'a10', title: 'Writing Star', description: 'Complete 5 writing tasks', icon: '✍️', requirement: '5 tasks' },
  { id: 'a11', title: 'Speaking Pro', description: 'Complete 5 speaking practices', icon: '🎤', requirement: '5 practices' },
  { id: 'a12', title: 'Mock Master', description: 'Complete 3 mock exams', icon: '🏆', requirement: '3 mocks' },
];

export function AchievementsWidget() {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    const stored = getStoredAchievements();
    setUnlocked(stored.filter(a => a.unlocked).map(a => a.id));
  }, []);

  const unlockedCount = unlocked.length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <h3 className="text-sm font-semibold">Yutuqlar</h3>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {unlockedCount}/{totalCount}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-yellow-500 transition-all duration-500"
          style={{ width: `${Math.round((unlockedCount / totalCount) * 100)}%` }}
        />
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-4 gap-2">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={cn(
                'flex flex-col items-center rounded-lg p-2 text-center transition-all',
                isUnlocked
                  ? 'bg-yellow-50 dark:bg-yellow-900/20'
                  : 'bg-muted/30 opacity-40 grayscale'
              )}
              title={ach.description}
            >
              <span className="text-xl">{ach.icon}</span>
              <span className="mt-1 text-[9px] font-medium leading-tight text-muted-foreground">
                {ach.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
