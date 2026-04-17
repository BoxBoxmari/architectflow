'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import {
  pageVariants,
  pageTransition,
  reducedPageVariants,
  reducedPageTransition,
} from '@/lib/animations';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export default function AppLayout({ children, activeRoute }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default (non-reduced) variants until mounted on client to avoid hydration mismatch
  const variants = mounted && prefersReducedMotion ? reducedPageVariants : pageVariants;
  const transition = mounted && prefersReducedMotion ? reducedPageTransition : pageTransition;

  return (
    /* Paper on Stone: main canvas is #FCF9F8 (Base Stone) */
    <div className="flex h-screen overflow-hidden bg-kpmg-background dark:bg-gray-950 transition-colors duration-200">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Pure Paper (#FFFFFF) lifted above Stone canvas — STATIC, excluded from transitions */}
      <div
        className={`
          fixed lg:relative z-40 h-full flex-shrink-0 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-60'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: mobileSidebarOpen ? '0px 24px 48px rgba(0, 32, 95, 0.06)' : undefined }}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeRoute={activeRoute}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar — STATIC, excluded from transitions */}
        <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Surface Container Low (#F6F3F2) for the scroll area — structural lane */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin bg-kpmg-background dark:bg-gray-950">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8 overflow-x-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}