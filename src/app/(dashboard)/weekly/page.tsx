'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarDays, Moon, Brain, BookOpen, Sparkles, BookMarked, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SCHEDULES, type ScheduleId, type DaySchedule, type Slot } from '@/data/schedules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SCHEDULE_TABS: { id: ScheduleId; label: string; color: string }[] = [
  { id: 'steady', label: 'Steady', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { id: 'react', label: 'React', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'java', label: 'Java', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'devops', label: 'DevOps', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'custom', label: 'Custom', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
];

const SLOT_ICONS: Record<string, React.ElementType> = {
  'M1 – DSA': Brain,
  'M2': BookOpen,
  'Night – CS Fundamentals': Moon,
};

const SLOT_COLORS: Record<string, string> = {
  'M1 – DSA': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'M2': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Night – CS Fundamentals': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

function deepCloneDays(days: DaySchedule[]): DaySchedule[] {
  return days.map(d => ({ ...d, slots: d.slots.map(s => ({ ...s })) }));
}

export default function WeeklyPage() {
  const [scheduleId, setScheduleId] = React.useState<ScheduleId>('steady');
  const [editing, setEditing] = React.useState(false);
  const [editDays, setEditDays] = React.useState<DaySchedule[] | null>(null);

  const [customSchedule, setCustomSchedule] = React.useState<typeof SCHEDULES.custom | null>(() => {
    try {
      const saved = localStorage.getItem('weekly-custom-schedule');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const dayIndex = today.getDay();
  const todayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
  const schedule = scheduleId === 'custom' && customSchedule ? customSchedule : SCHEDULES[scheduleId];
  const days = editing && editDays ? editDays : (schedule?.days ?? []);

  function startEdit() {
    const src = scheduleId === 'custom' && customSchedule ? customSchedule : SCHEDULES[scheduleId];
    setEditDays(deepCloneDays(src.days));
    setEditing(true);
    setScheduleId('custom');
  }

  function cancelEdit() {
    setEditing(false);
    setEditDays(null);
    if (!customSchedule) setScheduleId('steady');
  }

  function saveEdit() {
    if (!editDays) return;
    const updated = { ...SCHEDULES.custom, days: editDays };
    setCustomSchedule(updated);
    localStorage.setItem('weekly-custom-schedule', JSON.stringify(updated));
    setEditing(false);
    setEditDays(null);
  }

  function updateTopic(dayIdx: number, slotPeriod: string, value: string) {
    if (!editDays) return;
    setEditDays(prev => prev!.map((d, i) => {
      if (i !== dayIdx) return d;
      return { ...d, slots: d.slots.map(s => s.period === slotPeriod ? { ...s, topic: value } : s) };
    }));
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-zinc-400" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Weekly Schedule</h1>
            <p className="text-sm text-zinc-500 mt-1">Your weekly study rotation planner</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-zinc-600 tabular-nums">
            Week of {dateStr}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={saveEdit}>
                  <Check className="h-4 w-4 mr-1" /> Save
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={startEdit}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Link
              href="/roadmaps"
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all font-medium"
            >
              <BookMarked className="h-3.5 w-3.5" />
              Study Resources
            </Link>
          </div>
        </div>

        {/* Schedule Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {SCHEDULE_TABS.map((tab) => {
            const isActive = scheduleId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { if (!editing) setScheduleId(tab.id); }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer',
                  isActive
                    ? tab.color
                    : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 bg-zinc-900/50',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {days.map((day, dayIdx) => {
            const isToday = day.day === todayLabel;
            return (
              <Card
                key={day.day}
                className={cn(
                  'border-zinc-800/80 bg-zinc-900/40',
                  isToday && 'ring-1 ring-primary/50 border-primary/30'
                )}
              >
                <CardHeader className={cn('p-3 pb-0', isToday && 'bg-primary/5')}>
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
                    const Icon = SLOT_ICONS[slot.period] || Brain;
                    return (
                      <div
                        key={slot.period}
                        className={cn(
                          'rounded-lg border p-2.5 space-y-1',
                          SLOT_COLORS[slot.period] || 'bg-zinc-800/30 text-zinc-400 border-zinc-700/50'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 shrink-0 opacity-70" />
                          <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                            {slot.period}
                          </span>
                        </div>
                        {editing ? (
                          <input
                            value={slot.topic}
                            onChange={e => updateTopic(dayIdx, slot.period, e.target.value)}
                            className="w-full bg-zinc-800/60 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-200 outline-none focus:border-accent"
                          />
                        ) : (
                          <p className="text-xs font-medium leading-snug">{slot.topic}</p>
                        )}
                        {slot.description && !editing && (
                          <p className="text-[10px] opacity-60">{slot.description}</p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Rotation Overview Table */}
        <Card className="border-zinc-800/80 bg-zinc-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-500" />
              Rotation Overview — {schedule?.label}
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
                {days.map((day, dayIdx) => {
                  const dayIdxOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day.day);
                  const isToday = dayIdxOfWeek === dayIndex;
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
                        const Icon = SLOT_ICONS[slot.period] || Brain;
                        return (
                          <td key={slot.period} className="px-4 py-3">
                            {editing ? (
                              <input
                                value={slot.topic}
                                onChange={e => updateTopic(dayIdx, slot.period, e.target.value)}
                                className="w-full bg-zinc-800/60 border border-zinc-700 rounded px-1.5 py-0.5 text-sm text-zinc-300 outline-none focus:border-accent"
                              />
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                <span className="text-sm text-zinc-300">{slot.topic}</span>
                              </div>
                            )}
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
      </div>
    </div>
  );
}
