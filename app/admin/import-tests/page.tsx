'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileText, CheckCircle, AlertTriangle, XCircle, Eye,
  Trash2, Play, RotateCcw, Download, Filter, Search, ChevronDown,
  ChevronRight, Clock, BarChart3, BookOpen, Headphones, PenTool,
  Mic, Loader2, X, Check, AlertCircle, FileCode, Zap, Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  parseHtmlTest, checkDuplicate,
} from '@/lib/html-parser';
import type {
  ImportedTest, ImportedQuestion, ImportFile,
  ImportJob, ImportHistoryEntry, ImportSkill,
  ConfidenceLevel, DuplicateAction,
} from '@/lib/import-types';
import {
  getImportJobs, saveImportJob, createImportJob,
  updateImportFile, getDrafts, saveDraft, deleteDraft,
  publishDraft, addToHistory, getImportHistory,
} from '@/lib/import-store';

// ===== Skill Icons =====
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
    reading: 'bg-blue-100 text-blue-700 border-blue-200',
    listening: 'bg-green-100 text-green-700 border-green-200',
    writing: 'bg-amber-100 text-amber-700 border-amber-200',
    speaking: 'bg-purple-100 text-purple-700 border-purple-200',
    unknown: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', colors[skill])}>
      <SkillIcon skill={skill} />
      {skill}
    </span>
  );
}

