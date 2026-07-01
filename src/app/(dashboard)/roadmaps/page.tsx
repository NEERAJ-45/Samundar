'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazyAppear } from '@/components/shared/LazyAppear';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

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
    glow: 'rgba(6, 182, 212, 0.12)'
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
    glow: 'rgba(139, 92, 246, 0.12)'
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
    glow: 'rgba(249, 115, 22, 0.12)'
  },
  {
    title: 'Frontend Development',
    description: 'Deep dive into modern web user interfaces. Master React components, hooks, Next.js framework, and federated MicroFrontends architectures.',
    href: '/roadmaps/frontend',
    progress: 82,
    hours: 260,
    difficulty: 'Medium-Hard',
    color: 'from-sky-500 via-indigo-500 to-cyan-400',
    topics: ['React Core', 'Next.js Framework', 'MicroFrontends'],
    glow: 'rgba(14, 165, 233, 0.12)'
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
    glow: 'rgba(59, 130, 246, 0.12)'
  },
  {
    title: 'Aptitude & Logical Reasoning',
    description: 'Master quantitative aptitude, logical reasoning, and data interpretation. Crucial for technical assessments, problem solving, and cognitive evaluations.',
    href: '/roadmaps/aptitude',
    progress: 0,
    hours: 120,
    difficulty: 'Easy-Medium',
    color: 'from-teal-500 via-emerald-600 to-green-400',
    topics: ['Quantitative Aptitude', 'Logical Reasoning', 'Data Interpretation'],
    glow: 'rgba(20, 184, 166, 0.12)'
  },
  {
    title: 'Database',
    description: 'Syllabus on relational SQL database design, 50 LeetCode query problems, and distributed NoSQL storage architectures.',
    href: '/roadmaps/databases',
    progress: 0,
    hours: 180,
    difficulty: 'Medium-Hard',
    color: 'from-rose-500 via-purple-600 to-indigo-500',
    topics: ['SQL Relational (50)', 'NoSQL Non-Relational (50)', 'LeetCode SQL (50)'],
    glow: 'rgba(244, 63, 94, 0.12)'
  },
  {
    title: 'ORMs & Hibernate',
    description: 'Master object-relational mapping across three paradigms: Java Hibernate (JPA), TypeScript Prisma (schema-first), and Drizzle (SQL-first).',
    href: '/roadmaps/orms',
    progress: 0,
    hours: 300,
    difficulty: 'Medium-Hard',
    color: 'from-emerald-500 via-teal-500 to-cyan-400',
    topics: ['Hibernate (JPA)', 'Prisma', 'Drizzle'],
    glow: 'rgba(20, 184, 166, 0.12)'
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
  const [csFoundationProgress, setCsFoundationProgress] = React.useState(0);
  const [systemDesignProgress, setSystemDesignProgress] = React.useState(36);
  const [backendProgress, setBackendProgress] = React.useState(0);
  const [frontendProgress, setFrontendProgress] = React.useState(0);
  const [devopsProgress, setDevopsProgress] = React.useState(0);
  const [aptitudeProgress, setAptitudeProgress] = React.useState(0);
  const [dbProgress, setDbProgress] = React.useState(0);
  const [ormsProgress, setOrmsProgress] = React.useState(0);

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
    const nextjsCompleted = getCompletedCount('frontend-nextjs');
    const mfeCompleted = getCompletedCount('frontend-mfe');
    setFrontendProgress(Math.round(((reactCompleted + nextjsCompleted + mfeCompleted) / 150) * 100));

    const dockerCompleted = getCompletedCount('devops-cloud-docker');
    const k8sCompleted = getCompletedCount('devops-cloud-kubernetes');
    const awsCompleted = getCompletedCount('devops-cloud-aws');
    const devopsCompleted = getCompletedCount('devops-cloud-devops');
    setDevopsProgress(Math.round(((dockerCompleted + k8sCompleted + awsCompleted + devopsCompleted) / 200) * 100));

    const aptitudeCompleted = getCompletedCount('aptitude');
    setAptitudeProgress(Math.round((aptitudeCompleted / 50) * 100));

    const sqlTheoryCompleted = getCompletedCount('databases-sql');
    const nosqlTheoryCompleted = getCompletedCount('databases-nosql');
    const sqlLeetcodeCompleted = getCompletedCount('databases-leetcode');
    const totalDbCompleted = sqlTheoryCompleted + nosqlTheoryCompleted + sqlLeetcodeCompleted;
    setDbProgress(Math.round((totalDbCompleted / 150) * 100));

    const hibernateCompleted = getCompletedCount('orms-hibernate');
    const prismaCompleted = getCompletedCount('orms-prisma');
    const drizzleCompleted = getCompletedCount('orms-drizzle');
    const totalOrmsCompleted = hibernateCompleted + prismaCompleted + drizzleCompleted;
    setOrmsProgress(Math.round((totalOrmsCompleted / 150) * 100));
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
      {
        ...categories[5],
        progress: aptitudeProgress,
      },
      {
        ...categories[6],
        progress: dbProgress,
      },
      {
        ...categories[7],
        progress: ormsProgress,
      },
    ];
  }, [csFoundationProgress, systemDesignProgress, backendProgress, frontendProgress, devopsProgress, aptitudeProgress, dbProgress, ormsProgress]);

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
