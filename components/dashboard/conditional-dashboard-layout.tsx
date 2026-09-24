'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import type { ReactNode } from 'react';

/**
 * Wraps dashboard pages with the sidebar chrome, but renders full-screen test
 * runner sub-routes (e.g. /listening/<slug>, /writing/test/<id>,
 * /mock-exam/<id>) without the dashboard layout — those pages draw their own
 * header.
 *
 * `sidebarSegments` lists the second path segment values that should still
 * show the dashboard chrome. Any other (or absent) second segment renders
 * full-screen. Example: /mock-exam/history keeps the sidebar while
 * /mock-exam/<session-id> runs full-screen.
 */
export function ConditionalDashboardLayout({
  children,
  sidebarSegments = [],
}: {
  children: ReactNode;
  /** Second path segment values that keep the dashboard sidebar. */
  sidebarSegments?: string[];
}) {
  const pathname = usePathname() || '';
  const segments = pathname.split('/').filter(Boolean);
  const second = segments[1];
  const showChrome = second === undefined || sidebarSegments.includes(second);

  if (showChrome) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <>{children}</>;
}
