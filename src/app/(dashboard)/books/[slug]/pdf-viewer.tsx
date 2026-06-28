'use client';

import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const pdfVersion = pdfjs.version;
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string;
  pageNumber: number;
  scale: number;
  rotation: number;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

export default function PdfViewer({
  pdfUrl,
  pageNumber,
  scale,
  rotation,
  onLoadSuccess,
}: PdfViewerProps) {
  const options = React.useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
    }),
    [],
  );

  function onLoadError(error: Error) {
    console.error('PDF load error:', error);
  }

  return (
    <Document
      file={pdfUrl}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      options={options}
      loading={
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-zinc-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
            <p className="text-sm">Loading page {pageNumber}...</p>
          </div>
        </div>
      }
      error={
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-red-400">Failed to load PDF.</p>
        </div>
      }
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        rotate={rotation}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        loading={
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-zinc-500">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
              <p className="text-sm">Rendering page...</p>
            </div>
          </div>
        }
        className="shadow-2xl"
      />
    </Document>
  );
}
