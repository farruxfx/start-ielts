'use client';

import type { Skill, TestResult, Achievement } from './types';

const KEYS = {
  USER_PROFILE: 'ieltspro_user_profile',
  TEST_RESULTS: 'ieltspro_test_results',
  SKILL_TARGETS: 'ieltspro_skill_targets',
  VOCABULARY: 'ieltspro_vocabulary',
  MISTAKES: 'ieltspro_mistakes',
  STREAK: 'ieltspro_streak',
  ACHIEVEMENTS: 'ieltspro_achievements',
  EXAM_DATE: 'ieltspro_exam_date',
};

export interface UserProfile {
  name: string;
  email: string;
  targetBand: number;
  createdAt: string;
}

export interface SkillTarget {
  skill: Skill;
  target: number;
}

export interface StreakData {
  current: number;
  lastDate: string;
  best: number;
}

export interface StoredAchievement {
  id: string;
  unlocked: boolean;
  date?: string;
}

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
  } catch {
    // Storage full or unavailable
  }
}

// User Profile
export function getUserProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.USER_PROFILE, null);
}

export function setUserProfile(profile: UserProfile): void {
  safeSet(KEYS.USER_PROFILE, profile);
}

export function getUserName(): string {
  return getUserProfile()?.name || 'Student';
}

export function getTargetBand(): number {
  return getUserProfile()?.targetBand || 7.5;
}

export function setTargetBand(band: number): void {
  const profile = getUserProfile();
  if (profile) {
    setUserProfile({ ...profile, targetBand: band });
  }
}

// Test Results
export function getTestResults(): TestResult[] {
  return safeGet<TestResult[]>(KEYS.TEST_RESULTS, []);
}

export function addTestResult(result: TestResult): void {
  const results = getTestResults();
  results.push(result);
  safeSet(KEYS.TEST_RESULTS, results);
  
  // Update streak
  updateStreak();
  
  // Check achievements
  checkAchievements();
}

export function getTestResultsBySkill(skill: Skill): TestResult[] {
  return getTestResults().filter(r => r.skill === skill);
}

// Skill Targets
export function getSkillTargets(): SkillTarget[] {
  return safeGet<SkillTarget[]>(KEYS.SKILL_TARGETS, [
    { skill: 'reading', target: 7.5 },
    { skill: 'listening', target: 8.0 },
    { skill: 'writing', target: 7.0 },
    { skill: 'speaking', target: 7.0 },
  ]);
}

export function setSkillTarget(skill: Skill, target: number): void {
  const targets = getSkillTargets();
  const idx = targets.findIndex(t => t.skill === skill);
  if (idx >= 0) {
    targets[idx].target = target;
  } else {
    targets.push({ skill, target });
  }
  safeSet(KEYS.SKILL_TARGETS, targets);
}

// Band Score Calculation
export function calculateBestBandForSkill(skill: Skill): number | null {
  const results = getTestResultsBySkill(skill);
  if (results.length === 0) return null;
  return Math.max(...results.map(r => r.overallBand));
}

export function calculateAverageBandForSkill(skill: Skill): number | null {
  const results = getTestResultsBySkill(skill);
  if (results.length === 0) return null;
  const sum = results.reduce((acc, r) => acc + r.overallBand, 0);
  return Math.round((sum / results.length) * 10) / 10;
}

export function calculateOverallBand(): number {
  const skills: Skill[] = ['reading', 'listening', 'writing', 'speaking'];
  const bands = skills.map(s => calculateBestBandForSkill(s)).filter((b): b is number => b !== null);
  if (bands.length === 0) return 0;
  return Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 10) / 10;
}

export function getCompletedTestCount(): number {
  return getTestResults().length;
}

export function getTotalTimeSpent(): number {
  return getTestResults().reduce((acc, r) => acc + r.timeSpentMinutes, 0);
}

// Streak
export function getStreakData(): StreakData {
  return safeGet<StreakData>(KEYS.STREAK, { current: 0, lastDate: '', best: 0 });
}

function updateStreak(): void {
  const streak = getStreakData();
  const today = new Date().toISOString().split('T')[0];
  
  if (streak.lastDate === today) return; // Already logged today
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (streak.lastDate === yesterday) {
    streak.current += 1;
  } else {
    streak.current = 1;
  }
  
  streak.lastDate = today;
  streak.best = Math.max(streak.best, streak.current);
  safeSet(KEYS.STREAK, streak);
}

// Progress History
export function addProgressEntry(band: number): void {
  const results = getTestResults();
  // Group by date and keep last band per day
  const dateMap = new Map<string, number>();
  results.forEach(r => {
    const date = new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap.set(date, r.overallBand);
  });
  
  // Store progress history
  const history = Array.from(dateMap.entries()).map(([date, overall]) => ({ date, overall }));
  safeSet('ieltspro_progress_history', history);
}

