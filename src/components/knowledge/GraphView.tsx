'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import type { Domain, MasteryLevel } from '@/lib/types/dsa-tracker';

interface GraphNode {
  id: string;
  label: string;
  type: 'domain' | 'topic' | 'pattern' | 'problem';
  masteryLevel: MasteryLevel;
  progress: number;
  x: number;
  y: number;
  w: number;
  h: number;
  url?: string;
  difficulty?: string;
  completed?: boolean;
  childCount?: number;
}

const ML: Record<number, string> = {
  0: '#3f3f46', 1: '#2563eb', 2: '#059669', 3: '#ca8a04',
  4: '#ea580c', 5: '#dc2626', 6: '#9333ea', 7: '#db2777',
  8: '#0891b2', 9: '#facc15',
};

const ML_GLOW: Record<number, string> = {
  0: 'rgba(63,63,70,0.15)', 1: 'rgba(37,99,235,0.4)', 2: 'rgba(5,150,105,0.4)', 3: 'rgba(202,138,4,0.4)',
  4: 'rgba(234,88,12,0.4)', 5: 'rgba(220,38,38,0.4)', 6: 'rgba(147,51,234,0.4)', 7: 'rgba(219,39,119,0.4)',
  8: 'rgba(8,145,178,0.4)', 9: 'rgba(250,204,21,0.4)',
};

const DC: Record<string, string> = {
  EASY: '#22c55e', MEDIUM: '#eab308', HARD: '#ef4444',
};

const DC_BG: Record<string, string> = {
  EASY: 'rgba(34,197,94,0.12)', MEDIUM: 'rgba(234,179,8,0.12)', HARD: 'rgba(239,68,68,0.12)',
};

const NODE_W = { domain: 148, topic: 124, pattern: 104, problem: 88 };
const NODE_H = { domain: 44, topic: 36, pattern: 30, problem: 26 };
const NODE_GAP = 18;

interface PathEntry { id: string; label: string; type: 'domain' | 'topic' | 'pattern'; }

interface GraphViewProps { domains: Domain[]; onNodeClick?: (id: string, type: string) => void; onRefreshNeeded?: () => Promise<void>; }
type DrillHandler = (e: React.MouseEvent, n: GraphNode) => void;

