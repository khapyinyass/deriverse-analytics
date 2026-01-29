import React from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { WalletProvider } from '@/contexts/wallet-context';
import { AppProvider } from '@/contexts/app-context';
import './globals.css';

const _inter = Inter({ subsets: ['latin'] });
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deriverse Analytics | Trading Journal & Portfolio Analytics',
  description:
    'Professional trading analytics dashboard for Solana-based decentralized trading. Track PnL, analyze performance, and optimize your trading strategy.',
  generator: 'Deriverse',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased dark bg-background text-foreground">
        <WalletProvider>
          <AppProvider>{children}</AppProvider>
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  );
}
