'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BookOpen, Clock, ChevronLeft, Home, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getReadingTest } from '@/lib/reading-tests';

export default function ReadingTestPage({ params }: { params: { id: string } }) {
  const id = params?.id as string;
  const test = getReadingTest(id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleIframeLoad = useCallback(() => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    try {
      // Inject CSS to permanently hide branding and add copy protection
      const style = doc.createElement('style');
      style.textContent = `
        .tglink, .tg-home-btn, .pill-tg, .pill-vip, .pill, .watermark, .login-hint,
        .channel-link, .vip-pack-btn, a[href*="telegram"], a[href*="t.me"],
        .telegram-link, .telegram-float, [href*="reading_cdi"], [href*="shohrukh"],
        .logo sup, .login-logo, .home-logo, .intronote,
        .exam-sub, .premium-btn, a.pill { display: none !important; }
        #login-screen, #home-screen, #scIntro, .center-wrap, #login,
        [id*="login"]:not(#login-screen),
        #welcome-modal-bg, #welcome-modal, #premium-modal-bg,
        [id*="welcome"], [id*="premium"] { display: none !important; }
        #exam-screen, #scTest { display: flex !important; flex-direction: column; height: 100%; visibility: visible !important; }
        /* Copy Protection */
        * { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; }
        input, textarea { -webkit-user-select: text !important; user-select: text !important; }
        body { -webkit-touch-callout: none; } @media print { body { display: none !important; } }
      `;
      (doc.head || doc.documentElement).appendChild(style);

      // Hide login and show exam via JS
      ['login-screen', 'home-screen', 'scIntro', 'welcome-modal-bg', 'premium-modal-bg'].forEach(id => {
        const el = doc.getElementById(id);
        if (el) el.setAttribute('style', 'display:none!important;visibility:hidden!important;');
      });
      ['exam-screen', 'scTest'].forEach(id => {
        const el = doc.getElementById(id);
        if (el) el.setAttribute('style', 'display:flex!important;flex-direction:column;height:100%;visibility:visible!important;');
      });

      // Remove brand text nodes
      doc.querySelectorAll('*').forEach(el => {
        if (el.children.length === 0 && el.textContent &&
            (el.textContent.includes('reading_cdi') || el.textContent.includes('READING_CDI') ||
             el.textContent.includes('shohrukh'))) {
          el.textContent = '';
        }
      });

      // Allow body scroll
      doc.body.style.overflow = 'auto';

      // Poll for re-shows every 500ms for 5s
      let hideCount = 0;
      const hideInterval = setInterval(() => {
        try {
          if (!iframe.contentDocument) return;
          const d = iframe.contentDocument;
          ['welcome-modal-bg', 'premium-modal-bg', 'login-screen', 'home-screen', 'scIntro'].forEach(id => {
            const el = d.getElementById(id);
            if (el) el.setAttribute('style', 'display:none!important;visibility:hidden!important;');
          });
          d.querySelectorAll('.tglink, .channel-link, .vip-pack-btn, .pill-vip, .pill-tg, .pill, .premium-btn, .exam-sub').forEach(el => (el as HTMLElement).style.display = 'none');
          d.querySelectorAll('*').forEach(el => {
            if (el.children.length === 0 && el.textContent &&
                (el.textContent.includes('reading_cdi') || el.textContent.includes('READING_CDI') || el.textContent.includes('shohrukh'))) {
              el.textContent = '';
            }
          });
        } catch(e) {}
        if (++hideCount >= 10) clearInterval(hideInterval);
      }, 500);

      // Auto-start the exam
      const win = iframe.contentWindow as any;
      try { if (typeof win.startTest === 'function') win.startTest(); } catch(e) {}
      try { if (typeof win.startExam === 'function') win.startExam(); } catch(e) {}
      try { if (typeof win.beginExam === 'function') win.beginExam(); } catch(e) {}
    } catch(e) {
      console.log('Cannot inject into iframe:', e);
    }
  }, []);

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Test not found.</p>
          <Link href="/reading" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to Reading Tests
          </Link>
        </div>
      </div>
    );
  }

  // ── Intro Screen ──
  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <BookOpen className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold">{test.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">{test.questionCount} Questions · {test.duration} Minutes</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">IELTS Reading</span>
                <span className="text-xs text-muted-foreground">{test.category} · {test.difficulty}</span>
              </div>
              <p className="text-sm">This test contains 3 passages with 40 questions. Read carefully and manage your time wisely.</p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-emerald-500/10 border border-emerald-200 p-3 mb-6">
            <AlertCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-emerald-800">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>You have 60 minutes for all 3 passages</li>
                <li>Manage your time: ~20 min per passage</li>
                <li>Read the questions before the passage</li>
                <li>Check all answers before submitting</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/reading" className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </Link>
            <button onClick={() => setStarted(true)} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Start Reading →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Test Runner ──
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link href="/reading" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Reading</span>
          </Link>
          <div className="h-4 w-px bg-border flex-shrink-0" />
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 min-w-0">
            <BookOpen className="h-3 w-3 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-600 truncate">{test.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 rounded-lg border px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-mono ${
            timeLeft <= 300 ? 'border-red-300 bg-red-50 text-red-600 animate-pulse' :
            timeLeft <= 600 ? 'border-amber-300 bg-amber-50 text-amber-600' :
            'border-border bg-muted/50 text-foreground'
          }`}>
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
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
            className="inline-flex items-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={"/reading/" + test.filename}
          className="h-full w-full border-0"
          title={test.name}
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
