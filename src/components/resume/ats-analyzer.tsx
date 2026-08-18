'use client';

import * as React from 'react';
import { Loader2, X, ScanSearch, Wand2, Check, AlertTriangle, History, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import {
  useAtsRun,
  useDeleteResumeAnalysis,
  useResumeAnalysesQuery,
  type AtsResult,
  type ResumeAnalysisRow,
  type AnalysisScores,
} from '@/hooks/use-resume-analyses';
import ResumeCompare from './resume-compare';
import { mergeChanges } from '@/lib/diff';

interface Props {
  source: string;
  resumeId?: string | null;
  onApply: (source: string) => void;
  onClose: () => void;
}

const CRITERIA: { key: keyof AnalysisScores; label: string }[] = [
  { key: 'structure', label: 'Structure' },
  { key: 'keywords', label: 'Keywords' },
  { key: 'actionVerbs', label: 'Action Verbs' },
  { key: 'quantifiableImpact', label: 'Impact' },
  { key: 'length', label: 'Length' },
  { key: 'contactInfo', label: 'Contact' },
];

function extractApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

function scoreColor(v: number): string {
  if (v >= 80) return '#10b981';
  if (v >= 60) return '#f59e0b';
  return '#ef4444';
}

function ScoreRing({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative h-20 w-20 rounded-full flex items-center justify-center"
        style={{ background: `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.06) 0deg)` }}
      >
        <div className="h-16 w-16 rounded-full bg-zinc-950 flex items-center justify-center">
          <span className="text-xl font-bold tabular-nums" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Tag({ label, tone }: { label: string; tone: 'good' | 'missing' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono ${
      tone === 'good'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    }`}>
      {label}
    </span>
  );
}

function Section({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'missing' | 'plain' }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-[13px] text-zinc-300 leading-relaxed flex gap-2">
            <span className="text-zinc-600 mt-0.5 shrink-0">
              {tone === 'good' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> :
               tone === 'missing' ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> : '•'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubBars({ scores }: { scores: AnalysisScores }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
      {CRITERIA.map((c) => {
        const v = scores[c.key] ?? 0;
        return (
          <div key={c.key} className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 w-20 shrink-0">{c.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: scoreColor(v) }} />
            </div>
            <span className="text-[11px] tabular-nums w-8 text-right text-zinc-400">{v}</span>
          </div>
        );
      })}
    </div>
  );
}

function ResultBody({ result, onReapply }: { result: Pick<AtsResult, 'scores' | 'missingKeywords' | 'presentKeywords' | 'strengths' | 'weaknesses' | 'recommendations' | 'optimizedSource'>; onReapply?: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-around">
        <ScoreRing label="ATS Score" value={result.scores.atsScore} />
        <ScoreRing label="JD Match" value={result.scores.matchScore} />
      </div>
      <SubBars scores={result.scores} />

      {result.presentKeywords?.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Matched keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {result.presentKeywords.map((k, i) => <Tag key={i} label={k} tone="good" />)}
          </div>
        </div>
      )}

      {result.missingKeywords?.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Missing from resume</h4>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.map((k, i) => <Tag key={i} label={k} tone="missing" />)}
          </div>
        </div>
      )}

      <Section title="Strengths" items={result.strengths} tone="good" />
      <Section title="Areas to improve" items={result.weaknesses} tone="missing" />
      <Section title="Recommendations" items={result.recommendations} tone="plain" />

      {result.optimizedSource && onReapply && (
        <Button size="sm" onClick={onReapply} className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white">
          <Check className="h-3.5 w-3.5 mr-1.5" />
          Re-apply this optimized source
        </Button>
      )}
    </div>
  );
}

export default function AtsAnalyzer({ source, resumeId, onApply, onClose }: Props) {
  const [jd, setJd] = React.useState('');
  const [roleTitle, setRoleTitle] = React.useState('');
  const [busy, setBusy] = React.useState<null | 'analyze' | 'optimize'>(null);
  const [result, setResult] = React.useState<AtsResult | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = React.useState<ResumeAnalysisRow | null>(null);
  const [compareOpen, setCompareOpen] = React.useState(false);

  const atsRun = useAtsRun();
  const deleteAnalysis = useDeleteResumeAnalysis();
  const history = useResumeAnalysesQuery(resumeId);

  async function run(action: 'analyze' | 'optimize') {
    if (!jd.trim()) {
      toast({ variant: 'destructive', title: 'Paste a job description first' });
      return;
    }
    setBusy(action);
    setResult(null);
    setSelectedHistory(null);
    try {
      const res = await atsRun.mutateAsync({
        resume: source,
        jobDescription: jd,
        roleTitle: roleTitle.trim() || null,
        action,
        resumeId,
      });
      setResult(res);
      if (action === 'optimize' && res.optimizedSource) {
        const cleaned = res.optimizedSource.trim().replace(/^```latex\s*/i, '').replace(/```$/g, '').trim();
        setEditing(cleaned);
      } else {
        setEditing(null);
      }
    } catch (err) {
      toast({ variant: 'destructive', title: action === 'analyze' ? 'Analysis failed' : 'Optimization failed', description: extractApiError(err) });
    } finally {
      setBusy(null);
    }
  }

  function openHistory(row: ResumeAnalysisRow) {
    setSelectedHistory(row);
    setResult(null);
    setEditing(null);
  }

  const histories = history.data?.data ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 shrink-0">
          <ScanSearch className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-100">ATS Resume Analyzer</h3>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Job description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={5}
                placeholder="Paste the job description here..."
                className="w-full resize-y bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-blue-500/50 font-mono leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Target role <span className="text-zinc-700 normal-case">(optional)</span>
              </label>
              <input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Developer"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => run('analyze')}
              disabled={busy !== null}
              className="bg-blue-600 hover:bg-blue-500 text-white h-8"
            >
              {busy === 'analyze' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Analyze</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => run('optimize')}
              disabled={busy !== null}
              className="h-8 text-zinc-300"
            >
              {busy === 'optimize' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Optimize for this JD</span>
            </Button>
          </div>

          {busy && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              {busy === 'analyze' ? 'Analyzing your resume against the JD...' : 'Rewriting your resume to match the JD...'}
            </div>
          )}

          {selectedHistory && (
            <div className="space-y-4 border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-2">
                <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  History · {new Date(selectedHistory.createdAt).toLocaleString()}
                </h4>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="ml-auto text-[11px] text-blue-400 hover:text-blue-300"
                >
                  Back to live view
                </button>
              </div>
              <ResultBody
                result={selectedHistory}
                onReapply={selectedHistory.optimizedSource ? () => { onApply(mergeChanges(source, selectedHistory.optimizedSource!)); onClose(); toast({ title: 'Changes applied to your resume' }); } : undefined}
              />
            </div>
          )}

          {result && !selectedHistory && (
            <div className="space-y-4 border-t border-zinc-800 pt-4">
              <ResultBody result={result} />
              {editing !== null && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between pt-1">
                    <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Optimized LaTeX — edit, then apply
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCompareOpen(true)}
                        className="h-8 text-zinc-300"
                      >
                        <ScanSearch className="h-3.5 w-3.5 mr-1.5" />
                        Compare in fullscreen
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { onApply(mergeChanges(source, editing)); onClose(); toast({ title: 'Changes applied to your resume' }); }}
                        className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Apply changes to editor
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={editing}
                    onChange={(e) => setEditing(e.target.value)}
                    rows={14}
                    spellCheck={false}
                    className="w-full resize-y bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-200 outline-none focus:border-blue-500/50 leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {histories.length > 0 && (
            <div className="border-t border-zinc-800 pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <History className="h-3.5 w-3.5 text-zinc-500" />
                <h4 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Past analyses</h4>
              </div>
              <div className="space-y-1.5">
                {histories.map((h) => (
                  <div
                    key={h._id}
                    className="flex items-center gap-1 w-full px-1 rounded-lg bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700 transition-colors group"
                  >
                    <button
                      onClick={() => openHistory(h)}
                      className="flex flex-1 items-center justify-between gap-2 py-0.5 px-2 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {h.action === 'optimize'
                          ? <Wand2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          : <ScanSearch className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                        <span className="text-xs text-zinc-400 truncate">{h.jd.slice(0, 60) || 'Resume analysis'}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] tabular-nums text-zinc-500">ATS {h.scores.atsScore}%</span>
                        <span className="text-[10px] text-zinc-600">{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        deleteAnalysis.mutate(
                          { id: h._id, resumeId },
                          {
                            onSuccess: () => {
                              toast({ title: 'Analysis deleted' });
                              if (selectedHistory?._id === h._id) setSelectedHistory(null);
                            },
                            onError: (err: Error) => toast({ variant: 'destructive', title: 'Delete failed', description: err?.message }),
                          },
                        )
                      }
                      className="p-1.5 rounded text-zinc-600 hover:text-red-400 hover:bg-red-950/30 transition-colors shrink-0"
                      title="Delete analysis"
                    >
                      {deleteAnalysis.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {compareOpen && editing !== null && (
        <ResumeCompare
          original={source}
          optimized={editing}
          onClose={() => setCompareOpen(false)}
          onApply={(s) => { onApply(mergeChanges(source, s)); onClose(); toast({ title: 'Changes applied to your resume' }); }}
        />
      )}
    </div>
  );
}
