'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, RotateCw, BookOpen } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import type { BookEntry } from '@/data/books';

const PdfViewer = dynamic(() => import('./pdf-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3 text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

export function BookReaderClient({ book }: { book: BookEntry }) {
  const [numPages, setNumPages] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  const pdfUrl = `/api/books/${book.slug}`;

  function onLoadSuccess({ numPages: pages }: { numPages: number }) {
    setNumPages(pages);
  }

  function goToPrevPage() {
    setPageNumber((p) => Math.max(1, p - 1));
  }

  function goToNextPage() {
    setPageNumber((p) => Math.min(numPages, p + 1));
  }

  function zoomIn() {
    setScale((s) => Math.min(3, s + 0.25));
  }

  function zoomOut() {
    setScale((s) => Math.max(0.5, s - 0.25));
  }

  function rotate() {
    setRotation((r) => (r + 90) % 360);
  }

  function handlePageInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (val >= 1 && val <= numPages) setPageNumber(val);
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen className="h-4 w-4 text-zinc-500 shrink-0" />
          <h1 className="text-sm font-medium text-zinc-200 truncate">{book.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={zoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-zinc-400 w-10 text-center shrink-0">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" onClick={zoomIn} disabled={scale >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-zinc-800 shrink-0" />
          <Button variant="outline" size="icon" onClick={rotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-zinc-800 shrink-0" />
          <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageInput}
              className="w-10 bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-center text-zinc-200 text-xs outline-none"
              min={1}
              max={numPages || 1}
            />
            <span>/ {numPages}</span>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {numPages > 1 && (
            <div className="hidden sm:flex items-center w-24">
              <input
                type="range"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value, 10))}
                className="w-full h-1 appearance-none cursor-pointer rounded-full bg-zinc-800 accent-zinc-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-zinc-950">
        <div className="flex justify-center py-4">
          <PdfViewer
            pdfUrl={pdfUrl}
            pageNumber={pageNumber}
            scale={scale}
            rotation={rotation}
            onLoadSuccess={onLoadSuccess}
          />
        </div>
      </div>
    </div>
  );
}
