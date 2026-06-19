"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const today = new Date();
const dateStr = today.toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const categories = [
  {
    id: "dsa",
    title: "Today's DSA",
    icon: Code,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    tasks: [
      {
        id: "dsa-1",
        title:
          "Sliding Window — Longest Substring Without Repeating Characters",
        time: "45 min",
        difficulty: "Medium",
      },
      {
        id: "dsa-2",
        title: "Dynamic Programming — House Robber III (Tree DP)",
        time: "45 min",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "system-design",
    title: "Today's System Design",
    icon: Building2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    tasks: [
      {
        id: "sd-1",
        title: "Design a Rate Limiter — Token Bucket & Sliding Window",
        time: "60 min",
        difficulty: "Medium",
      },
    ],
  },
  {
    id: "core-cs",
    title: "Today's Core CS",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    tasks: [
      {
        id: "cs-1",
        title: "Database Indexing — B-Trees vs LSM Trees",
        time: "30 min",
        difficulty: "Medium",
      },
      {
        id: "cs-2",
        title: "OS — Memory Management & Paging",
        time: "30 min",
        difficulty: "Medium",
      },
    ],
  },
  {
    id: "project",
    title: "Today's Project Work",
    icon: Zap,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    tasks: [
      {
        id: "proj-1",
        title: "ProdigyOS — Build Analytics Dashboard Components",
        time: "90 min",
        difficulty: "Advanced",
      },
    ],
  },
  {
    id: "revision",
    title: "Today's Revision",
    icon: RefreshCw,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20",
    tasks: [
      {
        id: "rev-1",
        title: "Review — Graph Algorithms (DFS, BFS, Topological Sort)",
        time: "20 min",
        difficulty: "Easy",
      },
      {
        id: "rev-2",
        title: "Review — CAP Theorem & PACELC",
        time: "15 min",
        difficulty: "Easy",
      },
      {
        id: "rev-3",
        title: "Review — Past Week DSA Problems",
        time: "25 min",
        difficulty: "Easy",
      },
    ],
  },
];

const timeBlocks = [
  {
    period: "Morning",
    time: "6:00 — 9:00",
    focus: "Light Revision & DSA Warm-up",
    color: "bg-blue-500/10 border-blue-500/20",
  },
  {
    period: "Deep Work",
    time: "9:00 — 12:00",
    focus: "System Design & Core CS Deep Dive",
    color: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    period: "Break",
    time: "12:00 — 1:00",
    focus: "Rest & Recharge",
    color: "bg-zinc-800/50 border-zinc-700/20",
  },
  {
    period: "Afternoon",
    time: "1:00 — 4:00",
    focus: "Project Work — Ship Features",
    color: "bg-amber-500/10 border-amber-500/20",
  },
  {
    period: "Evening",
    time: "4:00 — 6:00",
    focus: "DSA Practice & Problem Solving",
    color: "bg-purple-500/10 border-purple-500/20",
  },
  {
    period: "Review",
    time: "6:00 — 7:00",
    focus: "Daily Review & Plan Tomorrow",
    color: "bg-rose-500/10 border-rose-500/20",
  },
];

function difficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Easy":
      return "text-green-400 bg-green-500/10 border-green-500/20";
    case "Medium":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Hard":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    case "Advanced":
      return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    default:
      return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
  }
}

export default function DailyPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  const completedCount = completed.size;
  const progressPct =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Daily Execution Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plan and execute your daily engineering practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1 bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center space-y-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-muted-foreground">{dateStr}</span>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <Flame className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.5</p>
                  <p className="text-xs text-muted-foreground">Hours Today</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-zinc-800">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{progressPct}%</p>
                  <p className="text-xs text-muted-foreground">
                    Daily Progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const catCompleted = category.tasks.filter((t) =>
                completed.has(t.id),
              ).length;
              return (
                <Card
                  key={category.id}
                  className={cn("bg-card/50", category.borderColor)}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          category.bgColor,
                        )}
                      >
                        <Icon className={cn("h-4 w-4", category.color)} />
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {category.title}
                      </CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {catCompleted}/{category.tasks.length}
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    {category.tasks.map((task) => {
                      const isDone = completed.has(task.id);
                      return (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={cn(
                            "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                            isDone
                              ? "border-emerald-500/20 bg-emerald-500/5"
                              : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50",
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-zinc-600" />
                          )}
                          <span
                            className={cn(
                              "flex-1 text-sm",
                              isDone && "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {task.time}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              difficultyColor(task.difficulty),
                            )}
                          >
                            {task.difficulty}
                          </Badge>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Time Blocks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {timeBlocks.map((block) => (
                <Card
                  key={block.period}
                  className={cn("bg-card/50", block.color)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {block.period}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {block.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {block.focus}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
