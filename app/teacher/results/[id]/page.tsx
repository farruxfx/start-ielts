'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Clock, BarChart3, FileText, CheckCircle } from 'lucide-react';
import { getAssignmentById, getSubmissionsForAssignment, type TestAssignment, type TestSubmission } from '@/lib/teacher-test-store';
import { cn } from '@/lib/utils';

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<TestAssignment | null>(null);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);

  useEffect(() => {
    if (id) {
      const found = getAssignmentById(id);
      if (found) {
        setAssignment(found);
        setSubmissions(getSubmissionsForAssignment(id));
      }
    }
  }, [id]);

  if (!assignment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const avgScore = submissions.length > 0 ? Math.round(submissions.reduce((a, s) => a + s.score, 0) / submissions.length) : 0;
  const avgBand = submissions.length > 0 ? Math.round((submissions.reduce((a, s) => a + s.band, 0) / submissions.length) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/teacher" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="text-xl font-bold tracking-tight">Results: {assignment.testTitle}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Submissions</p>
          <p className="mt-1 text-2xl font-bold">{submissions.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Avg Score</p>
          <p className="mt-1 text-2xl font-bold">{avgScore}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Avg Band</p>
          <p className="mt-1 text-2xl font-bold">{avgBand}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-bold capitalize">{assignment.status}</p>
        </div>
      </div>

      {/* Submissions list */}
      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No submissions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Students haven't taken this test yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Band</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{sub.studentName}</p>
                    <p className="text-xs text-muted-foreground">{sub.studentEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{sub.score}%</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
                      sub.band >= 7 ? 'bg-emerald-100 text-emerald-700' :
                      sub.band >= 5 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {sub.band}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      sub.status === 'auto_graded' ? 'bg-blue-50 text-blue-700' :
                      sub.status === 'pending_review' ? 'bg-amber-50 text-amber-700' :
                      'bg-emerald-50 text-emerald-700'
                    )}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
