'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink, CheckSquare, Square } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Domain, Topic, Pattern, Problem } from '@/lib/types/dsa-tracker';

const MASTERY_BORDER: Record<number, string> = {
  0: '#27272a', 1: '#3b82f6', 2: '#22c55e', 3: '#eab308',
  4: '#f97316', 5: '#ef4444', 6: '#a855f7', 7: '#ec4899',
  8: '#14b8a6', 9: '#facc15',
};

const MASTERY_BG: Record<number, string> = {
  0: 'rgba(39,39,42,0.3)', 1: 'rgba(59,130,246,0.12)', 2: 'rgba(34,197,94,0.12)',
  3: 'rgba(234,179,8,0.12)', 4: 'rgba(249,115,22,0.12)', 5: 'rgba(239,68,68,0.12)',
  6: 'rgba(168,85,247,0.12)', 7: 'rgba(236,72,153,0.12)', 8: 'rgba(20,184,166,0.12)',
  9: 'rgba(250,204,21,0.15)',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'text-zinc-400', EASY: 'text-green-400',
  MEDIUM: 'text-yellow-400', HARD: 'text-red-400', EXPERT: 'text-purple-400',
};

type Page =
  | { type: 'domains' }
  | { type: 'topics'; domainId: string }
  | { type: 'patterns'; domainId: string; topicId: string }
  | { type: 'problems'; domainId: string; topicId: string; patternId: string };

interface DSATreeViewProps {
  domains: Domain[];
  onRefreshNeeded?: () => Promise<void>;
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <span className="text-[10px] text-zinc-500">
      {label}: <span className={cn('text-zinc-300', color)}>{value}</span>
    </span>
  );
}

function DomainCard({ domain, onClick }: { domain: Domain; onClick: () => void }) {
  const border = MASTERY_BORDER[domain.heatmap.masteryLevel] || MASTERY_BORDER[0];
  const bg = MASTERY_BG[domain.heatmap.masteryLevel] || MASTERY_BG[0];
  const totalProblems = domain.topics.reduce(
    (s, t) => s + t.patterns.reduce((sp, p) => sp + p.problems.length, 0), 0
  );
  return (
    <motion.button layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="group flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ borderColor: border, backgroundColor: bg }}>
      <div className="flex items-center gap-2 w-full">
        <div className="h-3 w-3 rounded" style={{ backgroundColor: border }} />
        <span className="text-sm font-medium text-zinc-100">{domain.name}</span>
        <ChevronRight className="h-3.5 w-3.5 ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <p className="text-[11px] text-zinc-500 line-clamp-1">{domain.description}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        <StatBadge label="Topics" value={domain.topics.length} />
        <StatBadge label="Problems" value={totalProblems} />
        <StatBadge label="Progress" value={`${domain.heatmap.completionPercentage}%`} />
        <span className={cn('text-[10px] font-medium', DIFFICULTY_COLORS[domain.difficulty] || 'text-zinc-500')}>{domain.difficulty}</span>
      </div>
    </motion.button>
  );
}

function TopicCard({ topic, onClick }: { topic: Topic; onClick: () => void }) {
  const border = MASTERY_BORDER[topic.heatmap.masteryLevel] || MASTERY_BORDER[0];
  const bg = MASTERY_BG[topic.heatmap.masteryLevel] || MASTERY_BG[0];
  const totalProblems = topic.patterns.reduce((s, p) => s + p.problems.length, 0);
  return (
    <motion.button layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="group flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ borderColor: border, backgroundColor: bg }}>
      <div className="flex items-center gap-2 w-full">
        <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: border }} />
        <span className="text-sm font-medium text-zinc-100">{topic.name}</span>
        <ChevronRight className="h-3.5 w-3.5 ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <p className="text-[11px] text-zinc-500 line-clamp-1">{topic.description}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        <StatBadge label="Patterns" value={topic.patterns.length} />
        <StatBadge label="Problems" value={totalProblems} />
        <StatBadge label="Progress" value={`${topic.heatmap.completionPercentage}%`} />
        <span className={cn('text-[10px] font-medium', DIFFICULTY_COLORS[topic.difficulty] || 'text-zinc-500')}>{topic.difficulty}</span>
      </div>
    </motion.button>
  );
}

