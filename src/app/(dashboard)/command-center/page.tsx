import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyAppear } from "@/components/shared/LazyAppear";
import {
  Zap,
  TrendingUp,
  Calendar,
  BrainCircuit,
  BookOpen,
  RefreshCw,
  FolderKanban,
  StickyNote,
  Clock,
  ArrowRight,
} from "lucide-react";

const stats = [
  { icon: Zap, value: "12", label: "Current Streak", sub: "days" },
  {
    icon: TrendingUp,
    value: "78%",
    label: "Weekly Progress",
    sub: "4 of 5 goals",
  },
  {
    icon: Calendar,
    value: "62%",
    label: "Monthly Progress",
    sub: "18 of 29 hrs",
  },
  {
    icon: BrainCircuit,
    value: "73%",
    label: "Interview Readiness",
    sub: "Strong",
  },
];

const quickActions = [
  {
    icon: BookOpen,
    title: "Continue Learning",
    description: "Resume Binary Search Trees",
    color: "text-blue-400",
  },
  {
    icon: RefreshCw,
    title: "Start Revision",
    description: "Review due concepts",
    color: "text-emerald-400",
  },
  {
    icon: FolderKanban,
    title: "Open Project",
    description: "ProdigyOS dashboard",
    color: "text-violet-400",
  },
  {
    icon: StickyNote,
    title: "Add Note",
    description: "Capture a new insight",
    color: "text-amber-400",
  },
  {
    icon: Clock,
    title: "Log Session",
    description: "Record learning hours",
    color: "text-rose-400",
  },
];

const focusItems = [
  {
    label: "Active Pillar",
    value: "Data Structures & Algorithms",
    badge: "Trees",
  },
  { label: "Next Learning Unit", value: "AVL Tree Rotations", badge: "45 min" },
  { label: "Due Revisions", value: "3 concepts need review", badge: "Overdue" },
];

const projects = [
  { name: "ProdigyOS Dashboard", status: "IN_PROGRESS", progress: "65%" },
  { name: "CLI Task Manager", status: "MAINTAINING", progress: "90%" },
  { name: "API Gateway", status: "COMPLETED", progress: "100%" },
];

const activities = [
  'Completed "QuickSort Deep Dive" revision',
  "Added 3 notes to System Design",
  "Logged 2.5 hrs on Dynamic Programming",
  "Updated AVL Tree mastery to level 3",
];

export default function CommandCenterPage() {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 space-y-8 p-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Your engineering mastery platform — overview at a glance.
          </p>
        </div>

        <LazyAppear>
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-400">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-zinc-500">{stat.sub}</p>
                      </div>
                      <div className="rounded-lg bg-zinc-800/50 p-2.5">
                        <Icon className="h-5 w-5 text-zinc-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </LazyAppear>

        <LazyAppear delay={0.1}>
          <div>
            <h2 className="text-sm font-medium text-zinc-300 mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.title}
                    className="cursor-pointer transition hover:bg-zinc-800/50"
                  >
                    <CardContent className="p-5 space-y-3">
                      <div
                        className={`rounded-lg bg-zinc-800/50 p-2.5 w-fit ${action.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </LazyAppear>

        <LazyAppear delay={0.2}>
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {focusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs text-zinc-400">{item.label}</p>
                      <p className="text-sm font-medium mt-0.5">{item.value}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Current Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.name}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {project.status.replace("_", " ")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {project.progress}
                    </Badge>
                  </div>
                ))}
                <button className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mt-2">
                  View all <ArrowRight className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          </div>
        </LazyAppear>

        <LazyAppear delay={0.3}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 shrink-0" />
                    <p className="text-sm text-zinc-300">{activity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LazyAppear>
      </div>
    </div>
  );
}
