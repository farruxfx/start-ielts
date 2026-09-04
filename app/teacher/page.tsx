'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle, FileText, Copy, ExternalLink, Eye, Trash2, MoreHorizontal,
  BarChart3, Clock, Users, ToggleLeft, ToggleRight, CheckCircle, AlertCircle,
  Share2, Edit
} from 'lucide-react';
import { useAuth } from '@/components/auth/use-auth';
import {
  getTestsByTeacher, deleteTest, toggleTestStatus, getTestStats,
  type TeacherTest
} from '@/lib/teacher-test-store';
import { cn } from '@/lib/utils';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TeacherTest[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');

  useEffect(() => {
    if (user) {
      const all = getTestsByTeacher(user.email);
      setTests(all);
    }
  }, [user]);

  const refreshTests = () => {
    if (user) setTests(getTestsByTeacher(user.email));
  };

  const handleCopyLink = (code: string, id: string) => {
    const url = `${window.location.origin}/test/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      deleteTest(id);
      refreshTests();
    }
  };

  const handleToggle = (id: string) => {
    toggleTestStatus(id);
    refreshTests();
  };

  const filtered = filter === 'all' ? tests : tests.filter(t => t.status === filter);

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
          <p className="mt-1 text-sm text-muted-foreground">Create, manage and track your IELTS tests.</p>
        </div>
        <Link
          href="/teacher/create"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          Create Test
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Tests', value: tests.length, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: tests.filter(t => t.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Inactive', value: tests.filter(t => t.status === 'inactive').length, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Drafts', value: tests.filter(t => t.status === 'draft').length, icon: Edit, color: 'text-gray-600 bg-gray-50' },
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

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'inactive', 'draft'] as const).map(f => (
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

      {/* Tests list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No tests yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first test to get started.</p>
          <Link
            href="/teacher/create"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <PlusCircle className="h-4 w-4" />
            Create Test
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(test => {
            const stats = getTestStats(test.id);
            return (
              <div key={test.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold truncate">{test.title}</h3>
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', skillColors[test.skill] || 'bg-gray-100 text-gray-700')}>
                        {test.skill}
                      </span>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        test.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        test.status === 'inactive' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {test.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{test.description || 'No description'}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{test.questions.length} questions</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{test.access.timeLimitMinutes} min</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{stats.total} submissions</span>
                      {stats.total > 0 && (
                        <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />Avg: {stats.avgBand}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopyLink(test.code, test.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-all"
                      title="Copy link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedId === test.id ? 'Copied!' : 'Link'}
                    </button>

                    {/* Preview */}
                    <Link
                      href={`/test/${test.code}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Link>

                    {/* Results */}
                    <Link
                      href={`/teacher/results/${test.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-all"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      Results
                    </Link>

                    {/* Toggle status */}
                    <button
                      onClick={() => handleToggle(test.id)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                        test.status === 'active'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {test.status === 'active' ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      {test.status === 'active' ? 'Active' : 'Off'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(test.id)}
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
  );
}
