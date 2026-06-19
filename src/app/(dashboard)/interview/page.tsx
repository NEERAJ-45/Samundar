'use client';

import * as React from 'react';
import { Search, Brain, Target, Code2, Server, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type QuestionType = 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'CORE_CS' | 'LANGUAGE' | 'FRAMEWORK';

interface InterviewQuestion {
  id: string;
  question: string;
  type: QuestionType;
  confidence: number;
  attempts: number;
}

const typeConfig: Record<QuestionType, { label: string; color: string }> = {
  DSA: { label: 'DSA', color: 'bg-blue-950 text-blue-300 border-blue-800' },
  SYSTEM_DESIGN: { label: 'System Design', color: 'bg-violet-950 text-violet-300 border-violet-800' },
  BEHAVIORAL: { label: 'Behavioral', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  CORE_CS: { label: 'Core CS', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  LANGUAGE: { label: 'Language', color: 'bg-rose-950 text-rose-300 border-rose-800' },
  FRAMEWORK: { label: 'Framework', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
};

const questions: InterviewQuestion[] = [
  { id: '1', question: 'Implement a LRU Cache with O(1) operations', type: 'DSA', confidence: 4, attempts: 3 },
  { id: '2', question: 'Reverse a linked list iteratively and recursively', type: 'DSA', confidence: 5, attempts: 5 },
  { id: '3', question: 'Design a URL shortening service like TinyURL', type: 'SYSTEM_DESIGN', confidence: 3, attempts: 2 },
  { id: '4', question: 'Design a real-time chat system', type: 'SYSTEM_DESIGN', confidence: 3, attempts: 1 },
  { id: '5', question: 'Tell me about a time you handled a production outage', type: 'BEHAVIORAL', confidence: 4, attempts: 4 },
  { id: '6', question: 'Describe a conflict you resolved on your team', type: 'BEHAVIORAL', confidence: 5, attempts: 3 },
  { id: '7', question: 'Explain virtual memory and paging', type: 'CORE_CS', confidence: 3, attempts: 2 },
  { id: '8', question: 'How does TCP congestion control work?', type: 'CORE_CS', confidence: 2, attempts: 1 },
  { id: '9', question: 'Explain closures and prototypal inheritance in JavaScript', type: 'LANGUAGE', confidence: 4, attempts: 3 },
  { id: '10', question: 'What is the React reconciliation algorithm?', type: 'FRAMEWORK', confidence: 3, attempts: 2 },
];

function ConfidenceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-colors',
            i < level ? 'bg-emerald-500' : 'bg-zinc-800'
          )}
        />
      ))}
    </div>
  );
}

function TypeBadge({ type }: { type: QuestionType }) {
  const config = typeConfig[type];
  return (
    <Badge variant="outline" className={cn('text-[10px] font-medium', config.color)}>
      {config.label}
    </Badge>
  );
}

export default function InterviewPage() {
  const [search, setSearch] = React.useState('');

  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<QuestionType, InterviewQuestion[]>>((acc, q) => {
    if (!acc[q.type]) acc[q.type] = [];
    acc[q.type].push(q);
    return acc;
  }, {} as Record<QuestionType, InterviewQuestion[]>);

  const typeOrder: QuestionType[] = ['DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'CORE_CS', 'LANGUAGE', 'FRAMEWORK'];

  const stats = [
    { label: 'Questions Attempted', value: questions.length, icon: Brain, color: 'text-blue-400' },
    { label: 'Avg Confidence', value: (questions.reduce((a, q) => a + q.confidence, 0) / questions.length).toFixed(1), icon: Target, color: 'text-emerald-400' },
    { label: 'DSA Questions', value: questions.filter((q) => q.type === 'DSA').length, icon: Code2, color: 'text-violet-400' },
    { label: 'System Design', value: questions.filter((q) => q.type === 'SYSTEM_DESIGN').length, icon: Server, color: 'text-amber-400' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Interview Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">Prepare for technical interviews</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn('p-2.5 rounded-lg bg-zinc-800/50', stat.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-zinc-100">{stat.value}</p>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
          />
        </div>

        <div className="space-y-6">
          {typeOrder.map((type) => {
            const items = grouped[type];
            if (!items || items.length === 0) return null;
            const config = typeConfig[type];
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={cn('text-xs font-medium', config.color)}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-zinc-600">{items.length} questions</span>
                </div>
                <div className="space-y-2">
                  {items.map((q) => (
                    <Card key={q.id} className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-200">{q.question}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <ConfidenceDots level={q.confidence} />
                            <span className="text-[11px] text-zinc-600">
                              {q.attempts} attempt{q.attempts !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <TypeBadge type={q.type} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
