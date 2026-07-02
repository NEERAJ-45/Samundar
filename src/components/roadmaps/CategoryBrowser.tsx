'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROADMAPS } from '@/data/roadmaps';
import { cn } from '@/lib/utils';

const categoryMeta: Record<string, { href: string; color: string }> = {
  'foundation-os': { href: '/roadmaps/foundation/os', color: 'from-cyan-500/10 to-cyan-500/5' },
  'foundation-dbms': { href: '/roadmaps/foundation/dbms', color: 'from-sky-500/10 to-sky-500/5' },
  'foundation-cn': { href: '/roadmaps/foundation/cn', color: 'from-teal-500/10 to-teal-500/5' },
  'system-design-concepts': { href: '/roadmaps/system-design/concepts', color: 'from-violet-500/10 to-violet-500/5' },
  'system-design-problems': { href: '/roadmaps/system-design/problems', color: 'from-purple-500/10 to-purple-500/5' },
  'backend-java': { href: '/roadmaps/backend/java', color: 'from-orange-500/10 to-orange-500/5' },
  'backend-springboot': { href: '/roadmaps/backend/springboot', color: 'from-green-500/10 to-green-500/5' },
  'frontend-react': { href: '/roadmaps/frontend/react', color: 'from-sky-500/10 to-sky-500/5' },
  'frontend-nextjs': { href: '/roadmaps/frontend/nextjs', color: 'from-indigo-500/10 to-indigo-500/5' },
  'frontend-mfe': { href: '/roadmaps/frontend/microfrontends', color: 'from-blue-500/10 to-blue-500/5' },
  'devops-cloud-devops': { href: '/roadmaps/devops-cloud/devops', color: 'from-blue-500/10 to-blue-500/5' },
  'devops-cloud-docker': { href: '/roadmaps/devops-cloud/docker', color: 'from-cyan-500/10 to-cyan-500/5' },
  'devops-cloud-kubernetes': { href: '/roadmaps/devops-cloud/kubernetes', color: 'from-violet-500/10 to-violet-500/5' },
  'devops-cloud-aws': { href: '/roadmaps/devops-cloud/aws', color: 'from-amber-500/10 to-amber-500/5' },
  'databases-sql': { href: '/roadmaps/databases/sql', color: 'from-emerald-500/10 to-emerald-500/5' },
  'databases-nosql': { href: '/roadmaps/databases/nosql', color: 'from-green-500/10 to-green-500/5' },
  'aptitude': { href: '/roadmaps/aptitude', color: 'from-teal-500/10 to-teal-500/5' },
};

const categoryColors: Record<string, string> = {
  Foundation: 'border-cyan-500/30 bg-cyan-500/5',
  'System Design': 'border-violet-500/30 bg-violet-500/5',
  Backend: 'border-orange-500/30 bg-orange-500/5',
  Frontend: 'border-sky-500/30 bg-sky-500/5',
  DevOps: 'border-blue-500/30 bg-blue-500/5',
  Databases: 'border-emerald-500/30 bg-emerald-500/5',
  Aptitude: 'border-teal-500/30 bg-teal-500/5',
};

export default function CategoryBrowser() {
  const grouped: Record<string, typeof ROADMAPS> = {};
  for (const r of ROADMAPS) {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, roadmaps]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roadmaps.map((r) => {
              const meta = categoryMeta[r.slug];
              return (
                <Link
                  key={r.slug}
                  href={meta?.href || `#`}
                  className={cn(
                    'group rounded-lg border p-4 hover:border-zinc-600 transition-all',
                    categoryColors[r.category] || 'border-zinc-800 bg-zinc-900/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {r.title}
                    </h4>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <Clock className="h-3 w-3" />
                    <span>{r.hours}h</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 font-medium ml-1 border-zinc-700 text-zinc-500">
                      {r.difficulty}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
