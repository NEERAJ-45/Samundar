"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function BackgroundGradient({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) {
  return (
    <div className={cn("relative p-[1px] group rounded-lg", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-br from-zinc-600 via-zinc-800 to-zinc-950 opacity-60",
          animate && "animate-pulse"
        )}
      />
      <div
        className={cn(
          "relative rounded-lg bg-[#0a0a0a]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
