'use client';

import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
