'use client';

import { useParams } from 'next/navigation';
import { getReadingTest } from '@/lib/reading-tests';
import { StaticTestRunner } from '@/components/test-runner/static-test-runner';

export default function ReadingTestPage() {
  const params = useParams();
  const id = params?.id as string;
  const test = getReadingTest(id);

  return <StaticTestRunner test={test ?? null} skill="reading" />;
}
