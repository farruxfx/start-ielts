'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle, FileText, Copy, ExternalLink, Eye, Trash2, MoreHorizontal,
  BarChart3, Clock, Users, ToggleLeft, ToggleRight, CheckCircle, AlertCircle,
  Share2, Edit, Search, Filter, BookOpen, Headphones, PenTool, Mic, Lock, Link2
} from 'lucide-react';
import { useAuth } from '@/components/auth/use-auth';
import {
  getAssignmentsByTeacher, createAssignment, deleteAssignment, toggleAssignmentStatus,
  getAssignmentStats, getGroupsByTeacher, type TestAssignment, type StudentGroup
} from '@/lib/teacher-test-store';
import { READING_TESTS } from '@/lib/reading-tests';
import { LISTENING_TESTS } from '@/lib/listening-tests';
import { WRITING_TESTS } from '@/lib/writing-tests';
import { SPEAKING_TOPICS } from '@/lib/speaking-practice-data';
import { cn } from '@/lib/utils';

type SkillFilter = 'all' | 'reading' | 'listening' | 'writing' | 'speaking';

interface PlatformTest {
  id: string;
  title: string;
  skill: 'reading' | 'listening' | 'writing' | 'speaking';
  category: string;
  difficulty: string;
  questionCount: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<PlatformTest | null>(null);
  const [assignPassword, setAssignPassword] = useState('');
  const [assignGroup, setAssignGroup] = useState('');
  const [assignTime, setAssignTime] = useState(60);
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      setAssignments(getAssignmentsByTeacher(user.email));
      setGroups(getGroupsByTeacher(user.email));
    }
  }, [user]);

  const refresh = () => {
    if (user) {
      setAssignments(getAssignmentsByTeacher(user.email));
      setGroups(getGroupsByTeacher(user.email));
    }
  };

  // Build platform tests list
  const allPlatformTests: PlatformTest[] = [
    ...READING_TESTS.map(t => ({ id: t.id, title: t.title, skill: 'reading' as const, category: t.category, difficulty: t.difficulty, questionCount: t.questionCount })),
    ...LISTENING_TESTS.map(t => ({ id: t.id, title: t.title, skill: 'listening' as const, category: t.category, difficulty: t.difficulty, questionCount: t.questionCount })),
    ...WRITING_TESTS.map(t => ({ id: t.id, title: t.name, skill: 'writing' as const, category: t.task1.type, difficulty: t.difficulty, questionCount: 2 })),
    ...SPEAKING_TOPICS.map(t => ({ id: t.id, title: t.title, skill: 'speaking' as const, category: t.category, difficulty: t.difficulty, questionCount: 9 })),
  ];

  const filteredTests = allPlatformTests.filter(t => {
    const matchesSkill = skillFilter === 'all' || t.skill === skillFilter;
    const matchesSearch = searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSkill && matchesSearch;
  });

  const handleAssign = () => {
    if (!selectedTest || !user) return;
    createAssignment({
      testId: selectedTest.id,
      testType: selectedTest.skill,
      testTitle: selectedTest.title,
      password: assignPassword || undefined,
      groupId: assignGroup || undefined,
      visibility: assignGroup ? 'selected_groups' : 'anyone',
      timeLimitMinutes: assignTime,
      showResultAfterSubmit: true,
      createdBy: user.email,
    });
    setShowAssignModal(false);
    setSelectedTest(null);
    setAssignPassword('');
    setAssignGroup('');
    setAssignTime(60);
    refresh();
  };

  const handleCopyLink = (code: string, id: string) => {
    const url = `${window.location.origin}/test/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this assignment?')) {
      deleteAssignment(id);
      refresh();
    }
  };

  const filteredAssignments = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

  const skillIcons: Record<string, React.ReactNode> = {
    reading: <BookOpen className="h-4 w-4" />,
    listening: <Headphones className="h-4 w-4" />,
    writing: <PenTool className="h-4 w-4" />,
    speaking: <Mic className="h-4 w-4" />,
  };

  const skillColors: Record<string, string> = {
    reading: 'bg-emerald-100 text-emerald-700',
    listening: 'bg-violet-100 text-violet-700',
    writing: 'bg-rose-100 text-rose-700',
    speaking: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Panel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select from {allPlatformTests.length} platform tests and assign to students.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/teacher/groups"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all"
          >
            <Users className="h-4 w-4" />
            Groups ({groups.length})
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Assignments', value: assignments.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: assignments.filter(a => a.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Submissions', value: assignments.reduce((sum, a) => sum + a.submissions.length, 0), icon: Users, color: 'text-violet-600 bg-violet-50' },
          { label: 'Groups', value: groups.length, icon: Users, color: 'text-amber-600 bg-amber-50' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ PLATFORM TESTS — SELECT & ASSIGN ═══ */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Platform Tests ({filteredTests.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tests..."
                className="rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              />
            </div>
          </div>
        </div>

        {/* Skill filter tabs */}
        <div className="flex gap-2">
          {(['all', 'reading', 'listening', 'writing', 'speaking'] as const).map(f => (
            <button
              key={f}
              onClick={() => setSkillFilter(f)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                skillFilter === f
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {f !== 'all' && skillIcons[f]}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Tests grid */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {filteredTests.slice(0, 100).map(test => (
            <div key={`${test.skill}-${test.id}`} className="flex items-center justify-between rounded-xl border border-border bg-background p-3 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', skillColors[test.skill])}>
                  {skillIcons[test.skill]}
                  {test.skill}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{test.title}</p>
                  <p className="text-xs text-muted-foreground">{test.category} · {test.difficulty} · {test.questionCount} Q</p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedTest(test); setShowAssignModal(true); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all flex-shrink-0 ml-3"
              >
                <Share2 className="h-3.5 w-3.5" />
                Assign
              </button>
            </div>
          ))}
          {filteredTests.length > 100 && (
            <p className="text-center text-xs text-muted-foreground py-2">
              Showing 100 of {filteredTests.length} tests. Use search to find specific tests.
            </p>
          )}
        </div>
      </div>

      {/* ═══ MY ASSIGNMENTS ═══ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">My Assignments ({filteredAssignments.length})</h2>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  filter === f
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No assignments yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Select a test from above and assign it to students.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssignments.map(assignment => {
              const stats = { total: assignment.submissions.length, avgScore: 0, avgBand: 0 };
              return (
                <div key={assignment.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold truncate">{assignment.testTitle}</h3>
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', skillColors[assignment.testType])}>
                          {skillIcons[assignment.testType]}
                          {assignment.testType}
                        </span>
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          assignment.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        )}>
                          {assignment.status}
                        </span>
                        {assignment.password && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            <Lock className="h-3 w-3" /> Protected
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{assignment.timeLimitMinutes} min</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{stats.total} submissions</span>
                        {assignment.groupId && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {groups.find(g => g.id === assignment.groupId)?.name || 'Group'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleCopyLink(assignment.code, assignment.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-all"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedId === assignment.id ? 'Copied!' : 'Copy Link'}
                      </button>

                      <Link
                        href={`/test/${assignment.code}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-all"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Preview
                      </Link>

                      <button
                        onClick={() => { toggleAssignmentStatus(assignment.id); refresh(); }}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                          assignment.status === 'active'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        {assignment.status === 'active' ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="inline-flex items-center rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ ASSIGN MODAL ═══ */}
      {showAssignModal && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}>
          <div className="rounded-2xl bg-card border border-border p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Assign Test to Students</h2>

            {/* Selected test info */}
            <div className="rounded-xl bg-muted/30 p-4 mb-4">
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', skillColors[selectedTest.skill])}>
                  {skillIcons[selectedTest.skill]}
                  {selectedTest.skill}
                </span>
                <span className="text-xs text-muted-foreground">{selectedTest.category}</span>
              </div>
              <p className="text-sm font-medium mt-2">{selectedTest.title}</p>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password (optional)</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={assignPassword}
                  onChange={e => setAssignPassword(e.target.value)}
                  placeholder="Leave empty for no password"
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Group */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assign to Group (optional)</label>
              <select
                value={assignGroup}
                onChange={e => setAssignGroup(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Anyone with the link</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.studentEmails.length} students)</option>
                ))}
              </select>
            </div>

            {/* Time limit */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Limit (minutes)</label>
              <input
                type="number"
                min={5}
                max={180}
                value={assignTime}
                onChange={e => setAssignTime(parseInt(e.target.value) || 60)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
              >
                Assign Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
