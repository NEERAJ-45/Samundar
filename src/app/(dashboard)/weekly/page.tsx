'use client';

import * as React from 'react';
import { CalendarDays, Sun, Moon, Brain, BookOpen, Server, Network, Container, Code2, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Slot {
  period: string;
  icon: React.ElementType;
  content: string;
  color: string;
}

interface DaySchedule {
  day: string;
  slots: Slot[];
}

const schedule: DaySchedule[] = [
  {
    day: 'Mon',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      { period: 'M2', icon: BookOpen, content: 'Spring Boot', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      { period: 'Night', icon: Network, content: 'CS Fundamentals – OS', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    ],
  },
  {
    day: 'Tue',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      { period: 'M2', icon: BookOpen, content: 'Spring Boot', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      { period: 'Night', icon: Server, content: 'System Design', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
    ],
  },
  {
    day: 'Wed',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      { period: 'M2', icon: BookOpen, content: 'Spring Boot', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      { period: 'Night', icon: Network, content: 'CS Fundamentals – DBMS', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    ],
  },
  {
    day: 'Thu',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      { period: 'M2', icon: Server, content: 'System Design', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
      { period: 'Night', icon: Container, content: 'Docker / K8s', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    ],
  },
  {
    day: 'Fri',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      { period: 'M2', icon: BookOpen, content: 'Spring Boot', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      { period: 'Night', icon: Network, content: 'CS Fundamentals – Networks / OOP', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
    ],
  },
  {
    day: 'Sat',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA (harder set)', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
      { period: 'M2', icon: Server, content: 'System Design (case study)', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
      { period: 'Night', icon: Container, content: 'Docker / K8s', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    ],
  },
  {
    day: 'Sun',
    slots: [
      { period: 'M1 – DSA', icon: Brain, content: 'DSA (weak-topic revision)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      { period: 'M2', icon: BookOpen, content: 'Spring Boot catch-up', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
      { period: 'Night', icon: Code2, content: 'Mock interview Q&A / review notes', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    ],
  },
];

const periodIcons: Record<string, React.ElementType> = {
  'M1 – DSA': Brain,
  'M2': BookOpen,
  'Night': Moon,
};

function WeeklyCalendar() {
  const today = new Date();
  const dayIndex = today.getDay();
  const todayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {schedule.map((day) => {
        const isToday = day.day === todayLabel;
        return (
          <Card
            key={day.day}
            className={cn(
              'border-zinc-800/80 bg-zinc-900/40',
              isToday && 'ring-1 ring-primary/50 border-primary/30'
            )}
          >
            <CardHeader className={cn(
              'p-3 pb-0',
              isToday && 'bg-primary/5'
            )}>
              <CardTitle className={cn(
                'text-sm font-semibold text-zinc-300 flex items-center gap-2',
                isToday && 'text-primary'
              )}>
                {day.day}
                {isToday && (
                  <span className="text-[10px] font-normal text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded-full">
                    today
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {day.slots.map((slot) => {
                const Icon = slot.icon;
                return (
                  <div
                    key={slot.period}
                    className={cn(
                      'rounded-lg border p-2.5 space-y-1',
                      slot.color
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3 w-3 shrink-0 opacity-70" />
                      <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                        {slot.period}
                      </span>
                    </div>
                    <p className="text-xs font-medium leading-snug">
                      {slot.content}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function WeeklyPage() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-zinc-400" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Weekly Schedule</h1>
            <p className="text-sm text-zinc-500 mt-1">Your weekly study rotation planner</p>
          </div>
        </div>

        <div className="text-xs text-zinc-600 tabular-nums">
          Week of {dateStr}
        </div>

        <WeeklyCalendar />

        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              Rotation Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 w-20">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">M1 – DSA</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">M2</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Night</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((day) => {
                  const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day.day);
                  const todayIndex = new Date().getDay();
                  const isToday = dayIndex === todayIndex;
                  return (
                    <tr
                      key={day.day}
                      className={cn(
                        'border-b border-zinc-800/60 transition-colors hover:bg-zinc-900/20',
                        isToday && 'bg-primary/5'
                      )}
                    >
                      <td className={cn(
                        'px-4 py-3 text-sm font-semibold',
                        isToday ? 'text-primary' : 'text-zinc-200'
                      )}>
                        {day.day}
                      </td>
                      {day.slots.map((slot) => {
                        const Icon = slot.icon;
                        return (
                          <td key={slot.period} className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                              <span className="text-sm text-zinc-300">{slot.content}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Brain className="h-3.5 w-3.5 text-blue-400" /> DSA
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Spring Boot
          </div>
          <div className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-violet-400" /> System Design
          </div>
          <div className="flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5 text-cyan-400" /> CS Fundamentals
          </div>
          <div className="flex items-center gap-1.5">
            <Container className="h-3.5 w-3.5 text-blue-400" /> Docker / K8s
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-rose-400" /> Interview Prep
          </div>
        </div>
      </div>
    </div>
  );
}
