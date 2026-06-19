'use client';

import * as React from 'react';
import { BookOpen, FileText, FileCode, Star, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type BookStatus = 'TO_READ' | 'READING' | 'COMPLETED' | 'REFERENCE';

interface Book {
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

const books: Book[] = [
  { id: '1', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', status: 'READING', progress: 65, rating: 5 },
  { id: '2', title: 'Clean Architecture', author: 'Robert C. Martin', status: 'COMPLETED', progress: 100, rating: 4 },
  { id: '3', title: 'System Design Interview Vol. 1', author: 'Alex Xu', status: 'COMPLETED', progress: 100, rating: 4 },
  { id: '4', title: 'Database Internals', author: 'Alex Petrov', status: 'TO_READ', progress: 0, rating: 0 },
  { id: '5', title: 'Staff Engineer', author: 'Will Larson', status: 'READING', progress: 30, rating: 0 },
];

const papers: ResearchPaper[] = [
  { id: '1', title: 'MapReduce: Simplified Data Processing on Large Clusters', authors: 'Jeffrey Dean, Sanjay Ghemawat', source: 'OSDI', year: 2004, status: 'COMPLETED', url: 'https://research.google/pubs/pub62/' },
  { id: '2', title: 'The Google File System', authors: 'Sanjay Ghemawat, Howard Gobioff, Shun-Tak Leung', source: 'SOSP', year: 2003, status: 'COMPLETED', url: 'https://research.google/pubs/pub51/' },
  { id: '3', title: 'Dynamo: Amazon\'s Highly Available Key-value Store', authors: 'Giuseppe DeCandia et al.', source: 'SOSP', year: 2007, status: 'READING', url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf' },
  { id: '4', title: 'Spanner: Google\'s Globally Distributed Database', authors: 'James C. Corbett et al.', source: 'OSDI', year: 2012, status: 'TO_READ', url: 'https://research.google/pubs/pub39966/' },
];

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

function BookCard({ book }: { book: Book }) {
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
        {book.status === 'READING' || book.status === 'COMPLETED' ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Progress</span>
              <span className="text-zinc-400">{book.progress}%</span>
            </div>
            <Progress value={book.progress} className="h-1.5 bg-zinc-800 [&>div]:bg-zinc-500" />
          </div>
        ) : (
          <div className="h-[2.125rem]" />
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
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Books & Research</h1>
          <p className="text-sm text-zinc-500 mt-1">Track your reading and research</p>
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="books" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 text-xs gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              Books
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

          <TabsContent value="books" className="mt-0 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
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
    </div>
  );
}
