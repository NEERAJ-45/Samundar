'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Trash2,
  Loader2, Search, AlertCircle, FileDown, Inbox, ScanSearch,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useResumesQuery, useDeleteResume, type ResumeData } from '@/hooks/use-resumes';
import AtsAnalyzer from '@/components/resume/ats-analyzer';

const companyBadge: Record<string, { dot: string; text: string }> = {
  google: { dot: 'bg-blue-400', text: 'text-blue-300' },
  microsoft: { dot: 'bg-emerald-400', text: 'text-emerald-300' },
  amazon: { dot: 'bg-amber-400', text: 'text-amber-300' },
  meta: { dot: 'bg-indigo-400', text: 'text-indigo-300' },
  stripe: { dot: 'bg-purple-400', text: 'text-purple-300' },
};

function companyStyle(company: string) {
  if (!company) return null;
  const key = company.toLowerCase().replace(/\s+/g, '');
  for (const [k, v] of Object.entries(companyBadge)) {
    if (key.includes(k)) return v;
  }
  return { dot: 'bg-zinc-500', text: 'text-zinc-300' };
}

function formatDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const columnHelper = createColumnHelper<ResumeData>();

export default function ResumeDashboard() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [analyzeRow, setAnalyzeRow] = React.useState<ResumeData | null>(null);
  const { data: resumesData, isLoading, isFetching, error, refetch } = useResumesQuery();
  const deleteResume = useDeleteResume();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => { refetch(); }, [refetch]);

  const resumes = React.useMemo(() => resumesData?.data ?? [], [resumesData]);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return resumes;
    const q = search.toLowerCase();
    return resumes.filter(
      (r) => r.title.toLowerCase().includes(q) || r.company.toLowerCase().includes(q),
    );
  }, [resumes, search]);

  function handleOpen(id: string) {
    router.push(`/plan/resume/${id}`);
  }

  function handleCreate() {
    router.push('/plan/resume/new');
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteResume.mutate(id, {
      onSuccess: () => toast({ title: 'Resume deleted' }),
      onError: (err: Error) => toast({ variant: 'destructive', title: 'Failed to delete', description: err?.message }),
    });
  }

  function handleDownloadPdf(e: React.MouseEvent, row: ResumeData) {
    e.stopPropagation();
    const filename = `${row.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const a = document.createElement('a');
    a.href = `/api/db/resumes/pdf/${row._id}`;
    a.download = filename;
    a.click();
  }

  function handleDownloadLatex(e: React.MouseEvent, row: ResumeData) {
    e.stopPropagation();
    const filename = `${row.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.tex`;
    const blob = new Blob([row.latexSource], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const columns = [
    columnHelper.accessor('title', {
      header: 'Resume',
      cell: (info) => (
        <span className="text-sm font-medium text-zinc-100">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('company', {
      header: 'Target',
      cell: (info) => {
        const company = info.getValue();
        if (!company) return <span className="text-xs text-zinc-700">—</span>;
        const style = companyStyle(company);
        return (
          <span className="inline-flex items-center gap-1.5 text-xs">
            {style && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
            <span className={style?.text ?? 'text-zinc-300'}>{company}</span>
          </span>
        );
      },
      size: 130,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated',
      cell: (info) => (
        <span className="text-xs text-zinc-600 tabular-nums">{formatDate(new Date(info.getValue()))}</span>
      ),
      size: 75,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setAnalyzeRow(info.row.original); }}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-blue-400 transition-colors"
            title="Analyze with ATS"
          >
            <ScanSearch className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDownloadPdf(e, info.row.original)}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
            title="Download PDF"
          >
            <FileDown className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDownloadLatex(e, info.row.original)}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
            title="Download LaTeX"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleDelete(e, info.row.original._id)}
            disabled={deleteResume.isPending}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      size: 100,
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isEmpty = !isLoading && !error && filtered.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      <header className="shrink-0 flex items-center justify-between px-5 h-12 border-b border-zinc-800/50">
        <h1 className="text-sm font-semibold text-zinc-200 tracking-tight">Resumes</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60 px-3 transition-all duration-200 focus-within:border-zinc-700 focus-within:bg-zinc-900 w-56">
            <Search className="h-4 w-4 shrink-0 text-zinc-600" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            {isFetching && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-zinc-600" />}
            <kbd className="text-[10px] text-zinc-700 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 font-mono">⌘K</kbd>
          </div>
          <Button size="sm" onClick={handleCreate} className="bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="sm:hidden flex items-center gap-2 px-4 py-2 border-b border-zinc-800/30 bg-zinc-950 sticky top-0 z-10">
          <Search className="h-4 w-4 shrink-0 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resumes..."
            className="w-full bg-transparent py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          {isFetching && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-zinc-600" />}
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-4 h-12 rounded-lg bg-zinc-900/30 animate-pulse px-4">
                <div className="h-3 w-40 bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-zinc-800 rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <AlertCircle className="h-8 w-8 text-red-500/60 mb-3" />
            <p className="text-sm font-medium text-zinc-400">Failed to load resumes</p>
            <p className="text-xs mt-1 text-zinc-600">Check your connection and try again</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <div className="w-12 h-12 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-4">
              <Inbox className="h-5 w-5 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">
              {search ? 'No matching resumes' : 'No resumes yet'}
            </p>
            <p className="text-xs mt-1 text-zinc-600 mb-4">
              {search ? 'Try a different search term' : 'Create your first LaTeX resume'}
            </p>
            {!search && (
              <Button size="sm" variant="outline" onClick={handleCreate} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create Resume
              </Button>
            )}
          </div>
        ) : (
          <div className="p-5">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left text-[11px] font-medium text-zinc-600 px-4 pb-2 uppercase tracking-wider"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="group cursor-pointer rounded-lg transition-colors hover:bg-zinc-900/60"
                      onClick={() => handleOpen(row.original._id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2.5 border-b border-zinc-800/30 group-last:border-0"
                          style={{ width: cell.column.getSize() }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
      {analyzeRow && (
        <AtsAnalyzer
          source={analyzeRow.latexSource}
          resumeId={analyzeRow._id}
          onApply={(s) => { setAnalyzeRow(null); toast({ title: 'Optimized source copied' }); }}
          onClose={() => setAnalyzeRow(null)}
        />
      )}
    </motion.div>
  );
}
