'use client';

import type { Skill } from './types';

// ── Types ────────────────────────────────────────────────────────

export interface StudentGroup {
  id: string;
  name: string;
  description: string;
  studentEmails: string[];
  createdBy: string;
  createdAt: string;
  color: string;
}

export interface TestAssignment {
  id: string;
  testId: string;              // original test id from platform
  testType: 'reading' | 'listening' | 'writing' | 'speaking';
  testTitle: string;           // display title
  code: string;                // unique short code for URL
  password?: string;           // optional password
  groupId?: string;            // assigned group
  assignedTo: string[];        // individual student emails
  visibility: 'anyone' | 'students_only' | 'selected_groups';
  timeLimitMinutes: number;
  showResultAfterSubmit: boolean;
  status: 'active' | 'inactive';
  createdBy: string;
  createdAt: string;
  submissions: TestSubmission[];
}

export interface TestSubmission {
  id: string;
  assignmentId: string;
  studentName: string;
  studentEmail: string;
  answers: Record<string, string>;
  score: number;
  correctCount: number;
  totalQuestions: number;
  band: number;
  timeSpentSeconds: number;
  status: 'auto_graded' | 'pending_review' | 'reviewed';
  teacherFeedback?: string;
  submittedAt: string;
}

// ── localStorage helpers ─────────────────────────────────────────

const KEYS = {
  ASSIGNMENTS: 'ieltspro_test_assignments',
  GROUPS: 'ieltspro_student_groups',
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

// ── Code Generator ───────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const existing = new Set(getAllAssignments().map(a => a.code));
  let code: string;
  do {
    code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existing.has(code));
  return code;
}

// ── Groups CRUD ─────────────────────────────────────────────────

export function getAllGroups(): StudentGroup[] {
  return safeGet<StudentGroup[]>(KEYS.GROUPS, []);
}

export function getGroupsByTeacher(email: string): StudentGroup[] {
  return getAllGroups().filter(g => g.createdBy === email);
}

