'use client';

import { supabase, isSupabaseConfigured } from './supabase';

// ============================================================
// Database Helper Functions
// ============================================================

type TableName = 
  | 'user_profiles'
  | 'test_results'
  | 'vocabulary_words'
  | 'mistakes'
  | 'subscriptions'
  | 'payment_orders'
  | 'mock_exam_sessions'
  | 'achievements'
  | 'daily_goals'
  | 'notifications';

interface QueryOptions {
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

// ============================================================
// Generic CRUD Operations
// ============================================================

export async function dbSelect<T>(
  table: TableName,
  options?: QueryOptions
): Promise<T[]> {
  if (!isSupabaseConfigured) {
    return fallbackLocalSelect<T>(table, options);
  }

  let query = supabase.from(table).select('*');

  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy.column, { 
      ascending: options.orderBy.ascending ?? false 
    });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`DB Select Error [${table}]:`, error);
    return fallbackLocalSelect<T>(table, options);
  }

  return (data || []) as T[];
}

export async function dbSelectSingle<T>(
  table: TableName,
  filters: Record<string, unknown>
): Promise<T | null> {
  if (!isSupabaseConfigured) {
    return fallbackLocalSelectSingle<T>(table, filters);
  }

  let query = supabase.from(table).select('*');

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query.single();

  if (error) {
    console.error(`DB SelectSingle Error [${table}]:`, error);
    return fallbackLocalSelectSingle<T>(table, filters);
  }

  return data as T;
}

export async function dbInsert<T>(
  table: TableName,
  data: Record<string, unknown>
): Promise<T | null> {
  if (!isSupabaseConfigured) {
    return fallbackLocalInsert<T>(table, data);
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error(`DB Insert Error [${table}]:`, error);
    return fallbackLocalInsert<T>(table, data);
  }

  return result as T;
}

export async function dbUpdate<T>(
  table: TableName,
  filters: Record<string, unknown>,
  data: Record<string, unknown>
): Promise<T | null> {
  if (!isSupabaseConfigured) {
    return fallbackLocalUpdate<T>(table, filters, data);
  }

  let query = supabase.from(table).update(data);

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data: result, error } = await query.select().single();

  if (error) {
    console.error(`DB Update Error [${table}]:`, error);
    return fallbackLocalUpdate<T>(table, filters, data);
  }

  return result as T;
}

export async function dbDelete(
  table: TableName,
  filters: Record<string, unknown>
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return fallbackLocalDelete(table, filters);
  }

  let query = supabase.from(table).delete();

  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { error } = await query;

  if (error) {
    console.error(`DB Delete Error [${table}]:`, error);
    return fallbackLocalDelete(table, filters);
  }

  return true;
}

// ============================================================
// User Profile Helpers
// ============================================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  target_band: number;
  exam_date: string | null;
  onboarding_completed: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return dbSelectSingle<UserProfile>('user_profiles', { id: userId });
}

export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string }): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) {
    return fallbackLocalUpsertProfile(profile);
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Upsert User Profile Error:', error);
    return fallbackLocalUpsertProfile(profile);
  }

  return data as UserProfile;
}

// ============================================================
// Test Results Helpers
// ============================================================

export interface TestResult {
  id: string;
  user_id: string;
  test_id: string;
  test_title: string;
  skill: string;
  overall_band: number;
  correct_answers: number;
  total_questions: number;
  accuracy: number;
  time_spent_minutes: number;
  answers: unknown;
  completed_at: string;
}

export async function getTestResults(userId: string, skill?: string): Promise<TestResult[]> {
  const filters: Record<string, unknown> = { user_id: userId };
  if (skill) filters.skill = skill;
  
  return dbSelect<TestResult>('test_results', {
    filters,
    orderBy: { column: 'completed_at', ascending: false }
  });
}

export async function addTestResult(result: Omit<TestResult, 'id'>): Promise<TestResult | null> {
  return dbInsert<TestResult>('test_results', result);
}

// ============================================================
// Vocabulary Helpers
// ============================================================

export interface VocabularyWord {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  example: string;
  synonyms: string[];
  word_family: unknown;
  difficulty: string;
  category: string;
  mastery_level: number;
  next_review_at: string | null;
  created_at: string;
}

