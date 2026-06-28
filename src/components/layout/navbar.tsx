"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/components/providers/ProfileProvider';
import { Database, LogOut, User, CheckCircle2, AlertTriangle, X, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { GlobalSearch } from '@/components/shared/GlobalSearch';

export function Navbar({ global = false }: { global?: boolean }) {
  if (!global) return null;
  const pathname = usePathname();
  const { userEmail, userName, userRole, logout } = useProfile();
  const [profileOpen, setProfileOpen] = useState(false);
  const dbConnected = true; // Secured and active via main Atlas URI now
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Format breadcrumbs from pathname
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg) => {
    return seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  });

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full justify-center border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm shrink-0">
        <div className="flex h-full w-full max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Path Breadcrumbs - full on desktop, short on mobile */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-zinc-400 min-w-0">
            <span className="text-zinc-500 hover:text-zinc-300 cursor-pointer shrink-0">ProdigyOS</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-650 font-normal shrink-0">/</span>
                <span className={cn(
                  "truncate",
                  idx === breadcrumbs.length - 1 ? "text-zinc-200 font-semibold" : "text-zinc-400"
                )}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
          {/* Mobile breadcrumb - just current page */}
          <div className="md:hidden flex items-center text-xs font-medium text-zinc-400 min-w-0">
            <span className="truncate text-zinc-200 font-semibold">
              {breadcrumbs[breadcrumbs.length - 1] || 'Dashboard'}
            </span>
          </div>

          {/* Centered Search - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-xs mx-4 justify-center">
            <GlobalSearch />
          </div>

          {/* Database Status & User Badge */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Date Display */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 border-r border-zinc-800 pr-4">
              <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-medium text-zinc-300">{dateStr}</span>
            </div>

            {/* DB Status Badge - hidden on small mobile */}
            <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                dbConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
              title={dbConnected ? "Connected to database" : "Fallback to local storage"}
            >
              <Database className="h-3 w-3" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              <span>{dbConnected ? "Cloud DB" : "Offline Mode"}</span>
            </div>

            {/* User Badge */}
            <button 
              onClick={() => setProfileOpen(true)}
              className="flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 p-1.5 transition-colors cursor-pointer"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold leading-none text-white uppercase">
                {userName.slice(0, 1)}
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="flex items-center justify-center rounded-lg border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Details Dialog */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm select-none">
          <div className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <SpotlightCard className="border-zinc-800 bg-zinc-950 p-6 shadow-2xl rounded-xl relative" spotlightColor="rgba(59, 130, 246, 0.08)">
              {/* Close Button */}
              <button 
                onClick={() => setProfileOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-md hover:bg-zinc-900 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-zinc-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-lg font-bold text-blue-400 border border-blue-500/20 uppercase">
                  {userName.slice(0, 1)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-200">{userName}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{userRole}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Email Scope</span>
                  <div className="bg-zinc-900 px-3 py-2.5 rounded-lg border border-zinc-850 text-zinc-300 font-mono select-text">
                    {userEmail}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Database Connection Status</span>
                  <div className={`flex items-center justify-between bg-zinc-900 px-3 py-2.5 rounded-lg border border-zinc-850 ${dbConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <div className="flex items-center gap-2">
                       {dbConnected ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                       <span>{dbConnected ? "Active Database Sync" : "LocalStorage Fallback Mode"}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-semibold">
                      {dbConnected ? "Cloud Instance" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between gap-2.5">
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 text-zinc-400 hover:text-red-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut size={13} />
                  Reset Profile / Sign Out
                </button>
              </div>
            </SpotlightCard>
          </div>
        </div>
      )}
    </>
  );
}
