'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface GrammarTopic {
  id: string;
  title: string;
  slug: string;
  explanation: string;
  examples: string[];
  common_mistakes: string[];
  category: string;
  difficulty: string;
}

interface GrammarQuestion {
  id: string;
  prompt: string;
  options: string[];
  correct_answer: string | string[];
  explanation: string;
  difficulty: string;
}

export default function GrammarLabPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, { accuracy: number }>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('grammar_topics').select('*').order('title');
      setTopics(data || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('grammar_progress')
        .select('grammar_topic_id, accuracy')
        .eq('user_id', user.id);
      if (data) {
        const map: Record<string, { accuracy: number }> = {};
        data.forEach((p: any) => { map[p.grammar_topic_id] = { accuracy: parseFloat(p.accuracy) }; });
        setProgress(map);
      }
    })();
  }, [user]);

  const loadQuestions = async (topic: GrammarTopic) => {
    setSelectedTopic(topic);
    setAnswers({});
    setSubmitted(false);
    const { data } = await supabase
      .from('grammar_questions')
      .select('id, prompt, options, correct_answer, explanation, difficulty')
      .eq('grammar_topic_id', topic.id)
      .order('question_number');
    setQuestions(data || []);
  };

  const score = questions.filter((q) => {
    const ua = answers[q.id];
    if (!ua) return false;
    const correct = Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer;
    return ua.toLowerCase().trim() === String(correct).toLowerCase().trim();
  }).length;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!user || !selectedTopic) return;
    const accuracy = (score / (questions.length || 1)) * 100;
    const { data: existing } = await supabase
      .from('grammar_progress')
      .select('id, questions_attempted, questions_correct')
      .eq('user_id', user.id)
      .eq('grammar_topic_id', selectedTopic.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('grammar_progress').update({
        questions_attempted: existing.questions_attempted + questions.length,
        questions_correct: existing.questions_correct + score,
        accuracy: ((existing.questions_correct + score) / (existing.questions_attempted + questions.length)) * 100,
        last_practiced_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('grammar_progress').insert({
        user_id: user.id,
        grammar_topic_id: selectedTopic.id,
        questions_attempted: questions.length,
        questions_correct: score,
        accuracy,
        last_practiced_at: new Date().toISOString(),
      });
    }
  };

  if (selectedTopic) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedTopic(null)} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to topics
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">{selectedTopic.title}</h1>
          <Badge variant="secondary" className="mt-1 capitalize">{selectedTopic.difficulty}</Badge>
        </div>

        {/* Explanation */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold">Explanation</h3>
          <p className="mt-2 text-sm text-muted-foreground">{selectedTopic.explanation}</p>
          {selectedTopic.examples && selectedTopic.examples.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Examples</h4>
              <ul className="mt-2 space-y-1">
                {selectedTopic.examples.map((ex, i) => (
                  <li key={i} className="rounded-lg bg-muted/30 p-2 text-sm italic">"{ex}"</li>
                ))}
              </ul>
            </div>
          )}
          {selectedTopic.common_mistakes && selectedTopic.common_mistakes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-destructive">Common Mistakes</h4>
              <ul className="mt-2 space-y-1">
                {selectedTopic.common_mistakes.map((m, i) => (
                  <li key={i} className="rounded-lg bg-destructive/5 p-2 text-sm text-destructive/80">{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Questions */}
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q, i) => {
              const correct = Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer;
              const isCorrect = submitted && answers[q.id] === correct;
              const isWrong = submitted && answers[q.id] && answers[q.id] !== correct;
              return (
                <div key={q.id} className={cn(
                  'rounded-2xl border bg-card p-5',
                  isCorrect ? 'border-success' : isWrong ? 'border-destructive' : 'border-border'
                )}>
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                    <p className="font-medium">{q.prompt}</p>
                  </div>
                  {q.options && (
                    <RadioGroup value={answers[q.id] || ''} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })} className="mt-3">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={cn(
                          'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                          answers[q.id] === opt ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                          submitted && opt === correct && 'border-success bg-success/5',
                          isWrong && opt === answers[q.id] && 'border-destructive bg-destructive/5'
                        )}>
                          <RadioGroupItem value={opt} id={`q-${q.id}-${oi}`} disabled={submitted} />
                          <Label htmlFor={`q-${q.id}-${oi}`} className="cursor-pointer text-sm font-normal">{opt}</Label>
                          {submitted && opt === correct && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
                          {isWrong && opt === answers[q.id] && <XCircle className="ml-auto h-4 w-4 text-destructive" />}
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {submitted && q.explanation && (
                    <p className="mt-3 rounded-lg bg-muted/30 p-2 text-sm text-muted-foreground">{q.explanation}</p>
                  )}
                </div>
              );
            })}
            {!submitted ? (
              <Button onClick={handleSubmit} size="lg" className="w-full">Submit Answers</Button>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="text-4xl font-bold text-primary">{score}/{questions.length}</div>
                <p className="mt-2 text-sm text-muted-foreground">{Math.round((score / questions.length) * 100)}% accuracy</p>
                <Button className="mt-4" variant="outline" onClick={() => { setAnswers({}); setSubmitted(false); }}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No practice questions yet for this topic.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IELTS Grammar Lab</h1>
        <p className="mt-1 text-sm text-muted-foreground">Master essential grammar topics with explanations and practice questions.</p>
      </div>

      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading topics...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => {
            const p = progress[t.id];
            return (
              <button
                key={t.id}
                onClick={() => loadQuestions(t)}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <Badge variant="secondary" className="capitalize text-xs">{t.difficulty}</Badge>
                </div>
                <h3 className="mt-3 font-semibold group-hover:text-primary">{t.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">{t.explanation}</p>
                {p && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-xs text-muted-foreground">{Math.round(p.accuracy)}% accuracy</span>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                  Practice <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
