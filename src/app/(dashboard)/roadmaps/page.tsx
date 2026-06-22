'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';

const categories = [
  {
    title: 'Computer Science Foundation',
    description: 'Operating Systems, Computer Networks, and Database Management Systems. Critical core knowledge for every engineer.',
    href: '/roadmaps/foundation',
    progress: 63,
    hours: 255,
    difficulty: 'Medium-Hard',
    color: 'from-zinc-500 via-cyan-600 to-cyan-500',
    topics: ['Operating Systems', 'Computer Networks', 'DBMS'],
  },
  {
    title: 'System Design & Architecture',
    description: 'Learn to architect highly scalable, reliable distributed systems. Covers CAP theorem, sharding, caching, and consensus protocols.',
    href: '/roadmaps/system-design',
    progress: 37,
    hours: 250,
    difficulty: 'Hard',
    color: 'from-violet-600 via-purple-600 to-purple-500',
    topics: ['System Design', 'Distributed Systems'],
  },
  {
    title: 'Backend Development',
    description: 'Master enterprise application building using Java and the Spring Boot ecosystem. Covers OOP, memory tuning, REST APIs, and microservices.',
    href: '/roadmaps/backend',
    progress: 76,
    hours: 220,
    difficulty: 'Medium',
    color: 'from-orange-500 via-amber-600 to-green-500',
    topics: ['Java Core & JVM', 'Spring Boot & Microservices'],
  },
  {
    title: 'Frontend Development',
    description: 'Deep dive into modern web user interfaces. Master React components, state management, hooks, and next-generation frameworks.',
    href: '/roadmaps/frontend',
    progress: 82,
    hours: 90,
    difficulty: 'Medium',
    color: 'from-sky-500 via-indigo-500 to-cyan-400',
    topics: ['React Core', 'Next.js & Ecosystem'],
  },
  {
    title: 'DevOps & Cloud Engineering',
    description: 'Virtualization, container orchestration, and cloud infrastructure deployment. Master Docker, Kubernetes, AWS services, and CI/CD pipelines.',
    href: '/roadmaps/devops-cloud',
    progress: 37,
    hours: 390,
    difficulty: 'Medium-Hard',
    color: 'from-blue-500 via-violet-500 to-red-500',
    topics: ['Docker & K8s', 'AWS Cloud Services', 'CI/CD Pipelines'],
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Medium-Hard': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function RoadmapsPage() {
  const [csFoundationProgress, setCsFoundationProgress] = React.useState(0);
  const [systemDesignProgress, setSystemDesignProgress] = React.useState(36);
  const [backendProgress, setBackendProgress] = React.useState(0);
  const [frontendProgress, setFrontendProgress] = React.useState(0);
  const [devopsProgress, setDevopsProgress] = React.useState(0);

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const getCompletedCount = (prefix: string, defaultVal: number = 0) => {
      try {
        const raw = localStorage.getItem(`${prefix}-completed`);
        if (!raw) return defaultVal;
        const data = JSON.parse(raw);
        return Object.keys(data).length;
      } catch {
        return defaultVal;
      }
    };

    const osCompleted = getCompletedCount('foundation-os');
    const cnCompleted = getCompletedCount('foundation-cn');
    const dbmsCompleted = getCompletedCount('foundation-dbms');
    setCsFoundationProgress(Math.round(((osCompleted + cnCompleted + dbmsCompleted) / 150) * 100));

    const sdConceptsCompleted = getCompletedCount('system-design-concepts', 37);
    const sdProblemsCompleted = getCompletedCount('system-design-problems', 0);
    setSystemDesignProgress(Math.round(((sdConceptsCompleted + sdProblemsCompleted) / 104) * 100));

    const javaCompleted = getCompletedCount('backend-java');
    const springCompleted = getCompletedCount('backend-springboot');
    setBackendProgress(Math.round(((javaCompleted + springCompleted) / 100) * 100));

    const reactCompleted = getCompletedCount('frontend-react');
    setFrontendProgress(Math.round((reactCompleted / 50) * 100));

    const dockerCompleted = getCompletedCount('devops-cloud-docker');
    const k8sCompleted = getCompletedCount('devops-cloud-kubernetes');
    const awsCompleted = getCompletedCount('devops-cloud-aws');
    const devopsCompleted = getCompletedCount('devops-cloud-devops');
    setDevopsProgress(Math.round(((dockerCompleted + k8sCompleted + awsCompleted + devopsCompleted) / 200) * 100));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const dynamicCategories = React.useMemo(() => {
    return [
      {
        ...categories[0],
        progress: csFoundationProgress,
      },
      {
        ...categories[1],
        progress: systemDesignProgress,
      },
      {
        ...categories[2],
        progress: backendProgress,
      },
      {
        ...categories[3],
        progress: frontendProgress,
      },
      {
        ...categories[4],
        progress: devopsProgress,
      },
    ];
  }, [csFoundationProgress, systemDesignProgress, backendProgress, frontendProgress, devopsProgress]);

  return (
    <div className="flex flex-col h-full bg-background">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Learning Roadmaps
          </h1>
          <p className="text-base text-muted-foreground mt-2 max-w-2xl">
            Structured learning paths designed to take you from fundamentals to advanced engineering concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dynamicCategories.map((category) => (
            <Link key={category.title} href={category.href} className="group">
              <Card className="h-full flex flex-col justify-between border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 group-hover:border-zinc-700 group-hover:bg-zinc-900/80 group-hover:shadow-lg group-hover:shadow-primary/5">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full border', difficultyColors[category.difficulty])}
                    >
                      {category.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-zinc-800/40 px-2 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{category.hours} hours estimated</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-zinc-100 group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-zinc-400 mt-2 line-clamp-3 leading-relaxed text-sm">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex flex-col gap-4 flex-grow justify-end">
                  <div className="flex flex-wrap gap-1.5 my-2">
                    {category.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center rounded-md bg-zinc-800/80 border border-zinc-700/50 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-zinc-400">Roadmap Progress</span>
                      <span className="text-xs font-bold text-zinc-200">{category.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', category.color)}
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-xs font-bold text-zinc-200 group-hover:text-primary pt-2 transition-colors">
                    <span>View Roadmap</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
