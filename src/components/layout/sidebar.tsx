"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useModeStore } from "@/lib/stores/mode-store";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  GitBranch,
  Map,
  Target,
  RefreshCw,
  FolderKanban,
  Briefcase,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  BarChart3,
  Rocket,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  StickyNote,
  ListChecks,
  Calendar,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Command Center", href: "/command-center", icon: LayoutDashboard },
 
  { label: "DSA Patterns", href: "/patterns", icon: GitBranch },
  { label: "Learning Roadmaps", href: "/roadmaps", icon: Map },
  { label: "Mastery Tracking", href: "/mastery", icon: Target },
  { label: "Revision Engine", href: "/revision", icon: RefreshCw },
  { label: "Project Hub", href: "/projects", icon: FolderKanban },
  { label: "Interview Hub", href: "/interview", icon: Briefcase },
  { label: "Books & Research", href: "/books", icon: BookOpen },
  { label: "Daily Execution", href: "/daily", icon: CalendarCheck },
  { label: "Weekly Schedule", href: "/weekly", icon: Calendar },
  { label: "Daily History", href: "/history", icon: CalendarDays },
  { label: "Task Tracker", href: "/tasks", icon: ListChecks },
  { label: "Analytics Center", href: "/analytics", icon: BarChart3 },
   { label: "Sticky Notes", href: "/sticky-notes", icon: StickyNote },
  { label: "Career Mission Control", href: "/career", icon: Rocket },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useModeStore();

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-[width] duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-14 items-center border-b px-4 overflow-hidden">
          <Link href="/command-center" className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-primary-foreground">N</span>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tracking-wide text-foreground transition-opacity duration-200",
                sidebarCollapsed && "opacity-0 w-0 overflow-hidden",
              )}
            >
              ProdigyOS
            </span>
          </Link>
          <div className="ml-auto shrink-0">
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-4 rounded-full border bg-background p-0.5 text-muted-foreground hover:text-foreground shadow-sm"
                  >
                    <PanelLeft className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={toggleSidebar}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  sidebarCollapsed && "justify-center px-2",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    "text-nowrap transition-opacity duration-200",
                    sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );

            return sidebarCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>

        <div className="border-t p-4">
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <ModeToggle />
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
