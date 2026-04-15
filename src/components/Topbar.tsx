'use client';
import React from 'react';
import { Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-kpmg-outline-variant/40 bg-kpmg-surface-container-lowest flex-shrink-0">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-kpmg-surface-container transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-kpmg-outline" />
      </button>

      <div className="flex-1" />

      {/* Context label — honest, no fake live signals */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-kpmg-outline font-body">Partner Demo</span>
        <span className="text-kpmg-outline-variant/60 text-xs">·</span>
        <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">Vietnam &amp; Cambodia</span>
        <span className="text-kpmg-outline-variant/60 text-xs">·</span>
        <span className="text-xs text-kpmg-outline font-body">Q2 2026</span>
      </div>
    </header>
  );
}