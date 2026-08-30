const fs = require('fs');
const content = `'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, Home, Headphones, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getListeningTest } from '@/lib/listening-tests';

export default function ListeningTestPage({ params }: { params: { id: string } }) {
  const id = params?.id as string;
  const test = getListeningTest(id);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleIframeLoad = useCallback(() => {
    // Inject script into iframe to hide login and show exam
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;
    
    try {
      // Hide login screen
      const ls = doc.getElementById('login-screen');
      if (ls) ls.style.display = 'none';
      
      // Hide home screen  
      const hs = doc.getElementById('home-screen');
      if (hs) hs.style.display = 'none';
      
      // Show exam screen
      const es = doc.getElementById('exam-screen');
      if (es) es.style.display = 'block';
      
      // Hide ALL screens except exam
      doc.querySelectorAll('.screen').forEach((el) => {
        if (el.id === 'exam-screen') {
          (el as HTMLElement).style.display = 'block';
          (el as HTMLElement).style.visibility = 'visible';
        } else {
          (el as HTMLElement).style.display = 'none';
        }
      });
      
      // Allow body scroll
      doc.body.style.overflow = 'auto';
      
      // Hide VIP/Telegram elements
      doc.querySelectorAll('.channel-link, .vip-pack-btn, a[href*="telegram"]').forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // Try to auto-start the exam
      const win = iframe.contentWindow as any;
      if (typeof win.beginExam === 'function') win.beginExam();
      if (typeof win.startExam === 'function') win.startExam();
      if (typeof win.startTest === 'function') win.startTest();
    } catch(e) {
      // Cross-origin - can't inject
      console.log('Cannot inject into iframe:', e);
    }
  }, []);

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
            <span className="text-xs font-semibold text-violet-600">{test.name}</span>
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
          src={"/listening/" + test.filename}
          className="h-full w-full border-0"
          title={test.name}
          allow="autoplay"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
`;

fs.writeFileSync('C:/Users/user/ieltsprep/app/listening/[id]/page.tsx', content);
console.log('Runner page written');