export function getProgressHistory(): { date: string; overall: number }[] {
  return safeGet('ieltspro_progress_history', []);
}

// Weekly Activity
export function getWeeklyActivity(): { day: string; minutes: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const results = getTestResults();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const activity = days.map(day => ({ day, minutes: 0 }));
  
  results.forEach(r => {
    const completedAt = new Date(r.completedAt);
    if (completedAt >= weekAgo) {
      const dayIdx = completedAt.getDay();
      // Convert Sunday=0 to Mon=0 format
      const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
      activity[adjustedIdx].minutes += r.timeSpentMinutes;
    }
  });
  
  return activity;
}

// Exam Date
export function getExamDate(): string | null {
  return safeGet<string | null>(KEYS.EXAM_DATE, null);
}

export function setExamDate(date: string): void {
  safeSet(KEYS.EXAM_DATE, date);
}

export function getExamCountdownDays(): number {
  const examDate = getExamDate();
  if (!examDate) return 0;
  const diff = new Date(examDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// Achievements
export function getStoredAchievements(): StoredAchievement[] {
  return safeGet<StoredAchievement[]>(KEYS.ACHIEVEMENTS, []);
}

export function unlockAchievement(id: string): void {
  const achievements = getStoredAchievements();
  const existing = achievements.find(a => a.id === id);
  if (existing && existing.unlocked) return;
  
  if (existing) {
    existing.unlocked = true;
    existing.date = new Date().toISOString().split('T')[0];
  } else {
    achievements.push({ id, unlocked: true, date: new Date().toISOString().split('T')[0] });
  }
  safeSet(KEYS.ACHIEVEMENTS, achievements);
}

function checkAchievements(): void {
  const results = getTestResults();
  const bestBand = results.length > 0 ? Math.max(...results.map(r => r.overallBand)) : 0;
  const streak = getStreakData();
  
  if (results.length >= 1) unlockAchievement('a1'); // First Test
  if (bestBand >= 7.0) unlockAchievement('a2'); // 7.0 Club
  if (bestBand >= 7.5) unlockAchievement('a3'); // 7.5 Club
  if (bestBand >= 8.0) unlockAchievement('a4'); // 8.0 Club
  if (results.length >= 10) unlockAchievement('a5'); // 10 Tests
  if (streak.best >= 30) unlockAchievement('a6'); // 30 Days Streak
  
  const totalCorrect = results.reduce((acc, r) => acc + r.correctAnswers, 0);
  if (totalCorrect >= 100) unlockAchievement('a7'); // 100 Questions
  
  const listeningResults = results.filter(r => r.skill === 'listening');
  if (listeningResults.some(r => r.accuracy === 100)) unlockAchievement('a8'); // Perfect Listening
  
  const readingResults = results.filter(r => r.skill === 'reading');
  if (readingResults.some(r => r.accuracy === 100)) unlockAchievement('a9'); // Perfect Reading
}

// Full Dashboard Data Builder
export function buildDashboardData() {
  const profile = getUserProfile();
  const results = getTestResults();
  const streak = getStreakData();
  const skillTargets = getSkillTargets();
  
  const skills: Skill[] = ['reading', 'listening', 'writing', 'speaking'];
  const skillBands = skills.map(skill => ({
    skill,
    band: calculateBestBandForSkill(skill) || 0,
    target: skillTargets.find(t => t.skill === skill)?.target || 7.5,
  }));
  
  const overallBand = calculateOverallBand();
  const totalTests = results.length;
  const averageBand = totalTests > 0 
    ? Math.round((results.reduce((a, r) => a + r.overallBand, 0) / totalTests) * 10) / 10
    : 0;
  const bestBand = totalTests > 0 
    ? Math.max(...results.map(r => r.overallBand))
    : 0;
  const totalTimeMinutes = results.reduce((a, r) => a + r.timeSpentMinutes, 0);
  
  // Weakest skill
  const weakestSkill = skillBands
    .filter(s => s.band > 0)
    .sort((a, b) => (a.band - a.target) - (b.band - b.target))[0]?.skill || 'writing';
  
  return {
    userName: getUserName(),
    targetBand: getTargetBand(),
    currentBand: overallBand,
    examCountdownDays: getExamCountdownDays(),
    skillBands,
    progressHistory: getProgressHistory(),
    totalTests,
    averageBand,
    bestBand,
    weakestSkill,
    accuracy: totalTests > 0 
      ? Math.round(results.reduce((a, r) => a + r.accuracy, 0) / totalTests)
      : 0,
    timeSpentHours: Math.round(totalTimeMinutes / 60),
    weeklyActivity: getWeeklyActivity(),
    streak: streak.current,
  };
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('ieltspro_progress_history');
}
