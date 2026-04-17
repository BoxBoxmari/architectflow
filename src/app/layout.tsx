import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import ToasterProvider from '@/components/ToasterProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import '../styles/tailwind.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
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
    <html lang="en" className={`${inter.variable}`} style={{ '--font-display': 'var(--font-body)' } as React.CSSProperties}>
      <body className="bg-kpmg-background dark:bg-gray-950 font-body antialiased transition-colors duration-200">
        <ThemeProvider>
          {children}
          <ToasterProvider />
        </ThemeProvider>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Farchitectf1565back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}