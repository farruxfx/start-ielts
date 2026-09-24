'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/use-auth';
import { GraduationCap, ArrowRight, ArrowLeft, Target, BookOpen, Calendar, Clock, Brain, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingData {
  targetBand: string;
  focusSkills: string[];
  examDate: string;
  currentLevel: string;
  studyHours: string;
  examType: string;
}

const steps = [
  { id: 1, title: 'Target Band', icon: Target, description: 'Which IELTS band score are you aiming for?' },
  { id: 2, title: 'Focus Skills', icon: BookOpen, description: 'Which skills do you want to improve most?' },
  { id: 3, title: 'Exam Date', icon: Calendar, description: 'When is your IELTS exam?' },
  { id: 4, title: 'Current Level', icon: Brain, description: 'What is your current English level?' },
  { id: 5, title: 'Study Time', icon: Clock, description: 'How much time can you study daily?' },
  { id: 6, title: 'Exam Type', icon: Award, description: 'Which IELTS exam are you taking?' },
];

const bandOptions = ['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'];

const skillOptions = [
  { id: 'reading', label: 'Reading', emoji: '📖', description: 'Passage comprehension & analysis' },
  { id: 'listening', label: 'Listening', emoji: '🎧', description: 'Audio understanding & note-taking' },
  { id: 'writing', label: 'Writing', emoji: '✍️', description: 'Essay structure & grammar' },
  { id: 'speaking', label: 'Speaking', emoji: '🎤', description: 'Fluency & pronunciation' },
];

const levelOptions = [
  { id: 'beginner', label: 'Beginner', description: 'A1-A2: Basic English skills' },
  { id: 'intermediate', label: 'Intermediate', description: 'B1-B2: Good everyday English' },
  { id: 'upper-intermediate', label: 'Upper Intermediate', description: 'B2+: Strong English, need IELTS prep' },
  { id: 'advanced', label: 'Advanced', description: 'C1-C2: Excellent English, polishing skills' },
];

const studyOptions = [
  { id: '30', label: '30 min', description: 'Quick daily practice' },
  { id: '60', label: '1 hour', description: 'Focused study session' },
  { id: '120', label: '2 hours', description: 'Comprehensive practice' },
  { id: '180', label: '3+ hours', description: 'Intensive preparation' },
];

const examTypeOptions = [
  { id: 'academic', label: 'Academic', description: 'For university admission' },
  { id: 'general', label: 'General Training', description: 'For work/migration' },
];

const STORAGE_KEY = 'ieltspro_onboarding';

function getOnboardingData(): OnboardingData | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveOnboardingData(data: OnboardingData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Also save to user profile
  localStorage.setItem('ieltspro_target_band', data.targetBand);
  localStorage.setItem('ieltspro_exam_type', data.examType);
  localStorage.setItem('ieltspro_focus_skills', JSON.stringify(data.focusSkills));
  localStorage.setItem('ieltspro_current_level', data.currentLevel);
  localStorage.setItem('ieltspro_study_hours', data.studyHours);
  if (data.examDate) {
    localStorage.setItem('ieltspro_exam_date', data.examDate);
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    targetBand: '',
    focusSkills: [],
    examDate: '',
    currentLevel: '',
    studyHours: '',
    examType: '',
  });

  useEffect(() => {
    // Check if onboarding already completed
    const existing = getOnboardingData();
    if (existing && existing.targetBand) {
      router.push('/dashboard');
    }
  }, [router]);

  const updateData = (partial: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...partial }));
  };

  const toggleSkill = (skillId: string) => {
    setData(prev => {
      const skills = prev.focusSkills.includes(skillId)
        ? prev.focusSkills.filter(s => s !== skillId)
        : [...prev.focusSkills, skillId];
      return { ...prev, focusSkills: skills };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.targetBand !== '';
      case 2: return data.focusSkills.length > 0;
      case 3: return true; // Optional
      case 4: return data.currentLevel !== '';
      case 5: return data.studyHours !== '';
      case 6: return data.examType !== '';
      default: return false;
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    saveOnboardingData(data);
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/dashboard');
  };

  const progress = (step / 6) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold">StartIELTS</span>
          </div>
          <span className="text-sm text-muted-foreground">{step}/6</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    step === s.id
                      ? 'bg-primary text-primary-foreground scale-110'
                      : step > s.id
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {(() => {
                  const Icon = steps[step - 1].icon;
                  return <Icon className="h-6 w-6 text-primary" />;
                })()}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{steps[step - 1].title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{steps[step - 1].description}</p>
            </div>

            {/* Step 1: Target Band */}
            {step === 1 && (
              <div className="grid grid-cols-3 gap-3">
                {bandOptions.map(band => (
                  <button
                    key={band}
                    onClick={() => updateData({ targetBand: band })}
                    className={cn(
                      'rounded-xl border-2 p-4 text-center transition-all hover:shadow-md',
                      data.targetBand === band
                        ? 'border-primary bg-primary/10 text-primary shadow-md'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-2xl font-bold">{band}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Focus Skills */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {skillOptions.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                      data.focusSkills.includes(skill.id)
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-2xl">{skill.emoji}</span>
                    <p className="mt-2 font-semibold">{skill.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{skill.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Exam Date */}
            {step === 3 && (
              <div className="space-y-4">
                <input
                  type="date"
                  value={data.examDate}
                  onChange={(e) => updateData({ examDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-center text-sm text-muted-foreground">
                  This helps us create a study plan for you. You can skip this step.
                </p>
              </div>
            )}

            {/* Step 4: Current Level */}
            {step === 4 && (
              <div className="space-y-3">
                {levelOptions.map(level => (
                  <button
                    key={level.id}
                    onClick={() => updateData({ currentLevel: level.id })}
                    className={cn(
                      'w-full rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                      data.currentLevel === level.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <p className="font-semibold">{level.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Study Time */}
            {step === 5 && (
              <div className="grid grid-cols-2 gap-3">
                {studyOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => updateData({ studyHours: option.id })}
                    className={cn(
                      'rounded-xl border-2 p-4 text-center transition-all hover:shadow-md',
                      data.studyHours === option.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span className="text-lg font-bold">{option.label}</span>
                    <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Exam Type */}
            {step === 6 && (
              <div className="space-y-3">
                {examTypeOptions.map(type => (
                  <button
                    key={type.id}
                    onClick={() => updateData({ examType: type.id })}
                    className={cn(
                      'w-full rounded-xl border-2 p-5 text-left transition-all hover:shadow-md',
                      data.examType === type.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <p className="text-lg font-semibold">{type.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(prev => prev - 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <Button
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={!canProceed()}
                >
                  {step === 3 ? 'Skip' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-violet-600"
                >
                  {loading ? 'Setting up...' : 'Start Learning 🚀'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
