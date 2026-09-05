# Patterns Drill-Down Copy as JSON Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Export dropdown to ProblemsTable (drilled-down pattern view) that copies all problems for the current pattern as JSON, including localStorage state (completed, notes, bookmarks, completion dates).

**Architecture:** Client-side fetch-all loop to get all paginated problems from `/api/patterns?pattern=<key>`, merge with localStorage maps from `useTableSync`, build JSON object, copy to clipboard via existing `copyToClipboard` utility. No backend changes.

**Tech Stack:** React, TanStack Query, TanStack Table, localStorage, existing `copyToClipboard` utility, lucide-react icons, shadcn/ui DropdownMenu/Toast.

## Global Constraints

- File: `src/components/patterns/ProblemsTable.tsx` only (single component modification)
- Use existing `copyToClipboard` and `buildCsv` from `@/lib/export-utils`
- Use existing `toast` from `@/components/ui/toast`
- Use existing `useTableSync` hook for localStorage state (completedMap, notesMap, bookmarkMap)
- Fetch pageSize=15 (matches API default)
- JSON structure per spec: pattern metadata + enriched problems array
- Dropdown options: "Copy as JSON", "Copy as Markdown checklist", "Export CSV"
- Toast on success/error

---

### Task 1: Add fetch-all helper and JSON builder

**Files:**
- Modify: `src/components/patterns/ProblemsTable.tsx`

**Interfaces:**
- Consumes: `patternKey` (string prop), `useTableSync` returns (completedMap, notesMap, bookmarkMap, etc.)
- Produces: `fetchAllProblems(patternKey)` async function, `buildProblemsJSON(problems, metadata)` function

- [ ] **Step 1: Add fetch-all helper function**

