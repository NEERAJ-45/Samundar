"use client";

import { cn } from "@/lib/utils";

interface PatternCardProps {
  name: string;
  total: number;
  selected: boolean;
  onSelect: () => void;
  description?: string;
}

export function PatternCard({
  name,
  total,
  selected,
  onSelect,
  description,
}: PatternCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col rounded-lg border p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      </div>
      {description && (
        <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
          {description}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </button>
  );
}
