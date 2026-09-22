import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { CopyProtection } from '@/components/copy-protection';
import { ToastContainer } from '@/components/toast-container';
import { PwaInstall } from '@/components/pwa-install';
import { createMetadata, SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  ...createMetadata({}),
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StartIELTS',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <CopyProtection />
          {children}
          <ToastContainer />
          <PwaInstall />
        </Providers>
      </body>
    </html>
  );
}
