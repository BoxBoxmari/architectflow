import React from 'react';
import { ACTIVITY_FEED } from '@/lib/mockData';
import { TrendingUp, Send, BookMarked, FileText, Plus } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp size={13} />,
  Send: <Send size={13} />,
  BookMarked: <BookMarked size={13} />,
  FileText: <FileText size={13} />,
  Plus: <Plus size={13} />,
};

export default function ActivityStrip() {
  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <h3 className="font-display text-sm font-bold text-kpmg-on-surface mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {ACTIVITY_FEED.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-kpmg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5 text-kpmg-outline">
              {ICON_MAP[item.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-kpmg-on-surface-variant font-body leading-snug">{item.label}</p>
              <p className="text-xs text-kpmg-outline font-body mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}