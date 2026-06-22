'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import {
  CheckCircle,
  Circle,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

interface QuestionsTableProps {
  questions: QuestionItem[];
  storagePrefix: string;
  searchPlaceholder?: string;
  defaultCompletedIds?: number[];
}

const USER_NAME = 'NEERAJ';

type CompletedMap = Record<string, string>;
type NotesMap = Record<string, string>;

const diffOrder: Record<string, number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

export default function QuestionsTable({
  questions,
  storagePrefix,
  searchPlaceholder = 'Search topics...',
  defaultCompletedIds = [],
}: QuestionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [notesMap, setNotesMap] = useState<NotesMap>({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const loadData = useCallback(<T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(`${storagePrefix}-${key}`);
      if (!raw) {
        if (key === 'completed' && defaultCompletedIds.length > 0) {
          const initialMap: Record<string, string> = {};
          const timestamp = new Date().toISOString();
          defaultCompletedIds.forEach((id) => {
            initialMap[String(id)] = timestamp;
          });
          localStorage.setItem(`${storagePrefix}-${key}`, JSON.stringify(initialMap));
          return initialMap as unknown as T;
        }
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }, [storagePrefix, defaultCompletedIds]);

  const saveData = useCallback(<T,>(key: string, data: T) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${storagePrefix}-${key}`, JSON.stringify(data));
  }, [storagePrefix]);

  useEffect(() => {
    setCompletedMap(loadData<CompletedMap>('completed', {}));
    setNotesMap(loadData<NotesMap>('notes', {}));
    setMounted(true);
  }, [loadData]);

  const toggleCompleted = useCallback((id: number) => {
    setCompletedMap((prev) => {
      const key = String(id);
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = new Date().toISOString();
      }
      saveData('completed', next);
      return next;
    });
  }, [saveData]);

  const updateNote = useCallback((id: number, value: string) => {
    setNotesMap((prev) => {
      const key = String(id);
      const next = { ...prev, [key]: value };
      if (!value) delete next[key];
      saveData('notes', next);
      return next;
    });
  }, [saveData]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [questions, search]);

  const columnHelper = createColumnHelper<QuestionItem>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'srno',
        header: '#',
        cell: (info) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {info.row.index + 1}
          </span>
        ),
        size: 44,
        minSize: 36,
      }),
      columnHelper.display({
        id: 'done',
        header: 'Done',
        cell: (info) => {
          const id = info.row.original.id;
          const done = !!completedMap[id];
          return (
            <button
              onClick={() => toggleCompleted(id)}
              className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {done ? (
                <CheckCircle size={16} className="text-emerald-500" />
              ) : (
                <Circle size={16} strokeWidth={1.5} />
              )}
            </button>
          );
        },
        size: 36,
        minSize: 32,
      }),
      columnHelper.accessor('title', {
        header: 'Question/Topic',
        cell: (info) => {
          const id = info.row.original.id;
          const done = !!completedMap[id];
          const link = info.row.original.link;
          return (
            <div className="flex items-center justify-between gap-4">
              <span
                className={cn(
                  'text-sm transition-all font-medium',
                  done ? 'text-zinc-500 line-through' : 'text-zinc-200'
                )}
              >
                {info.getValue()}
              </span>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center text-zinc-500 hover:text-primary transition-colors p-1 rounded hover:bg-zinc-800 shrink-0"
                title="View Article"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          );
        },
        size: 400,
        minSize: 180,
      }),
      columnHelper.display({
        id: 'notes',
        header: 'My Notes',
        cell: (info) => {
          const id = info.row.original.id;
          const val = notesMap[id] ?? '';
          return (
            <input
              value={val}
              onChange={(e) => updateNote(id, e.target.value)}
              placeholder="Add key notes..."
              className="w-full bg-zinc-800/40 border border-zinc-700/30 rounded px-2 py-1 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors"
            />
          );
        },
        size: 180,
        minSize: 100,
      }),
      columnHelper.accessor('difficulty', {
        header: 'Difficulty',
        sortingFn: (rowA, rowB) => {
          const a = diffOrder[rowA.original.difficulty] ?? 0;
          const b = diffOrder[rowB.original.difficulty] ?? 0;
          return a - b;
        },
        cell: (info) => {
          const val = info.getValue();
          return (
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                val === 'EASY' && 'bg-emerald-500/15 text-emerald-400',
                val === 'MEDIUM' && 'bg-amber-500/15 text-amber-400',
                val === 'HARD' && 'bg-red-500/15 text-red-400'
              )}
            >
              {val.charAt(0) + val.slice(1).toLowerCase()}
            </span>
          );
        },
        size: 88,
        minSize: 72,
      }),
      columnHelper.display({
        id: 'completedAt',
        header: 'Completed On',
        cell: (info) => {
          const id = info.row.original.id;
          const dateStr = completedMap[id];
          if (!dateStr)
            return <span className="text-xs text-zinc-500">--</span>;
          const d = new Date(dateStr);
          const formatted = d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatted}
            </span>
          );
        },
        size: 110,
        minSize: 80,
      }),
    ],
    [completedMap, toggleCompleted, notesMap, updateNote]
  );

  const table = useReactTable({
    data: filteredQuestions,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSortingRemoval: false,
  });

  const solvedCount = useMemo(() => {
    if (!mounted) return 0;
    return questions.filter((q) => completedMap[q.id]).length;
  }, [completedMap, questions, mounted]);

  // Reset to first page when filtering
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Progress Card & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:max-w-md">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 transition-colors focus-within:border-primary/50 focus-within:bg-zinc-900/80">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
        </div>

        {mounted && (
          <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 px-4 py-2 rounded-lg shrink-0 self-start md:self-auto">
            <div className="text-right">
              <div className="text-xs text-zinc-500 font-medium">User Status</div>
              <div className="text-sm font-bold text-zinc-200">{USER_NAME}</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <div className="text-xs text-zinc-500 font-medium">Progress</div>
              <div className="text-sm font-bold text-emerald-400">
                {solvedCount} / {questions.length} Solved ({Math.round((solvedCount / questions.length) * 100)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/10">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-zinc-800 bg-zinc-900/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'flex items-center gap-1.5',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:text-zinc-200'
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ⇡',
                          desc: ' ⇣',
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {mounted &&
              table.getRowModel().rows.map((row) => {
                const id = row.original.id;
                const done = !!completedMap[id];
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-zinc-800/60 transition-colors last:border-0 hover:bg-zinc-900/20',
                      done && 'bg-zinc-900/10'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-2.5"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
        {mounted && filteredQuestions.length === 0 && (
          <div className="flex items-center justify-center p-8 text-sm text-zinc-500">
            No topics found matching your search.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {mounted && filteredQuestions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border border-zinc-800 rounded-lg bg-zinc-900/20 text-sm text-zinc-400">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Showing</span>
            <span className="font-semibold text-zinc-200">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            <span>to</span>
            <span className="font-semibold text-zinc-200">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredQuestions.length
              )}
            </span>
            <span>of</span>
            <span className="font-semibold text-zinc-200">{filteredQuestions.length}</span>
            <span>topics</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs">Show</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-zinc-700 transition-colors"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs px-2 select-none">
                Page <strong className="text-zinc-200 font-semibold">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                <strong className="text-zinc-200 font-semibold">{table.getPageCount()}</strong>
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
