'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Navbar } from '@/components/layout/navbar';

const stages = ['Day 1', 'Day 7', 'Day 30', 'Day 90', 'Day 180', 'Day 365'] as const;

const revisionItems = [
  { concept: 'Two Sum (all variants)', stage: 0, dueDate: '2026-06-18', completed: false },
  { concept: 'Sliding Window Pattern', stage: 0, dueDate: '2026-06-18', completed: false },
  { concept: 'Binary Search Templates', stage: 1, dueDate: '2026-06-17', completed: false },
  { concept: 'LRU Cache Implementation', stage: 1, dueDate: '2026-06-19', completed: false },
  { concept: 'Topological Sort (Kahn)', stage: 2, dueDate: '2026-06-15', completed: false },
  { concept: 'Dijkstra vs Bellman-Ford', stage: 2, dueDate: '2026-06-20', completed: true },
  { concept: 'Knapsack DP Patterns', stage: 3, dueDate: '2026-06-10', completed: false },
  { concept: 'Segment Tree & Fenwick', stage: 3, dueDate: '2026-06-22', completed: false },
  { concept: 'CAP Theorem Deep Dive', stage: 4, dueDate: '2026-06-05', completed: false },
  { concept: 'Raft Consensus Protocol', stage: 4, dueDate: '2026-07-01', completed: true },
  { concept: 'JVM Memory Model', stage: 5, dueDate: '2026-05-28', completed: false },
  { concept: 'OS Scheduling Algorithms', stage: 5, dueDate: '2026-06-25', completed: false },
  { concept: 'HTTP/2 vs HTTP/3', stage: 0, dueDate: '2026-06-18', completed: false },
  { concept: 'SQL Window Functions', stage: 1, dueDate: '2026-06-16', completed: false },
  { concept: 'Spring Transaction Mgmt', stage: 2, dueDate: '2026-06-14', completed: false },
  { concept: 'Kubernetes Architecture', stage: 3, dueDate: '2026-06-08', completed: false },
  { concept: 'Caching Strategies', stage: 4, dueDate: '2026-06-02', completed: true },
  { concept: 'Microservice Patterns', stage: 5, dueDate: '2026-05-20', completed: false },
];

const today = new Date('2026-06-18');

function getDaysDiff(dateStr: string): number {
  const due = new Date(dateStr);
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function RevisionPage() {
  const [selectedTab, setSelectedTab] = React.useState('due-now');
  const [checkedItems, setCheckedItems] = React.useState<Set<number>>(new Set());

  const dueToday = revisionItems.filter((item) => getDaysDiff(item.dueDate) === 0).length;
  const overdue = revisionItems.filter((item) => getDaysDiff(item.dueDate) < 0).length;
  const upcomingThisWeek = revisionItems.filter(
    (item) => getDaysDiff(item.dueDate) > 0 && getDaysDiff(item.dueDate) <= 7
  ).length;
  const completedThisWeek = revisionItems.filter((item) => item.completed).length;

  const filteredItems =
    selectedTab === 'due-now'
      ? revisionItems.filter((item) => getDaysDiff(item.dueDate) <= 0 && !checkedItems.has(revisionItems.indexOf(item)))
      : revisionItems;

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Revision Engine</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Spaced repetition for long-term retention
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Due Today', value: dueToday, color: 'text-red-400' },
            { label: 'Overdue', value: overdue, color: 'text-orange-400' },
            { label: 'Upcoming (7d)', value: upcomingThisWeek, color: 'text-blue-400' },
            { label: 'Completed (7d)', value: completedThisWeek, color: 'text-emerald-400' },
          ].map((stat) => (
            <Card key={stat.label} className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 mb-1.5">{stat.label}</p>
                <span className={cn('text-2xl font-bold', stat.color)}>{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger
              value="due-now"
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              Due Now
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              All Schedules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="due-now" className="mt-4">
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-zinc-500">Nothing due right now. Great work!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredItems.map((item, i) => {
                  const idx = revisionItems.indexOf(item);
                  const days = getDaysDiff(item.dueDate);
                  return (
                    <RevisionCard
                      key={`${item.concept}-${i}`}
                      item={item}
                      days={days}
                      checked={checkedItems.has(idx)}
                      onToggle={() => toggleCheck(idx)}
                    />
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-8">
              {stages.map((stageLabel, stageIdx) => {
                const stageItems = revisionItems.filter((item) => item.stage === stageIdx);
                if (stageItems.length === 0) return null;
                return (
                  <div key={stageLabel}>
                    <h3 className="text-sm font-semibold text-zinc-400 mb-3">{stageLabel}</h3>
                    <div className="space-y-3">
                      {stageItems.map((item, i) => {
                        const idx = revisionItems.indexOf(item);
                        const days = getDaysDiff(item.dueDate);
                        return (
                          <RevisionCard
                            key={`${item.concept}-${i}`}
                            item={item}
                            days={days}
                            checked={checkedItems.has(idx)}
                            onToggle={() => toggleCheck(idx)}
                            showStage
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RevisionCard({
  item,
  days,
  checked,
  onToggle,
  showStage,
}: {
  item: (typeof revisionItems)[0];
  days: number;
  checked: boolean;
  onToggle: () => void;
  showStage?: boolean;
}) {
  return (
    <Card
      className={cn(
        'border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700',
        checked && 'opacity-40'
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div
          onClick={onToggle}
          className={cn(
            'h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-colors',
            checked
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-zinc-600 hover:border-zinc-400'
          )}
        >
          {checked && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium text-zinc-200', checked && 'line-through')}>
            {item.concept}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500">{item.dueDate}</span>
            {days < 0 ? (
              <span className="text-xs text-red-400">{Math.abs(days)}d overdue</span>
            ) : days === 0 ? (
              <span className="text-xs text-amber-400">Due today</span>
            ) : (
              <span className="text-xs text-zinc-500">{days}d left</span>
            )}
          </div>
        </div>
        {showStage ? (
          <Badge
            variant="secondary"
            className="text-[10px] font-medium bg-zinc-800 text-zinc-400 border-zinc-700"
          >
            {stages[item.stage]}
          </Badge>
        ) : (
          <div className="flex items-center gap-2">
            {days < 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] font-medium bg-red-500/10 text-red-400 border-red-500/30"
              >
                Overdue
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