export default function GraphView({ domains, onNodeClick, onRefreshNeeded }: GraphViewProps) {
  const [path, setPath] = useState<PathEntry[]>([]);
  const [tooltip, setTooltip] = useState<{ id: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const panRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewW, setViewW] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setViewW(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dm = useMemo(() => {
    const m = new Map<string, Domain>();
    for (const d of domains) m.set(d.id, d);
    return m;
  }, [domains]);

  const level = path.length === 0 ? 'domains' : path.length === 1 ? 'topics' : path.length === 2 ? 'patterns' : 'problems';
  const cd = path.length >= 1 ? dm.get(path[0].id) : null;
  const ct = path.length >= 2 && cd ? cd.topics.find((t) => t.id === path[1].id) ?? null : null;
  const cp = path.length >= 3 && ct ? ct.patterns.find((p) => p.id === path[2].id) ?? null : null;

  const nodes = useMemo((): GraphNode[] => {
    const pad = 30;
    const W = NODE_W[level as keyof typeof NODE_W] || NODE_W.domain;
    const H = NODE_H[level as keyof typeof NODE_H] || NODE_H.domain;
    const cx = 280;

    if (level === 'domains') {
      const tw = domains.length * W + (domains.length - 1) * NODE_GAP;
      const sx = tw < viewW ? (viewW - tw) / 2 : pad;
      return domains.map((d, i) => ({
        id: d.id, label: d.name, type: 'domain' as const,
        masteryLevel: d.heatmap.masteryLevel, progress: d.heatmap.completionPercentage,
        x: sx + i * (W + NODE_GAP), y: cx, w: W, h: H,
        childCount: d.topics.reduce((a, t) => a + t.patterns.reduce((b, p) => b + p.problems.length, 0), 0),
      }));
    }

    if (level === 'topics' && cd) {
      const items = cd.topics;
      const tw = items.length * W + (items.length - 1) * NODE_GAP;
      const sx = tw < viewW ? (viewW - tw) / 2 : pad;
      return items.map((t, i) => ({
        id: `${cd.id}::${t.id}`, label: t.name, type: 'topic' as const,
        masteryLevel: t.heatmap.masteryLevel, progress: t.heatmap.completionPercentage,
        x: sx + i * (W + NODE_GAP), y: cx, w: W, h: H,
      }));
    }

    if (level === 'patterns' && ct) {
      const items = ct.patterns;
      const tw = items.length * W + (items.length - 1) * NODE_GAP;
      const sx = tw < viewW ? (viewW - tw) / 2 : pad;
      return items.map((p, i) => ({
        id: `${cd!.id}::${ct.id}::${p.id}`, label: p.name, type: 'pattern' as const,
        masteryLevel: p.heatmap.masteryLevel, progress: p.heatmap.completionPercentage,
        x: sx + i * (W + NODE_GAP), y: cx, w: W, h: H,
        childCount: p.problems.length,
      }));
    }

    if (level === 'problems' && cp) {
      const items = cp.problems;
      const tw = items.length * W + (items.length - 1) * NODE_GAP;
      const sx = tw < viewW ? (viewW - tw) / 2 : pad;
      return items.map((p, i) => {
        const done = completedMap[p.id] ?? p.completed;
        return {
          id: p.id, label: p.name, type: 'problem' as const,
          masteryLevel: done ? 5 as MasteryLevel : 0 as MasteryLevel,
          progress: done ? 100 : 0,
          x: sx + i * (W + NODE_GAP), y: cx, w: W, h: H,
          url: p.url, difficulty: p.difficulty, completed: done,
        };
      });
    }

    return [];
  }, [level, domains, cd, ct, cp, viewW, completedMap]);

  const goBack = useCallback(() => {
    setPath((p) => p.slice(0, -1));
    setZoom(1); setOffset({ x: 0, y: 0 });
  }, []);

  const selectNode = useCallback(
    (id: string, type: string) => {
      if (type === 'domain') {
        const d = domains.find((x) => x.id === id);
        if (d) setPath([{ id, label: d.name, type: 'domain' }]);
      } else if (type === 'topic') {
        const [did, tid] = id.split('::');
        const d = dm.get(did);
        const t = d?.topics.find((x) => x.id === tid);
        if (d && t) setPath((prev) => [...prev.slice(0, 1), { id: tid, label: t.name, type: 'topic' }]);
      } else if (type === 'pattern') {
        const [did, tid, pid] = id.split('::');
        const d = dm.get(did);
        const t = d?.topics.find((x) => x.id === tid);
        const p = t?.patterns.find((x) => x.id === pid);
        if (d && t && p) setPath((prev) => [...prev.slice(0, 2), { id: pid, label: p.name, type: 'pattern' }]);
      }
      onNodeClick?.(id, type);
      setZoom(1); setOffset({ x: 0, y: 0 });
    },
    [domains, dm, onNodeClick]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.2, Math.min(4, z - e.deltaY * 0.002)));
  }, []);

  const onPanStart = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as SVGElement).closest('.node')) return;
      panRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
      setPanning(true);
    },
    [offset]
  );

  const onPanMove = useCallback(
    (e: React.MouseEvent) => {
      if (panning) setOffset({
        x: panRef.current.ox + e.clientX - panRef.current.sx,
        y: panRef.current.oy + e.clientY - panRef.current.sy,
      });
    },
    [panning]
  );

  const onPanEnd = useCallback(() => setPanning(false), []);

  const toggleProblem = useCallback(
    async (e: React.MouseEvent, problem: GraphNode) => {
      e.stopPropagation();
      const [did, tid, pid] = path.length >= 3
        ? [path[0].id, path[1].id, path[2].id]
        : ['', '', ''];
      if (!did || !tid || !pid) return;

      const prev = completedMap[problem.id] ?? problem.completed ?? false;
      setCompletedMap((p) => ({ ...p, [problem.id]: !prev }));

      try {
        const res = await fetch('/api/dsa-tracker/problem', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId: problem.id, domainId: did, topicId: tid, patternId: pid }),
        });
        if (!res.ok) setCompletedMap((p) => ({ ...p, [problem.id]: prev }));
        else await onRefreshNeeded?.();
      } catch {
        setCompletedMap((p) => ({ ...p, [problem.id]: prev }));
      }
    },
    [path, completedMap, onRefreshNeeded]
  );

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, n: GraphNode) => {
      if (n.type === 'problem' && n.url) {
        window.open(n.url, '_blank', 'noopener');
        return;
      }
      if (n.type === 'domain' || n.type === 'topic' || n.type === 'pattern') {
        selectNode(n.id, n.type);
      }
    },
    [selectNode]
  );

  const showTooltip = useCallback(
    (e: React.MouseEvent, id: string) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      setTooltip({
        id,
        x: rect.left + (node.x + node.w / 2 + offset.x) * zoom,
        y: rect.top + (node.y + offset.y) * zoom,
      });
    },
    [nodes, offset, zoom]
  );

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const navEntry = (entry: PathEntry) => entry.label.length > 18 ? entry.label.slice(0, 16) + '..' : entry.label;
  const canDrill = (n: GraphNode) => n.type === 'domain' || n.type === 'topic' || n.type === 'pattern';

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.94 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.025, type: 'spring' as const, stiffness: 350, damping: 26 },
    }),
    exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } },
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-lg bg-[#18181b]">
      {/* background subtle pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* breadcrumb */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-xs">
        {path.length > 0 && (
          <button onClick={goBack} className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        )}
        <span className={`px-2 py-1 rounded ${path.length === 0 ? 'bg-blue-500/15 text-blue-400 font-medium' : 'text-zinc-500'}`}>
          {path.length === 0 ? 'Domains' : navEntry(path[0])}
        </span>
        {path.length > 1 && (
          <><ChevronRight className="h-3 w-3 text-zinc-600" /><span className="px-2 py-1 rounded text-zinc-400">{navEntry(path[1])}</span></>
        )}
        {path.length > 2 && (
          <><ChevronRight className="h-3 w-3 text-zinc-600" /><span className="px-2 py-1 rounded text-zinc-400">{navEntry(path[2])}</span></>
        )}
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full select-none"
        style={{ cursor: panning ? 'grabbing' : 'grab' }}
        onWheel={onWheel}
        onMouseDown={onPanStart}
        onMouseMove={onPanMove}
        onMouseUp={onPanEnd}
        onMouseLeave={onPanEnd}
      >
        <defs>
          {Object.entries(ML).map(([k, v]) => (
            <linearGradient key={k} id={`cardGrad${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={v} stopOpacity={0.7} />
              <stop offset="100%" stopColor={v} stopOpacity={0.35} />
            </linearGradient>
          ))}
          {Object.entries(DC_BG).map(([k, v]) => (
            <linearGradient key={k} id={`diffGrad${k}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={v} stopOpacity={1} />
              <stop offset="100%" stopColor={v} stopOpacity={0} />
            </linearGradient>
          ))}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
          <AnimatePresence mode="popLayout">
            {nodes.map((n, i) => {
              const ml = n.masteryLevel;
              const fill = `url(#cardGrad${ml})`;
              const base = ML[ml] || ML[0];
              const glow = ML_GLOW[ml] || ML_GLOW[0];
              const isProb = n.type === 'problem';
              const dc = n.difficulty ? DC[n.difficulty] : undefined;

              return (
                <motion.g
                  key={n.id}
                  className="node"
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={(e) => canDrill(n) && handleNodeClick(e, n)}
                  onMouseMove={(e) => showTooltip(e, n.id)}
                  onMouseLeave={hideTooltip}
                  style={{ cursor: canDrill(n) || isProb ? 'pointer' : 'default' }}
                >
                  {/* glow under card */}
                  <motion.rect
                    x={n.x + 2} y={n.y + n.h + 4} width={n.w - 4} height={6} rx={3}
                    fill={glow}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: i * 0.025 + 0.1, duration: 0.2 }}
                    filter="url(#glow)"
                  />

                  {/* card body */}
                  <motion.rect
                    x={n.x} y={n.y} width={n.w} height={n.h} rx={8}
                    fill={isProb && n.completed ? '#064e3b' : fill}
                    stroke={isProb && n.completed ? '#16a34a' : n.type === 'domain' ? base : 'rgba(255,255,255,0.08)'}
                    strokeWidth={n.type === 'domain' || n.completed ? 2 : 1}
                    whileHover={n.type !== 'problem' ? { scale: 1.06, filter: 'brightness(1.2)' } : undefined}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  />

                  {/* left accent for problems */}
                  {isProb && dc && (
                    <rect x={n.x} y={n.y + 4} width={3} height={n.h - 8} rx={1.5} fill={dc} />
                  )}

                  {/* difficulty badge */}
                  {isProb && n.difficulty && (
                    <text
                      x={n.x + n.w - 6} y={n.y + 8}
                      textAnchor="end" fill={dc} fontSize={6} fontWeight={600} letterSpacing={0.5}
                    >
                      {n.difficulty}
                    </text>
                  )}

                  {/* label */}
                  <text
                    x={n.x + n.w / 2 + (isProb ? 0 : 0)}
                    y={n.y + n.h / 2 + (n.type === 'domain' ? -3 : 0)}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.92)"
                    fontSize={n.type === 'domain' ? 12 : n.type === 'topic' ? 10.5 : n.type === 'pattern' ? 9.5 : 8.5}
                    fontWeight={n.type === 'domain' ? 700 : n.type === 'problem' ? 500 : 400}
                  >
                    {n.label.length > (isProb ? 12 : n.type === 'domain' ? 18 : 16) ? n.label.slice(0, (isProb ? 10 : n.type === 'domain' ? 16 : 14)) + '…' : n.label}
                  </text>

                  {/* progress bar for domain/topic/pattern */}
                  {n.type !== 'problem' && (
                    <rect
                      x={n.x + 6} y={n.y + n.h - 5} width={n.w - 12} height={2.5} rx={1.25}
                      fill="rgba(255,255,255,0.08)"
                    />
                  )}
                  {n.type !== 'problem' && (
                    <motion.rect
                      x={n.x + 6} y={n.y + n.h - 5} height={2.5} rx={1.25}
                      fill={base}
                      initial={{ width: 0 }}
                      animate={{ width: Math.max(0, (n.w - 12) * (n.progress / 100)) }}
                      transition={{ delay: i * 0.025 + 0.25, duration: 0.5, ease: 'easeOut' }}
                    />
                  )}

                  {/* drill arrow */}
                  {canDrill(n) && (
                    <text
                      x={n.x + n.w / 2} y={n.y + n.h + 14}
                      textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8}
                    >
                      {n.type === 'domain' ? '▼' : n.type === 'topic' ? '▾' : '▸'}
                    </text>
                  )}

                  {/* checkbox for problems */}
                  {isProb && (
                    <>
                      <motion.rect
                        x={n.x + n.w - 16} y={n.y + n.h - 15}
                        width={12} height={12} rx={3}
                        fill={n.completed ? '#16a34a' : 'rgba(255,255,255,0.06)'}
                        stroke={n.completed ? '#16a34a' : 'rgba(255,255,255,0.15)'}
                        strokeWidth={1.5}
                        onClick={(e) => toggleProblem(e, n)}
                        style={{ cursor: 'pointer' }}
                        whileHover={{ scale: 1.2 }}
                      />
                      {n.completed && (
                        <text
                          x={n.x + n.w - 10} y={n.y + n.h - 5}
                          textAnchor="middle" fill="white" fontSize={8} fontWeight={700}
                          pointerEvents="none"
                        >
                          ✓
                        </text>
                      )}
                    </>
                  )}
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* empty state */}
          {nodes.length === 0 && (
            <text x={viewW / 2 / (zoom || 1) - offset.x / (zoom || 1)} y={280} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={13}>
              No items to display
            </text>
          )}
        </g>
      </svg>

      {/* tooltip */}
      <AnimatePresence>
        {tooltip && (() => {
          const n = nodes.find((nd) => nd.id === tooltip.id);
          if (!n) return null;
          const solved = n.completed || (n.type === 'problem' && n.masteryLevel > 0);
          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.12 }}
              className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg bg-zinc-900/95 border border-zinc-700/60 shadow-xl backdrop-blur-sm"
              style={{ left: tooltip.x + 14, top: tooltip.y - 8, transform: 'translateY(-50%)' }}
            >
              <p className="text-sm text-zinc-100 whitespace-nowrap font-medium">{n.label}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 capitalize">
                {n.type}{n.difficulty ? ` · ${n.difficulty}` : ''}{solved ? ' · Solved ✓' : ''}
              </p>
              {n.childCount !== undefined && (
                <p className="text-[11px] text-zinc-600 mt-0.5">{n.childCount} {n.childCount === 1 ? 'problem' : 'problems'} inside</p>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* mastery legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] text-zinc-600">
        {[
          { l: 0, label: 'New' }, { l: 1, label: 'Theory' },
          { l: 3, label: 'Core' }, { l: 5, label: 'Hard' },
          { l: 7, label: 'Ready' }, { l: 9, label: 'Expert' },
        ].map(({ l, label }) => (
          <div key={l} className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-zinc-800/40">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ML[l] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* zoom controls */}
      <div className="absolute top-3 right-3 flex gap-1">
        <button onClick={() => setZoom((z) => Math.min(4, z + 0.3))} className="h-7 w-7 rounded-md bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 text-sm transition-colors">+</button>
        <button onClick={() => setZoom((z) => Math.max(0.2, z - 0.3))} className="h-7 w-7 rounded-md bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 text-sm transition-colors">−</button>
        <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="h-7 px-2 rounded-md bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-500 text-[10px] transition-colors">Reset</button>
      </div>
    </div>
  );
}
