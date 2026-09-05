'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RoadmapCardRow } from '@/components/roadmaps/RoadmapCardRow';
import { HubExportButton } from '@/components/roadmaps/HubExportButton';

const pillars = [
  {
    name: 'System Design Concepts',
    slug: 'concepts',
    progress: 48,
    hours: 140,
    difficulty: 'Medium-Hard',
    domains: [
      { name: 'High-Level Design (HLD)', progress: 78 },
      { name: 'Low-Level Design (LLD)', progress: 0 },
    ],
  },
  {
    name: 'System Design Problems',
    slug: 'problems',
    progress: 0,
    hours: 110,
    difficulty: 'Hard',
    domains: [
      { name: 'Core System Designs', progress: 0 },
      { name: 'Advanced System Designs', progress: 0 },
    ],
  },
];

function computeSystemDesignProgress() {
  const getCompletedCountInRange = (prefix: string, rangeStart: number, rangeEnd: number) => {
    try {
      const raw = localStorage.getItem(`${prefix}-completed`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const keys = Object.keys(data).map(Number);
      return keys.filter(k => k >= rangeStart && k <= rangeEnd).length;
    } catch {
      return null;
    }
  };

  const getOverallCount = (prefix: string) => {
    try {
      const raw = localStorage.getItem(`${prefix}-completed`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return Object.keys(data).length;
    } catch {
      return null;
    }
  };

  const hldTotal = 333;
  const lldTotal = 180;
  const hldCount = getOverallCount('system-design-hld');
  const lldCount = getOverallCount('system-design-lld');

  const sdHld = hldCount !== null ? hldCount : 0;
  const sdLld = lldCount !== null ? lldCount : 0;

  const problemsOverallCount = getOverallCount('system-design-problems');
  const problemsCoreCount = getCompletedCountInRange('system-design-problems', 501, 515);
  const problemsAdvancedCount = getCompletedCountInRange('system-design-problems', 516, 527);

  const sdProblemsOverall = problemsOverallCount !== null ? problemsOverallCount : 0;
  const sdProblemsCore = problemsCoreCount !== null ? problemsCoreCount : 0;
  const sdProblemsAdvanced = problemsAdvancedCount !== null ? problemsAdvancedCount : 0;

  return {
    concepts: {
      overall: Math.round(((sdHld + sdLld) / (hldTotal + lldTotal)) * 100),
      hld: Math.round((sdHld / hldTotal) * 100),
      lld: Math.round((sdLld / lldTotal) * 100),
    },
    problems: {
      overall: Math.round((sdProblemsOverall / 27) * 100),
      core: Math.round((sdProblemsCore / 15) * 100),
      advanced: Math.round((sdProblemsAdvanced / 12) * 100),
    }
  };
}

export default function SystemDesignRoadmapPage() {
  const [progressData, setProgressData] = React.useState(computeSystemDesignProgress);

  React.useEffect(() => {
    const update = () => setProgressData(computeSystemDesignProgress());
    const bc = new BroadcastChannel('roadmap-progress');
    bc.onmessage = update;
    window.addEventListener('storage', update);
    return () => {
      bc.close();
      window.removeEventListener('storage', update);
    };
  }, []);

  const dynamicPillars = React.useMemo(() => {
    return [
      {
        ...pillars[0],
        progress: progressData.concepts.overall,
        domains: [
          { ...pillars[0].domains[0], progress: progressData.concepts.hld },
          { ...pillars[0].domains[1], progress: progressData.concepts.lld },
        ]
      },
      {
        ...pillars[1],
        progress: progressData.problems.overall,
        domains: [
          { ...pillars[1].domains[0], progress: progressData.problems.core },
          { ...pillars[1].domains[1], progress: progressData.problems.advanced },
        ]
      }
    ];
  }, [progressData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-100">System Design & Architecture</h1>
              <p className="text-sm text-zinc-500 mt-1">
                Learn how to design highly scalable, reliable, and fault-tolerant distributed systems.
              </p>
            </div>
            <HubExportButton pillars={dynamicPillars} hubName="System Design" />
          </div>
        </div>

        <div className="space-y-3">
          {dynamicPillars.map((pillar) => (
            <RoadmapCardRow
              key={pillar.name}
              pillar={pillar}
              href={`/roadmaps/system-design/${pillar.slug}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
