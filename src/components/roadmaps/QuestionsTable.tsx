'use client';

import { useMemo, useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
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
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Loader2,
  ListOrdered,
  RotateCcw,
  ExternalLink,
  Download,
  Clipboard,
  Bookmark,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotesDialog } from '@/components/shared/NotesDialog';
import { AddItemDialog } from '@/components/shared/AddItemDialog';
import { CompletionDatePicker } from '@/components/shared/CompletionDatePicker';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useTableSync } from '@/hooks/use-table-sync';
import { buildCsv, copyToClipboard } from '@/lib/export-utils';

export interface QuestionItem {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  link: string;
  isCustom?: boolean;
}

interface QuestionsTableProps {
  questions: QuestionItem[];
  storagePrefix: string;
  searchPlaceholder?: string;
  defaultCompletedIds?: number[];
  sourceName?: string;
}

export function useDefaultCompletedIds(ids?: number[]) {
  return ids ?? [];
}

const diffOrder: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };

export default function QuestionsTable({
  questions,
  storagePrefix,
  searchPlaceholder = 'Search topics...',
  defaultCompletedIds = [],
}: QuestionsTableProps) {
  const mounted = useMounted();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const allBaseItems = useMemo(() => questions, [questions]);

  const {
    completedMap,
    notesMap,
    customItems,
    bookmarkMap,
    toggleCompleted,
    updateNote,
    handleAddItem,
    handleDeleteItem,
    resetAll,
    updateCompletionDate,
    toggleBookmark,
  } = useTableSync({
    storagePrefix,
    allItems: allBaseItems,
    defaultCompletedIds,
  });

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const filteredQuestions = useMemo(() => {
    const all = [...questions, ...customItems] as QuestionItem[];
    return all.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) &&
      (!bookmarkedOnly || bookmarkMap[q.id])
    );
  }, [questions, customItems, search, bookmarkedOnly, bookmarkMap]);

  const columnHelper = createColumnHelper<QuestionItem>();

  const columns = useMemo(
    () => {
      const cols = [
        columnHelper.display({
          id: 'srno',
          header: '#',
          cell: (info) => (
            <span className="text-xs text-muted-foreground tabular-nums">
              {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}
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
        columnHelper.display({
          id: 'bookmark',
          header: 'Bookmark',
          cell: (info) => {
            const id = info.row.original.id;
            const isBookmarked = !!bookmarkMap[id];
            return (
              <button
                onClick={() => toggleBookmark(id)}
                className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
              >
                <Bookmark
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors',
                    isBookmarked && 'fill-amber-400 text-amber-400'
                  )}
                />
              </button>
            );
          },
          size: 44,
          minSize: 36,
        }),
        columnHelper.accessor('title', {
          header: 'Question/Topic',
          cell: (info) => {
            const id = info.row.original.id;
            const done = !!completedMap[id];
            const isCustom = info.row.original.isCustom;
            return (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'text-sm transition-all font-medium truncate',
                      done ? 'text-zinc-500 line-through' : 'text-zinc-200'
                    )}
                  >
                    {info.getValue()}
                  </span>
                </div>
                {isCustom && (
                  <button
                    onClick={() => handleDeleteItem(id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800 shrink-0"
                    title="Delete Custom Topic"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          },
          size: 320,
          minSize: 160,
        }),
      ];

      cols.push(
        columnHelper.display({
          id: 'open',
          header: 'Open',
          cell: (info) => {
            const link = info.row.original.link;
            if (!link) return null;
            return (
              <a
                href={link}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-blue-400 bg-blue-950/40 border border-blue-800/40 rounded hover:bg-blue-950/60 transition-colors"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            );
          },
          size: 80,
          minSize: 70,
        }),
        columnHelper.display({
          id: 'notes',
          header: 'My Notes',
          cell: (info) => {
            const id = info.row.original.id;
            const val = notesMap[id] ?? '';
            return (
              <NotesDialog id={id} initialValue={val} onSave={updateNote} />
            );
          },
          size: 140,
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
            return (
              <CompletionDatePicker
                dateStr={dateStr}
                onChange={(v) => updateCompletionDate(id, v)}
              />
            );
          },
          size: 135,
          minSize: 110,
        }),
      );
      return cols;
    },
    [columnHelper, completedMap, toggleCompleted, notesMap, updateNote, handleDeleteItem, pagination.pageIndex, pagination.pageSize, updateCompletionDate, bookmarkMap, toggleBookmark]
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

  const allExportItems = useMemo(
    () => [...questions, ...customItems] as QuestionItem[],
    [questions, customItems]
  );

  const escapeCsv = (val: string) => {
    if (/[",\n\r]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
    return val;
  };

  const handleExportCSV = () => {
    const header = '#,Question/Topic,Difficulty,Status,Notes,Link';
    const rows = allExportItems.map((q, i) => {
      const done = !!completedMap[q.id];
      const note = (notesMap[q.id] ?? '').replace(/\n/g, ' ');
      return [
        i + 1,
        escapeCsv(q.title),
        q.difficulty,
        done ? 'Done' : 'Pending',
        escapeCsv(note),
        escapeCsv(q.link),
      ].join(',');
    });
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storagePrefix}-roadmap.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCSV = () => {
    const header = ['#', 'Question/Topic', 'Difficulty', 'Status', 'Notes', 'Link'];
    const rows = allExportItems.map((q, i) => {
      const done = !!completedMap[q.id];
      const note = (notesMap[q.id] ?? '').replace(/\n/g, ' ');
      return [
        String(i + 1),
        escapeCsv(q.title),
        q.difficulty,
        done ? 'Done' : 'Pending',
        escapeCsv(note),
        escapeCsv(q.link),
      ];
    });
    copyToClipboard(buildCsv(header, rows), 'Roadmap CSV');
  };

  const handleExportText = () => {
    const lines = allExportItems.map((q, i) => {
      const done = !!completedMap[q.id];
      const note = notesMap[q.id] ?? '';
      const status = done ? '[x]' : '[ ]';
      const parts = [`${i + 1}. ${status} ${q.title}`];
      parts.push(`   Difficulty: ${q.difficulty}`);
      if (q.link) parts.push(`   Link: ${q.link}`);
      if (note) parts.push(`   Notes: ${note}`);
      return parts.join('\n');
    });
    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storagePrefix}-roadmap.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const solvedCount = useMemo(() => {
    if (!mounted) return 0;
    const all = [...questions, ...customItems] as QuestionItem[];
    return all.filter((q) => completedMap[q.id]).length;
  }, [completedMap, questions, customItems, mounted]);

  const totalCount = questions.length + customItems.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:max-w-md flex items-center gap-3">
          <div className="flex-grow flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-muted/50">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <AddItemDialog onAdd={handleAddItem} />
          <button
            onClick={() => setBookmarkedOnly((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors shrink-0',
              bookmarkedOnly
                ? 'border-amber-500/50 text-amber-400 bg-amber-500/15'
                : 'border-border text-muted-foreground bg-muted/30 hover:bg-muted/60 hover:text-foreground'
            )}
            title="Show only bookmarked topics"
          >
            <Bookmark size={13} className={cn(bookmarkedOnly && 'fill-amber-400')} />
            Bookmarked
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-red-800/40 text-red-400 bg-red-950/30 hover:bg-red-950/50 hover:border-red-700/60 transition-colors shrink-0"
            title="Reset all progress on this roadmap"
          >
            <RotateCcw size={13} />
            Reset
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border text-muted-foreground bg-muted/30 hover:bg-muted/60 hover:text-foreground transition-colors shrink-0">
                <Download size={13} />
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground min-w-[160px]">
              <DropdownMenuItem onClick={handleExportCSV} className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-zinc-100 gap-2">
                <Download size={12} /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyCSV} className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-zinc-100 gap-2">
                <Clipboard size={12} /> Copy CSV to Clipboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportText} className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-zinc-100">
                Export as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {mounted && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 bg-muted/30 border border-border px-4 py-2 rounded-lg shrink-0 self-start md:self-auto"
          >
            <div>
              <div className="text-xs text-zinc-500 font-medium">Progress</div>
              <div className="text-sm font-bold text-emerald-400">
                {solvedCount} / {totalCount} Solved ({totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%)
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-muted/10">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/40">
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
                          asc: ' \u21e1',
                          desc: ' \u21e3',
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence>
              {!mounted ? (
                <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-500">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p className="text-sm">Loading topics...</p>
                    </div>
                  </td>
                </motion.tr>
              ) : filteredQuestions.length === 0 ? (
                <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-zinc-500">
                      <ListOrdered className="h-8 w-8" />
                      <p className="text-sm">No topics found matching your search.</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                table.getRowModel().rows.map((row, i) => {
                  const id = row.original.id;
                  const done = !!completedMap[id];
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.025, ease: 'easeOut' }}
                      className={cn(
                        'border-b border-border/60 transition-colors last:border-0 hover:bg-muted/20',
                        done && 'bg-muted/10'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-2.5" style={{ width: cell.column.getSize() }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {mounted && filteredQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border border-border rounded-lg bg-muted/10 text-sm text-muted-foreground"
        >
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
            <div className="flex items-center gap-2">
              <span className="text-xs">Show</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="bg-background border border-border text-foreground text-xs rounded px-2 py-1 focus:outline-none focus:border-muted-foreground transition-colors"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="First">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs px-2 select-none">
                Page <strong className="text-zinc-200 font-semibold">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
                <strong className="text-zinc-200 font-semibold">{table.getPageCount()}</strong>
              </span>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="Last">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <RotateCcw size={18} className="text-red-400" />
              Reset Progress
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm pt-2">
              This will clear all completed topics, notes, and custom topics for this roadmap. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer">Cancel</button>
            </DialogClose>
            <button onClick={resetAll} className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer">Reset</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