function PatternCard({ pattern, onClick }: { pattern: Pattern; onClick: () => void }) {
  const border = MASTERY_BORDER[pattern.heatmap.masteryLevel] || MASTERY_BORDER[0];
  const bg = MASTERY_BG[pattern.heatmap.masteryLevel] || MASTERY_BG[0];
  return (
    <motion.button layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="group flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ borderColor: border, backgroundColor: bg }}>
      <div className="flex items-center gap-2 w-full">
        <div className="h-2 w-2 rounded" style={{ backgroundColor: border }} />
        <span className="text-sm font-medium text-zinc-100">{pattern.name}</span>
        <ChevronRight className="h-3.5 w-3.5 ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <p className="text-[11px] text-zinc-500 line-clamp-2">{pattern.description}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        <StatBadge label="Problems" value={`${pattern.heatmap.completedProblems}/${pattern.heatmap.totalProblems}`} />
        <StatBadge label="Progress" value={`${pattern.heatmap.completionPercentage}%`} />
        <StatBadge label="Frequency" value={pattern.interviewFrequency}
          color={pattern.interviewFrequency === 'VERY_HIGH' ? 'text-red-400' : pattern.interviewFrequency === 'HIGH' ? 'text-yellow-400' : 'text-zinc-400'} />
        <span className={cn('text-[10px] font-medium', DIFFICULTY_COLORS[pattern.difficulty] || 'text-zinc-500')}>
          E{pattern.difficultyBreakdown.easy} M{pattern.difficultyBreakdown.medium} H{pattern.difficultyBreakdown.hard}
        </span>
      </div>
    </motion.button>
  );
}

