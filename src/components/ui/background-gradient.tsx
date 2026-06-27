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
    <div className={cn("relative p-[1px] group border border-zinc-800/80 rounded-lg bg-zinc-950", containerClassName)}>
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
