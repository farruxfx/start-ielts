import { ConditionalDashboardLayout } from '@/components/dashboard/conditional-dashboard-layout';

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  // /reading (list) gets the sidebar; /reading/<slug> runs full-screen.
  return <ConditionalDashboardLayout>{children}</ConditionalDashboardLayout>;
}
