'use client';

import { useState, useEffect } from 'react';
import { Target, BookOpen, Clock, Award } from 'lucide-react';

interface StudyPlan {
  targetBand: string;
  focusSkills: string[];
  currentLevel: string;
  studyHours: string;
  examType: string;
}

const skillLabels: Record<string, string> = {
  reading: '📖 Reading',
  listening: '🎧 Listening',
  writing: '✍️ Writing',
  speaking: '🎤 Speaking',
};

const levelLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  'upper-intermediate': 'Upper Int.',
  advanced: 'Advanced',
};

function getStudyPlan(): StudyPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const targetBand = localStorage.getItem('ieltspro_target_band');
    if (!targetBand) return null;
    return {
      targetBand,
      focusSkills: JSON.parse(localStorage.getItem('ieltspro_focus_skills') || '[]'),
      currentLevel: localStorage.getItem('ieltspro_current_level') || '',
      studyHours: localStorage.getItem('ieltspro_study_hours') || '',
      examType: localStorage.getItem('ieltspro_exam_type') || '',
    };
  } catch {
    return null;
  }
}

export function StudyPlanCard() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  useEffect(() => {
    setPlan(getStudyPlan());
  }, []);

  if (!plan) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5 p-6">
      <h3 className="font-semibold text-primary">🎯 Sizning o&apos;quv rejangiz</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-background/50 p-3 text-center">
          <Target className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Target Band</p>
          <p className="text-lg font-bold">{plan.targetBand}</p>
        </div>
        <div className="rounded-lg bg-background/50 p-3 text-center">
          <BookOpen className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Level</p>
          <p className="text-lg font-bold">{levelLabels[plan.currentLevel] || '—'}</p>
        </div>
        <div className="rounded-lg bg-background/50 p-3 text-center">
          <Clock className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Daily Study</p>
          <p className="text-lg font-bold">{plan.studyHours ? `${plan.studyHours}m` : '—'}</p>
        </div>
        <div className="rounded-lg bg-background/50 p-3 text-center">
          <Award className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground">Exam Type</p>
          <p className="text-lg font-bold capitalize">{plan.examType || '—'}</p>
        </div>
      </div>
      {plan.focusSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {plan.focusSkills.map((s) => (
            <span key={s} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {skillLabels[s] || s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
