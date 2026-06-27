'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
  Plus,
  NotebookPen,
  StickyNote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useProfile } from '@/components/providers/ProfileProvider';

export interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
  isCustom?: boolean;
}

interface QuestionsTableProps {
  questions: QuestionItem[];
  storagePrefix: string;
  searchPlaceholder?: string;
  defaultCompletedIds?: number[];
}

type CompletedMap = Record<string, string>;
type NotesMap = Record<string, string>;

const diffOrder: Record<string, number> = {
  EASY: 0,
  MEDIUM: 1,
  HARD: 2,
};

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
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
          )}
        >
          <StickyNote size={13} />
          {initialValue ? 'View Sticky Note' : 'Add Sticky Note'}
        </button>
      </DialogTrigger>
      <DialogContent className="border-none bg-amber-100/95 text-zinc-800 sm:max-w-[380px] p-6 shadow-2xl relative rotate-1 select-none overflow-hidden rounded-none border-t-[14px] border-t-amber-200">
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-200/50 rounded-tl-xl shadow-lg border-l border-t border-amber-300/30" />
        
        <DialogHeader className="border-b border-amber-200/60 pb-2 mb-3">
          <DialogTitle className="text-zinc-700 flex items-center gap-2 font-handwritten text-xl font-bold">
            <NotebookPen size={18} className="text-amber-600 shrink-0" />
            Study Sticky Note
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          <textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Jot down notes, answers or reminders in handwriting..."
            className="w-full min-h-[180px] bg-transparent border-none p-1 text-2xl text-amber-950 placeholder:text-amber-700/60 outline-none focus:outline-none resize-none font-handwritten leading-relaxed select-text"
          />
        </div>
        
        <DialogFooter className="gap-2 pt-3 border-t border-amber-200/60 mt-3 justify-end flex-row">
          <DialogClose asChild>
            <button className="px-3 py-1.5 rounded text-xs font-semibold border border-amber-300/40 text-amber-800 hover:bg-amber-200/40 transition-colors cursor-pointer">
              Discard
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-amber-800 text-amber-50 hover:bg-amber-900 transition-all cursor-pointer shadow shadow-amber-900/30"
          >
            Save Note
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTopicDialog({
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
          Add Topic
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2">
            <Plus size={18} className="text-primary" />
            Add Custom Topic
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Topic Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. B+ Tree Node Structure"
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
            <label className="text-xs font-medium text-zinc-400">Reference Link (Optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. https://www.geeksforgeeks.org/..."
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
              Add Topic
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function QuestionsTable({
  questions,
  storagePrefix,
  searchPlaceholder = 'Search topics...',
  defaultCompletedIds = [],
}: QuestionsTableProps) {
  const { userEmail, userName, customDbUrl } = useProfile();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [completedMap, setCompletedMap] = useState<CompletedMap>({});
  const [notesMap, setNotesMap] = useState<NotesMap>({});
  const [customQuestions, setCustomQuestions] = useState<QuestionItem[]>([]);
  const [dbConnected, setDbConnected] = useState(false);

  const saveData = useCallback(<T,>(key: string, data: T) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${storagePrefix}-${key}`, JSON.stringify(data));
  }, [storagePrefix]);

  const defaultCompletedIdsRef = useRef(defaultCompletedIds);
  useEffect(() => {
    defaultCompletedIdsRef.current = defaultCompletedIds;
  }, [defaultCompletedIds]);

  const loadData = useCallback(<T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(`${storagePrefix}-${key}`);
      if (!raw) {
        if (key === 'completed' && defaultCompletedIdsRef.current.length > 0) {
          const initialMap: Record<string, string> = {};
          const timestamp = new Date().toISOString();
          defaultCompletedIdsRef.current.forEach((id) => {
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
  }, [storagePrefix]);

  const getRequestHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    };
    if (customDbUrl) {
      headers['x-mongodb-url'] = customDbUrl;
    }
    return headers;
  }, [userEmail, customDbUrl]);

  useEffect(() => {
    const initialCompleted = loadData<CompletedMap>('completed', {});
    const initialNotes = loadData<NotesMap>('notes', {});
    
    let initialCustom: QuestionItem[] = [];
    if (typeof window !== 'undefined') {
      const rawCustom = localStorage.getItem(`${storagePrefix}-custom-questions`);
      if (rawCustom) {
        try {
          initialCustom = JSON.parse(rawCustom);
        } catch {}
      }
    }

    setCompletedMap(initialCompleted);
    setNotesMap(initialNotes);
    setCustomQuestions(initialCustom);
    setMounted(true);

    async function syncWithDB() {
      try {
        const headers = getRequestHeaders();

        const compRes = await fetch(`/api/db/completions?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const compData = await compRes.json();
        if (compData.dbConnected) {
          setDbConnected(true);
          const dbComps = compData.data.filter(
            (x: any) => x.storagePrefix === `${storagePrefix}-completed`
          );
          const dbCompMap: CompletedMap = {};
          dbComps.forEach((x: any) => {
            dbCompMap[x.itemId] = x.completedAt;
          });
          const mergedComps = { ...initialCompleted, ...dbCompMap };
          setCompletedMap(mergedComps);
          saveData('completed', mergedComps);

          for (const [id, dateStr] of Object.entries(initialCompleted)) {
            if (!dbCompMap[id]) {
              fetch('/api/db/completions', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  storagePrefix: `${storagePrefix}-completed`,
                  itemId: id,
                  completedAt: dateStr,
                  userEmail,
                }),
              }).catch(() => {});
            }
          }
        }

        const noteRes = await fetch(`/api/db/notes?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const noteData = await noteRes.json();
        if (noteData.dbConnected) {
          const dbNotes = noteData.data.filter(
            (x: any) => x.storagePrefix === `${storagePrefix}-notes`
          );
          const dbNoteMap: NotesMap = {};
          dbNotes.forEach((x: any) => {
            dbNoteMap[x.itemId] = x.note;
          });
          const mergedNotes = { ...initialNotes, ...dbNoteMap };
          setNotesMap(mergedNotes);
          saveData('notes', mergedNotes);

          for (const [id, noteText] of Object.entries(initialNotes)) {
            if (!dbNoteMap[id]) {
              fetch('/api/db/notes', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  storagePrefix: `${storagePrefix}-notes`,
                  itemId: id,
                  note: noteText,
                  userEmail,
                }),
              }).catch(() => {});
            }
          }
        }

        const customRes = await fetch(`/api/db/custom-topics?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const customData = await customRes.json();
        if (customData.dbConnected) {
          const dbCustoms = customData.data.filter(
            (x: any) => x.storagePrefix === `${storagePrefix}-custom-questions`
          );
          const dbCustomMap = new Map(dbCustoms.map((x: any) => [x.id, x]));
          
          const mergedCustoms = [...initialCustom];
          dbCustoms.forEach((dbItem: any) => {
            if (!mergedCustoms.some((x) => x.id === dbItem.id)) {
              mergedCustoms.push({
                id: dbItem.id,
                title: dbItem.title,
                difficulty: dbItem.difficulty,
                link: dbItem.link,
                isCustom: true,
              });
            }
          });
          setCustomQuestions(mergedCustoms);
          localStorage.setItem(`${storagePrefix}-custom-questions`, JSON.stringify(mergedCustoms));

          for (const item of initialCustom) {
            if (!dbCustomMap.has(item.id)) {
              fetch('/api/db/custom-topics', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  storagePrefix: `${storagePrefix}-custom-questions`,
                  id: item.id,
                  title: item.title,
                  difficulty: item.difficulty,
                  link: item.link,
                  userEmail,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync with MongoDB:', err);
      }
    }
    
    syncWithDB();
  }, [storagePrefix, userEmail, getRequestHeaders, loadData, saveData]);

  const saveCustomQuestions = useCallback((list: QuestionItem[]) => {
    localStorage.setItem(`${storagePrefix}-custom-questions`, JSON.stringify(list));
    setCustomQuestions(list);
  }, [storagePrefix]);

  const handleAddQuestion = useCallback((title: string, difficulty: string, link: string) => {
    const newId = Date.now();
    const newQuestion: QuestionItem = {
      id: newId,
      title,
      difficulty,
      link,
      isCustom: true,
    };
    const nextList = [...customQuestions, newQuestion];
    saveCustomQuestions(nextList);

    fetch('/api/db/custom-topics', {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({
        storagePrefix: `${storagePrefix}-custom-questions`,
        id: newId,
        title,
        difficulty,
        link,
        userEmail,
      }),
    }).catch(() => {});
  }, [customQuestions, saveCustomQuestions, storagePrefix, getRequestHeaders, userEmail]);

  const handleDeleteQuestion = useCallback((id: number) => {
    const nextList = customQuestions.filter((q) => q.id !== id);
    saveCustomQuestions(nextList);
    setCompletedMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      saveData('completed', next);
      return next;
    });
    setNotesMap((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      saveData('notes', next);
      return next;
    });

    const headers = getRequestHeaders();

    fetch(`/api/db/custom-topics?storagePrefix=${storagePrefix}-custom-questions&id=${id}&userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE',
      headers,
    }).catch(() => {});

    fetch('/api/db/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        storagePrefix: `${storagePrefix}-completed`,
        itemId: String(id),
        userEmail,
      }),
    }).catch(() => {});

    fetch('/api/db/notes', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        storagePrefix: `${storagePrefix}-notes`,
        itemId: String(id),
        userEmail,
      }),
    }).catch(() => {});
  }, [customQuestions, saveCustomQuestions, saveData, storagePrefix, getRequestHeaders, userEmail]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const toggleCompleted = useCallback((id: number) => {
    let isCompleted = false;
    let compAtStr = '';
    setCompletedMap((prev) => {
      const key = String(id);
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        compAtStr = new Date().toISOString();
        next[key] = compAtStr;
        isCompleted = true;
      }
      saveData('completed', next);
      return next;
    });

    fetch('/api/db/completions', {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({
        storagePrefix: `${storagePrefix}-completed`,
        itemId: String(id),
        completedAt: isCompleted ? compAtStr : undefined,
        userEmail,
      }),
    }).catch(() => {});
  }, [saveData, storagePrefix, getRequestHeaders, userEmail]);

  const updateNote = useCallback((id: number, value: string) => {
    setNotesMap((prev) => {
      const key = String(id);
      const next = { ...prev, [key]: value };
      if (!value) delete next[key];
      saveData('notes', next);
      return next;
    });

    fetch('/api/db/notes', {
      method: 'POST',
      headers: getRequestHeaders(),
      body: JSON.stringify({
        storagePrefix: `${storagePrefix}-notes`,
        itemId: String(id),
        note: value || undefined,
        userEmail,
      }),
    }).catch(() => {});
  }, [saveData, storagePrefix, getRequestHeaders, userEmail]);

  const filteredQuestions = useMemo(() => {
    const all = [...questions, ...customQuestions];
    return all.filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [questions, customQuestions, search]);

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
          const isCustom = info.row.original.isCustom;
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
              {isCustom && (
                <button
                  onClick={() => handleDeleteQuestion(id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800 shrink-0"
                  title="Delete Custom Topic"
                >
                  <Trash2 size={13} />
                </button>
              )}
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
            <NotesDialog
              id={id}
              initialValue={val}
              onSave={updateNote}
            />
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
          
          const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            let isoString = '';
            let hasVal = false;
            if (val) {
              isoString = new Date(val).toISOString();
              hasVal = true;
              setCompletedMap((prev) => {
                const key = String(id);
                const next = { ...prev };
                next[key] = isoString;
                saveData('completed', next);
                return next;
              });
            } else {
              setCompletedMap((prev) => {
                const key = String(id);
                const next = { ...prev };
                delete next[key];
                saveData('completed', next);
                return next;
              });
            }

            // Sync to MongoDB
            fetch('/api/db/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                storagePrefix: `${storagePrefix}-completed`,
                itemId: String(id),
                completedAt: hasVal ? isoString : undefined,
              }),
            }).catch(() => {});
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
    ],
    [completedMap, toggleCompleted, notesMap, updateNote, handleDeleteQuestion, storagePrefix, saveData]
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
    const all = [...questions, ...customQuestions];
    return all.filter((q) => completedMap[q.id]).length;
  }, [completedMap, questions, customQuestions, mounted]);

  // Reset to first page when filtering
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [search]);

  const totalCount = questions.length + customQuestions.length;

  return (
    <div className="space-y-6">
      {/* Progress Card & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:max-w-md flex items-center gap-3">
          <div className="flex-grow flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 transition-colors focus-within:border-primary/50 focus-within:bg-zinc-900/80">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <AddTopicDialog onAdd={handleAddQuestion} />
        </div>

        {mounted && (
          <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 px-4 py-2 rounded-lg shrink-0 self-start md:self-auto">
            <div className="text-right">
              <div className="text-xs text-zinc-500 font-medium">User Status</div>
              <div className="text-sm font-bold text-zinc-200">{userName}</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <div className="text-xs text-zinc-500 font-medium">Progress</div>
              <div className="text-sm font-bold text-emerald-400">
                {solvedCount} / {totalCount} Solved ({totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0}%)
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
