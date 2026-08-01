import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addEntry,
  countEntries,
  deleteEntry,
  renameEntry,
  toggleEntryChecked,
  type SubtaskEntry,
  type Task,
} from "./task-tree";

export function TaskEntries({
  entries,
  taskId,
  depth,
  expandedEntry,
  setExpandedEntry,
  setTasks,
}: {
  entries: SubtaskEntry[];
  taskId: string;
  depth: number;
  expandedEntry: Set<string>;
  setExpandedEntry: React.Dispatch<React.SetStateAction<Set<string>>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [addText, setAddText] = React.useState("");
  const isExpanded = (id: string) => expandedEntry.has(id);

  const toggle = (id: string) => {
    setExpandedEntry((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const update = (fn: (currentEntries: SubtaskEntry[]) => SubtaskEntry[]) =>
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, entries: fn(task.entries) } : task,
      ),
    );

  return (
    <div className="space-y-0.5">
      {entries.map((entry) => {
        const { done, total } = countEntries([entry]);
        const isLeaf = entry.entries.length === 0;
        const expanded = isExpanded(entry.id);

        return (
          <div key={entry.id}>
            <div
              className="flex items-center gap-1.5 group py-0.5"
              style={{ paddingLeft: depth * 12 }}
            >
              {!isLeaf && (
                <button
                  onClick={() => toggle(entry.id)}
                  className="shrink-0 p-0.5 rounded hover:bg-zinc-800"
                >
                  {expanded ? (
                    <ChevronDown className="h-3 w-3 text-zinc-500" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-zinc-500" />
                  )}
                </button>
              )}
              {!isLeaf && (
                <button
                  onClick={() =>
                    update((currentEntries) =>
                      toggleEntryChecked(currentEntries, entry.id),
                    )
                  }
                  className="shrink-0 p-0.5"
                >
                  {entry.checked ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400/60" />
                  ) : (
                    <Circle className="h-3 w-3 text-zinc-700 hover:text-zinc-500" />
                  )}
                </button>
              )}
              {isLeaf && (
                <button
                  onClick={() =>
                    update((currentEntries) =>
                      toggleEntryChecked(currentEntries, entry.id),
                    )
                  }
                  className="shrink-0 p-0.5"
                >
                  {entry.checked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-zinc-600 hover:text-zinc-500" />
                  )}
                </button>
              )}
              <input
                value={entry.title}
                onChange={(event) =>
                  update((currentEntries) =>
                    renameEntry(currentEntries, entry.id, event.target.value),
                  )
                }
                className={cn(
                  "flex-1 bg-transparent text-xs outline-none border-b border-transparent focus:border-zinc-600 px-0 py-0",
                  entry.checked && isLeaf
                    ? "line-through text-zinc-600"
                    : "text-zinc-400",
                )}
              />
              {!isLeaf && total > 0 && (
                <span className="text-[10px] text-zinc-600 shrink-0">
                  {done}/{total}
                </span>
              )}
              <button
                onClick={() =>
                  update((currentEntries) =>
                    deleteEntry(currentEntries, entry.id),
                  )
                }
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-all shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            {!isLeaf && expanded && (
              <>
                <TaskEntries
                  entries={entry.entries}
                  taskId={taskId}
                  depth={depth + 1}
                  expandedEntry={expandedEntry}
                  setExpandedEntry={setExpandedEntry}
                  setTasks={setTasks}
                />
                <div
                  style={{ paddingLeft: (depth + 1) * 12 }}
                  className="py-0.5"
                >
                  <input
                    value={addText}
                    onChange={(event) => setAddText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && addText.trim()) {
                        update((currentEntries) =>
                          addEntry(currentEntries, entry.id, addText.trim()),
                        );
                        setAddText("");
                      }
                    }}
                    className="w-full bg-transparent text-xs text-zinc-600 border-b border-dashed border-zinc-800 focus:border-zinc-600 outline-none py-0.5 placeholder-zinc-700"
                    placeholder="+ Add"
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
