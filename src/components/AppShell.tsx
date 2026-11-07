'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/components/AuthProvider';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loading, user } = useAuth();

  const isPublicPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/site/');

  if (isPublicPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 flex antialiased w-full">
      <Sidebar />
      <main className="flex-1 min-h-screen flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

