'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LazyAppear } from "@/components/shared/LazyAppear";
import { useProfile } from "@/components/providers/ProfileProvider";
import {
  Zap,
  TrendingUp,
  Calendar,
  BrainCircuit,
  ArrowRight,
  Circle,
  CheckCircle2,
  Loader2,
  Plus,
  Pencil,
} from "lucide-react";
import { cn, formatRelativeTime } from '@/lib/utils';

interface StatItem {
  icon: any;
  value: string;
  label: string;
  sub: string;
}

interface FocusItem {
  label: string;
  value: string;
  badge: string;
}

interface ProjectItem {
  name: string;
  status: string;
  progress: string;
}

interface ActivityItem {
  text: string;
  createdAt: string;
}

interface DashboardData {
  stats: StatItem[];
  focusItems: FocusItem[];
  projects: ProjectItem[];
  activities: ActivityItem[];
}

function cacheKey(email?: string): string {
  return email ? `samundar-command-center-${email}` : 'samundar-command-center';
}

const statusStyles: Record<string, { label: string; className: string; bar: string }> = {
  COMPLETED: { label: 'Completed', className: 'bg-emerald-950 text-emerald-300 border-emerald-800', bar: 'bg-emerald-500' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-950 text-blue-300 border-blue-800', bar: 'bg-blue-500' },
  MAINTAINING: { label: 'Maintaining', className: 'bg-amber-950 text-amber-300 border-amber-800', bar: 'bg-amber-500' },
  PLANNING: { label: 'Planning', className: 'bg-purple-950 text-purple-300 border-purple-800', bar: 'bg-purple-500' },
  ON_HOLD: { label: 'On Hold', className: 'bg-zinc-800 text-zinc-400 border-zinc-700', bar: 'bg-zinc-500' },
};

const iconMap: Record<string, any> = {
  'Current Streak': Zap,
  'Weekly Progress': TrendingUp,
  'Monthly Progress': Calendar,
  'Interview Readiness': BrainCircuit,
};

function ProjectProgressBar({ progress }: { progress: string }) {
  const pct = parseInt(progress);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 30 ? 'bg-amber-500' : 'bg-zinc-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-zinc-500 w-8 text-right tabular-nums">{progress}</span>
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-4 w-36 rounded bg-zinc-800" />
        <div className="h-3 w-20 rounded bg-zinc-800/50" />
      </div>
      <div className="h-4 w-16 rounded bg-zinc-800" />
    </div>
  );
}

