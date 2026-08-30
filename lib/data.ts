import type {
  Test,
  Question,
  Passage,
  VocabularyWord,
  Mistake,
  Achievement,
  DashboardData,
  PricingPlan,
} from './types';

export const tests: Test[] = [];

export const passages: Record<string, Passage> = {};

export const questions: Record<string, Question[]> = {};

export const vocabularyWords: VocabularyWord[] = [];

export const mistakes: Mistake[] = [];

export const achievements: Achievement[] = [];

export const dashboardData: DashboardData = {
  userName: 'Aziz',
  targetBand: 7.5,
  currentBand: 6.5,
  examCountdownDays: 23,
  skillBands: [
    { skill: 'reading', band: 7.0, target: 7.5 },
    { skill: 'listening', band: 7.5, target: 8.0 },
    { skill: 'writing', band: 6.0, target: 7.0 },
    { skill: 'speaking', band: 6.5, target: 7.0 },
  ],
  progressHistory: [
    { date: 'Jul 1', overall: 5.5 },
    { date: 'Jul 8', overall: 5.8 },
    { date: 'Jul 15', overall: 6.0 },
    { date: 'Jul 22', overall: 6.2 },
    { date: 'Jul 29', overall: 6.3 },
    { date: 'Aug 5', overall: 6.4 },
    { date: 'Aug 12', overall: 6.5 },
  ],
  totalTests: 8,
  averageBand: 6.5,
  bestBand: 7.5,
  weakestSkill: 'writing',
  accuracy: 72,
  timeSpentHours: 47,
  weeklyActivity: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 90 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 120 },
    { day: 'Sun', minutes: 75 },
  ],
  streak: 12,
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, quarterly: 0, halfYearly: 0, yearly: 0 },
    description: 'Get started with essential IELTS practice tools.',
    features: [
      '3 practice tests per month',
      'Basic analytics dashboard',
      'Limited vocabulary practice',
      'Reading and Listening practice',
      'Band score calculator',
    ],
    highlighted: false,
    cta: 'Start free',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: { monthly: 99000, quarterly: 249000, halfYearly: 449000, yearly: 799000 },
    description: 'Everything you need for serious IELTS preparation.',
    features: [
      'Full test library access',
      'Unlimited practice tests',
      'Full mock exams',
      'Advanced analytics',
      'Writing AI evaluation',
      'Speaking AI evaluation',
      'Mistakes review system',
      'Progress tracking',
    ],
    highlighted: true,
    cta: 'Get Plus',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 199000, quarterly: 499000, halfYearly: 899000, yearly: 1599000 },
    description: 'Maximum preparation with AI coaching and personalized plans.',
    features: [
      'Everything in Plus',
      'Unlimited AI evaluations',
      'AI IELTS Coach',
      'Personalized study plan',
      'Advanced progress analytics',
      'Full Speaking simulator',
      'Priority support',
      'Early access to new features',
    ],
    highlighted: false,
    cta: 'Get Pro',
  },
];

export function formatUZS(amount: number): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US').format(amount) + ' UZS';
}

export const bandScoreChart = [
  { correct: 1, band: 1.0 },
  { correct: 2, band: 2.0 },
  { correct: 3, band: 2.5 },
  { correct: 4, band: 3.0 },
  { correct: 5, band: 3.5 },
  { correct: 6, band: 3.5 },
  { correct: 7, band: 4.0 },
  { correct: 8, band: 4.0 },
  { correct: 9, band: 4.5 },
  { correct: 10, band: 4.5 },
  { correct: 11, band: 5.0 },
  { correct: 12, band: 5.0 },
  { correct: 13, band: 5.5 },
  { correct: 14, band: 5.5 },
  { correct: 15, band: 6.0 },
  { correct: 16, band: 6.0 },
  { correct: 17, band: 6.0 },
  { correct: 18, band: 6.5 },
  { correct: 19, band: 6.5 },
  { correct: 20, band: 6.5 },
  { correct: 21, band: 7.0 },
  { correct: 22, band: 7.0 },
  { correct: 23, band: 7.0 },
  { correct: 24, band: 7.5 },
  { correct: 25, band: 7.5 },
  { correct: 26, band: 7.5 },
  { correct: 27, band: 8.0 },
  { correct: 28, band: 8.0 },
  { correct: 29, band: 8.0 },
  { correct: 30, band: 8.5 },
  { correct: 31, band: 8.5 },
  { correct: 32, band: 8.5 },
  { correct: 33, band: 9.0 },
  { correct: 34, band: 9.0 },
  { correct: 35, band: 9.0 },
  { correct: 36, band: 9.0 },
  { correct: 37, band: 9.0 },
  { correct: 38, band: 9.0 },
  { correct: 39, band: 9.0 },
  { correct: 40, band: 9.0 },
];

export function calculateBandScore(correct: number, total: number = 40): number {
  const entry = bandScoreChart.find((e) => e.correct === correct);
  if (entry) return entry.band;
  const ratio = correct / total;
  return Math.round(ratio * 9 * 2) / 2;
}

export function cefrFromBand(band: number): string {
  if (band >= 8.5) return 'C2';
  if (band >= 7.5) return 'C1';
  if (band >= 6.5) return 'B2';
  if (band >= 5.5) return 'B1';
  if (band >= 4.0) return 'A2';
  return 'A1';
}
