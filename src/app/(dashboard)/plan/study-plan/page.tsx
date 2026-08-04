'use client';

import * as React from 'react';
import { Notebook, Circle, CheckCircle2, Upload, Trash2, ChevronLeft, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Item { id: string; text: string; done: boolean; }
interface Day { label: string; items: Item[]; }
interface Week { title: string; days: Day[]; }
interface Plan { name: string; weeks: Week[]; createdAt: number; }

let c = 0;
const id = () => `${++c}-${Date.now().toString(36)}`;

const STORAGE_KEY = 'samundar-study-plans';

function parse(text: string): Week[] {
  const weeks: Week[] = [];
  let week: Week | null = null;
  let day: Day | null = null;

  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;

    if (/^week\s+\d/i.test(t)) {
      week = { title: t, days: [] };
      weeks.push(week);
      day = null;
    } else if (/^day\s+\d/i.test(t)) {
      if (week) {
        day = { label: t, items: [] };
        week.days.push(day);
      }
    } else if (day) {
      day.items.push({ id: id(), text: t, done: false });
    }
  }
  return weeks;
}

function load(): Record<string, Plan> {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (r) {
      const parsed = JSON.parse(r);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {}
  return {};
}

function save(plans: Record<string, Plan>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function grouped(plan: Plan) {
  const all = plan.weeks.reduce((s, w) => s + w.days.reduce((s2, d) => s2 + d.items.length, 0), 0);
  const done = plan.weeks.reduce((s, w) => s + w.days.reduce((s2, d) => s2 + d.items.filter(x => x.done).length, 0), 0);
  return { total: all, done };
}

export default function StudyPlanPage() {
  const [plans, setPlans] = React.useState<Record<string, Plan>>(() => load());
  const [activePlan, setActivePlan] = React.useState<string | null>(null);
  const [text, setText] = React.useState('');
  const [planName, setPlanName] = React.useState('');
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => { save(plans); }, [plans]);

  const plan = activePlan ? plans[activePlan] : null;

  function handleImport() {
    const weeks = parse(text);
    if (weeks.length === 0 || !planName.trim()) return;
    const name = planName.trim();
    setPlans(p => ({ ...p, [name]: { name, weeks, createdAt: Date.now() } }));
    setText('');
    setPlanName('');
    setOpen(false);
    setActivePlan(name);
  }

  function toggle(wi: number, di: number, ii: string) {
    if (!plan) return;
    setPlans(p => ({
      ...p,
      [activePlan!]: {
        ...plan,
        weeks: plan.weeks.map((w, i) => i !== wi ? w : {
          ...w,
          days: w.days.map((d, j) => j !== di ? d : {
            ...d,
            items: d.items.map(it => it.id === ii ? { ...it, done: !it.done } : it)
          })
        })
      }
    }));
  }

  function deletePlan(name: string) {
    const { [name]: _, ...rest } = plans;
    setPlans(rest);
    if (activePlan === name) setActivePlan(null);
  }

  if (plan) {
    const { total, done: doneCount } = grouped(plan);
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePlan(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Notebook className="h-6 w-6 text-zinc-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{plan.name}</h1>
              <p className="text-xs text-zinc-600">{doneCount}/{total} done</p>
            </div>
          </div>

          {plan.weeks.map((week, wi) => (
            <div key={wi} className="border border-zinc-800 rounded-xl bg-zinc-900/40 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
                <span className="text-sm font-semibold text-zinc-200">{week.title}</span>
                <span className="text-xs text-zinc-600 font-mono ml-auto">
                  {week.days.reduce((s, d) => s + d.items.filter(x => x.done).length, 0)}/{week.days.reduce((s, d) => s + d.items.length, 0)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-px bg-zinc-800">
                {week.days.map((day, di) => (
                  <div key={di} className="bg-zinc-900/40 p-3 space-y-1.5 min-h-[100px]">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">{day.label}</div>
                    {day.items.map(item => (
                      <div key={item.id} className="flex items-start gap-1.5">
                        <button onClick={() => toggle(wi, di, item.id)} className="mt-0.5 shrink-0">
                          {item.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className="h-3.5 w-3.5 text-zinc-700 hover:text-zinc-500" />}
                        </button>
                        <span className={'text-xs leading-snug ' + (item.done ? 'line-through text-zinc-600' : 'text-zinc-400')}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sorted = Object.values(plans).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Notebook className="h-6 w-6 text-zinc-400" />
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Study Plans</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Plan</Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Import Study Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <input value={planName} onChange={e => setPlanName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 outline-none focus:border-zinc-600 placeholder-zinc-700"
                  placeholder="Plan name (e.g. DSA Sprint)" />
                <p className="text-xs text-zinc-600">Paste your plan. Format:</p>
                <pre className="text-[10px] text-zinc-700 font-mono leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-zinc-800">
{`Week 1 – Fundamentals + Arrays

Day 1
Big O (Time & Space Complexity)
Learn: ArrayList, arrays

Day 2
Array traversal
Check if Array is Sorted`}
                </pre>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  className="w-full h-40 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 font-mono outline-none resize-none focus:border-zinc-600 placeholder-zinc-700"
                  placeholder="Paste your plan here..." />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setText(''); setPlanName(''); setOpen(false); }}>Cancel</Button>
                  <Button size="sm" onClick={handleImport} disabled={!text.trim() || !planName.trim()}>
                    <Upload className="h-4 w-4 mr-1" /> Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <Notebook className="h-12 w-12 mb-3 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-500 mb-4">No study plans yet.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(p => {
            const { total, done: doneCount } = grouped(p);
            return (
              <div key={p.name} className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors cursor-pointer group"
                onClick={() => setActivePlan(p.name)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-zinc-500 shrink-0" />
                    <span className="text-sm font-semibold text-zinc-200 truncate">{p.name}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deletePlan(p.name); }}
                    className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-600">
                  <span>{p.weeks.length} {p.weeks.length === 1 ? 'week' : 'weeks'}</span>
                  <span>{doneCount}/{total} done</span>
                </div>
                {total > 0 && (
                  <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/60 rounded-full transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
