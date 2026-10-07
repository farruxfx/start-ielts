import Link from 'next/link';
import { Lock, ArrowRight, ChevronLeft } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
//  /subscription-required — middleware redirect target when an
//  authenticated user opens a premium test URL without an active
//  subscription. Requirement #14: never a raw error page.
// ═══════════════════════════════════════════════════════════════════════

export const metadata = { title: 'Premium Test | StartIELTS' };

export default function SubscriptionRequiredPage({
  searchParams,
}: {
  searchParams?: { skill?: string; slug?: string };
}) {
  const skill = searchParams?.skill === 'reading' ? 'reading' : 'listening';
  const backHref = `/${skill}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
          <Lock className="h-8 w-8 text-violet-600" />
        </div>

        <h1 className="text-xl font-bold text-foreground">Bu test Premium foydalanuvchilar uchun</h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ushbu testdan foydalanish uchun StartIELTS obunasini faollashtiring. Obuna
          barcha Listening, Reading, Writing, Speaking va Mock Exam testlarini ochadi.
        </p>

        <div className="mt-6 space-y-2">
          <Link
            href="/pricing"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
          >
            Obunani ko&apos;rish
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={backHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Testlar ro&apos;yxatiga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
