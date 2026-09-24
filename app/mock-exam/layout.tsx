import { ConditionalDashboardLayout } from '@/components/dashboard/conditional-dashboard-layout';

export default function MockExamLayout({ children }: { children: React.ReactNode }) {
  // /mock-exam and /mock-exam/history keep the sidebar;
  // /mock-exam/<session-id> and /mock-exam/result run full-screen.
  return (
    <ConditionalDashboardLayout sidebarSegments={['history']}>
      {children}
    </ConditionalDashboardLayout>
  );
}
