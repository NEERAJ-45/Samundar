'use client';

import * as React from 'react';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const pillars = [
  {
    name: 'Hibernate (JPA)',
    slug: 'hibernate',
    progress: 0,
    hours: 100,
    difficulty: 'Medium-Hard' as const,
    color: 'from-emerald-500 to-teal-400',
    domains: [
      { name: 'Fundamentals', progress: 0, modules: ['JPA vs Hibernate', 'Entity Setup', 'Config & Dialects'] },
      { name: 'Mappings & Associations', progress: 0, modules: ['Relations', 'Cascade', 'Fetch Types', 'Inheritance'] },
      { name: 'Querying', progress: 0, modules: ['JPQL', 'Criteria API', 'Native SQL', 'Specifications'] },
      { name: 'Performance & Caching', progress: 0, modules: ['N+1', 'Caching', 'Locking', 'Batch Fetching'] },
      { name: 'Advanced & Production', progress: 0, modules: ['Transactions', 'Auditing', 'Multi-tenancy', 'Migrations'] },
    ],
  },
  {
    name: 'Prisma',
    slug: 'prisma',
    progress: 0,
    hours: 100,
    difficulty: 'Medium' as const,
    color: 'from-sky-500 to-indigo-400',
    domains: [
      { name: 'Setup & Schema', progress: 0, modules: ['Schema Language', 'Migrations', 'Prisma Client', 'CRUD'] },
      { name: 'Relations', progress: 0, modules: ['1:1 / 1:M / M:M', 'Nested Writes', 'Cascading'] },
      { name: 'Querying', progress: 0, modules: ['Pagination', 'Aggregations', 'Raw SQL', 'Transactions'] },
      { name: 'Migrations & Advanced', progress: 0, modules: ['Production Migrations', 'Seeding', 'Connection Pooling'] },
      { name: 'Production & Ecosystem', progress: 0, modules: ['Serverless', 'Testing', 'RLS', 'Extensions'] },
    ],
  },
  {
    name: 'Drizzle',
    slug: 'drizzle',
    progress: 0,
    hours: 100,
    difficulty: 'Hard' as const,
    color: 'from-orange-500 to-amber-400',
    domains: [
      { name: 'Setup & Schema', progress: 0, modules: ['Schema Definition', 'Migrations', 'Type Inference', 'Queries'] },
      { name: 'Queries', progress: 0, modules: ['Where Clauses', 'Joins', 'Aggregates', 'Transactions'] },
      { name: 'Relations & Joins', progress: 0, modules: ['M:M Join Tables', 'Composite Keys', 'Views', 'Enums'] },
      { name: 'Migrations & Types', progress: 0, modules: ['Pooling', 'Upserts', 'Soft Deletes', 'Custom Types'] },
      { name: 'Advanced & Production', progress: 0, modules: ['Read Replicas', 'Outbox Pattern', 'Clean Architecture', 'Monorepo'] },
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
    <Link href={`/roadmaps/orms/${pillar.slug}`} className="block">
      <Card className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900 h-full flex flex-col justify-between">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-zinc-100 group-hover:text-zinc-50 transition-colors">
                {pillar.name}
              </CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary" className={cn('text-xs font-medium border', difficultyColors[pillar.difficulty])}>
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
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${pillar.progress}%` }}
            />
          </div>
          {pillar.domains && pillar.domains.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800/50 space-y-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Phases</span>
              {pillar.domains.map((domain) => (
                <div key={domain.name} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 truncate flex-1">{domain.name}</span>
                  <div className="h-1 w-20 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${domain.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 w-7 text-right tabular-nums">{domain.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function OrmsRoadmapPage() {
  const [progressData, setProgressData] = React.useState({
    hibernate: { overall: 0, fundamentals: 0, mappings: 0, querying: 0, performance: 0, advanced: 0 },
    prisma: { overall: 0, setup: 0, relations: 0, querying: 0, migrations: 0, ecosystem: 0 },
    drizzle: { overall: 0, setup: 0, queries: 0, joins: 0, migrations: 0, advanced: 0 },
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

    // Hibernate (IDs 1001 to 1050)
    const hibernateOverall = getOverallCount('orms-hibernate');
    const hibernateFundamentals = getCompletedCountInRange('orms-hibernate', 1001, 1010);
    const hibernateMappings = getCompletedCountInRange('orms-hibernate', 1011, 1020);
    const hibernateQuerying = getCompletedCountInRange('orms-hibernate', 1021, 1030);
    const hibernatePerformance = getCompletedCountInRange('orms-hibernate', 1031, 1040);
    const hibernateAdvanced = getCompletedCountInRange('orms-hibernate', 1041, 1050);

    // Prisma (IDs 1051 to 1100)
    const prismaOverall = getOverallCount('orms-prisma');
    const prismaSetup = getCompletedCountInRange('orms-prisma', 1051, 1060);
    const prismaRelations = getCompletedCountInRange('orms-prisma', 1061, 1070);
    const prismaQuerying = getCompletedCountInRange('orms-prisma', 1071, 1080);
    const prismaMigrations = getCompletedCountInRange('orms-prisma', 1081, 1090);
    const prismaEcosystem = getCompletedCountInRange('orms-prisma', 1091, 1100);

    // Drizzle (IDs 1101 to 1150)
    const drizzleOverall = getOverallCount('orms-drizzle');
    const drizzleSetup = getCompletedCountInRange('orms-drizzle', 1101, 1110);
    const drizzleQueries = getCompletedCountInRange('orms-drizzle', 1111, 1120);
    const drizzleJoins = getCompletedCountInRange('orms-drizzle', 1121, 1130);
    const drizzleMigrations = getCompletedCountInRange('orms-drizzle', 1131, 1140);
    const drizzleAdvanced = getCompletedCountInRange('orms-drizzle', 1141, 1150);

    setProgressData({
      hibernate: {
        overall: Math.round((hibernateOverall / 50) * 100),
        fundamentals: Math.round((hibernateFundamentals / 10) * 100),
        mappings: Math.round((hibernateMappings / 10) * 100),
        querying: Math.round((hibernateQuerying / 10) * 100),
        performance: Math.round((hibernatePerformance / 10) * 100),
        advanced: Math.round((hibernateAdvanced / 10) * 100),
      },
      prisma: {
        overall: Math.round((prismaOverall / 50) * 100),
        setup: Math.round((prismaSetup / 10) * 100),
        relations: Math.round((prismaRelations / 10) * 100),
        querying: Math.round((prismaQuerying / 10) * 100),
        migrations: Math.round((prismaMigrations / 10) * 100),
        ecosystem: Math.round((prismaEcosystem / 10) * 100),
      },
      drizzle: {
        overall: Math.round((drizzleOverall / 50) * 100),
        setup: Math.round((drizzleSetup / 10) * 100),
        queries: Math.round((drizzleQueries / 10) * 100),
        joins: Math.round((drizzleJoins / 10) * 100),
        migrations: Math.round((drizzleMigrations / 10) * 100),
        advanced: Math.round((drizzleAdvanced / 10) * 100),
      },
    });
  }, []);

  const dynamicPillars = React.useMemo(() => {
    return [
      {
        ...pillars[0],
        progress: progressData.hibernate.overall,
        domains: [
          { ...pillars[0].domains[0], progress: progressData.hibernate.fundamentals },
          { ...pillars[0].domains[1], progress: progressData.hibernate.mappings },
          { ...pillars[0].domains[2], progress: progressData.hibernate.querying },
          { ...pillars[0].domains[3], progress: progressData.hibernate.performance },
          { ...pillars[0].domains[4], progress: progressData.hibernate.advanced },
        ]
      },
      {
        ...pillars[1],
        progress: progressData.prisma.overall,
        domains: [
          { ...pillars[1].domains[0], progress: progressData.prisma.setup },
          { ...pillars[1].domains[1], progress: progressData.prisma.relations },
          { ...pillars[1].domains[2], progress: progressData.prisma.querying },
          { ...pillars[1].domains[3], progress: progressData.prisma.migrations },
          { ...pillars[1].domains[4], progress: progressData.prisma.ecosystem },
        ]
      },
      {
        ...pillars[2],
        progress: progressData.drizzle.overall,
        domains: [
          { ...pillars[2].domains[0], progress: progressData.drizzle.setup },
          { ...pillars[2].domains[1], progress: progressData.drizzle.queries },
          { ...pillars[2].domains[2], progress: progressData.drizzle.joins },
          { ...pillars[2].domains[3], progress: progressData.drizzle.migrations },
          { ...pillars[2].domains[4], progress: progressData.drizzle.advanced },
        ]
      }
    ];
  }, [progressData]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">ORMs & Hibernate</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Master object-relational mapping across three paradigms: Java Hibernate (JPA), TypeScript Prisma (schema-first), and Drizzle (SQL-first).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
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
