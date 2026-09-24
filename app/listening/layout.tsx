import { ConditionalDashboardLayout } from '@/components/dashboard/conditional-dashboard-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  // /listening (list) gets the sidebar; /listening/<slug> runs full-screen.
  return <ConditionalDashboardLayout>{children}</ConditionalDashboardLayout>;
}
