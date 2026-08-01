"use client";

import * as React from "react";
import { useMounted } from "@/hooks/useMounted";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ListChecks,
  Circle,
  CheckCircle2,
  Flag,
  Calendar,
  Search,
  ChevronRight,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProfile } from "@/components/providers/ProfileProvider";
import { toast } from "@/components/ui/toast";

import { TaskEntries } from "./TaskEntries";
import { parseFileAsTask, parseImport, type ImportFormat } from "./task-import";
import {
  addEntry,
  countEntries,
  normalizeTask,
  type Priority,
  type Status,
  type Task,
} from "./task-tree";

const STORAGE_KEY = "samundar-tasks";

const priorityConfig: Record<
  Priority,
  { label: string; className: string; icon: React.ElementType }
> = {
  low: {
    label: "Low",
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
    icon: Flag,
  },
  medium: {
    label: "Medium",
    className: "bg-blue-950 text-blue-300 border-blue-800",
    icon: Flag,
  },
  high: {
    label: "High",
    className: "bg-amber-950 text-amber-300 border-amber-800",
    icon: Flag,
  },
  critical: {
    label: "Critical",
    className: "bg-red-950 text-red-300 border-red-800",
    icon: Flag,
  },
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  todo: {
    label: "Todo",
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-950 text-blue-300 border-blue-800",
  },
  done: {
    label: "Done",
    className: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
};

const defaultCategories = [
  "General",
  "DSA",
  "System Design",
  "Core CS",
  "Project",
  "Revision",
  "Interview Prep",
];

let globalIdCounter = 0;

function migrateTask(t: any): Task {
  if (t.entries) return normalizeTask({ ...t, entries: t.entries ?? [] });
  if (t.subtaskGroups) {
    return normalizeTask({
      ...t,
      entries: t.subtaskGroups.map((group: any) => ({
        id:
          group.id ||
          `se-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: group.title || "",
        checked: false,
        entries: (group.items || []).map((item: any) => ({
          id:
            item.id ||
            `se-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: item.text || "",
          checked: item.checked || false,
          entries: [],
        })),
      })),
    });
  }
  return normalizeTask({ ...t, entries: [] });
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw).map(migrateTask);
  } catch {
    return [];
  }
  return [];
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export default function TasksPage() {
  const { userEmail } = useProfile();
  const [tasks, setTasks] = React.useState<Task[]>(() => loadTasks());
  const mounted = useMounted();
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = React.useState<Priority | "all">(
    "all",
  );
  const [newTitle, setNewTitle] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<Priority>("medium");
  const [newCategory, setNewCategory] = React.useState("General");
  const [newDueDate, setNewDueDate] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = React.useState<Set<string>>(
    new Set(),
  );
  const [newEntryTitle, setNewEntryTitle] = React.useState("");
  const [showImport, setShowImport] = React.useState(false);
  const [importText, setImportText] = React.useState("");
  const [importFormat, setImportFormat] = React.useState<ImportFormat>("text");

  React.useEffect(() => {
    if (mounted) saveTasks(tasks);
  }, [tasks, mounted]);

  function addTask() {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: `task-${Date.now().toString(36)}-${globalIdCounter++}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: "todo",
      category: newCategory,
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate: newDueDate,
      entries: [],
    };
    setTasks((prev) => [task, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewDueDate("");
    setShowAddForm(false);
    toast({ title: "Task created" });
    if (userEmail) {
      fetch("/api/db/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          text: `Created task "${task.title}"`,
        }),
      }).catch(() => {
        toast({ variant: "destructive", title: "Failed to log activity" });
      });
    }
  }

  function deleteTask(id: string) {
    const t = tasks.find((x) => x.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Task deleted" });
    if (userEmail && t) {
      fetch("/api/db/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, text: `Deleted task "${t.title}"` }),
      }).catch(() => {
        toast({ variant: "destructive", title: "Failed to log activity" });
      });
    }
  }

  function toggleStatus(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next: Status =
          t.status === "todo"
            ? "in-progress"
            : t.status === "in-progress"
              ? "done"
              : "todo";
        return { ...t, status: next };
      }),
    );
    const t = tasks.find((x) => x.id === id);
    if (userEmail && t) {
      const label =
        t.status === "todo"
          ? "started"
          : t.status === "in-progress"
            ? "completed"
            : "reset";
      fetch("/api/db/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, text: `${label} task "${t.title}"` }),
      }).catch(() => {
        toast({ variant: "destructive", title: "Failed to log activity" });
      });
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
  }

  function saveEdit() {
    if (!editTitle.trim() || !editingId) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title: editTitle.trim(),
              description: editDescription.trim(),
            }
          : t,
      ),
    );
    setEditingId(null);
    toast({ title: "Task updated" });
  }

  const filtered = tasks.filter((t) => {
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Task Tracker
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Manage and track all your tasks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImport((p) => !p)}
              >
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
              <Button onClick={() => setShowAddForm((p) => !p)}>
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                  <Circle className="h-4 w-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-100">
                    {counts.todo}
                  </p>
                  <p className="text-[10px] text-zinc-500">Todo</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <Circle className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-100">
                    {counts["in-progress"]}
                  </p>
                  <p className="text-[10px] text-zinc-500">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-zinc-100">
                    {counts.done}
                  </p>
                  <p className="text-[10px] text-zinc-500">Done</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add form */}
          {showAddForm && (
            <Card className="bg-card/50 border-zinc-700 border-dashed">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  className="bg-zinc-900 border-zinc-700 text-zinc-200"
                  autoFocus
                />
                <Input
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-200"
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="h-9 text-xs bg-zinc-900 border border-zinc-700 rounded-md px-2 text-zinc-300 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="h-9 text-xs bg-zinc-900 border border-zinc-700 rounded-md px-2 text-zinc-300 outline-none"
                  >
                    {defaultCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="h-9 text-xs bg-zinc-900 border border-zinc-700 rounded-md px-2 text-zinc-300 outline-none"
                  />
                  <Button
                    size="sm"
                    onClick={addTask}
                    disabled={!newTitle.trim()}
                  >
                    <Check className="h-4 w-4 mr-1" /> Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import dialog */}
          <Dialog open={showImport} onOpenChange={setShowImport}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">
                  Import tasks
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-1 p-0.5 bg-zinc-900 rounded-md w-fit">
                {(["text", "csv", "json"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setImportFormat(f)}
                    className={cn(
                      "px-3 py-1 text-xs rounded font-medium transition-colors",
                      importFormat === f
                        ? "bg-zinc-700 text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload as task</span>
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const ext = file.name.split(".").pop()?.toLowerCase();
                      const fmt: ImportFormat =
                        ext === "csv"
                          ? "csv"
                          : ext === "json"
                            ? "json"
                            : "text";
                      const reader = new FileReader();
                      reader.onload = () => {
                        const parsed = parseFileAsTask(
                          file.name,
                          reader.result as string,
                          fmt,
                        );
                        if (parsed.length === 0) {
                          toast({
                            variant: "destructive",
                            title: "Could not parse file",
                          });
                          return;
                        }
                        setTasks((prev) => [...parsed, ...prev]);
                        toast({ title: `Imported "${parsed[0].title}"` });
                      };
                      reader.readAsText(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-[10px] text-zinc-600">
                  or paste below
                </span>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  importFormat === "text"
                    ? "1.1 Spring Cloud OpenFeign\nTheory\n☐ Why do microservices..."
                    : importFormat === "csv"
                      ? "Chapter,Chapter Name,Section,Category,Checkpoint\n11,Consuming REST,OpenFeign,Theory,Why use Feign"
                      : '[{"title":"Chapter 11 — Consuming REST","entries":[{"title":"OpenFeign","entries":[{"title":"Theory","checked":false,"entries":[{"title":"Why use Feign"}]}]}]}]'
                }
                className="w-full h-48 bg-zinc-900 border border-zinc-700 rounded-md p-3 text-xs text-zinc-300 outline-none resize-y font-mono leading-relaxed"
              />
              <p className="text-[10px] text-zinc-600 -mt-2">
                {importFormat === "text"
                  ? "Numbered lines → tasks, headings → sections, ☐ lines → items"
                  : importFormat === "csv"
                    ? "Detects: title/group/item or Chapter/ChapterName/Section/Category/Checkpoint"
                    : "Array of {title, entries: [{title, entries: [...]}]}"}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowImport(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const parsed = parseImport(importText, importFormat);
                    if (parsed.length === 0) {
                      toast({
                        variant: "destructive",
                        title: "No tasks found",
                      });
                      return;
                    }
                    setTasks((prev) => [...parsed, ...prev]);
                    setImportText("");
                    setShowImport(false);
                    toast({ title: `Imported ${parsed.length} tasks` });
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" /> Import
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-zinc-900 border-zinc-800 text-zinc-200 text-sm h-9"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as Status | "all")
              }
              className="h-9 text-xs bg-zinc-900 border border-zinc-800 rounded-md px-2 text-zinc-400 outline-none"
            >
              <option value="all">All Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) =>
                setFilterPriority(e.target.value as Priority | "all")
              }
              className="h-9 text-xs bg-zinc-900 border border-zinc-800 rounded-md px-2 text-zinc-400 outline-none"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {tasks.length > 0 && (
              <span className="text-xs text-zinc-600">
                {filtered.length} / {tasks.length} tasks
              </span>
            )}
          </div>

          {/* Task list */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                <ListChecks className="h-12 w-12 mb-3 text-zinc-700" />
                <p className="text-sm font-medium text-zinc-500">
                  {tasks.length === 0
                    ? "No tasks yet. Create one!"
                    : "No tasks match your filters."}
                </p>
              </div>
            ) : (
              filtered.map((task) => {
                const isEditing = editingId === task.id;
                const PriorityIcon = priorityConfig[task.priority].icon;
                const { done: subDone, total: subTotal } = countEntries(
                  task.entries,
                );
                return (
                  <Card
                    key={task.id}
                    className={cn(
                      "bg-card/50 border-zinc-800 transition-all",
                      task.status === "done" && "opacity-60",
                    )}
                  >
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 h-8 text-sm bg-zinc-900 border-zinc-700"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              autoFocus
                            />
                            <Input
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              placeholder="Description"
                              className="flex-1 h-8 text-sm bg-zinc-900 border-zinc-700"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-green-500 hover:text-green-400"
                              onClick={saveEdit}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-red-500 hover:text-red-400"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleStatus(task.id)}
                              className="mt-0.5 shrink-0"
                            >
                              {task.status === "done" ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : task.status === "in-progress" ? (
                                <Circle className="h-5 w-5 text-blue-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-zinc-600 hover:text-zinc-500 transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium text-zinc-200",
                                  task.status === "done" &&
                                    "line-through text-zinc-600",
                                )}
                              >
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0",
                                    statusConfig[task.status].className,
                                  )}
                                >
                                  {statusConfig[task.status].label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 flex items-center gap-1",
                                    priorityConfig[task.priority].className,
                                  )}
                                >
                                  <PriorityIcon className="h-2.5 w-2.5" />
                                  {priorityConfig[task.priority].label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 bg-purple-950 text-purple-300 border-purple-800"
                                >
                                  {task.category}
                                </Badge>
                                {task.dueDate && (
                                  <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                                    <Calendar className="h-3 w-3" />
                                    {task.dueDate}
                                  </span>
                                )}
                                <span className="text-[10px] text-zinc-700">
                                  Created {task.createdAt}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => startEdit(task)}
                                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Subtask section */}
                          <div className="mt-2 border-t border-zinc-800 pt-2">
                            {task.entries.length === 0 ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  value={newEntryTitle}
                                  onChange={(e) =>
                                    setNewEntryTitle(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "Enter" &&
                                      newEntryTitle.trim()
                                    ) {
                                      setTasks((prev) =>
                                        prev.map((t) =>
                                          t.id === task.id
                                            ? {
                                                ...t,
                                                entries: addEntry(
                                                  t.entries,
                                                  null,
                                                  newEntryTitle.trim(),
                                                ),
                                              }
                                            : t,
                                        ),
                                      );
                                      setNewEntryTitle("");
                                    }
                                  }}
                                  className="flex-1 bg-transparent text-xs text-zinc-500 border-b border-dashed border-zinc-800 focus:border-zinc-600 outline-none py-0.5 placeholder-zinc-700"
                                  placeholder="+ Add subtask"
                                />
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setExpandedId(
                                      expandedId === task.id ? null : task.id,
                                    )
                                  }
                                  className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full py-1"
                                >
                                  {expandedId === task.id ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                  <span>Subtasks</span>
                                  <span className="text-zinc-600">·</span>
                                  <span className="text-zinc-400">
                                    {subDone}/{subTotal}
                                  </span>
                                  <div className="flex-1 max-w-[120px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500/60 rounded-full transition-all"
                                      style={{
                                        width:
                                          subTotal > 0
                                            ? `${(subDone / subTotal) * 100}%`
                                            : "0%",
                                      }}
                                    />
                                  </div>
                                </button>

                                {expandedId === task.id && (
                                  <div className="mt-2 space-y-1">
                                    <TaskEntries
                                      entries={task.entries}
                                      taskId={task.id}
                                      depth={0}
                                      expandedEntry={expandedEntry}
                                      setExpandedEntry={setExpandedEntry}
                                      setTasks={setTasks}
                                    />
                                    <div className="flex items-center gap-2 pt-1">
                                      <input
                                        value={newEntryTitle}
                                        onChange={(e) =>
                                          setNewEntryTitle(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            newEntryTitle.trim()
                                          ) {
                                            setTasks((prev) =>
                                              prev.map((t) =>
                                                t.id === task.id
                                                  ? {
                                                      ...t,
                                                      entries: addEntry(
                                                        t.entries,
                                                        null,
                                                        newEntryTitle.trim(),
                                                      ),
                                                    }
                                                  : t,
                                              ),
                                            );
                                            setNewEntryTitle("");
                                          }
                                        }}
                                        className="flex-1 bg-zinc-900 border border-dashed border-zinc-800 rounded-md px-2 py-1.5 text-xs text-zinc-400 outline-none focus:border-zinc-600 placeholder-zinc-700"
                                        placeholder="+ Add subtask"
                                      />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
