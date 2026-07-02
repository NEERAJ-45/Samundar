'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
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
  Trash2,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/providers/ProfileProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STORAGE_KEY = 'daily-completions';
const NOTES_KEY = 'daily-notes';
const SCHEDULE_KEY = 'daily-schedule';

interface TimeBlock {
  id: string;
  period: string;
  time: string;
  focus: string;
}

const defaultBlocks: TimeBlock[] = [
  { id: 'morning', period: 'Morning', time: '6:00 — 9:00', focus: 'Light Revision & DSA Warm-up' },
  { id: 'deep-work', period: 'Deep Work', time: '9:00 — 12:00', focus: 'System Design & Core CS Deep Dive' },
  { id: 'break', period: 'Break', time: '12:00 — 1:00', focus: 'Rest & Recharge' },
  { id: 'afternoon', period: 'Afternoon', time: '1:00 — 4:00', focus: 'Project Work — Ship Features' },
  { id: 'evening', period: 'Evening', time: '4:00 — 6:00', focus: 'DSA Practice & Problem Solving' },
  { id: 'review', period: 'Review', time: '6:00 — 7:00', focus: 'Daily Review & Plan Tomorrow' },
];

const blockColors = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: BookOpen },
  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: Target },
  { bg: 'bg-zinc-800/50', border: 'border-zinc-700/20', text: 'text-zinc-400', icon: Clock },
  { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: Zap },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: Code },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: RefreshCw },
];

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

const TIME_SLOTS = [
  { start: 360, end: 540 },   // 6:00-9:00
  { start: 540, end: 720 },   // 9:00-12:00
  { start: 720, end: 780 },   // 12:00-13:00
  { start: 780, end: 960 },   // 13:00-16:00
  { start: 960, end: 1080 },  // 16:00-18:00
  { start: 1080, end: 1140 }, // 18:00-19:00
];

function getCurrentBlockIndex(timeBlocks: TimeBlock[]): number {
  const h = today.getHours();
  const m = today.getMinutes();
  const totalMinutes = h * 60 + m;
  return TIME_SLOTS.findIndex((slot) => totalMinutes >= slot.start && totalMinutes < slot.end);
}

