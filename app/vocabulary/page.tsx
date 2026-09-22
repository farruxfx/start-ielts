'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Volume2, Check, X, RotateCw, Plus, Trash2, BookOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VirtualList } from '@/components/ui/virtual-list';

interface VocabWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  synonyms: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  mastered: boolean;
}

const defaultWords: VocabWord[] = [
  { id: 'v1', word: 'ubiquitous', definition: 'Present, appearing, or found everywhere', example: 'Mobile phones have become ubiquitous in modern society.', synonyms: ['omnipresent', 'pervasive', 'universal'], difficulty: 'hard', category: 'academic', mastered: false },
  { id: 'v2', word: 'mitigate', definition: 'To make less severe, harmful, or painful', example: 'The government introduced policies to mitigate the effects of the economic downturn.', synonyms: ['alleviate', 'reduce', 'diminish'], difficulty: 'medium', category: 'academic', mastered: false },
  { id: 'v3', word: 'deteriorate', definition: 'To become progressively worse', example: "The patient's condition began to deteriorate rapidly after surgery.", synonyms: ['worsen', 'decline', 'degrade'], difficulty: 'medium', category: 'academic', mastered: true },
  { id: 'v4', word: 'comprehensive', definition: 'Complete and including all elements', example: "The report provides a comprehensive analysis of the company's financial performance.", synonyms: ['thorough', 'complete', 'exhaustive'], difficulty: 'easy', category: 'academic', mastered: false },
  { id: 'v5', word: 'scrutinize', definition: 'To examine closely and thoroughly', example: 'The committee scrutinized every detail of the proposal.', synonyms: ['examine', 'inspect', 'analyze'], difficulty: 'hard', category: 'academic', mastered: false },
  { id: 'v6', word: 'predominantly', definition: 'Mainly or for the most part', example: 'The audience was predominantly young professionals.', synonyms: ['mainly', 'mostly', 'primarily'], difficulty: 'medium', category: 'academic', mastered: false },
  { id: 'v7', word: 'feasible', definition: 'Possible to do easily or conveniently', example: 'The engineers determined that the bridge design was technically feasible.', synonyms: ['possible', 'viable', 'achievable'], difficulty: 'easy', category: 'academic', mastered: true },
  { id: 'v8', word: 'paradigm', definition: 'A typical example or pattern of something', example: 'The discovery represented a paradigm shift in our understanding.', synonyms: ['model', 'pattern', 'standard'], difficulty: 'hard', category: 'academic', mastered: false },
  { id: 'v9', word: 'resilient', definition: 'Able to withstand or recover quickly from difficulties', example: 'Children are often more resilient than adults give them credit for.', synonyms: ['tough', 'strong', 'hardy'], difficulty: 'medium', category: 'academic', mastered: false },
  { id: 'v10', word: 'consequence', definition: 'A result or effect, typically unwelcome', example: 'The consequences of climate change are becoming increasingly visible.', synonyms: ['result', 'outcome', 'effect'], difficulty: 'easy', category: 'academic', mastered: false },
  { id: 'v11', word: 'advocate', definition: 'To publicly recommend or support', example: 'Many doctors advocate for a balanced diet and regular exercise.', synonyms: ['support', 'endorse', 'promote'], difficulty: 'medium', category: 'academic', mastered: false },
  { id: 'v12', word: 'inevitable', definition: 'Certain to happen; unavoidable', example: 'Given the economic conditions, some job losses were inevitable.', synonyms: ['unavoidable', 'inescapable', 'certain'], difficulty: 'easy', category: 'academic', mastered: true },
];

const difficultyColors = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

function getStoredWords(): VocabWord[] {
  if (typeof window === 'undefined') return defaultWords;
  try {
    const data = localStorage.getItem('ieltspro_vocabulary');
    if (data) return JSON.parse(data);
    localStorage.setItem('ieltspro_vocabulary', JSON.stringify(defaultWords));
    return defaultWords;
  } catch { return defaultWords; }
}

function saveWords(words: VocabWord[]) {
  try { localStorage.setItem('ieltspro_vocabulary', JSON.stringify(words)); } catch {}
}

