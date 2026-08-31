import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'StartIELTS — Prepare smarter. Perform better.',
    template: '%s | StartIELTS',
  },
  description: 'The smart way to prepare for IELTS. Practice all four skills, take realistic mock exams, track your progress, and achieve your target band score.',
  keywords: ['IELTS', 'IELTS preparation', 'IELTS practice', 'mock exam', 'band score'],
  openGraph: {
    title: 'StartIELTS — Prepare smarter. Perform better.',
    description: 'The smart way to prepare for IELTS. Practice all four skills, take realistic mock exams, and achieve your target band.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
