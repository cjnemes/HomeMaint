import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'HomeMaint - Home Maintenance Tracker',
  description: 'Track your home systems, appliances, and maintenance records. Works offline.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HomeMaint',
  },
  icons: {
    icon: [
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <OfflineIndicator />
        <Toaster />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
