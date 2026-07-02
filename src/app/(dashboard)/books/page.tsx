'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  FileCode,
  Star,
  ExternalLink,
  Library,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import books, { type BookEntry, categoryLabels } from '@/data/books';
import BookSlider from '@/components/books/BookSlider';

type BookStatus = 'TO_READ' | 'READING' | 'COMPLETED' | 'REFERENCE';

interface TrackedBook {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  progress: number;
  rating: number;
}

type PaperStatus = 'TO_READ' | 'READING' | 'COMPLETED';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  source: string;
  year: number;
  status: PaperStatus;
  url: string;
}

const bookStatusConfig: Record<BookStatus, { label: string; className: string }> = {
  TO_READ: { label: 'To Read', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  READING: { label: 'Reading', className: 'bg-blue-950 text-blue-300 border-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  REFERENCE: { label: 'Reference', className: 'bg-amber-950 text-amber-300 border-amber-800' },
};

const paperStatusConfig: Record<PaperStatus, { label: string; className: string }> = {
  TO_READ: { label: 'To Read', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  READING: { label: 'Reading', className: 'bg-blue-950 text-blue-300 border-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
};

const trackedBooks: TrackedBook[] = [
  { id: '1', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', status: 'READING', progress: 65, rating: 5 },
  { id: '2', title: 'Clean Architecture', author: 'Robert C. Martin', status: 'COMPLETED', progress: 100, rating: 4 },
  { id: '3', title: 'System Design Interview Vol. 1', author: 'Alex Xu', status: 'COMPLETED', progress: 100, rating: 4 },
  { id: '4', title: 'Database Internals', author: 'Alex Petrov', status: 'TO_READ', progress: 0, rating: 0 },
  { id: '5', title: 'Staff Engineer', author: 'Will Larson', status: 'READING', progress: 30, rating: 0 },
];

const papers: ResearchPaper[] = [
  { id: '1', title: 'MapReduce: Simplified Data Processing on Large Clusters', authors: 'Jeffrey Dean, Sanjay Ghemawat', source: 'OSDI', year: 2004, status: 'COMPLETED', url: 'https://research.google/pubs/pub62/' },
  { id: '2', title: 'The Google File System', authors: 'Sanjay Ghemawat, Howard Gobioff, Shun-Tak Leung', source: 'SOSP', year: 2003, status: 'COMPLETED', url: 'https://research.google/pubs/pub51/' },
  { id: '3', title: "Dynamo: Amazon's Highly Available Key-value Store", authors: 'Giuseppe DeCandia et al.', source: 'SOSP', year: 2007, status: 'READING', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf' },
  { id: '4', title: "Spanner: Google's Globally Distributed Database", authors: 'James C. Corbett et al.', source: 'OSDI', year: 2012, status: 'TO_READ', url: 'https://research.google/pubs/pub39966/' },
];

const categoryOrder = [
  '01-Foundations',
  '02-Distributed-Systems',
  '03-Architecture',
  '04-Performance',
  '05-Deep-Mastery',
  '06-Meta- ',
  '07-Others',
];

function groupBooksByCategory(): Record<string, BookEntry[]> {
  const grouped: Record<string, BookEntry[]> = {};
  for (const book of books) {
    if (!grouped[book.category]) grouped[book.category] = [];
    grouped[book.category].push(book);
  }
  return grouped;
}

function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  if (rating === 0) return null;
  const starSize = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-800'
          )}
        />
      ))}
    </div>
  );
}

function LibraryBookCard({ book }: { book: BookEntry }) {
  return (
    <Link href={`/books/${book.slug}`}>
      <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer group">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors truncate">
                {book.title}
              </CardTitle>
            </div>
            <BookOpen className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-[11px] text-zinc-600">
            {categoryLabels[book.category] || book.category}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TrackedBookCard({ book }: { book: TrackedBook }) {
  const config = bookStatusConfig[book.status];
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium text-zinc-100 truncate">{book.title}</CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">{book.author}</CardDescription>
          </div>
          <Badge variant="outline" className={cn('text-[10px] font-medium shrink-0', config.className)}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-3">
        {(book.status === 'READING' || book.status === 'COMPLETED') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Progress</span>
              <span className="text-zinc-400">{book.progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-500 transition-all duration-700"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          </div>
        )}
        <RatingStars rating={book.rating} />
      </CardContent>
    </Card>
  );
}

function PaperCard({ paper }: { paper: ResearchPaper }) {
  const config = paperStatusConfig[paper.status];
  return (
    <Card className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm font-medium text-zinc-200">{paper.title}</p>
            <p className="text-xs text-zinc-500">{paper.authors}</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-600">{paper.source}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-[11px] text-zinc-600">{paper.year}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={cn('text-[10px] font-medium', config.className)}>
              {config.label}
            </Badge>
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BooksPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const grouped = React.useMemo(() => groupBooksByCategory(), []);

  const filteredGrouped = React.useMemo(() => {
    if (!searchQuery.trim()) return grouped;
    const q = searchQuery.toLowerCase();
    const result: Record<string, BookEntry[]> = {};
    for (const [cat, catBooks] of Object.entries(grouped)) {
      const filtered = catBooks.filter((b) => b.title.toLowerCase().includes(q));
      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [grouped, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Books & Research</h1>
          <p className="text-sm text-zinc-500 mt-1">Read, track, and organize your knowledge</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          className="relative max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-zinc-900/80 transition-all"
          />
        </motion.div>
        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 overflow-x-auto flex-nowrap w-full justify-start">
            <TabsTrigger value="library" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 text-xs gap-2">
              <Library className="h-3.5 w-3.5" />
              Library
            </TabsTrigger>
            <TabsTrigger value="books" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 text-xs gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              Reading
            </TabsTrigger>
            <TabsTrigger value="papers" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 text-xs gap-2">
              <FileText className="h-3.5 w-3.5" />
              Research Papers
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 text-xs gap-2">
              <FileCode className="h-3.5 w-3.5" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-0 space-y-8">
            {categoryOrder.map((cat) => {
              const catBooks = filteredGrouped[cat];
              if (!catBooks) return null;
              return (
                <div key={cat} className="space-y-3">
                  <h2 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
                    {categoryLabels[cat] || cat}
                  </h2>
                  <BookSlider>
                    {catBooks.map((book) => (
                      <div key={book.slug} className="min-w-[240px] max-w-[240px] shrink-0">
                        <LibraryBookCard book={book} />
                      </div>
                    ))}
                  </BookSlider>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="books" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trackedBooks.map((book) => (
                <TrackedBookCard key={book.id} book={book} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="papers" className="mt-0 space-y-4">
            <div className="space-y-2">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs" className="mt-0">
            <Card className="border-zinc-800 bg-zinc-900/30">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <FileCode className="h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-sm font-medium text-zinc-400">Coming Soon</p>
                <p className="text-xs text-zinc-600 mt-1">Documentation tracking is under development</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </motion.div>
  );
}
