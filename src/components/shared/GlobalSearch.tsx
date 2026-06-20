"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    patterns: { id: string; name: string; type: string; description?: string }[];
    problems: never[];
  }>({ patterns: [], problems: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useKeyboardShortcut("k", () => setOpen(true), { metaKey: true });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults({ patterns: [], problems: [] });
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ patterns: [], problems: [] });
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data as typeof results);
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const allItems = [
    ...results.patterns.map((p) => ({
      type: "pattern" as const,
      id: p.id,
      label: p.name,
      slug: p.id,
    })),
  ];

  const handleSelect = useCallback(
    (item: (typeof allItems)[0]) => {
      setOpen(false);
      router.push(`/patterns?pattern=${item.slug}`);
    },
    [router]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(allItems[selectedIndex]);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, allItems, selectedIndex, handleSelect]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-[#1f1f1f] bg-[#111] px-3 py-1.5 text-sm text-[#6b7280] transition-colors hover:text-[#ededed]"
      >
        <Search size={14} strokeWidth={1.5} />
        <span>Search...</span>
        <kbd className="ml-4 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] text-[#6b7280]">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
            >
              <BackgroundGradient containerClassName="rounded-lg">
                <div className="rounded-lg border border-[#1f1f1f] bg-[#111]">
                  <div className="flex items-center gap-2 border-b border-[#1f1f1f] px-4 py-3">
                    <Search
                      size={16}
                      strokeWidth={1.5}
                      className="text-[#6b7280]"
                    />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search problems and patterns..."
                      className="flex-1 bg-transparent text-sm text-[#ededed] placeholder:text-[#6b7280] focus:outline-none"
                    />
                  </div>

                  {allItems.length > 0 && (
                    <div className="max-h-80 overflow-y-auto p-2">
                      <p className="px-2 py-1 text-xs text-[#6b7280]">
                        Knowledge Nodes
                      </p>
                      {results.patterns.map((p, idx) => (
                        <button
                          key={`p-${p.id}`}
                          onClick={() =>
                            handleSelect({
                              type: "pattern",
                              id: p.id,
                              label: p.name,
                              slug: p.id,
                            })
                          }
                          className={cn(
                            "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm",
                            selectedIndex === idx
                              ? "bg-[#1a1a1a] text-white"
                              : "text-[#ededed] hover:bg-[#1a1a1a]"
                          )}
                        >
                          <span>{p.name}</span>
                          {p.description && (
                            <span className="ml-2 truncate text-xs text-[#6b7280]">
                              {p.description}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {query.length >= 2 && allItems.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-[#6b7280]">
                      No results found
                    </div>
                  )}
                </div>
              </BackgroundGradient>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
