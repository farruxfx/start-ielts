/**
 * Daily Goals tracking system for StartIELTS
 */

export interface DailyGoal {
  id: string;
  title: string;
  description: string;
  type: 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary' | 'grammar';
  target: number;
  current: number;
  completed: boolean;
  date: string;
}

export interface DailyGoalsState {
  date: string;
  goals: DailyGoal[];
  allCompleted: boolean;
}

const STORAGE_KEY = 'ieltspro_daily_goals';

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

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function generateDailyGoals(): DailyGoal[] {
  const goals: DailyGoal[] = [
    {
      id: 'g1',
      title: '1 ta Listening mashqini yakunlang',
      description: 'Listening bo\'yicha 1 ta testni to\'liq ishlang',
      type: 'listening',
      target: 1,
      current: 0,
      completed: false,
      date: getToday(),
    },
    {
      id: 'g2',
      title: '1 ta Reading passage o\'qing',
      description: 'Reading bo\'yicha 1 ta passage ni o\'qing va javob bering',
      type: 'reading',
      target: 1,
      current: 0,
      completed: false,
      date: getToday(),
    },
    {
      id: 'g3',
      title: '10 ta yangi so\'z o\'rganing',
      description: 'Vocabulary bo\'limidan 10 ta so\'zni o\'rganing',
      type: 'vocabulary',
      target: 10,
      current: 0,
      completed: false,
      date: getToday(),
    },
    {
      id: 'g4',
      title: 'Writing uchun 15 daqiqa sarflang',
      description: 'Writing bo\'limida kamida 15 daqiqa mashq qiling',
      type: 'writing',
      target: 15,
      current: 0,
      completed: false,
      date: getToday(),
    },
    {
      id: 'g5',
      title: 'Speaking uchun 1 ta javob yozing',
      description: 'Speaking bo\'limida 1 ta savolga javob bering',
      type: 'speaking',
      target: 1,
      current: 0,
      completed: false,
      date: getToday(),
    },
  ];
  return goals;
}

export function getDailyGoals(): DailyGoalsState {
  const stored = safeGet<DailyGoalsState | null>(STORAGE_KEY, null);
  const today = getToday();

  if (!stored || stored.date !== today) {
    // New day — generate fresh goals
    const goals = generateDailyGoals();
    const state: DailyGoalsState = { date: today, goals, allCompleted: false };
    safeSet(STORAGE_KEY, state);
    return state;
  }

  return stored;
}

export function updateGoalProgress(goalId: string, increment: number = 1): DailyGoalsState {
  const state = getDailyGoals();
  const goal = state.goals.find(g => g.id === goalId);
  if (goal) {
    goal.current = Math.min(goal.current + increment, goal.target);
    goal.completed = goal.current >= goal.target;
    state.allCompleted = state.goals.every(g => g.completed);
    safeSet(STORAGE_KEY, state);
  }
  return state;
}

export function getCompletionPercentage(): number {
  const state = getDailyGoals();
  const completed = state.goals.filter(g => g.completed).length;
  return Math.round((completed / state.goals.length) * 100);
}

export function isGoalCompleted(goalId: string): boolean {
  const state = getDailyGoals();
  const goal = state.goals.find(g => g.id === goalId);
  return goal?.completed ?? false;
}
