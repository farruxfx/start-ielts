export default function MockExamRunnerLayout({ children }: { children: React.ReactNode }) {
  // No sidebar - the runner page provides its own header
  return <>{children}</>;
}
