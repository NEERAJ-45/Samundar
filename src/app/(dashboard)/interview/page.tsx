'use client';

import * as React from 'react';
import {
  Search, Brain, Target, Code2, Server, BarChart3,
  Plus, Pencil, Trash2, CheckCircle, X, GripVertical, BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/providers/ProfileProvider';
import CategoryBrowser from '@/components/roadmaps/CategoryBrowser';

function log(userEmail: string, text: string) {
  fetch('/api/db/activity', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, text }),
  }).catch(() => {});
}

type QuestionType = 'DSA' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'CORE_CS' | 'LANGUAGE' | 'FRAMEWORK';

interface InterviewQuestion {
  id: string;
  question: string;
  type: QuestionType;
  confidence: number;
  attempts: number;
  mastered: boolean;
}

const STORAGE_KEY = 'interview-questions';

const typeConfig: Record<QuestionType, { label: string; color: string }> = {
  DSA: { label: 'DSA', color: 'bg-blue-950 text-blue-300 border-blue-800' },
  SYSTEM_DESIGN: { label: 'System Design', color: 'bg-violet-950 text-violet-300 border-violet-800' },
  BEHAVIORAL: { label: 'Behavioral', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  CORE_CS: { label: 'Core CS', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  LANGUAGE: { label: 'Language', color: 'bg-rose-950 text-rose-300 border-rose-800' },
  FRAMEWORK: { label: 'Framework', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
};

const defaultQuestions: InterviewQuestion[] = [
  { id: '1', question: 'Implement a LRU Cache with O(1) operations', type: 'DSA', confidence: 4, attempts: 3, mastered: true },
  { id: '2', question: 'Reverse a linked list iteratively and recursively', type: 'DSA', confidence: 5, attempts: 5, mastered: true },
  { id: '3', question: 'Design a URL shortening service like TinyURL', type: 'SYSTEM_DESIGN', confidence: 3, attempts: 2, mastered: false },
  { id: '4', question: 'Design a real-time chat system', type: 'SYSTEM_DESIGN', confidence: 3, attempts: 1, mastered: false },
  { id: '5', question: 'Tell me about a time you handled a production outage', type: 'BEHAVIORAL', confidence: 4, attempts: 4, mastered: true },
  { id: '6', question: 'Explain virtual memory and paging', type: 'CORE_CS', confidence: 3, attempts: 2, mastered: false },
  { id: '7', question: 'Explain closures and prototypal inheritance in JavaScript', type: 'LANGUAGE', confidence: 4, attempts: 3, mastered: false },
  { id: '8', question: 'What is the React reconciliation algorithm?', type: 'FRAMEWORK', confidence: 3, attempts: 2, mastered: false },
];

function ConfidenceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={cn('h-1.5 w-1.5 rounded-full', i < level ? 'bg-emerald-500' : 'bg-zinc-800')} />
      ))}
    </div>
  );
}

function TypeBadge({ type }: { type: QuestionType }) {
  const config = typeConfig[type];
  return <Badge variant="outline" className={cn('text-[10px] font-medium', config.color)}>{config.label}</Badge>;
}

