import {
  addTestResult,
  getTestResults,
  getTestResultsBySkill,
  calculateOverallBand,
  getCompletedTestCount,
  getUserProfile,
  setUserProfile,
} from '../store';
import type { TestResult } from '../types';

function makeResult(overrides: Partial<TestResult> = {}): TestResult {
  return {
    id: 'r1',
    testId: 'test-1',
    testTitle: 'Reading Test 1',
    skill: 'reading',
    overallBand: 7.5,
    correctAnswers: 35,
    totalQuestions: 40,
    accuracy: 88,
    timeSpentMinutes: 60,
    completedAt: new Date().toISOString(),
    ...overrides,
  } as TestResult;
}

describe('Store (localStorage persistence)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getTestResults returns empty array initially', () => {
    expect(getTestResults()).toEqual([]);
  });

  test('addTestResult persists a result', () => {
    addTestResult(makeResult());
    const results = getTestResults();
    expect(results).toHaveLength(1);
    expect(results[0].testId).toBe('test-1');

    const raw = JSON.parse(localStorage.getItem('ieltspro_test_results') || '[]');
    expect(raw).toHaveLength(1);
  });

  test('getTestResultsBySkill filters by skill', () => {
    addTestResult(makeResult({ id: 'r1', skill: 'reading' }));
    addTestResult(makeResult({ id: 'r2', skill: 'listening' }));
    expect(getTestResultsBySkill('reading')).toHaveLength(1);
    expect(getTestResultsBySkill('listening')).toHaveLength(1);
    expect(getTestResultsBySkill('writing')).toHaveLength(0);
  });

  test('calculateOverallBand returns 0 with no results', () => {
    expect(calculateOverallBand()).toBe(0);
  });

  test('getCompletedTestCount reflects stored results', () => {
    expect(getCompletedTestCount()).toBe(0);
    addTestResult(makeResult({ id: 'r1' }));
    addTestResult(makeResult({ id: 'r2' }));
    expect(getCompletedTestCount()).toBe(2);
  });

  test('user profile round-trips through localStorage', () => {
    expect(getUserProfile()).toBeNull();
    setUserProfile({
      name: 'Aziz',
      email: 'aziz@example.com',
      targetBand: 8,
      createdAt: new Date().toISOString(),
    });
    const profile = getUserProfile();
    expect(profile?.name).toBe('Aziz');
    expect(profile?.targetBand).toBe(8);
  });
});
