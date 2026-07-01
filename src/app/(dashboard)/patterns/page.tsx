"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
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
  ChevronsLeft, ChevronsRight, AlertCircle, ListOrdered, Info
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/toast";

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
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 15 });

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
  });

  useEffect(() => {
    if (error) toast({ variant: 'destructive', title: 'Failed to load patterns' });
  }, [error]);

  const urlPattern = searchParams.get("pattern");
  useEffect(() => {
    if (urlPattern && data && !selectedKey) {
      const found = data.patterns.find(
        (p) => p.key === urlPattern || p.name.toLowerCase().replace(/\s+/g, "-") === urlPattern
      );
      if (found) setSelectedKey(found.key);
    }
  }, [urlPattern, data, selectedKey]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [debouncedSearch]);

  const patternRows = useMemo(() => data?.patterns ?? [], [data]);

  const columnHelper = createColumnHelper<PatternRow>();

  const columns = useMemo(() => [
    columnHelper.display({
      id: "srno",
      header: "#",
      cell: (info) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {info.row.index + 1 + pagination.pageIndex * pagination.pageSize}
        </span>
      ),
      size: 44,
    }),
    columnHelper.accessor("name", {
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
    columnHelper.accessor("easy", {
      header: "Easy",
      cell: (info) => <span className="text-xs text-emerald-400 font-medium">{info.getValue()}</span>,
      size: 56,
    }),
    columnHelper.accessor("medium", {
      header: "Medium",
      cell: (info) => <span className="text-xs text-amber-400 font-medium">{info.getValue()}</span>,
      size: 64,
    }),
    columnHelper.accessor("hard", {
      header: "Hard",
      cell: (info) => <span className="text-xs text-red-400 font-medium">{info.getValue()}</span>,
      size: 56,
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => <span className="text-xs font-semibold text-foreground">{info.getValue()}</span>,
      size: 56,
    }),
  ], [columnHelper, pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data: patternRows,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? -1,
  });

  if (selectedKey) {
    return (
      <ProblemsTable
        patternKey={selectedKey}
        onBack={() => setSelectedKey(null)}
      />
    );
  }

  return (
    <div className="flex h-full mt10 flex-col p-4 md:p-6">
      <div className="mb-6">
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
        </div>
        </TooltipProvider>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `${data.total} patterns` : "Loading..."}
        </p>
      </div>

      <div className="mb-6 mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 transition-all duration-200 focus-within:border-primary/50 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patterns..."
          className="w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {isFetching && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>

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

      {/* Pagination */}
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
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
                }}
                className="bg-background border border-border text-foreground text-[10px] sm:text-xs rounded px-1.5 sm:px-2 py-1 focus:outline-none focus:border-primary/50 transition-colors"
              >
                {[10, 15, 20, 30, 50].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
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
                <strong className="text-foreground font-semibold">
                  {pagination.pageIndex + 1}
                </strong>
                <span className="hidden sm:inline">{" "}of{" "}</span>
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
