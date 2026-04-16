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
    <header className="h-14 flex items-center gap-4 px-6 border-b border-kpmg-outline-variant/40 bg-kpmg-surface-container-lowest dark:bg-gray-900 dark:border-gray-700 flex-shrink-0 transition-colors duration-200">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-kpmg-outline dark:text-gray-400" />
      </button>

      <div className="flex-1" />

      {/* Context label */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-kpmg-outline dark:text-gray-400 font-body">Partner Demo</span>
        <span className="text-kpmg-outline-variant/60 dark:text-gray-600 text-xs">·</span>
        <span className="text-xs font-semibold text-kpmg-on-surface-variant dark:text-gray-300 font-body">Vietnam &amp; Cambodia</span>
        <span className="text-kpmg-outline-variant/60 dark:text-gray-600 text-xs">·</span>
        <span className="text-xs text-kpmg-outline dark:text-gray-400 font-body">Q2 2026</span>
      </div>

      {/* Theme toggle */}
      <div className="flex items-center gap-0.5 bg-kpmg-surface-container dark:bg-gray-800 rounded-lg p-0.5 border border-kpmg-outline-variant/30 dark:border-gray-700">
        <button
          onClick={() => setMode('light')}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
            mode === 'light' ?'bg-white dark:bg-gray-700 shadow-sm text-kpmg-primary dark:text-blue-400' :'text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300'
          }`}
          aria-label="Light mode"
          title="Light mode"
        >
          <Sun size={13} />
        </button>
        <button
          onClick={() => setMode('system')}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
            mode === 'system' ?'bg-white dark:bg-gray-700 shadow-sm text-kpmg-primary dark:text-blue-400' :'text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300'
          }`}
          aria-label="System mode"
          title="System preference"
        >
          <Monitor size={13} />
        </button>
        <button
          onClick={() => setMode('dark')}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 ${
            mode === 'dark' ?'bg-white dark:bg-gray-700 shadow-sm text-kpmg-primary dark:text-blue-400' :'text-kpmg-outline dark:text-gray-500 hover:text-kpmg-on-surface dark:hover:text-gray-300'
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