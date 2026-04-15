'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Network,
  BookOpen,
  Calculator,
  BarChart3,
  FileText,
  Rocket,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'nav-overview', label: 'Overview', icon: <LayoutDashboard size={18} />, route: '/executive-overview' },
  { id: 'nav-architecture', label: 'Architecture', icon: <Network size={18} />, route: '/ai-architecture-explorer' },
  { id: 'nav-cases', label: 'Cases', icon: <BookOpen size={18} />, route: '/case-library', badge: 6 },
  { id: 'nav-simulator', label: 'Simulator', icon: <Calculator size={18} />, route: '/value-simulator' },
  { id: 'nav-comparison', label: 'Comparison', icon: <BarChart3 size={18} />, route: '/scenario-comparison' },
  { id: 'nav-reports', label: 'Reports', icon: <FileText size={18} />, route: '/reports' },
  { id: 'nav-pilot', label: 'Pilot Request', icon: <Rocket size={18} />, route: '/pilot-request', badge: 2 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeRoute: string;
  onClose: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse, activeRoute, onClose }: SidebarProps) {
  return (
    <aside className="h-full flex flex-col bg-kpmg-surface-container-lowest border-r border-kpmg-outline-variant/40">
      {/* Header */}
      <div className={`flex items-center h-16 px-4 border-b border-kpmg-outline-variant/40 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <AppLogo size={32} />
            <div className="min-w-0">
              <span className="font-display text-sm font-700 text-kpmg-primary tracking-tight block leading-tight">
                ArchitectFlow
              </span>
              <span className="text-xs text-kpmg-outline font-body" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
                AI INTELLIGENCE HUB
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <AppLogo size={28} />
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-kpmg-surface-container transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} className="text-kpmg-outline" /> : <ChevronLeft size={14} className="text-kpmg-outline" />}
        </button>
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg hover:bg-kpmg-surface-container transition-colors"
          aria-label="Close sidebar"
        >
          <X size={14} className="text-kpmg-outline" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-0.5">
        {!collapsed && (
          <p className="text-xs font-semibold text-kpmg-outline px-2 mb-3 mt-1 tracking-widest uppercase" style={{ fontSize: '10px' }}>
            Workspace
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route || activeRoute.startsWith(item.route + '/');
          return (
            <Link key={item.id} href={item.route}>
              <span
                className={`kpmg-sidebar-item group relative ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-kpmg-primary' : 'text-kpmg-outline'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="ml-auto flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-semibold bg-kpmg-primary" style={{ fontSize: '10px' }}>
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-kpmg-accent-negative" />
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-kpmg-on-surface text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-elevated">
                    {item.label}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t border-kpmg-outline-variant/40 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-kpmg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold font-display">SR</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-kpmg-on-surface truncate">Sarah Reynolds</p>
              <p className="text-xs text-kpmg-outline truncate">Partner, Tax Advisory</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-kpmg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold font-display">SR</span>
          </div>
        )}
      </div>
    </aside>
  );
}