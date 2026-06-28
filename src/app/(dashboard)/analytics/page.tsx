'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Clock, Flame, BookOpen, Target, TrendingUp,
  AlertTriangle, CheckCircle, Brain, Activity,
  Loader2, Database, Wifi, WifiOff, ShieldAlert,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/providers/ProfileProvider';

// ─── Roadmap Definitions ──────────────────────────────────────────────────────
const ROADMAPS = [
  { label: 'OS', storageKey: 'foundation-os-completed', total: 50, category: 'Foundation', color: '#06b6d4' },
  { label: 'DBMS', storageKey: 'foundation-dbms-completed', total: 50, category: 'Foundation', color: '#0ea5e9' },
  { label: 'CN', storageKey: 'foundation-cn-completed', total: 50, category: 'Foundation', color: '#22d3ee' },
  { label: 'SD Concepts', storageKey: 'system-design-concepts-completed', total: 50, category: 'System Design', color: '#8b5cf6' },
  { label: 'SD Problems', storageKey: 'system-design-problems-completed', total: 50, category: 'System Design', color: '#a855f7' },
  { label: 'Java', storageKey: 'backend-java-completed', total: 50, category: 'Backend', color: '#f97316' },
  { label: 'Spring Boot', storageKey: 'backend-springboot-completed', total: 50, category: 'Backend', color: '#22c55e' },
  { label: 'React', storageKey: 'frontend-react-completed', total: 50, category: 'Frontend', color: '#38bdf8' },
  { label: 'Next.js', storageKey: 'frontend-nextjs-completed', total: 50, category: 'Frontend', color: '#0ea5e9' },
  { label: 'MFE', storageKey: 'frontend-mfe-completed', total: 50, category: 'Frontend', color: '#6366f1' },
  { label: 'DevOps', storageKey: 'devops-cloud-devops-completed', total: 50, category: 'DevOps', color: '#3b82f6' },
  { label: 'Docker', storageKey: 'devops-cloud-docker-completed', total: 50, category: 'DevOps', color: '#60a5fa' },
  { label: 'K8s', storageKey: 'devops-cloud-kubernetes-completed', total: 50, category: 'DevOps', color: '#818cf8' },
  { label: 'AWS', storageKey: 'devops-cloud-aws-completed', total: 50, category: 'DevOps', color: '#f59e0b' },
  { label: 'SQL Theory', storageKey: 'databases-sql-completed', total: 50, category: 'Databases', color: '#10b981' },
  { label: 'NoSQL', storageKey: 'databases-nosql-completed', total: 50, category: 'Databases', color: '#34d399' },
  { label: 'SQL LeetCode', storageKey: 'completed-databases-leetcode', total: 50, category: 'Databases', color: '#059669' },
  { label: 'Aptitude', storageKey: 'aptitude-completed', total: 50, category: 'Aptitude', color: '#14b8a6' },
] as const;

const TOTAL_TOPICS = ROADMAPS.reduce((s, r) => s + r.total, 0);

const CATEGORY_COLORS: Record<string, string> = {
  Foundation: '#0ea5e9',
  'System Design': '#8b5cf6',
  Backend: '#f97316',
  Frontend: '#38bdf8',
  DevOps: '#3b82f6',
  Databases: '#10b981',
  Aptitude: '#14b8a6',
};

// ─── Bar Chart ───────────────────────────────────────────────────────────────
function BarChart({ data, height = 160 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-full rounded-t transition-all duration-700"
            style={{
              height: `${(d.value / max) * 100}%`,
              backgroundColor: d.color || '#6366f1',
              minHeight: d.value > 0 ? '4px' : '2px',
              opacity: d.value > 0 ? 1 : 0.2,
            }}
          />
          <span className="text-[9px] text-zinc-500 truncate w-full text-center leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({ value, size = 120, strokeWidth = 9, color = '#6366f1' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold leading-none">{value}%</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">done</p>
      </div>
    </div>
  );
}

