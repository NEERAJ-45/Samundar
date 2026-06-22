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
    name: 'Operating Systems',
    slug: 'os',
    progress: 55,
    hours: 90,
    difficulty: 'Hard' as const,
    color: 'from-zinc-600 to-zinc-400',
    domains: [
      { name: 'Process Management', progress: 65, modules: ['Scheduling', 'IPC', 'Threads'] },
      { name: 'Memory Management', progress: 50, modules: ['Paging', 'Segmentation', 'Virtual Memory'] },
    ],
  },
  {
    name: 'Computer Networks',
    slug: 'cn',
    progress: 60,
    hours: 85,
    difficulty: 'Medium' as const,
    color: 'from-sky-600 to-sky-400',
    domains: [
      { name: 'TCP/IP Stack', progress: 75, modules: ['Application', 'Transport', 'Network', 'Link'] },
      { name: 'Protocols', progress: 60, modules: ['HTTP/2', 'TCP', 'UDP', 'DNS', 'TLS'] },
    ],
  },
  {
    name: 'DBMS',
    slug: 'dbms',
    progress: 75,
    hours: 80,
    difficulty: 'Medium' as const,
    color: 'from-cyan-600 to-cyan-400',
    domains: [
      { name: 'SQL', progress: 90, modules: ['Joins', 'Subqueries', 'Window Functions', 'Indexing'] },
      { name: 'NoSQL', progress: 60, modules: ['Document Stores', 'Key-Value', 'Graph DB'] },
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
    <Link href={`/roadmaps/foundation/${pillar.slug}`} className="block">
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
                  className={cn('text-xs font-medium', difficultyColors[pillar.difficulty])}
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

export default function FoundationRoadmapPage() {
  const [progressData, setProgressData] = React.useState({
    os: { overall: 0, process: 0, memory: 0 },
    cn: { overall: 0, tcp: 0, protocols: 0 },
    dbms: { overall: 0, sql: 0, nosql: 0 }
  });

  React.useEffect(() => {
    const getCompletedCount = (prefix: string, rangeStart: number, rangeEnd: number, exactIds?: number[]) => {
      try {
        const raw = localStorage.getItem(`${prefix}-completed`);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        const keys = Object.keys(data).map(Number);
        if (exactIds) {
          return keys.filter(k => exactIds.includes(k)).length;
        }
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

    const osOverall = getOverallCount('foundation-os');
    const osProcess = getCompletedCount('foundation-os', 101, 122);
    const osMemory = getCompletedCount('foundation-os', 123, 134);

    const cnOverall = getOverallCount('foundation-cn');
    const cnTcp = getCompletedCount('foundation-cn', 201, 218);
    const cnProtocols = getCompletedCount('foundation-cn', 219, 250);

    const sqlIds = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 336, 337, 338, 339, 340, 345, 350];
    const dbmsOverall = getOverallCount('foundation-dbms');
    const dbmsSql = getCompletedCount('foundation-dbms', 0, 0, sqlIds);
    const dbmsNosql = Math.max(0, dbmsOverall - dbmsSql);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressData({
      os: {
        overall: Math.round((osOverall / 50) * 100),
        process: Math.round((osProcess / 22) * 100),
        memory: Math.round((osMemory / 12) * 100),
      },
      cn: {
        overall: Math.round((cnOverall / 50) * 100),
        tcp: Math.round((cnTcp / 18) * 100),
        protocols: Math.round((cnProtocols / 32) * 100),
      },
      dbms: {
        overall: Math.round((dbmsOverall / 50) * 100),
        sql: Math.round((dbmsSql / 19) * 100),
        nosql: Math.round((dbmsNosql / 31) * 100),
      }
    });
  }, []);

  const dynamicPillars = React.useMemo(() => {
    return [
      {
        ...pillars[0],
        progress: progressData.os.overall,
        domains: [
          { ...pillars[0].domains[0], progress: progressData.os.process },
          { ...pillars[0].domains[1], progress: progressData.os.memory },
        ]
      },
      {
        ...pillars[1],
        progress: progressData.cn.overall,
        domains: [
          { ...pillars[1].domains[0], progress: progressData.cn.tcp },
          { ...pillars[1].domains[1], progress: progressData.cn.protocols },
        ]
      },
      {
        ...pillars[2],
        progress: progressData.dbms.overall,
        domains: [
          { ...pillars[2].domains[0], progress: progressData.dbms.sql },
          { ...pillars[2].domains[1], progress: progressData.dbms.nosql },
        ]
      }
    ];
  }, [progressData]);

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">CS Foundation</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Core Computer Science subjects including Operating Systems, Computer Networks, and DBMS
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
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