export async function getVocabulary(userId: string): Promise<VocabularyWord[]> {
  return dbSelect<VocabularyWord>('vocabulary_words', {
    filters: { user_id: userId },
    orderBy: { column: 'created_at', ascending: false }
  });
}

export async function addVocabularyWord(word: Omit<VocabularyWord, 'id'>): Promise<VocabularyWord | null> {
  return dbInsert<VocabularyWord>('vocabulary_words', word);
}

export async function deleteVocabularyWord(id: string, userId: string): Promise<boolean> {
  return dbDelete('vocabulary_words', { id, user_id: userId });
}

// ============================================================
// Mistakes Helpers
// ============================================================

export interface Mistake {
  id: string;
  user_id: string;
  question: string;
  your_answer: string;
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  skill: string;
  mastered: boolean;
  created_at: string;
}

export async function getMistakes(userId: string, skill?: string): Promise<Mistake[]> {
  const filters: Record<string, unknown> = { user_id: userId };
  if (skill) filters.skill = skill;
  
  return dbSelect<Mistake>('mistakes', {
    filters,
    orderBy: { column: 'created_at', ascending: false }
  });
}

export async function addMistake(mistake: Omit<Mistake, 'id'>): Promise<Mistake | null> {
  return dbInsert<Mistake>('mistakes', mistake);
}

export async function updateMistake(id: string, userId: string, data: Partial<Mistake>): Promise<Mistake | null> {
  return dbUpdate<Mistake>('mistakes', { id, user_id: userId }, data);
}

// ============================================================
// Subscription Helpers
// ============================================================

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  payment_id: string | null;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  return dbSelectSingle<Subscription>('subscriptions', { user_id: userId });
}

export async function upsertSubscription(sub: Partial<Subscription> & { user_id: string }): Promise<Subscription | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(sub, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Upsert Subscription Error:', error);
    return null;
  }

  return data as Subscription;
}

// ============================================================
// Mock Exam Sessions Helpers
// ============================================================

export interface MockExamSession {
  id: string;
  user_id: string;
  exam_id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  current_section: string | null;
  time_spent_minutes: number;
  section_scores: unknown;
  overall_band: number | null;
}

export async function getMockExamSessions(userId: string): Promise<MockExamSession[]> {
  return dbSelect<MockExamSession>('mock_exam_sessions', {
    filters: { user_id: userId },
    orderBy: { column: 'started_at', ascending: false }
  });
}

export async function addMockExamSession(session: Omit<MockExamSession, 'id'>): Promise<MockExamSession | null> {
  return dbInsert<MockExamSession>('mock_exam_sessions', session);
}

export async function updateMockExamSession(id: string, userId: string, data: Partial<MockExamSession>): Promise<MockExamSession | null> {
  return dbUpdate<MockExamSession>('mock_exam_sessions', { id, user_id: userId }, data);
}

// ============================================================
// Achievements Helpers
// ============================================================

export interface Achievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export async function getAchievements(userId: string): Promise<Achievement[]> {
  return dbSelect<Achievement>('achievements', {
    filters: { user_id: userId }
  });
}

export async function upsertAchievement(userId: string, achievementId: string, unlocked: boolean): Promise<Achievement | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from('achievements')
    .upsert({
      user_id: userId,
      achievement_id: achievementId,
      unlocked,
      unlocked_at: unlocked ? new Date().toISOString() : null
    }, { onConflict: 'user_id,achievement_id' })
    .select()
    .single();

  if (error) {
    console.error('Upsert Achievement Error:', error);
    return null;
  }

  return data as Achievement;
}

// ============================================================
// Daily Goals Helpers
// ============================================================

export interface DailyGoal {
  id: string;
  user_id: string;
  date: string;
  listening: boolean;
  reading: boolean;
  writing: boolean;
  speaking: boolean;
}

export async function getDailyGoals(userId: string, date: string): Promise<DailyGoal | null> {
  return dbSelectSingle<DailyGoal>('daily_goals', { user_id: userId, date });
}

export async function upsertDailyGoal(userId: string, date: string, data: Partial<DailyGoal>): Promise<DailyGoal | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data: result, error } = await supabase
    .from('daily_goals')
    .upsert({ user_id: userId, date, ...data }, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) {
    console.error('Upsert Daily Goal Error:', error);
    return null;
  }

  return result as DailyGoal;
}

