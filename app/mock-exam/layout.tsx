import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function MockExamLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
