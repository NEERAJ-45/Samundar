# Patterns Drill-Down Copy as JSON — Design Spec

## Summary
Add context-aware Export dropdown to the ProblemsTable (drilled-down pattern view) that copies all problems for the current pattern as JSON, including localStorage state (completed, notes, bookmarks, completion dates).

## Current Behavior
- Patterns list view (`/patterns`, no pattern selected) → Export dropdown copies patterns summary CSV
- Drill-down view (pattern selected) → ProblemsTable renders with no export capability

## Desired Behavior
- Drill-down view → Export dropdown in ProblemsTable header copies **drilled-down pattern problems as JSON**

## JSON Output Format
```json
{
  "pattern": "two-pointers",
  "patternName": "Two Pointers",
  "description": "Use two pointers to traverse data structures efficiently...",
  "problems": [
    {
      "id": 167,
      "title": "Two Sum II - Input Array Is Sorted",
      "link": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
      "difficulty": "EASY",
      "completed": true,
      "completedAt": "2026-01-15",
      "notes": "Two pointer approach from both ends",
      "bookmarked": false
    },
    ...
  ],
  "total": 30,
  "solved": 12
}
```

## Implementation Approach
**Client-side fetch-all** — Loop through paginated API to get all problems, merge with localStorage state, copy to clipboard.

### Steps
1. Add `handleCopyJSON` function in `ProblemsTable.tsx`
2. Fetch all pages via `/api/patterns?pattern=<key>&page=X&pageSize=15` (3-4 requests max)
3. Merge API data with `completedMap`, `notesMap`, `bookmarkMap` from `useTableSync`
4. Build JSON object with pattern metadata + enriched problems array
5. Use existing `copyToClipboard` utility from `@/lib/export-utils`
6. Add Export DropdownMenu in ProblemsTable header (next to Bookmarked filter button)
7. Dropdown items: "Copy as JSON", "Copy as Markdown checklist", "Export CSV"
8. Toast confirmation on success

### Files to Modify
- `src/components/patterns/ProblemsTable.tsx` — add export logic + dropdown UI

## Fetch Strategy
- Page size: 15 (matches current default)
- Expected max pages: 3-4 for ~30 problems
- Sequential requests (simple, reliable) — total time < 500ms

## Data Sources
| Field | Source |
|-------|--------|
| id, title, link, difficulty | API (`/api/patterns?pattern=<key>`) |
| completed, completedAt | `completedMap` from `useTableSync` (localStorage) |
| notes | `notesMap` from `useTableSync` (localStorage) |
| bookmarked | `bookmarkMap` from `useTableSync` (localStorage) |

## Dropdown Options
1. **Copy as JSON** — Full enriched data (primary)
2. **Copy as Markdown checklist** — `- [x] Title - link (Difficulty)` format for Notion/Obsidian
3. **Export CSV** — `#,Title,Link,Difficulty,Completed,CompletedAt,Notes,Bookmarked`

## Success Criteria
- Click Export → Copy as JSON → clipboard contains valid JSON with all problems + local state
- Works for any pattern (35 patterns, varying problem counts)
- No backend changes required
- Toast confirms "Copied X problems as JSON"

## Non-Goals
- Backend `all=true` endpoint (not needed for ~30 items)
- Striver sheet / Custom roadmaps export (separate features)