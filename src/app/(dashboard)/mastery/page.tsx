'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';

const USER_NAME = 'NEERAJ';

export default function MasteryPage() {
  const [completions, setCompletions] = useState<Record<string, { date: string; key: string }>>({});
  const [filter, setFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

    const allCompletions: Record<string, { date: string; key: string }> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.endsWith('-completed') || key.startsWith('completed-'))) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw); // Record<string, string> (id -> dateStr)
            Object.entries(data).forEach(([itemId, val]) => {
              if (typeof val === 'string') {
                allCompletions[`${key}-${itemId}`] = { date: val, key };
              }
            });
          }
        } catch {
          // ignore
        }
      }
    }
    setCompletions(allCompletions);
  }, []);

  const isKeyInFilter = useCallback((key: string, currentFilter: string) => {
    if (currentFilter === 'ALL') return true;
    if (currentFilter === 'FOUNDATION') return key.startsWith('foundation-');
    if (currentFilter === 'SYSTEM_DESIGN') return key.startsWith('system-design-');
    if (currentFilter === 'BACKEND') return key.startsWith('backend-');
    if (currentFilter === 'FRONTEND') return key.startsWith('frontend-');
    if (currentFilter === 'DEVOPS') return key.startsWith('devops-cloud-');
    return false;
  }, []);

  const filteredCompletions = useMemo(() => {
    return Object.values(completions).filter((item) => isKeyInFilter(item.key, filter));
  }, [completions, filter, isKeyInFilter]);

  const activeDaysSet = useMemo(() => {
    return new Set(filteredCompletions.map((c) => c.date.split('T')[0]));
  }, [filteredCompletions]);

  const currentStreak = useMemo(() => {
    if (activeDaysSet.size === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(today);
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    let startFrom = today;
    if (activeDaysSet.has(todayStr)) {
      startFrom = today;
    } else if (activeDaysSet.has(yesterdayStr)) {
      startFrom = checkDate;
    } else {
      return 0;
    }

    const currentCheck = new Date(startFrom);
    while (true) {
      const dateStr = currentCheck.toISOString().split('T')[0];
      if (activeDaysSet.has(dateStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [activeDaysSet]);

  const calendarWeeks = useMemo(() => {
    const datesMap: Record<string, number> = {};
    filteredCompletions.forEach((c) => {
      const dateStr = c.date.split('T')[0];
      datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;
    });

    const weeksList: { date: string; count: number; dayOfWeek: number }[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(today.getDate() - 364);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // Align to Sunday

    const current = new Date(start);
    let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      currentWeek.push({
        date: dateStr,
        count: datesMap[dateStr] || 0,
        dayOfWeek: current.getDay(),
      });

      if (current.getDay() === 6) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const nextDate = new Date(current);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        currentWeek.push({
          date: nextDateStr,
          count: 0,
          dayOfWeek: nextDate.getDay(),
        });
        current.setDate(current.getDate() + 1);
      }
      weeksList.push(currentWeek);
    }
    return weeksList;
  }, [filteredCompletions]);

  const monthLabels = useMemo(() => {
    const labels: { text: string; weekIndex: number }[] = [];
    let prevMonth = -1;
    calendarWeeks.forEach((week, weekIdx) => {
      const firstDay = new Date(week[0].date);
      const m = firstDay.getMonth();
      if (m !== prevMonth) {
        labels.push({
          text: firstDay.toLocaleString('default', { month: 'short' }),
          weekIndex: weekIdx,
        });
        prevMonth = m;
      }
    });
    return labels;
  }, [calendarWeeks]);

  const roadmapDistribution = useMemo(() => {
    let foundation = 0;
    let systemDesign = 0;
    let backend = 0;
    let frontend = 0;
    let devops = 0;

    Object.values(completions).forEach((item) => {
      if (item.key.startsWith('foundation-')) foundation++;
      else if (item.key.startsWith('system-design-')) systemDesign++;
      else if (item.key.startsWith('backend-')) backend++;
      else if (item.key.startsWith('frontend-')) frontend++;
      else if (item.key.startsWith('devops-cloud-')) devops++;
    });

    return [
      { name: 'Computer Science Foundation', completed: foundation, total: 150, color: 'bg-cyan-500' },
      { name: 'System Design & Architecture', completed: systemDesign, total: 104, color: 'bg-violet-500' },
      { name: 'Backend Development', completed: backend, total: 100, color: 'bg-orange-500' },
      { name: 'Frontend Development', completed: frontend, total: 50, color: 'bg-sky-500' },
      { name: 'DevOps & Cloud Engineering', completed: devops, total: 200, color: 'bg-blue-500' },
    ];
  }, [completions]);

  const statsCards = useMemo(() => {
    return [
      { label: 'Total Completed', value: Object.keys(completions).length.toString(), sub: 'Across all tracked paths' },
      { label: 'Active Days', value: activeDaysSet.size.toString(), sub: 'Days with learning logged' },
      { label: 'Current Streak', value: `${currentStreak} days`, sub: 'Consecutive active days' },
      {
        label: 'Selected Roadmap',
        value: filteredCompletions.length.toString(),
        sub: `${filter === 'ALL' ? 'Total items completed' : 'Items in active filter'}`,
      },
    ];
  }, [completions, activeDaysSet, currentStreak, filteredCompletions, filter]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Mastery Tracking</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Visualizing consistency and progress across all learning paths.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-zinc-800/80 bg-zinc-900/40">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 mb-1.5">{stat.label}</p>
                <span className="text-2xl font-bold text-zinc-100">{stat.value}</span>
                <p className="text-[10px] text-zinc-500 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-zinc-800/80 bg-zinc-900/40 mb-8">
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-zinc-300">Mastery Calendar Heatmap</CardTitle>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer scheme-dark"
              >
                <option value="ALL">All Roadmaps</option>
                <option value="FOUNDATION">CS Foundation</option>
                <option value="SYSTEM_DESIGN">System Design & Architecture</option>
                <option value="BACKEND">Backend Development</option>
                <option value="FRONTEND">Frontend Development</option>
                <option value="DEVOPS">DevOps & Cloud Engineering</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {mounted && (
              <div className="flex gap-[3px] overflow-x-auto pb-2 select-none min-w-full">
                {/* Days of week labels */}
                <div className="flex flex-col justify-between text-[9px] text-zinc-600 pr-2 pb-[3px] select-none h-[95px] pt-5 shrink-0">
                  <span>Sun</span>
                  <span>Tue</span>
                  <span>Thu</span>
                  <span>Sat</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {/* Months labels */}
                  <div className="relative h-4 text-[10px] text-zinc-500 w-full select-none">
                    {monthLabels.map((lbl, idx) => {
                      const leftOffset = lbl.weekIndex * 14;
                      return (
                        <span
                          key={idx}
                          className="absolute whitespace-nowrap"
                          style={{ left: `${leftOffset}px` }}
                        >
                          {lbl.text}
                        </span>
                      );
                    })}
                  </div>

                  {/* Calendar columns */}
                  <div className="flex gap-[3px]">
                    {calendarWeeks.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[3px]">
                        {week.map((day) => {
                          const count = day.count;
                          return (
                            <div
                              key={day.date}
                              className={cn(
                                "h-[11px] w-[11px] rounded-[2px] transition-colors relative group/day cursor-pointer",
                                count === 0 && "bg-zinc-900 border border-zinc-800/40",
                                count === 1 && "bg-emerald-950 text-emerald-100",
                                count === 2 && "bg-emerald-800 text-emerald-100",
                                count === 3 && "bg-emerald-600 text-emerald-100",
                                count >= 4 && "bg-emerald-400 text-emerald-950"
                              )}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/day:flex flex-col items-center z-20 pointer-events-none">
                                <div className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-1 shadow-lg text-[10px] text-zinc-300 whitespace-nowrap">
                                  <span className="font-semibold text-zinc-100">{count} items</span> completed on {day.date}
                                </div>
                                <div className="h-1 w-1 rotate-45 bg-zinc-900 border-r border-b border-zinc-800 -mt-0.5" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300">Learning Roadmap Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-4">
              {roadmapDistribution.map((roadmap) => (
                <div key={roadmap.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-zinc-300">{roadmap.name}</span>
                    <span className="text-zinc-500 tabular-nums">
                      {roadmap.completed} / {roadmap.total} completed ({Math.round((roadmap.completed / roadmap.total) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', roadmap.color)}
                      style={{
                        width: `${(roadmap.completed / roadmap.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
