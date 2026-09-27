'use client';

import { useParams } from 'next/navigation';
import { getListeningTest } from '@/lib/listening-tests';
import { StaticTestRunner } from '@/components/test-runner/static-test-runner';

export default function ListeningTestPage() {
  const params = useParams();
  const id = params?.id as string;
  const test = getListeningTest(id);

  return <StaticTestRunner test={test ?? null} skill="listening" />;
}
