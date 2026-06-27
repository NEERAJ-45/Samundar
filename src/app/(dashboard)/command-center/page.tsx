'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyAppear } from "@/components/shared/LazyAppear";
import { useProfile } from "@/components/providers/ProfileProvider";
import {
  Zap,
  TrendingUp,
  Calendar,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

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

interface DashboardData {
  stats: StatItem[];
  focusItems: FocusItem[];
  projects: ProjectItem[];
  activities: string[];
}

const CACHE_KEY = 'samundar-command-center';

const defaultData: DashboardData = {
  stats: [
    { icon: Zap, value: "12", label: "Current Streak", sub: "days" },
    { icon: TrendingUp, value: "78%", label: "Weekly Progress", sub: "4 of 5 goals" },
    { icon: Calendar, value: "62%", label: "Monthly Progress", sub: "18 of 29 hrs" },
    { icon: BrainCircuit, value: "73%", label: "Interview Readiness", sub: "Strong" },
  ],
  focusItems: [
    { label: "Active Pillar", value: "Data Structures & Algorithms", badge: "Trees" },
    { label: "Next Learning Unit", value: "AVL Tree Rotations", badge: "45 min" },
    { label: "Due Revisions", value: "3 concepts need review", badge: "Overdue" },
  ],
  projects: [
    { name: "ProdigyOS Dashboard", status: "IN_PROGRESS", progress: "65%" },
    { name: "CLI Task Manager", status: "MAINTAINING", progress: "90%" },
    { name: "API Gateway", status: "COMPLETED", progress: "100%" },
  ],
  activities: [
    'Completed "QuickSort Deep Dive" revision',
    "Added 3 notes to System Design",
    "Logged 2.5 hrs on Dynamic Programming",
    "Updated AVL Tree mastery to level 3",
  ],
};

export default function CommandCenterPage() {
  const { userName, userEmail, customDbUrl } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData>(defaultData);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const loadData = useCallback(async () => {
    if (!mounted || fetched.current) return;
    fetched.current = true;

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
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        setLoading(false);
        return;
      }
    } catch {}

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setData(parsed);
        setLoading(false);
        return;
      } catch {}
    }

    setLoading(false);
  }, [mounted, userEmail, customDbUrl]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const current = data;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 space-y-8 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Welcome back, {mounted ? userName : 'Neeraj'}! Let&apos;s build something great today.
          </p>
        </div>

        <LazyAppear>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {current.stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-zinc-800/80 bg-zinc-900/40">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-zinc-550">{stat.sub}</p>
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
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {current.focusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-zinc-500">{item.label}</p>
                      <p className="text-sm font-medium mt-0.5">{item.value}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                      {item.badge}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-zinc-800/80 bg-zinc-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Current Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {current.projects.map((project) => (
                  <div
                    key={project.name}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-zinc-550">
                        {project.status.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0 border-zinc-800 text-zinc-400">
                      {project.progress}
                    </Badge>
                  </div>
                ))}
                <button className="inline-flex items-center gap-1 text-xs text-zinc-550 hover:text-zinc-300 transition-colors mt-2 cursor-pointer">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          </div>
        </LazyAppear>

        <LazyAppear delay={0.2}>
          <Card className="border-zinc-800/80 bg-zinc-900/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {current.activities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                    <p className="text-sm text-zinc-400">{activity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LazyAppear>
      </div>
    </div>
  );
}

const iconMap = {
  'Current Streak': Zap,
  'Weekly Progress': TrendingUp,
  'Monthly Progress': Calendar,
  'Interview Readiness': BrainCircuit,
};
