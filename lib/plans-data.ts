// ═══════════════════════════════════════════════════════════════════════
//  PLAN DEFINITIONS — Server-safe (no 'use client')
//  Used by both client components and server API routes
// ═══════════════════════════════════════════════════════════════════════

export type PlanId = 'free' | 'daily' | 'start' | 'basic' | 'pro';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;
  dailyPrice?: number;
  badge?: string;
  highlighted: boolean;
  features: string[];
  icon: string;
  color: string;
  gradient: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Explore StartIELTS and unlock your full potential.',
    price: 0,
    highlighted: false,
    icon: '🆓',
    color: 'gray',
    gradient: 'from-gray-400 to-gray-500',
    features: [
      'Limited Practice tests',
      'Limited Reading & Listening',
      '1 Demo Mock Exam',
      'Basic Dashboard',
      'Basic Progress Tracking',
      'Test History',
    ],
  },
  {
    id: 'daily',
    name: 'Daily Pass',
    tagline: '24 hours of extended access',
    price: 0,
    dailyPrice: 7900,
    highlighted: false,
    icon: '⚡',
    color: 'amber',
    gradient: 'from-amber-400 to-orange-500',
    features: [
      'Full Reading access (24h)',
      'Full Listening access (24h)',
      'Writing Practice access',
      'Speaking Practice access',
      'Selected Mock Exam access',
      'Basic Analytics',
    ],
  },
  {
    id: 'start',
    name: 'Start',
    tagline: 'Start your IELTS journey.',
    price: 29000,
    highlighted: false,
    icon: '🌱',
    color: 'emerald',
    gradient: 'from-emerald-400 to-teal-500',
    features: [
      'Extended Practice access',
      'Reading & Listening practice',
      'Answer explanations',
      'Progress History',
      'Basic Statistics',
      'Daily Goals & Streak',
      'Limited Mock Exam access',
      'Limited Writing & Speaking',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Everything you need to prepare seriously.',
    price: 59000,
    badge: 'MOST POPULAR',
    highlighted: true,
    icon: '⭐',
    color: 'primary',
    gradient: 'from-primary to-blue-600',
    features: [
      'Unlimited Practice Library',
      'Full Reading access',
      'Full Listening access',
      'Writing Practice',
      'Speaking Practice',
      'Full Mock Exam access',
      'Advanced Statistics',
      'Weak Area Analysis',
      'Personal Study Plan',
      'Full Progress Tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Train smarter. Reach higher.',
    price: 99000,
    highlighted: false,
    icon: '👑',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    features: [
      'Everything in Basic',
      'AI Writing Analysis',
      'AI Speaking Analysis',
      'Advanced Band Analytics',
      'Target Band Tracking',
      'Personalized AI Recommendations',
      'Personalized Study Roadmap',
      'Weekly Progress Reports',
      'Priority Support',
    ],
  },
];

export function getPlanById(planId: PlanId): PlanDefinition | undefined {
  return PLANS.find(p => p.id === planId);
}

export function getPlanPrice(planId: PlanId): number {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) return 0;
  return planId === 'daily' ? (plan.dailyPrice || 0) : plan.price;
}
