'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Radar,
  GitCompare,
  Users,
  Palette,
  Sparkles,
  BarChart3,
  HelpCircle,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface SidebarProps {
  onSignOut?: () => void;
}

export default function Sidebar({ onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: '+ New audit',
      href: '/audit',
      icon: PlusCircle,
    },
    {
      label: 'Opportunity Finder',
      href: '/finder',
      icon: Radar,
    },
    {
      label: 'Competitor comparison',
      href: '/competitor',
      icon: GitCompare,
    },
    {
      label: 'Leads',
      href: '/leads',
      icon: Users,
    },
    {
      label: 'AI Website Designer',
      href: '/designer',
      icon: Palette,
    },
    {
      label: 'AI Content Suite',
      href: '/content',
      icon: Sparkles,
    },
    {
      label: 'Usage statistics',
      href: '/stats',
      icon: BarChart3,
    },
    {
      label: 'Help & Support',
      href: '/support',
      icon: HelpCircle,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const displayName = user?.name || 'Alex Hunter';
  const displayRole = user?.role || 'Agency Founder';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SW';

  return (
    <aside className="w-64 min-h-screen bg-[#070b14] border-r border-[#162238] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Radar className="w-5 h-5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="font-semibold text-base tracking-tight text-white flex items-center gap-1">
              <span>Scout</span>
              <span className="text-cyan-400 font-black">Web</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
              <span>Private Workspace · Free</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0f283d] text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c1527]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Free Plan, User & Sign Out */}
      <div className="p-3 border-t border-[#162238] space-y-2">
        {/* Free Plan / Usage Card (Matching Screenshots 2, 3, 4, 5) */}
        <div className="p-3 rounded-xl bg-[#0c1527] border border-[#18263f] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white">Free plan</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              Unlimited
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Searches</span>
                <span className="font-mono text-cyan-400">Unlimited</span>
              </div>
              <div className="w-full h-1 bg-[#14213d] rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-full rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Audits</span>
                <span className="font-mono text-cyan-400">Unlimited</span>
              </div>
              <div className="w-full h-1 bg-[#14213d] rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-full rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Outreach</span>
                <span className="font-mono text-cyan-400">Unlimited</span>
              </div>
              <div className="w-full h-1 bg-[#14213d] rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 w-full rounded-full" />
              </div>
            </div>
          </div>

          <Link
            href="/stats"
            className="block text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold pt-0.5 hover:underline"
          >
            View usage &amp; plan
          </Link>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#0c1527] border border-[#18263f]">
          <div className="w-8 h-8 rounded-full bg-cyan-900/60 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{displayName}</p>
            <p className="text-[11px] text-cyan-400 truncate">{user?.email || 'Unlimited Free Access'}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={async () => {
            if (onSignOut) onSignOut();
            await logout();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
