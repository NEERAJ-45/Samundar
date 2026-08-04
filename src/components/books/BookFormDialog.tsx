'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BOOK_STATUSES, type BookStatus } from '@/hooks/use-books';
import { BOOK_CATEGORIES } from '@/data/book-categories';
import { useUploadThing } from '@/lib/uploadthing';

const STATUS_LABELS: Record<BookStatus, string> = {
  TO_READ: 'To Read',
  READING: 'Reading',
  COMPLETED: 'Completed',
  REFERENCE: 'Reference',
};

interface BookFormState {
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  progress: number;
  rating: number;
  pdfFile?: File | null;
  pdfUrl?: string;
}

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  form: BookFormState;
  onFormChange: (form: BookFormState) => void;
  onSave: () => void;
  isPending: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value || 0));
}

export type { BookFormState };

export function BookFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  onSave,
  isPending,
}: BookFormDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);

  const { startUpload, isUploading } = useUploadThing('pdfUploader', {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        set('pdfUrl', res[0].url);
        setFileName(res[0].name);
      }
    },
    onUploadError: () => {
      setFileError('Upload failed. Try again or use a smaller PDF.');
    },
  });

  const uploading = isUploading;

  const set = (field: keyof BookFormState, value: string | number | File | null | undefined) => {
    onFormChange({ ...form, [field]: value });
  };

  React.useEffect(() => {
    if (!open) {
      setFileName(null);
      setFileError(null);
    }
  }, [open]);

  const isValid = form.title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {mode === 'add' ? 'Add Book' : 'Edit Book'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Title *">
            <Input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Book title"
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </Field>
          <Field label="Author">
            <Input
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="Author name"
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </Field>
          <Field label="Category">
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                {BOOK_CATEGORIES.map((c) => (
                  <SelectItem
                    key={c.value}
                    value={c.value}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="PDF File">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFileError(null);
                  set('pdfFile', null);
                  set('pdfUrl', undefined);
                  setFileName(null);
                  if (!file) return;

                  // Upload via Uploadthing (bypasses Vercel body limit)
                  startUpload([file]);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-zinc-100"
              >
                {uploading ? 'Uploading...' : fileName ? 'Change PDF' : 'Choose PDF'}
              </Button>
              {fileName && (
                <span className="text-xs text-zinc-400 truncate max-w-[200px]">
                  {fileName}
                </span>
              )}
            </div>
            {fileError && (
              <p className="text-xs text-red-400 mt-1">{fileError}</p>
            )}
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set('status', v as BookStatus)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                {BOOK_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                  >
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Progress %">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => set('progress', clamp(parseInt(e.target.value, 10), 0, 100))}
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </Field>
          <Field label="Rating (0-5)">
            <Input
              type="number"
              min={0}
              max={5}
              value={form.rating}
              onChange={(e) => set('rating', clamp(parseInt(e.target.value, 10), 0, 5))}
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={onSave} disabled={!isValid || isPending || uploading}>
            {uploading ? 'Uploading PDF...' : isPending ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add Book' : 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-zinc-500">{label}</label>
      {children}
    </div>
  );
}
