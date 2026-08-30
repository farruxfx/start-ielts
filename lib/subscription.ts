'use client';

// ═══════════════════════════════════════════════════════════════
//  SUBSCRIPTION TYPES
// ═══════════════════════════════════════════════════════════════

export type PlanId = 'free' | 'daily' | 'start' | 'basic' | 'pro';
export type SubscriptionStatus = 'free' | 'active' | 'expired' | 'cancelled' | 'pending_payment' | 'trial';

export interface PlanFeature {
  key: string;
  label: string;
  free: string | boolean;
  daily: string | boolean;
  start: string | boolean;
  basic: string | boolean;
  pro: string | boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  price: number; // UZS per month
  dailyPrice?: number; // for daily pass
  badge?: string;
  highlighted: boolean;
  features: string[];
  icon: string;
  color: string;
  gradient: string;
}

export interface UserSubscription {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  startDate: string;
  expiresAt: string | null;
  paymentId?: string;
  autoRenew: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  plan: PlanId;
  amount: number;
  currency: 'UZS';
  provider: string; // 'click' | 'payme' | 'uzumbank' | 'manual'
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  id: string;
  type: 'expiry_warning' | 'expiry_1day' | 'expired' | 'daily_pass_6h' | 'daily_pass_1h' | 'payment_success' | 'payment_failed';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
//  PLAN DEFINITIONS
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
//  FEATURE COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════

export const FEATURE_COMPARISON: PlanFeature[] = [
  { key: 'practice_tests', label: 'Practice Tests', free: '3/month', daily: 'Unlimited', start: 'Unlimited', basic: 'Unlimited', pro: 'Unlimited' },
  { key: 'reading', label: 'Reading', free: 'Limited', daily: '✓', start: '✓', basic: '✓', pro: '✓' },
  { key: 'listening', label: 'Listening', free: 'Limited', daily: '✓', start: '✓', basic: '✓', pro: '✓' },
  { key: 'writing', label: 'Writing', free: '—', daily: '✓', start: 'Limited', basic: '✓', pro: '✓' },
  { key: 'speaking', label: 'Speaking', free: '—', daily: '✓', start: 'Limited', basic: '✓', pro: '✓' },
  { key: 'mock_exams', label: 'Mock Exams', free: '1 Demo', daily: 'Selected', start: 'Limited', basic: 'Full', pro: 'Full' },
  { key: 'explanations', label: 'Answer Explanations', free: '—', daily: '✓', start: '✓', basic: '✓', pro: '✓' },
  { key: 'progress', label: 'Progress Tracking', free: 'Basic', daily: 'Basic', start: '✓', basic: 'Full', pro: 'Full' },
  { key: 'statistics', label: 'Statistics', free: 'Basic', daily: 'Basic', start: 'Basic', basic: 'Advanced', pro: 'Advanced' },
  { key: 'study_plan', label: 'Study Plan', free: '—', daily: '—', start: '—', basic: '✓', pro: '✓' },
  { key: 'weak_areas', label: 'Weak Area Analysis', free: '—', daily: '—', start: '—', basic: '✓', pro: '✓' },
  { key: 'ai_writing', label: 'AI Writing Analysis', free: '—', daily: '—', start: '—', basic: '—', pro: '✓' },
  { key: 'ai_speaking', label: 'AI Speaking Analysis', free: '—', daily: '—', start: '—', basic: '—', pro: '✓' },
  { key: 'advanced_analytics', label: 'Advanced Analytics', free: '—', daily: '—', start: '—', basic: '—', pro: '✓' },
  { key: 'recommendations', label: 'Personalized Recommendations', free: '—', daily: '—', start: '—', basic: '—', pro: '✓' },
];

// ═══════════════════════════════════════════════════════════════
//  FEATURE PERMISSIONS MAP
// ═══════════════════════════════════════════════════════════════

const PLAN_HIERARCHY: Record<PlanId, number> = {
  free: 0,
  daily: 1,
  start: 2,
  basic: 3,
  pro: 4,
};

// Features that require a minimum plan level
const FEATURE_ACCESS: Record<string, PlanId> = {
  // Reading & Listening
  reading_full: 'daily',
  listening_full: 'daily',
  writing_practice: 'daily',
  speaking_practice: 'daily',
  
  // Mock exams
  mock_exam_demo: 'free',
  mock_exam_selected: 'daily',
  mock_exam_limited: 'start',
  mock_exam_full: 'basic',
  
  // Practice
  practice_unlimited: 'start',
  practice_library: 'basic',
  
  // Analytics
  analytics_basic: 'free',
  analytics_advanced: 'basic',
  
  // Study tools
  study_plan: 'basic',
  weak_area_analysis: 'basic',
  progress_full: 'basic',
  
  // AI features (Pro only)
  ai_writing: 'pro',
  ai_speaking: 'pro',
  ai_recommendations: 'pro',
  ai_roadmap: 'pro',
  weekly_reports: 'pro',
  priority_support: 'pro',
};

// ═══════════════════════════════════════════════════════════════
//  LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════

const KEYS = {
  SUBSCRIPTION: 'ieltspro_subscription',
  TRANSACTIONS: 'ieltspro_transactions',
  NOTIFICATIONS: 'ieltspro_notifications',
  DAILY_GOALS: 'ieltspro_daily_goals',
};

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
  } catch { /* Storage full */ }
}

