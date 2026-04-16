'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Network,
  Calculator,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'nav-overview', label: 'Executive Overview', icon: <LayoutDashboard size={18} />, route: '/executive-overview' },
  { id: 'nav-architecture', label: 'AI Architecture', icon: <Network size={18} />, route: '/ai-architecture-explorer' },
  { id: 'nav-simulator', label: 'Value Simulator', icon: <Calculator size={18} />, route: '/value-simulator' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeRoute: string;
  onClose: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse, activeRoute, onClose }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col bg-kpmg-surface-container-lowest dark:bg-gray-900 border-r border-kpmg-outline-variant/40 dark:border-gray-700 transition-colors duration-200">
      {/* Header */}
      <div className={`flex items-center h-16 px-4 border-b border-kpmg-outline-variant/40 dark:border-gray-700 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <AppLogo size={32} />
            <div className="min-w-0">
              <span className="font-display text-sm font-700 text-kpmg-primary dark:text-blue-400 tracking-tight block leading-tight">
                ArchitectFlow
              </span>
              <span className="text-xs text-kpmg-outline dark:text-gray-500 font-body" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                PARTNER MVP · KPMG
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <AppLogo size={28} />
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} className="text-kpmg-outline dark:text-gray-500" /> : <ChevronLeft size={14} className="text-kpmg-outline dark:text-gray-500" />}
        </button>
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-kpmg-surface-container dark:hover:bg-gray-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={14} className="text-kpmg-outline dark:text-gray-500" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-0.5">
        {!collapsed && (
          <p className="text-xs font-semibold text-kpmg-outline dark:text-gray-500 px-2 mb-3 mt-1 tracking-widest uppercase font-body" style={{ fontSize: '10px' }}>
            Demo Flow
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route || activeRoute.startsWith(item.route + '/');
          return (
            <Link key={item.id} href={item.route}>
              <span
                className={`kpmg-sidebar-item group relative dark-sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-kpmg-primary dark:text-blue-400' : 'text-kpmg-outline dark:text-gray-500'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-kpmg-on-surface dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-elevated">
                    {item.label}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t border-kpmg-outline-variant/40 dark:border-gray-700 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="px-2">
            <p className="text-xs text-kpmg-outline dark:text-gray-500 font-body">KPMG Vietnam &amp; Cambodia</p>
            <p className="text-xs text-kpmg-outline/60 dark:text-gray-600 font-body mt-0.5">Partner Briefing · Q2 2026</p>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-kpmg-primary/10 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-kpmg-primary dark:text-blue-400 text-xs font-bold font-display">K</span>
          </div>
        )}
      </div>
    </aside>
  );
}