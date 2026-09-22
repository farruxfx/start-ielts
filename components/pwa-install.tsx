'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

// ============================================================
// PWA: service-worker registration + install prompt (Phase 9.2 / 9.4)
// ============================================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(err => console.warn('SW registration failed:', err));
    }
  }, []);

  // Capture the install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Don't show immediately — respect the user (show after 5s, once per session)
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 5000);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Already running as installed app?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  if (installed || !showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">StartIELTS ni o'rnatish</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ilova sifatida o'rnating — tezroq ishlaydi va offline qo'llab-quvvatlaydi.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              O'rnatish
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Keyinroq
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Close"
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