const typeOrder: QuestionType[] = ['DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'CORE_CS', 'LANGUAGE', 'FRAMEWORK'];
const allTypes: QuestionType[] = ['DSA', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'CORE_CS', 'LANGUAGE', 'FRAMEWORK'];

export default function InterviewPage() {
  const { userEmail } = useProfile();
  const [activeTab, setActiveTab] = React.useState<'questions' | 'theory'>('questions');
  const [questions, setQuestions] = React.useState<InterviewQuestion[]>([]);
  const [search, setSearch] = React.useState('');
  const [mounted, setMounted] = React.useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formQuestion, setFormQuestion] = React.useState('');
  const [formType, setFormType] = React.useState<QuestionType>('DSA');
  const [formConfidence, setFormConfidence] = React.useState(3);
  const [formAttempts, setFormAttempts] = React.useState(1);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setQuestions(JSON.parse(saved)); } catch {}
    } else {
      setQuestions(defaultQuestions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultQuestions));
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions, mounted]);

  function openAdd() {
    setEditingId(null);
    setFormQuestion('');
    setFormType('DSA');
    setFormConfidence(3);
    setFormAttempts(1);
    setDialogOpen(true);
  }

  function openEdit(q: InterviewQuestion) {
    setEditingId(q.id);
    setFormQuestion(q.question);
    setFormType(q.type);
    setFormConfidence(q.confidence);
    setFormAttempts(q.attempts);
    setDialogOpen(true);
  }

  function save() {
    if (!formQuestion.trim()) return;
    if (editingId) {
      setQuestions((prev) => prev.map((q) => q.id === editingId ? { ...q, question: formQuestion.trim(), type: formType, confidence: formConfidence, attempts: formAttempts } : q));
    } else {
      const newQ: InterviewQuestion = { id: `q-${Date.now()}`, question: formQuestion.trim(), type: formType, confidence: formConfidence, attempts: formAttempts, mastered: false };
      setQuestions((prev) => [...prev, newQ]);
      if (userEmail) log(userEmail, `Added interview question "${formQuestion.trim()}"`);
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    const q = questions.find((x) => x.id === id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (userEmail && q) log(userEmail, `Removed interview question "${q.question}"`);
  }

  function toggleMastered(id: string) {
    const q = questions.find((x) => x.id === id);
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, mastered: !q.mastered } : q));
    if (userEmail && q) log(userEmail, `${q.mastered ? 'Unmarked' : 'Marked'} interview question "${q.question}"`);
  }

  const filtered = questions.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, InterviewQuestion[]>>((acc, q) => {
    if (!acc[q.type]) acc[q.type] = [];
    acc[q.type].push(q);
    return acc;
  }, {} as Record<string, InterviewQuestion[]>);

  const masteredCount = React.useMemo(() => questions.filter((q) => q.mastered).length, [questions]);

  const stats = React.useMemo(() => [
    { label: 'Questions', value: questions.length, icon: Brain, color: 'text-blue-400' },
    { label: 'Mastered', value: masteredCount, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Avg Confidence', value: questions.length > 0 ? (questions.reduce((a, q) => a + q.confidence, 0) / questions.length).toFixed(1) : '0', icon: Target, color: 'text-emerald-400' },
    { label: 'DSA', value: questions.filter((q) => q.type === 'DSA').length, icon: Code2, color: 'text-violet-400' },
    { label: 'System Design', value: questions.filter((q) => q.type === 'SYSTEM_DESIGN').length, icon: Server, color: 'text-amber-400' },
  ], [questions, masteredCount]);

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
      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Interview Hub</h1>
            <p className="text-sm text-zinc-500 mt-1">Prepare for technical interviews</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 gap-2 select-none overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'questions'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Brain className="h-4 w-4" />
            My Questions
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'theory'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Theory Roadmaps
          </button>
        </div>

        {/* ─── My Questions Tab ───────────────────────────── */}
        {activeTab === 'questions' && (
          <>
            <div className="flex items-start justify-between">
              <div />
              <Button variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {questions.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{masteredCount}/{questions.length} mastered</span>
                  <span>{Math.round((masteredCount / questions.length) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-500',
                      masteredCount / questions.length >= 1 ? 'bg-emerald-500' :
                      masteredCount / questions.length >= 0.6 ? 'bg-blue-500' :
                      masteredCount / questions.length >= 0.3 ? 'bg-amber-500' : 'bg-zinc-500'
                    )}
                    style={{ width: `${(masteredCount / questions.length) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-6">
              {typeOrder.map((type) => {
                const items = grouped[type];
                if (!items?.length) return null;
                const config = typeConfig[type];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className={cn('text-xs font-medium', config.color)}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-zinc-600">{items.length} question{items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((q) => (
                        <Card key={q.id} className={cn('border-zinc-800 transition-colors group', q.mastered ? 'bg-zinc-900/20' : 'bg-zinc-900/30 hover:bg-zinc-900/50')}>
                          <CardContent className="p-4 flex items-center gap-3">
                            <button onClick={() => toggleMastered(q.id)}
                              className={cn('shrink-0 p-1 rounded-md transition-colors',
                                q.mastered ? 'text-emerald-500 hover:text-emerald-400' : 'text-zinc-700 hover:text-zinc-400'
                              )}>
                              <CheckCircle className={cn('h-5 w-5', q.mastered && 'fill-emerald-500/20')} />
                            </button>
                            <div className={cn('flex-1 min-w-0', q.mastered && 'opacity-60')}>
                              <p className="text-sm text-zinc-200">{q.question}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <ConfidenceDots level={q.confidence} />
                                <span className="text-[11px] text-zinc-600">{q.attempts} attempt{q.attempts !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <TypeBadge type={q.type} />
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(q)} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => remove(q.id)} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Brain className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No questions found.</p>
                  <Button variant="outline" size="sm" onClick={openAdd} className="mt-3 gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add your first
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── Theory Roadmaps Tab ─────────────────────────── */}
        {activeTab === 'theory' && (
          <div className="space-y-4">
            <CategoryBrowser />
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">{editingId ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Question</label>
              <textarea
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="Enter interview question..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-sm text-zinc-200 outline-none resize-none focus:border-zinc-600 placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {allTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
                      formType === t
                        ? typeConfig[t].color + ' border-current'
                        : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600',
                    )}
                  >
                    {typeConfig[t].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Confidence (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFormConfidence(n)}
                      className={cn(
                        'w-8 h-8 rounded-md text-xs font-medium border transition-colors',
                        formConfidence >= n
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'border-zinc-700 text-zinc-500 hover:border-zinc-600',
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Attempts</label>
                <Input
                  type="number"
                  min={0}
                  value={formAttempts}
                  onChange={(e) => setFormAttempts(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-zinc-800 border-zinc-700 text-zinc-200"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={!formQuestion.trim()}>
              {editingId ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
