'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/layout/navbar';

const pillars = [
  {
    name: 'Data Structures & Algorithms',
    progress: 72,
    hours: 180,
    difficulty: 'Hard' as const,
    color: 'from-blue-600 to-blue-400',
    domains: [
      { name: 'Arrays & Hashing', progress: 85, modules: ['Prefix Sum', 'Sliding Window', 'Two Pointers', 'Hash Maps'] },
      { name: 'Linked Lists', progress: 70, modules: ['Singly Linked', 'Doubly Linked', 'Fast & Slow Pointers'] },
      { name: 'Trees & Graphs', progress: 60, modules: ['DFS', 'BFS', 'Binary Trees', 'Graph Traversal'] },
      { name: 'Dynamic Programming', progress: 45, modules: ['Memoization', 'Tabulation', 'Knapsack', 'LCS'] },
    ],
  },
  {
    name: 'System Design',
    progress: 45,
    hours: 140,
    difficulty: 'Hard' as const,
    color: 'from-violet-600 to-violet-400',
    domains: [
      { name: 'Fundamentals', progress: 80, modules: ['CAP Theorem', 'Consistency Models', 'Load Balancing'] },
      { name: 'Databases', progress: 60, modules: ['Sharding', 'Replication', 'Indexing', 'Caching'] },
      { name: 'Distributed Systems', progress: 35, modules: ['Consensus', 'Gossip Protocol', 'Vector Clocks'] },
    ],
  },
  {
    name: 'Java',
    progress: 88,
    hours: 100,
    difficulty: 'Medium' as const,
    color: 'from-orange-600 to-orange-400',
    domains: [
      { name: 'Core Java', progress: 95, modules: ['OOP', 'Collections', 'Streams', 'Concurrency'] },
      { name: 'Advanced Java', progress: 70, modules: ['JVM Internals', 'Memory Model', 'GC Tuning'] },
    ],
  },
  {
    name: 'Spring Boot',
    progress: 65,
    hours: 120,
    difficulty: 'Medium' as const,
    color: 'from-green-600 to-green-400',
    domains: [
      { name: 'Core Spring', progress: 80, modules: ['IoC', 'DI', 'AOP', 'Beans'] },
      { name: 'Spring Web', progress: 70, modules: ['REST APIs', 'MVC', 'Security', 'JPA'] },
      { name: 'Microservices', progress: 40, modules: ['Service Discovery', 'API Gateway', 'Circuit Breaker'] },
    ],
  },
  {
    name: 'DBMS',
    progress: 75,
    hours: 80,
    difficulty: 'Medium' as const,
    color: 'from-cyan-600 to-cyan-400',
    domains: [
      { name: 'SQL', progress: 90, modules: ['Joins', 'Subqueries', 'Window Functions', 'Indexing'] },
      { name: 'NoSQL', progress: 60, modules: ['Document Stores', 'Key-Value', 'Graph DB'] },
    ],
  },
  {
    name: 'Operating Systems',
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
    name: 'Distributed Systems',
    progress: 30,
    hours: 110,
    difficulty: 'Hard' as const,
    color: 'from-purple-600 to-purple-400',
    domains: [
      { name: 'Coordination', progress: 35, modules: ['Zookeeper', 'etcd', 'Leader Election'] },
      { name: 'Storage', progress: 25, modules: ['Distributed FS', 'Object Storage', 'CRDTs'] },
    ],
  },
  {
    name: 'React',
    progress: 82,
    hours: 90,
    difficulty: 'Medium' as const,
    color: 'from-sky-500 to-cyan-400',
    domains: [
      { name: 'Core React', progress: 95, modules: ['Components', 'Hooks', 'Context', 'Refs'] },
      { name: 'Ecosystem', progress: 70, modules: ['Next.js', 'React Query', 'Zustand'] },
    ],
  },
  {
    name: 'Docker',
    progress: 50,
    hours: 60,
    difficulty: 'Easy' as const,
    color: 'from-blue-500 to-blue-300',
    domains: [
      { name: 'Container Basics', progress: 70, modules: ['Images', 'Containers', 'Dockerfile', 'Volumes'] },
      { name: 'Orchestration', progress: 30, modules: ['Compose', 'Networking', 'Registry'] },
    ],
  },
  {
    name: 'Kubernetes',
    progress: 25,
    hours: 100,
    difficulty: 'Hard' as const,
    color: 'from-indigo-600 to-indigo-400',
    domains: [
      { name: 'Pods & Workloads', progress: 40, modules: ['Deployments', 'StatefulSets', 'DaemonSets'] },
      { name: 'Networking', progress: 20, modules: ['Services', 'Ingress', 'CNI'] },
    ],
  },
  {
    name: 'AWS',
    progress: 40,
    hours: 130,
    difficulty: 'Medium' as const,
    color: 'from-amber-600 to-amber-400',
    domains: [
      { name: 'Compute', progress: 55, modules: ['EC2', 'Lambda', 'ECS', 'EKS'] },
      { name: 'Storage', progress: 45, modules: ['S3', 'EBS', 'RDS', 'DynamoDB'] },
      { name: 'Networking', progress: 30, modules: ['VPC', 'Route53', 'CloudFront'] },
    ],
  },
  {
    name: 'DevOps',
    progress: 35,
    hours: 100,
    difficulty: 'Medium' as const,
    color: 'from-red-600 to-red-400',
    domains: [
      { name: 'CI/CD', progress: 50, modules: ['Jenkins', 'GitHub Actions', 'ArgoCD'] },
      { name: 'Monitoring', progress: 30, modules: ['Prometheus', 'Grafana', 'ELK Stack'] },
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
  expanded,
  onToggle,
}: {
  pillar: (typeof pillars)[0];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer border-zinc-800 bg-zinc-900/50 transition-all hover:border-zinc-700 hover:bg-zinc-900"
      onClick={onToggle}
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-zinc-100">
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
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            )}
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
      {expanded && (
        <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
          {pillar.domains.map((domain) => (
            <div key={domain.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-zinc-300">{domain.name}</span>
                <span className="text-xs text-zinc-500">{domain.progress}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-zinc-500 transition-all"
                  style={{ width: `${domain.progress}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {domain.modules.map((mod) => (
                  <span
                    key={mod}
                    className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function RoadmapsPage() {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Learning Roadmaps</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Structured learning paths across all engineering domains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar, i) => (
            <RoadmapCard
              key={pillar.name}
              pillar={pillar}
              expanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
