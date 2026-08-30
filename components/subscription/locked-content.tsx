'use client';

import Link from 'next/link';
import { Lock, ArrowRight, Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/use-auth';
import {
  getUserPlan,
  getUpgradePrompt,
  getRequiredPlan,
  getPlanById,
  type PlanId,
} from '@/lib/subscription';

interface LockedContentProps {
  feature: string;
  children?: React.ReactNode;
  className?: string;
  showPreview?: boolean;
  compact?: boolean;
}

export function LockedContent({ feature, children, className, showPreview = true, compact = false }: LockedContentProps) {
  const { user } = useAuth();
  const currentPlan = user ? getUserPlan(user.id) : 'free';
  const prompt = user ? getUpgradePrompt(user.id, feature) : null;
  const requiredPlan = getRequiredPlan(feature);
  const requiredPlanDef = getPlanById(requiredPlan);

  // If user has access, show children
  if (prompt === null) {
    return <>{children}</>;
  }

  // Locked content preview
  if (compact) {
    return (
      <div className={cn('relative rounded-xl border border-border bg-card overflow-hidden', className)}>
        {/* Preview content (blurred) */}
        {showPreview && children && (
          <div className="relative">
            <div className="blur-[2px] opacity-40 pointer-events-none select-none">
              {children}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </div>
        )}

        {/* Lock overlay */}
        <div className="relative p-4 sm:p-5 text-center">
          <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-semibold mb-1">{prompt.title}</p>
          <p className="text-xs text-muted-foreground mb-3">{prompt.message}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {prompt.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Full locked content overlay
  return (
    <div className={cn('relative rounded-2xl border-2 border-dashed border-border bg-muted/20 overflow-hidden', className)}>
      {/* Preview content (blurred) */}
      {showPreview && children && (
        <div className="relative">
          <div className="blur-[3px] opacity-30 pointer-events-none select-none max-h-[200px] overflow-hidden">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      {/* Upgrade prompt */}
      <div className="relative p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">{prompt.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">{prompt.message}</p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            {prompt.icon} {prompt.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {requiredPlanDef && (
          <p className="text-xs text-muted-foreground mt-3">
            Requires: {requiredPlanDef.icon} {requiredPlanDef.name} plan
          </p>
        )}
      </div>
    </div>
  );
}

// ═══ Simple inline lock badge ═══
export function LockBadge({ plan }: { plan: PlanId }) {
  const def = getPlanById(plan);
  if (!def) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
      <Lock className="h-2.5 w-2.5" />
      {def.icon} {def.name}
    </span>
  );
}
