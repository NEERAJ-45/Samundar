"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
  ArrowLeft, ExternalLink, CheckCircle, Circle, Trash2, Plus,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Loader2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProblemDesc } from "./ProblemDesc";
import { NotesDialog } from "@/components/shared/NotesDialog";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from "@/lib/utils";
import { useProfile } from "@/components/providers/ProfileProvider";
import { toast } from "@/components/ui/toast";

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

type CompletedMap = Record<string, string>;
type NotesMap = Record<string, string>;

function loadData<T>(pattern: string, key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${key}-${pattern}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveData<T>(pattern: string, key: string, data: T) {
  localStorage.setItem(`${key}-${pattern}`, JSON.stringify(data));
}

function AddProblemDialog({
  onAdd,
}: {
  onAdd: (title: string, difficulty: string, link: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty, link.trim());
    setTitle("");
    setDifficulty("MEDIUM");
    setLink("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shrink-0 ml-2">
          <Plus size={14} />
          Add Problem
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-[425px] mt-20">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Add Custom Problem
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Problem Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Merge K Sorted Lists"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-650 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-primary/50 transition-colors"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Reference Link</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. https://leetcode.com/problems/..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-655 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <button type="button" className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-zinc-850 hover:bg-zinc-900 transition-colors text-zinc-400 cursor-pointer">
                Cancel
              </button>
            </DialogClose>
            <button type="submit" className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer">
              Add Problem
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
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
  const { userEmail, customDbUrl } = useProfile();

  const patternName = propPatternName ?? patternKey ?? "";
  const isServerPaginated = !!patternKey;

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [notesMap, setNotesMap] = useState<NotesMap>({});
  const [customProblems, setCustomProblems] = useState<ProblemItem[]>([]);
  const [dbConnected, setDbConnected] = useState(false);

  const getRequestHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-user-email": userEmail,
    };
    if (customDbUrl) headers["x-mongodb-url"] = customDbUrl;
    return headers;
  }, [userEmail, customDbUrl]);

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

  useEffect(() => {
    const initialCompleted = loadData<CompletedMap>(patternName, "completed", {});
    const initialNotes = loadData<NotesMap>(patternName, "notes", {});
    let initialCustom: ProblemItem[] = [];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${patternName}-custom-problems`);
        if (raw) initialCustom = JSON.parse(raw);
      } catch {}
    }

    setCompletedMap(initialCompleted);
    setNotesMap(initialNotes);
    setCustomProblems(initialCustom);

    async function syncWithDB() {
      try {
        const headers = getRequestHeaders();
        const compRes = await fetch(`/api/db/completions?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const compData = await compRes.json();
        if (compData.dbConnected) {
          setDbConnected(true);
          const dbComps = compData.data.filter((x: any) => x.storagePrefix === `completed-${patternName}`);
          const dbCompMap: CompletedMap = {};
          dbComps.forEach((x: any) => { dbCompMap[x.itemId] = x.completedAt; });
          const merged = { ...initialCompleted, ...dbCompMap };
          setCompletedMap(merged);
          saveData(patternName, "completed", merged);
          for (const [id, dateStr] of Object.entries(initialCompleted)) {
            if (!dbCompMap[id]) {
              fetch("/api/db/completions", {
                method: "POST",
                headers,
                body: JSON.stringify({ storagePrefix: `completed-${patternName}`, itemId: id, completedAt: dateStr, userEmail }),
              }).catch(() => { toast({ variant: 'destructive', title: 'Failed to sync completions' }); });
            }
          }
        }
        const noteRes = await fetch(`/api/db/notes?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const noteData = await noteRes.json();
        if (noteData.dbConnected) {
          const dbNotes = noteData.data.filter((x: any) => x.storagePrefix === `notes-${patternName}`);
          const dbNoteMap: NotesMap = {};
          dbNotes.forEach((x: any) => { dbNoteMap[x.itemId] = x.note; });
          const merged = { ...initialNotes, ...dbNoteMap };
          setNotesMap(merged);
          saveData(patternName, "notes", merged);
          for (const [id, noteText] of Object.entries(initialNotes)) {
            if (!dbNoteMap[id]) {
              fetch("/api/db/notes", {
                method: "POST",
                headers,
                body: JSON.stringify({ storagePrefix: `notes-${patternName}`, itemId: id, note: noteText, userEmail }),
              }).catch(() => { toast({ variant: 'destructive', title: 'Failed to sync notes' }); });
            }
          }
        }
        const customRes = await fetch(`/api/db/custom-topics?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const customData = await customRes.json();
        if (customData.dbConnected) {
          const dbCustoms = customData.data.filter((x: any) => x.storagePrefix === `${patternName}-custom-problems`);
          const merged = [...initialCustom];
          dbCustoms.forEach((dbItem: any) => {
            if (!merged.some((x) => x.id === dbItem.id)) {
              merged.push({ id: dbItem.id, title: dbItem.title, difficulty: dbItem.difficulty || "MEDIUM", link: dbItem.link });
            }
          });
          setCustomProblems(merged);
          localStorage.setItem(`${patternName}-custom-problems`, JSON.stringify(merged));
          for (const item of initialCustom) {
            if (!dbCustoms.some((x: any) => x.id === item.id)) {
              fetch("/api/db/custom-topics", {
                method: "POST", headers,
                body: JSON.stringify({ storagePrefix: `${patternName}-custom-problems`, id: item.id, title: item.title, difficulty: item.difficulty || "MEDIUM", link: item.link, userEmail }),
              }).catch(() => { toast({ variant: 'destructive', title: 'Failed to sync custom problems' }); });
            }
          }
        }
      } catch {}
    }
    syncWithDB();
  }, [patternName, userEmail, getRequestHeaders]);

  const saveCustomProblems = useCallback((list: ProblemItem[]) => {
    localStorage.setItem(`${patternName}-custom-problems`, JSON.stringify(list));
    setCustomProblems(list);
  }, [patternName]);

  const handleAddProblem = useCallback((title: string, difficulty: string, link: string) => {
    const newId = Date.now();
    const newProblem: ProblemItem = { id: newId, title, link, difficulty };
    const nextList = [...customProblems, newProblem];
    saveCustomProblems(nextList);
    fetch("/api/db/custom-topics", {
      method: "POST", headers: getRequestHeaders(),
      body: JSON.stringify({ storagePrefix: `${patternName}-custom-problems`, id: newId, title, difficulty, link, userEmail }),
    }).catch(() => { toast({ variant: 'destructive', title: 'Failed to save custom problem' }); });
  }, [customProblems, saveCustomProblems, patternName, getRequestHeaders, userEmail]);

  const handleDeleteProblem = useCallback((id: number) => {
    const nextList = customProblems.filter((p) => p.id !== id);
    saveCustomProblems(nextList);
    setCompletedMap((prev) => {
      const next = { ...prev }; delete next[String(id)]; saveData(patternName, "completed", next); return next;
    });
    setNotesMap((prev) => {
      const next = { ...prev }; delete next[String(id)]; saveData(patternName, "notes", next); return next;
    });
    const headers = getRequestHeaders();
    fetch(`/api/db/custom-topics?storagePrefix=${patternName}-custom-problems&id=${id}&userEmail=${encodeURIComponent(userEmail)}`, { method: "DELETE", headers }).catch(() => { toast({ variant: 'destructive', title: 'Failed to delete custom problem' }); });
    fetch("/api/db/completions", { method: "POST", headers, body: JSON.stringify({ storagePrefix: `completed-${patternName}`, itemId: String(id), userEmail }) }).catch(() => { toast({ variant: 'destructive', title: 'Failed to sync completion data' }); });
    fetch("/api/db/notes", { method: "POST", headers, body: JSON.stringify({ storagePrefix: `notes-${patternName}`, itemId: String(id), userEmail }) }).catch(() => { toast({ variant: 'destructive', title: 'Failed to sync notes data' }); });
  }, [customProblems, saveCustomProblems, patternName, getRequestHeaders, userEmail]);

  const toggleCompleted = useCallback((id: number) => {
    let isCompleted = false;
    let compAtStr = "";
    setCompletedMap((prev) => {
      const key = String(id);
      const next = { ...prev };
      if (next[key]) { delete next[key]; }
      else { compAtStr = new Date().toISOString(); next[key] = compAtStr; isCompleted = true; }
      saveData(patternName, "completed", next);
      return next;
    });
    fetch("/api/db/completions", {
      method: "POST", headers: getRequestHeaders(),
      body: JSON.stringify({ storagePrefix: `completed-${patternName}`, itemId: String(id), completedAt: isCompleted ? compAtStr : undefined, userEmail }),
    }).catch(() => { toast({ variant: 'destructive', title: 'Failed to save completion status' }); });
  }, [patternName, getRequestHeaders, userEmail]);

  const updateNote = useCallback((id: number, value: string) => {
    setNotesMap((prev) => {
      const key = String(id);
      const next = { ...prev, [key]: value };
      if (!value) delete next[key];
      saveData(patternName, "notes", next);
      return next;
    });
    fetch("/api/db/notes", {
      method: "POST", headers: getRequestHeaders(),
      body: JSON.stringify({ storagePrefix: `notes-${patternName}`, itemId: String(id), note: value || undefined, userEmail }),
    }).catch(() => { toast({ variant: 'destructive', title: 'Failed to save note' }); });
  }, [patternName, getRequestHeaders, userEmail]);

  const apiProblems: ProblemWithDifficulty[] = useMemo(() => {
    if (!apiData?.problems) return [];
    return apiData.problems.map((p: any) => ({
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
      ...customProblems.map((p) => ({
        ...p,
        difficulty: p.difficulty || "MEDIUM",
        _difficultyOrder: p.difficulty === "EASY" ? 0 : p.difficulty === "HARD" ? 2 : 1,
        isCustom: true,
      })),
    ];
    return labeled;
  }, [propEasy, propMedium, propHard, customProblems, isServerPaginated, apiProblems]);

  const diffOrder: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
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
        size: 44,
        minSize: 36,
      }),
      columnHelper.display({
        id: "done",
        header: "Done",
        cell: (info) => {
          const id = info.row.original.id;
          const done = !!completedMap[id];
          return (
            <button
              onClick={() => toggleCompleted(id)}
              className="inline-flex items-center justify-center rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {done ? <CheckCircle size={16} className="text-emerald-500" /> : <Circle size={16} strokeWidth={1.5} />}
            </button>
          );
        },
        size: 36,
        minSize: 32,
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
                <button
                  onClick={() => handleDeleteProblem(id)}
                  className="text-zinc-650 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800 shrink-0"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        },
        size: 240,
        minSize: 100,
      }),
      columnHelper.display({
        id: "pattern",
        header: "Pattern",
        cell: () => (
          <span className="text-[11px] text-muted-foreground truncate max-w-[120px] inline-block">
            {displayName}
          </span>
        ),
        size: 100,
        minSize: 60,
      }),
      columnHelper.display({
        id: "desc",
        header: "Desc",
        cell: (info) => {
          const link = info.row.original.link;
          const slug = link.replace("https://leetcode.com/problems/", "").replace("/", "");
          return <ProblemDesc slug={slug} />;
        },
        size: 60,
        minSize: 52,
      }),
      columnHelper.display({
        id: "notes",
        header: "Notes",
        cell: (info) => {
          const id = info.row.original.id;
          const val = notesMap[id] ?? "";
          return <NotesDialog id={id} initialValue={val} onSave={updateNote} />;
        },
        size: 120,
        minSize: 60,
      }),
      columnHelper.accessor("difficulty", {
        header: "Difficulty",
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
                "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                val === "EASY" && "bg-emerald-500/15 text-emerald-400",
                val === "MEDIUM" && "bg-amber-500/15 text-amber-400",
                val === "HARD" && "bg-red-500/15 text-red-400"
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
        id: "completedAt",
        header: "Completed",
        cell: (info) => {
          const id = info.row.original.id;
          const dateStr = completedMap[id];
          const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (val) {
              const isoString = new Date(val).toISOString();
              setCompletedMap((prev) => {
                const next = { ...prev };
                next[String(id)] = isoString;
                saveData(patternName, "completed", next);
                return next;
              });
              fetch("/api/db/completions", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storagePrefix: `completed-${patternName}`, itemId: String(id), completedAt: isoString }),
              }).catch(() => { toast({ variant: 'destructive', title: 'Failed to save completion date' }); });
            } else {
              setCompletedMap((prev) => {
                const next = { ...prev };
                delete next[String(id)];
                saveData(patternName, "completed", next);
                return next;
              });
              fetch("/api/db/completions", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storagePrefix: `completed-${patternName}`, itemId: String(id), completedAt: undefined }),
              }).catch(() => { toast({ variant: 'destructive', title: 'Failed to clear completion date' }); });
            }
          };
          const inputValue = dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";
          return (
            <div className="flex items-center gap-1.5 justify-center">
              <input
                type="date"
                value={inputValue}
                onChange={handleDateChange}
                className="bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/30 rounded px-1.5 py-0.5 text-xs text-zinc-300 outline-none focus:border-primary/50 transition-colors cursor-pointer scheme-dark"
              />
            </div>
          );
        },
        size: 135,
        minSize: 110,
      }),
      columnHelper.display({
        id: "link",
        header: "Link",
        cell: (info) => (
          <a
            href={info.row.original.link}
            target="_blank"
            rel="noopener noreferrer"
            title={info.row.original.title}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink size={14} strokeWidth={1.5} />
          </a>
        ),
        size: 40,
        minSize: 36,
      }),
    ],
    [columnHelper, completedMap, toggleCompleted, notesMap, updateNote, handleDeleteProblem, patternName, isServerPaginated, pagination.pageIndex, pagination.pageSize, displayName]
  );

  const tableDisplayData = isServerPaginated ? allProblems : allProblems;
  const tablePageCount = isServerPaginated ? (apiData?.totalPages ?? -1) : undefined;

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

  const pageSizes = isServerPaginated ? [10, 20, 30, 50] : [10, 20, 30, 50];

  return (
    <div className='mt-10'>
      <div className="mb-4  flex items-center gap-3">
        <button
          onClick={onBack}
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
        <AddProblemDialog onAdd={handleAddProblem} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border relative">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn("mx-auto flex items-center gap-1", header.column.getCanSort() && "cursor-pointer select-none")}
                      >
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
            <AnimatePresence mode="wait">
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
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03, ease: "easeOut" }}
                      className={cn(
                        "border-b border-border transition-colors last:border-0",
                        done ? "bg-muted/20" : "hover:bg-muted/30"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="overflow-hidden px-3 py-2 text-center"
                          style={{ width: cell.column.getSize() }}
                        >
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

      {/* Pagination */}
      {allProblems.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 mt-3 border border-border rounded-lg bg-muted/20 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs">
            <span>Showing</span>
            <span className="font-semibold text-foreground">
              {pagination.pageIndex * pagination.pageSize + 1}
            </span>
            <span>to</span>
            <span className="font-semibold text-foreground">
              {Math.min((pagination.pageIndex + 1) * pagination.pageSize, displayTotal)}
            </span>
            <span>of</span>
            <span className="font-semibold text-foreground">{displayTotal}</span>
            <span>problems</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs">Show</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="bg-background border border-border text-foreground text-xs rounded px-2 py-1 focus:outline-none focus:border-primary/50 transition-colors"
              >
                {pageSizes.map((size) => (<option key={size} value={size}>{size}</option>))}
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
                Page <strong className="text-foreground font-semibold">{pagination.pageIndex + 1}</strong> of{" "}
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
