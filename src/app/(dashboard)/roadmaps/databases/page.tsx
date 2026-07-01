'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Database, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LazyAppear } from '@/components/shared/LazyAppear';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DatabasesHubPage() {
  const [mounted, setMounted] = useState(false);
  const [sqlProgress, setSqlProgress] = useState(0);
  const [sqlTheoryPct, setSqlTheoryPct] = useState(0);
  const [sqlLeetcodePct, setSqlLeetcodePct] = useState(0);
  const [nosqlProgress, setNosqlProgress] = useState(0);

  const calculateProgress = useCallback(() => {
    const getCompletedCount = (prefix: string) => {
      try {
        const raw = localStorage.getItem(`${prefix}-completed`);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        return Object.keys(data).length;
      } catch {
        return 0;
      }
    };

    const sqlTheory = getCompletedCount('databases-sql');
    const sqlLeetcode = getCompletedCount('databases-leetcode');
    const nosqlTheory = getCompletedCount('databases-nosql');

    setSqlTheoryPct(Math.round((sqlTheory / 50) * 100));
    setSqlLeetcodePct(Math.round((sqlLeetcode / 50) * 100));
    setSqlProgress(Math.round(((sqlTheory + sqlLeetcode) / 100) * 100));
    setNosqlProgress(Math.round((nosqlTheory / 50) * 100));
  }, []);

  useEffect(() => {
    setMounted(true);
    calculateProgress();

    try {
      const bc = new BroadcastChannel('roadmap-progress');
      bc.onmessage = calculateProgress;
      return () => bc.close();
    } catch {}
  }, [calculateProgress]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Back navigation & Header */}
        <div className="mb-8">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-3 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Roadmaps
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Database className="h-7 w-7 text-indigo-400" />
            Database
          </h1>
          <p className="text-base text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            Select a specialized relational or non-relational path below to track your database mastery and practice coding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Sub-Roadmap 1: SQL Database */}
          <LazyAppear delay={0.05}>
            <Link href="/roadmaps/databases/sql" className="group block">
              <SpotlightCard className="h-full hover:border-zinc-700/80 transition-all duration-350" spotlightColor="rgba(99, 102, 241, 0.12)">
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-400" />
                        SQL Database
                      </h3>
                      <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-semibold">
                        50 Theory + 50 LeetCode
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed min-h-[64px]">
                      Syllabus on schemas, normal forms, joins, transaction isolation (ACID), indexes (B+ Trees), deadlocks, query plans, and 50 LeetCode practice problems.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-zinc-400">Path Progress</span>
                      <span className="text-xs font-bold text-zinc-200">{mounted ? sqlProgress : 0}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${mounted ? sqlProgress : 0}%` }}
                      />
                    </div>
                    {mounted && (
                      <div className="mt-2 pt-2 border-t border-zinc-800/50 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500 w-20 truncate shrink-0">SQL Theory</span>
                          <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-500/70" style={{ width: `${sqlTheoryPct}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-500 w-7 text-right tabular-nums">{sqlTheoryPct}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-500 w-20 truncate shrink-0">SQL LeetCode</span>
                          <div className="flex-1 h-1 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${sqlLeetcodePct}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-500 w-7 text-right tabular-nums">{sqlLeetcodePct}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end text-xs font-bold text-zinc-200 group-hover:text-indigo-400 pt-2 transition-colors">
                    <span>Enter SQL Roadmap</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          </LazyAppear>

          {/* Sub-Roadmap 2: NoSQL Database */}
          <LazyAppear delay={0.1}>
            <Link href="/roadmaps/databases/nosql" className="group block">
              <SpotlightCard className="h-full hover:border-zinc-700/80 transition-all duration-350" spotlightColor="rgba(168, 85, 247, 0.12)">
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-purple-400 transition-colors duration-200 flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-400" />
                        NoSQL Database
                      </h3>
                      <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20 font-semibold">
                        50 Theory
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed min-h-[64px]">
                      Syllabus on distributed storage trade-offs (CAP/PACELC), Raft/Paxos consensus, document stores (MongoDB), wide-column models, and Vector DBs.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-zinc-400">Path Progress</span>
                      <span className="text-xs font-bold text-zinc-200">{mounted ? nosqlProgress : 0}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-650 transition-all duration-500"
                        style={{ width: `${mounted ? nosqlProgress : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-xs font-bold text-zinc-200 group-hover:text-purple-400 pt-2 transition-colors">
                    <span>Enter NoSQL Roadmap</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          </LazyAppear>
        </div>
      </div>
    </div>
  );
}
