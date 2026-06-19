'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/navbar';

const topics = [
  { name: 'Arrays & Hashing', level: 5 },
  { name: 'Two Pointers', level: 4 },
  { name: 'Sliding Window', level: 4 },
  { name: 'Stack', level: 5 },
  { name: 'Binary Search', level: 3 },
  { name: 'Linked Lists', level: 4 },
  { name: 'Trees', level: 3 },
  { name: 'Tries', level: 2 },
  { name: 'Heaps', level: 3 },
  { name: 'Backtracking', level: 2 },
  { name: 'Graphs', level: 2 },
  { name: 'Dynamic Prog.', level: 2 },
  { name: 'Greedy', level: 3 },
  { name: 'Intervals', level: 3 },
  { name: 'Math & Geometry', level: 1 },
  { name: 'Bit Manip.', level: 2 },
  { name: 'SQL', level: 4 },
  { name: 'Concurrency', level: 2 },
  { name: 'Design Patterns', level: 3 },
  { name: 'OOP', level: 4 },
  { name: 'REST APIs', level: 4 },
  { name: 'Database Design', level: 3 },
  { name: 'Caching', level: 2 },
  { name: 'Load Balancing', level: 1 },
  { name: 'Microservices', level: 2 },
  { name: 'CI/CD', level: 2 },
  { name: 'Docker', level: 3 },
  { name: 'Kubernetes', level: 1 },
  { name: 'AWS Core', level: 2 },
  { name: 'Networking', level: 3 },
  { name: 'OS Concepts', level: 3 },
  { name: 'System Design', level: 2 },
];

const levelColors = [
  'bg-zinc-900',
  'bg-blue-900',
  'bg-green-900',
  'bg-yellow-800',
  'bg-orange-600',
  'bg-red-500',
];

const levelLabels = ['Not Started', 'Awareness', 'Familiar', 'Proficient', 'Interview Ready', 'Mastered'];

const statsCards = [
  { label: 'Average Mastery', value: '2.5', suffix: '/ 5' },
  { label: 'Topics Started', value: '28' },
  { label: 'Interview Ready', value: '8' },
  { label: 'Mastered', value: '3' },
];

export default function MasteryPage() {
  const distribution = Array.from({ length: 6 }, (_, i) => topics.filter((t) => t.level === i).length);

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Mastery Tracking</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Track your knowledge depth across all areas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 mb-1.5">{stat.label}</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-bold text-zinc-100">{stat.value}</span>
                  {stat.suffix && <span className="text-sm text-zinc-500">{stat.suffix}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50 mb-8">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300">Mastery Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {topics.map((topic) => (
                <div
                  key={topic.name}
                  className="group relative flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'h-8 w-full rounded-md transition-all hover:ring-2 hover:ring-zinc-500',
                      levelColors[topic.level]
                    )}
                  />
                  <span className="text-[10px] text-zinc-600 text-center leading-tight truncate w-full">
                    {topic.name}
                  </span>
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
                    <div className="rounded-md bg-zinc-800 px-2.5 py-1.5 shadow-lg">
                      <p className="text-xs font-medium text-zinc-200 whitespace-nowrap">{topic.name}</p>
                      <p className="text-[10px] text-zinc-400 whitespace-nowrap">
                        Level {topic.level} — {levelLabels[topic.level]}
                      </p>
                    </div>
                    <div className="h-1.5 w-1.5 rotate-45 bg-zinc-800 -mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-zinc-300">Mastery Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="space-y-2.5">
              {levelLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={cn('h-3 w-3 rounded-sm shrink-0', levelColors[i])}
                  />
                  <span className="text-xs text-zinc-400 w-28">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', levelColors[i])}
                      style={{
                        width: `${(distribution[i] / topics.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 w-6 text-right">{distribution[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
