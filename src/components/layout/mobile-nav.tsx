'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, GitBranch, Map, Target, RefreshCw, FolderKanban, Briefcase, BookOpen, CalendarCheck, BarChart3, StickyNote, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Command Center', href: '/command-center', icon: LayoutDashboard },
  { label: 'DSA Patterns', href: '/patterns', icon: GitBranch },
  { label: 'Learning Roadmaps', href: '/roadmaps', icon: Map },
  { label: 'Mastery Tracking', href: '/mastery', icon: Target },
  { label: 'Revision Engine', href: '/revision', icon: RefreshCw },
  { label: 'Project Hub', href: '/projects', icon: FolderKanban },
  { label: 'Interview Hub', href: '/interview', icon: Briefcase },
  { label: 'Books & Research', href: '/books', icon: BookOpen },
  { label: 'Daily Execution', href: '/daily', icon: CalendarCheck },
  { label: 'Analytics Center', href: '/analytics', icon: BarChart3 },
  { label: 'Sticky Notes', href: '/sticky-notes', icon: StickyNote },
  { label: 'Career Mission Control', href: '/career', icon: Rocket },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500 active:bg-blue-700 active:scale-95 transition-all md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          <div className={cn(
            "absolute left-0 top-0 bottom-0 bg-zinc-950 border-r border-zinc-800 shadow-2xl flex flex-col",
            "w-72 max-w-[85vw] animate-in slide-in-from-left duration-300"
          )}>
            <div className="flex items-center justify-between h-14 border-b border-zinc-800 px-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100">
                  <span className="text-xs font-bold text-zinc-900">N</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-zinc-100">ProdigyOS</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors active:scale-95">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors active:scale-[0.98]',
                      isActive ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
