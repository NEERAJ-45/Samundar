"use client";

import * as React from "react";
import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  FileType,
  Library,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import books, { type BookEntry, categoryLabels } from "@/data/books";
import { BOOK_CATEGORIES, getCategoryLabel } from "@/data/book-categories";
import {
  BookFormDialog,
  type BookFormState,
} from "@/components/books/BookFormDialog";
import { toast } from "@/components/ui/toast";
import { useAddBook, useBooksQuery, type BookData } from "@/hooks/use-books";

const categoryOrder = [
  "01-Foundations",
  "02-Distributed-Systems",
  "03-Architecture",
  "04-Performance",
  "05-Deep-Mastery",
  "06-Meta-Learning",
  "07-Others",
];

const categoryColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  "01-Foundations": {
    bg: "bg-blue-950/40",
    border: "border-blue-800/40",
    text: "text-blue-300",
  },
  "02-Distributed-Systems": {
    bg: "bg-violet-950/40",
    border: "border-violet-800/40",
    text: "text-violet-300",
  },
  "03-Architecture": {
    bg: "bg-emerald-950/40",
    border: "border-emerald-800/40",
    text: "text-emerald-300",
  },
  "04-Performance": {
    bg: "bg-amber-950/40",
    border: "border-amber-800/40",
    text: "text-amber-300",
  },
  "05-Deep-Mastery": {
    bg: "bg-rose-950/40",
    border: "border-rose-800/40",
    text: "text-rose-300",
  },
  "06-Meta-Learning": {
    bg: "bg-cyan-950/40",
    border: "border-cyan-800/40",
    text: "text-cyan-300",
  },
  "07-Others": {
    bg: "bg-zinc-800/40",
    border: "border-zinc-700/40",
    text: "text-zinc-300",
  },
};

const bookStatusConfig: Record<
  BookData["status"],
  { label: string; className: string }
