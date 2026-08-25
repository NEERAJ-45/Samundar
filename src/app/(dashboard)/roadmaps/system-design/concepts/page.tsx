'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Clipboard, CheckCircle2, Circle, ChevronUp, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import groups from '../../../../../../samundar-data/system-design-checklist';
import { buildCsv, escapeCsv, copyToClipboard } from '@/lib/export-utils';
import { loadLocalData, saveLocalData } from '@/hooks/use-table-sync';
import { useProfile } from '@/components/providers/ProfileProvider';

// ponytail: same key QuestionsTable derives from storagePrefix "system-design-concepts"
const COMPLETED_KEY = 'system-design-concepts-completed';

export default function SystemDesignConceptsPage() {
  const router = useRouter();
  const { userEmail, customDbUrl } = useProfile();
  const [completedMap, setCompletedMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCompletedMap(loadLocalData<Record<string, string>>(COMPLETED_KEY, {}));
  }, []);

  const allIds = groups.flatMap((group) => group.items.map((item) => item.id));
  const allDone = allIds.every((id) => completedMap[String(id)]);

  const rows = groups.map((group, idx) => {
    const done = group.items.filter((item) => completedMap[String(item.id)]).length;
    const progress = group.items.length ? Math.round((done / group.items.length) * 100) : 0;
    return { group, idx, done, progress };
  });

  type SortKey = 'idx' | 'title' | 'topics' | 'done' | 'progress';
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'idx', dir: 'asc' });

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));

  const sortedRows = useMemo(() => {
    const val: Record<SortKey, (r: (typeof rows)[number]) => string | number> = {
      idx: (r) => r.idx,
      title: (r) => r.group.title.toLowerCase(),
      topics: (r) => r.group.items.length,
      done: (r) => r.done,
      progress: (r) => r.progress,
    };
    return [...rows].filter(({ group }) => {
      const q = search.trim().toLowerCase();
      return !q || group.title.toLowerCase().includes(q) || group.items.some((item) => item.text.toLowerCase().includes(q));
    }).sort((a, b) => {
      const va = val[sort.key](a);
      const vb = val[sort.key](b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, sort.key, sort.dir]);

  const setTopicsDone = (items: { id: number }[], doneState: boolean) => {
    const current = loadLocalData<Record<string, string>>(COMPLETED_KEY, {});
    const next = { ...current };
    const changed: { id: string; completedAt?: string }[] = [];
    items.forEach(({ id }) => {
      const key = String(id);
      if (doneState && !next[key]) {
        next[key] = new Date().toISOString();
        changed.push({ id: key, completedAt: next[key] });
      } else if (!doneState && next[key]) {
        delete next[key];
        changed.push({ id: key });
      }
    });
    if (!changed.length) return;
    saveLocalData(COMPLETED_KEY, next);
    setCompletedMap(next);
    try {
      const bc = new BroadcastChannel('roadmap-progress');
      bc.postMessage({ storagePrefix: 'system-design-concepts', key: 'completed' });
      bc.close();
    } catch {}
    // best-effort DB sync, same fire-and-forget pattern as use-table-sync
    if (!userEmail) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-email': userEmail };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
    changed.forEach(({ id, completedAt }) => {
      fetch('/api/db/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ storagePrefix: COMPLETED_KEY, itemId: id, completedAt, userEmail }),
      }).catch(() => {});
    });
  };

  return (
    <div className="flex flex-col h-full ">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <Link
          href="/roadmaps/system-design"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to System Design Dashboard
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">System Design Concepts</h1>
            <p className="text-sm text-zinc-500 mt-1">Complete coverage across all system design areas</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 focus-within:border-zinc-600 transition-colors">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups or topics..."
                className="flex-1 min-w-0 w-44 md:w-56 bg-transparent py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>
            <button
              onClick={copyFullHierarchy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700/50 text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors"
            >
              <Clipboard size={13} />
              Copy Full Hierarchy CSV
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="px-3 py-2.5 w-12">
                  <button
                    onClick={() => setTopicsDone(groups.flatMap((g) => g.items), !allDone)}
                    title={allDone ? 'Uncheck all topics' : 'Check all topics'}
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {allDone ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4" />}
                  </button>
                </th>
                {([
                  ['idx', '#', 'text-left w-10'],
                  ['title', 'Group', 'text-left'],
                  ['topics', 'Topics', 'text-center w-20'],
                  ['done', 'Done', 'text-center w-16'],
                  ['progress', 'Progress', 'text-left w-48'],
                ] as [SortKey, string, string][]).map(([key, label, align]) => (
                  <th key={key} className={`px-4 py-2.5 ${align}`}>
                    <button
                      onClick={() => toggleSort(key)}
                      className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-200 font-semibold transition-colors"
                    >
                      {label}
                      {sort.key === key &&
                        (sort.dir === 'asc' ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />)}
                    </button>
                  </th>
                ))}
                <th className="w-10" aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(({ group, idx, done, progress }) => {
                const groupDone = done === group.items.length && group.items.length > 0;
                return (
                  <tr
                    key={group.title}
                    onClick={() => router.push(`/roadmaps/system-design/concepts/group/${idx + 1}`)}
                    className="border-b border-zinc-800/60 last:border-b-0 cursor-pointer transition-colors hover:bg-zinc-900/50 group"
                  >
                    <td className="px-3 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTopicsDone(group.items, !groupDone);
                        }}
                        title={groupDone ? `Uncheck all ${group.title} topics` : `Check all ${group.title} topics`}
                        className="p-1 rounded text-zinc-600 hover:text-zinc-200 transition-colors shrink-0"
                      >
                        {groupDone ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-200">
                        <Link
                          href={`/roadmaps/system-design/concepts/group/${idx + 1}`}
                          className="hover:text-white transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {group.title}
                        </Link>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-zinc-400">{group.items.length}</td>
                    <td className="px-4 py-3 text-center text-xs">
                      <span className={groupDone ? 'text-emerald-400 font-medium' : 'text-zinc-400'}>{done}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-zinc-300 w-9 text-right">{progress}%</span>
                      </div>
                    </td>
                    <td className="pr-4">
                      <ArrowRight className="h-4 w-4 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  function copyFullHierarchy() {
    const completed = loadLocalData<Record<string, string>>(COMPLETED_KEY, {});
    const header = ['Group', 'Topic', 'Status'];
    const csvRows = groups.flatMap((group) =>
      group.items.map((item) => [
        escapeCsv(group.title),
        escapeCsv('\u21B3 '.repeat(item.depth) + item.text),
        completed[String(item.id)] ? 'Done' : 'Pending',
      ])
    );
    copyToClipboard(buildCsv(header, csvRows), 'Concepts full hierarchy CSV');
  }
}
