'use client';

import * as React from 'react';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';

const pillars = [
  {
    name: 'React',
    slug: 'react',
    progress: 0,
    hours: 90,
    difficulty: 'Medium' as const,
    color: 'from-sky-500 to-cyan-400',
    domains: [
      { name: 'Core React', progress: 0, modules: ['Components', 'Hooks', 'Context', 'Refs'] },
      { name: 'Ecosystem & Next.js', progress: 0, modules: ['Next.js', 'React Query', 'Zustand'] },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
};

function RoadmapCard({
  pillar,
}: {
  pillar: (typeof pillars)[0];
}) {
  return (
    <Link href={`/roadmaps/frontend/${pillar.slug}`} className="block">
      <Card
        className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900"
      >
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-zinc-100 group-hover:text-zinc-50 transition-colors">
                {pillar.name}
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge
                  variant="secondary"
                  className={cn('text-xs font-medium border', difficultyColors[pillar.difficulty])}
                >
                  {pillar.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="h-3 w-3" />
                  {pillar.hours}h
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="text-sm font-semibold text-zinc-200">{pillar.progress}%</span>
              <ArrowRight className="h-4 w-4 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-zinc-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', pillar.color)}
              style={{ width: `${pillar.progress}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function FrontendRoadmapPage() {
  const [progressData, setProgressData] = React.useState({
    react: { overall: 0, core: 0, nextjs: 0 }
  });

  React.useEffect(() => {
    const getCompletedCountInRange = (prefix: string, rangeStart: number, rangeEnd: number) => {
      try {
        const raw = localStorage.getItem(`${prefix}-completed`);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        const keys = Object.keys(data).map(Number);
        return keys.filter(k => k >= rangeStart && k <= rangeEnd).length;
      } catch {
        return 0;
      }
    };

    const getOverallCount = (prefix: string) => {
      try {
        const raw = localStorage.getItem(`${prefix}-completed`);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        return Object.keys(data).length;
      } catch {
        return 0;
      }
    };

    // React splits (IDs 801 to 850)
    // Core React: 801 to 830 (30 questions)
    // Ecosystem & Next.js: 831 to 850 (20 questions)
    const reactOverall = getOverallCount('frontend-react');
    const reactCore = getCompletedCountInRange('frontend-react', 801, 830);
    const reactNextjs = getCompletedCountInRange('frontend-react', 831, 850);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressData({
      react: {
        overall: Math.round((reactOverall / 50) * 100),
        core: Math.round((reactCore / 30) * 100),
        nextjs: Math.round((reactNextjs / 20) * 100),
      }
    });
  }, []);

  const dynamicPillars = React.useMemo(() => {
    return [
      {
        ...pillars[0],
        progress: progressData.react.overall,
        domains: [
          { ...pillars[0].domains[0], progress: progressData.react.core },
          { ...pillars[0].domains[1], progress: progressData.react.nextjs },
        ]
      }
    ];
  }, [progressData]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Frontend Development</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Build responsive, interactive user interfaces with React and Next.js.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {dynamicPillars.map((pillar) => (
            <RoadmapCard
              key={pillar.name}
              pillar={pillar}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
