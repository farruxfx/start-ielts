import type {
  ImportJob,
  ImportFile,
  ImportedTest,
  ImportHistoryEntry,
  ImportStatus,
} from './import-types';

const STORAGE_KEY = 'ieltspro_import_jobs';
const HISTORY_KEY = 'ieltspro_import_history';
const DRAFTS_KEY = 'ieltspro_import_drafts';

// ===== Job CRUD =====
export function getImportJobs(): ImportJob[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveImportJob(job: ImportJob): void {
  const jobs = getImportJobs();
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx >= 0) jobs[idx] = job;
  else jobs.unshift(job);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function getImportJob(id: string): ImportJob | undefined {
  return getImportJobs().find(j => j.id === id);
}

export function deleteImportJob(id: string): void {
  const jobs = getImportJobs().filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

// ===== File CRUD =====
export function updateImportFile(jobId: string, fileId: string, updates: Partial<ImportFile>): void {
  const job = getImportJob(jobId);
  if (!job) return;
  const file = job.files.find(f => f.id === fileId);
  if (file) {
    Object.assign(file, updates);
    if (updates.status) {
      if (updates.status === 'completed') job.completedFiles++;
      else if (updates.status === 'failed') job.failedFiles++;
    }
    saveImportJob(job);
  }
}

// ===== History =====
export function getImportHistory(): ImportHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function addToHistory(entry: ImportHistoryEntry): void {
  const history = getImportHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 500))); // Keep last 500
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ===== Drafts =====
export function getDrafts(): ImportedTest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
  } catch { return []; }
}

export function saveDraft(test: ImportedTest): void {
  const drafts = getDrafts();
  const idx = drafts.findIndex(d => d.id === test.id);
  if (idx >= 0) drafts[idx] = test;
  else drafts.unshift(test);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function deleteDraft(id: string): void {
  const drafts = getDrafts().filter(d => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function publishDraft(id: string): ImportedTest | null {
  const drafts = getDrafts();
  const draft = drafts.find(d => d.id === id);
  if (!draft) return null;

  // Add to history
  addToHistory({
    id: draft.id,
    filename: draft.filename,
    skill: draft.skill,
    testType: draft.testType,
    totalQuestions: draft.totalQuestions,
    questionsWithAnswers: draft.questionsWithAnswers,
    confidence: draft.confidence,
    status: 'completed',
    importedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    warnings: draft.warnings,
    errors: draft.errors,
  });

  return draft;
}

// ===== Stats =====
export function getImportStats() {
  const history = getImportHistory();
  const drafts = getDrafts();
  const jobs = getImportJobs();

  return {
    totalImported: history.length,
    totalDrafts: drafts.length,
    activeJobs: jobs.filter(j => j.status === 'processing').length,
    bySkill: {
      reading: history.filter(h => h.skill === 'reading').length,
      listening: history.filter(h => h.skill === 'listening').length,
      writing: history.filter(h => h.skill === 'writing').length,
      speaking: history.filter(h => h.skill === 'speaking').length,
    },
    totalQuestions: history.reduce((sum, h) => sum + h.totalQuestions, 0),
  };
}

// ===== Create Job =====
export function createImportJob(files: File[]): ImportJob {
  const job: ImportJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    files: files.map(f => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      filename: f.name,
      fileSize: f.size,
      status: 'pending' as ImportStatus,
      importedTest: null,
      startedAt: new Date().toISOString(),
    })),
    status: 'processing',
    totalFiles: files.length,
    completedFiles: 0,
    failedFiles: 0,
    startedAt: new Date().toISOString(),
  };

  saveImportJob(job);
  return job;
}
