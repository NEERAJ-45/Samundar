"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  PaginationState,
} from "@tanstack/react-table";
import { ProblemsTable } from "@/components/patterns/ProblemsTable";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Search, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, AlertCircle, ListOrdered, Info,
  BookOpen, GitBranch, Layers, Trash2,   Download,
  Clipboard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";
import { striverSheet, striverTotalProblems } from "@/data/striver-sheet";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCustomRoadmapsQuery, useDeleteCustomRoadmap } from "@/hooks/use-custom-roadmaps";
import { AddRoadmapDialog } from "@/components/shared/AddRoadmapDialog";
import type { QuestionItem } from "@/components/roadmaps/QuestionsTable";
import { escapeCsv, buildCsv, copyToClipboard } from "@/lib/export-utils";

const QuestionsTable = dynamic(() => import("@/components/roadmaps/QuestionsTable"), { ssr: false });

interface PatternRow {
  key: string;
  name: string;
  description?: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

interface PaginatedResponse {
  patterns: PatternRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function PatternsContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"patterns" | "striver" | "custom">("patterns");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedCustomSlug, setSelectedCustomSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

  const { data: customRoadmapsData, isLoading: customLoading } = useCustomRoadmapsQuery();
  const deleteCustomRoadmap = useDeleteCustomRoadmap();

  const customRoadmaps = useMemo(() => customRoadmapsData?.data ?? [], [customRoadmapsData]);

  const debouncedSearch = useDebounce(search, 300);

  const queryKey = ["patterns", pagination.pageIndex, pagination.pageSize, debouncedSearch] as const;

