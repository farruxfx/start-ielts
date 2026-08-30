// ═══════════════════════════════════════════════════════════════
//  MOCK EXAM DEFINITIONS (50 exams)
// ═══════════════════════════════════════════════════════════════

import type { MockExamDef } from './types';
import { LISTENING_QUESTION_BANKS, LISTENING_AUDIO_URLS } from './mock-exam-data';

const bankIdList = Object.keys(LISTENING_QUESTION_BANKS);
const audioUrls = Object.values(LISTENING_AUDIO_URLS);

const topics = [
  { title: 'Artificial Intelligence in Education', cat: 'Academic', diff: 'medium' as const },
  { title: 'Space Exploration and Colonisation', cat: 'Academic', diff: 'hard' as const },
  { title: 'Renewable Energy Solutions', cat: 'Academic', diff: 'medium' as const },
  { title: 'Climate Change Impact', cat: 'Academic', diff: 'hard' as const },
  { title: 'Global Health Systems', cat: 'Academic', diff: 'medium' as const },
  { title: 'Ocean Conservation', cat: 'Academic', diff: 'easy' as const },
  { title: 'Cultural Heritage Preservation', cat: 'Academic', diff: 'medium' as const },
  { title: 'Digital Privacy and Security', cat: 'Academic', diff: 'hard' as const },
  { title: 'Urban Planning Innovation', cat: 'Academic', diff: 'easy' as const },
  { title: 'Bioethics and Genetic Engineering', cat: 'Academic', diff: 'hard' as const },
  { title: 'Sustainable Agriculture', cat: 'Academic', diff: 'medium' as const },
  { title: 'Transport Revolution', cat: 'Academic', diff: 'easy' as const },
  { title: 'Water Resource Management', cat: 'Academic', diff: 'medium' as const },
  { title: 'Neuroscience of Learning', cat: 'Academic', diff: 'hard' as const },
  { title: 'Poverty and Economic Growth', cat: 'Academic', diff: 'medium' as const },
  { title: 'Deforestation and Biodiversity', cat: 'Academic', diff: 'easy' as const },
  { title: 'Criminal Justice Reform', cat: 'Academic', diff: 'hard' as const },
  { title: 'Tourism and Local Economies', cat: 'General', diff: 'easy' as const },
  { title: 'Remote Working Trends', cat: 'General', diff: 'easy' as const },
  { title: 'Public Health Education', cat: 'General', diff: 'medium' as const },
  { title: 'Youth Unemployment Solutions', cat: 'General', diff: 'medium' as const },
  { title: 'Social Media Impact', cat: 'General', diff: 'easy' as const },
  { title: 'Immigration Policy', cat: 'General', diff: 'hard' as const },
  { title: 'Food Security Challenges', cat: 'General', diff: 'medium' as const },
  { title: 'Education Equity', cat: 'General', diff: 'medium' as const },
  { title: 'Digital Divide', cat: 'General', diff: 'easy' as const },
  { title: 'Elderly Care Systems', cat: 'General', diff: 'medium' as const },
  { title: 'Noise Pollution Effects', cat: 'General', diff: 'easy' as const },
  { title: 'Housing Affordability', cat: 'General', diff: 'hard' as const },
  { title: 'Gamification in Learning', cat: 'General', diff: 'easy' as const },
  { title: 'Community Policing', cat: 'General', diff: 'medium' as const },
  { title: 'Renewable vs Fossil Fuels', cat: 'Academic', diff: 'medium' as const },
  { title: 'Animal Testing Ethics', cat: 'Academic', diff: 'hard' as const },
  { title: 'Internet Censorship', cat: 'Academic', diff: 'medium' as const },
  { title: 'Genetic Medicine Future', cat: 'Academic', diff: 'hard' as const },
  { title: 'Traditional vs Modern Medicine', cat: 'General', diff: 'easy' as const },
  { title: 'Working Parents Dilemma', cat: 'General', diff: 'medium' as const },
  { title: 'Space Tourism Ethics', cat: 'Academic', diff: 'hard' as const },
  { title: 'Fast Fashion Consequences', cat: 'General', diff: 'medium' as const },
  { title: 'Language Preservation', cat: 'Academic', diff: 'medium' as const },
  { title: 'Volunteering Benefits', cat: 'General', diff: 'easy' as const },
  { title: 'Autonomous Vehicles Safety', cat: 'Academic', diff: 'hard' as const },
  { title: 'Child Development Studies', cat: 'Academic', diff: 'medium' as const },
  { title: 'Public Transport Investment', cat: 'General', diff: 'easy' as const },
  { title: 'Scientific Research Funding', cat: 'Academic', diff: 'medium' as const },
  { title: 'Green Architecture Trends', cat: 'Academic', diff: 'medium' as const },
  { title: 'Workplace Mental Health', cat: 'General', diff: 'medium' as const },
  { title: 'Cross-Cultural Communication', cat: 'General', diff: 'easy' as const },
  { title: 'Deep Sea Exploration', cat: 'Academic', diff: 'hard' as const },
];

export const MOCK_EXAMS: MockExamDef[] = topics.map((t, i) => {
  const bankIdx = i % bankIdList.length;
  const bankId = bankIdList[bankIdx];
  const audioUrl = audioUrls[bankIdx];
  return {
    id: `mock-${i + 1}`,
    title: `IELTS Full Mock Test ${i + 1}`,
    subtitle: t.title,
    description: `Complete IELTS mock exam: ${t.title}. Includes all four sections: Listening, Reading, Writing, and Speaking.`,
    sections: ['listening', 'reading', 'writing', 'speaking'] as ('listening' | 'reading' | 'writing' | 'speaking')[],
    examType: t.cat === 'General' ? 'general' : 'academic',
    difficulty: t.diff,
    totalMinutes: 180,
    htmlFile: '',
    listeningAudioUrl: audioUrl,
    listeningBankId: bankId,
  };
});
