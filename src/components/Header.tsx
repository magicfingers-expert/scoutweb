'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Users, Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showQuickActions?: boolean;
}

export default function Header({ title, subtitle, showQuickActions = true }: HeaderProps) {
  return (
    <header className="py-6 px-8 border-b border-[#141f36] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {showQuickActions && (
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/finder"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold shadow-md shadow-cyan-500/10 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find new opportunities</span>
          </Link>

          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e172a] hover:bg-[#14213d] text-slate-200 border border-[#203152] text-xs font-medium transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>View leads</span>
          </Link>

          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e172a] hover:bg-[#14213d] text-slate-200 border border-[#203152] text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New website audit</span>
          </Link>
        </div>
      )}
    </header>
  );
}

