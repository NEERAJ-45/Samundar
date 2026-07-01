'use client';

import * as React from 'react';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


const pillars = [
  {
    name: 'Docker',
    slug: 'docker',
    progress: 0,
    hours: 60,
    difficulty: 'Easy' as const,
    color: 'from-blue-500 to-blue-300',
    domains: [
      { name: 'Container Basics', progress: 0, modules: ['Images', 'Containers', 'Dockerfile', 'Volumes'] },
      { name: 'Orchestration & Compose', progress: 0, modules: ['Compose', 'Networking', 'Registry'] },
    ],
  },
  {
    name: 'Kubernetes',
    slug: 'kubernetes',
    progress: 0,
    hours: 100,
    difficulty: 'Hard' as const,
    color: 'from-indigo-600 to-indigo-400',
    domains: [
      { name: 'Pods & Workloads', progress: 0, modules: ['Deployments', 'StatefulSets', 'DaemonSets'] },
      { name: 'Networking & Services', progress: 0, modules: ['Services', 'Ingress', 'CNI'] },
    ],
  },
  {
    name: 'AWS',
    slug: 'aws',
    progress: 0,
    hours: 130,
    difficulty: 'Medium' as const,
    color: 'from-amber-600 to-amber-400',
    domains: [
      { name: 'Compute & Storage', progress: 0, modules: ['EC2', 'Lambda', 'ECS', 'EKS', 'S3', 'EBS', 'RDS'] },
      { name: 'Networking & Security', progress: 0, modules: ['VPC', 'Route53', 'CloudFront', 'IAM'] },
    ],
  },
  {
    name: 'DevOps Essentials',
    slug: 'devops',
    progress: 0,
    hours: 100,
    difficulty: 'Medium' as const,
    color: 'from-red-600 to-red-400',
    domains: [
      { name: 'CI/CD Pipelines', progress: 0, modules: ['Jenkins', 'GitHub Actions', 'ArgoCD'] },
      { name: 'Monitoring & Logs', progress: 0, modules: ['Prometheus', 'Grafana', 'ELK Stack'] },
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
    <Link href={`/roadmaps/devops-cloud/${pillar.slug}`} className="block">
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
          {pillar.domains && pillar.domains.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800/50 space-y-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Domains</span>
              {pillar.domains.map((domain) => (
                <div key={domain.name} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 truncate flex-1">{domain.name}</span>
                  <div className="h-1 w-20 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full bg-indigo-650"
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

export default function DevOpsCloudRoadmapPage() {
  const [progressData, setProgressData] = React.useState({
    docker: { overall: 0, basic: 0, compose: 0 },
    kubernetes: { overall: 0, pods: 0, net: 0 },
    aws: { overall: 0, compute: 0, net: 0 },
    devops: { overall: 0, cicd: 0, mon: 0 }
  });

  const calculateProgress = React.useCallback(() => {
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

    const dockerOverall = getOverallCount('devops-cloud-docker');
    const dockerBasic = getCompletedCountInRange('devops-cloud-docker', 901, 930);
    const dockerCompose = getCompletedCountInRange('devops-cloud-docker', 931, 950);

    const k8sOverall = getOverallCount('devops-cloud-kubernetes');
    const k8sPods = getCompletedCountInRange('devops-cloud-kubernetes', 1001, 1030);
    const k8sNet = getCompletedCountInRange('devops-cloud-kubernetes', 1031, 1050);

    const awsOverall = getOverallCount('devops-cloud-aws');
    const awsCompute = getCompletedCountInRange('devops-cloud-aws', 1101, 1135);
    const awsNet = getCompletedCountInRange('devops-cloud-aws', 1136, 1150);

    const devopsOverall = getOverallCount('devops-cloud-devops');
    const devopsCicd = getCompletedCountInRange('devops-cloud-devops', 1201, 1230);
    const devopsMon = getCompletedCountInRange('devops-cloud-devops', 1231, 1250);

    setProgressData({
      docker: {
        overall: Math.round((dockerOverall / 50) * 100),
        basic: Math.round((dockerBasic / 30) * 100),
        compose: Math.round((dockerCompose / 20) * 100),
      },
      kubernetes: {
        overall: Math.round((k8sOverall / 50) * 100),
        pods: Math.round((k8sPods / 30) * 100),
        net: Math.round((k8sNet / 20) * 100),
      },
      aws: {
        overall: Math.round((awsOverall / 50) * 100),
        compute: Math.round((awsCompute / 35) * 100),
        net: Math.round((awsNet / 15) * 100),
      },
      devops: {
        overall: Math.round((devopsOverall / 50) * 100),
        cicd: Math.round((devopsCicd / 30) * 100),
        mon: Math.round((devopsMon / 20) * 100),
      }
    });
  }, []);

  React.useEffect(() => {
    calculateProgress();

    try {
      const bc = new BroadcastChannel('roadmap-progress');
      bc.onmessage = calculateProgress;
      return () => bc.close();
    } catch {
      return;
    }
  }, [calculateProgress]);

  const dynamicPillars = React.useMemo(() => {
    return [
      {
        ...pillars[0],
        progress: progressData.docker.overall,
        domains: [
          { ...pillars[0].domains[0], progress: progressData.docker.basic },
          { ...pillars[0].domains[1], progress: progressData.docker.compose },
        ]
      },
      {
        ...pillars[1],
        progress: progressData.kubernetes.overall,
        domains: [
          { ...pillars[1].domains[0], progress: progressData.kubernetes.pods },
          { ...pillars[1].domains[1], progress: progressData.kubernetes.net },
        ]
      },
      {
        ...pillars[2],
        progress: progressData.aws.overall,
        domains: [
          { ...pillars[2].domains[0], progress: progressData.aws.compute },
          { ...pillars[2].domains[1], progress: progressData.aws.net },
        ]
      },
      {
        ...pillars[3],
        progress: progressData.devops.overall,
        domains: [
          { ...pillars[3].domains[0], progress: progressData.devops.cicd },
          { ...pillars[3].domains[1], progress: progressData.devops.mon },
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">DevOps & Cloud</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Master virtualization, orchestration, cloud services, and automation pipelines.
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
