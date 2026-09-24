import { ConditionalDashboardLayout } from '@/components/dashboard/conditional-dashboard-layout';

export default function WritingLayout({ children }: { children: React.ReactNode }) {
  // /writing (overview) gets the sidebar; /writing/test/<id> runs full-screen.
  return <ConditionalDashboardLayout>{children}</ConditionalDashboardLayout>;
}
