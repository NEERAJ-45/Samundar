"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { ExternalLink, CheckCircle, Circle, Trash2, Plus, NotebookPen, StickyNote } from "lucide-react";
import { ProblemDesc } from "./ProblemDesc";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface ProblemItem {
  id: number;
  title: string;
  link: string;
  difficulty?: string;
}

interface ProblemsTableProps {
  patternName: string;
  easy: ProblemItem[];
  medium: ProblemItem[];
  hard: ProblemItem[];
  onBack: () => void;
}

const USER_NAME = "NEERAJ";

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

function NotesDialog({
  id,
  initialValue,
  onSave,
}: {
  id: number;
  initialValue: string;
  onSave: (id: number, val: string) => void;
}) {
  const [val, setVal] = useState(initialValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(id, val);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-medium transition-all cursor-pointer mx-auto",
            initialValue
              ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
              : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
          )}
        >
          <StickyNote size={13} />
          {initialValue ? 'Edit Notes' : 'Add Note'}
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <NotebookPen size={18} className="text-primary" />
            Problem Notes
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Type your notes or key takeaways here..."
            className="w-full min-h-[120px] bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 placeholder:text-zinc-605 outline-none focus:border-primary/50 transition-colors resize-y"
          />
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-zinc-850 hover:bg-zinc-900 transition-colors text-zinc-400 cursor-pointer">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
          >
            Save Notes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddProblemDialog({
  onAdd,
}: {
  onAdd: (title: string, difficulty: string, link: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty, link.trim());
    setTitle('');
    setDifficulty('MEDIUM');
    setLink('');
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
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-[425px]">
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
            <label className="text-xs font-medium text-zinc-400">LeetCode Link (Optional)</label>
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
              <button
                type="button"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-zinc-850 hover:bg-zinc-900 transition-colors text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer"
            >
              Add Problem
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProblemsTable({
  patternName,
  easy,
  medium,
  hard,
  onBack,
}: ProblemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [completedMap, setCompletedMap] = useState<CompletedMap>(() =>
    loadData<CompletedMap>(patternName, "completed", {})
  );

  const [notesMap, setNotesMap] = useState<NotesMap>(() =>
    loadData<NotesMap>(patternName, "notes", {})
  );

  const [customProblems, setCustomProblems] = useState<ProblemItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(`${patternName}-custom-problems`);
    if (raw) {
      try {
        setCustomProblems(JSON.parse(raw));
      } catch {
        // ignore
      }
    } else {
      setCustomProblems([]);
    }
  }, [patternName]);

  const saveCustomProblems = useCallback((list: ProblemItem[]) => {
    localStorage.setItem(`${patternName}-custom-problems`, JSON.stringify(list));
    setCustomProblems(list);
  }, [patternName]);

  const handleAddProblem = useCallback((title: string, difficulty: string, link: string) => {
    const newProblem: ProblemItem & { difficulty: string } = {
      id: Date.now(),
      title,
      link,
      difficulty,
    };
    const nextList = [...customProblems, newProblem];
    saveCustomProblems(nextList);
  }, [customProblems, saveCustomProblems]);

  const handleDeleteProblem = useCallback((id: number) => {
    const nextList = customProblems.filter((p) => p.id !== id);
    saveCustomProblems(nextList);
    setCompletedMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      saveData(patternName, "completed", next);
      return next;
    });
    setNotesMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      saveData(patternName, "notes", next);
      return next;
    });
  }, [customProblems, saveCustomProblems, patternName]);

  useEffect(() => {
    setCompletedMap(loadData<CompletedMap>(patternName, "completed", {}));
    setNotesMap(loadData<NotesMap>(patternName, "notes", {}));
  }, [patternName]);

  const toggleCompleted = useCallback(
    (id: number) => {
      setCompletedMap((prev) => {
        const key = String(id);
        const next = { ...prev };
        if (next[key]) {
          delete next[key];
        } else {
          next[key] = new Date().toISOString();
        }
        saveData(patternName, "completed", next);
        return next;
      });
    },
    [patternName]
  );

  const updateNote = useCallback(
    (id: number, value: string) => {
      setNotesMap((prev) => {
        const key = String(id);
        const next = { ...prev, [key]: value };
        if (!value) delete next[key];
        saveData(patternName, "notes", next);
        return next;
      });
    },
    [patternName]
  );

  const allProblems = useMemo(() => {
    const labeled: (ProblemItem & {
      difficulty: string;
      _difficultyOrder: number;
      isCustom?: boolean;
    })[] = [
      ...easy.map((p) => ({ ...p, difficulty: "EASY", _difficultyOrder: 0 })),
      ...medium.map((p) => ({
        ...p,
        difficulty: "MEDIUM",
        _difficultyOrder: 1,
      })),
      ...hard.map((p) => ({ ...p, difficulty: "HARD", _difficultyOrder: 2 })),
      ...customProblems.map((p) => ({
        ...p,
        difficulty: p.difficulty || "MEDIUM",
        _difficultyOrder: p.difficulty === "EASY" ? 0 : p.difficulty === "HARD" ? 2 : 1,
        isCustom: true,
      })),
    ];
    return labeled;
  }, [easy, medium, hard, customProblems]);

  const diffOrder: Record<string, number> = {
    EASY: 0,
    MEDIUM: 1,
    HARD: 2,
  };

  const columnHelper =
    createColumnHelper<(typeof allProblems)[number]>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "srno",
        header: "#",
        cell: (info) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {info.row.index + 1}
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
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => {
          const id = info.row.original.id;
          const done = !!completedMap[id];
          const isCustom = info.row.original.isCustom;
          return (
            <div className="flex items-center justify-between gap-4 text-left">
              <span
                className={cn(
                  "text-sm transition-all",
                  done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                )}
              >
                {info.getValue()}
              </span>
              {isCustom && (
                <button
                  onClick={() => handleDeleteProblem(id)}
                  className="text-zinc-650 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800 shrink-0"
                  title="Delete Custom Problem"
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
        id: "desc",
        header: "Desc",
        cell: (info) => {
          const link = info.row.original.link;
          const slug = link
            .replace("https://leetcode.com/problems/", "")
            .replace("/", "");
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
          return (
            <NotesDialog
              id={id}
              initialValue={val}
              onSave={updateNote}
            />
          );
        },
        size: 140,
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
              setCompletedMap((prev) => {
                const key = String(id);
                const next = { ...prev };
                next[key] = new Date(val).toISOString();
                saveData(patternName, "completed", next);
                return next;
              });
            } else {
              setCompletedMap((prev) => {
                const key = String(id);
                const next = { ...prev };
                delete next[key];
                saveData(patternName, "completed", next);
                return next;
              });
            }
          };

          const inputValue = dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

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
    [columnHelper, completedMap, toggleCompleted, notesMap, updateNote, handleDeleteProblem, patternName]
  );

  const table = useReactTable({
    data: allProblems,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  const solvedCount = useMemo(
    () => allProblems.filter((p) => completedMap[p.id]).length,
    [allProblems, completedMap]
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          &larr; All Patterns
        </button>
        <h2 className="text-lg font-semibold text-foreground">
          {patternName}
        </h2>
        <span className="text-xs text-muted-foreground">
          {solvedCount}/{allProblems.length} solved
        </span>
        <AddProblemDialog onAdd={handleAddProblem} />
        <div className="ml-auto flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{USER_NAME}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
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
                        className={cn(
                          "mx-auto flex items-center gap-1",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none"
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " \u2191",
                          desc: " \u2193",
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const done = !!completedMap[row.original.id];
              return (
                <tr
                  key={row.id}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
