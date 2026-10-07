'use client';

// ═══════════════════════════════════════════════════════════════════════
//  PREMIUM TEST MODAL — shown when a free user tries to open a premium
//  test (card click / runner gate). Never an error page — a professional
//  subscription prompt that matches the StartIELTS design system.
// ═══════════════════════════════════════════════════════════════════════

import Link from 'next/link';
import { Lock, ArrowRight, X } from 'lucide-react';

interface PremiumTestModalProps {
  open: boolean;
  onClose: () => void;
  testName?: string;
}

export function PremiumTestModal({ open, onClose, testName }: PremiumTestModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Yopish"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
            <Lock className="h-7 w-7 text-violet-600" />
          </div>

          <h2 className="text-lg font-bold text-foreground">Bu test Premium foydalanuvchilar uchun</h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Ushbu testdan foydalanish uchun StartIELTS obunasini faollashtiring.
            {testName && (
              <span className="mt-1 block truncate text-xs text-muted-foreground/80">«{testName}»</span>
            )}
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <Link
            href="/pricing"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
          >
            Obunani ko&apos;rish
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Keyinroq
          </button>
        </div>
      </div>
    </div>
  );
}
