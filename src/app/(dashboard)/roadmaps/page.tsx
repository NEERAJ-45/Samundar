'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazyAppear } from '@/components/shared/LazyAppear';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { ROADMAPS } from '@/data/roadmaps';

interface CategoryDisplay {
  slug: string;
  title: string;
  description: string;
  href: string;
  progress: number;
  hours: number;
  difficulty: string;
  gradient: string;
  topics: string[];
  glow: string;
  storageKeys: string[];
  total: number;
}

const CATEGORY_DISPLAY: Omit<CategoryDisplay, 'progress'>[] = [
  {
    slug: 'foundation',
    title: 'Computer Science Foundation',
    description: 'Operating Systems, Computer Networks, and Database Management Systems. Critical core knowledge for every engineer.',
    href: '/roadmaps/foundation',
    hours: 255,
    difficulty: 'Medium-Hard',
    gradient: 'from-zinc-500 via-cyan-600 to-cyan-500',
    topics: ['Operating Systems', 'Computer Networks', 'DBMS'],
    glow: 'rgba(6, 182, 212, 0.12)',
    storageKeys: ['foundation-os-completed', 'foundation-dbms-completed', 'foundation-cn-completed'],
    total: 150,
  },
  {
    slug: 'system-design',
    title: 'System Design & Architecture',
    description: 'Learn to architect highly scalable, reliable distributed systems.',
    href: '/roadmaps/system-design',
    hours: 250,
    difficulty: 'Hard',
    gradient: 'from-violet-600 via-purple-600 to-purple-500',
    topics: ['System Design', 'Distributed Systems'],
    glow: 'rgba(139, 92, 246, 0.12)',
    storageKeys: ['system-design-concepts-completed', 'system-design-problems-completed'],
    total: 100,
  },
  {
    slug: 'backend',
    title: 'Backend Development',
    description: 'Master enterprise application building using Java and the Spring Boot ecosystem.',
    href: '/roadmaps/backend',
    hours: 220,
    difficulty: 'Medium',
    gradient: 'from-orange-500 via-amber-600 to-green-500',
    topics: ['Java Core & JVM', 'Spring Boot & Microservices'],
    glow: 'rgba(249, 115, 22, 0.12)',
    storageKeys: ['backend-java-completed', 'backend-springboot-completed'],
    total: 100,
  },
  {
    slug: 'frontend',
    title: 'Frontend Development',
    description: 'Deep dive into modern web user interfaces.',
    href: '/roadmaps/frontend',
    hours: 260,
    difficulty: 'Medium-Hard',
    gradient: 'from-sky-500 via-indigo-500 to-cyan-400',
    topics: ['React Core', 'Next.js Framework', 'MicroFrontends'],
    glow: 'rgba(14, 165, 233, 0.12)',
    storageKeys: ['frontend-react-completed', 'frontend-nextjs-completed', 'frontend-mfe-completed'],
    total: 150,
  },
  {
    slug: 'devops-cloud',
    title: 'DevOps & Cloud Engineering',
    description: 'Virtualization, container orchestration, and cloud infrastructure deployment.',
    href: '/roadmaps/devops-cloud',
    hours: 390,
    difficulty: 'Medium-Hard',
    gradient: 'from-blue-500 via-violet-500 to-red-500',
    topics: ['Docker & K8s', 'AWS Cloud Services', 'CI/CD Pipelines'],
    glow: 'rgba(59, 130, 246, 0.12)',
    storageKeys: ['devops-cloud-docker-completed', 'devops-cloud-kubernetes-completed', 'devops-cloud-aws-completed', 'devops-cloud-devops-completed'],
    total: 200,
  },
  {
    slug: 'aptitude',
    title: 'Aptitude & Logical Reasoning',
    description: 'Master quantitative aptitude, logical reasoning, and data interpretation.',
    href: '/roadmaps/aptitude',
    hours: 120,
    difficulty: 'Easy-Medium',
    gradient: 'from-teal-500 via-emerald-600 to-green-400',
    topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Data Interpretation'],
    glow: 'rgba(20, 184, 166, 0.12)',
    storageKeys: ['aptitude-completed'],
    total: 50,
  },
  {
    slug: 'databases',
    title: 'Database',
    description: 'Syllabus on relational SQL database design, 50 LeetCode query problems, and distributed NoSQL storage architectures.',
    href: '/roadmaps/databases',
    hours: 180,
    difficulty: 'Medium-Hard',
    gradient: 'from-rose-500 via-purple-600 to-indigo-500',
    topics: ['SQL Relational (50)', 'NoSQL Non-Relational (50)', 'LeetCode SQL (50)'],
    glow: 'rgba(244, 63, 94, 0.12)',
    storageKeys: ['databases-sql-completed', 'databases-nosql-completed', 'completed-databases-leetcode'],
    total: 150,
  },
];

const difficultyColors: Record<string, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Easy-Medium': 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Medium-Hard': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function RoadmapsPage() {
  const [progressMap, setProgressMap] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const getCompletedCount = (storageKey: string, defaultVal: number = 0) => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return defaultVal;
        const data = JSON.parse(raw);
        return Object.keys(data).length;
      } catch {
        return defaultVal;
      }
    };

    const newProgress: Record<string, number> = {};
    CATEGORY_DISPLAY.forEach((cat) => {
      const totalCompleted = cat.storageKeys.reduce((sum, key) => sum + getCompletedCount(key), 0);
      newProgress[cat.slug] = Math.round((totalCompleted / cat.total) * 100);
    });
    setProgressMap(newProgress);
  }, []);

  const dynamicCategories: CategoryDisplay[] = React.useMemo(() => {
    return CATEGORY_DISPLAY.map((cat) => ({
      ...cat,
      progress: progressMap[cat.slug] ?? 0,
    }));
  }, [progressMap]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Learning Roadmaps
          </h1>
          <p className="text-base text-muted-foreground mt-2 max-w-2xl">
            Structured learning paths designed to take you from fundamentals to advanced engineering concepts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dynamicCategories.map((category, index) => (
            <LazyAppear
              key={category.title}
              delay={index * 0.08}
              yOffset={15}
            >
              <Link href={category.href} className="group block">
                <SpotlightCard className="h-full hover:border-zinc-700/80 transition-all duration-350" spotlightColor={category.glow}>
                  <div className="flex flex-col justify-between h-full space-y-6">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-zinc-150 group-hover:text-white transition-colors duration-200">
                          {category.title}
                        </h3>
                        <Badge variant="outline" className={cn('text-xs capitalize font-semibold border', difficultyColors[category.difficulty])}>
                          {category.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm text-zinc-450 leading-relaxed min-h-[72px]">
                        {category.description}
                      </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </Link>
            </LazyAppear>
          ))}
        </div>
      </div>
    </div>
  );
}
