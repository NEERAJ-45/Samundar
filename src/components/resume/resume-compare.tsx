'use client';

import * as React from 'react';
import { Document, Page, pdfjs, type TextItem } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { diffWords, type DiffResult } from '@/lib/diff';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ADD_COLOR = 'rgba(16, 185, 129, 0.35)';
const REM_COLOR = 'rgba(239, 68, 68, 0.35)';

async function compilePdf(source: string): Promise<string> {
  const res = await fetch('/api/latex/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
  if (!res.ok) {
    let message = '';
    try { message = (await res.json()).error || ''; } catch { /* ignore */ }
    throw new Error(message || `Compilation failed (${res.status})`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

async function extractText(url: string): Promise<string> {
  const pdf = await pdfjs.getDocument(url).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    text += `${(content.items as TextItem[]).map((it) => it.str).join(' ')}\n`;
  }
  return text;
}

function tokensOf(text: string): string[] {
  return text.replace(/[^a-z0-9+# ]/gi, ' ').toLowerCase().split(/\s+/).filter(Boolean);
}

function DiffSide({ pdfUrl, highlightSet, tone, label }: {
  pdfUrl: string;
  highlightSet: Set<string>;
  tone: 'add' | 'rem';
  label: string;
}) {
  const [numPages, setNumPages] = React.useState(0);
  const holderRef = React.useRef<HTMLDivElement>(null);

  const color = tone === 'add' ? ADD_COLOR : REM_COLOR;

  React.useEffect(() => {
    const el = holderRef.current;
    if (!el) return;

    const apply = () => {
      el.querySelectorAll('.react-pdf__Page__textContent span').forEach((s) => {
        const node = s as HTMLElement;
        const hl = tokensOf(node.textContent || '').some((t) => highlightSet.has(t));
        node.style.backgroundColor = hl ? color : '';
        node.style.borderRadius = hl ? '2px' : '';
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pdfUrl, numPages, highlightSet, color]);

  return (
    <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 p-2">
      <div className="flex items-center gap-2 px-1 pb-2">
        <span className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <div ref={holderRef} className="min-h-0 [&_.react-pdf\_\_Page]:mx-auto">
        <Document file={pdfUrl} onLoadSuccess={({ numPages: n }) => setNumPages(n)}>
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              renderTextLayer
              renderAnnotationLayer
              className="mb-3 shadow-lg"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}

interface SideState {
  url: string | null;
  error: string | null;
}

async function loadSide(source: string): Promise<SideState> {
  try {
    const url = await compilePdf(source);
    return { url, error: null };
  } catch (e) {
    return { url: null, error: e instanceof Error ? e.message : 'Compilation failed' };
  }
}

export default function ResumeCompare({ original, optimized, onClose, onApply }: {
  original: string;
  optimized: string;
  onClose: () => void;
  onApply?: (source: string) => void;
}) {
  const [orig, setOrig] = React.useState<SideState | null>(null);
  const [opt, setOpt] = React.useState<SideState | null>(null);
  const [diff, setDiff] = React.useState<DiffResult | null>(null);
  const urlsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const [o, t] = await Promise.all([loadSide(original), loadSide(optimized)]);
      if (cancelled) return;
      if (o.url) urlsRef.current.push(o.url);
      if (t.url) urlsRef.current.push(t.url);
      setOrig(o);
      setOpt(t);
    })();
    return () => {
      cancelled = true;
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    };
  }, [original, optimized]);

  React.useEffect(() => {
    if (!orig?.url || !opt?.url || diff) return;
    let cancelled = false;
    (async () => {
      try {
        const [origText, optText] = await Promise.all([extractText(orig.url!), extractText(opt.url!)]);
        if (!cancelled) setDiff(diffWords(origText, optText));
      } catch {
        if (!cancelled) setDiff(null);
      }
    })();
    return () => { cancelled = true; };
  }, [orig, opt, diff]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-zinc-950">
      <header className="shrink-0 flex items-center gap-2 px-3 sm:px-4 h-12 border-b border-zinc-800/60 bg-zinc-900/50">
        <button
          onClick={onClose}
          className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-zinc-100 truncate">Before / After</h3>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-500 ml-3 shrink-0">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: ADD_COLOR }} /> added</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ backgroundColor: REM_COLOR }} /> removed</span>
        </div>
        {onApply && (
          <Button
            size="sm"
            onClick={() => { onApply(optimized); onClose(); }}
            className="ml-auto h-7 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
          >
            <Check className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Apply optimized</span>
          </Button>
        )}
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-y-hidden">
        {!orig || !opt ? (
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 min-h-full py-16">
            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            <span className="text-center">Compiling and diffing both PDFs...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-3 sm:p-4 md:grid-cols-2 md:h-full">
            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 md:min-h-0 md:overflow-y-auto">
              {orig.error ? (
                <div className="text-sm text-red-400 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                  <p className="font-medium mb-1">Original failed to compile</p>
                  <p className="text-xs font-mono text-red-400/80 whitespace-pre-wrap">{orig.error}</p>
                </div>
              ) : (
                <DiffSide pdfUrl={orig.url!} highlightSet={diff?.removed ?? new Set()} tone="rem" label="Original" />
              )}
            </div>
            <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/30 p-3 md:min-h-0 md:overflow-y-auto">
              {opt.error ? (
                <div className="text-sm text-red-400 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                  <p className="font-medium mb-1">Optimized failed to compile</p>
                  <p className="text-xs font-mono text-red-400/80 whitespace-pre-wrap">{opt.error}</p>
                </div>
              ) : (
                <DiffSide pdfUrl={opt.url!} highlightSet={diff?.added ?? new Set()} tone="add" label="Optimized" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
