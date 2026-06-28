'use client';

import * as React from 'react';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


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
  {
    name: 'Next.js',
    slug: 'nextjs',
    progress: 0,
    hours: 90,
    difficulty: 'Medium-Hard' as const,
    color: 'from-cyan-500 to-teal-400',
    domains: [
      { name: 'Routing & Pages', progress: 0, modules: ['App Router', 'Nested Layouts', 'Dynamic Routes'] },
      { name: 'Server & Rendering', progress: 0, modules: ['RSC vs RCC', 'Server Actions', 'Edge API'] },
    ],
  },
  {
    name: 'MicroFrontends',
    slug: 'microfrontends',
    progress: 0,
    hours: 80,
    difficulty: 'Hard' as const,
    color: 'from-indigo-500 to-purple-500',
    domains: [
      { name: 'Orchestration & Federation', progress: 0, modules: ['Module Federation', 'Single-SPA', 'SystemJS'] },
      { name: 'Communication & Isolation', progress: 0, modules: ['postMessage', 'Shadow DOM', 'State Sync'] },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Medium-Hard': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
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
        className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900 h-full flex flex-col justify-between"
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
        <CardContent className="p-5 pt-0 mt-auto">
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-650 transition-all duration-500"
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
    react: { overall: 0, core: 0, nextjs: 0 },
    nextjs: { overall: 0, routing: 0, rendering: 0 },
    mfe: { overall: 0, orchestration: 0, isolation: 0 }
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

    // Next.js splits (IDs 851 to 900)
    // Routing: 851 to 875 (25 questions)
    // Rendering: 876 to 900 (25 questions)
    const nextjsOverall = getOverallCount('frontend-nextjs');
    const nextjsRouting = getCompletedCountInRange('frontend-nextjs', 851, 875);
    const nextjsRendering = getCompletedCountInRange('frontend-nextjs', 876, 900);

    // MicroFrontends splits (IDs 901 to 950)
    // Orchestration: 901 to 925 (25 questions)
    // Isolation: 926 to 950 (25 questions)
    const mfeOverall = getOverallCount('frontend-mfe');
    const mfeOrchestration = getCompletedCountInRange('frontend-mfe', 901, 925);
    const mfeIsolation = getCompletedCountInRange('frontend-mfe', 926, 950);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressData({
      react: {
        overall: Math.round((reactOverall / 50) * 100),
        core: Math.round((reactCore / 30) * 100),
        nextjs: Math.round((reactNextjs / 20) * 100),
      },
      nextjs: {
        overall: Math.round((nextjsOverall / 50) * 100),
        routing: Math.round((nextjsRouting / 25) * 100),
        rendering: Math.round((nextjsRendering / 25) * 100),
      },
      mfe: {
        overall: Math.round((mfeOverall / 50) * 100),
        orchestration: Math.round((mfeOrchestration / 25) * 100),
        isolation: Math.round((mfeIsolation / 25) * 100),
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
      },
      {
        ...pillars[1],
        progress: progressData.nextjs.overall,
        domains: [
          { ...pillars[1].domains[0], progress: progressData.nextjs.routing },
          { ...pillars[1].domains[1], progress: progressData.nextjs.rendering },
        ]
      },
      {
        ...pillars[2],
        progress: progressData.mfe.overall,
        domains: [
          { ...pillars[2].domains[0], progress: progressData.mfe.orchestration },
          { ...pillars[2].domains[1], progress: progressData.mfe.isolation },
        ]
      }
    ];
  }, [progressData]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
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
            Build responsive, interactive, and modular user interfaces with React, Next.js, and MicroFrontends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