function ProblemRow({ problem, completed, onToggle }: { problem: Problem; completed: boolean; onToggle: (e: React.MouseEvent, problemId: string) => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      className={cn('flex items-center gap-3 px-4 py-2.5 rounded-lg border border-zinc-800/50 transition-all hover:bg-zinc-800/30 hover:border-zinc-700 group', completed && 'opacity-60')}>
      <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
        onClick={(e) => onToggle(e, problem.id)} className="shrink-0 focus:outline-none">
        {completed ? <CheckSquare className="h-5 w-5 text-green-500" /> : <Square className="h-5 w-5 text-zinc-600 hover:text-zinc-400 transition-colors" />}
      </motion.button>
      <a href={problem.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 flex items-center gap-3">
        <span className={cn('text-sm', completed ? 'text-zinc-500 line-through' : 'text-zinc-200')}>{problem.name}</span>
      </a>
      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded',
        problem.difficulty === 'EASY' ? 'text-green-400 bg-green-500/10' :
        problem.difficulty === 'MEDIUM' ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10')}>
        {problem.difficulty}
      </span>
      <span className="text-[10px] text-zinc-600">{problem.interviewFrequency}</span>
      <ExternalLink className="h-3 w-3 shrink-0 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
    </motion.div>
  );
}

export default function DSATreeView({ domains, onRefreshNeeded }: DSATreeViewProps) {
  const [page, setPage] = useState<Page>({ type: 'domains' });
  const [searchQuery, setSearchQuery] = useState('');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const navigateTo = useCallback((newPage: Page) => setPage(newPage), []);

  const currentDomain = useMemo(() => {
    if (page.type === 'domains') return null;
    return domains.find((d) => d.id === page.domainId) ?? null;
  }, [page, domains]);

  const currentTopic = useMemo(() => {
    if (page.type !== 'patterns' && page.type !== 'problems') return null;
    return currentDomain?.topics.find((t) => t.id === page.topicId) ?? null;
  }, [page, currentDomain]);

  const currentPattern = useMemo(() => {
    if (page.type !== 'problems') return null;
    return currentTopic?.patterns.find((p) => p.id === page.patternId) ?? null;
  }, [page, currentTopic]);

  const toggleProblem = useCallback(
    async (e: React.MouseEvent, problemId: string) => {
      e.preventDefault();
      if (page.type !== 'problems' || !currentPattern) return;
      const prev = completedMap[problemId] ?? currentPattern.problems.find(p => p.id === problemId)?.completed ?? false;
      setCompletedMap((p) => ({ ...p, [problemId]: !prev }));
      try {
        const res = await fetch('/api/dsa-tracker/problem', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId, domainId: page.domainId, topicId: page.topicId, patternId: page.patternId }),
        });
        if (!res.ok) setCompletedMap((p) => ({ ...p, [problemId]: prev }));
        else await onRefreshNeeded?.();
      } catch {
        setCompletedMap((p) => ({ ...p, [problemId]: prev }));
      }
    },
    [page, currentPattern, completedMap, onRefreshNeeded]
  );

  const filteredDomains = useMemo(() => {
    if (!searchQuery) return domains;
    const l = searchQuery.toLowerCase();
    return domains.filter((d) => d.name.toLowerCase().includes(l) ||
      d.topics.some((t) => t.name.toLowerCase().includes(l) ||
        t.patterns.some((p) => p.name.toLowerCase().includes(l) ||
          p.problems.some((pr) => pr.name.toLowerCase().includes(l)))));
  }, [domains, searchQuery]);

  const filteredTopics = useMemo(() => {
    if (!currentDomain) return [];
    if (!searchQuery) return currentDomain.topics;
    const l = searchQuery.toLowerCase();
    return currentDomain.topics.filter((t) => t.name.toLowerCase().includes(l) ||
      t.patterns.some((p) => p.name.toLowerCase().includes(l) ||
        p.problems.some((pr) => pr.name.toLowerCase().includes(l))));
  }, [currentDomain, searchQuery]);

  const filteredPatterns = useMemo(() => {
    if (!currentTopic) return [];
    if (!searchQuery) return currentTopic.patterns;
    const l = searchQuery.toLowerCase();
    return currentTopic.patterns.filter((p) => p.name.toLowerCase().includes(l) ||
      p.problems.some((pr) => pr.name.toLowerCase().includes(l)));
  }, [currentTopic, searchQuery]);

  const filteredProblems = useMemo(() => {
    if (!currentPattern) return [];
    if (!searchQuery) return currentPattern.problems;
    const l = searchQuery.toLowerCase();
    return currentPattern.problems.filter((pr) => pr.name.toLowerCase().includes(l));
  }, [currentPattern, searchQuery]);

  const Breadcrumbs = () => {
    const crumbs: { label: string; onClick: () => void }[] = [];

    if (page.type === 'domains') {
      crumbs.push({ label: 'Domains', onClick: () => {} });
    }
    if (page.type === 'topics' && currentDomain) {
      crumbs.push({ label: 'Domains', onClick: () => navigateTo({ type: 'domains' }) });
      crumbs.push({ label: currentDomain.name, onClick: () => {} });
    }
    if ((page.type === 'patterns' || page.type === 'problems') && currentDomain && currentTopic) {
      crumbs.push({ label: 'Domains', onClick: () => navigateTo({ type: 'domains' }) });
      crumbs.push({ label: currentDomain.name, onClick: () => navigateTo({ type: 'topics', domainId: currentDomain.id }) });
      crumbs.push({ label: currentTopic.name, onClick: () => navigateTo({ type: 'patterns', domainId: currentDomain.id, topicId: currentTopic.id }) });
    }
    if (page.type === 'problems' && currentPattern) {
      crumbs.push({ label: currentPattern.name, onClick: () => {} });
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
            <button onClick={crumb.onClick}
              className={cn('transition-colors hover:text-zinc-300', i === crumbs.length - 1 ? 'text-zinc-300 cursor-default' : '')}
              disabled={i === crumbs.length - 1}>
              {crumb.label.length > 20 ? crumb.label.slice(0, 18) + '..' : crumb.label}
            </button>
          </span>
        ))}
      </div>
    );
  };

  const searchPlaceholder = page.type === 'domains' ? 'Search domains...' :
    page.type === 'topics' ? 'Search topics...' :
    page.type === 'patterns' ? 'Search patterns...' : 'Search problems...';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 space-y-3">
        <Breadcrumbs />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input placeholder={searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <AnimatePresence mode="wait">
          {page.type === 'domains' && (
            <motion.div key="domains" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDomains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} onClick={() => navigateTo({ type: 'topics', domainId: domain.id })} />
              ))}
              {filteredDomains.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600 text-sm">No domains match your search</div>}
            </motion.div>
          )}

          {page.type === 'topics' && currentDomain && (
            <motion.div key="topics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} onClick={() => navigateTo({ type: 'patterns', domainId: currentDomain.id, topicId: topic.id })} />
              ))}
              {filteredTopics.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600 text-sm">No topics match your search</div>}
            </motion.div>
          )}

          {page.type === 'patterns' && currentTopic && (
            <motion.div key="patterns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPatterns.map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern}
                  onClick={() => navigateTo({ type: 'problems', domainId: currentDomain!.id, topicId: currentTopic.id, patternId: pattern.id })} />
              ))}
              {filteredPatterns.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600 text-sm">No patterns match your search</div>}
            </motion.div>
          )}

          {page.type === 'problems' && currentPattern && (
            <motion.div key="problems" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-zinc-500">{currentPattern.heatmap.completedProblems}/{currentPattern.heatmap.totalProblems} solved</span>
                  <span className="text-xs text-zinc-700 mx-2">·</span>
                  <span className="text-xs text-zinc-500">E{currentPattern.difficultyBreakdown.easy} M{currentPattern.difficultyBreakdown.medium} H{currentPattern.difficultyBreakdown.hard}</span>
                </div>
              </div>
              {filteredProblems.map((problem) => (
                <ProblemRow key={problem.id} problem={problem}
                  completed={completedMap[problem.id] ?? problem.completed ?? false}
                  onToggle={toggleProblem} />
              ))}
              {filteredProblems.length === 0 && <div className="text-center py-12 text-zinc-600 text-sm">No problems match your search</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
