'use client';

import * as React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/providers/ProfileProvider';

interface DailyRecord {
  date: string;
  completedTaskIds: string[];
  note: string;
}

const ITEMS_PER_PAGE = 10;

const categoryMap: Record<string, string> = {
  dsa: 'DSA',
  sd: 'System Design',
  cs: 'Core CS',
  proj: 'Project',
  rev: 'Revision',
};

function getCategoryLabel(taskId: string): string {
  const prefix = taskId.split('-')[0];
  return categoryMap[prefix] || 'Other';
}

function meetsRequirement(ids: string[]): { dsa: boolean; sd: boolean; other: boolean } {
  const dsa = ids.some((id) => id.startsWith('dsa-'));
  const sd = ids.some((id) => id.startsWith('sd-'));
  const other = ids.some((id) => id.startsWith('cs-') || id.startsWith('proj-') || id.startsWith('rev-'));
  return { dsa, sd, other };
}

export default function HistoryPage() {
  const { userEmail } = useProfile();
  const [records, setRecords] = React.useState<DailyRecord[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [expandedDate, setExpandedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || !userEmail) return;
    (async () => {
      try {
        const res = await fetch('/api/db/daily/history');
        const json = await res.json();
        if (json.records) {
          setRecords(json.records.sort((a: DailyRecord, b: DailyRecord) => b.date.localeCompare(a.date)));
        }
      } catch {}
      setLoading(false);
    })();
  }, [mounted, userEmail]);

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const pageRecords = records.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  if (!mounted || loading) {
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
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-zinc-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Daily History</h1>
              <p className="text-sm text-zinc-500 mt-1">Browse your daily completion records</p>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <FileText className="h-12 w-12 mb-3 text-zinc-700" />
              <p className="text-sm font-medium text-zinc-500">No records yet</p>
              <p className="text-xs text-zinc-600 mt-1">Complete tasks on the Daily page to build your history.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {pageRecords.map((record) => {
                  const req = meetsRequirement(record.completedTaskIds);
                  const allMet = req.dsa && req.sd && req.other;
                  const expanded = expandedDate === record.date;
                  const d = new Date(record.date + 'T00:00:00');
                  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <Card
                      key={record.date}
                      className={cn(
                        'bg-card/50 border-zinc-800 transition-all cursor-pointer',
                        allMet ? 'border-emerald-800/40' : 'border-red-800/20',
                      )}
                      onClick={() => setExpandedDate(expanded ? null : record.date)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-full',
                              allMet ? 'bg-emerald-500/10' : 'bg-red-500/10',
                            )}>
                              {allMet ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{dayLabel}</p>
                              <p className="text-xs text-zinc-500">{record.completedTaskIds.length} task{record.completedTaskIds.length !== 1 ? 's' : ''} completed</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn(
                              'text-[10px] px-1.5 py-0',
                              req.dsa ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-zinc-800 text-zinc-600 border-zinc-700',
                            )}>
                              DSA {req.dsa ? '✓' : '✗'}
                            </Badge>
                            <Badge variant="outline" className={cn(
                              'text-[10px] px-1.5 py-0',
                              req.sd ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-zinc-800 text-zinc-600 border-zinc-700',
                            )}>
                              SD {req.sd ? '✓' : '✗'}
                            </Badge>
                            <Badge variant="outline" className={cn(
                              'text-[10px] px-1.5 py-0',
                              req.other ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-zinc-800 text-zinc-600 border-zinc-700',
                            )}>
                              Other {req.other ? '✓' : '✗'}
                            </Badge>
                          </div>
                        </div>

                        {expanded && (
                          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-3">
                            {record.completedTaskIds.length > 0 && (
                              <div>
                                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                                  <Target className="h-3 w-3" /> Completed tasks
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {record.completedTaskIds.map((id) => (
                                    <Badge key={id} variant="outline" className="text-[10px] px-1.5 py-0 bg-zinc-800 text-zinc-400 border-zinc-700">
                                      {getCategoryLabel(id)} — {id}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {record.note && (
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Daily note</p>
                                <p className="text-sm text-zinc-400 bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                                  {record.note}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {page + 1} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
