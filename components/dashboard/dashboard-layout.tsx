'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  FileCheck,
  BarChart3,
  BookMarked,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ShieldCheck,
  ClipboardList,
  Crown,
  ArrowRight,
  ClipboardEdit,
} from 'lucide-react';
import { useAuth } from '@/components/auth/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getUserPlan } from '@/lib/subscription';
import { UpgradeModal } from '@/components/subscription/upgrade-modal';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationPanel } from '@/components/notifications/notification-panel';
import { getUnreadCount } from '@/lib/notifications';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Practice', href: '/practice', icon: BookOpen },
  { label: 'Mock Exam', href: '/mock-exam', icon: ClipboardList },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Vocabulary', href: '/vocabulary', icon: BookMarked },
  { label: 'AI Coach', href: '/ai-coach', icon: Brain },
];

// Bottom tab bar items — compact for mobile
const bottomTabs = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Practice', href: '/practice', icon: BookOpen },
  { label: 'Mock', href: '/mock-exam', icon: ClipboardList },
  { label: 'Stats', href: '/analytics', icon: BarChart3 },
  { label: 'More', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, role, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    setNotifCount(getUnreadCount());
  }, [pathname]);
  const currentPlan = user ? getUserPlan(user.id) : 'free';
  const isFreeUser = currentPlan === 'free';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight">IELTS PRO</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Upgrade Widget */}
          {isFreeUser && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full mt-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-4 text-left text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Get Pro</span>
              </div>
              <p className="text-[11px] text-white/80">To'liq kirish oling — AI tahlil, unlimited tests</p>
              <div className="mt-2 flex items-center gap-1 text-xs font-bold">
                Boshlash <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          )}
        </nav>

        <div className="border-t border-border p-4">
          {(role === 'admin' || role === 'teacher') && (
            <Link
              href="/teacher"
              className="mb-1 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <ClipboardEdit className="h-4 w-4" />
              Teacher Panel
            </Link>
          )}
          {role === 'admin' && (
            <Link
              href="/admin"
              className="mb-1 flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-bold tracking-tight">IELTS PRO</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border p-4">
              {(role === 'admin' || role === 'teacher') && (
                <Link
                  href="/teacher"
                  onClick={() => setSidebarOpen(false)}
                  className="mb-1 flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <ClipboardEdit className="h-4 w-4" />
                  Teacher Panel
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className="mb-1 flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 md:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-white/80 px-4 backdrop-blur-xl md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-border/50"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">IELTS PRO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              onClick={() => setShowNotifications(true)}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-border/50"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {notifCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content with bottom padding for mobile tab bar */}
        <main className="p-4 pb-24 sm:p-6 md:pb-8 lg:p-8">{children}</main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-white/90 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomTabs.map((tab) => {
            const active = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all min-w-[56px]',
                  active
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                  active ? 'bg-primary/10' : ''
                )}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Upgrade Modal */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      {/* Notifications */}
      <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}
