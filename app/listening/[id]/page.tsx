'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home, Headphones, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const testFiles: Record<string, { title: string; file: string }> = {
  'cambridge-21-test-3': { title: 'Cambridge 21 - Test 3', file: '/listening/cambridge-21-test-3.html' },
  'cambridge-21-test-4': { title: 'Cambridge 21 - Test 4', file: '/listening/cambridge-21-test-4.html' },
};

export default function ListeningTestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const test = testFiles[id];
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Headphones className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Test not found.</p>
          <Link href="/listening" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Listening Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link
            href="/listening"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Listening Tests</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1">
            <Headphones className="h-3.5 w-3.5 text-violet-600" />
            <span className="text-xs font-semibold text-violet-600">{test.title}</span>
          </div>
          <button
            onClick={() => {
              const el = document.documentElement;
              if (!document.fullscreenElement) {
                el.requestFullscreen?.();
                setIsFullscreen(true);
              } else {
                document.exitFullscreen?.();
                setIsFullscreen(false);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Test iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={test.file}
          className="h-full w-full border-0"
          title={test.title}
          allow="autoplay"
        />
      </div>
    </div>
  );
}
