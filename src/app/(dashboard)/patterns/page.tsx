"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PatternCard } from "@/components/patterns/PatternCard";
import { ProblemsTable } from "@/components/patterns/ProblemsTable";
import { Loader2, Search } from "lucide-react";
import { LazyAppear } from "@/components/shared/LazyAppear";

interface ProblemItem {
  id: number;
  title: string;
  link: string;
}

interface PatternData {
  name: string;
  description?: string;
  easy: ProblemItem[];
  medium: ProblemItem[];
  hard: ProblemItem[];
}

interface PatternsData {
  patterns: Record<string, PatternData>;
}

function PatternsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PatternsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const urlPattern = searchParams.get("pattern");
  useEffect(() => {
    if (urlPattern && data) {
      const found = Object.keys(data.patterns).find(
        (k) => k === urlPattern || data.patterns[k].name.toLowerCase().replace(/\s+/g, "-") === urlPattern
      );
      if (found) setSelectedKey(found);
    }
  }, [urlPattern, data]);

  useEffect(() => {
    fetch("/api/patterns")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const patternEntries = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.patterns)
      .filter(([key]) => {
        if (!search) return true;
        const lower = search.toLowerCase();
        return (
          key.replace(/-/g, " ").includes(lower) ||
          data.patterns[key].name.toLowerCase().includes(lower)
        );
      })
      .map(([key, p]) => ({
        key,
        name: p.name,
        easy: p.easy.length,
        medium: p.medium.length,
        hard: p.hard.length,
        total: p.easy.length + p.medium.length + p.hard.length,
        description: p.description,
      }));
  }, [data, search]);

  const selectedPattern = selectedKey && data ? data.patterns[selectedKey] : null;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      {selectedPattern ? (
        <ProblemsTable
          patternName={selectedPattern.name}
          easy={selectedPattern.easy}
          medium={selectedPattern.medium}
          hard={selectedPattern.hard}
          onBack={() => setSelectedKey(null)}
        />
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              DSA Patterns
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {patternEntries.length} patterns
            </p>
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 transition-colors focus-within:border-primary/50 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns..."
              className="w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {patternEntries.map((entry, index) => (
              <LazyAppear
                key={entry.key}
                delay={(index % 4) * 0.05}
                yOffset={10}
                placeholder={<div className="h-[54px] rounded-lg border border-zinc-800 bg-zinc-900/20 animate-pulse" />}
              >
                <PatternCard
                  name={entry.name}
                  total={entry.total}
                  description={entry.description}
                  selected={false}
                  onSelect={() => setSelectedKey(entry.key)}
                />
              </LazyAppear>
            ))}
          </div>

          {patternEntries.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No patterns match your search
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PatternsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading patterns...</p>
        </div>
      </div>
    }>
      <PatternsContent />
    </Suspense>
  );
}
