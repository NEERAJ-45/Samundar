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
    name: 'Java',
    slug: 'java',
    progress: 0,
    hours: 100,
    difficulty: 'Medium' as const,
    color: 'from-orange-600 to-orange-400',
    domains: [
      { name: 'Core Java', progress: 0, modules: ['OOP', 'Collections', 'Streams', 'Concurrency'] },
      { name: 'Advanced Java', progress: 0, modules: ['JVM Internals', 'Memory Model', 'GC Tuning'] },
    ],
  },
  {
    name: 'Spring Boot',
    slug: 'springboot',
    progress: 0,
    hours: 120,
    difficulty: 'Medium' as const,
    color: 'from-green-600 to-green-400',
    domains: [
      { name: 'Core Spring & Web', progress: 0, modules: ['IoC', 'DI', 'AOP', 'REST APIs', 'MVC', 'Security', 'JPA'] },
      { name: 'Microservices', progress: 0, modules: ['Service Discovery', 'API Gateway', 'Circuit Breaker'] },
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
    <Link href={`/roadmaps/backend/${pillar.slug}`} className="block">
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
              className="h-full rounded-full bg-indigo-650 transition-all duration-500"
              style={{ width: `${pillar.progress}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BackendRoadmapPage() {
  const [progressData, setProgressData] = React.useState({
    java: { overall: 0, core: 0, advanced: 0 },
    springboot: { overall: 0, core: 0, micro: 0 }
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

    // Java splits (IDs 601 to 650)
    // Core Java: 601 to 635 (35 questions)
    // Advanced Java: 636 to 650 (15 questions)
    const javaOverall = getOverallCount('backend-java');
    const javaCore = getCompletedCountInRange('backend-java', 601, 635);
    const javaAdvanced = getCompletedCountInRange('backend-java', 636, 650);

    // Spring Boot splits (IDs 701 to 750)
    // Core Spring & Web APIs: 701 to 735 (35 questions)
    // Microservices: 736 to 750 (15 questions)
    const springOverall = getOverallCount('backend-springboot');
    const springCore = getCompletedCountInRange('backend-springboot', 701, 735);
    const springMicro = getCompletedCountInRange('backend-springboot', 736, 750);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressData({
      java: {
        overall: Math.round((javaOverall / 50) * 100),
        core: Math.round((javaCore / 35) * 100),
        advanced: Math.round((javaAdvanced / 15) * 100),
      },
      springboot: {
        overall: Math.round((springOverall / 50) * 100),
        core: Math.round((springCore / 35) * 100),
        micro: Math.round((springMicro / 15) * 100),
      }
    });
  }, []);

  const dynamicPillars = React.useMemo(() => {
    return [
      {
        ...pillars[0],
        progress: progressData.java.overall,
        domains: [
          { ...pillars[0].domains[0], progress: progressData.java.core },
          { ...pillars[0].domains[1], progress: progressData.java.advanced },
        ]
      },
      {
        ...pillars[1],
        progress: progressData.springboot.overall,
        domains: [
          { ...pillars[1].domains[0], progress: progressData.springboot.core },
          { ...pillars[1].domains[1], progress: progressData.springboot.micro },
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Backend Development</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Master backend engineering with Java and Spring Boot ecosystems.
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
