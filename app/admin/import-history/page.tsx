'use client';

import { useState, useEffect } from 'react';
import {
  Clock, Search, Filter, Trash2, BarChart3, BookOpen, Headphones,
  PenTool, Mic, FileText, CheckCircle, AlertTriangle, XCircle,
  TrendingUp, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ImportHistoryEntry, ImportSkill } from '@/lib/import-types';
import { getImportHistory, clearHistory, getImportStats } from '@/lib/import-store';

function SkillIcon({ skill }: { skill: ImportSkill }) {
  switch (skill) {
    case 'reading': return <BookOpen className="h-4 w-4" />;
    case 'listening': return <Headphones className="h-4 w-4" />;
    case 'writing': return <PenTool className="h-4 w-4" />;
    case 'speaking': return <Mic className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
}

function SkillBadge({ skill }: { skill: ImportSkill }) {
  const colors: Record<string, string> = {
    reading: 'bg-blue-100 text-blue-700',
    listening: 'bg-green-100 text-green-700',
    writing: 'bg-amber-100 text-amber-700',
    speaking: 'bg-purple-100 text-purple-700',
    unknown: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', colors[skill])}>
      <SkillIcon skill={skill} />
      {skill}
    </span>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'needs_review': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default: return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

export default function ImportHistoryPage() {
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getImportStats> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState<ImportSkill | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    setHistory(getImportHistory());
    setStats(getImportStats());
  }, []);

  const filtered = history.filter(entry => {
    if (filterSkill !== 'all' && entry.skill !== filterSkill) return false;
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return entry.filename.toLowerCase().includes(q);
    }
    return true;
  });

  const handleClear = () => {
    if (confirm('Clear all import history?')) {
      clearHistory();
      setHistory([]);
      setStats(getImportStats());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all imported tests and their status.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" /> Clear History
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Imported</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold">{stats.totalImported}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Questions</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold">{stats.totalQuestions}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reading Tests</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold">{stats.bySkill.reading}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Listening Tests</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Headphones className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold">{stats.bySkill.listening}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filterSkill}
          onChange={e => setFilterSkill(e.target.value as any)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Skills</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
          <option value="writing">Writing</option>
          <option value="speaking">Speaking</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="needs_review">Needs Review</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* History table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Filename</th>
                <th className="px-4 py-3 text-left font-medium">Skill</th>
                <th className="px-4 py-3 text-left font-medium">Questions</th>
                <th className="px-4 py-3 text-left font-medium">Answers</th>
                <th className="px-4 py-3 text-left font-medium">Confidence</th>
                <th className="px-4 py-3 text-left font-medium">Warnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No import history found.</p>
                  </td>
                </tr>
              )}
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <StatusIcon status={entry.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(entry.importedAt).toLocaleDateString()} {new Date(entry.importedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{entry.filename}</td>
                  <td className="px-4 py-3"><SkillBadge skill={entry.skill} /></td>
                  <td className="px-4 py-3 text-center">{entry.totalQuestions}</td>
                  <td className="px-4 py-3 text-center">{entry.questionsWithAnswers}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full',
                            entry.confidence >= 90 ? 'bg-green-500' :
                            entry.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${entry.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{entry.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {entry.warnings.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> {entry.warnings.length}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
