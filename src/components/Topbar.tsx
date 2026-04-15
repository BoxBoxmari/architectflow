'use client';
import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Menu, ChevronDown } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

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

      {/* Search */}
      <div className={`flex-1 max-w-sm relative transition-all duration-200 ${searchFocused ? 'max-w-md' : ''}`}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-kpmg-outline pointer-events-none" />
        <input
          type="text"
          placeholder="Search cases, scenarios, reports..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-8 pr-4 py-1.5 text-sm bg-kpmg-surface-container rounded-lg border border-transparent focus:border-kpmg-outline-variant focus:outline-none focus:ring-2 focus:ring-kpmg-primary/10 placeholder:text-kpmg-outline transition-all font-body"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-kpmg-outline hidden sm:block">⌘K</span>
      </div>

      <div className="flex-1" />

      {/* Utility actions */}
      <div className="flex items-center gap-1">
        <button className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-kpmg-surface-container transition-colors" aria-label="Notifications">
          <Bell size={16} className="text-kpmg-outline" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-kpmg-accent-negative" />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-kpmg-surface-container transition-colors" aria-label="Help">
          <HelpCircle size={16} className="text-kpmg-outline" />
        </button>
      </div>

      {/* Quarter badge */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-kpmg-surface-container border border-kpmg-outline-variant/40">
        <span className="w-1.5 h-1.5 rounded-full bg-kpmg-accent-faster" />
        <span className="text-xs font-semibold text-kpmg-on-surface-variant font-body">Q2 2026</span>
        <ChevronDown size={10} className="text-kpmg-outline" />
      </div>
    </header>
  );
}