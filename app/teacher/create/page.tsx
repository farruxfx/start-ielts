'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTestPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/teacher');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
