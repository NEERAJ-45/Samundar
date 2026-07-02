# Samundar — ProdigyOS Learning Tracker

## Project Overview
A full-stack learning progress tracking platform built with Next.js, MongoDB, and Tailwind CSS. Features include DSA problem tracking, learning roadmaps, daily schedule management, spaced-revision system, and analytics dashboard.

## Architecture
- **Framework**: Next.js (App Router)
- **Auth**: NextAuth v5 with Credentials provider, JWT sessions, brute-force lockout
- **Database**: MongoDB via Mongoose (optional, localStorage-first with DB sync)
- **Styling**: Tailwind CSS v4
- **State**: React hooks + localStorage for client state; MongoDB for persistence

## Key Conventions
- Client components use `'use client'` directive
- API routes in `src/app/api/` follow route handler pattern
- UI components in `src/components/ui/` are generic/reusable
- Shared data constants in `src/data/`
- Storage key constants in `src/lib/storage-keys.ts`
- Shared hooks in `src/hooks/`
- Error boundaries in `src/components/shared/ErrorBoundary.tsx`
- Auth config and handlers in `src/auth.config.ts` and `src/auth.ts`
- Mongoose models in `src/lib/models/`
- Utility functions in `src/lib/utils.ts`

## Common Tasks
- **Adding a roadmap**: Add entry to `src/data/roadmaps.ts` and corresponding storage key in `src/lib/storage-keys.ts`
- **Adding an API route**: Create route handler in `src/app/api/` directory
- **Adding a model**: Create Mongoose schema in `src/lib/models/`
- **Adding a UI component**: Create in `src/components/ui/` following existing patterns (cn() utility, forwardRef for Radix components)
- **Running lint**: `npm run lint`
- **Running typecheck**: `npx tsc --noEmit`
