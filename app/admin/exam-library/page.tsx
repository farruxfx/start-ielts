'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { LISTENING_TESTS } from '@/lib/listening-tests';

interface TestRow {
  id: string;
  title: string;
  description: string;
  skill: string;
  exam_type: string;
  difficulty: string;
  question_count: number;
  estimated_minutes: number;
  status: string;
  created_at: string;
}

const skillLabels: Record<string, string> = {
  reading: 'Reading',
  listening: 'Listening',
  writing: 'Writing',
  speaking: 'Speaking',
  mock: 'Mock Exam',
};

const skillColors: Record<string, string> = {
  reading: 'bg-blue-100 text-blue-700',
  listening: 'bg-green-100 text-green-700',
  writing: 'bg-orange-100 text-orange-700',
  speaking: 'bg-purple-100 text-purple-700',
  mock: 'bg-red-100 text-red-700',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const emptyForm = {
  title: '',
  description: '',
  skill: 'reading',
  exam_type: 'academic',
  difficulty: 'medium',
  question_count: 0,
  estimated_minutes: 60,
  status: 'published',
};

export default function ExamLibraryPage() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState('');

    const fetchTests = useCallback(async () => {
    setLoading(true);

    // Local listening tests from registry
    const localTests: TestRow[] = LISTENING_TESTS.map(t => ({
      id: 'local-' + t.id,
      title: t.title,
      description: t.category + ' listening test',
      skill: 'listening',
      exam_type: 'academic',
      difficulty: t.difficulty,
      question_count: t.questionCount,
      estimated_minutes: t.duration || 33,
      status: 'published',
      created_at: '2026-01-01T00:00:00Z',
    }));

    // Try supabase, but don't fail if it errors
    let dbTests: TestRow[] = [];
    try {
      let query = supabase.from('tests').select('*').order('created_at', { ascending: false });
      const { data } = await query;
      dbTests = (data || []) as TestRow[];
    } catch {
      // Supabase not configured — ignore
    }

    let combined = [...dbTests, ...localTests];

    if (skillFilter !== 'all') {
      combined = combined.filter(t => t.skill === skillFilter);
    }
    if (search) {
      combined = combined.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }

    setTotal(combined.length);
    setTests(combined.slice(page * pageSize, (page + 1) * pageSize));
    setLoading(false);
  }, [page, skillFilter, search]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Already filtered in fetchTests

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (test: TestRow) => {
    setEditingId(test.id);
    setForm({
      title: test.title,
      description: test.description,
      skill: test.skill,
      exam_type: test.exam_type,
      difficulty: test.difficulty,
      question_count: test.question_count,
      estimated_minutes: test.estimated_minutes,
      status: test.status,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    setSaving(true);
    setFormError(null);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('tests')
          .update({
            ...form,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tests').insert(form);
        if (error) throw error;
      }
      setShowForm(false);
      fetchTests();
    } catch {
      setFormError('Could not save the test. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('tests').delete().eq('id', deleteId);
    if (!error) {
      fetchTests();
    }
    setDeleteId(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage all IELTS practice tests.
          </p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Test
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'reading', 'listening', 'writing', 'speaking', 'mock'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setSkillFilter(s);
                setPage(0);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                skillFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {s === 'all' ? 'All' : skillLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skill</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading tests...
                  </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12">
                    <div className="flex flex-col items-center text-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-3 text-sm text-muted-foreground">No tests found.</p>
                      <Button onClick={openAddForm} variant="outline" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first test
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{test.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{test.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold', skillColors[test.skill])}>
                        {skillLabels[test.skill] || test.skill}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-muted-foreground">{test.exam_type}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-md px-2 py-0.5 text-xs font-semibold capitalize', difficultyColors[test.difficulty])}>
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{test.question_count}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{test.estimated_minutes} min</td>
                    <td className="px-4 py-3">
                      <Badge variant={test.status === 'published' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditForm(test)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteId(test.id);
                            setDeleteTitle(test.title);
                          }}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Test' : 'Create New Test'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Academic Reading Practice Test 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the test..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill">Skill</Label>
                <select
                  id="skill"
                  value={form.skill}
                  onChange={(e) => setForm({ ...form, skill: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                  <option value="mock">Mock Exam</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam_type">Exam Type</Label>
                <select
                  id="exam_type"
                  value={form.exam_type}
                  onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="academic">Academic</option>
                  <option value="general">General Training</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_count">Questions</Label>
                <Input
                  id="question_count"
                  type="number"
                  min={0}
                  value={form.question_count}
                  onChange={(e) => setForm({ ...form, question_count: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_minutes">Time (min)</Label>
                <Input
                  id="estimated_minutes"
                  type="number"
                  min={1}
                  value={form.estimated_minutes}
                  onChange={(e) => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTitle}&rdquo;? This action cannot be
              undone and will also delete all sections and questions within this test.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
