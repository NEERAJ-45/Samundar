'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, GitBranch, Map, Target, Timer, RefreshCw, FolderKanban, Briefcase, BookOpen, CalendarCheck, BarChart3, StickyNote, Rocket, CalendarDays, History, ListChecks, FileText, FileCode, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/command-center', icon: LayoutDashboard },
  { label: 'Patterns Library', href: '/patterns', icon: GitBranch },
  { label: 'Roadmaps', href: '/roadmaps', icon: Map },
  { label: 'Mastery Tracker', href: '/mastery', icon: Target },
  { label: 'Focus Mode', href: '/focus', icon: Timer },
  { label: 'Revision System', href: '/revision', icon: RefreshCw },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Interview Prep', href: '/interview', icon: Briefcase },
  { label: 'Job Applications', href: '/interviews', icon: FileText },
  { label: 'Research Library', href: '/books', icon: BookOpen },
  { label: 'Daily Planner', href: '/daily', icon: CalendarCheck },
  { label: 'Weekly Overview', href: '/weekly', icon: CalendarDays },
  { label: 'Activity Log', href: '/history', icon: History },
  { label: 'Task Manager', href: '/tasks', icon: ListChecks },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Quick Notes', href: '/sticky-notes', icon: StickyNote },
  { label: 'Career Hub', href: '/career', icon: Rocket },
  { label: 'Resume ', href: '/plan/resume', icon: FileCode },
  { label: 'Study Plan', href: '/plan/study-plan', icon: NotebookPen },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const btnRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef({ x: 20, y: 20 });
  const dragRef = useRef(false);

  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.setPointerCapture(e.pointerId);
    const rect = btn.getBoundingClientRect();
    dragRef.current = false;
    const startX = e.clientX - posRef.current.x;
    const startY = e.clientY - posRef.current.y;

    const onMove = (ev: PointerEvent) => {
      const dt = Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY);
      if (dt > 5) dragRef.current = true;
      const maxX = window.innerWidth - rect.width - 8;
      const maxY = window.innerHeight - rect.height - 8;
      posRef.current.x = Math.max(8, Math.min(ev.clientX - startX, maxX));
      posRef.current.y = Math.max(8, Math.min(ev.clientY - startY, maxY));
      btn.style.left = `${posRef.current.x}px`;
      btn.style.top = `${posRef.current.y}px`;
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setTimeout(() => { dragRef.current = false; }, 0);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => { if (!dragRef.current) setOpen(true); }}
        onPointerDown={handlePointerDown}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500 active:bg-blue-700 active:scale-95 transition-colors md:hidden touch-none select-none"
        aria-label="Open menu"
        style={{ touchAction: 'none' }}
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
            "absolute left-0 top-0 bottom-0 bg-background border-r border-border shadow-2xl flex flex-col",
            "w-72 max-w-[85vw] animate-in slide-in-from-left duration-300"
          )}>
            <div className="flex items-center justify-between h-14 border-b border-border px-4 shrink-0">
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
                      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
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
