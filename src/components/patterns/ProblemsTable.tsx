"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ExternalLink, CheckCircle, Circle, Trash2, Star,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Loader2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProblemDesc } from "./ProblemDesc";
import { NotesDialog } from "@/components/shared/NotesDialog";
import { AddItemDialog } from "@/components/shared/AddItemDialog";
import { CompletionDatePicker } from "@/components/shared/CompletionDatePicker";
import { cn } from "@/lib/utils";
import { useTableSync, type ItemWithId } from '@/hooks/use-table-sync';
import { buildCsv, escapeCsv } from '@/lib/export-utils';

interface ProblemItem {
  id: number;
  title: string;
  link: string;
  difficulty?: string;
}

interface ProblemsTableProps {
  patternKey?: string;
  patternName?: string;
  easy?: ProblemItem[];
  medium?: ProblemItem[];
  hard?: ProblemItem[];
  onBack: () => void;
  backLabel?: string;
}

interface ProblemWithDifficulty extends ProblemItem {
  difficulty: string;
  _difficultyOrder: number;
  isCustom?: boolean;
}

export function ProblemsTable({
  patternKey,
  patternName: propPatternName,
  easy: propEasy,
  medium: propMedium,
  hard: propHard,
  onBack,
  backLabel = "All Patterns",
}: ProblemsTableProps) {
  const patternName = propPatternName ?? patternKey ?? "";
  const isServerPaginated = !!patternKey;

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const {
    data: apiData,
    isLoading: apiLoading,
    isFetching: apiFetching,
    error: apiError,
  } = useQuery({
    queryKey: ["pattern-problems", patternKey, pagination.pageIndex, pagination.pageSize] as const,
    queryFn: async ({ queryKey: [, key, page, pageSize] }) => {
      if (!key) return null;
      const params = new URLSearchParams({ pattern: key as string, page: String((page as number) + 1), pageSize: String(pageSize) });
      const res = await fetch(`/api/patterns?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isServerPaginated,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });

  const localItems = useMemo(() => {
    const items: ItemWithId[] = [
      ...(propEasy ?? []).map((p) => ({ id: p.id, title: p.title, difficulty: "EASY", link: p.link })),
      ...(propMedium ?? []).map((p) => ({ id: p.id, title: p.title, difficulty: "MEDIUM", link: p.link })),
      ...(propHard ?? []).map((p) => ({ id: p.id, title: p.title, difficulty: "HARD", link: p.link })),
    ];
    return items;
  }, [propEasy, propMedium, propHard]);

  const {
    completedMap,
    notesMap,
    customItems,
    bookmarkMap,
    toggleCompleted,
    updateNote,
    handleAddItem,
    handleDeleteItem,
    updateCompletionDate,
    toggleBookmark,
  } = useTableSync({
    storagePrefix: patternName,
    completedStorageKey: `completed-${patternName}`,
    notesStorageKey: `notes-${patternName}`,
    customStorageKey: `${patternName}-custom-problems`,
    allItems: localItems,
  });

  interface ApiProblem {
    id: number;
    title: string;
    link: string;
    difficulty: string;
  }

  async function fetchAllProblems(patternKey: string): Promise<ProblemWithDifficulty[]> {
    const allProblems: ProblemWithDifficulty[] = [];
    let page = 1;
    const pageSize = 15;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        pattern: patternKey,
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(`/api/patterns?${params}`);
      if (!res.ok) throw new Error(`Failed to fetch problems: ${res.status}`);
      const data = await res.json();
      const problems = (data.problems ?? []).map((p: ApiProblem) => ({
        ...p,
        _difficultyOrder: p.difficulty === "EASY" ? 0 : p.difficulty === "HARD" ? 2 : 1,
      }));
      allProblems.push(...problems);
      hasMore = problems.length === pageSize && page < (data.totalPages ?? 1);
      page++;
    }
    return allProblems;
  }

  function buildProblemsJSON(
    patternKey: string,
    patternName: string,
    description: string | null | undefined,
    problems: ProblemWithDifficulty[],
    completedMap: Record<string, string>,
    notesMap: Record<string, string>,
    bookmarkMap: Record<string, boolean>
  ) {
    const enriched = problems.map((p) => ({
      id: p.id,
      title: p.title,
      link: p.link,
      difficulty: p.difficulty,
      completed: !!completedMap[p.id],
      completedAt: completedMap[p.id] || null,
      notes: notesMap[p.id] || "",
      bookmarked: !!bookmarkMap[p.id],
    }));
    const solved = enriched.filter((p) => p.completed).length;
    return {
      pattern: patternKey,
      patternName,
      description: description ?? "",
      problems: enriched,
      total: enriched.length,
      solved,
    };
  }

  function buildMarkdownChecklist(
    patternName: string,
    problems: ProblemWithDifficulty[],
    completedMap: Record<string, string>
  ): string {
    const lines = [`# ${patternName} Problems`, ""];
    for (const p of problems) {
      const done = !!completedMap[p.id];
      const checkbox = done ? "[x]" : "[ ]";
      lines.push(`- ${checkbox} ${p.title} - ${p.link} (${p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase()})`);
    }
    return lines.join("\n");
  }

  function buildProblemsCSV(
    problems: ProblemWithDifficulty[],
    completedMap: Record<string, string>,
    notesMap: Record<string, string>,
    bookmarkMap: Record<string, boolean>
  ): string {
    const header = ["#", "Title", "Link", "Difficulty", "Completed", "CompletedAt", "Notes", "Bookmarked"];
    const rows = problems.map((p, i) => [
      escapeCsv(String(i + 1)),
      escapeCsv(p.title),
      escapeCsv(p.link),
      escapeCsv(p.difficulty),
      escapeCsv(completedMap[p.id] ? "true" : "false"),
      escapeCsv(completedMap[p.id] || ""),
      escapeCsv(notesMap[p.id] || ""),
      escapeCsv(bookmarkMap[p.id] ? "true" : "false"),
    ]);
    return buildCsv(header, rows);
  }

  const apiProblems: ProblemWithDifficulty[] = useMemo(() => {
    if (!apiData?.problems) return [];
    return apiData.problems.map((p: ApiProblem) => ({
      ...p,
      _difficultyOrder: p.difficulty === "EASY" ? 0 : p.difficulty === "HARD" ? 2 : 1,
    }));
  }, [apiData]);

  const allProblems = useMemo(() => {
    if (isServerPaginated) return apiProblems;
    const labeled: ProblemWithDifficulty[] = [
      ...(propEasy ?? []).map((p) => ({ ...p, difficulty: "EASY", _difficultyOrder: 0 })),
      ...(propMedium ?? []).map((p) => ({ ...p, difficulty: "MEDIUM", _difficultyOrder: 1 })),
      ...(propHard ?? []).map((p) => ({ ...p, difficulty: "HARD", _difficultyOrder: 2 })),
      ...customItems.map((p) => ({
        id: p.id,
        title: p.title,
        link: p.link || '',
        difficulty: p.difficulty || "MEDIUM",
        _difficultyOrder: p.difficulty === "EASY" ? 0 : p.difficulty === "HARD" ? 2 : 1,
        isCustom: true,
      })),
    ];
    return labeled;
  }, [propEasy, propMedium, propHard, customItems, isServerPaginated, apiProblems]);

  const diffOrder = useMemo<Record<string, number>>(() => ({ EASY: 0, MEDIUM: 1, HARD: 2 }), []);
  const displayName = apiData?.name ?? propPatternName ?? patternKey ?? "Problems";

  const columnHelper = createColumnHelper<ProblemWithDifficulty>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "srno",
        header: "#",
        cell: (info) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {info.row.index + 1 + (isServerPaginated ? pagination.pageIndex * pagination.pageSize : 0)}
          </span>
        ),
        size: 44, minSize: 36,
      }),
      columnHelper.display({
        id: "done",
        header: "Done",
        cell: (info) => {
          const id = info.row.original.id;
          const done = !!completedMap[id];
          return (
            <button onClick={() => toggleCompleted(id, info.row.original.title)}
              className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {done ? <CheckCircle size={16} className="text-emerald-500" /> : <Circle size={16} strokeWidth={1.5} />}
            </button>
          );
        },
        size: 36, minSize: 32,
      }),
      columnHelper.display({
        id: "bookmark",
        header: "Bookmark",
        cell: (info) => {
          const id = info.row.original.id;
          const isBookmarked = !!bookmarkMap[id];
          return (
            <button onClick={() => toggleBookmark(id)}
              className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              title={isBookmarked ? "Remove bookmark" : "Bookmark this problem"}
            >
              <Star size={16} strokeWidth={1.5}
                className={cn("transition-colors", isBookmarked && "fill-amber-400 text-amber-400")} />
            </button>
          );
        },
        size: 44, minSize: 36,
      }),
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => {
          const id = info.row.original.id;
          const done = !!completedMap[id];
          const isCustom = info.row.original.isCustom;
          return (
            <div className="flex items-center justify-between gap-4 text-left">
              <span className={cn("text-sm transition-all", done ? "text-muted-foreground line-through" : "text-foreground")}>
                {info.getValue()}
              </span>
              {isCustom && (
                <button onClick={() => handleDeleteItem(id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800 shrink-0" title="Delete">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        },
        size: 240, minSize: 100,
      }),
      columnHelper.display({
        id: "pattern",
        header: "Pattern",
        cell: () => (
          <span className="text-[11px] text-muted-foreground truncate max-w-[120px] inline-block">{displayName}</span>
        ),
        size: 100, minSize: 60,
      }),
      columnHelper.display({
        id: "desc",
        header: "Desc",
        cell: (info) => {
          const link = info.row.original.link;
          const slug = link.replace("https://leetcode.com/problems/", "").replace("/", "");
          return <ProblemDesc slug={slug} />;
        },
        size: 60, minSize: 52,
      }),
      columnHelper.display({
        id: "notes",
        header: "Notes",
        cell: (info) => {
          const id = info.row.original.id;
          const val = notesMap[id] ?? "";
          return <NotesDialog id={id} initialValue={val} onSave={updateNote} />;
        },
        size: 120, minSize: 60,
      }),
      columnHelper.accessor("difficulty", {
        header: "Difficulty",
        sortingFn: (rowA, rowB) => (diffOrder[rowA.original.difficulty] ?? 0) - (diffOrder[rowB.original.difficulty] ?? 0),
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className={cn(
              "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
              val === "EASY" && "bg-emerald-500/15 text-emerald-400",
              val === "MEDIUM" && "bg-amber-500/15 text-amber-400",
              val === "HARD" && "bg-red-500/15 text-red-400"
            )}>
              {val.charAt(0) + val.slice(1).toLowerCase()}
            </span>
          );
        },
        size: 88, minSize: 72,
      }),
      columnHelper.display({
        id: "completedAt",
        header: "Completed",
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
        size: 135, minSize: 110,
      }),
      columnHelper.display({
        id: "link",
        header: "Link",
        cell: (info) => (
          <a href={info.row.original.link} target="_blank" rel="noopener noreferrer"
            title={info.row.original.title}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
          </a>
        ),
        size: 40, minSize: 36,
      }),
    ],
    [columnHelper, completedMap, toggleCompleted, notesMap, updateNote, handleDeleteItem, isServerPaginated, pagination.pageIndex, pagination.pageSize, displayName, diffOrder, updateCompletionDate, bookmarkMap, toggleBookmark]
  );

  const tableDisplayData = bookmarkedOnly
    ? allProblems.filter((p) => bookmarkMap[p.id])
    : allProblems;
  const table = useReactTable({
    data: tableDisplayData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(isServerPaginated
      ? { manualPagination: true, pageCount: apiData?.totalPages ?? -1 }
      : { getPaginationRowModel: getPaginationRowModel() }),
    enableSortingRemoval: false,
  });

  const solvedCount = useMemo(
    () => allProblems.filter((p) => completedMap[p.id]).length,
    [allProblems, completedMap]
  );

  const displayTotal = isServerPaginated ? (apiData?.total ?? 0) : allProblems.length;
  const isLoading = isServerPaginated && apiLoading;
  const isFetching = isServerPaginated && apiFetching;
  const hasError = isServerPaginated && apiError;

  return (
    <div className='mt-10'>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onBack}
          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </button>
        <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {solvedCount}/{displayTotal} solved
          {isFetching && <Loader2 className="inline ml-1 h-3 w-3 animate-spin" />}
        </span>
        {!isServerPaginated && <AddItemDialog onAdd={handleAddItem} itemLabel="Problem" titlePlaceholder="e.g. Merge K Sorted Lists" linkPlaceholder="e.g. https://leetcode.com/problems/..." />}
        <button onClick={() => setBookmarkedOnly((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors shrink-0",
            bookmarkedOnly
              ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
          title="Show only bookmarked problems"
        >
          <Star size={13} className={cn(bookmarkedOnly && "fill-amber-400")} />
          Bookmarked
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border relative">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/50">
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <button onClick={header.column.getToggleSortingHandler()}
                        className={cn("mx-auto flex items-center gap-1", header.column.getCanSort() && "cursor-pointer select-none")}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " \u2191", desc: " \u2193" }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence>
              {isLoading ? (
                <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <p className="text-sm">Loading problems...</p>
                    </div>
                  </td>
                </motion.tr>
              ) : hasError ? (
                <motion.tr key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 text-red-400" />
                      <p className="text-sm text-red-400">Failed to load</p>
                      <button onClick={() => setPagination((p) => ({ ...p }))} className="text-xs text-primary hover:underline">Retry</button>
                    </div>
                  </td>
                </motion.tr>
              ) : allProblems.length === 0 ? (
                <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={columns.length} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm">No problems found</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                table.getRowModel().rows.map((row, i) => {
                  const done = !!completedMap[row.original.id];
                  return (
                    <motion.tr key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03, ease: "easeOut" }}
                      className={cn("border-b border-border transition-colors last:border-0", done ? "bg-muted/20" : "hover:bg-muted/30")}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="overflow-hidden px-3 py-2 text-center" style={{ width: cell.column.getSize() }}>
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

      {allProblems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 mt-3 border border-border rounded-lg bg-muted/20 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs">
            <span>Showing</span>
            <span className="font-semibold text-foreground">{pagination.pageIndex * pagination.pageSize + 1}</span>
            <span>to</span>
            <span className="font-semibold text-foreground">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, displayTotal)}</span>
            <span>of</span>
            <span className="font-semibold text-foreground">{displayTotal}</span>
            <span>problems</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs">Show</span>
              <select value={pagination.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="bg-background border border-border text-foreground text-xs rounded px-2 py-1 focus:outline-none focus:border-primary/50 transition-colors">
                {[10, 20, 30, 50].map((size) => (<option key={size} value={size}>{size}</option>))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="First">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs px-2 select-none">
                Page <strong className="text-foreground font-semibold">{pagination.pageIndex + 1}</strong> of{' '}
                <strong className="text-foreground font-semibold">
                  {isServerPaginated ? apiData?.totalPages : table.getPageCount()}
                </strong>
              </span>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => table.setPageIndex(isServerPaginated ? (apiData?.totalPages ?? 1) - 1 : table.getPageCount() - 1)} disabled={!table.getCanNextPage()}
                className="p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors" title="Last">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