export default function CommandCenterPage() {
  const { userName, userEmail, customDbUrl } = useProfile();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLabel, setDialogLabel] = useState('');
  const [dialogValue, setDialogValue] = useState('');
  const [dialogBadge, setDialogBadge] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetFlag, setResetFlag] = useState(0);
  const fetched = useRef<string | null>(null);

  const openFocusDialog = useCallback((label: string, value: string, badge: string) => {
    setDialogLabel(label);
    setDialogValue(value);
    setDialogBadge(badge);
    setDialogOpen(true);
  }, []);

  const saveFocusEdit = useCallback(async () => {
    if (!userEmail || !dialogLabel) {
      setDialogOpen(false);
      return;
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;

    const body: Record<string, string> = { email: userEmail };
    if (dialogLabel === 'Active Pillar') {
      body.activePillar = dialogValue;
      body.activeCategory = dialogBadge;
    } else if (dialogLabel === 'Next Learning Unit') {
      body.nextLearningUnit = dialogValue;
      body.nextLearningDuration = dialogBadge;
    }

    try {
      const res = await fetch('/api/db/profile', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            focusItems: prev.focusItems.map((item) =>
              item.label === dialogLabel
                ? { ...item, value: dialogValue, badge: dialogBadge }
                : item
            ),
          };
        });
      }
    } catch {}
    setDialogOpen(false);
  }, [userEmail, customDbUrl, dialogLabel, dialogValue, dialogBadge]);

  const loadData = useCallback(async () => {
    if (!mounted) return;
    const email = userEmail || '';
    if (!email) return;
    if (fetched.current === email) return;
    fetched.current = email;

    const key = cacheKey(userEmail);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userEmail) headers['x-user-email'] = userEmail;
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;

    try {
      const res = await fetch(`/api/db/command-center?userEmail=${encodeURIComponent(userEmail || '')}`, { headers });
      const json = await res.json();
      if (json.dbConnected) {
        const payload: DashboardData = {
          stats: json.stats.map((s: any) => ({ ...s, icon: iconMap[s.label as keyof typeof iconMap] || Zap })),
          focusItems: json.focusItems,
          projects: json.projects,
          activities: json.activities,
        };
        setData(payload);
        localStorage.setItem(key, JSON.stringify(payload));
        setLoading(false);
        return;
      }
    } catch {
      setError(true);
    }

    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const activities = parsed.activities?.map((a: any) =>
          typeof a === 'string' ? { text: a, createdAt: new Date().toISOString() } : a
        ) ?? [];
        setData({ ...parsed, activities });
        setLoading(false);
        return;
      } catch {}
    }

    setData({
      stats: [
        { icon: Zap, value: "0", label: "Current Streak", sub: "days" },
        { icon: TrendingUp, value: "0%", label: "Weekly Progress", sub: "no data" },
        { icon: Calendar, value: "0%", label: "Monthly Progress", sub: "no data" },
        { icon: BrainCircuit, value: "0%", label: "Interview Readiness", sub: "Just started" },
      ],
      focusItems: [
        { label: "Active Pillar", value: "Data Structures & Algorithms", badge: "Trees" },
        { label: "Next Learning Unit", value: "AVL Tree Rotations", badge: "45 min" },
        { label: "Due Revisions", value: "No pending revisions", badge: "Up to date" },
      ],
      projects: [],
      activities: [{ text: 'Start your journey by completing some tasks!', createdAt: new Date().toISOString() }],
    });
    setLoading(false);
  }, [mounted, userEmail, customDbUrl]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { loadData(); }, [loadData, resetFlag]);

  // Clean up old global cache key (no longer used)
  useEffect(() => {
    localStorage.removeItem('samundar-command-center');
  }, []);

  const handleReset = useCallback(() => {
    localStorage.removeItem(cacheKey(userEmail));
    localStorage.removeItem('samundar-command-center');
    fetched.current = null;
    setData(null);
    setLoading(true);
    setResetDialogOpen(false);
    setResetFlag(f => f + 1);
  }, [userEmail]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col h-full bg-zinc-950 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading command center...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 space-y-6 md:space-y-8 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Welcome back, {userName}! Let&apos;s build something great today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <Badge variant="outline" className="bg-amber-950 text-amber-300 border-amber-800 text-[10px]">
                Offline — showing cached data
              </Badge>
            )}
            <button
              onClick={() => setResetDialogOpen(true)}
              className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 transition-colors px-3 py-1.5 rounded-md bg-red-950/30 hover:bg-red-950/50"
            >
              Reset Dashboard
            </button>
          </div>
        </div>

        <LazyAppear>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-zinc-800/80 bg-zinc-900/40">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-zinc-500">{stat.sub}</p>
                      </div>
                      <div className="rounded-lg bg-zinc-800/50 p-2.5">
                        <Icon className="h-5 w-5 text-zinc-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </LazyAppear>

        <LazyAppear delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-zinc-800/80 bg-zinc-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Today&apos;s Focus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.focusItems.map((item) => {
                  const editable = item.label !== 'Due Revisions';
                  return (
                    <div
                      key={item.label}
                      onClick={() => editable && openFocusDialog(item.label, item.value, item.badge)}
                      className={cn(
                        'flex items-center justify-between',
                        editable && 'cursor-pointer group'
                      )}
                    >
                      <div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          {item.label}
                          {editable && <Pencil className="h-2.5 w-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </p>
                        <p className={cn(
                          'text-sm font-medium mt-0.5',
                          editable && 'group-hover:text-zinc-100 transition-colors'
                        )}>{item.value}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-xs bg-zinc-800 text-zinc-300',
                          editable && 'group-hover:bg-zinc-700 transition-colors'
                        )}
                      >
                        {item.badge}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-zinc-800/80 bg-zinc-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Current Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.projects.length === 0 ? (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-sm text-zinc-600">No projects yet</p>
                    <button onClick={() => router.push('/projects')}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                      <Plus className="h-3 w-3" /> Add projects in Hub
                    </button>
                  </div>
                ) : (
                  data.projects.map((project) => {
                    const style = statusStyles[project.status] || statusStyles.PLANNING;
                    return (
                      <div
                        key={project.name}
                        onClick={() => router.push('/projects')}
                        className="rounded-lg border border-zinc-800/60 bg-zinc-900/20 p-3 space-y-2 hover:border-zinc-700 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', style.className)}>
                            {style.label}
                          </Badge>
                        </div>
                        <ProjectProgressBar progress={project.progress} />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </LazyAppear>

        <LazyAppear delay={0.2}>
          <Card className="border-zinc-800/80 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.activities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                    <p className="text-sm text-zinc-400 flex-1 truncate">{activity.text}</p>
                    <span className="text-[10px] text-zinc-600 shrink-0 tabular-nums">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LazyAppear>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Edit {dialogLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Value</label>
              <Input
                value={dialogValue}
                onChange={(e) => setDialogValue(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500">Badge</label>
              <Input
                value={dialogBadge}
                onChange={(e) => setDialogBadge(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={saveFocusEdit}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Reset Dashboard</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400 py-2">
            This will clear your cached dashboard data and reload with fresh stats from the server.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleReset}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
