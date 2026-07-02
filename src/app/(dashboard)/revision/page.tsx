'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, CheckCircle, Circle, RefreshCw, Calendar, BookOpen, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface RevisionItem {
  id: string;
  concept: string;
  stage: number;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
}



const defaultSeeds: RevisionItem[] = [
  { id: 'seed-os', concept: 'OS Fundamentals & CPU Scheduling', stage: 0, dueDate: new Date().toISOString().split('T')[0], completed: false },
  { id: 'seed-jvm', concept: 'JVM Memory & Garbage Collection Basics', stage: 0, dueDate: new Date().toISOString().split('T')[0], completed: false },
  { id: 'seed-sql', concept: 'SQL Indexing & Joins', stage: 0, dueDate: new Date().toISOString().split('T')[0], completed: false },
  { id: 'seed-cap', concept: 'CAP & PACELC Distributed Theorems', stage: 0, dueDate: new Date().toISOString().split('T')[0], completed: false },
  { id: 'seed-react', concept: 'React Fiber Render Pipeline', stage: 0, dueDate: new Date().toISOString().split('T')[0], completed: false }
];

function getDaysDiff(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function RevisionPage() {
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  const mounted = useMounted();
  const [selectedTab, setSelectedTab] = React.useState('due');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<RevisionItem | null>(null);

  // Form State
  const [formConcept, setFormConcept] = useState('');
  const [formDueDate, setFormDueDate] = useState('');

  // Load items on mount
  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch('/api/db/revision');
        const resData = await res.json();
        if (resData.dbConnected) {
          setDbConnected(true);
          if (resData.data && resData.data.length > 0) {
            setItems(resData.data);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load from DB:', e);
      }

      // Fallback
      const localRaw = localStorage.getItem('revision-scheduler-items');
      if (localRaw) {
        try {
          setItems(JSON.parse(localRaw));
          return;
        } catch {}
      }

      setItems(defaultSeeds);
      localStorage.setItem('revision-scheduler-items', JSON.stringify(defaultSeeds));
    }
    loadItems();
  }, []);

  const saveItem = useCallback(async (item: RevisionItem) => {
    // 1. Update State & LocalStorage
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id);
      let next = [...prev];
      if (idx >= 0) next[idx] = item;
      else next.push(item);
      localStorage.setItem('revision-scheduler-items', JSON.stringify(next));
      return next;
    });

    // 2. Sync to Mongo DB
    if (dbConnected) {
      try {
        await fetch('/api/db/revision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      } catch (e) {
        console.error('Failed to sync to database:', e);
      }
    }
  }, [dbConnected]);

  const deleteItem = useCallback(async (id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      localStorage.setItem('revision-scheduler-items', JSON.stringify(next));
      return next;
    });

    if (dbConnected) {
      try {
        await fetch(`/api/db/revision?id=${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.error('Failed to delete from database:', e);
      }
    }
  }, [dbConnected]);

  // Form Handlers
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConcept.trim()) return;

    const newItem: RevisionItem = {
      id: `rev-${Date.now()}`,
      concept: formConcept.trim(),
      stage: 0,
      dueDate: formDueDate || new Date().toISOString().split('T')[0],
      completed: false,
    };

    saveItem(newItem);
    setIsAddOpen(false);
    setFormConcept('');
    setFormDueDate('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !formConcept.trim()) return;

    const updated: RevisionItem = {
      ...activeItem,
      concept: formConcept.trim(),
      dueDate: formDueDate || new Date().toISOString().split('T')[0],
    };

    saveItem(updated);
    setIsEditOpen(false);
    setActiveItem(null);
    setFormConcept('');
    setFormDueDate('');
  };

  const openEditDialog = (item: RevisionItem) => {
    setActiveItem(item);
    setFormConcept(item.concept);
    setFormDueDate(item.dueDate);
    setIsEditOpen(true);
  };

  const handleCheck = useCallback((item: RevisionItem) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    setTimeout(() => setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    }), 600);
    if (!item.completed) saveItem({ ...item, completed: true });
  }, [saveItem]);

  const handleUncomplete = useCallback((item: RevisionItem) => {
    const updated: RevisionItem = { ...item, completed: false, dueDate: new Date().toISOString().split('T')[0] };
    saveItem(updated);
  }, [saveItem]);

  // Calculations
  const stats = useMemo(() => {
    if (!mounted) return { due: 0, completed: 0, total: 0 };
    let due = 0;
    let completed = 0;

    items.forEach((item) => {
      if (item.completed) { completed++; return; }
      if (getDaysDiff(item.dueDate) <= 0) due++;
    });

    return { due, completed, total: items.length };
  }, [items, mounted]);

  const filteredItems = useMemo(() => {
    if (selectedTab === 'due') {
      return items.filter((item) => !item.completed && getDaysDiff(item.dueDate) <= 0);
    }
    return items.filter((item) => item.completed);
  }, [items, selectedTab]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">Revision Engine</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Spaced repetition for long-term technical concept retention.
            </p>
          </div>

          {/* Add Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button 
                onClick={() => {
                  setFormConcept('');
                  setFormDueDate(new Date().toISOString().split('T')[0]);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Plus size={14} />
                Add Topic
              </button>
            </DialogTrigger>
            <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-zinc-100 flex items-center gap-2">
                  <BookOpen size={18} className="text-primary" />
                  Add Spaced Repetition Topic
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Concept Name</label>
                  <input
                    type="text"
                    required
                    value={formConcept}
                    onChange={(e) => setFormConcept(e.target.value)}
                    placeholder="e.g. JVM Memory Pools & gc Tuning"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder:text-zinc-650 outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-primary/50 transition-colors scheme-dark"
                  />
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <DialogClose asChild>
                    <button type="button" className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-zinc-850 hover:bg-zinc-900 transition-colors text-zinc-400 cursor-pointer">
                      Cancel
                    </button>
                  </DialogClose>
                  <button type="submit" className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer">
                    Create Topic
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Due', value: stats.due, color: 'text-red-400' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
            { label: 'Total Tracked', value: stats.total, color: 'text-zinc-400' },
          ].map((stat) => (
            <Card key={stat.label} className="border-zinc-800/80 bg-zinc-900/40">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-500 mb-1.5">{stat.label}</p>
                <span className={cn('text-2xl font-bold', stat.color)}>{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* List Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger
              value="due"
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              Due
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="due" className="mt-4">
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <Card className="border-zinc-800/80 bg-zinc-900/40">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-zinc-500">Nothing due right now. You are fully synced!</p>
                  </CardContent>
                </Card>
              ) : (
                filteredItems.map((item) => (
                  <RevisionCard
                    key={item.id}
                    item={item}
                    checked={checkedIds.has(item.id)}
                    onComplete={() => handleCheck(item)}
                    onEdit={() => openEditDialog(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {filteredItems.length === 0 ? (
              <Card className="border-zinc-800/80 bg-zinc-900/40">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-zinc-500">No completed revisions yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <RevisionCard
                    key={item.id}
                    item={item}
                    completed
                    onUncomplete={() => handleUncomplete(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-zinc-100 flex items-center gap-2">
                <Pencil size={16} className="text-primary" />
                Update Revision Topic
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Concept Name</label>
                <input
                  type="text"
                  required
                  value={formConcept}
                  onChange={(e) => setFormConcept(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Next Due Date</label>
                <input
                  type="date"
                  required
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none focus:border-primary/50 transition-colors scheme-dark"
                />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <DialogClose asChild>
                  <button type="button" className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-zinc-850 hover:bg-zinc-900 transition-colors text-zinc-400 cursor-pointer">
                    Cancel
                  </button>
                </DialogClose>
                <button type="submit" className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer">
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function RevisionCard({
  item,
  completed,
  checked,
  onComplete,
  onEdit,
  onDelete,
  onUncomplete,
}: {
  item: RevisionItem;
  completed?: boolean;
  checked?: boolean;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onUncomplete?: () => void;
}) {
  const days = getDaysDiff(item.dueDate);

  if (completed) {
    return (
      <Card className="border-emerald-900/40 bg-zinc-900/40">
        <CardContent className="p-4 flex items-center gap-4">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-400 line-through truncate">
              {item.concept}
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Completed</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUncomplete}
              className="text-zinc-600 hover:text-zinc-300 p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Move Back to Active"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={onDelete}
              className="text-zinc-600 hover:text-red-400 p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Delete Topic"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-800/80 bg-zinc-900/40 transition-all hover:border-zinc-700">
      <CardContent className="p-4 flex items-center gap-4">
        <button
          onClick={onComplete}
          className={cn(
            'h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center cursor-pointer transition-all',
            checked
              ? 'border-emerald-500 bg-emerald-500/20'
              : 'border-zinc-700 hover:border-emerald-500/50 group'
          )}
          title="Mark as Completed"
        >
          {checked ? (
            <CheckCircle size={12} className="text-emerald-400 shrink-0" />
          ) : (
            <Circle size={12} className="text-transparent group-hover:text-emerald-500/30 transition-colors shrink-0" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-200 truncate">
            {item.concept}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Calendar size={11} />
              {item.dueDate}
            </span>
            {days < 0 ? (
              <span className="text-xs text-red-400 font-semibold">{Math.abs(days)}d overdue</span>
            ) : days === 0 ? (
              <span className="text-xs text-amber-400 font-semibold">Due today</span>
            ) : (
              <span className="text-xs text-zinc-500">{days}d left</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-zinc-650 hover:text-zinc-300 p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Edit Topic"
          >
            <Pencil size={13} />
          </button>

          <button
            onClick={onDelete}
            className="text-zinc-650 hover:text-red-400 p-1.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Delete Topic"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
