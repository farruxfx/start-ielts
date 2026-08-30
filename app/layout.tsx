import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/auth-provider';
import { MockAuthProvider } from '@/components/auth/mock-auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { isSupabaseConfigured } from '@/lib/supabase';

export const metadata: Metadata = {
  title: {
    default: 'IELTS PRO — Prepare smarter. Score higher.',
    template: '%s | IELTS PRO',
  },
  description:
    'Professional IELTS preparation platform with real exam interface, AI-powered writing and speaking evaluation, detailed analytics, and full mock exams.',
  keywords: [
    'IELTS preparation',
    'IELTS practice',
    'IELTS mock exam',
    'IELTS writing evaluation',
    'IELTS speaking practice',
    'IELTS reading',
    'IELTS listening',
    'band score calculator',
  ],
  authors: [{ name: 'IELTS PRO' }],
  openGraph: {
    title: 'IELTS PRO — Prepare smarter. Score higher.',
    description:
      'Professional IELTS preparation platform with real exam interface, AI-powered evaluation, and detailed analytics.',
    type: 'website',
    locale: 'en_US',
    siteName: 'IELTS PRO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IELTS PRO — Prepare smarter. Score higher.',
    description:
      'Professional IELTS preparation platform with real exam interface, AI-powered evaluation, and detailed analytics.',
  },
};

function AuthWrapper({ children }: { children: React.ReactNode }) {
  // Use mock auth when Supabase is not configured (for local development/testing)
  if (!isSupabaseConfigured) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }
  return <AuthProvider>{children}</AuthProvider>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthWrapper>{children}</AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
