"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PatternCard } from "@/components/patterns/PatternCard";
import { ProblemsTable } from "@/components/patterns/ProblemsTable";
import { Loader2, Search } from "lucide-react";

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
  const [completedVersion, setCompletedVersion] = useState(0);
  const [completions, setCompletions] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/db/completions")
      .then((res) => res.json())
      .then((d) => {
        if (d?.data) {
          const counts: Record<string, number> = {};
          for (const c of d.data) {
            const prefix = c.storagePrefix?.replace("completed-", "");
            if (prefix) counts[prefix] = (counts[prefix] || 0) + 1;
          }
          setCompletions(counts);
        }
      })
      .catch(() => {});
  }, [completedVersion]);

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
        completed: completions[p.name] || 0,
        description: p.description,
      }));
  }, [data, search, completions]);

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
          onBack={() => { setCompletedVersion(v => v + 1); setSelectedKey(null); }}
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

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-12">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-60 max-w-60">Pattern</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-28">Progress</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground w-20">Total</th>
                  <th className="px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {patternEntries.map((entry, index) => (
                  <PatternCard
                    key={entry.key}
                    index={index + 1}
                    name={entry.name}
                    total={entry.total}
                    completed={entry.completed}
                    description={entry.description}
                    selected={false}
                    onSelect={() => setSelectedKey(entry.key)}
                  />
                ))}
              </tbody>
            </table>
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
