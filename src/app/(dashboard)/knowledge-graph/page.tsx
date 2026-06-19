'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitGraph, Loader2 } from 'lucide-react';
import DSATreeView from '@/components/knowledge/DSATreeView';
import GraphView from '@/components/knowledge/GraphView';
import type { Domain, DashboardMetrics } from '@/lib/types/dsa-tracker';

export default function KnowledgeGraphPage() {

  const [domains, setDomains] = useState<Domain[]>([]);
  const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/dsa-tracker');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setDomains(data.domains || []);
      setDashboard(data.dashboard || null);
    } catch {
      /* fallback handled by empty state */
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading knowledge graph...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Knowledge Graph</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Visual exploration of your DSA mastery
            </p>
          </div>
          {dashboard && (
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>
                <strong className="text-zinc-300">{dashboard.totalProblemsSolved}</strong> solved
              </span>
              <span className="h-3 w-px bg-zinc-700" />
              <span>
                <strong className="text-zinc-300">{dashboard.patternsMastered}</strong> patterns
              </span>
              <span className="h-3 w-px bg-zinc-700" />
              <span>
                <strong className="text-zinc-300">{dashboard.overallDSACompletionPercent}%</strong> complete
              </span>
            </div>
          )}
        </div>

        <Tabs defaultValue="tree" className="w-full">
          <TabsList>
            <TabsTrigger value="graph" className="text-xs gap-1.5">
              <GitGraph className="h-3.5 w-3.5" />
              Graph View
            </TabsTrigger>
            <TabsTrigger value="tree" className="text-xs gap-1.5">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Tree View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="mt-4">
            <Card className="p-0 overflow-hidden border-zinc-800">
              <div className="h-[600px]">
                {domains.length > 0 ? (
                  <GraphView
                    domains={domains}
                    onNodeClick={(id, type) => {
                      console.log('Selected:', type, id);
                    }}
                    onRefreshNeeded={loadData}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                    <GitGraph className="h-10 w-10 text-zinc-700" />
                    <p className="text-sm">No DSA data loaded</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tree" className="mt-4">
            <Card className="border-zinc-800">
              <div className="h-[600px]">
                {domains.length > 0 ? (
                  <DSATreeView domains={domains} onRefreshNeeded={loadData} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                    <svg className="h-10 w-10 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <p className="text-sm">No DSA data loaded</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