export default function DailyPage() {
  const { userEmail } = useProfile();
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const mounted = useMounted();
  const [note, setNote] = React.useState('');
  const [customTasks, setCustomTasks] = React.useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [taskCategories, setTaskCategories] = React.useState<Category[]>(categories);
  const [timeBlocks, setTimeBlocks] = React.useState<TimeBlock[]>([]);
  const [editingBlockId, setEditingBlockId] = React.useState<string | null>(null);
  const [editBlockPeriod, setEditBlockPeriod] = React.useState('');
  const [editBlockTime, setEditBlockTime] = React.useState('');
  const [editBlockFocus, setEditBlockFocus] = React.useState('');
  const [showAddBlock, setShowAddBlock] = React.useState(false);
  const [newBlockPeriod, setNewBlockPeriod] = React.useState('');
  const [newBlockTime, setNewBlockTime] = React.useState('');
  const [newBlockFocus, setNewBlockFocus] = React.useState('');

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Record<string, string[]> = JSON.parse(saved);
        const todayCompleted = parsed[todayKey] || [];
        setCompleted(new Set(todayCompleted));
      } catch {}
    }
    const savedSchedule = localStorage.getItem(SCHEDULE_KEY);
    if (savedSchedule) {
      try { setTimeBlocks(JSON.parse(savedSchedule)); }
      catch { setTimeBlocks(defaultBlocks); }
    } else {
      setTimeBlocks(defaultBlocks);
    }
    const savedNote = localStorage.getItem(NOTES_KEY);
    if (savedNote) {
      try {
        const notes: Record<string, string> = JSON.parse(savedNote);
        setNote(notes[todayKey] || '');
      } catch {}
    }
    (async () => {
      try {
        const res = await fetch(`/api/db/daily?date=${todayKey}`);
        const json = await res.json();
        if (json.record) {
          if (json.record.completedTaskIds?.length) {
            setCompleted(new Set(json.record.completedTaskIds));
          }
          if (json.record.note) {
            setNote(json.record.note);
          }
        }
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const saved: Record<string, string[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved[todayKey] = Array.from(completed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    debouncedSync(completed, note);
  }, [completed, mounted]);

  React.useEffect(() => {
    if (!mounted) return;
    const saved: Record<string, string> = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    saved[todayKey] = note;
    localStorage.setItem(NOTES_KEY, JSON.stringify(saved));
    debouncedSync(completed, note);
  }, [note, mounted]);

  React.useEffect(() => {
    if (!mounted || timeBlocks.length === 0) return;
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(timeBlocks));
  }, [timeBlocks, mounted]);

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

  function addBlock() {
    if (!newBlockPeriod.trim() || !newBlockTime.trim()) return;
    const block: TimeBlock = {
      id: `block-${Date.now()}`,
      period: newBlockPeriod.trim(),
      time: newBlockTime.trim(),
      focus: newBlockFocus.trim(),
    };
    setTimeBlocks((prev) => [...prev, block]);
    setNewBlockPeriod('');
    setNewBlockTime('');
    setNewBlockFocus('');
    setShowAddBlock(false);
  }

  function deleteBlock(id: string) {
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  function startEditBlock(block: TimeBlock) {
    setEditingBlockId(block.id);
    setEditBlockPeriod(block.period);
    setEditBlockTime(block.time);
    setEditBlockFocus(block.focus);
  }

  function saveEditBlock() {
    if (!editBlockPeriod.trim() || !editBlockTime.trim() || !editingBlockId) return;
    setTimeBlocks((prev) =>
      prev.map((b) =>
        b.id === editingBlockId
          ? { ...b, period: editBlockPeriod.trim(), time: editBlockTime.trim(), focus: editBlockFocus.trim() }
          : b
      )
    );
    setEditingBlockId(null);
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
  const syncRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  async function syncDailyToServer(ids: Set<string>, noteText: string) {
    if (!userEmail) return;
    try {
      await fetch('/api/db/daily', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayKey,
          completedTaskIds: Array.from(ids),
          note: noteText,
        }),
      });
    } catch {}
  }

  function debouncedSync(ids: Set<string>, noteText: string) {
    if (syncRef.current) clearTimeout(syncRef.current);
    syncRef.current = setTimeout(() => syncDailyToServer(ids, noteText), 2000);
  }

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

  const currentBlock = getCurrentBlockIndex(timeBlocks);
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
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Today's Schedule</h1>
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

          {/* Time Blocks — Editable Schedule */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Time Blocks</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddBlock((p) => !p)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Block
            </Button>
          </div>

          {showAddBlock && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-3">
              <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                <Input value={newBlockPeriod} onChange={(e) => setNewBlockPeriod(e.target.value)} placeholder="Period name" className="h-8 text-sm bg-zinc-800 border-zinc-700 w-full sm:w-28" onKeyDown={(e) => { if (e.key === 'Enter') addBlock(); }} />
                <Input value={newBlockTime} onChange={(e) => setNewBlockTime(e.target.value)} placeholder="e.g. 9:00 — 12:00" className="h-8 text-sm bg-zinc-800 border-zinc-700 w-full sm:w-36" onKeyDown={(e) => { if (e.key === 'Enter') addBlock(); }} />
                <Input value={newBlockFocus} onChange={(e) => setNewBlockFocus(e.target.value)} placeholder="Focus description" className="h-8 text-sm bg-zinc-800 border-zinc-700 flex-1 min-w-0" onKeyDown={(e) => { if (e.key === 'Enter') addBlock(); }} />
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <Button size="sm" onClick={addBlock} disabled={!newBlockPeriod.trim() || !newBlockTime.trim()}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowAddBlock(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {timeBlocks.map((block, i) => {
              const color = blockColors[i % blockColors.length];
              const BlockIcon = color.icon;
              const isActive = i === currentBlock;
              const isPast = currentBlock > i;
              const isEditing = editingBlockId === block.id;

              if (isEditing) {
                return (
                  <div key={block.id} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-3 space-y-2">
                    <Input value={editBlockPeriod} onChange={(e) => setEditBlockPeriod(e.target.value)} className="h-7 text-xs bg-zinc-800 border-zinc-700" onKeyDown={(e) => { if (e.key === 'Enter') saveEditBlock(); if (e.key === 'Escape') setEditingBlockId(null); }} autoFocus />
                    <Input value={editBlockTime} onChange={(e) => setEditBlockTime(e.target.value)} className="h-7 text-xs bg-zinc-800 border-zinc-700" onKeyDown={(e) => { if (e.key === 'Enter') saveEditBlock(); if (e.key === 'Escape') setEditingBlockId(null); }} />
                    <Input value={editBlockFocus} onChange={(e) => setEditBlockFocus(e.target.value)} className="h-7 text-xs bg-zinc-800 border-zinc-700" onKeyDown={(e) => { if (e.key === 'Enter') saveEditBlock(); if (e.key === 'Escape') setEditingBlockId(null); }} />
                    <div className="flex gap-1 pt-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500 hover:text-green-400" onClick={saveEditBlock}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-400" onClick={() => setEditingBlockId(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={block.id}
                  className={cn(
                    'rounded-lg border p-3 transition-all text-center relative group',
                    isActive
                      ? 'border-zinc-600 bg-zinc-800/50 ring-1 ring-zinc-700'
                      : isPast
                        ? 'border-zinc-800/50 bg-zinc-900/20 opacity-60'
                        : 'border-zinc-800 bg-zinc-900/20',
                  )}
                >
                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditBlock(block)} className="p-0.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteBlock(block.id)} className="p-0.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <BlockIcon className={cn('h-4 w-4 mx-auto mb-1.5', isActive ? 'text-zinc-300' : 'text-zinc-500')} />
                  <span className={cn('text-xs font-medium block', isActive ? 'text-zinc-200' : 'text-zinc-400')}>
                    {block.period}
                  </span>
                  <span className="text-[10px] text-zinc-600 block mt-0.5">{block.time}</span>
                  <p className={cn('text-[10px] mt-1 leading-tight', isActive ? 'text-zinc-400' : 'text-zinc-600')}>
                    {block.focus}
                  </p>
                </div>
              );
            })}
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
                                  <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConfig[task.priority].className)}>
                                      {priorityConfig[task.priority].label}
                                    </Badge>
                                    <Badge variant="outline" className={cn('hidden sm:inline-flex text-[10px] px-1.5 py-0', difficultyColor(task.difficulty))}>
                                      {task.difficulty}
                                    </Badge>
                                    <span className="text-[11px] md:text-xs text-zinc-600 w-10 md:w-12 text-right shrink-0">{task.time}</span>
                                    <button onClick={(e) => { e.preventDefault(); handleStartEditTask(task); }} className="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                      <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
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
                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityConfig[task.priority].className)}>
                                    {priorityConfig[task.priority].label}
                                  </Badge>
                                  <Badge variant="outline" className={cn('hidden sm:inline-flex text-[10px] px-1.5 py-0', difficultyColor(task.difficulty))}>
                                    {task.difficulty}
                                  </Badge>
                                  <span className="text-[11px] md:text-xs text-zinc-600 w-10 md:w-12 text-right shrink-0">{task.time}</span>
                                  <button onClick={() => handleStartEditTask(task)} className="p-1 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                    <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5" />
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
