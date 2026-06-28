'use client';

import { useState, useEffect } from 'react';
import { StickyNote, NotebookPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface NotesDialogProps {
  id: number;
  initialValue: string;
  onSave: (id: number, val: string) => void;
}

export function NotesDialog({ id, initialValue, onSave }: NotesDialogProps) {
  const [val, setVal] = useState(initialValue);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(id, val);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border font-medium transition-all cursor-pointer mx-auto",
            initialValue
              ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
              : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-700"
          )}
        >
          <StickyNote size={13} />
          {initialValue ? 'Note' : 'Add Note'}
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-[400px] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none rounded-xl" />
        <DialogHeader>
          <DialogTitle className="text-zinc-100 flex items-center gap-2.5 text-base font-semibold">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <NotebookPen size={14} className="text-indigo-400" />
            </span>
            Quick Note
          </DialogTitle>
        </DialogHeader>

        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Type your notes here..."
          className="w-full min-h-[160px] bg-zinc-900/60 border border-zinc-800 rounded-lg p-3.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none resize-none leading-relaxed transition-colors focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/10"
        />

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button className="px-4 py-2 rounded-lg text-xs font-medium border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 transition-all cursor-pointer">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            Save Note
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
