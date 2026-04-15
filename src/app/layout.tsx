import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Manrope, DM_Sans } from 'next/font/google';

import ToasterProvider from '@/components/ToasterProvider';
import '../styles/tailwind.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ArchitectFlow — KPMG AI Intelligence Hub',
  description: 'Internal executive decision-support platform for KPMG Partners to assess AI portfolio value, explore architecture, simulate scenarios, and generate decision-ready outputs.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable}`}>
      <body className="bg-kpmg-background font-body antialiased">
        {children}
        <ToasterProvider />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Farchitectf1565back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}