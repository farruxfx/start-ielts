'use client';

import { useInView } from '@/lib/animations';
import { Headphones, BookOpen, PenTool, Mic } from 'lucide-react';

const skills = [
  {
    num: '01',
    title: 'Listening',
    desc: 'Train your ear with authentic IELTS audio. Practice note-taking and comprehension.',
    icon: Headphones,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    stat: '68+',
    statLabel: 'Tests',
  },
  {
    num: '02',
    title: 'Reading',
    desc: 'Master academic passages with timed practice. Build vocabulary and strategies.',
    icon: BookOpen,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    stat: '130+',
    statLabel: 'Passages',
  },
  {
    num: '03',
    title: 'Writing',
    desc: 'Get AI-powered feedback on Task 1 & Task 2. Improve structure and grammar.',
    icon: PenTool,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    stat: 'AI',
    statLabel: 'Evaluated',
  },
  {
    num: '04',
    title: 'Speaking',
    desc: 'Practice with Web Speech API and Groq AI. Real-time fluency feedback.',
    icon: Mic,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    stat: '3',
    statLabel: 'Parts',
  },
];

function SkillCard({ skill, index }: { skill: typeof skills[0]; index: number }) {
  const { ref, isInView } = useInView();
  const Icon = skill.icon;

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-slate-100 bg-white p-8 transition-all duration-500 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${skill.bg}`}>
        <Icon className={`h-6 w-6 ${skill.color}`} />
      </div>

      {/* Number */}
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
        {skill.num}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{skill.title}</h3>
      <p className="text-[15px] leading-relaxed text-slate-500">{skill.desc}</p>

      {/* Stat */}
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">{skill.stat}</span>
        <span className="text-sm text-slate-400">{skill.statLabel}</span>
      </div>
    </div>
  );
}

export function Skills() {
  const { ref, isInView } = useInView();

  return (
    <section id="skills" className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div ref={ref} className={`mb-16 text-center transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-[12px] font-semibold text-blue-600 mb-4">
            Four Skills
          </span>
          <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl lg:text-5xl">
            Master every skill.
            <br />
            <span className="text-slate-400">One platform.</span>
          </h2>
        </div>

        {/* Skills Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, index) => (
            <SkillCard key={skill.num} skill={skill} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
