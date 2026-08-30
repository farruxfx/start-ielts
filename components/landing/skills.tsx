'use client';

import { useInView } from '@/lib/animations';

const skills = [
  {
    num: '01',
    title: 'Listening',
    desc: 'Train your ear with authentic IELTS audio. Practice note-taking, comprehension, and quick response skills.',
    visual: 'waveform',
    stat: '68+',
    statLabel: 'Tests',
  },
  {
    num: '02',
    title: 'Reading',
    desc: 'Master academic passages with timed practice. Build vocabulary and comprehension strategies.',
    visual: 'text',
    stat: '130+',
    statLabel: 'Passages',
  },
  {
    num: '03',
    title: 'Writing',
    desc: 'Get AI-powered feedback on Task 1 & Task 2. Improve structure, grammar, and lexical resource.',
    visual: 'cursor',
    stat: 'AI',
    statLabel: 'Evaluated',
  },
  {
    num: '04',
    title: 'Speaking',
    desc: 'Practice with Web Speech API and Groq AI. Real-time fluency and pronunciation feedback.',
    visual: 'voice',
    stat: '3',
    statLabel: 'Parts',
  },
];

function WaveformVisual() {
  return (
    <div className="flex items-end gap-[3px] h-16">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-indigo-500/60 to-indigo-400/20"
          style={{
            height: `${12 + Math.sin(i * 0.5) * 20 + Math.cos(i * 0.3) * 10}px`,
            animation: `waveform ${1.2 + (i % 4) * 0.2}s ease-in-out ${i * 0.08}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function TextVisual() {
  const lines = [
    { width: '85%', delay: 0 },
    { width: '70%', delay: 0.1 },
    { width: '90%', delay: 0.2 },
    { width: '60%', delay: 0.3 },
    { width: '75%', delay: 0.4 },
  ];
  return (
    <div className="space-y-2.5">
      {lines.map((line, i) => (
        <div key={i} className="h-2 rounded-full bg-white/[0.06] overflow-hidden" style={{ width: line.width }}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-white/10 to-white/[0.03]"
            style={{ animation: `line-fill 1.5s ease-out ${line.delay}s both` }}
          />
        </div>
      ))}
    </div>
  );
}

function CursorVisual() {
  return (
    <div className="relative h-16 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="h-1.5 w-16 rounded-full bg-white/[0.08] mb-2" />
      <div className="h-1.5 w-24 rounded-full bg-white/[0.06] mb-2" />
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-20 rounded-full bg-indigo-400/30" />
        <div className="h-4 w-[2px] bg-indigo-400/60 animate-pulse" />
      </div>
    </div>
  );
}

function VoiceVisual() {
  return (
    <div className="flex items-center justify-center h-16">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 -m-4 rounded-full border border-indigo-400/10" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }} />
        <div className="absolute inset-0 -m-8 rounded-full border border-indigo-400/5" style={{ animation: 'pulse-glow 3s ease-in-out 0.5s infinite' }} />
        {/* Center mic */}
        <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-indigo-400/50" />
        </div>
      </div>
    </div>
  );
}

const visuals: Record<string, () => JSX.Element> = {
  waveform: WaveformVisual,
  text: TextVisual,
  cursor: CursorVisual,
  voice: VoiceVisual,
};

function SkillCard({ skill, index }: { skill: typeof skills[0]; index: number }) {
  const { ref, isInView } = useInView();
  const Visual = visuals[skill.visual];

  return (
    <div
      ref={ref}
      className={`group relative rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-700 hover:border-white/[0.1] hover:bg-white/[0.04] ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Number */}
      <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/20">
        {skill.num}
      </div>

      {/* Visual */}
      <div className="mb-6 h-20 flex items-center">
        <Visual />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold text-white mb-3">{skill.title}</h3>
      <p className="text-[15px] leading-relaxed text-white/40">{skill.desc}</p>

      {/* Stat */}
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{skill.stat}</span>
        <span className="text-sm text-white/30">{skill.statLabel}</span>
      </div>
    </div>
  );
}

export function Skills() {
  const { ref, isInView } = useInView();

  return (
    <section id="skills" className="relative py-24 sm:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0a0a10] to-[#080808]" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div ref={ref} className={`mb-16 text-center transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Master every skill.
            <br />
            <span className="text-white/30">One platform.</span>
          </h2>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, index) => (
            <SkillCard key={skill.num} skill={skill} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
