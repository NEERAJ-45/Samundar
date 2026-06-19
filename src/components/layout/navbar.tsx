'use client';

import * as React from 'react';
import { Search, Command } from 'lucide-react';
import { useModeStore } from '@/lib/stores/mode-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { mode } = useModeStore();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex-1" />

      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search anything...</span>
        <kbd className="ml-auto inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />
          K
        </kbd>
      </button>

      <div className="inline-flex items-center gap-2 rounded-md border border-input bg-muted/50 px-2.5 py-1">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            mode === 'HOME' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {mode}
        </span>
      </div>

      <Avatar className="h-8 w-8 cursor-pointer">
        <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
          NS
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
