"use client";

import * as React from "react";
import { useState } from "react";
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
  PanelLeftClose,
  PanelLeft,
  StickyNote,
  ListChecks,
  Calendar,
  FileText,
  Timer,
  ChevronDown,
  Code2,
  NotebookPen,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Learn",
    items: [
      { label: "Patterns Library", href: "/patterns", icon: GitBranch },
      { label: "Roadmaps", href: "/roadmaps", icon: Map },
      { label: "Mastery Tracker", href: "/mastery", icon: Target },
      { label: "Focus Mode", href: "/focus", icon: Timer },
      { label: "Revision System", href: "/revision", icon: RefreshCw },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Interview Prep", href: "/interview", icon: Code2 },
      { label: "Job Applications", href: "/interviews", icon: Briefcase },
      { label: "Research Library", href: "/books", icon: BookOpen },
    ],
  },
  {
    label: "Plan",
    items: [
      { label: "Daily Planner", href: "/daily", icon: CalendarCheck },
      { label: "Weekly Overview", href: "/weekly", icon: Calendar },
      { label: "Activity Log", href: "/history", icon: CalendarDays },
      { label: "Task Manager", href: "/tasks", icon: ListChecks },
      { label: "Resume", href: "/plan/resume", icon: FileText },
      { label: "Study Plan", href: "/plan/study-plan", icon: NotebookPen },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Quick Notes", href: "/sticky-notes", icon: StickyNote },
    ],
  },
  {
    label: "Career",
    items: [
      { label: "Career Hub", href: "/career", icon: Rocket },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useModeStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  function renderLink(item: NavItem) {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;

    const link = (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 relative group",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
          sidebarCollapsed && "justify-center px-2",
        )}
      >
        {isActive && !sidebarCollapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-ring" />
        )}
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
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-[width] duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-60",
        )}
      >
        <div className={cn(
          "flex h-14 items-center border-b overflow-hidden",
          sidebarCollapsed ? "justify-center px-2" : "px-4",
        )}>
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
          {renderLink({ label: "Dashboard", href: "/command-center", icon: LayoutDashboard })}

          {!sidebarCollapsed && <div className="my-2 border-t border-border" />}

          {navGroups.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.label];
            const anyActive = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + "/")
            );

            return (
              <div key={group.label} className="space-y-0.5">
                {sidebarCollapsed ? (
                  <div className="h-2" />
                ) : (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className={cn(
                      "flex w-full items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors rounded-md",
                      anyActive
                        ? "text-ring"
                        : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    <span className={cn(
                      "transition-transform duration-200",
                      isGroupCollapsed ? "-rotate-90" : "rotate-0"
                    )}>
                      <ChevronDown className="h-3 w-3" />
                    </span>
                    {group.label}
                  </button>
                )}
                {!isGroupCollapsed && group.items.map(renderLink)}
              </div>
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
