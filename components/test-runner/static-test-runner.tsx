'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Headphones, BookOpen, Clock, ChevronLeft, Maximize2, Minimize2, AlertCircle, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTestAccess } from '@/lib/access-client';
import { PremiumTestModal } from '@/components/subscription/premium-test-modal';

export interface StaticTestInfo {
  name: string;
  filename: string;
  questionCount: number;
  duration: number;
  category: string;
  difficulty: string;
}

type Skill = 'listening' | 'reading';

const SKILL_CONFIG: Record<
  Skill,
  {
    icon: typeof Headphones;
    accentText: string;
    accentBg: string;
    listHref: string;
    listLabel: string;
    startLabel: string;
    introSummary: string;
    introTips: string[];
    introLabel: string;
  }
> = {
  listening: {
    icon: Headphones,
    accentText: 'text-violet-600',
    accentBg: 'bg-violet-500/10',
    listHref: '/listening',
    listLabel: 'Listening',
    startLabel: 'Start Listening',
    introLabel: 'IELTS Listening',
    introSummary: 'This test contains 4 parts with 40 questions total. Audio plays once automatically.',
    introTips: [
      'Audio plays automatically — listen carefully',
      'You can skip forward/backward within audio',
      'Answer all questions before time runs out',
      'Check answers at the end',
    ],
  },
  reading: {
    icon: BookOpen,
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-500/10',
    listHref: '/reading',
    listLabel: 'Reading',
    startLabel: 'Start Reading',
    introLabel: 'IELTS Reading',
    introSummary: 'This test contains 3 passages with 40 questions. Read carefully and manage your time wisely.',
    introTips: [
      'You have 60 minutes for all 3 passages',
      'Manage your time: ~20 min per passage',
      'Read the questions before the passage',
      'Check all answers before submitting',
    ],
  },
};

/**
 * Full-screen runner for the iframe-based Listening / Reading tests.
 * Header and intro mirror the Mock Exam runner exactly (h-14 header with
 * mono timer pill, max-w-lg intro card with the amber notice block), so the
 * whole platform shares one examination interface.
 */
