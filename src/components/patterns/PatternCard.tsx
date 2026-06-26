"use client";

import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface PatternCardProps {
  index: number;
  name: string;
  total: number;
  completed: number;
  selected: boolean;
  onSelect: () => void;
  description?: string;
}

export function PatternCard({
  index,
  name,
  total,
  completed,
  selected,
  onSelect,
  description,
}: PatternCardProps) {
  return (
    <tr
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/50",
        selected && "bg-primary/5"
      )}
    >
      <td className="px-4 py-3 text-xs font-medium text-muted-foreground tabular-nums w-12">{index}</td>
      <td className="px-4 py-3 text-sm font-semibold text-foreground truncate max-w-60 w-60">{name}</td>
      <td className="px-4 py-3 w-28">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{completed}/{total}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs font-medium text-muted-foreground text-right w-20 tabular-nums">{total}</td>
      <td className="px-4 py-3 w-12">
        {description && (
          <div className="group relative inline-flex">
            <Info className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
            <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-64 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
              {description}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-popover" />
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