// ─── Streak Computation ───────────────────────────────────────────────────────
function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const daySet = new Set(dates.map((d) => d.split('T')[0]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const yesterStr = yest.toISOString().split('T')[0];
  if (!daySet.has(todayStr) && !daySet.has(yesterStr)) return 0;
  let streak = 0;
  const cur = new Date(daySet.has(todayStr) ? today : yest);
  while (daySet.has(cur.toISOString().split('T')[0])) { streak++; cur.setDate(cur.getDate() - 1); }
  return streak;
}

// ─── Grouped Accordion Table ──────────────────────────────────────────────────
type RoadmapStat = {
  label: string;
  storageKey: string;
  total: number;
  category: string;
  color: string;
  completed: number;
  pct: number;
};

function GroupedRoadmapTable({
  roadmapStats,
  totalCompleted,
  overallPct,
}: {
  roadmapStats: RoadmapStat[];
  totalCompleted: number;
  overallPct: number;
}) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());

  const toggle = useCallback((cat: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }, []);

  // Group by category preserving order
  const grouped = useMemo(() => {
    const map = new Map<string, RoadmapStat[]>();
    roadmapStats.forEach((r) => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return Array.from(map.entries()).map(([cat, items]) => {
      const done = items.reduce((s, r) => s + r.completed, 0);
      const tot = items.reduce((s, r) => s + r.total, 0);
      return { cat, items, done, tot, pct: Math.round((done / tot) * 100) };
    });
  }, [roadmapStats]);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="grid grid-cols-[1fr_80px_80px_160px_52px] gap-2 px-5 py-2 border-b border-zinc-800 text-[11px] font-medium text-zinc-500">
          <span>Category / Roadmap</span>
          <span className="text-right">Done</span>
          <span className="text-right">Total</span>
          <span>Progress</span>
          <span className="text-right">%</span>
        </div>

        {grouped.map(({ cat, items, done, tot, pct }, gi) => {
          const open = openCats.has(cat);
          const catColor = CATEGORY_COLORS[cat] || '#6366f1';
          return (
            <div key={cat} className={cn(gi < grouped.length - 1 && 'border-b border-zinc-800/70')}>
              <button
                onClick={() => toggle(cat)}
                className="w-full grid grid-cols-[1fr_80px_80px_160px_52px] gap-2 items-center px-5 py-3 hover:bg-zinc-800/40 transition-colors text-left"
              >
                <span className="flex items-center gap-2 font-medium text-zinc-200">
                  {open ? (
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${catColor}18`, color: catColor }}
                  >
                    {cat}
                  </span>
                </span>
                <span className="text-right text-sm font-semibold text-zinc-200 tabular-nums">{done}</span>
                <span className="text-right text-sm text-zinc-500 tabular-nums">{tot}</span>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: catColor }}
                  />
                </div>
                <span
                  className="text-right text-sm font-semibold tabular-nums"
                  style={{ color: pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#52525b' }}
                >
                  {pct}%
                </span>
              </button>

              {open && (
                <div className="border-t border-zinc-800/50 bg-zinc-950/30">
                  {items.map((r, ri) => (
                    <div
                      key={r.label}
                      className={cn(
                        'grid grid-cols-[1fr_80px_80px_160px_52px] gap-2 items-center pl-10 pr-5 py-2 text-sm',
                        ri < items.length - 1 && 'border-b border-zinc-800/40',
                        'hover:bg-zinc-800/20 transition-colors'
                      )}
                    >
                      <span className="flex items-center gap-2 text-zinc-400">
                        <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                        {r.label}
                      </span>
                      <span className="text-right text-zinc-300 tabular-nums">{r.completed}</span>
                      <span className="text-right text-zinc-600 tabular-nums">{r.total}</span>
                      <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                        />
                      </div>
                      <span
                        className="text-right text-xs font-medium tabular-nums"
                        style={{ color: r.pct >= 80 ? '#10b981' : r.pct >= 40 ? '#f59e0b' : '#52525b' }}
                      >
                        {r.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="grid grid-cols-[1fr_80px_80px_160px_52px] gap-2 items-center px-5 py-3 border-t border-zinc-700 bg-zinc-800/30">
          <span className="font-semibold text-zinc-200 text-sm">Total</span>
          <span className="text-right font-bold text-zinc-100 tabular-nums text-sm">{totalCompleted}</span>
          <span className="text-right text-zinc-400 tabular-nums text-sm">{TOTAL_TOPICS}</span>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all duration-700" style={{ width: `${overallPct}%` }} />
          </div>
          <span className="text-right font-bold text-indigo-400 tabular-nums text-sm">{overallPct}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { userEmail, customDbUrl } = useProfile();
  const [completionMap, setCompletionMap] = useState<Record<string, Set<string>>>({});
  const [completionDates, setCompletionDates] = useState<string[]>([]);
  const [loginStreak, setLoginStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    async function fetchLoginStreak() {
      try {
        const res = await fetch('/api/auth/login-streak');
        if (res.ok) {
          const data = await res.json();
          setLoginStreak(data.streak || 0);
        }
      } catch (e) {
        console.error('Failed to fetch login streak:', e);
      }
    }
    fetchLoginStreak();

    const localMap: Record<string, Set<string>> = {};
    const localDates: string[] = [];

    ROADMAPS.forEach((rm) => {
      const raw = localStorage.getItem(rm.storageKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Record<string, string>;
          localMap[rm.storageKey] = new Set(Object.keys(parsed));
          Object.values(parsed).forEach((d) => { if (d) localDates.push(d); });
        } catch { }
      }
      if (!localMap[rm.storageKey]) localMap[rm.storageKey] = new Set();
    });

    setCompletionMap({ ...localMap });
    setCompletionDates([...localDates]);

    async function loadFromDB() {
      console.log('[Analytics] Attempting DB connection...', { userEmail, hasCustomUrl: !!customDbUrl });
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-email': userEmail };
        if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;

        const res = await fetch(`/api/db/completions?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const json = await res.json();

        console.log('[Analytics] DB response:', {
          status: res.status,
          dbConnected: json.dbConnected,
          recordCount: Array.isArray(json.data) ? json.data.length : 'N/A',
          error: json.error || null,
        });

        if (json.dbConnected && Array.isArray(json.data)) {
          setDbConnected(true);
          console.log('[Analytics] ✅ Connected to MongoDB. Loaded', json.data.length, 'completion records.');
          const merged: Record<string, Set<string>> = {};
          ROADMAPS.forEach((rm) => { merged[rm.storageKey] = new Set(localMap[rm.storageKey] || []); });
          const dbDates: string[] = [];
          json.data.forEach((item: { storagePrefix: string; itemId: string; completedAt: string }) => {
            const { storagePrefix, itemId, completedAt } = item;
            if (!merged[storagePrefix]) merged[storagePrefix] = new Set();
            if (itemId) merged[storagePrefix].add(itemId);
            if (completedAt) dbDates.push(completedAt);
          });
          setCompletionMap({ ...merged });
          setCompletionDates([...localDates, ...dbDates]);
        } else {
          console.warn('[Analytics] ⚠️ DB not connected. Falling back to localStorage only.', json.error || '');
        }
      } catch (e) {
        console.error('[Analytics] ❌ DB load failed (network or parse error):', e);
      } finally {
        setLoading(false);
      }
    }
    loadFromDB();
  }, [userEmail, customDbUrl]);

  const roadmapStats = useMemo(() =>
    ROADMAPS.map((rm) => {
      const completed = completionMap[rm.storageKey]?.size ?? 0;
      return { ...rm, completed, pct: Math.round((completed / rm.total) * 100) };
    }), [completionMap]);

  const totalCompleted = useMemo(() => roadmapStats.reduce((s, r) => s + r.completed, 0), [roadmapStats]);
  const overallPct = Math.round((totalCompleted / TOTAL_TOPICS) * 100);
  const streak = useMemo(() => computeStreak(completionDates), [completionDates]);
  const activeDays = useMemo(() => new Set(completionDates.map((d) => d.split('T')[0])).size, [completionDates]);

  const categoryStats = useMemo(() => {
    const cats: Record<string, { completed: number; total: number }> = {};
    roadmapStats.forEach((r) => {
      if (!cats[r.category]) cats[r.category] = { completed: 0, total: 0 };
      cats[r.category].completed += r.completed;
      cats[r.category].total += r.total;
    });
    return Object.entries(cats).map(([cat, val]) => ({
      label: cat, completed: val.completed, total: val.total,
      pct: Math.round((val.completed / val.total) * 100),
      color: CATEGORY_COLORS[cat] || '#6366f1',
    })).sort((a, b) => b.pct - a.pct);
  }, [roadmapStats]);

  const weeklyActivity = useMemo(() => {
    const now = new Date(); now.setHours(23, 59, 59, 999);
    return Array.from({ length: 8 }, (_, i) => {
      const weekEnd = new Date(now); weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
      const count = completionDates.filter((d) => {
        const t = new Date(d).getTime();
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
      }).length;
      return { label: `W${8 - i}`, value: count, color: '#6366f1' };
    }).reverse();
  }, [completionDates]);

  const roadmapBarData = useMemo(() => roadmapStats.map((r) => ({ label: r.label, value: r.completed, color: r.color })), [roadmapStats]);
  const weakAreas = useMemo(() => [...roadmapStats].sort((a, b) => a.pct - b.pct).slice(0, 5), [roadmapStats]);
  const strongAreas = useMemo(() => [...roadmapStats].filter((r) => r.completed > 0).sort((a, b) => b.pct - a.pct).slice(0, 5), [roadmapStats]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Analytics Center</h1>
              <p className="text-sm text-muted-foreground mt-1">Live data from your roadmaps &amp; database</p>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Topics Done', value: loading ? '…' : `${totalCompleted} / ${TOTAL_TOPICS}`, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Current Streak', value: loading ? '…' : `${streak} day${streak !== 1 ? 's' : ''}`, icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Login Streak', value: loading ? '…' : `${loginStreak} day${loginStreak !== 1 ? 's' : ''}`, icon: ShieldAlert, color: 'text-orange-455', bg: 'bg-orange-500/10' },
              { label: 'Active Days', value: loading ? '…' : `${activeDays}`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Overall Progress', value: loading ? '…' : `${overallPct}%`, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card/50 border-zinc-800">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full shrink-0', stat.bg)}>
                      <Icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl font-bold truncate">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Row 2: Overall / Weekly / Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex flex-col items-center gap-4">
                <CircularProgress value={loading ? 0 : overallPct} size={140} strokeWidth={10} color="#6366f1" />
                <div className="w-full space-y-1.5">
                  {[['Completed', totalCompleted], ['Remaining', TOTAL_TOPICS - totalCompleted], ['Total', TOTAL_TOPICS]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between text-xs text-zinc-400">
                      <span>{l}</span><span className="font-medium text-zinc-200">{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {loading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>
                ) : (
                  <BarChart data={weeklyActivity} height={160} />
                )}
                <p className="text-[10px] text-zinc-500 mt-3 text-center">Topics completed per week (last 8 weeks)</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm font-medium">Category Progress</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{cat.label}</span>
                      <span className="text-zinc-500">{cat.completed}/{cat.total} <span className="ml-1 font-medium" style={{ color: cat.color }}>{cat.pct}%</span></span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Per-Roadmap Bar Chart */}
          <Card className="bg-card/50 border-zinc-800">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-400" />
                <CardTitle className="text-sm font-medium">Per-Roadmap Completions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {loading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>
              ) : (
                <BarChart data={roadmapBarData} height={180} />
              )}
              <p className="text-[10px] text-zinc-500 mt-3 text-center">Completions per sub-roadmap (50 each)</p>
            </CardContent>
          </Card>

          {/* Weak / Strong / Legend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {weakAreas.map((area) => (
                  <div key={area.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{area.label}</span>
                      <span className="text-zinc-500">{area.completed}/{area.total}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${area.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm font-medium">Strongest Areas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {strongAreas.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">No completions yet — start a roadmap!</p>
                ) : strongAreas.map((area) => (
                  <div key={area.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{area.label}</span>
                      <span className="text-zinc-500">{area.completed}/{area.total}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${area.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-medium">Completion % at a Glance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {roadmapStats.map((r) => (
                    <div key={r.label} className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="text-[11px] text-zinc-400 truncate flex-1">{r.label}</span>
                      <span className="text-[11px] font-semibold shrink-0"
                        style={{ color: r.pct >= 80 ? '#10b981' : r.pct >= 40 ? '#f59e0b' : '#71717a' }}>
                        {r.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grouped Accordion Table */}
          <Card className="bg-card/50 border-zinc-800">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-zinc-400" />
                <CardTitle className="text-sm font-medium">All Roadmaps — Detailed View</CardTitle>
                <span className="ml-auto text-[11px] text-zinc-500">Click a category to expand</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <GroupedRoadmapTable
                roadmapStats={roadmapStats}
                totalCompleted={totalCompleted}
                overallPct={overallPct}
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
