'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Zap,
  BookOpen,
  Code,
  Building2,
  Brain,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Target,
  Sparkles,
  StickyNote,
  Plus,
  GripVertical,
  Timer,
  BarChart3,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/providers/ProfileProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STORAGE_KEY = 'daily-completions';
const NOTES_KEY = 'daily-notes';

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
const todayKey = today.toISOString().slice(0, 10);

type Priority = 'must' | 'should' | 'nice';

interface Task {
  id: string;
  title: string;
  time: string;
  difficulty: string;
  priority: Priority;
  link?: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  tasks: Task[];
}

const categories: Category[] = [
  {
    id: 'dsa',
    title: "Today's DSA",
    icon: Code,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    tasks: [
      { id: 'dsa-1', title: 'Sliding Window — Longest Substring Without Repeating Characters', time: '45 min', difficulty: 'Medium', priority: 'must', link: '/patterns' },
      { id: 'dsa-2', title: 'Dynamic Programming — House Robber III (Tree DP)', time: '45 min', difficulty: 'Hard', priority: 'must', link: '/patterns' },
      { id: 'dsa-3', title: 'Review — Binary Search Variations', time: '20 min', difficulty: 'Easy', priority: 'should' },
    ],
  },
  {
    id: 'system-design',
    title: "Today's System Design",
    icon: Building2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    tasks: [
      { id: 'sd-1', title: 'Design a Rate Limiter — Token Bucket & Sliding Window', time: '60 min', difficulty: 'Medium', priority: 'must', link: '/mastery' },
      { id: 'sd-2', title: 'Study — Consistent Hashing Deep Dive', time: '30 min', difficulty: 'Medium', priority: 'should' },
    ],
  },
  {
    id: 'core-cs',
    title: "Today's Core CS",
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    tasks: [
      { id: 'cs-1', title: 'Database Indexing — B-Trees vs LSM Trees', time: '30 min', difficulty: 'Medium', priority: 'must' },
      { id: 'cs-2', title: 'OS — Memory Management & Paging', time: '30 min', difficulty: 'Medium', priority: 'should' },
    ],
  },
  {
    id: 'project',
    title: "Today's Project Work",
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    tasks: [
      { id: 'proj-1', title: 'ProdigyOS — Build Analytics Dashboard Components', time: '90 min', difficulty: 'Advanced', priority: 'must', link: '/analytics' },
      { id: 'proj-2', title: 'Refactor API Route Error Handling', time: '30 min', difficulty: 'Medium', priority: 'nice' },
    ],
  },
  {
    id: 'revision',
    title: "Today's Revision",
    icon: RefreshCw,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    tasks: [
      { id: 'rev-1', title: 'Review — Graph Algorithms (DFS, BFS, Topological Sort)', time: '20 min', difficulty: 'Easy', priority: 'should', link: '/revision' },
      { id: 'rev-2', title: 'Review — CAP Theorem & PACELC', time: '15 min', difficulty: 'Easy', priority: 'should' },
      { id: 'rev-3', title: 'Review — Past Week DSA Problems', time: '25 min', difficulty: 'Easy', priority: 'must' },
    ],
  },
];

const timeBlocks = [
  { period: 'Morning', time: '6:00 — 9:00', focus: 'Light Revision & DSA Warm-up', color: 'bg-blue-500/10 border-blue-500/20', icon: BookOpen },
  { period: 'Deep Work', time: '9:00 — 12:00', focus: 'System Design & Core CS Deep Dive', color: 'bg-emerald-500/10 border-emerald-500/20', icon: Target },
  { period: 'Break', time: '12:00 — 1:00', focus: 'Rest & Recharge', color: 'bg-zinc-800/50 border-zinc-700/20', icon: Clock },
  { period: 'Afternoon', time: '1:00 — 4:00', focus: 'Project Work — Ship Features', color: 'bg-amber-500/10 border-amber-500/20', icon: Zap },
  { period: 'Evening', time: '4:00 — 6:00', focus: 'DSA Practice & Problem Solving', color: 'bg-purple-500/10 border-purple-500/20', icon: Code },
  { period: 'Review', time: '6:00 — 7:00', focus: 'Daily Review & Plan Tomorrow', color: 'bg-rose-500/10 border-rose-500/20', icon: RefreshCw },
];

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  must: { label: 'Must', className: 'bg-red-950 text-red-300 border-red-800' },
  should: { label: 'Should', className: 'bg-amber-950 text-amber-300 border-amber-800' },
  nice: { label: 'Nice', className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
};

function difficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'Advanced': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
  }
}

function getCurrentBlockIndex(): number {
  const h = today.getHours();
  const m = today.getMinutes();
  const totalMinutes = h * 60 + m;
  if (totalMinutes < 360) return -1; // before 6:00
  if (totalMinutes < 540) return 0;  // 6:00-9:00
  if (totalMinutes < 720) return 1;  // 9:00-12:00
  if (totalMinutes < 780) return 2;  // 12:00-13:00
  if (totalMinutes < 960) return 3;  // 13:00-16:00
  if (totalMinutes < 1080) return 4; // 16:00-18:00
  if (totalMinutes < 1140) return 5; // 18:00-19:00
  return -1; // after 19:00
}

export default function DailyPage() {
  const { userEmail } = useProfile();
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [mounted, setMounted] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [customTasks, setCustomTasks] = React.useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [taskCategories, setTaskCategories] = React.useState<Category[]>(categories);

  const [timerMode, setTimerMode] = React.useState<'work' | 'break'>('work');
  const [timerRunning, setTimerRunning] = React.useState(false);
  const [timerSeconds, setTimerSeconds] = React.useState(25 * 60);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const [editingTimerPart, setEditingTimerPart] = React.useState<'h' | 'm' | 's' | null>(null);
  const [editTimerValue, setEditTimerValue] = React.useState('');
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const [workMinutes, setWorkMinutes] = React.useState(25);
  const [breakMinutes, setBreakMinutes] = React.useState(5);
  const WORK_TIME = workMinutes * 60;
  const BREAK_TIME = breakMinutes * 60;

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Record<string, string[]> = JSON.parse(saved);
        const todayCompleted = parsed[todayKey] || [];
        setCompleted(new Set(todayCompleted));
      } catch {}
    }
    const savedNote = localStorage.getItem(NOTES_KEY);
    if (savedNote) {
      try {
        const notes: Record<string, string> = JSON.parse(savedNote);
        setNote(notes[todayKey] || '');
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const saved: Record<string, string[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[todayKey] = Array.from(completed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [completed, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    const saved: Record<string, string> = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    saved[todayKey] = note;
    localStorage.setItem(NOTES_KEY, JSON.stringify(saved));
  }, [note, mounted]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function toggleTask(id: string) {
    const wasCompleted = completed.has(id);
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (userEmail) {
      fetch('/api/db/activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, text: wasCompleted ? 'Uncompleted a daily task' : 'Completed a daily task' }),
      }).catch(() => {});
    }
  }

  function addCustomTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    const task: Task = {
      id: `custom-${Date.now()}`,
      title,
      time: '30 min',
      difficulty: 'Custom',
      priority: 'should',
    };
    setCustomTasks((p) => [...p, task]);
    setNewTaskTitle('');
    if (userEmail) {
      fetch('/api/db/activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, text: `Added custom daily task "${title}"` }),
      }).catch(() => {});
    }
  }

  function startTimer() {
    setTimerRunning(true);
  }

  function pauseTimer() {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function resetTimer() {
    pauseTimer();
    setTimerSeconds(timerMode === 'work' ? WORK_TIME : BREAK_TIME);
  }

  function switchTimerMode() {
    pauseTimer();
    const next = timerMode === 'work' ? 'break' : 'work';
    setTimerMode(next);
    setTimerSeconds(next === 'work' ? WORK_TIME : BREAK_TIME);
  }

  React.useEffect(() => {
    if (!timerRunning) return;
    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const totalTasks = taskCategories.reduce((sum, cat) => sum + cat.tasks.length, 0) + customTasks.length;
  const completedCount = completed.size;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = React.useState('');
  const [editTaskTime, setEditTaskTime] = React.useState('');
  const [editTaskDifficulty, setEditTaskDifficulty] = React.useState('');

  function getAudioContext() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  function playDialSound() {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.07);
    }
  }

  function handleStartEditTimer(part: 'h' | 'm' | 's') {
    const total = timerMode === 'work' ? workMinutes * 60 : breakMinutes * 60;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const vals = { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
    setEditingTimerPart(part);
    setEditTimerValue(vals[part]);
    playDialSound();
  }

  function handleEditTimerChange(val: string) {
    setEditTimerValue(val.replace(/\D/g, ''));
    playDialSound();
  }

  function handleEditTimerBlur() {
    if (editingTimerPart && editTimerValue !== '') {
      let total = timerMode === 'work' ? workMinutes * 60 : breakMinutes * 60;
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const num = parseInt(editTimerValue) || 0;
      if (editingTimerPart === 'h') { total = num * 3600 + m * 60 + s; }
      else if (editingTimerPart === 'm') { total = h * 3600 + num * 60 + s; }
      else if (editingTimerPart === 's') { total = h * 3600 + m * 60 + num; }
      const minutes = Math.max(1, Math.round(total / 60));
      if (timerMode === 'work') setWorkMinutes(minutes);
      else setBreakMinutes(minutes);
      setTimerSeconds(total);
    }
    setEditingTimerPart(null);
    setEditTimerValue('');
  }

  function handleEditTimerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    else if (e.key === 'Escape') { setEditingTimerPart(null); setEditTimerValue(''); }
  }

  function handleStartEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskTime(task.time);
    setEditTaskDifficulty(task.difficulty);
  }

  function handleSaveEditTask() {
    if (!editTaskTitle.trim() || !editingTaskId) return;
    setTaskCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        tasks: cat.tasks.map((t) =>
          t.id === editingTaskId
            ? { ...t, title: editTaskTitle.trim(), time: editTaskTime, difficulty: editTaskDifficulty }
            : t
        ),
      }))
    );
    setEditingTaskId(null);
  }

  const [dailyStreak, setDailyStreak] = React.useState(0);

  React.useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const res = await fetch('/api/auth/login-streak');
        if (res.ok) {
          const data = await res.json();
          setDailyStreak(data.streak ?? 0);
          return;
        }
      } catch {}
      const saved: Record<string, string[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      let s = 0;
      const d = new Date();
      for (let i = 0; i < 365; i++) {
        const key = d.toISOString().slice(0, 10);
        if (saved[key]?.length) s++;
        else if (i > 0) break;
        d.setDate(d.getDate() - 1);
      }
      setDailyStreak(s);
    })();
  }, [mounted]);

  const timerMinutes = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const timerProgress = timerMode === 'work'
    ? ((WORK_TIME - timerSeconds) / WORK_TIME) * 100
    : ((BREAK_TIME - timerSeconds) / BREAK_TIME) * 100;

  const currentBlock = getCurrentBlockIndex();
  const allTasks = React.useMemo(
    () => taskCategories.flatMap((c) => c.tasks).concat(customTasks),
    [taskCategories, customTasks],
  );
  const priorityCounts = React.useMemo(() => ({
    must: allTasks.filter((t) => t.priority === 'must').length,
    should: allTasks.filter((t) => t.priority === 'should').length,
    nice: allTasks.filter((t) => t.priority === 'nice').length,
  }), [allTasks]);

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Daily Execution Center</h1>
              <p className="text-sm text-zinc-500 mt-1">{dateStr}</p>
            </div>
            
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <Flame className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">{dailyStreak}</p>
                  <p className="text-xs text-zinc-500">Day Streak</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {allTasks.filter((t) => completed.has(t.id)).reduce((sum, t) => {
                      const mins = parseInt(t.time);
                      return sum + (isNaN(mins) ? 0 : mins);
                    }, 0)}
                  </p>
                  <p className="text-xs text-zinc-500">Min Done</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">{completedCount}/{totalTasks}</p>
                  <p className="text-xs text-zinc-500">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">{priorityCounts.must}</p>
                  <p className="text-xs text-zinc-500">Must-Do Tasks</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Daily Progress</span>
              <span className="text-zinc-400">{progressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Tasks column */}
            <div className="xl:col-span-2 space-y-6">
              {/* Task categories */}
              <div className="space-y-4">
                {taskCategories.map((category) => {
                  const Icon = category.icon;
                  const catCompleted = category.tasks.filter((t) => completed.has(t.id)).length;
                  const catProgress = category.tasks.length > 0 ? Math.round((catCompleted / category.tasks.length) * 100) : 0;
                  return (
                    <Card key={category.id} className={cn('bg-card/50', category.borderColor)}>
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', category.bgColor)}>
                            <Icon className={cn('h-4 w-4', category.color)} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium text-zinc-200">{category.title}</CardTitle>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="h-1 w-16 rounded-full bg-zinc-800 overflow-hidden">
                                <div className={cn('h-full rounded-full transition-all duration-500', category.color.replace('text-', 'bg-'))} style={{ width: `${catProgress}%` }} />
                              </div>
                              <span className="text-[10px] text-zinc-600">{catCompleted}/{category.tasks.length}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 space-y-2">
                        {category.tasks.map((task) => {
                          const isDone = completed.has(task.id);
                          const isEditing = editingTaskId === task.id;
                          if (isEditing) {
                            return (
                              <div key={task.id} className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/50 p-3">
                                <Input value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} className="flex-1 h-8 text-sm bg-zinc-800 border-zinc-700" onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditTask(); if (e.key === 'Escape') setEditingTaskId(null); }} autoFocus />
                                <Input value={editTaskTime} onChange={(e) => setEditTaskTime(e.target.value)} className="w-16 h-8 text-sm bg-zinc-800 border-zinc-700" onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditTask(); if (e.key === 'Escape') setEditingTaskId(null); }} />
                                <select value={editTaskDifficulty} onChange={(e) => setEditTaskDifficulty(e.target.value)} className="h-8 text-xs bg-zinc-800 border border-zinc-700 rounded px-1 text-zinc-300 outline-none">
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Hard">Hard</option>
                                  <option value="Advanced">Advanced</option>
                                </select>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-green-500 hover:text-green-400" onClick={handleSaveEditTask}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-red-500 hover:text-red-400" onClick={() => setEditingTaskId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          }
                          if (task.link) {
                            return (
                              <Link key={task.id} href={task.link} className="block group">
                                <div className={cn(
                                  'flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                                  isDone ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50',
                                )}>
                                  <button onClick={(e) => { e.preventDefault(); toggleTask(task.id); }}>
                                    {isDone ? (
                                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                                    ) : (
                                      <Circle className="h-5 w-5 shrink-0 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                                    )}
                                  </button>
                                  <span className={cn('flex-1 text-sm', isDone && 'line-through text-zinc-600')}>
                                    {task.title}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConfig[task.priority].className)}>
                                      {priorityConfig[task.priority].label}
                                    </Badge>
                                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', difficultyColor(task.difficulty))}>
                                      {task.difficulty}
                                    </Badge>
                                    <span className="text-xs text-zinc-600 w-12 text-right">{task.time}</span>
                                    <button onClick={(e) => { e.preventDefault(); handleStartEditTask(task); }} className="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </Link>
                            );
                          }
                          return (
                            <div key={task.id} className="block group">
                              <div className={cn(
                                'flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                                isDone ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50',
                              )}>
                                <button onClick={() => toggleTask(task.id)}>
                                  {isDone ? (
                                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                                  ) : (
                                    <Circle className="h-5 w-5 shrink-0 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                                  )}
                                </button>
                                <span className={cn('flex-1 text-sm', isDone && 'line-through text-zinc-600')}>
                                  {task.title}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConfig[task.priority].className)}>
                                    {priorityConfig[task.priority].label}
                                  </Badge>
                                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', difficultyColor(task.difficulty))}>
                                    {task.difficulty}
                                  </Badge>
                                  <span className="text-xs text-zinc-600 w-12 text-right">{task.time}</span>
                                  <button onClick={() => handleStartEditTask(task)} className="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Custom tasks */}
                {customTasks.length > 0 && (
                  <Card className="bg-card/50 border-dashed border-zinc-700">
                    <CardContent className="p-4 space-y-2">
                      {customTasks.map((task) => {
                        const isDone = completed.has(task.id);
                        return (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={cn(
                              'w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all',
                              isDone ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50',
                            )}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 text-zinc-600" />
                            )}
                            <span className={cn('flex-1 text-sm', isDone && 'line-through text-zinc-600')}>
                              {task.title}
                            </span>
                            <span className="text-xs text-zinc-600">{task.time}</span>
                          </button>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Add custom task */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a custom task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addCustomTask(); }}
                  className="bg-zinc-900 border-zinc-800 text-zinc-200 text-sm"
                />
                <Button variant="outline" size="icon" onClick={addCustomTask} disabled={!newTaskTitle.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar column */}
            <div className="space-y-6">
              {/* Focus Timer */}
              <Card className="bg-card/50 border-zinc-800">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-rose-400" />
                      <CardTitle className="text-sm font-medium text-zinc-200">Focus Timer</CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] cursor-pointer',
                        timerMode === 'work'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800',
                      )}
                      onClick={switchTimerMode}
                    >
                      {timerMode === 'work' ? 'Focus' : 'Break'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-col items-center gap-4">
                  <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#27272a" strokeWidth="8" />
                      <circle
                        cx="80" cy="80" r="70" fill="none"
                        stroke={timerMode === 'work' ? '#fb7185' : '#34d399'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - timerProgress / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center -mt-1">
                      <div className="flex items-baseline gap-0">
                        {editingTimerPart === 'h' ? (
                          <input autoFocus value={editTimerValue} onChange={(e) => handleEditTimerChange(e.target.value)} onBlur={handleEditTimerBlur} onKeyDown={handleEditTimerKeyDown} className="w-10 bg-zinc-800/80 text-center rounded-md outline-none ring-2 ring-zinc-600 text-zinc-100 text-3xl font-bold tabular-nums -ml-1" />
                        ) : (
                          <button onClick={() => !timerRunning && handleStartEditTimer('h')} className="hover:bg-zinc-800/60 rounded-md px-1 -mx-1 transition-all text-3xl font-bold text-zinc-100 tabular-nums tracking-wide" title="Edit hours">
                            {String(Math.floor(timerSeconds / 3600)).padStart(2, '0')}
                          </button>
                        )}
                        <span className="text-3xl font-bold text-zinc-600 tabular-nums -mx-0.5">:</span>
                        {editingTimerPart === 'm' ? (
                          <input autoFocus value={editTimerValue} onChange={(e) => handleEditTimerChange(e.target.value)} onBlur={handleEditTimerBlur} onKeyDown={handleEditTimerKeyDown} className="w-10 bg-zinc-800/80 text-center rounded-md outline-none ring-2 ring-zinc-600 text-zinc-100 text-3xl font-bold tabular-nums" />
                        ) : (
                          <button onClick={() => !timerRunning && handleStartEditTimer('m')} className="hover:bg-zinc-800/60 rounded-md px-1 -mx-1 transition-all text-3xl font-bold text-zinc-100 tabular-nums tracking-wide" title="Edit minutes">
                            {String(timerMinutes).padStart(2, '0')}
                          </button>
                        )}
                        <span className="text-3xl font-bold text-zinc-600 tabular-nums -mx-0.5">:</span>
                        {editingTimerPart === 's' ? (
                          <input autoFocus value={editTimerValue} onChange={(e) => handleEditTimerChange(e.target.value)} onBlur={handleEditTimerBlur} onKeyDown={handleEditTimerKeyDown} className="w-10 bg-zinc-800/80 text-center rounded-md outline-none ring-2 ring-zinc-600 text-zinc-100 text-3xl font-bold tabular-nums" />
                        ) : (
                          <button onClick={() => !timerRunning && handleStartEditTimer('s')} className="hover:bg-zinc-800/60 rounded-md px-1 -mx-1 transition-all text-3xl font-bold text-zinc-100 tabular-nums tracking-wide" title="Edit seconds">
                            {String(timerSecs).padStart(2, '0')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!timerRunning ? (
                      <Button variant="outline" size="sm" onClick={startTimer} disabled={timerSeconds === 0}>
                        <Play className="h-3.5 w-3.5 mr-1" /> Start
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={pauseTimer}>
                        <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={resetTimer}>
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Time Blocks */}
              <Card className="bg-card/50 border-zinc-800">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <CardTitle className="text-sm font-medium text-zinc-200">Schedule</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {timeBlocks.map((block, i) => {
                    const BlockIcon = block.icon;
                    const isActive = i === currentBlock;
                    const isPast = currentBlock > i;
                    return (
                      <div
                        key={block.period}
                        className={cn(
                          'rounded-lg border p-3 transition-all',
                          isActive
                            ? 'border-zinc-600 bg-zinc-800/50 ring-1 ring-zinc-700'
                            : isPast
                              ? 'border-zinc-800/50 bg-zinc-900/20 opacity-60'
                              : 'border-zinc-800 bg-zinc-900/20',
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <BlockIcon className={cn('h-3.5 w-3.5', isActive ? 'text-zinc-300' : 'text-zinc-600')} />
                            <span className={cn('text-xs font-medium', isActive ? 'text-zinc-200' : 'text-zinc-500')}>
                              {block.period}
                            </span>
                          </div>
                          <span className={cn('text-[10px]', isActive ? 'text-zinc-400' : 'text-zinc-600')}>
                            {block.time}
                          </span>
                        </div>
                        <p className={cn('text-[11px]', isActive ? 'text-zinc-400' : 'text-zinc-600')}>
                          {block.focus}
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Daily Notes */}
              <Card className="bg-card/50 border-zinc-800">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-amber-400" />
                    <CardTitle className="text-sm font-medium text-zinc-200">Daily Reflection</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What did you learn today? Wins, struggles, thoughts..."
                    className="w-full h-28 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 outline-none resize-none focus:border-zinc-700 transition-colors placeholder:text-zinc-600"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
