"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useModeStore } from "@/lib/stores/mode-store";
import { ModeToggle } from "@/components/layout/mode-toggle";
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
  BarChart3,
  Rocket,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  StickyNote,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Command Center", href: "/command-center", icon: LayoutDashboard },
  { label: "Sticky Notes", href: "/sticky-notes", icon: StickyNote },
  { label: "DSA Patterns", href: "/patterns", icon: GitBranch },
  { label: "Learning Roadmaps", href: "/roadmaps", icon: Map },
  { label: "Mastery Tracking", href: "/mastery", icon: Target },
  { label: "Revision Engine", href: "/revision", icon: RefreshCw },
  { label: "Project Hub", href: "/projects", icon: FolderKanban },
  { label: "Interview Hub", href: "/interview", icon: Briefcase },
  { label: "Books & Research", href: "/books", icon: BookOpen },
  { label: "Daily Execution", href: "/daily", icon: CalendarCheck },
  { label: "Analytics Center", href: "/analytics", icon: BarChart3 },
  { label: "Career Mission Control", href: "/career", icon: Rocket },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useModeStore();

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {sidebarCollapsed ? (
          <span className="text-sm font-bold tracking-wider text-foreground mx-auto">
            N
          </span>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link href="/command-center" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">
                  N
                </span>
              </div>
              <span className="text-sm font-semibold tracking-wide text-foreground">
                ProdigyOS
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-4 rounded-full border bg-background p-0.5 text-muted-foreground hover:text-foreground shadow-sm"
          >
            <PanelLeft className="h-3 w-3" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                sidebarCollapsed && "justify-center px-2",
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {sidebarCollapsed ? (
          <div className="flex justify-center">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ModeToggle />
        )}
      </div>
    </aside>
  );
}