// ============================================================
// Notifications Helpers
// ============================================================

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  return dbSelect<Notification>('notifications', {
    filters: { user_id: userId },
    orderBy: { column: 'created_at', ascending: false }
  });
}

export async function addNotification(notif: Omit<Notification, 'id'>): Promise<Notification | null> {
  return dbInsert<Notification>('notifications', notif);
}

export async function markNotificationRead(id: string, userId: string): Promise<boolean> {
  const result = await dbUpdate('notifications', { id, user_id: userId }, { read: true });
  return result !== null;
}

// ============================================================
// LOCAL STORAGE FALLBACKS
// ============================================================

const LOCAL_KEYS: Record<TableName, string> = {
  user_profiles: 'ieltspro_user_profiles',
  test_results: 'ieltspro_test_results',
  vocabulary_words: 'ieltspro_vocabulary',
  mistakes: 'ieltspro_mistakes',
  subscriptions: 'ieltspro_subscriptions',
  payment_orders: 'ieltspro_payment_orders',
  mock_exam_sessions: 'ieltspro_mock_sessions',
  achievements: 'ieltspro_achievements',
  daily_goals: 'ieltspro_daily_goals',
  notifications: 'ieltspro_notifications',
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

function fallbackLocalSelect<T>(table: TableName, options?: QueryOptions): T[] {
  const items = safeGet<T[]>(LOCAL_KEYS[table], []);
  let result = [...items];

  if (options?.filters) {
    result = result.filter(item => {
      return Object.entries(options.filters!).every(([key, value]) => {
        return (item as Record<string, unknown>)[key] === value;
      });
    });
  }

  if (options?.orderBy) {
    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[options.orderBy!.column];
      const bVal = (b as Record<string, unknown>)[options.orderBy!.column];
      const comparison = String(aVal).localeCompare(String(bVal));
      return options.orderBy!.ascending ? comparison : -comparison;
    });
  }

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

function fallbackLocalSelectSingle<T>(table: TableName, filters: Record<string, unknown>): T | null {
  const items = safeGet<T[]>(LOCAL_KEYS[table], []);
  const found = items.find(item => {
    return Object.entries(filters).every(([key, value]) => {
      return (item as Record<string, unknown>)[key] === value;
    });
  });
  return found || null;
}

function fallbackLocalInsert<T>(table: TableName, data: Record<string, unknown>): T {
  const items = safeGet<Record<string, unknown>[]>(LOCAL_KEYS[table], []);
  const newItem = {
    ...data,
    id: data.id || crypto.randomUUID(),
  };
  items.push(newItem);
  safeSet(LOCAL_KEYS[table], items);
  return newItem as T;
}

function fallbackLocalUpdate<T>(table: TableName, filters: Record<string, unknown>, data: Record<string, unknown>): T | null {
  const items = safeGet<Record<string, unknown>[]>(LOCAL_KEYS[table], []);
  const index = items.findIndex(item => {
    return Object.entries(filters).every(([key, value]) => {
      return item[key] === value;
    });
  });
  
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...data };
  safeSet(LOCAL_KEYS[table], items);
  return items[index] as T;
}

function fallbackLocalDelete(table: TableName, filters: Record<string, unknown>): boolean {
  const items = safeGet<Record<string, unknown>[]>(LOCAL_KEYS[table], []);
  const filtered = items.filter(item => {
    return !Object.entries(filters).every(([key, value]) => {
      return item[key] === value;
    });
  });
  
  if (filtered.length === items.length) return false;
  
  safeSet(LOCAL_KEYS[table], filtered);
  return true;
}

function fallbackLocalUpsertProfile(profile: Partial<UserProfile> & { id: string }): UserProfile {
  const profiles = safeGet<Record<string, UserProfile>>(LOCAL_KEYS.user_profiles, {});
  const existing = profiles[profile.id];
  
  const updated: UserProfile = {
    id: profile.id,
    name: profile.name || existing?.name || 'Student',
    email: profile.email || existing?.email || '',
    target_band: profile.target_band ?? existing?.target_band ?? 7.5,
    exam_date: profile.exam_date ?? existing?.exam_date ?? null,
    onboarding_completed: profile.onboarding_completed ?? existing?.onboarding_completed ?? false,
    role: profile.role || existing?.role || 'student',
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  profiles[profile.id] = updated;
  safeSet(LOCAL_KEYS.user_profiles, profiles);
  return updated;
}