// ═══════════════════════════════════════════════════════════════
//  SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export function getUserSubscription(userId: string): UserSubscription {
  const subs = safeGet<Record<string, UserSubscription>>(KEYS.SUBSCRIPTION, {});
  if (subs[userId]) {
    const sub = subs[userId];
    // Check if subscription has expired
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date() && sub.status === 'active') {
      sub.status = 'expired';
      safeSet(KEYS.SUBSCRIPTION, { ...subs, [userId]: sub });
    }
    return sub;
  }
  return {
    userId,
    plan: 'free',
    status: 'free',
    startDate: new Date().toISOString(),
    expiresAt: null,
    autoRenew: false,
  };
}

export function setUserSubscription(subscription: UserSubscription): void {
  const subs = safeGet<Record<string, UserSubscription>>(KEYS.SUBSCRIPTION, {});
  safeSet(KEYS.SUBSCRIPTION, { ...subs, [subscription.userId]: subscription });
}

export function activatePlan(userId: string, planId: PlanId, paymentId?: string): void {
  const now = new Date();
  let expiresAt: string | null = null;

  if (planId === 'daily') {
    expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  } else if (planId !== 'free') {
    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  setUserSubscription({
    userId,
    plan: planId,
    status: 'active',
    startDate: now.toISOString(),
    expiresAt,
    paymentId,
    autoRenew: planId !== 'daily' && planId !== 'free',
  });
}

export function cancelSubscription(userId: string): void {
  const sub = getUserSubscription(userId);
  sub.status = 'cancelled';
  sub.autoRenew = false;
  setUserSubscription(sub);
}

// ═══════════════════════════════════════════════════════════════
//  ACCESS CONTROL
// ═══════════════════════════════════════════════════════════════

export function getPlanLevel(planId: PlanId): number {
  return PLAN_HIERARCHY[planId] || 0;
}

export function hasActiveSubscription(userId: string): boolean {
  const sub = getUserSubscription(userId);
  return sub.status === 'active' || sub.status === 'trial';
}

export function getUserPlan(userId: string): PlanId {
  return getUserSubscription(userId).plan;
}

export function getSubscriptionStatus(userId: string): SubscriptionStatus {
  return getUserSubscription(userId).status;
}

export function canAccessFeature(userId: string, feature: string): boolean {
  const plan = getUserPlan(userId);
  const requiredPlan = FEATURE_ACCESS[feature];
  if (!requiredPlan) return true; // Feature not restricted
  return getPlanLevel(plan) >= getPlanLevel(requiredPlan);
}

export function getRequiredPlan(feature: string): PlanId {
  return FEATURE_ACCESS[feature] || 'free';
}

export function getTimeRemaining(expiresAt: string | null): { hours: number; minutes: number; days: number; expired: boolean } {
  if (!expiresAt) return { hours: 0, minutes: 0, days: 0, expired: false };
  const now = new Date();
  const exp = new Date(expiresAt);
  const diff = exp.getTime() - now.getTime();
  if (diff <= 0) return { hours: 0, minutes: 0, days: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes, days, expired: false };
}

// ═══════════════════════════════════════════════════════════════
//  PAYMENT ABSTRACTION LAYER
// ═══════════════════════════════════════════════════════════════

export interface PaymentProvider {
  id: string;
  name: string;
  initiatePayment(amount: number, planId: PlanId, userId: string): Promise<PaymentTransaction>;
  verifyPayment(transactionId: string): Promise<boolean>;
  isAvailable(): boolean;
}

// In-memory payment providers registry
const paymentProviders: Map<string, PaymentProvider> = new Map();

export function registerPaymentProvider(provider: PaymentProvider): void {
  paymentProviders.set(provider.id, provider);
}

export function getPaymentProviders(): PaymentProvider[] {
  return Array.from(paymentProviders.values());
}

// Default mock provider for demo/testing
class MockPaymentProvider implements PaymentProvider {
  id = 'mock';
  name = 'Demo Payment';
  
  async initiatePayment(amount: number, planId: PlanId, userId: string): Promise<PaymentTransaction> {
    const tx: PaymentTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      plan: planId,
      amount,
      currency: 'UZS',
      provider: this.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const txns = safeGet<PaymentTransaction[]>(KEYS.TRANSACTIONS, []);
    txns.push(tx);
    safeSet(KEYS.TRANSACTIONS, txns);
    return tx;
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // In demo mode, always succeed
    const txns = safeGet<PaymentTransaction[]>(KEYS.TRANSACTIONS, []);
    const idx = txns.findIndex(t => t.id === transactionId);
    if (idx >= 0) {
      txns[idx].status = 'completed';
      txns[idx].completedAt = new Date().toISOString();
      safeSet(KEYS.TRANSACTIONS, txns);
    }
    return true;
  }

  isAvailable() { return true; }
}

// Register mock provider by default
if (typeof window !== 'undefined') {
  registerPaymentProvider(new MockPaymentProvider());
}

export async function processPayment(planId: PlanId, userId: string, providerId = 'mock'): Promise<boolean> {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan || planId === 'free') return false;

  const provider = paymentProviders.get(providerId);
  if (!provider || !provider.isAvailable()) return false;

  const amount = planId === 'daily' ? (plan.dailyPrice || 0) : plan.price;
  if (amount <= 0) return false;

  try {
    const tx = await provider.initiatePayment(amount, planId, userId);
    const verified = await provider.verifyPayment(tx.id);
    if (verified) {
      activatePlan(userId, planId, tx.id);
      addNotification(userId, {
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your ${plan.name} plan is now active!`,
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
//  TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

export function getTransactions(userId: string): PaymentTransaction[] {
  const txns = safeGet<PaymentTransaction[]>(KEYS.TRANSACTIONS, []);
  return txns.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export function getNotifications(userId: string): Notification[] {
  const all = safeGet<Record<string, Notification[]>>(KEYS.NOTIFICATIONS, {});
  return (all[userId] || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addNotification(userId: string, notif: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
  const all = safeGet<Record<string, Notification[]>>(KEYS.NOTIFICATIONS, {});
  const list = all[userId] || [];
  list.push({
    ...notif,
    id: `notif_${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  });
  safeSet(KEYS.NOTIFICATIONS, { ...all, [userId]: list });
}

export function markNotificationRead(userId: string, notifId: string): void {
  const all = safeGet<Record<string, Notification[]>>(KEYS.NOTIFICATIONS, {});
  const list = all[userId] || [];
  const n = list.find(x => x.id === notifId);
  if (n) n.read = true;
  safeSet(KEYS.NOTIFICATIONS, { ...all, [userId]: list });
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter(n => !n.read).length;
}

// ═══════════════════════════════════════════════════════════════
//  DAILY GOALS
// ═══════════════════════════════════════════════════════════════

export interface DailyGoals {
  date: string;
  listening: boolean;
  reading: boolean;
  writing: boolean;
  speaking: boolean;
}

export function getDailyGoals(): DailyGoals {
  const today = new Date().toISOString().split('T')[0];
  const stored = safeGet<DailyGoals>(KEYS.DAILY_GOALS, { date: '', listening: false, reading: false, writing: false, speaking: false });
  if (stored.date !== today) {
    const fresh: DailyGoals = { date: today, listening: false, reading: false, writing: false, speaking: false };
    safeSet(KEYS.DAILY_GOALS, fresh);
    return fresh;
  }
  return stored;
}

export function completeDailyGoal(skill: 'listening' | 'reading' | 'writing' | 'speaking'): void {
  const goals = getDailyGoals();
  goals[skill] = true;
  safeSet(KEYS.DAILY_GOALS, goals);
}

export function getDailyGoalProgress(): { completed: number; total: number; percentage: number } {
  const goals = getDailyGoals();
  const completed = [goals.listening, goals.reading, goals.writing, goals.speaking].filter(Boolean).length;
  return { completed, total: 4, percentage: Math.round((completed / 4) * 100) };
}

// ═══════════════════════════════════════════════════════════════
//  UPGRADE PROMPTS
// ═══════════════════════════════════════════════════════════════

export interface UpgradePrompt {
  title: string;
  message: string;
  cta: string;
  targetPlan: PlanId;
  icon: string;
}

export function getUpgradePrompt(userId: string, feature: string): UpgradePrompt | null {
  const currentPlan = getUserPlan(userId);
  const required = getRequiredPlan(feature);
  
  if (getPlanLevel(currentPlan) >= getPlanLevel(required)) return null;

  if (currentPlan === 'free') {
    return {
      title: 'Unlock more features',
      message: `Upgrade to access ${feature.replace(/_/g, ' ')} and continue improving.`,
      cta: 'Explore Plans',
      targetPlan: 'start',
      icon: '🚀',
    };
  }
  if (currentPlan === 'start') {
    return {
      title: "You're ready for the next level",
      message: `Upgrade to Basic and unlock full access to everything.`,
      cta: 'Upgrade to Basic',
      targetPlan: 'basic',
      icon: '⭐',
    };
  }
  if (currentPlan === 'basic' && required === 'pro') {
    return {
      title: 'Unlock smarter preparation',
      message: 'Get AI-powered Writing and Speaking analysis personalized to your performance.',
      cta: 'Upgrade to Pro',
      targetPlan: 'pro',
      icon: '👑',
    };
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

export function formatUZS(amount: number): string {
  if (amount === 0) return 'Bepul';
  // Use fixed formatting to avoid hydration mismatch between server/client
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formatted + " so'm";
}

export function getPlanById(planId: PlanId): PlanDefinition | undefined {
  return PLANS.find(p => p.id === planId);
}

export function getNextPlan(currentPlan: PlanId): PlanDefinition | null {
  const order: PlanId[] = ['free', 'start', 'basic', 'pro'];
  const idx = order.indexOf(currentPlan);
  if (idx < 0 || idx >= order.length - 1) return null;
  return PLANS.find(p => p.id === order[idx + 1]) || null;
}
