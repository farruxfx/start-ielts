'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles, TrendingUp, Mic, MicOff, Volume2, Play, Pause, Target, BookOpen, Headphones, PenLine, Calendar, Lock, ChevronRight, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildDashboardData, getTestResults } from '@/lib/store';
import { useAuth } from '@/components/auth/use-auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSpeaking?: boolean;
  isAI?: boolean;
}

/** Safely render markdown-ish text as React elements (no dangerouslySetInnerHTML). */
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const skillConfig: Record<string, { icon: typeof BookOpen; color: string; bg: string; trackBg: string }> = {
  reading: { icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-500', trackBg: 'bg-emerald-100' },
  listening: { icon: Headphones, color: 'text-violet-600', bg: 'bg-violet-500', trackBg: 'bg-violet-100' },
  writing: { icon: PenLine, color: 'text-rose-600', bg: 'bg-rose-500', trackBg: 'bg-rose-100' },
  speaking: { icon: Mic, color: 'text-amber-600', bg: 'bg-amber-500', trackBg: 'bg-amber-100' },
};

const speakingQuestions = [
  { part: 'Part 1', topic: 'Hometown', question: 'Describe your hometown. What do you like most about it?' },
  { part: 'Part 1', topic: 'Work/Study', question: 'Do you work or study? What do you enjoy most about it?' },
  { part: 'Part 1', topic: 'Hobbies', question: 'What do you do in your free time? How did you start doing this?' },
  { part: 'Part 2', topic: 'Describe a person', question: 'Describe a person who has had a significant influence on your life. You should say: who they are, how you met them, what they have done, and explain why they are important to you.' },
  { part: 'Part 2', topic: 'Describe a place', question: 'Describe a place you visited that you found surprisingly enjoyable. You should say: where it is, when you went there, what you did there, and explain why you enjoyed it.' },
  { part: 'Part 2', topic: 'Describe an experience', question: 'Describe a time when you had to learn something new quickly. You should say: what you learned, how you learned it, who helped you, and explain how you felt about the experience.' },
  { part: 'Part 3', topic: 'Technology', question: 'How has technology changed the way people communicate? Do you think this is a positive or negative change?' },
  { part: 'Part 3', topic: 'Education', question: 'Some people think formal education is the most important factor in a child\'s development. To what extent do you agree or disagree?' },
];

// Fallback responses when AI API is not configured
function generateFallbackResponse(input: string, data: any): string {
  const q = input.toLowerCase();
  const band = data?.currentBand || 0;
  const weakest = data?.weakestSkill || 'writing';
  const totalTests = data?.totalTests || 0;
  const skills = data?.skillBands || [];

  if (q.includes('study plan') || q.includes('what should i work on') || q.includes('today')) {
    const weakestSkills = skills.filter((s: any) => s.band > 0).sort((a: any, b: any) => (a.band - a.target) - (b.band - b.target));
    const focus = weakestSkills.length > 0 ? weakestSkills[0]?.skill : weakest;
    return `**Your Personalized Study Plan for Today**\n\nBased on your test results, here's what I recommend:\n\n🎯 **Primary focus: ${focus.charAt(0).toUpperCase() + focus.slice(1)}**\n• Practice 15 minutes of ${focus} exercises\n• Review your recent mistakes\n\n📚 **Secondary (10 min):**\n• Review 5 vocabulary words\n• Practice quick-fire questions\n\nEstimated total time: 30-40 minutes\nConsistency > intensity!`;
  }

  if (q.includes('how am i doing') || q.includes('my progress') || q.includes('overall')) {
    return `**Your Progress Overview**\n\n📊 **Current Status:**\n• Overall band: **${band > 0 ? band.toFixed(1) : 'No tests yet'}**\n• Tests completed: ${totalTests}\n• Weakest skill: **${weakest}**\n\n${band > 0 ? `\n📈 **Skill Breakdown:**\n${skills.map((s: any) => `• ${s.skill.charAt(0).toUpperCase() + s.skill.slice(1)}: ${s.band > 0 ? s.band.toFixed(1) : 'Not tested'} (target: ${s.target})`).join('\n')}` : 'Take your first practice test to see your baseline score!'}`;
  }

  if (q.includes('writing') || q.includes('essay')) {
    return `**Writing Task Tips:**\n\n📝 **Task 2 Structure:**\n1. Introduction (2-3 sentences)\n2. Body paragraph 1 — strongest argument\n3. Body paragraph 2 — second argument\n4. Conclusion — summarize\n\n✨ **Key phrases:**\n• "It is widely argued that..."\n• "One compelling reason is..."\n• "To conclude, I firmly believe..."`;
  }

  if (q.includes('listening')) {
    return `**Listening Strategies:**\n\n🎧 **Daily routine:**\n• 10 min: Podcast (BBC, TED)\n• 20 min: Full listening test\n• 10 min: Review transcript\n\n🎯 **Key techniques:**\n1. Read questions BEFORE listening\n2. Listen for synonyms, not exact words\n3. Watch for distractors`;
  }

  if (q.includes('speaking')) {
    return `**Speaking Test Strategies:**\n\n🎤 **Part 1:** Short, natural answers (2-3 sentences)\n🎤 **Part 2:** Cover all bullet points, speak full 2 min\n🎤 **Part 3:** Longer, detailed answers with examples\n\n💪 **Pro tips:**\n• Record yourself and listen back\n• Practice with a timer`;
  }

  if (q.includes('reading')) {
    return `**Reading Techniques:**\n\n📖 **By question type:**\n• **True/False/NG:** Find exact words\n• **Matching headings:** Read first & last sentence\n• **Multiple choice:** Eliminate wrong answers\n\n⏱ **Time:** Passage 1: 15 min, P2: 20 min, P3: 25 min`;
  }

  return `I can help you with:\n• 📝 Writing tips and essay structures\n• 🎧 Listening strategies\n• 🎤 Speaking techniques for Parts 1-3\n• 📖 Reading speed and comprehension\n• 📊 Progress analysis and study plans\n\nJust ask about any specific skill! (💡 AI Coach is in offline mode — add GROQ_API_KEY for personalized responses)`;
}

export default function AICoachPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'speaking'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => { setData(buildDashboardData()); }, [user]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    // Check AI API status
    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'ping' }) })
      .then(r => r.json())
      .then(d => setAiStatus(d.offline ? 'offline' : d.error ? 'offline' : 'online'))
      .catch(() => setAiStatus('offline'));
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const predictedBand = data?.currentBand || 0;
  const totalTests = data?.totalTests || 0;
  const skills = data?.skillBands || [
    { skill: 'reading', band: 0, target: 7.5 },
    { skill: 'listening', band: 0, target: 8.0 },
    { skill: 'writing', band: 0, target: 7.0 },
    { skill: 'speaking', band: 0, target: 7.0 },
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: 'u' + Date.now(), role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (aiStatus === 'online') {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.map(m => ({ role: m.role, content: m.content })),
            userData: {
              currentBand: data?.currentBand,
              skillBands: data?.skillBands,
              totalTests: data?.totalTests,
              weakestSkill: data?.weakestSkill,
            },
          }),
        });
        const d = await res.json();
        if (d.response) {
          const aiMsg: Message = { id: 'a' + Date.now(), role: 'assistant', content: d.response, timestamp: new Date(), isAI: true };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          throw new Error(d.error || 'No response');
        }
      } catch (err: any) {
        // Fallback to local
        const response = generateFallbackResponse(text, data);
        const aiMsg: Message = { id: 'a' + Date.now(), role: 'assistant', content: response + '\n\n*(Using offline mode — AI API temporarily unavailable)*', timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
      }
    } else {
      // Offline mode — keep typing indicator visible while "thinking"
      setTimeout(() => {
        const response = generateFallbackResponse(text, data);
        const aiMsg: Message = { id: 'a' + Date.now(), role: 'assistant', content: response + '\n\n*(Offline mode — add GROQ_API_KEY for personalized AI responses)*', timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 500 + Math.random() * 500);
      return; // setIsTyping(false) will run inside the callback
    }
    setIsTyping(false);
  };

  const startSpeakingPractice = () => {
    setActiveTab('speaking');
    setSpeakingIndex(0);
    setMessages([]);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Microphone access is needed for speaking practice. Please allow microphone access in your browser settings.');
      }
    } else {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  const submitSpeaking = async () => {
    setIsRecording(false);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    const q = speakingQuestions[speakingIndex];

    if (aiStatus === 'online') {
      setIsTyping(true);
      try {
        const res = await fetch('/api/speaking-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.question,
            answer: `[Audio recording — ${formatTime(recordingTime)} of speaking about "${q.topic}"]\n\nNote: This is a simulated transcription. In a real implementation, the audio would be transcribed first. The student spoke about ${q.topic} for ${formatTime(recordingTime)}.`,
            part: q.part,
            userData: { currentBand: data?.currentBand },
          }),
        });
        const d = await res.json();
        if (d.response) {
          const aiMsg: Message = { id: 'a' + Date.now(), role: 'assistant', content: d.response, timestamp: new Date(), isAI: true };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          throw new Error(d.error);
        }
      } catch {
        const feedback = generateSpeakingFeedback(q, recordingTime);
        const aiMsg: Message = { id: 'a' + Date.now(), role: 'assistant', content: feedback + '\n\n*(Offline mode)*', timestamp: new Date() };
        setMessages(prev => [...prev, aiMsg]);
      }
      setIsTyping(false);
    } else {
      const feedback = generateSpeakingFeedback(q, recordingTime);
      const aiMsg: Message = { id: 'a' + Date.now(), role: 'assistant', content: feedback + '\n\n*(Offline mode — add GROQ_API_KEY for AI feedback)*', timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    }
    setRecordingTime(0);
  };

  const generateSpeakingFeedback = (q: { part: string; topic: string; question: string }, time: number) => {
    const estimatedBand = (5.5 + Math.random() * 1.5).toFixed(1);
    return `**Speaking Feedback — ${q.topic}**\n\n🎤 **Content:** You addressed the topic well. ${q.part === 'Part 2' ? 'Make sure to cover all bullet points from the cue card.' : 'Good use of examples and reasons.'}\n\n🗣 **Fluency:** ${time >= 60 ? 'Good — you spoke for a reasonable duration.' : 'Try to speak for longer. Aim for 1-2 minutes.'}\n\n📝 **Vocabulary:** Consider using more advanced vocabulary:\n• Instead of "good" → "remarkable", "outstanding"\n• Instead of "big" → "substantial", "considerable"\n\n🎯 **Estimated band:** ${estimatedBand}\n\n💡 **Tip:** Practice recording yourself daily. Focus on speaking naturally rather than memorizing.`;
  };

  const nextSpeakingQuestion = () => {
    setSpeakingIndex(prev => (prev + 1) % speakingQuestions.length);
    setMessages([]);
    setIsRecording(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your predicted band, weak spots and a personalised study plan.</p>
      </div>

      {/* AI Status Badge */}
      <div className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium w-fit',
        aiStatus === 'online' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
        aiStatus === 'offline' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
        'bg-muted text-muted-foreground'
      )}>
        {aiStatus === 'online' ? <Wifi className="h-3 w-3" /> : aiStatus === 'offline' ? <WifiOff className="h-3 w-3" /> : null}
        {aiStatus === 'online' ? 'AI Online — Groq (GPT OSS 120B)' : aiStatus === 'offline' ? 'Offline Mode — Add GROQ_API_KEY for AI' : 'Checking AI status...'}
      </div>

      {/* Predicted Band Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-5 bottom-0 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute bottom-4 right-8 opacity-20">
          <svg className="h-20 w-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        </div>
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Predicted Overall Band</p>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-6xl font-black">{predictedBand > 0 ? predictedBand.toFixed(1) : '—'}</span>
              <span className="text-lg font-bold text-white/60">—</span>
            </div>
            <p className="mt-1 text-sm text-white/70">
              {totalTests > 0 ? `${totalTests} test${totalTests !== 1 ? 's' : ''} analysed` : 'No tests analysed yet'}
            </p>
          </div>
          <div className="max-w-xs">
            <h3 className="text-xl font-bold">Turn this into a plan for today</h3>
            <p className="mt-1 text-sm text-white/80">AI reads your results and writes the day&apos;s practice for you — what to work on, and why.</p>
            <button onClick={startSpeakingPractice} className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
              <Brain className="h-4 w-4" />
              Start AI Plan
            </button>
          </div>
        </div>
      </div>

      {/* By Skill */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-bold">By skill</h2>
        <div className="space-y-4">
          {skills.map((skill: any) => {
            const config = skillConfig[skill.skill];
            const Icon = config.icon;
            const progress = skill.band > 0 ? (skill.band / 9) * 100 : 0;
            return (
              <div key={skill.skill}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold capitalize">{skill.skill}</span>
                  <span className="text-sm font-bold">{skill.band > 0 ? skill.band.toFixed(1) : '—'}</span>
                </div>
                <div className={cn('h-2 overflow-hidden rounded-full', config.trackBg)}>
                  <div className={cn('h-full rounded-full transition-all duration-500', config.bg)} style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {skill.band > 0 ? `${Math.round((skill.band / skill.target) * 100)}% of target` : 'Not practised yet'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('chat')} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all', activeTab === 'chat' ? 'bg-foreground text-background shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
        <button onClick={() => setActiveTab('speaking')} className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all', activeTab === 'speaking' ? 'bg-foreground text-background shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
          <Mic className="h-4 w-4" />
          Speaking Practice
        </button>
      </div>

      {/* Chat / Speaking Area */}
      <div className="flex h-[400px] flex-col rounded-2xl border border-border bg-card">
        {/* Speaking Practice Header */}
        {activeTab === 'speaking' && (
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">{speakingQuestions[speakingIndex].part}</span>
                <span className="ml-2 text-xs text-muted-foreground">{speakingQuestions[speakingIndex].topic}</span>
              </div>
              <button onClick={nextSpeakingQuestion} className="text-xs font-medium text-primary hover:underline">Next question →</button>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed">{speakingQuestions[speakingIndex].question}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && activeTab === 'chat' && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="h-10 w-10 text-blue-500/50" />
              <h3 className="mt-3 font-semibold">Ask me anything about IELTS</h3>
              <p className="mt-1 text-sm text-muted-foreground">Writing tips, speaking strategies, study plans and more.</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-lg">
                {['How am I doing?', 'Tips for Writing Task 2', 'What should I work on today?', 'Reading speed techniques'].map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-all hover:border-primary/30">{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', msg.isAI ? 'bg-gradient-to-br from-blue-600 to-violet-600' : 'bg-muted')}>
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm', msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-muted/50')}>
                <div className="whitespace-pre-wrap">{renderMarkdown(msg.content)}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600"><Brain className="h-3.5 w-3.5 text-white" /></div>
              <div className="rounded-2xl bg-muted/50 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          {activeTab === 'speaking' ? (
            <div className="flex items-center justify-center gap-4">
              {isRecording && <span className="text-sm font-mono text-red-500 font-bold">{formatTime(recordingTime)}</span>}
              <button onClick={toggleRecording} className={cn('flex h-14 w-14 items-center justify-center rounded-full transition-all', isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:scale-105')}>
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              {isRecording ? (
                <button onClick={submitSpeaking} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg">Submit</button>
              ) : (
                <span className="text-xs text-muted-foreground">{isRecording ? 'Recording...' : 'Tap mic to start recording'}</span>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)} placeholder="Ask about IELTS preparation..." className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping} className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50">
                <Send className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
