'use client';

import * as React from 'react';
import Link from 'next/link';

import { Search, Star, Pencil, Trash2, Loader2, BookOpen, Plus, FileType } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  useBooksQuery,
  useAddBook,
  useUpdateBook,
  useDeleteBook,
  type BookData,
  type BookStatus,
} from '@/hooks/use-books';
import { useBookSearchQuery } from '@/hooks/use-book-search';
import { BookFormDialog, type BookFormState } from '@/components/books/BookFormDialog';
import { toast } from '@/components/ui/toast';
import { getCategoryLabel } from '@/data/book-categories';

const bookStatusConfig: Record<BookStatus, { label: string; className: string }> = {
  TO_READ: { label: 'To Read', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
  READING: { label: 'Reading', className: 'bg-blue-950 text-blue-300 border-blue-800' },
  COMPLETED: { label: 'Completed', className: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  REFERENCE: { label: 'Reference', className: 'bg-amber-950 text-amber-300 border-amber-800' },
};

const RatingStars = React.memo(function RatingStars({ rating }: { rating: number }) {
  if (rating === 0) return null;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-3 w-3',
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
          )}
        />
      ))}
    </div>
  );
});

const emptyFormState: BookFormState = {
  title: '',
  author: '',
  category: 'other',
  status: 'TO_READ',
  progress: 0,
  rating: 0,
  pdfFile: null,
  pdfUrl: undefined,
};

export default function ReadingPage() {
  const { data: booksData, isLoading } = useBooksQuery();
  const addBook = useAddBook();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>('add');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingBook, setEditingBook] = React.useState<BookData | null>(null);
  const [form, setForm] = React.useState<BookFormState>(emptyFormState);

  const trackedBooks: BookData[] = booksData?.books ?? [];
  const q = searchQuery.trim();
  const enableSearch = q.length > 1;
  const { data: searchData, isFetching: searchFetching } = useBookSearchQuery(q, 'tracked', enableSearch);

  const searchMatches = searchData?.results ?? [];
  const searchBookIds = new Set(searchMatches.map((r) => r.bookId));
  const filtered = !enableSearch
    ? trackedBooks
    : trackedBooks.filter((b) => searchBookIds.has(b.id) || searchBookIds.has(b._id || ''));
  const isSearching = enableSearch && (searchFetching || searchData === undefined);

  function openAddDialog() {
    setDialogMode('add');
    setEditingBook(null);
    setForm(emptyFormState);
    setDialogOpen(true);
  }

  function openEditDialog(book: BookData) {
    setDialogMode('edit');
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author || '',
      category: book.category || 'other',
      status: book.status,
      progress: book.progress,
      rating: book.rating,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;

    if (dialogMode === 'add') {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('author', form.author.trim());
      formData.append('category', form.category);
      formData.append('status', form.status);
      formData.append('progress', String(form.progress));
      formData.append('rating', String(form.rating));
      if (form.pdfUrl) {
        formData.append('pdfUrl', form.pdfUrl);
      } else if (form.pdfFile) {
        formData.append('pdf', form.pdfFile);
      }

      addBook.mutate(formData as unknown as FormData, {
        onSuccess: () => {
          toast({ title: 'Book added' });
          setDialogOpen(false);
        },
        onError: () => toast({ variant: 'destructive', title: 'Failed to add book' }),
      });
    } else if (editingBook) {
      updateBook.mutate(
        {
          id: editingBook._id || editingBook.id,
          title: form.title.trim(),
          author: form.author.trim(),
          category: form.category,
          status: form.status,
          progress: form.progress,
          rating: form.rating,
        },
        {
          onSuccess: () => {
            toast({ title: 'Book updated' });
            setDialogOpen(false);
            setEditingBook(null);
          },
          onError: () => toast({ variant: 'destructive', title: 'Failed to update book' }),
        }
      );
    }
  }

  function handleDelete(id: string) {
    deleteBook.mutate(id, {
      onSuccess: () => toast({ title: 'Book deleted' }),
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete book' }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-zinc-900/80 transition-all"
          />
        </div>
        <Button variant="outline" size="sm" onClick={openAddDialog} className="shrink-0">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Book
        </Button>
      </div>

      {isLoading || isSearching ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          {isSearching && <span className="ml-2 text-sm text-zinc-500">Searching full text...</span>}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-sm font-medium text-zinc-400">
              {searchQuery ? 'No books match your search' : 'No books tracked yet'}
            </p>
            <p className="text-xs text-zinc-600 mt-1">&ldquo;Add Book&rdquo; to start tracking your reading</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book) => {
            const config = bookStatusConfig[book.status];
            const hasPdf = !!(book.hasPdf || book.pdfPath);
            const categoryLabel = getCategoryLabel(book.category || '');

            return (
              <Link
                key={book._id || book.id}
                href={`/books/reading/${book.id}`}
                className="block group"
              >
                <Card className={cn(
                  'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors h-full',
                  hasPdf && 'cursor-pointer'
                )}>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium text-zinc-100 truncate">
                          {book.title}
                        </CardTitle>
                        {book.author && (
                          <CardDescription className="text-xs text-zinc-500 mt-0.5">
                            {book.author}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="outline" className={cn('text-[10px] font-medium shrink-0', config.className)}>
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    {categoryLabel !== 'Other' && (
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                        {categoryLabel}
                      </div>
                    )}
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
                    <div className="flex items-center justify-between">
                      <RatingStars rating={book.rating} />
                      <div className="flex items-center gap-1">
                        {hasPdf && (
                          <span className="p-1 rounded text-zinc-500">
                            <FileType className="h-3 w-3" />
                          </span>
                        )}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditDialog(book); }}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
                          title="Edit"
                          type="button"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(book._id || book.id); }}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <BookFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        form={form}
        onFormChange={setForm}
        onSave={handleSave}
        isPending={addBook.isPending || updateBook.isPending}
      />
    </div>
  );
}
