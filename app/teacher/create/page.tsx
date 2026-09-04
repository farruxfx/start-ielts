'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp, Copy, Check, ArrowLeft,
  Save, Eye, Settings, FileText
} from 'lucide-react';
import { useAuth } from '@/components/auth/use-auth';
import {
  createTest, type TeacherQuestion, type TeacherPassage, type TeacherQuestionType,
  type AccessSettings, type TeacherTest
} from '@/lib/teacher-test-store';
import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/types';

const skillOptions: { value: Skill; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'listening', label: 'Listening' },
  { value: 'writing', label: 'Writing' },
  { value: 'speaking', label: 'Speaking' },
];

const questionTypes: { value: TeacherQuestionType; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false_not_given', label: 'True / False / Not Given' },
  { value: 'yes_no_not_given', label: 'Yes / No / Not Given' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'sentence_completion', label: 'Sentence Completion' },
  { value: 'essay', label: 'Essay (Teacher Review)' },
];

const defaultOptions = ['A', 'B', 'C', 'D'];

export default function CreateTestPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState<Skill>('reading');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [passages, setPassages] = useState<TeacherPassage[]>([]);
  const [access, setAccess] = useState<AccessSettings>({
    visibility: 'anyone',
    maxAttempts: 1,
    timeLimitMinutes: 60,
    showResultAfterSubmit: true,
    allowRetake: false,
  });
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>('draft');
  const [saved, setSaved] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [showAccessSettings, setShowAccessSettings] = useState(false);

  // ── Add question ──
  const addQuestion = () => {
    const newQ: TeacherQuestion = {
      id: crypto.randomUUID(),
      type: 'multiple_choice',
      number: questions.length + 1,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
    };
    setQuestions([...questions, newQ]);
    setExpandedQ(newQ.id);
  };

  const updateQuestion = (id: string, updates: Partial<TeacherQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    const filtered = questions.filter(q => q.id !== id).map((q, i) => ({ ...q, number: i + 1 }));
    setQuestions(filtered);
    if (expandedQ === id) setExpandedQ(null);
  };

  const moveQuestion = (id: string, dir: 'up' | 'down') => {
    const idx = questions.findIndex(q => q.id === id);
    if (idx < 0) return;
    const arr = [...questions];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setQuestions(arr.map((q, i) => ({ ...q, number: i + 1 })));
  };

  // ── Passages ──
  const addPassage = () => {
    setPassages([...passages, { id: crypto.randomUUID(), title: `Passage ${passages.length + 1}`, content: '' }]);
  };

  const updatePassage = (id: string, updates: Partial<TeacherPassage>) => {
    setPassages(passages.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePassage = (id: string) => {
    setPassages(passages.filter(p => p.id !== id));
  };

  // ── Save ──
  const handleSave = (publishStatus: 'active' | 'inactive' | 'draft') => {
    if (!title.trim()) {
      alert('Please enter a test title.');
      return;
    }
    if (questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }

    const test = createTest({
      title: title.trim(),
      skill,
      description: description.trim(),
      questions,
      passages: passages.length > 0 ? passages : undefined,
      access,
      status: publishStatus,
      createdBy: user?.email || '',
    });

    setSaved(true);
    setTimeout(() => router.push('/teacher'), 800);
  };

  // ── Render question editor ──
  const renderQuestionEditor = (q: TeacherQuestion) => {
    const isExpanded = expandedQ === q.id;

    return (
      <div key={q.id} className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Question header */}
        <button
          onClick={() => setExpandedQ(isExpanded ? null : q.id)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {q.number}
            </span>
            <span className="text-sm font-medium truncate max-w-xs">
              {q.text || 'Untitled question'}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {questionTypes.find(t => t.value === q.type)?.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 'up'); }} className="p-1 hover:bg-muted rounded"><ChevronUp className="h-3.5 w-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 'down'); }} className="p-1 hover:bg-muted rounded"><ChevronDown className="h-3.5 w-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"><Trash2 className="h-3.5 w-3.5" /></button>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>

        {/* Question body */}
        {isExpanded && (
          <div className="border-t border-border p-4 space-y-4 bg-muted/10">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question Type</label>
                <select
                  value={q.type}
                  onChange={e => updateQuestion(q.id, { type: e.target.value as TeacherQuestionType })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {questionTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={q.points}
                  onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) || 1 })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Question text */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question Text</label>
              <textarea
                value={q.text}
                onChange={e => updateQuestion(q.id, { text: e.target.value })}
                placeholder="Enter the question text..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>

            {/* Options (for MC) */}
            {q.type === 'multiple_choice' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Answer Options</label>
                <div className="mt-2 space-y-2">
                  {(q.options || ['', '', '', '']).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        value={opt}
                        onChange={e => {
                          const opts = [...(q.options || ['', '', '', ''])];
                          opts[i] = e.target.value;
                          updateQuestion(q.id, { options: opts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        onClick={() => updateQuestion(q.id, { correctAnswer: String.fromCharCode(65 + i) })}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all',
                          q.correctAnswer === String.fromCharCode(65 + i)
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-border text-muted-foreground hover:border-emerald-300'
                        )}
                        title="Mark as correct"
                      >
                        {String.fromCharCode(65 + i)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* True/False/Not Given */}
            {(q.type === 'true_false_not_given' || q.type === 'yes_no_not_given') && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correct Answer</label>
                <div className="mt-2 flex gap-2">
                  {(q.type === 'true_false_not_given' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateQuestion(q.id, { correctAnswer: opt })}
                      className={cn(
                        'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
                        q.correctAnswer === opt
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border bg-background hover:border-emerald-300'
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Short Answer / Fill Blank / Sentence Completion */}
            {['short_answer', 'fill_blank', 'sentence_completion'].includes(q.type) && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Correct Answer</label>
                <input
                  value={q.correctAnswer}
                  onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                  placeholder="Enter the correct answer..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}

            {/* Essay */}
            {q.type === 'essay' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rubric / Grading Criteria</label>
                <textarea
                  value={q.rubric || ''}
                  onChange={e => updateQuestion(q.id, { rubric: e.target.value })}
                  placeholder="Describe what the student should write and how it will be graded..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                />
                <p className="mt-1 text-xs text-muted-foreground">This question will require teacher review after submission.</p>
              </div>
            )}

            {/* Matching */}
            {q.type === 'matching' && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Matching Pairs (format: "A: ... = B: ...")</label>
                <textarea
                  value={q.correctAnswer}
                  onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                  placeholder={"A: First item = B: Matched item\nA: Second item = C: Matched item"}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-xl font-bold tracking-tight">Create Test</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-all"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('active')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-all"
          >
            <Check className="h-4 w-4" />
            Publish
          </button>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-700">
          ✅ Test created successfully! Redirecting...
        </div>
      )}

      {/* Test details */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-bold">Test Details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., IELTS Reading Practice #01"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skill *</label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value as Skill)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {skillOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this test..."
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
          </div>
        </div>
      </div>

      {/* Passages (Reading) */}
      {skill === 'reading' && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Passages</h2>
            <button
              onClick={addPassage}
              className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/80 transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Passage
            </button>
          </div>

          {passages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No passages added. Add a passage for Reading tests.</p>
          )}

          {passages.map(p => (
            <div key={p.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  value={p.title}
                  onChange={e => updatePassage(p.id, { title: e.target.value })}
                  className="text-sm font-bold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                />
                <button onClick={() => removePassage(p.id)} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                value={p.content}
                onChange={e => updatePassage(p.id, { content: e.target.value })}
                placeholder="Paste the reading passage here..."
                rows={8}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              />
            </div>
          ))}
        </div>
      )}

      {/* Questions */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Questions ({questions.length})</h2>
          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">No questions added yet. Click &quot;Add Question&quot; to start.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map(q => renderQuestionEditor(q))}
          </div>
        )}
      </div>

      {/* Access Settings */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowAccessSettings(!showAccessSettings)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-bold">Access Settings</h2>
              <p className="text-xs text-muted-foreground">Who can take this test and how</p>
            </div>
          </div>
          {showAccessSettings ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>

        {showAccessSettings && (
          <div className="border-t border-border p-6 space-y-4">
            {/* Visibility */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Who can access?</label>
              <div className="mt-2 space-y-2">
                {[
                  { value: 'anyone', label: 'Anyone with the link', desc: 'Anyone who has the link can take the test' },
                  { value: 'students_only', label: 'Only my students', desc: 'Only registered students can take the test' },
                  { value: 'selected_groups', label: 'Only selected groups', desc: 'Only specific student groups' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={access.visibility === opt.value}
                      onChange={() => setAccess({ ...access, visibility: opt.value as any })}
                      className="h-4 w-4 accent-primary"
                    />
                    <div>
                      <span className="text-sm font-medium">{opt.label}</span>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Max attempts */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Attempts</label>
                <select
                  value={access.maxAttempts}
                  onChange={e => setAccess({ ...access, maxAttempts: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={1}>1 attempt</option>
                  <option value={2}>2 attempts</option>
                  <option value={3}>3 attempts</option>
                  <option value={999}>Unlimited</option>
                </select>
              </div>

              {/* Time limit */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Limit (minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={access.timeLimitMinutes}
                  onChange={e => setAccess({ ...access, timeLimitMinutes: parseInt(e.target.value) || 60 })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={access.showResultAfterSubmit}
                  onChange={e => setAccess({ ...access, showResultAfterSubmit: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                Show results after submission
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={access.allowRetake}
                  onChange={e => setAccess({ ...access, allowRetake: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                Allow retake
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
