'use client';
import React from 'react';
import { Menu, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { mode, setMode } = useTheme();

  return (
    <header
      className="h-14 flex items-center gap-4 px-6 bg-kpmg-surface-container-lowest dark:bg-gray-900 flex-shrink-0 transition-colors duration-200"
      style={{ borderBottom: '1px solid rgba(196, 198, 212, 0.3)' }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-kpmg-outline dark:text-gray-400" />
      </button>

      <div className="flex-1" />

      {/* Context label — editorial micro-labels */}
      <div className="hidden md:flex items-center gap-2">
        <span className="font-body text-kpmg-outline dark:text-gray-400" style={{ fontSize: '11px' }}>Partner Demo</span>
        <span className="text-kpmg-outline-variant dark:text-gray-600" style={{ fontSize: '11px' }}>·</span>
        <span className="font-body font-semibold text-kpmg-on-surface-variant dark:text-gray-300" style={{ fontSize: '11px' }}>Vietnam &amp; Cambodia</span>
        <span className="text-kpmg-outline-variant dark:text-gray-600" style={{ fontSize: '11px' }}>·</span>
        <span className="font-body text-kpmg-outline dark:text-gray-400" style={{ fontSize: '11px' }}>Q2 2026</span>
      </div>

      {/* Theme toggle — tonal surface, no harsh border */}
      <div
        className="flex items-center gap-0.5 bg-kpmg-surface-container dark:bg-gray-800 rounded-xl p-0.5"
        style={{ border: '1px solid rgba(196, 198, 212, 0.3)' }}
      >
        <button
          onClick={() => setMode('light')}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 ${
            mode === 'light' ?'bg-white dark:bg-gray-700 shadow-elevated text-kpmg-primary dark:text-blue-400' :'text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300'
          }`}
          aria-label="Light mode"
          title="Light mode"
        >
          <Sun size={13} />
        </button>
        <button
          onClick={() => setMode('system')}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 ${
            mode === 'system' ?'bg-white dark:bg-gray-700 shadow-elevated text-kpmg-primary dark:text-blue-400' :'text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300'
          }`}
          aria-label="System mode"
          title="System preference"
        >
          <Monitor size={13} />
        </button>
        <button
          onClick={() => setMode('dark')}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 ${
            mode === 'dark' ?'bg-white dark:bg-gray-700 shadow-elevated text-kpmg-primary dark:text-blue-400' :'text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300'
          }`}
          aria-label="Dark mode"
          title="Dark mode"
        >
          <Moon size={13} />
        </button>
      </div>
    </header>
  );
}