function VocabCard({
  word,
  onToggle,
  onDelete,
  onSpeak,
}: {
  word: VocabWord;
  onToggle: () => void;
  onDelete: () => void;
  onSpeak: (text: string) => void;
}) {
  return (
    <div className={cn('h-full overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-md', word.mastered && 'border-emerald-500/20 bg-emerald-500/5')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{word.word}</h3>
            <button onClick={() => onSpeak(word.word)} className="text-muted-foreground hover:text-primary"><Volume2 className="h-3.5 w-3.5" /></button>
          </div>
          <span className={cn('mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', difficultyColors[word.difficulty])}>{word.difficulty}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={onToggle} className={cn('rounded-lg p-1.5 transition-colors', word.mastered ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-600')}>
            <Check className="h-3.5 w-3.5" />
          </button>
          <button onClick={onDelete} className="rounded-lg bg-muted p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{word.definition}</p>
      {word.example && <p className="mt-2 text-xs italic text-muted-foreground/70">"{word.example}"</p>}
      {word.synonyms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {word.synonyms.map((s, i) => (
            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showMastered, setShowMastered] = useState<'all' | 'mastered' | 'unmastered'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1024);
  const [newWord, setNewWord] = useState({ word: '', definition: '', example: '', synonyms: '', difficulty: 'medium' as const, category: 'academic' });

  useEffect(() => { setWords(getStoredWords()); }, []);
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filteredWords = words.filter(w => {
    if (search && !w.word.toLowerCase().includes(search.toLowerCase()) && !w.definition.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDifficulty !== 'all' && w.difficulty !== filterDifficulty) return false;
    if (showMastered === 'mastered' && !w.mastered) return false;
    if (showMastered === 'unmastered' && w.mastered) return false;
    return true;
  });

  const masteredCount = words.filter(w => w.mastered).length;
  const flashcardWords = filteredWords.length > 0 ? filteredWords : words;

  const toggleMastered = (id: string) => {
    const updated = words.map(w => w.id === id ? { ...w, mastered: !w.mastered } : w);
    setWords(updated);
    saveWords(updated);
  };

  const deleteWord = (id: string) => {
    const updated = words.filter(w => w.id !== id);
    setWords(updated);
    saveWords(updated);
  };

  const addWord = () => {
    if (!newWord.word.trim() || !newWord.definition.trim()) return;
    const word: VocabWord = {
      id: 'v' + Date.now(),
      word: newWord.word.trim(),
      definition: newWord.definition.trim(),
      example: newWord.example.trim(),
      synonyms: newWord.synonyms.split(',').map(s => s.trim()).filter(Boolean),
      difficulty: newWord.difficulty,
      category: newWord.category,
      mastered: false,
    };
    const updated = [...words, word];
    setWords(updated);
    saveWords(updated);
    setNewWord({ word: '', definition: '', example: '', synonyms: '', difficulty: 'medium', category: 'academic' });
    setShowAddWord(false);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {words.length} words • {masteredCount} mastered
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode(viewMode === 'grid' ? 'flashcard' : 'grid')} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:shadow-md">
            <RotateCw className="h-4 w-4" />
            {viewMode === 'grid' ? 'Flashcards' : 'Grid View'}
          </button>
          <button onClick={() => setShowAddWord(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Add Word
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="text-2xl font-bold">{words.length}</div>
          <div className="text-xs text-muted-foreground">Total Words</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{masteredCount}</div>
          <div className="text-xs text-muted-foreground">Mastered</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{words.length - masteredCount}</div>
          <div className="text-xs text-muted-foreground">To Learn</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search words..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
          <button key={d} onClick={() => setFilterDifficulty(d)} className={cn('rounded-full px-3 py-2 text-xs font-medium transition-colors', filterDifficulty === d ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
            {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
        <div className="h-px w-px bg-border self-center mx-1" />
        {(['all', 'mastered', 'unmastered'] as const).map(s => (
          <button key={s} onClick={() => setShowMastered(s)} className={cn('rounded-full px-3 py-2 text-xs font-medium transition-colors', showMastered === s ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
            {s === 'all' ? 'All' : s === 'mastered' ? 'Mastered' : 'To Learn'}
          </button>
        ))}
      </div>

      {/* Flashcard View */}
      {viewMode === 'flashcard' && flashcardWords.length > 0 && (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-full max-w-lg">
            <div
              className={cn('relative cursor-pointer rounded-2xl border border-border bg-card p-8 min-h-[280px] transition-all duration-500', flipped && '[transform:rotateY(180deg)]')}
              style={{ perspective: '1000px' }}
              onClick={() => setFlipped(!flipped)}
            >
              <div className={cn('transition-opacity duration-300', flipped ? 'opacity-0' : 'opacity-100')}>
                <div className="flex items-center justify-between mb-6">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', difficultyColors[flashcardWords[flashcardIndex]?.difficulty])}>
                    {flashcardWords[flashcardIndex]?.difficulty}
                  </span>
                  <button onClick={e => { e.stopPropagation(); speak(flashcardWords[flashcardIndex]?.word); }} className="rounded-full bg-primary/10 p-2 hover:bg-primary/20">
                    <Volume2 className="h-4 w-4 text-primary" />
                  </button>
                </div>
                <h2 className="text-3xl font-bold text-center">{flashcardWords[flashcardIndex]?.word}</h2>
                <p className="text-center text-muted-foreground mt-4">Tap to reveal definition</p>
              </div>
              <div className={cn('absolute inset-0 flex flex-col items-center justify-center p-8 [transform:rotateY(180deg)] [backface-visibility:hidden]', flipped ? 'opacity-100' : 'opacity-0')}>
                <h3 className="text-xl font-bold mb-2">{flashcardWords[flashcardIndex]?.word}</h3>
                <p className="text-muted-foreground text-center mb-4">{flashcardWords[flashcardIndex]?.definition}</p>
                {flashcardWords[flashcardIndex]?.example && (
                  <p className="text-sm italic text-muted-foreground/80 text-center">"{flashcardWords[flashcardIndex]?.example}"</p>
                )}
                {flashcardWords[flashcardIndex]?.synonyms.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1 justify-center">
                    {flashcardWords[flashcardIndex]?.synonyms.map((s, i) => (
                      <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setFlashcardIndex(Math.max(0, flashcardIndex - 1)); setFlipped(false); }} disabled={flashcardIndex === 0} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-50">← Previous</button>
            <span className="text-sm text-muted-foreground">{flashcardIndex + 1} / {flashcardWords.length}</span>
            <button onClick={() => { setFlashcardIndex(Math.min(flashcardWords.length - 1, flashcardIndex + 1)); setFlipped(false); }} disabled={flashcardIndex >= flashcardWords.length - 1} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-50">Next →</button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {/* Phase 6.6: virtualize long lists — only visible cards are rendered */}
          {filteredWords.length > 30 ? (
            <VirtualList
              items={filteredWords}
              itemHeight={260}
              height={780}
              columns={viewportWidth >= 1024 ? 3 : viewportWidth >= 640 ? 2 : 1}
              getKey={(word) => word.id}
              className="rounded-2xl"
              renderItem={(word) => (
                <VocabCard
                  word={word}
                  onToggle={() => toggleMastered(word.id)}
                  onDelete={() => deleteWord(word.id)}
                  onSpeak={speak}
                />
              )}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWords.map(word => (
                <VocabCard
                  key={word.id}
                  word={word}
                  onToggle={() => toggleMastered(word.id)}
                  onDelete={() => deleteWord(word.id)}
                  onSpeak={speak}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Word Modal */}
      {showAddWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4">Add New Word</h2>
            <div className="space-y-3">
              <input placeholder="Word *" value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input placeholder="Definition *" value={newWord.definition} onChange={e => setNewWord({ ...newWord, definition: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input placeholder="Example sentence" value={newWord.example} onChange={e => setNewWord({ ...newWord, example: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <input placeholder="Synonyms (comma separated)" value={newWord.synonyms} onChange={e => setNewWord({ ...newWord, synonyms: e.target.value })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <select value={newWord.difficulty} onChange={e => setNewWord({ ...newWord, difficulty: e.target.value as any })} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setShowAddWord(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={addWord} className="rounded-xl bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg">Add Word</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {viewMode === 'grid' && filteredWords.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No words found. Try a different filter or add a new word.</p>
        </div>
      )}
    </div>
  );
}