function ConfidenceBadge({ confidence, level }: { confidence: number; level: ConfidenceLevel }) {
  const colors: Record<string, string> = {
    ready: 'bg-green-100 text-green-700 border-green-200',
    review: 'bg-amber-100 text-amber-700 border-amber-200',
    needs_review: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', colors[level])}>
      {level === 'ready' ? <CheckCircle className="h-3 w-3" /> :
       level === 'review' ? <AlertTriangle className="h-3 w-3" /> :
       <XCircle className="h-3 w-3" />}
      {confidence}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    needs_review: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', colors[status] || colors.pending)}>
      {status.replace('_', ' ')}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== Main Page =====
export default function ImportTestsPage() {
  const [view, setView] = useState<'upload' | 'analysis' | 'drafts' | 'history'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [parsedTests, setParsedTests] = useState<ImportedTest[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState({ current: 0, total: 0 });
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState<ImportSkill | 'all'>('all');
  const [filterConfidence, setFilterConfidence] = useState<ConfidenceLevel | 'all'>('all');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingDuplicate, setPendingDuplicate] = useState<{ test: ImportedTest; check: { isDuplicate: boolean; matchedBy: string; confidence: number } } | null>(null);
  const [drafts, setDrafts] = useState<ImportedTest[]>([]);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [editingTest, setEditingTest] = useState<ImportedTest | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrafts(getDrafts());
    setHistory(getImportHistory());
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ===== Drag & Drop =====
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f =>
      f.name.endsWith('.html') || f.name.endsWith('.htm')
    );
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
      showToast('info', `${droppedFiles.length} file(s) added`);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(f =>
      f.name.endsWith('.html') || f.name.endsWith('.htm')
    );
    setFiles(prev => [...prev, ...selectedFiles]);
    showToast('info', `${selectedFiles.length} file(s) added`);
  };

  // ===== Parse Files =====
  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProcessProgress({ current: 0, total: files.length });
    const results: ImportedTest[] = [];

    for (let i = 0; i < files.length; i++) {
      setProcessProgress({ current: i + 1, total: files.length });
      try {
        const content = await files[i].text();
        const test = parseHtmlTest(content, files[i].name);
        results.push(test);
      } catch (err) {
        showToast('error', `Failed to parse ${files[i].name}`);
      }
    }

    // Check duplicates
    const existingDrafts = getDrafts();
    const existingHistory = getImportHistory();
    const allExisting = [
      ...existingDrafts.map(d => ({ filename: d.filename, title: d.title, contentHash: d.contentHash })),
      ...existingHistory.map(h => ({ filename: h.filename, title: h.filename, contentHash: '' })),
    ];

    const withDuplicates = results.map(test => {
      const dupCheck = checkDuplicate(test, allExisting);
      return { test, dupCheck };
    });

    // Auto-import non-duplicates
    const finalTests: ImportedTest[] = [];
    for (const { test, dupCheck } of withDuplicates) {
      if (dupCheck.isDuplicate && dupCheck.confidence > 80) {
        // Show duplicate dialog
        setPendingDuplicate({ test, check: dupCheck });
        setShowDuplicateDialog(true);
        // For now, mark as needing review
        test.warnings.push(`Possible duplicate: matched by ${dupCheck.matchedBy} (${dupCheck.confidence}%)`);
      }
      finalTests.push(test);
    }

    setParsedTests(finalTests);
    setSelectedTests(new Set(finalTests.map(t => t.id)));
    setProcessing(false);
    setView('analysis');
    showToast('success', `Analyzed ${results.length} files`);
  };

  // ===== Import Selected =====
  const handleImportSelected = () => {
    const selected = parsedTests.filter(t => selectedTests.has(t.id));
    if (selected.length === 0) {
      showToast('error', 'No tests selected');
      return;
    }

    // Save as drafts
    selected.forEach(test => {
      saveDraft(test);

      // Add to history
      addToHistory({
        id: test.id,
        filename: test.filename,
        skill: test.skill,
        testType: test.testType,
        totalQuestions: test.totalQuestions,
        questionsWithAnswers: test.questionsWithAnswers,
        confidence: test.confidence,
        status: test.confidenceLevel === 'ready' ? 'completed' : 'needs_review',
        importedAt: new Date().toISOString(),
        warnings: test.warnings,
        errors: test.errors,
      });
    });

    setDrafts(getDrafts());
    setHistory(getImportHistory());
    showToast('success', `${selected.length} test(s) imported to drafts`);
    setView('drafts');
  };

  // ===== Publish =====
  const handlePublish = (testId: string) => {
    const result = publishDraft(testId);
    if (result) {
      setDrafts(getDrafts());
      setHistory(getImportHistory());
      showToast('success', `"${result.title}" published!`);
    }
  };

  // ===== Delete =====
  const handleDeleteDraft = (testId: string) => {
    deleteDraft(testId);
    setDrafts(getDrafts());
    showToast('info', 'Draft deleted');
  };

  // ===== Filtered Tests =====
  const filteredTests = (view === 'analysis' ? parsedTests : view === 'drafts' ? drafts : []).filter(test => {
    if (filterSkill !== 'all' && test.skill !== filterSkill) return false;
    if (filterConfidence !== 'all' && test.confidenceLevel !== filterConfidence) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return test.title.toLowerCase().includes(q) || test.filename.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={cn(
          'fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all',
          toastMessage.type === 'success' && 'bg-green-600 text-white',
          toastMessage.type === 'error' && 'bg-red-600 text-white',
          toastMessage.type === 'info' && 'bg-blue-600 text-white',
        )}>
          {toastMessage.type === 'success' ? <Check className="h-4 w-4" /> :
           toastMessage.type === 'error' ? <X className="h-4 w-4" /> :
           <AlertCircle className="h-4 w-4" />}
          {toastMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Tests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bulk import IELTS tests from HTML files. Analyze, preview, and publish.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setView('upload')}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Button variant={view === 'analysis' ? 'default' : 'outline'} size="sm" onClick={() => setView('analysis')}>
            <BarChart3 className="mr-2 h-4 w-4" /> Analysis ({parsedTests.length})
          </Button>
          <Button variant={view === 'drafts' ? 'default' : 'outline'} size="sm" onClick={() => setView('drafts')}>
            <FileText className="mr-2 h-4 w-4" /> Drafts ({drafts.length})
          </Button>
          <Button variant={view === 'history' ? 'default' : 'outline'} size="sm" onClick={() => setView('history')}>
            <Clock className="mr-2 h-4 w-4" /> History ({history.length})
          </Button>
        </div>
      </div>

      {/* ===== UPLOAD VIEW ===== */}
      {view === 'upload' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer',
              'hover:border-primary/50 hover:bg-primary/5',
              files.length > 0 ? 'border-green-300 bg-green-50/50' : 'border-border'
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Drop HTML files here</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse. Accepts .html and .htm files.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports bulk import of 200+ files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-semibold">{files.length} file(s) selected</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                    <Trash2 className="mr-1 h-3 w-3" /> Clear All
                  </Button>
                  <Button size="sm" onClick={handleAnalyze} disabled={processing}>
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing {processProgress.current}/{processProgress.total}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Analyze Files
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-border">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <FileCode className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, j) => j !== i)); }}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing progress */}
          {processing && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">Processing files...</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(processProgress.current / processProgress.total) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {processProgress.current} of {processProgress.total} files analyzed
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== ANALYSIS VIEW ===== */}
      {view === 'analysis' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests..."
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
              <option value="unknown">Unknown</option>
            </select>
            <select
              value={filterConfidence}
              onChange={e => setFilterConfidence(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Confidence</option>
              <option value="ready">Ready (90%+)</option>
              <option value="review">Review (70-89%)</option>
              <option value="needs_review">Needs Review (&lt;70%)</option>
            </select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTests(new Set(filteredTests.map(t => t.id)))}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTests(new Set())}>
                Deselect All
              </Button>
              <Button size="sm" onClick={handleImportSelected} disabled={selectedTests.size === 0}>
                <Download className="mr-2 h-4 w-4" />
                Import Selected ({selectedTests.size})
              </Button>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: parsedTests.length, icon: FileText },
              { label: 'Reading', value: parsedTests.filter(t => t.skill === 'reading').length, icon: BookOpen },
              { label: 'Listening', value: parsedTests.filter(t => t.skill === 'listening').length, icon: Headphones },
              { label: 'Writing', value: parsedTests.filter(t => t.skill === 'writing').length, icon: PenTool },
              { label: 'Speaking', value: parsedTests.filter(t => t.skill === 'speaking').length, icon: Mic },
            ].map(stat => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <stat.icon className="h-3 w-3" /> {stat.label}
                </div>
                <div className="mt-1 text-2xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Test cards */}
          <div className="space-y-3">
            {filteredTests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No tests found. {parsedTests.length === 0 ? 'Upload and analyze files first.' : 'Try adjusting filters.'}
              </div>
            )}

            {filteredTests.map(test => (
              <div key={test.id} className="rounded-xl border border-border bg-card overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 p-4">
                  <input
                    type="checkbox"
                    checked={selectedTests.has(test.id)}
                    onChange={e => {
                      const next = new Set(selectedTests);
                      if (e.target.checked) next.add(test.id);
                      else next.delete(test.id);
                      setSelectedTests(next);
                    }}
                    className="h-4 w-4 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{test.title}</span>
                      <SkillBadge skill={test.skill} />
                      <ConfidenceBadge confidence={test.confidence} level={test.confidenceLevel} />
                      {test.warnings.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" /> {test.warnings.length} warning(s)
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{test.filename}</span>
                      <span>{test.totalQuestions} questions</span>
                      <span>{test.passages.length || test.sections.length || 0} sections</span>
                      <span>{test.estimatedMinutes} min</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
                  >
                    {expandedTest === test.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Expanded details */}
                {expandedTest === test.id && (
                  <div className="border-t border-border p-4 space-y-4 bg-muted/30">
                    {/* Warnings & Errors */}
                    {(test.warnings.length > 0 || test.errors.length > 0) && (
                      <div className="space-y-2">
                        {test.warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            {w}
                          </div>
                        ))}
                        {test.errors.map((e, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-2">
                            <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            {e}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Passages */}
                    {test.passages.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Passages ({test.passages.length})</h4>
                        {test.passages.map(p => (
                          <div key={p.id} className="rounded-lg border border-border bg-card p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{p.title}</span>
                              <span className="text-xs text-muted-foreground">{p.wordCount} words · {p.questions.length} questions</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.content.substring(0, 200)}...</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sections */}
                    {test.sections.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Sections ({test.sections.length})</h4>
                        {test.sections.map(s => (
                          <div key={s.id} className="rounded-lg border border-border bg-card p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{s.title}</span>
                              <div className="flex items-center gap-2">
                                {s.audioMissing && <Badge variant="outline" className="text-xs">No Audio</Badge>}
                                <span className="text-xs text-muted-foreground">{s.questions.length} questions</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Questions preview */}
                    {test.totalQuestions > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Questions ({test.totalQuestions} total, {test.questionsWithAnswers} with answers)
                        </h4>
                        <div className="max-h-60 overflow-y-auto rounded-lg border border-border bg-card divide-y divide-border">
                          {(test.passages.flatMap(p => p.questions) || test.sections.flatMap(s => s.questions) || []).slice(0, 10).map((q, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 text-xs">
                              <span className="shrink-0 w-6 text-center font-bold text-muted-foreground">{q.number}</span>
                              <div className="flex-1 min-w-0">
                                <span className="line-clamp-1">{q.question}</span>
                                {q.options.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {q.options.slice(0, 4).map((opt, j) => (
                                      <span key={j} className="rounded bg-muted px-1.5 py-0.5 text-xs">{opt}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {q.correctAnswer && (
                                <Badge variant="outline" className="shrink-0 text-xs bg-green-50">{q.correctAnswer}</Badge>
                              )}
                              {q.needsReview && (
                                <Badge variant="outline" className="shrink-0 text-xs bg-amber-50">Review</Badge>
                              )}
                            </div>
                          ))}
                          {(test.passages.flatMap(p => p.questions) || test.sections.flatMap(s => s.questions) || []).length > 10 && (
                            <div className="p-2 text-xs text-muted-foreground text-center">
                              + {(test.passages.flatMap(p => p.questions) || test.sections.flatMap(s => s.questions) || []).length - 10} more questions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== DRAFTS VIEW ===== */}
      {view === 'drafts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drafts..."
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
          </div>

          {drafts.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No drafts yet</h3>
              <p className="mt-1">Upload and analyze HTML files to create drafts.</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTests.map(test => (
              <div key={test.id} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{test.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{test.filename}</p>
                  </div>
                  <SkillBadge skill={test.skill} />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{test.totalQuestions} questions</span>
                  <span>{test.estimatedMinutes} min</span>
                  <ConfidenceBadge confidence={test.confidence} level={test.confidenceLevel} />
                </div>

                {test.warnings.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {test.warnings.length} warning(s)
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => handlePublish(test.id)}>
                    <Check className="mr-1 h-3 w-3" /> Publish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingTest(test); setExpandedTest(test.id); }}>
                    <Eye className="mr-1 h-3 w-3" /> View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteDraft(test.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== HISTORY VIEW ===== */}
      {view === 'history' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Filename</th>
                    <th className="px-4 py-3 text-left font-medium">Skill</th>
                    <th className="px-4 py-3 text-left font-medium">Questions</th>
                    <th className="px-4 py-3 text-left font-medium">Confidence</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No import history yet.
                      </td>
                    </tr>
                  )}
                  {history.map(entry => (
                    <tr key={entry.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(entry.importedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{entry.filename}</td>
                      <td className="px-4 py-3"><SkillBadge skill={entry.skill} /></td>
                      <td className="px-4 py-3">{entry.totalQuestions}</td>
                      <td className="px-4 py-3">
                        <ConfidenceBadge confidence={entry.confidence} level={
                          entry.confidence >= 90 ? 'ready' : entry.confidence >= 70 ? 'review' : 'needs_review'
                        } />
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={entry.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== DUPLICATE DIALOG ===== */}
      {showDuplicateDialog && pendingDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Possible Duplicate</h3>
                <p className="text-sm text-muted-foreground">
                  Matched by {pendingDuplicate.check.matchedBy} ({pendingDuplicate.check.confidence}%)
                </p>
              </div>
            </div>
            <p className="text-sm mb-4">
              <strong>{pendingDuplicate.test.title}</strong> may be a duplicate of an existing test.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowDuplicateDialog(false); setPendingDuplicate(null); }}>
                Skip
              </Button>
              <Button variant="outline" onClick={() => {
                if (pendingDuplicate) {
                  const test = { ...pendingDuplicate.test, warnings: [...pendingDuplicate.test.warnings, 'Imported as duplicate'] };
                  saveDraft(test);
                  setDrafts(getDrafts());
                }
                setShowDuplicateDialog(false);
                setPendingDuplicate(null);
                showToast('info', 'Imported anyway');
              }}>
                Import Anyway
              </Button>
              <Button onClick={() => {
                if (pendingDuplicate) {
                  saveDraft(pendingDuplicate.test);
                  setDrafts(getDrafts());
                }
                setShowDuplicateDialog(false);
                setPendingDuplicate(null);
                showToast('success', 'Imported (replace)');
              }}>
                Replace
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
