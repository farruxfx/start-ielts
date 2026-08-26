'use client';

import Link from 'next/link';
import { BookOpen, Headphones, PenLine, Mic, FileCheck } from 'lucide-react';
import type { TestType } from '@/lib/types';

interface SkillCardProps {
  skill: TestType;
  title: string;
  description: string;
  testCount: number;
  completedCount: number;
  gradient: string;
  badgeColor: string;
  iconBg: string;
  iconColor: string;
  DecorativeIcon: React.ElementType;
  href?: string;
}export function SkillCard({
  skill,
  title,
  description,
  testCount,
  completedCount,
  gradient,
  badgeColor,
  iconBg,
  iconColor,
  DecorativeIcon,
  href,
}: SkillCardProps) {
  const statusText = completedCount === 0 ? 'Not tried yet' : `${completedCount}/${testCount} completed`;


  const linkHref = href || `/practice?skill=${skill}`;

  return (
    <Link href={linkHref}>
      <div
        className={`group relative overflow-hidden rounded-3xl ${gradient} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:p-8`}
      >
        {/* Decorative Background Icon */}
        <div className="absolute -bottom-6 -right-6 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-30">
          <DecorativeIcon className="h-32 w-32 sm:h-40 sm:w-40" />
        </div>

        {/* Badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full ${badgeColor} px-3 py-1 text-xs font-semibold uppercase tracking-wide`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          {skill === 'mock' ? 'Mock Exam' : skill}
        </div>

        {/* Title */}
        <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h3>

        {/* Status */}
        <p className="mt-2 text-base font-medium text-white/80">{statusText}</p>

        {/* Practice Button */}
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white/20 px-7 py-3 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:gap-3">
          Practice
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Main practice page skill cards section
const skills = [
  {
    skill: 'listening' as TestType,
    title: 'Listening',
    description: 'Practice with real IELTS listening audio',
    gradient: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700',
    badgeColor: 'bg-white/20 text-white',
    iconBg: 'text-white',
    iconColor: 'text-white',
    DecorativeIcon: Headphones,
    href: '/listening',
  },
  {
    skill: 'reading' as TestType,
    title: 'Reading',
    description: 'Real exam passages with 13+ question types',
    gradient: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600',
    badgeColor: 'bg-white/20 text-white',
    iconBg: 'text-white',
    iconColor: 'text-white',
    DecorativeIcon: BookOpen,
  },
  {
    skill: 'writing' as TestType,
    title: 'Writing',
    description: 'AI-powered evaluation for Task 1 & Task 2',
    gradient: 'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600',
    badgeColor: 'bg-white/20 text-white',
    iconBg: 'text-white',
    iconColor: 'text-white',
    DecorativeIcon: PenLine,
  },
  {
    skill: 'speaking' as TestType,
    title: 'Speaking',
    description: 'Record and get AI pronunciation feedback',
    gradient: 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500',
    badgeColor: 'bg-white/20 text-white',
    iconBg: 'text-white',
    iconColor: 'text-white',
    DecorativeIcon: Mic,
  },
];

interface SkillCardsGridProps {
  testCounts: Record<string, { total: number; completed: number }>;
}

export function SkillCardsGrid({ testCounts }: SkillCardsGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {skills.map((skill) => {
        const counts = testCounts[skill.skill] || { total: 0, completed: 0 };
        return (
          <SkillCard
            key={skill.skill}
            {...skill}
            testCount={counts.total}
            completedCount={counts.completed}
          />
        );
      })}
    </div>
  );
}

// Mock Exam card
export function MockExamCard({ testCount, completedCount }: { testCount: number; completedCount: number }) {
  const statusText = completedCount === 0 ? 'Not tried yet' : `${completedCount}/${testCount} completed`;

  return (
    <Link href="/mock-exam">
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:p-8">
        {/* Decorative Background Icon */}
        <div className="absolute -bottom-6 -right-6 opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-25">
          <FileCheck className="h-32 w-32 sm:h-40 sm:w-40 text-white" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          Mock Exam
        </div>

        {/* Title */}
        <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Full Mock Exam</h3>

        {/* Status */}
        <p className="mt-2 text-base font-medium text-white/70">{statusText}</p>

        {/* Practice Button */}
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white/15 px-7 py-3 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/25 group-hover:gap-3">
          Start Exam
          <svg
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
