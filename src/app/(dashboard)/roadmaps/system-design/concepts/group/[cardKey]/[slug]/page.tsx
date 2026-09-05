'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import hldGroups from '../../../../../../../../../samundar-data/system-design-hld';
import lldGroups from '../../../../../../../../../samundar-data/system-design-lld';
import type { ChecklistGroup } from '../../../../../../../../../samundar-data/system-design-checklist';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading topics...</p>
    </div>
  ),
});

const DATA_SOURCES: Record<string, { groups: ChecklistGroup[]; prefix: string; label: string }> = {
  hld: { groups: hldGroups, prefix: 'system-design-hld', label: 'HLD' },
  lld: { groups: lldGroups, prefix: 'system-design-lld', label: 'LLD' },
};

export default function GroupDetailPage() {
  const params = useParams();
  const cardKey = params?.cardKey as string;
  const slug = params?.slug as string;
  const idx = parseInt(slug, 10);

  const source = DATA_SOURCES[cardKey];
  const group = source && !isNaN(idx) && idx >= 1 && idx <= source.groups.length ? source.groups[idx - 1] : null;

  if (!group || !source) {
    return (
      <div className="flex flex-col h-full ">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Link
            href="/roadmaps/system-design/concepts"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Design Concepts
          </Link>
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <p className="text-sm">Group not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const questions = group.items.map(item => ({
    id: item.id,
    title: item.text,
    difficulty: 'MEDIUM' as const,
    link: '',
  }));

  return (
    <div className="flex flex-col h-full ">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/system-design/concepts"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Design Concepts
          </Link>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">{source.label}</span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {group.title}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{group.items.length} topics</p>
          </div>
        </div>

        <QuestionsTable
          questions={questions}
          storagePrefix={source.prefix}
          searchPlaceholder={`Search ${group.title.toLowerCase()}...`}
          sourceName={group.title}
        />
      </div>
    </div>
  );
}