export function createGroup(group: Omit<StudentGroup, 'id' | 'createdAt'>): StudentGroup {
  const all = getAllGroups();
  const newGroup: StudentGroup = {
    ...group,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(newGroup);
  safeSet(KEYS.GROUPS, all);
  return newGroup;
}

export function updateGroup(id: string, updates: Partial<StudentGroup>): StudentGroup | null {
  const all = getAllGroups();
  const idx = all.findIndex(g => g.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  safeSet(KEYS.GROUPS, all);
  return all[idx];
}

export function deleteGroup(id: string): boolean {
  const all = getAllGroups();
  const filtered = all.filter(g => g.id !== id);
  if (filtered.length === all.length) return false;
  safeSet(KEYS.GROUPS, filtered);
  return true;
}

export function addStudentToGroup(groupId: string, email: string): StudentGroup | null {
  const group = getAllGroups().find(g => g.id === groupId);
  if (!group) return null;
  if (group.studentEmails.includes(email)) return group;
  return updateGroup(groupId, { studentEmails: [...group.studentEmails, email] });
}

export function removeStudentFromGroup(groupId: string, email: string): StudentGroup | null {
  const group = getAllGroups().find(g => g.id === groupId);
  if (!group) return null;
  return updateGroup(groupId, { studentEmails: group.studentEmails.filter(e => e !== email) });
}

// ── Assignments CRUD ────────────────────────────────────────────

export function getAllAssignments(): TestAssignment[] {
  return safeGet<TestAssignment[]>(KEYS.ASSIGNMENTS, []);
}

export function getAssignmentById(id: string): TestAssignment | undefined {
  return getAllAssignments().find(a => a.id === id);
}

export function getAssignmentByCode(code: string): TestAssignment | undefined {
  return getAllAssignments().find(a => a.code === code);
}

export function getAssignmentsByTeacher(email: string): TestAssignment[] {
  return getAllAssignments().filter(a => a.createdBy === email);
}

export function createAssignment(data: {
  testId: string;
  testType: 'reading' | 'listening' | 'writing' | 'speaking';
  testTitle: string;
  password?: string;
  groupId?: string;
  assignedTo?: string[];
  visibility: 'anyone' | 'students_only' | 'selected_groups';
  timeLimitMinutes: number;
  showResultAfterSubmit: boolean;
  createdBy: string;
}): TestAssignment {
  const all = getAllAssignments();
  const newAssignment: TestAssignment = {
    ...data,
    id: crypto.randomUUID(),
    code: generateCode(),
    assignedTo: data.assignedTo || [],
    status: 'active',
    createdAt: new Date().toISOString(),
    submissions: [],
  };
  all.push(newAssignment);
  safeSet(KEYS.ASSIGNMENTS, all);
  return newAssignment;
}

export function updateAssignment(id: string, updates: Partial<TestAssignment>): TestAssignment | null {
  const all = getAllAssignments();
  const idx = all.findIndex(a => a.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...updates };
  safeSet(KEYS.ASSIGNMENTS, all);
  return all[idx];
}

export function deleteAssignment(id: string): boolean {
  const all = getAllAssignments();
  const filtered = all.filter(a => a.id !== id);
  if (filtered.length === all.length) return false;
  safeSet(KEYS.ASSIGNMENTS, filtered);
  return true;
}

export function toggleAssignmentStatus(id: string): TestAssignment | null {
  const assignment = getAssignmentById(id);
  if (!assignment) return null;
  return updateAssignment(id, { status: assignment.status === 'active' ? 'inactive' : 'active' });
}

// ── Submissions ──────────────────────────────────────────────────

export function addSubmissionToAssignment(
  assignmentId: string,
  sub: Omit<TestSubmission, 'id' | 'submittedAt' | 'assignmentId'>
): TestSubmission | null {
  const all = getAllAssignments();
  const idx = all.findIndex(a => a.id === assignmentId);
  if (idx < 0) return null;

  const newSub: TestSubmission = {
    ...sub,
    id: crypto.randomUUID(),
    assignmentId,
    submittedAt: new Date().toISOString(),
  };

  all[idx].submissions.push(newSub);
  safeSet(KEYS.ASSIGNMENTS, all);
  return newSub;
}

export function getSubmissionsForAssignment(assignmentId: string): TestSubmission[] {
  const assignment = getAssignmentById(assignmentId);
  return assignment?.submissions || [];
}

export function updateSubmission(
  assignmentId: string,
  submissionId: string,
  updates: Partial<TestSubmission>
): TestSubmission | null {
  const all = getAllAssignments();
  const aIdx = all.findIndex(a => a.id === assignmentId);
  if (aIdx < 0) return null;

  const sIdx = all[aIdx].submissions.findIndex(s => s.id === submissionId);
  if (sIdx < 0) return null;

  all[aIdx].submissions[sIdx] = { ...all[aIdx].submissions[sIdx], ...updates };
  safeSet(KEYS.ASSIGNMENTS, all);
  return all[aIdx].submissions[sIdx];
}

// ── Stats ────────────────────────────────────────────────────────

export function getAssignmentStats(assignmentId: string) {
  const subs = getSubmissionsForAssignment(assignmentId);
  if (subs.length === 0) {
    return { total: 0, avgScore: 0, avgBand: 0, avgTime: 0 };
  }
  const total = subs.length;
  const avgScore = Math.round(subs.reduce((a, s) => a + s.score, 0) / total);
  const avgBand = Math.round((subs.reduce((a, s) => a + s.band, 0) / total) * 10) / 10;
  const avgTime = Math.round(subs.reduce((a, s) => a + s.timeSpentSeconds, 0) / total);
  return { total, avgScore, avgBand, avgTime };
}

export function scoreToBand(score: number): number {
  if (score >= 95) return 9.0;
  if (score >= 90) return 8.5;
  if (score >= 83) return 8.0;
  if (score >= 75) return 7.5;
  if (score >= 65) return 7.0;
  if (score >= 55) return 6.5;
  if (score >= 45) return 6.0;
  if (score >= 38) return 5.5;
  if (score >= 30) return 5.0;
  if (score >= 23) return 4.5;
  if (score >= 15) return 4.0;
  if (score >= 8) return 3.5;
  return 3.0;
}