  const { data, isLoading, isFetching, error } = useQuery<PaginatedResponse>({
    queryKey,
    queryFn: async ({ queryKey: [, page, pageSize, search] }) => {
      const params = new URLSearchParams({
        page: String((page as number) + 1),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search as string);
      const res = await fetch(`/api/patterns?${params}`);
      if (!res.ok) throw new Error("Failed to fetch patterns");
      return res.json();
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    enabled: view === "patterns",
  });

  useEffect(() => {
    if (error) toast({ variant: 'destructive', title: 'Failed to load patterns' });
  }, [error]);

  const urlPattern = searchParams.get("pattern");
  useEffect(() => {
    if (urlPattern && data && !selectedKey && view === "patterns") {
      const found = data.patterns.find(
        (p) => p.key === urlPattern || p.name.toLowerCase().replace(/\s+/g, "-") === urlPattern
      );
      if (found) setSelectedKey(found.key);
    }
  }, [urlPattern, data, selectedKey, view]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const handleExportCSV = useCallback(async () => {
    try {
      const res = await fetch('/api/patterns?page=1&pageSize=100');
      const all = await res.json();
      if (!all.patterns) return;
      const header = '#,Pattern,Description,Easy,Medium,Hard,Total';
      const rows = all.patterns.map((p: PatternRow, i: number) =>
        [i + 1, escapeCsv(p.name), escapeCsv(p.description || ''), p.easy, p.medium, p.hard, p.total].join(',')
      );
      const bom = '\uFEFF';
      const blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dsa-patterns.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast({ variant: 'destructive', title: 'Export failed' }); }
  }, []);

  const handleCopyCSV = useCallback(async () => {
    try {
      const res = await fetch('/api/patterns?page=1&pageSize=100');
      const all = await res.json();
      if (!all.patterns) return;
      const header = ['#', 'Pattern', 'Description', 'Easy', 'Medium', 'Hard', 'Total'];
      const rows = all.patterns.map((p: PatternRow, i: number) => [
        String(i + 1),
        escapeCsv(p.name),
        escapeCsv(p.description || ''),
        String(p.easy),
        String(p.medium),
        String(p.hard),
        String(p.total),
      ]);
      copyToClipboard(buildCsv(header, rows), 'Patterns CSV');
    } catch { toast({ variant: 'destructive', title: 'Copy failed' }); }
  }, []);

  const handleExportText = useCallback(async () => {
    try {
      const res = await fetch('/api/patterns?page=1&pageSize=100');
      const all = await res.json();
      if (!all.patterns) return;
      const lines = all.patterns.map((p: PatternRow, i: number) => {
        const parts = [`${i + 1}. ${p.name}`];
        if (p.description) parts.push(`   ${p.description}`);
        parts.push(`   Easy: ${p.easy}  Medium: ${p.medium}  Hard: ${p.hard}  Total: ${p.total}`);
        return parts.join('\n');
      });
      const blob = new Blob([lines.join('\n\n')], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dsa-patterns.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast({ variant: 'destructive', title: 'Export failed' }); }
  }, []);

  // ---- Shared hooks (always called, not conditionally) ----
  const patternRows = useMemo(() => data?.patterns ?? [], [data]);

  const patternsColumnHelper = useMemo(() => createColumnHelper<PatternRow>(), []);

  const columns = useMemo(() => [
    patternsColumnHelper.display({
      id: "srno",
      header: "#",
      cell: (info) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}
        </span>
      ),
      size: 44,
    }),
    patternsColumnHelper.accessor("name", {
      header: "Pattern",
      cell: (info) => (
        <div className="text-left">
          <span className="font-medium text-foreground text-sm">{info.getValue()}</span>
          {info.row.original.description && (
            <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-tight line-clamp-1">
              {info.row.original.description}
            </p>
          )}
        </div>
      ),
    }),
    patternsColumnHelper.accessor("easy", {
      header: "Easy",
      cell: (info) => <span className="text-xs text-emerald-400 font-medium">{info.getValue()}</span>,
      size: 56,
    }),
    patternsColumnHelper.accessor("medium", {
      header: "Medium",
      cell: (info) => <span className="text-xs text-amber-400 font-medium">{info.getValue()}</span>,
      size: 64,
    }),
    patternsColumnHelper.accessor("hard", {
      header: "Hard",
      cell: (info) => <span className="text-xs text-red-400 font-medium">{info.getValue()}</span>,
      size: 56,
    }),
    patternsColumnHelper.accessor("total", {
      header: "Total",
      cell: (info) => <span className="text-xs font-semibold text-foreground">{info.getValue()}</span>,
      size: 56,
    }),
  ], [patternsColumnHelper, pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data: patternRows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  const filteredDays = useMemo(() => {
    if (!search.trim()) return striverSheet;
    const q = search.toLowerCase();
    return striverSheet.filter((d) =>
      d.topic.toLowerCase().includes(q) || `day ${d.day}`.includes(q)
    );
  }, [search]);

  const striverDay = view === "striver" && selectedDay
    ? striverSheet.find((d) => d.key === selectedDay) ?? null
    : null;

  const selectedCustomRoadmap = view === "custom" && selectedCustomSlug
    ? customRoadmaps.find((r) => r.slug === selectedCustomSlug) ?? null
    : null;

  // ---- Early returns for drill-downs ----
  if (striverDay) {
    return (
      <div className="flex h-full flex-col p-4 md:p-6">
        <ProblemsTable
          patternName={`striver-${striverDay.key}`}
          easy={striverDay.problems.easy}
          medium={striverDay.problems.medium}
          hard={striverDay.problems.hard}
          onBack={() => setSelectedDay(null)}
          backLabel="Striver Sheet"
        />
      </div>
    );
  }

  if (selectedKey && view === "patterns") {
    return (
      <div className="flex h-full flex-col p-4 md:p-6">
        <ProblemsTable
          patternKey={selectedKey}
          onBack={() => setSelectedKey(null)}
        />
      </div>
    );
  }

  if (selectedCustomRoadmap) {
    const questions: QuestionItem[] = selectedCustomRoadmap.questions.map((q) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      link: q.link,
    }));
    return (
      <div className="flex h-full flex-col p-4 md:p-6">
        <div className="mb-4">
          <button
            onClick={() => setSelectedCustomSlug(null)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft size={14} />
            Back to Custom
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {selectedCustomRoadmap.title}
          </h1>
          {selectedCustomRoadmap.description && (
            <p className="mt-1 text-sm text-muted-foreground">{selectedCustomRoadmap.description}</p>
          )}
        </div>
        <QuestionsTable
          questions={questions}
          storagePrefix={selectedCustomRoadmap.storageKey}
          searchPlaceholder="Search questions..."
        />
      </div>
    );
  }

  // ---- Toggle + Search bar (shared) ----
  const toggleBar = (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
        <button
          onClick={() => { setView("patterns"); setSelectedKey(null); setSelectedDay(null); }}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            view === "patterns" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitBranch className="h-3.5 w-3.5" />
          Patterns
        </button>
        <button
          onClick={() => { setView("striver"); setSelectedKey(null); setSelectedDay(null); setSearch(""); }}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            view === "striver" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Striver Sheet
        </button>
        <button
          onClick={() => { setView("custom"); setSelectedKey(null); setSelectedDay(null); setSelectedCustomSlug(null); setSearch(""); }}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            view === "custom" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          Custom
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 flex-1 max-w-xs">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={view === "patterns" ? "Search patterns..." : view === "striver" ? "Search topics..." : "Search roadmaps..."}
          className="w-full bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {isFetching && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );

  // ============================
  // PATTERNS VIEW
  // ============================
  if (view === "patterns") {
    return (
      <div className="flex h-full mt10 flex-col p-4 md:p-6">
        <div className="mb-4">
          <TooltipProvider>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              DSA Patterns
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="w-72 p-3 rounded-lg" sideOffset={8}>
                <p className="text-xs font-medium text-muted-foreground mb-2">Recommended solving order:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-xs text-foreground/80">
                  <li>Two Pointers</li>
                  <li>Binary Search</li>
                  <li>Prefix Sum</li>
                  <li>Kadane&apos;s Algorithm</li>
                  <li>Fast &amp; Slow Pointers</li>
                  <li>Linked List Reversal</li>
                  <li>Cyclic Sort</li>
                  <li>Merge Intervals</li>
                  <li>Monotonic Stack</li>
                  <li>Binary Search on Answer</li>
                  <li>Heap / Priority Queue – Top K</li>
                  <li>Two Heaps</li>
                  <li>K-way Merge</li>
                  <li>Subsets</li>
                  <li>Permutations</li>
                  <li>Combinations / Combination Sum</li>
                  <li>Backtracking</li>
                  <li>Tree DFS</li>
                  <li>Tree BFS</li>
                  <li>Lowest Common Ancestor</li>
                  <li>Trie</li>
                  <li>Graph DFS</li>
                  <li>Graph BFS</li>
                  <li>Union Find</li>
                  <li>Topological Sort</li>
                  <li>Shortest Path – Dijkstra</li>
                  <li>Minimum Spanning Tree</li>
                  <li>Greedy</li>
                  <li>Dynamic Programming – 1D</li>
                  <li>0/1 Knapsack</li>
                  <li>DP – Grid / 2D</li>
                  <li>Longest Increasing Subsequence</li>
                  <li>Longest Common Subsequence</li>
                  <li>Bit Manipulation</li>
                  <li>String Pattern Matching (KMP / Rabin-Karp)</li>
                </ol>
              </TooltipContent>
            </Tooltip>
            <div className="flex-1" />
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
          </TooltipProvider>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.total} patterns` : "Loading..."}
          </p>
        </div>

        {toggleBar}

        <div className="overflow-x-auto rounded-lg border border-border relative">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-muted/50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="relative">
              <AnimatePresence>
                {isLoading ? (
                  <motion.tr
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="px-4 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm">Loading patterns...</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : error ? (
                  <motion.tr
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="px-4 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p className="text-sm text-red-400">Failed to load patterns</p>
                        <button
                          onClick={() => setPagination((p) => ({ ...p }))}
                          className="text-xs text-primary hover:underline"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ) : patternRows.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={columns.length} className="px-4 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <ListOrdered className="h-8 w-8" />
                        <p className="text-sm">No patterns match your search</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
                      className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer last:border-0"
                      onClick={() => setSelectedKey(row.original.key)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-2.5 text-center"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {data && data.total > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 mt-4 border border-border rounded-lg bg-muted/20 text-sm text-muted-foreground">
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span>Showing</span>
              <span className="font-semibold text-foreground">
                {pagination.pageIndex * pagination.pageSize + 1}
              </span>
              <span>to</span>
              <span className="font-semibold text-foreground">
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  data.total
                )}
              </span>
              <span>of</span>
              <span className="font-semibold text-foreground">{data.total}</span>
              <span>patterns</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs">Show</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => { table.setPageSize(Number(e.target.value)); }}
                  className="bg-background border border-border text-foreground text-[10px] sm:text-xs rounded px-1.5 sm:px-2 py-1 focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {[10, 15, 20, 30, 50].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="hidden sm:inline-flex p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  title="First"
                >
                  <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  title="Previous"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <span className="text-[10px] sm:text-xs px-1 sm:px-2 select-none whitespace-nowrap">
                  <strong className="text-foreground font-semibold">{pagination.pageIndex + 1}</strong>
                  <span className="hidden sm:inline"> of </span>
                  <span className="hidden sm:inline font-semibold text-foreground">{data.totalPages}</span>
                </span>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  title="Next"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={() => table.setPageIndex(data.totalPages - 1)}
                  disabled={!table.getCanNextPage()}
                  className="hidden sm:inline-flex p-1.5 rounded border border-border bg-background hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  title="Last"
                >
                  <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================
  // STRIVER VIEW
  // ============================
  if (view === "striver") {
    const totalSolved = (() => {
      if (typeof window === "undefined") return 0;
      let solved = 0;
      for (const day of striverSheet) {
        const key = `completed-striver-${day.key}`;
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const map = JSON.parse(raw) as Record<string, string>;
            solved += Object.keys(map).length;
          }
        } catch {}
      }
      return solved;
    })();

    return (
      <div className="flex h-full mt10 flex-col p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Striver SDE Sheet
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {striverSheet.length} days &middot; {striverTotalProblems} problems &middot; {totalSolved} solved
          </p>
        </div>

        {toggleBar}

        <div className="overflow-x-auto rounded-lg border border-border relative">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center" style={{ width: 44 }}>#</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-left">Topic</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Day</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Easy</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Medium</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Hard</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredDays.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={7} className="px-4 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <ListOrdered className="h-8 w-8" />
                        <p className="text-sm">No topics match your search</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredDays.map((day, i) => {
                    const easy = day.problems.easy.length;
                    const medium = day.problems.medium.length;
                    const hard = day.problems.hard.length;
                    const total = easy + medium + hard;
                    return (
                      <motion.tr
                        key={day.key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.03, ease: "easeOut" }}
                        className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer last:border-0"
                        onClick={() => setSelectedDay(day.key)}
                      >
                        <td className="px-4 py-2.5 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                        <td className="px-4 py-2.5 text-left">
                          <span className="font-medium text-foreground text-sm">{day.topic}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">Day {day.day}</td>
                        <td className="px-4 py-2.5 text-center text-xs text-emerald-400 font-medium">{easy}</td>
                        <td className="px-4 py-2.5 text-center text-xs text-amber-400 font-medium">{medium}</td>
                        <td className="px-4 py-2.5 text-center text-xs text-red-400 font-medium">{hard}</td>
                        <td className="px-4 py-2.5 text-center text-xs font-semibold text-foreground">{total}</td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ============================
  // CUSTOM VIEW
  // ============================
  const filteredCustom = customRoadmaps.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full mt10 flex-col p-4 md:p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-foreground" />
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Custom Roadmaps
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {customRoadmaps.length} custom roadmap{customRoadmaps.length !== 1 ? 's' : ''}
            </p>
          </div>
          <AddRoadmapDialog />
        </div>
      </div>

      {toggleBar}

      {customLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredCustom.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Layers className="h-8 w-8" />
          <p className="text-sm">No custom roadmaps yet. Click &quot;Add Roadmap&quot; to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border relative">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center" style={{ width: 44 }}>#</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-left">Title</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-left">Description</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Questions</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Difficulty</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center">Hours</th>
                <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-center" style={{ width: 72 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCustom.map((roadmap, i) => (
                  <motion.tr
                    key={roadmap.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03, ease: "easeOut" }}
                    className="border-b border-border transition-colors hover:bg-muted/30 cursor-pointer last:border-0"
                    onClick={() => setSelectedCustomSlug(roadmap.slug)}
                  >
                    <td className="px-4 py-2.5 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-4 py-2.5 text-left">
                      <span className="font-medium text-foreground text-sm">{roadmap.title}</span>
                    </td>
                    <td className="px-4 py-2.5 text-left text-xs text-muted-foreground max-w-[220px] truncate">
                      {roadmap.description || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs font-semibold text-foreground">{roadmap.questions.length}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-xs font-medium text-zinc-300">{roadmap.difficulty}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">{roadmap.hours || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomSlug(roadmap.slug);
                          }}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Open"
                        >
                          <BookOpen size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this custom roadmap?')) {
                              deleteCustomRoadmap.mutate({ slug: roadmap.slug });
                            }
                          }}
                          className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PatternsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading patterns...</p>
          </div>
        </div>
      }
    >
      <PatternsContent />
    </Suspense>
  );
}
