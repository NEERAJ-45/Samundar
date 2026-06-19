'use client';

import { Briefcase, Target, Quote, Heart, MapPin, Award, TrendingUp, ChevronRight, Brain, Zap, BookOpen, Star } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const mission = {
  title: "Become a World-Class Software Engineer",
  description:
    "Master the fundamentals, build at scale, and contribute to systems that impact millions. Continuously push the boundaries of what I can build and understand, while mentoring the next generation of engineers.",
};

const targetCompanies = [
  { name: 'Google', level: 'L4 — Senior SWE', icon: 'G', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { name: 'Microsoft', level: 'Senior SWE', icon: 'M', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { name: 'DE Shaw', level: 'Tech Lead', icon: 'D', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { name: 'Stripe', level: 'Staff SWE', icon: 'S', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
];

const milestones = [
  { year: 'Year 1', title: 'Master DSA & System Design Fundamentals', desc: '200+ LeetCode problems, design 10+ systems end-to-end', status: 'in-progress' },
  { year: 'Year 2', title: 'Deep dive into Distributed Systems', desc: 'Build a distributed key-value store, study Paxos/Raft, MIT 6.824', status: 'upcoming' },
  { year: 'Year 3', title: 'Build & Ship Production Systems', desc: 'Lead a meaningful project end-to-end, own production infrastructure', status: 'upcoming' },
  { year: 'Year 5', title: 'Reach Senior Engineer Level', desc: 'Architect systems, mentor juniors, drive technical strategy', status: 'upcoming' },
  { year: 'Year 10', title: 'Staff / Principal Engineer', desc: 'Org-wide impact, define technical vision, industry recognition', status: 'upcoming' },
];

const goals = {
  five: {
    title: '5-Year Goal: Senior Engineer at a Top Tech Company',
    points: [
      'Master distributed systems & large-scale architecture',
      'Ship products used by millions of users',
      'Mentor 3+ junior engineers to their next level',
      'Contribute to open-source projects meaningfully',
      'Build a strong technical writing & speaking portfolio',
    ],
  },
  ten: {
    title: '10-Year Goal: Staff/Principal Engineer or Distinguished Engineer',
    points: [
      'Define technical strategy for a major org or product area',
      'Be a recognized expert in a domain (Distributed Systems / Infra)',
      'Author influential tech talks, papers, or blog posts',
      'Build and lead high-performing engineering teams',
      'Drive industry-level change through systems and tools',
    ],
  },
};

const philosophy = {
  quote:
    "Software engineering is not about knowing all the answers — it's about having the intellectual honesty to ask the right questions, the discipline to build robust systems, and the humility to keep learning every single day.",
};

const principles = [
  { text: 'First Principles Thinking', icon: Brain },
  { text: 'Write Code, Ship Code', icon: Zap },
  { text: 'Fundamentals Over Frameworks', icon: BookOpen },
  { text: 'Measure What Matters', icon: TrendingUp },
  { text: 'Teach to Learn', icon: Heart },
  { text: 'Bias for Action', icon: Zap },
  { text: 'Own Your Outcomes', icon: Target },
  { text: 'Think in Systems', icon: Award },
];

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'in-progress': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  upcoming: 'bg-zinc-800/50 border-zinc-700/20 text-zinc-400',
};

export default function CareerPage() {
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Career Mission Control</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your engineering career north star
            </p>
          </div>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 border-blue-500/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Mission</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">{mission.title}</h2>
              <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">{mission.description}</p>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Target Companies
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {targetCompanies.map((company) => (
                <Card key={company.name} className={cn('bg-card/50', company.border)}>
                  <CardContent className="p-5 space-y-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold', company.bg, company.color)}>
                      {company.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{company.name}</p>
                      <p className="text-xs text-muted-foreground">{company.level}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Career Milestones
            </h2>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800" />
              <div className="space-y-6">
                {milestones.map((m, i) => (
                  <div key={i} className="relative flex gap-6">
                    <div className={cn(
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
                      m.status === 'in-progress' ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-zinc-900'
                    )}>
                      <div className={cn('h-2.5 w-2.5 rounded-full', m.status === 'in-progress' ? 'bg-blue-400' : 'bg-zinc-600')} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium">{m.year}</span>
                        <Badge variant="outline" className={cn('text-[10px]', statusColors[m.status])}>
                          {m.status === 'in-progress' ? 'In Progress' : m.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Star className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">5-Year Goal</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <p className="text-sm font-medium">{goals.five.title}</p>
                <ul className="space-y-2">
                  {goals.five.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-zinc-800">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Award className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">10-Year Goal</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <p className="text-sm font-medium">{goals.ten.title}</p>
                <ul className="space-y-2">
                  {goals.ten.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-purple-400" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 border-amber-500/10">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="h-5 w-5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Engineering Philosophy</span>
              </div>
              <p className="text-lg leading-relaxed italic text-foreground/90">&ldquo;{philosophy.quote}&rdquo;</p>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Core Principles
            </h2>
            <div className="flex flex-wrap gap-3">
              {principles.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.text}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm hover:border-zinc-700 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {p.text}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
