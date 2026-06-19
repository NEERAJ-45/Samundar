'use client';

import { Clock, Flame, BookOpen, Target, TrendingUp, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function BarChart({ data, height = 200 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all duration-500"
            style={{
              height: `${(d.value / max) * 100}%`,
              backgroundColor: d.color || '#3b82f6',
              minHeight: '4px',
            }}
          />
          <span className="text-[10px] text-zinc-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function CircularProgress({ value, size = 100, strokeWidth = 8, color = '#3b82f6' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-lg font-bold">{value}%</span>
    </div>
  );
}

const stats = [
  { label: 'Total Hours', value: '247', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Current Streak', value: '12 days', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Topics Covered', value: '36', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Avg Mastery', value: '3.2 / 5', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const masteryGrowth = [
  { label: 'Week 1', value: 1.2, color: '#3b82f6' },
  { label: 'Week 2', value: 1.8, color: '#3b82f6' },
  { label: 'Week 3', value: 2.1, color: '#6366f1' },
  { label: 'Week 4', value: 2.5, color: '#6366f1' },
  { label: 'Week 5', value: 2.8, color: '#8b5cf6' },
  { label: 'Week 6', value: 3.2, color: '#8b5cf6' },
  { label: 'Week 7', value: 3.0, color: '#a855f7' },
  { label: 'Week 8', value: 3.5, color: '#a855f7' },
];

const knowledgeGrowth = [
  { label: 'DSA', value: 85, color: '#3b82f6' },
  { label: 'System\nDesign', value: 60, color: '#10b981' },
  { label: 'Core CS', value: 72, color: '#8b5cf6' },
  { label: 'DevOps', value: 45, color: '#f59e0b' },
  { label: 'Projects', value: 90, color: '#ef4444' },
];

const masteryDistribution = [
  { label: 'L0', value: 2, color: '#27272a' },
  { label: 'L1', value: 4, color: '#3f3f46' },
  { label: 'L2', value: 8, color: '#52525b' },
  { label: 'L3', value: 12, color: '#3b82f6' },
  { label: 'L4', value: 7, color: '#6366f1' },
  { label: 'L5', value: 3, color: '#8b5cf6' },
];

const weakAreas = [
  { topic: 'Distributed Systems', mastery: 1.5 },
  { topic: 'Network Protocols', mastery: 1.8 },
  { topic: 'Operating Systems', mastery: 2.0 },
  { topic: 'Database Internals', mastery: 2.2 },
];

const strongAreas = [
  { topic: 'Arrays & Hashing', mastery: 4.8 },
  { topic: 'Trees & Graphs', mastery: 4.5 },
  { topic: 'System Design Basics', mastery: 4.2 },
  { topic: 'OOP & Design Patterns', mastery: 4.0 },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics Center</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Data-driven insights into your engineering journey
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card/50 border-zinc-800">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', stat.bg)}>
                      <Icon className={cn('h-5 w-5', stat.color)} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-zinc-800 lg:col-span-1">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-medium">Mastery Growth</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <BarChart data={masteryGrowth} height={180} />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800 lg:col-span-1">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm font-medium">Knowledge Growth</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <BarChart data={knowledgeGrowth} height={180} />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800 lg:col-span-1">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <CardTitle className="text-sm font-medium">Mastery Distribution</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <BarChart data={masteryDistribution} height={180} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <CardTitle className="text-sm font-medium">Weak Areas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {weakAreas.map((area) => (
                  <div key={area.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{area.topic}</span>
                      <span className="text-muted-foreground text-xs">{area.mastery.toFixed(1)} / 5</span>
                    </div>
                    <Progress value={(area.mastery / 5) * 100} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-sm font-medium">Strong Areas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                {strongAreas.map((area) => (
                  <div key={area.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{area.topic}</span>
                      <span className="text-muted-foreground text-xs">{area.mastery.toFixed(1)} / 5</span>
                    </div>
                    <Progress value={(area.mastery / 5) * 100} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <CardTitle className="text-sm font-medium">Revision Accuracy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex flex-col items-center justify-center gap-4">
                <CircularProgress value={78} size={140} strokeWidth={10} color="#3b82f6" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">+5% this week</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full text-center text-xs">
                  <div>
                    <p className="text-lg font-bold text-green-400">92%</p>
                    <p className="text-muted-foreground">DSA</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-400">65%</p>
                    <p className="text-muted-foreground">System Design</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
