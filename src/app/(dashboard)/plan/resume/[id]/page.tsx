'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Play, Save, Trash2, ArrowLeft, FileText, Download,
  Maximize2, Minimize2, AlertTriangle, ScanSearch,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useProfile } from '@/components/providers/ProfileProvider';
import { useQueryClient } from '@tanstack/react-query';
import AtsAnalyzer from '@/components/resume/ats-analyzer';

const PdfViewer = dynamic(
  () => import('@/app/(reader)/books/[slug]/pdf-viewer'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-zinc-600 text-sm"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading viewer...</div> },
);

const DEFAULT_TEMPLATE = `\\documentclass[a4paper,10pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\title{Resume}
\\begin{document}
\\section*{Experience}
Your experience here.
\\end{document}
`;

interface ResumeData {
  _id: string;
  title: string;
  company: string;
  latexSource: string;
  userEmail: string;
  version: number;
}

function extractApiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function ResumeEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === 'new';
  const { userEmail, customDbUrl } = useProfile();
  const queryClient = useQueryClient();

  const [title, setTitle] = React.useState('Untitled Resume');
  const [company, setCompany] = React.useState('');
  const [source, setSource] = React.useState('');
  const [resumeId, setResumeId] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [compiling, setCompiling] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [hasPersistedPdf, setHasPersistedPdf] = React.useState(false);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [numPages, setNumPages] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [localBlobUrl, setLocalBlobUrl] = React.useState<string | null>(null);
  const [pdfExpanded, setPdfExpanded] = React.useState(false);
  const [atsOpen, setAtsOpen] = React.useState(false);
  const [splitPercent, setSplitPercent] = React.useState(55);
  const dragging = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pendingPdfBase64 = React.useRef<string | null>(null);
  const initialized = React.useRef(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(Math.max(pct, 25), 75));
    }
    function onMouseUp() { dragging.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []);

  function onSlideMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  React.useEffect(() => {
    return () => {
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
  }, [localBlobUrl]);

  React.useEffect(() => {
    if (initialized.current) return;
    if (!userEmail) return;
    initialized.current = true;

    if (isNew) {
      setSource(DEFAULT_TEMPLATE);
      setLoaded(true);
      return;
    }

    async function load() {
      try {
        const headers: Record<string, string> = { 'x-user-email': userEmail };
        if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
        const res = await fetch(`/api/db/resumes?userEmail=${encodeURIComponent(userEmail)}`, { headers });
        const json = await res.json();
        const found = (json.data || []).find((r: ResumeData) => r._id === params.id);
        if (!found) {
          router.replace('/plan/resume');
          return;
        }
        setTitle(found.title);
        setCompany(found.company || '');
        setSource(found.latexSource);
        setResumeId(found._id);

        const pdfRes = await fetch(`/api/db/resumes/pdf/${found._id}`);
        if (pdfRes.ok) {
          const blob = await pdfRes.blob();
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            setLocalBlobUrl(url);
            setPdfUrl(url + '#zoom=100');
            setHasPersistedPdf(true);
          }
        }
      } catch {
        router.replace('/plan/resume');
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [isNew, params.id, userEmail, customDbUrl, router]);

  function handlePdfTextClick(text: string) {
    if (!textareaRef.current) return;
    const lines = source.split('\n');
    let bestScore = 0;
    let bestLine = 0;
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      let score = 0;
      for (const w of words) {
        if (line.includes(w)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestLine = i;
      }
    }
    if (bestScore === 0) return;
    const ta = textareaRef.current;
    const allLines = source.split('\n');
    const lineStart = allLines.slice(0, bestLine).join('\n').length;
    const lineEnd = lineStart + allLines[bestLine].length;
    ta.focus();
    ta.setSelectionRange(lineStart, Math.min(lineEnd, source.length));
    const lineHeight = ta.scrollHeight / allLines.length;
    ta.scrollTop = bestLine * lineHeight - ta.clientHeight / 3;
  }

  async function handleCompile() {
    if (!source.trim()) {
      toast({ variant: 'destructive', title: 'Nothing to compile' });
      return;
    }
    setCompiling(true);
    setError(null);
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setPdfUrl(null);
      setLocalBlobUrl(null);
    }
    try {
      const res = await fetch('/api/latex/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `Compilation failed (${res.status})` }));
        throw new Error(errBody.error || `Compilation failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setLocalBlobUrl(url);
      setPdfUrl(url + '#zoom=100');
      setPageNumber(1);
      setNumPages(0);
      pendingPdfBase64.current = await blobToBase64(blob);
      setHasPersistedPdf(false);
    } catch (err: unknown) {
      const msg = extractApiError(err);
      setError(msg);
      toast({ variant: 'destructive', title: 'Compilation failed', description: msg });
    } finally {
      setCompiling(false);
    }
  }

  async function handleSave() {
    if (!userEmail) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    setSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-email': userEmail };
      if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
      const body: Record<string, unknown> = { id: resumeId || undefined, title, company, latexSource: source };
      if (pendingPdfBase64.current) {
        body.pdfData = pendingPdfBase64.current;
      }
      const res = await fetch('/api/db/resumes', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setResumeId(json.data._id);
      if (pendingPdfBase64.current) {
        setHasPersistedPdf(true);
        pendingPdfBase64.current = null;
      }
      if (isNew) router.replace(`/plan/resume/${json.data._id}`);
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({ title: 'Resume saved' });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Save failed', description: extractApiError(err) });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!resumeId) return;
    setDeleting(true);
    try {
      const headers: Record<string, string> = { 'x-user-email': userEmail };
      if (customDbUrl) headers['x-mongodb-url'] = customDbUrl;
      const res = await fetch(`/api/db/resumes?id=${resumeId}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Resume deleted' });
      router.replace('/plan/resume');
    } catch {
      toast({ variant: 'destructive', title: 'Delete failed' });
    } finally {
      setDeleting(false);
    }
  }

  function handleDownload() {
    if (!resumeId && !localBlobUrl) {
      toast({ variant: 'destructive', title: 'No PDF to download' });
      return;
    }
    const filename = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    if (hasPersistedPdf && resumeId) {
      const a = document.createElement('a');
      a.href = `/api/db/resumes/pdf/${resumeId}`;
      a.download = filename;
      a.click();
    } else if (localBlobUrl) {
      const a = document.createElement('a');
      a.href = localBlobUrl;
      a.download = filename;
      a.click();
    }
  }

  const hasAnyPdf = hasPersistedPdf || localBlobUrl;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 3.5rem)' }}>
        <div className="flex flex-col items-center gap-3 text-zinc-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col bg-zinc-950"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      <header className="shrink-0 flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 h-11 bg-zinc-900/80 border-b border-zinc-800/50">
        <button
          onClick={() => router.push('/plan/resume')}
          className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-zinc-800" />
        <FileText className="h-4 w-4 text-zinc-600 shrink-0 hidden sm:inline" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent border-none outline-none text-sm font-medium text-zinc-200 placeholder:text-zinc-700 w-20 sm:w-48 min-w-0"
          placeholder="Untitled"
        />
        <div className="flex items-center gap-1.5 sm:gap-2 ml-2 min-w-0">
          <span className="text-[11px] text-zinc-700 font-medium uppercase tracking-wider shrink-0 hidden sm:inline">Target</span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google"
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-300 placeholder:text-zinc-700 outline-none focus:border-zinc-700 w-20 sm:w-28"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAtsOpen(true)}
            className="text-zinc-400 hover:text-blue-300 hover:bg-zinc-800 text-xs h-7 px-1.5 sm:px-2.5"
          >
            <ScanSearch className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">Analyze</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCompile}
            disabled={compiling}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs h-7 px-1.5 sm:px-2.5"
          >
            {compiling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline ml-1">Compile</span>
          </Button>
          {hasAnyPdf && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 h-7 px-1.5 sm:px-2"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          <div className="w-px h-4 bg-zinc-800 mx-0.5" />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 px-2 sm:px-3 shadow-sm shadow-blue-600/15"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline ml-1">Save</span>
          </Button>
          {resumeId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30 h-7 px-1.5 sm:px-2"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
      </header>

      <div ref={containerRef} className="flex flex-1 min-h-0 flex-row">
        <div className="flex flex-col min-w-0" style={{ width: `${splitPercent}%` }}>
          <div className="flex-1 min-h-0 relative">
            <textarea
              ref={textareaRef}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-full resize-none bg-zinc-950 p-4 sm:p-5 text-sm font-mono text-zinc-200 leading-relaxed outline-none placeholder:text-zinc-800 selection:bg-blue-500/20"
              placeholder="% LaTeX source code"
              spellCheck={false}
            />
          </div>
        </div>

        <div
          onMouseDown={onSlideMouseDown}
          className="flex items-center justify-center w-1.5 cursor-col-resize shrink-0 hover:bg-zinc-800/50 active:bg-blue-500/30 transition-colors group relative"
        >
          <div className="w-0.5 h-8 rounded-full bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />
        </div>

        <div
          className={`min-w-0 flex flex-col bg-zinc-900/10 border-l border-zinc-800/50 ${
            pdfExpanded ? 'fixed inset-0 z-50 md:static' : ''
          }`}
          style={{ width: pdfExpanded ? undefined : `${100 - splitPercent}%` }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/30 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">
                Preview
              </span>
              {numPages > 1 && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className="p-0.5 rounded text-zinc-700 hover:text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[11px] text-zinc-600 tabular-nums font-mono">{pageNumber}<span className="text-zinc-700">/{numPages}</span></span>
                  <button
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    className="p-0.5 rounded text-zinc-700 hover:text-zinc-400 hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {error && (
                <span className="flex items-center gap-1 text-[11px] text-red-400/80">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="hidden sm:inline truncate max-w-[160px]">{error}</span>
                </span>
              )}
              {hasAnyPdf && (
                <button
                  onClick={handleDownload}
                  className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                  title="Download PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setPdfExpanded(!pdfExpanded)}
                className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors md:hidden"
                title={pdfExpanded ? 'Collapse' : 'Expand'}
              >
                {pdfExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-zinc-950">
            {pdfUrl ? (
              <div className="[&_.react-pdf\_\_Page\_\_textContent\_span]:cursor-pointer">
                <PdfViewer
                  pdfUrl={pdfUrl}
                  pageNumber={pageNumber}
                  scale={1}
                  rotation={0}
                  onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                  onTextClick={handlePdfTextClick}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-700">
                <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-zinc-600" />
                </div>
                <p className="text-sm font-medium text-zinc-500">No preview</p>
                <p className="text-xs mt-1 text-zinc-700 max-w-[200px] leading-relaxed">
                  Click <span className="text-zinc-500 font-mono text-[11px]">Compile</span> in the toolbar to generate a PDF preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {atsOpen && (
        <AtsAnalyzer
          source={source}
          resumeId={resumeId}
          onApply={(s) => setSource(s)}
          onClose={() => setAtsOpen(false)}
        />
      )}
    </motion.div>
  );
}