> = {
  TO_READ: {
    label: "To Read",
    className: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
  READING: {
    label: "Reading",
    className: "bg-blue-950 text-blue-300 border-blue-800",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-950 text-emerald-300 border-emerald-800",
  },
  REFERENCE: {
    label: "Reference",
    className: "bg-amber-950 text-amber-300 border-amber-800",
  },
};

const emptyFormState: BookFormState = {
  title: "",
  author: "",
  category: "other",
  status: "TO_READ",
  progress: 0,
  rating: 0,
  pdfFile: null,
};

function groupBooksByCategory(): Record<string, BookEntry[]> {
  const grouped: Record<string, BookEntry[]> = {};
  for (const book of books) {
    (grouped[book.category] ??= []).push(book);
  }
  return grouped;
}

function groupUploadedBooksByCategory(
  uploadedBooks: BookData[],
): Record<string, BookData[]> {
  const grouped: Record<string, BookData[]> = {};
  for (const book of uploadedBooks) {
    (grouped[book.category || "other"] ??= []).push(book);
  }
  return grouped;
}

export default function LibraryPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<BookFormState>(emptyFormState);
  const { data: booksData, isLoading } = useBooksQuery();
  const addBook = useAddBook();

  const grouped = React.useMemo(() => groupBooksByCategory(), []);
  const uploadedBooks = booksData?.books ?? [];
  const q = searchQuery.toLowerCase().trim();

  const uploadedGrouped = React.useMemo(
    () => groupUploadedBooksByCategory(uploadedBooks),
    [uploadedBooks],
  );

  const filteredGrouped = React.useMemo(() => {
    if (!q) return grouped;
    const result: Record<string, BookEntry[]> = {};
    for (const [cat, catBooks] of Object.entries(grouped)) {
      const filtered = catBooks.filter((b) =>
        b.title.toLowerCase().includes(q),
      );
      if (filtered.length > 0) result[cat] = filtered;
    }
    return result;
  }, [grouped, q]);

  const filteredUploadedGrouped = React.useMemo(() => {
    if (!q) return uploadedGrouped;

    const result: Record<string, BookData[]> = {};
    for (const [category, categoryBooks] of Object.entries(uploadedGrouped)) {
      const filtered = categoryBooks.filter((book) => {
        const title = book.title.toLowerCase();
        const author = (book.author || "").toLowerCase();
        return title.includes(q) || author.includes(q);
      });

      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }

    return result;
  }, [uploadedGrouped, q]);

  function openAddDialog() {
    setForm(emptyFormState);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.title.trim()) return;

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("author", form.author.trim());
    formData.append("category", form.category);
    formData.append("status", form.status);
    formData.append("progress", String(form.progress));
    formData.append("rating", String(form.rating));
    if (form.pdfFile) {
      formData.append("pdf", form.pdfFile);
    }

    addBook.mutate(formData as unknown as FormData, {
      onSuccess: () => {
        toast({ title: "Book added" });
        setDialogOpen(false);
      },
      onError: () =>
        toast({ variant: "destructive", title: "Failed to add book" }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..."
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-primary/50 focus:bg-zinc-900/80 transition-all"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openAddDialog}
          className="shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Book
        </Button>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-100">Uploaded books</p>
            <p className="text-xs text-zinc-500 mt-1">
              Books added from the upload form are grouped here by their
              selected category.
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-zinc-100">
              {uploadedBooks.length}
            </p>
            <p className="text-xs text-zinc-500">total uploaded</p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : Object.keys(filteredUploadedGrouped).length > 0 ? (
        <div className="space-y-6">
          {BOOK_CATEGORIES.map((category) => {
            const booksInCategory = filteredUploadedGrouped[category.value];
            if (!booksInCategory?.length) return null;

            return (
              <section key={category.value} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-100">
                      {getCategoryLabel(category.value)}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {booksInCategory.length} uploaded book
                      {booksInCategory.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booksInCategory.map((book) => {
                    const status = bookStatusConfig[book.status];
                    const hasPdf = !!(book.hasPdf || book.pdfPath);

                    return (
                      <Link
                        key={book._id || book.id}
                        href={
                          hasPdf
                            ? `/books/read/${book.id}`
                            : `/books/reading/${book.id}`
                        }
                        className="block group"
                      >
                        <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors h-full">
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
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-medium shrink-0",
                                  status.className,
                                )}
                              >
                                {status.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-5 pt-0 space-y-3">
                            <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                              {getCategoryLabel(book.category || "other")}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-zinc-500">
                                {hasPdf ? "PDF available" : "No PDF attached"}
                              </div>
                              {hasPdf && (
                                <span className="p-1 rounded text-zinc-500">
                                  <FileType className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <Card className="border-zinc-800 bg-zinc-900/30">
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-10 w-10 text-zinc-700 mb-3" />
            <p className="text-sm font-medium text-zinc-400">
              {q
                ? "No uploaded books match your search"
                : "No uploaded books yet"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Use Add Book to upload a PDF into the matching category
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCategory ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to categories
          </button>
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">
              {categoryLabels[selectedCategory] || selectedCategory}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {(grouped[selectedCategory] || []).length} books
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(grouped[selectedCategory] || []).map((book) => (
              <Link
                key={book.slug}
                href={`/books/${book.slug}`}
                className="block group"
              >
                <Card className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors h-full">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-sm font-medium text-zinc-100 truncate flex-1 min-w-0">
                        {book.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-500 mt-1">
                      {categoryLabels[book.category] || book.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex items-center gap-2">
                    <FileType className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="text-xs text-zinc-600">PDF</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categoryOrder.map((cat) => {
            const catBooks = filteredGrouped[cat];
            if (!catBooks) return null;
            const colors = categoryColors[cat] || categoryColors["07-Others"];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="w-full text-left"
              >
                <Card
                  className={cn(
                    "border transition-all cursor-pointer group h-full",
                    colors.border,
                    colors.bg,
                    "hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20",
                  )}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        colors.bg,
                        "ring-1",
                        colors.border,
                      )}
                    >
                      <Library className={cn("h-6 w-6", colors.text)} />
                    </div>
                    <div>
                      <CardTitle
                        className={cn("text-base font-semibold", colors.text)}
                      >
                        {categoryLabels[cat] || cat}
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500 mt-1">
                        {catBooks.length}{" "}
                        {catBooks.length === 1 ? "book" : "books"}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      <BookFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode="add"
        form={form}
        onFormChange={setForm}
        onSave={handleSave}
        isPending={addBook.isPending}
      />
    </div>
  );
}