export function StaticTestRunner({ test, skill }: { test: StaticTestInfo | null; skill: Skill }) {
  const cfg = SKILL_CONFIG[skill];
  const Icon = cfg.icon;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test ? test.duration * 60 : 60 * 60);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Server-side access gate (defense in depth — middleware also guards the
  // runner route and the static HTML, but this keeps the UX in-place).
  const slug = test?.filename
    ? test.filename.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-').replace(/\.html$/, '')
    : undefined;
  const { checking, allowed } = useTestAccess(skill, slug);

  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleIframeLoad = useCallback(() => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    try {
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
        * { -webkit-user-select: none !important; -moz-user-select: none !important; -ms-user-select: none !important; user-select: none !important; }
        input, textarea { -webkit-user-select: text !important; user-select: text !important; }
        body { -webkit-touch-callout: none; } @media print { body { display: none !important; } }
      `;
      (doc.head || doc.documentElement).appendChild(style);

      ['login-screen', 'home-screen', 'scIntro', 'login', 'welcome-modal-bg', 'premium-modal-bg'].forEach((id) => {
        const el = doc.getElementById(id);
        if (el) el.setAttribute('style', 'display:none!important;visibility:hidden!important;');
      });
      ['exam-screen', 'scTest'].forEach((id) => {
        const el = doc.getElementById(id);
        if (el) el.setAttribute('style', 'display:flex!important;flex-direction:column;height:100%;visibility:visible!important;');
      });

      doc.querySelectorAll('*').forEach((el) => {
        if (el.children.length === 0 && el.textContent &&
            (el.textContent.includes('reading_cdi') || el.textContent.includes('READING_CDI') ||
             el.textContent.includes('shohrukh'))) {
          el.textContent = '';
        }
      });

      doc.body.style.overflow = 'auto';

      // Re-hide popups that some generators re-show after initialization.
      let hideCount = 0;
      const hideInterval = setInterval(() => {
        try {
          if (!iframe.contentDocument) return;
          const d = iframe.contentDocument;
          ['welcome-modal-bg', 'premium-modal-bg', 'login-screen', 'home-screen', 'scIntro', 'login'].forEach((id) => {
            const el = d.getElementById(id);
            if (el) el.setAttribute('style', 'display:none!important;visibility:hidden!important;');
          });
          d.querySelectorAll('.tglink, .channel-link, .vip-pack-btn, .pill-vip, .pill-tg, .pill, .premium-btn, .exam-sub').forEach((el) => ((el as HTMLElement).style.display = 'none'));
        } catch (e) {}
        if (++hideCount >= 10) clearInterval(hideInterval);
      }, 500);

      const win = iframe.contentWindow as any;
      try { if (typeof win.startTest === 'function') win.startTest(); } catch (e) {}
      try { if (typeof win.startExam === 'function') win.startExam(); } catch (e) {}
      try { if (typeof win.beginExam === 'function') win.beginExam(); } catch (e) {}
    } catch (e) {
      console.log('Cannot inject into iframe:', e);
    }
  }, []);

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Test not found.</p>
          <Link href={cfg.listHref} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to {cfg.listLabel} Tests
          </Link>
        </div>
      </div>
    );
  }

  // ── Access gate: server decision pending ──
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  // ── Access gate: server denied → subscription prompt, never the test ──
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
            <Lock className="h-8 w-8 text-violet-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Bu test Premium foydalanuvchilar uchun</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ushbu testdan foydalanish uchun StartIELTS obunasini faollashtiring.
          </p>
          <div className="mt-6 space-y-2">
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Obunani ko&apos;rish →
            </Link>
            <Link
              href={cfg.listHref}
              className="flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Orqaga qaytish
            </Link>
          </div>
        </div>
        <PremiumTestModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} testName={test?.name} />
      </div>
    );
  }

  // ── Intro Screen (matches Mock Exam intro card) ──
  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className={cn('mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full', cfg.accentBg)}>
              <Icon className={cn('h-8 w-8', cfg.accentText)} />
            </div>
            <h1 className="text-xl font-bold">{test.name}</h1>
            <p className="text-sm text-muted-foreground mt-2">{test.questionCount} Questions · {test.duration} Minutes</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', cfg.accentBg, cfg.accentText)}>{cfg.introLabel}</span>
                <span className="text-xs text-muted-foreground">{test.category} · {test.difficulty}</span>
              </div>
              <p className="text-sm">{cfg.introSummary}</p>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-500/10 p-3 text-xs text-amber-800">
            <p className="mb-1 font-semibold">⚠️ Important:</p>
            <ul className="list-inside list-disc space-y-0.5">
              {cfg.introTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Link href={cfg.listHref} className="flex-1 rounded-xl border border-border px-4 py-3 text-center text-sm font-medium hover:bg-muted transition-colors">
              Cancel
            </Link>
            <button onClick={() => setStarted(true)} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              {cfg.startLabel} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Test Runner (matches Mock Exam header) ──
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-3 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link href={cfg.listHref} className="inline-flex flex-shrink-0 items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{cfg.listLabel}</span>
          </Link>
          <div className="h-4 w-px flex-shrink-0 bg-border" />
          <Icon className={cn('h-4 w-4 flex-shrink-0', cfg.accentText)} />
          <span className="truncate text-xs font-semibold sm:text-sm">{test.name}</span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2 py-1.5 font-mono text-xs sm:px-3 sm:text-sm',
            timeLeft <= 300 ? 'animate-pulse border-red-300 bg-red-50 text-red-600' :
            timeLeft <= 600 ? 'border-amber-300 bg-amber-50 text-amber-600' :
            'border-border bg-muted/50 text-foreground'
          )}>
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <iframe
          src={'/' + skill + '/' + test.filename}
          className="h-full w-full border-0"
          title={test.name}
          allow="autoplay"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}
