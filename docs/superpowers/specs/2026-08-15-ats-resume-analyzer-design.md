# ATS Resume Analyzer — Design

Date: 2026-08-15
Status: Approved (Approach A)

## Goal

Turn the existing in-editor ATS analyzer into a complete feature: guarded against
abuse/cost, persisting per-resume analysis history, higher-quality criterion-level
scoring, and accessible from both the resume editor and the resume list.

The current implementation (`src/lib/ats.ts`, `src/app/api/ats/route.ts`,
`[id]/ats-analyzer.tsx`, toolbar "Analyze" button) works end-to-end. This design
refactors and extends it.

## Requirements (from brainstorming)

1. Fix security/cost gap: `/api/ats` is unauthenticated and burns paid Gemini quota.
2. Add "Analyze" entry on the resume list page (`/plan/resume`).
3. Improve analysis quality: criterion rubric + local keyword cross-check + optional role-title bias.
4. Persist analysis history per resume.
5. Review/refactor the current design into well-bounded modules.

## Data model

New Mongoose schema `src/lib/models/ResumeAnalysis.ts`:

```
ResumeAnalysis {
  userEmail: string        (indexed)
  resumeId: ObjectId       (ref Resume, indexed; null if no resume context)
  action: 'analyze' | 'optimize'
  jd: string
  roleTitle: string | null (optional bias)
  resumeSnapshot: string   (latexSource at run time; keeps history stable)
  scores: {
    atsScore, matchScore,
    structure, keywords, actionVerbs, quantifiableImpact, length, contactInfo  // each 0-100 int
  }
  missingKeywords: [string]
  presentKeywords: [string]
  strengths: [string]
  weaknesses: [string]
  recommendations: [string]
  optimizedSource: string | null   (for optimize runs)
  createdAt: Date (default now)
}
```

Registered in the central model registry so `connectToDatabase` loads it, matching
`Resume.ts`.

**Quota rides on this table**: today's count of rows for the user = usage. No
separate counter model.

## Backend

### lib refactor: `src/lib/ats/*` (split from single `ats.ts`)

- `ats/types.ts` — `AtsAnalysis`, `AtsRun`, `AtsResult`, criteria types.
- `ats/engine.ts` — `generateContent` + model fallback loop + JSON extraction (from current `invoke`).
- `ats/prompts.ts` — `analyzePrompt` (criterion rubric + optional `roleTitle`) and `optimizePrompt`.
- `ats/keywords.ts` — local JD→resume keyword cross-check (split JD into terms/phrases, check presence in plain-text snapshot). Dependency-free.
- `ats/analyze.ts` — orchestrator `analyzeResume(...)` / `optimizeResume(...)` returning full `AtsResult` incl. criteria + `optimizedSource`.
- `ats/quota.ts` — `ANALYZE_LIMIT = 10`, `OPTIMIZE_LIMIT = 5`.

### Fixes folded in

- `maxOutputTokens: 4096 -> 8192` on optimize (fixes truncation risk).
- Remove the redundant `{ ...fallback, action }` double-invoke path; fall back once, don't re-run both models twice.

### Routes

1. **`POST /api/ats`** (refactored current route)
   - `auth()` -> `401` if no session.
   - Body validation: `resume`, `jobDescription`, optional `roleTitle`, `action`.
   - Quota check via `connectToDatabase` + `ResumeAnalysis.countDocuments({ userEmail, createdAt: >= startOfToday })`. Analyze 10/day, Optimize 5/day. Over -> `429 { error: 'Daily ATS limit reached' }`.
   - Run Gemini -> persist a `ResumeAnalysis` row -> return result.
   - `catch` -> `500 { error }` (generic message; no key/model leak).

2. **`GET /api/db/resume-analyses?resumeId=...`**
   - `auth()` -> `401`; query rows by `userEmail` (+ optional `resumeId`), `sort({ createdAt: -1 })`.
   - Returns `{ data: ResumeAnalysis[] }`; uses `getDbUri(request)` / `x-mongodb-url` header convention from `../request`.

## Client

### `src/hooks/use-resume-analyses.ts` (follows `use-resumes.ts` conventions)

- `useResumeAnalysesQuery(resumeId)` — `useQuery(['resume-analyses', resumeId])` reading `GET /api/db/resume-analyses`.
- `useAtsRun(resumeId, onSuccess)` — `useMutation` calling `POST /api/ats`; on success invalidates `['resume-analyses', resumeId]` + calls `onSuccess`. Headers/auth via `useProfile()`. `429` surfaces via existing `toast`.

### Shared modal `src/components/resume/ats-analyzer.tsx`

Promoted from `[id]/ats-analyzer.tsx` so both editor and list use it. Upgrades:
- Optional **role title** input (biases scoring).
- **Criterion sub-score bars** (structure, keywords, action verbs, impact, length, contact) + ATS/JD rings.
- **Optimize** persists its rewritten source; "Apply to editor" unchanged.
- **History** panel: past runs (action, scores, date); selecting one shows stored results and, for an optimize run, re-applies stored `optimizedSource`.
- Keep render-time-reset (fresh state per open) and unmount-on-close from current code.

### List page `plan/resume/page.tsx`

- Per-row **Analyze** action (icon button in row action menu) opening the shared modal with that row's `latexSource`.

### Editor page `[id]/page.tsx`

- Swap local import to shared component; toolbar Analyze button stays.

## Error handling

- `/api/ats`: `401` (no session) < `400` (bad body) < `429` (daily quota) < `500` (upstream/AI, generic).
- Engine: model fallback loop stays; if all fail with no `lastErr`, throw `'AI request failed'` (generic).
- Optimize fallback: missing/invalid `optimizedSource` -> warn + return analysis only (no double re-run).
- Client: failures via `toast({ variant: 'destructive' })`; quota friendly `429`.

## Keyword cross-check (quality)

- `ats/keywords.ts` splits JD into terms/2–3-word phrases, checks against plain-text resume snapshot -> local present/missing sets.
- Merge with AI's lists (union of missing) so `missingKeywords` isn't purely model-hallucinated; sanity-check the model's `keywords` sub-score against the local result.
- Dependency-free (no NLP lib).

## Testing

- `src/lib/ats/keywords.test.ts` — pure function tests (repo uses `vitest`, `npm run test`).
- No integration test hits live Gemini API (cost); engine stays manual-verified.
- Verify: `npm run typecheck`, `npm run lint`, `npm run build`, plus a manual local run of analyze + optimize against `/api/ats`.

## Out of scope

- No env-config quota (flat constants; add `ponytail:` note that env knobs come later if usage demands).
- No NLP dependency.
- No multi-user roles/teams; per-user only (matches repo).
