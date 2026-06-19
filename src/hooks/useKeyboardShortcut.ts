"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
  }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = options?.metaKey || options?.ctrlKey;
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (options?.shiftKey && !e.shiftKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;

      e.preventDefault();
      callback();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options]);
}
