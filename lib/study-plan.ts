/**
 * Study Plan Generator — creates personalized 30-day study plans
 */

export interface StudyPlanDay {
  day: number;
  date: string;
  focus: string;
  tasks: { task: string; minutes: number; completed: boolean }[];
  totalMinutes: number;
}

export interface StudyPlan {
  id: string;
  name: string;
  targetBand: string;
  currentLevel: string;
  dailyMinutes: number;
  focusSkills: string[];
  days: StudyPlanDay[];
  createdAt: string;
}

const STORAGE_KEY = 'ieltspro_study_plan';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const taskBank: Record<string, { task: string; minutes: number }[]> = {
  reading: [
    { task: 'Read an academic passage', minutes: 20 },
    { task: 'Practice True/False/Not Given', minutes: 15 },
    { task: 'Practice matching headings', minutes: 15 },
    { task: 'Skim & scan practice', minutes: 10 },
    { task: 'Speed reading drill', minutes: 10 },
    { task: 'Vocabulary from passage', minutes: 10 },
  ],
  listening: [
    { task: 'Complete a listening section', minutes: 20 },
    { task: 'Practice note-taking from audio', minutes: 15 },
    { task: 'Dictation exercise', minutes: 10 },
    { task: 'Listening for specific info', minutes: 15 },
    { task: 'Podcast comprehension', minutes: 15 },
  ],
  writing: [
    { task: 'Write Task 1 (chart/graph)', minutes: 20 },
    { task: 'Write Task 2 essay', minutes: 30 },
    { task: 'Practice linking words', minutes: 10 },
    { task: 'Grammar drill (complex sentences)', minutes: 15 },
    { task: 'Vocabulary for writing', minutes: 10 },
    { task: 'Review & self-edit essay', minutes: 15 },
  ],
  speaking: [
    { task: 'Part 1 practice (3 min)', minutes: 10 },
    { task: 'Part 2 cue card (2 min talk)', minutes: 15 },
    { task: 'Part 3 discussion practice', minutes: 15 },
    { task: 'Pronunciation drills', minutes: 10 },
    { task: 'Fluency speaking (no pauses)', minutes: 10 },
  ],
};

const focusRotation = ['reading', 'listening', 'writing', 'speaking'];

export function generateStudyPlan(): StudyPlan {
  const targetBand = localStorage.getItem('ieltspro_target_band') || '7.0';
  const currentLevel = localStorage.getItem('ieltspro_current_level') || 'intermediate';
  const studyHours = localStorage.getItem('ieltspro_study_hours') || '60';
  const focusSkills = JSON.parse(localStorage.getItem('ieltspro_focus_skills') || '["reading","listening","writing","speaking"]');

  const dailyMinutes = parseInt(studyHours) || 60;
  const days: StudyPlanDay[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Rotate focus skill
    const focusSkill = focusSkills[i % focusSkills.length] || focusRotation[i % 4];
    const availableTasks = taskBank[focusSkill] || taskBank.reading;

    // Select tasks that fit in daily time
    let remainingMinutes = dailyMinutes;
    const tasks: StudyPlanDay['tasks'] = [];

    for (const task of availableTasks) {
      if (remainingMinutes <= 0) break;
      if (task.minutes <= remainingMinutes) {
        tasks.push({ ...task, completed: false });
        remainingMinutes -= task.minutes;
      }
    }

    // Add vocabulary if time remains
    if (remainingMinutes >= 10) {
      tasks.push({ task: 'Review vocabulary (SRS)', minutes: 10, completed: false });
      remainingMinutes -= 10;
    }

    days.push({
      day: i + 1,
      date: dateStr,
      focus: focusSkill,
      tasks,
      totalMinutes: dailyMinutes - remainingMinutes,
    });
  }

  const plan: StudyPlan = {
    id: crypto.randomUUID(),
    name: `30-Day ${targetBand} Band Plan`,
    targetBand,
    currentLevel,
    dailyMinutes,
    focusSkills,
    days,
    createdAt: new Date().toISOString(),
  };

  safeSet(STORAGE_KEY, plan);
  return plan;
}

export function getStudyPlan(): StudyPlan | null {
  return safeGet<StudyPlan | null>(STORAGE_KEY, null);
}

export function completeTask(dayIndex: number, taskIndex: number): void {
  const plan = getStudyPlan();
  if (!plan) return;
  if (plan.days[dayIndex]?.tasks[taskIndex]) {
    plan.days[dayIndex].tasks[taskIndex].completed = true;
    safeSet(STORAGE_KEY, plan);
  }
}

export function getTodayPlan(): StudyPlanDay | null {
  const plan = getStudyPlan();
  if (!plan) return null;
  const today = new Date().toISOString().split('T')[0];
  return plan.days.find(d => d.date === today) || plan.days[0] || null;
}
