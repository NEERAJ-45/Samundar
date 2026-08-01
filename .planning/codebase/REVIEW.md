---
phase: codebase-review
reviewed: 2026-08-01T06:54:06Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - src/auth.ts
  - src/auth.config.ts
  - src/components/patterns/ProblemDesc.tsx
  - src/app/api/leetcode/route.ts
  - src/app/api/db/profile/route.ts
  - src/app/api/db/activity/route.ts
  - src/app/api/latex/compile/route.ts
  - src/app/api/db/reset/route.ts
  - src/app/api/db/notes/route.ts
  - src/app/api/db/custom-topics/route.ts
  - src/app/api/db/bookmarks/route.ts
  - src/app/api/db/projects/route.ts
  - src/components/providers/ProfileProvider.tsx
  - src/hooks/use-command-center.ts
  - src/hooks/use-table-sync.ts
  - src/hooks/use-notes.ts
  - src/hooks/use-custom-topics.ts
  - src/hooks/use-completions.ts
  - src/lib/services/notes.ts
  - src/lib/services/custom-topics.ts
  - src/lib/db.ts
  - src/lib/activity-logger.ts
  - src/lib/models/Profile.ts
  - src/app/api/auth/register/route.ts
findings:
  critical: 5
  warning: 0
  info: 2
  total: 7
status: issues_found
---
# Phase codebase: Code Review Report

**Reviewed:** 2026-08-01T06:54:06Z
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

I found several concrete security and correctness issues in the app routes and shared rendering path. The most important ones are a raw HTML XSS sink for LeetCode descriptions, multiple unauthenticated user-scoped DB endpoints that trust caller-supplied email addresses, and a server-side LaTeX compilation endpoint that executes untrusted input in the app process.

## Critical Issues

### CR-01: Raw external HTML is rendered directly into the DOM

**File:** `src/components/patterns/ProblemDesc.tsx:78-80`
**Issue:** The LeetCode description returned by the API is inserted with `dangerouslySetInnerHTML` with no sanitization. The API source is external HTML (`src/app/api/leetcode/route.ts:16-31`), so any unsafe markup or event handler makes this a client-side XSS sink.
**Fix:** Sanitize before rendering, or render through a safe whitelist-based HTML/Markdown pipeline.
```tsx
import DOMPurify from 'dompurify';

<div
  className="prose prose-sm prose-invert max-w-none text-foreground"
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content ?? '') }}
/>
```

### CR-02: Profile data can be read or overwritten for any email address

**File:** `src/app/api/db/profile/route.ts:42-140`
**Issue:** `GET`, `PATCH`, and `POST` all trust the caller-supplied `email` value and never verify the authenticated session. Any client can fetch another user's profile, overwrite onboarding state, or create/update records for arbitrary emails.
**Fix:** Require `auth()` in every branch and derive the email from `session.user.email`; reject any request that tries to operate on a different email.
```ts
const session = await auth();
if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const email = session.user.email;
```

### CR-03: Activity history is exposed to arbitrary users and can be deleted cross-account

**File:** `src/app/api/db/activity/route.ts:7-56`
**Issue:** The handler accepts `userEmail` from the query string or headers for `GET` and `DELETE`, and from the request body for `POST`, with no authentication. That lets any caller read or wipe another user's activity log by spoofing the email.
**Fix:** Bind the route to the authenticated session email and stop accepting `userEmail` from the client.
```ts
const session = await auth();
if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const userEmail = session.user.email;
```

### CR-04: Server-side LaTeX compilation runs untrusted user input in the app process

**File:** `src/app/api/latex/compile/route.ts:24-145`
**Issue:** The endpoint writes arbitrary TeX to disk and invokes `pdflatex` on the server. TeX is not sandboxed here, so an attacker can use file-reading primitives such as `\input` to exfiltrate server files into the generated PDF, and the fallback cloud path sends the same payload to a third-party service.
**Fix:** Move compilation into an isolated sandboxed worker/container with a locked-down filesystem, or replace local compilation with a hardened external service that does not have access to app secrets or local files.

### CR-05: The bulk reset endpoint can delete another user's data set

**File:** `src/app/api/db/reset/route.ts:12-52`
**Issue:** This route deletes completions, activity, projects, revisions, notes, custom topics, login attempts, and profile settings for whatever `userEmail` the caller supplies. There is no session check, so a forged request can wipe a different account.
**Fix:** Require authentication and operate only on `session.user.email`; if this is meant to be a self-service reset, ignore any client-provided email.

## Info

### IN-01: The table-sync hook owns too many responsibilities

**File:** `src/hooks/use-table-sync.ts:41-260`
**Issue:** One hook handles localStorage bootstrapping, DB reconciliation, broadcast-channel signaling, and three separate resource mutation flows. That makes failures hard to isolate and hides resource-specific behavior behind one large state machine.
**Fix:** Split it into a generic sync engine plus small resource adapters, for example `syncResourceFromDb`, `persistLocalCollection`, and per-resource completion/note/custom-topic handlers.

### IN-02: Request-header and fetch wrapper logic is duplicated across resource hooks

**Files:** `src/hooks/use-completions.ts:7-45`, `src/hooks/use-notes.ts:7-45`, `src/hooks/use-custom-topics.ts:7-59`, `src/lib/services/notes.ts:61-123`, `src/lib/services/custom-topics.ts:57-122`
**Issue:** Each hook rebuilds the same `{ Content-Type, x-user-email, x-mongodb-url }` header set and mirrors the same fetch/error handling pattern. This is already partially extracted, but the duplication is still split across hooks and services.
**Fix:** Centralize the shared request context in one `useDbRequestHeaders` helper and make the service layer own the fetch/error normalization for all user-scoped DB resources.

## Suspicious Areas

The same trust-the-client `userEmail` pattern repeats in `src/app/api/db/notes/route.ts:19-77`, `src/app/api/db/custom-topics/route.ts:7-89`, `src/app/api/db/bookmarks/route.ts:5-68`, and `src/app/api/db/projects/route.ts:12-127`. I did not expand every one into a separate finding here, but they likely need the same auth gate as the critical routes above.

---
_Reviewed: 2026-08-01T06:54:06Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
