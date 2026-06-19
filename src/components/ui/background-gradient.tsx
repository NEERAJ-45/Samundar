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
    <div className={cn("relative p-[1px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg opacity-60 blur-sm transition-opacity duration-500 group-hover:opacity-100",
          animate && "animate-shimmer"
        )}
        style={{
          background:
            "linear-gradient(90deg, #0f172a, #3b82f6, #0f172a, #3b82f6)",
          backgroundSize: "200% 200%",
        }}
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
