'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Clipboard, CheckCircle2, Circle, ChevronUp, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import hldGroups from '../../../../../../samundar-data/system-design-hld';
import lldGroups from '../../../../../../samundar-data/system-design-lld';
import type { ChecklistGroup } from '../../../../../../samundar-data/system-design-checklist';
import { buildCsv, escapeCsv, copyToClipboard } from '@/lib/export-utils';
import { loadLocalData, saveLocalData } from '@/hooks/use-table-sync';
import { useProfile } from '@/components/providers/ProfileProvider';

type CardKey = 'hld' | 'lld';

const STORAGE_PREFIXES: Record<CardKey, string> = {
  hld: 'system-design-hld',
  lld: 'system-design-lld',
};

const CARDS: { key: CardKey; title: string; subtitle: string; groups: ChecklistGroup[] }[] = [
  { key: 'hld', title: 'High-Level Design (HLD)', subtitle: 'Architecture, infrastructure, and distributed systems', groups: hldGroups },
  { key: 'lld', title: 'Low-Level Design (LLD)', subtitle: 'OOP, SOLID, design patterns, and class-level design', groups: lldGroups },
];

export default function SystemDesignConceptsPage() {
  const router = useRouter();
  const { userEmail, customDbUrl } = useProfile();
  const [completedMaps, setCompletedMaps] = useState<Record<CardKey, Record<string, string>>>({ hld: {}, lld: {} });
  const [search, setSearch] = useState('');
  const [activeCard, setActiveCard] = useState<CardKey>('hld');
  const [csvDropdownOpen, setCsvDropdownOpen] = useState(false);
  const csvDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hld = loadLocalData<Record<string, string>>(`${STORAGE_PREFIXES.hld}-completed`, {});
    const lld = loadLocalData<Record<string, string>>(`${STORAGE_PREFIXES.lld}-completed`, {});
    setCompletedMaps({ hld, lld });

    if (!userEmail) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-email': userEmail };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;

    fetch(`/api/db/completions?userEmail=${encodeURIComponent(userEmail)}`, { headers })
      .then((r) => r.json())
      .then((data) => {
        if (!data.dbConnected) return;
        const dbItems: { storagePrefix: string; itemId: string; completedAt?: string }[] = data.data;
        setCompletedMaps((prev) => {
          const next = { ...prev };
          for (const key of ['hld', 'lld'] as CardKey[]) {
            const prefix = `${STORAGE_PREFIXES[key]}-completed`;
            const dbEntries = dbItems.filter((x) => x.storagePrefix === prefix);
            const dbMap: Record<string, string> = {};
            dbEntries.forEach((x) => { if (x.completedAt) dbMap[x.itemId] = x.completedAt; });
            const merged = { ...next[key], ...dbMap };
            next[key] = merged;
            saveLocalData(prefix, merged);
            for (const [id, dateStr] of Object.entries(next[key])) {
              if (!dbMap[id]) {
                fetch('/api/db/completions', {
                  method: 'POST', headers,
                  body: JSON.stringify({ storagePrefix: prefix, itemId: id, completedAt: dateStr, userEmail }),
                }).catch(() => {});
              }
            }
          }
          return next;
        });
      })
      .catch(() => {});
  }, [userEmail, customDbUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (csvDropdownRef.current && !csvDropdownRef.current.contains(e.target as Node)) {
        setCsvDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentGroups = CARDS.find((c) => c.key === activeCard)!.groups;
  const currentCompleted = completedMaps[activeCard];
  const currentPrefix = STORAGE_PREFIXES[activeCard];

  const allIds = currentGroups.flatMap((group) => group.items.map((item) => item.id));
  const allDone = allIds.every((id) => currentCompleted[String(id)]);

  const rows = currentGroups.map((group, idx) => {
    const done = group.items.filter((item) => currentCompleted[String(item.id)]).length;
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
  }, [rows, search, sort.key, sort.dir]);

  const setTopicsDone = (items: { id: number }[], doneState: boolean) => {
    const current = loadLocalData<Record<string, string>>(`${currentPrefix}-completed`, {});
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
    saveLocalData(`${currentPrefix}-completed`, next);
    setCompletedMaps((prev) => ({ ...prev, [activeCard]: next }));
    try {
      const bc = new BroadcastChannel('roadmap-progress');
      bc.postMessage({ storagePrefix: currentPrefix, key: 'completed' });
      bc.close();
    } catch {}
    if (!userEmail) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-email': userEmail };
    if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
    changed.forEach(({ id, completedAt }) => {
      fetch('/api/db/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ storagePrefix: `${currentPrefix}-completed`, itemId: id, completedAt, userEmail }),
      }).catch(() => {});
    });
  };

  const getCardStats = (cardKey: CardKey) => {
    const groups = CARDS.find((c) => c.key === cardKey)!.groups;
    const completed = loadLocalData<Record<string, string>>(`${STORAGE_PREFIXES[cardKey]}-completed`, {});
    const total = groups.reduce((sum, g) => sum + g.items.length, 0);
    const done = groups.reduce((sum, g) => sum + g.items.filter((i) => completed[String(i.id)]).length, 0);
    return { total, done, progress: total ? Math.round((done / total) * 100) : 0 };
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
            <p className="text-sm text-zinc-500 mt-1">Complete coverage across HLD and LLD areas</p>
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
            <div className="relative" ref={csvDropdownRef}>
              <button
                onClick={() => setCsvDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-700/50 text-zinc-300 bg-zinc-900/60 hover:bg-zinc-800/60 hover:text-zinc-100 transition-colors"
              >
                <Clipboard size={13} />
                Copy CSV
                <ChevronDown size={12} className={`transition-transform ${csvDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {csvDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl z-50 py-1">
                  <button
                    onClick={() => { copyFullHierarchy(); setCsvDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    Copy All (HLD + LLD)
                  </button>
                  <button
                    onClick={() => { copyFullHierarchy('hld'); setCsvDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    Copy HLD Only
                  </button>
                  <button
                    onClick={() => { copyFullHierarchy('lld'); setCsvDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    Copy LLD Only
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {CARDS.map((card) => {
            const stats = getCardStats(card.key);
            const isActive = activeCard === card.key;
            return (
              <button
                key={card.key}
                onClick={() => { setActiveCard(card.key); setSort({ key: 'idx', dir: 'asc' }); setSearch(''); }}
                className={`flex-1 rounded-lg border p-4 text-left transition-all ${
                  isActive
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${isActive ? 'text-indigo-300' : 'text-zinc-300'}`}>{card.title}</span>
                  <span className={`text-xs font-semibold ${stats.progress === 100 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {stats.progress}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mb-2">{card.subtitle}</p>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stats.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-600 mt-1.5">{stats.done} / {stats.total} topics</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="px-3 py-2.5 w-12">
                  <button
                    onClick={() => setTopicsDone(currentGroups.flatMap((g) => g.items), !allDone)}
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
                    onClick={() => router.push(`/roadmaps/system-design/concepts/group/${activeCard}/${idx + 1}`)}
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
                          href={`/roadmaps/system-design/concepts/group/${activeCard}/${idx + 1}`}
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

  function copyFullHierarchy(filter?: CardKey) {
    const header = ['Sr. No.', 'Category', 'Group', 'Topic', 'Status'];
    const csvRows: string[][] = [];
    const cards = filter ? CARDS.filter((c) => c.key === filter) : CARDS;
    let sr = 1;
    cards.forEach((card, cardIdx) => {
      if (cardIdx > 0) csvRows.push(['', '', '', '', '']);
      const completed = loadLocalData<Record<string, string>>(`${STORAGE_PREFIXES[card.key]}-completed`, {});
      card.groups.forEach((group) => {
        group.items.forEach((item) => {
          csvRows.push([
            String(sr++),
            escapeCsv(card.title),
            escapeCsv(group.title),
            escapeCsv('\u21B3 '.repeat(item.depth) + item.text),
            completed[String(item.id)] ? 'Done' : 'Pending',
          ]);
        });
      });
    });
    copyToClipboard(buildCsv(header, csvRows), 'Concepts hierarchy CSV');
  }
}
