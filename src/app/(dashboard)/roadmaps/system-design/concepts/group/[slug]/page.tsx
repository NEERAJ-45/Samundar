'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import groups from '../../../../../../../../samundar-data/system-design-checklist';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading topics...</p>
    </div>
  ),
});

export default function GroupDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const idx = parseInt(slug, 10);
  const group = !isNaN(idx) && idx >= 1 && idx <= groups.length ? groups[idx - 1] : null;

  if (!group) {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {group.title}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{group.items.length} topics</p>
          </div>
        </div>

        <QuestionsTable
          questions={questions}
          storagePrefix="system-design-concepts"
          searchPlaceholder={`Search ${group.title.toLowerCase()}...`}
          sourceName={group.title}
        />
      </div>
    </div>
  );
}