```typescript
// Add near top of ProblemsTable component, after imports
async function fetchAllProblems(patternKey: string): Promise<ProblemWithDifficulty[]> {
  const allProblems: ProblemWithDifficulty[] = [];
  let page = 1;
  const pageSize = 15;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      pattern: patternKey,
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/patterns?${params}`);
    if (!res.ok) throw new Error("Failed to fetch problems");
    const data = await res.json();
    const problems = (data.problems ?? []).map((p: any) => ({
      ...p,
      _difficultyOrder: p.difficulty === "EASY" ? 0 : p.difficulty === "HARD" ? 2 : 1,
    }));
    allProblems.push(...problems);
    hasMore = problems.length === pageSize && page < (data.totalPages ?? 1);
    page++;
  }
  return allProblems;
}
```

- [ ] **Step 2: Add JSON builder function**

```typescript
function buildProblemsJSON(
  patternKey: string,
  patternName: string,
  description: string | null | undefined,
  problems: ProblemWithDifficulty[],
  completedMap: Record<string, string>,
  notesMap: Record<string, string>,
  bookmarkMap: Record<string, boolean>
) {
  const enriched = problems.map((p) => ({
    id: p.id,
    title: p.title,
    link: p.link,
    difficulty: p.difficulty,
    completed: !!completedMap[p.id],
    completedAt: completedMap[p.id] || null,
    notes: notesMap[p.id] || "",
    bookmarked: !!bookmarkMap[p.id],
  }));
  const solved = enriched.filter((p) => p.completed).length;
  return {
    pattern: patternKey,
    patternName,
    description: description ?? "",
    problems: enriched,
    total: enriched.length,
    solved,
  };
}
```

- [ ] **Step 3: Add Markdown checklist builder**

```typescript
function buildMarkdownChecklist(
  patternName: string,
  problems: ProblemWithDifficulty[],
  completedMap: Record<string, string>
): string {
  const lines = [`# ${patternName} Problems`, ""];
  for (const p of problems) {
    const done = !!completedMap[p.id];
    const checkbox = done ? "[x]" : "[ ]";
    lines.push(`- ${checkbox} ${p.title} - ${p.link} (${p.difficulty.charAt(0) + p.difficulty.slice(1).toLowerCase()})`);
  }
  return lines.join("\n");
}
```

- [ ] **Step 4: Add CSV builder**

```typescript
function buildProblemsCSV(
  problems: ProblemWithDifficulty[],
  completedMap: Record<string, string>,
  notesMap: Record<string, string>,
  bookmarkMap: Record<string, boolean>
): string {
  const header = ["#", "Title", "Link", "Difficulty", "Completed", "CompletedAt", "Notes", "Bookmarked"];
  const rows = problems.map((p, i) => [
    String(i + 1),
    p.title,
    p.link,
    p.difficulty,
    completedMap[p.id] ? "true" : "false",
    completedMap[p.id] || "",
    notesMap[p.id] || "",
    bookmarkMap[p.id] ? "true" : "false",
  ]);
  return [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
```

---

### Task 2: Add copy handlers using existing utilities

**Files:**
- Modify: `src/components/patterns/ProblemsTable.tsx`

**Interfaces:**
- Consumes: `copyToClipboard` from `@/lib/export-utils`, `toast` from `@/components/ui/toast`, functions from Task 1
- Produces: `handleCopyJSON`, `handleCopyMarkdown`, `handleExportCSV` async functions

- [ ] **Step 1: Import required utilities (add to existing imports)**

```typescript
import { copyToClipboard, buildCsv } from "@/lib/export-utils";
import { toast } from "@/components/ui/toast";
```

- [ ] **Step 2: Add copy handler functions (inside component, after column definitions)**

```typescript
const handleCopyJSON = useCallback(async () => {
  if (!patternKey) return;
  try {
    const allProblems = await fetchAllProblems(patternKey);
    const json = buildProblemsJSON(
      patternKey,
      displayName,
      apiData?.description ?? null,
      allProblems,
      completedMap,
      notesMap,
      bookmarkMap
    );
    copyToClipboard(JSON.stringify(json, null, 2), `${patternName} problems (JSON)`);
    toast({ title: `Copied ${json.total} problems as JSON` });
  } catch {
    toast({ variant: "destructive", title: "Copy failed" });
  }
}, [patternKey, patternName, displayName, apiData?.description, completedMap, notesMap, bookmarkMap]);

const handleCopyMarkdown = useCallback(async () => {
  if (!patternKey) return;
  try {
    const allProblems = await fetchAllProblems(patternKey);
    const md = buildMarkdownChecklist(displayName, allProblems, completedMap);
    copyToClipboard(md, `${patternName} problems (Markdown)`);
    toast({ title: `Copied ${allProblems.length} problems as Markdown checklist` });
  } catch {
    toast({ variant: "destructive", title: "Copy failed" });
  }
}, [patternKey, displayName, completedMap]);

const handleExportCSV = useCallback(async () => {
  if (!patternKey) return;
  try {
    const allProblems = await fetchAllProblems(patternKey);
    const csv = buildProblemsCSV(allProblems, completedMap, notesMap, bookmarkMap);
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${patternKey}-problems.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${allProblems.length} problems as CSV` });
  } catch {
    toast({ variant: "destructive", title: "Export failed" });
  }
}, [patternKey, completedMap, notesMap, bookmarkMap]);
```

---

### Task 3: Add Export DropdownMenu to ProblemsTable header

**Files:**
- Modify: `src/components/patterns/ProblemsTable.tsx`

**Interfaces:**
- Consumes: DropdownMenu components from `@/components/ui/dropdown-menu`, handlers from Task 2
- Produces: Export dropdown UI in header (next to Bookmarked filter)

- [ ] **Step 1: Add DropdownMenu imports (add to existing imports)**

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Clipboard, FileText } from "lucide-react";
```

- [ ] **Step 2: Add Export dropdown in header (modify return JSX, after Bookmarked button)**

```tsx
{/* Replace the Bookmarked button section with this expanded header */}
<div className="mb-4 flex items-center gap-3 flex-wrap">
  <button onClick={onBack} className="...">
    <ArrowLeft className="h-3.5 w-3.5" />
    {backLabel}
  </button>
  <h2 className="text-lg font-semibold text-foreground">{displayName}</h2>
  <span className="text-xs font-semibold text-muted-foreground">
    {solvedCount}/{displayTotal} solved
    {isFetching && <Loader2 className="inline ml-1 h-3 w-3 animate-spin" />}
  </span>
  {!isServerPaginated && <AddItemDialog ... />}
  
  {/* Bookmarked filter */}
  <button onClick={() => setBookmarkedOnly((v) => !v)} className={...}>
    <Star size={13} className={cn(bookmarkedOnly && "fill-amber-400")} />
    Bookmarked
  </button>

  {/* Export Dropdown */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium border border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors shrink-0">
        <Download size={13} />
        Export
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground min-w-[180px]">
      <DropdownMenuItem onClick={handleCopyJSON} className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-zinc-100 gap-2">
        <Clipboard size={12} /> Copy as JSON
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleCopyMarkdown} className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-zinc-100 gap-2">
        <FileText size={12} /> Copy as Markdown Checklist
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleExportCSV} className="text-xs cursor-pointer focus:bg-zinc-800 focus:text-zinc-100 gap-2">
        <Download size={12} /> Export as CSV
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

---

### Task 4: Verify and test

**Files:**
- Test: Manual verification in browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to /patterns, click a pattern (e.g., "Two Pointers")**

- [ ] **Step 3: Click Export dropdown → "Copy as JSON"**

- [ ] **Step 4: Paste into editor — verify JSON structure matches spec:**
  - Root keys: pattern, patternName, description, problems[], total, solved
  - Each problem: id, title, link, difficulty, completed, completedAt, notes, bookmarked
  - completed/notes/bookmarked reflect localStorage state

- [ ] **Step 5: Test "Copy as Markdown Checklist" — verify format:**
  ```
  # Two Pointers Problems

  - [ ] Two Sum II - https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/ (Easy)
  - [x] 3Sum - https://leetcode.com/problems/3sum/ (Medium)
  ```

- [ ] **Step 6: Test "Export as CSV" — verify file downloads with correct columns**

- [ ] **Step 7: Test edge cases:**
  - Pattern with 0 problems (should handle gracefully)
  - Network error (toast shows "Copy failed")
  - Large pattern (all 30+ problems fetched)

- [ ] **Step 8: Run lint and typecheck**

```bash
npm run lint
npm run typecheck
```

---

### Task 5: Commit

```bash
git add src/components/patterns/ProblemsTable.tsx
git commit -m "feat(patterns): add export dropdown to ProblemsTable with JSON/Markdown/CSV copy"
```