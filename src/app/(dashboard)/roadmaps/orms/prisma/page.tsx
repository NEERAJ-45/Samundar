'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Prisma topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  link: string;
}

const PRISMA_BASE = 'https://www.prisma.io/docs';

const prismaQuestions: QuestionItem[] = [
  // Phase 1: Setup & Schema (1-10) - EASY
  { id: 1051, title: 'What Prisma Is and How It Differs from Traditional ORMs', description: 'Schema-first, generated-client approach vs reflection-based ORMs like Hibernate.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1052, title: 'Installing Prisma and Initializing a Project', description: 'prisma init, connect a datasource, generate your first client.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1053, title: 'The Prisma Schema Language', description: 'Syntax for datasource, generator, and model blocks.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1054, title: 'Defining Models and Fields', description: 'Map a model to a table with typed fields and attributes like @id, @unique.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1055, title: 'Prisma Migrate: First Migration', description: 'Use prisma migrate dev to generate and apply SQL migrations.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1056, title: 'The Prisma Client', description: 'How prisma generate produces a fully typed client from your schema.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1057, title: 'Connecting Prisma to Postgres/MySQL/SQL Server', description: 'Configure the datasource block; provider-specific quirks.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1058, title: 'Basic CRUD with Prisma Client', description: 'create, findMany, update, delete with full type safety.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1059, title: 'Filtering and Where Clauses', description: 'Use filter operators (equals, contains, gt, in, etc.).', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1060, title: 'Selecting and Including Fields', description: 'Use select and include to control returned data.', difficulty: 'EASY', link: PRISMA_BASE },

  // Phase 2: Relations (11-20) - EASY
  { id: 1061, title: 'One-to-One Relations', description: 'Model 1:1 relationships; understand which side holds the FK.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1062, title: 'One-to-Many Relations', description: 'Model parent-child relationships; query nested data naturally.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1063, title: 'Many-to-Many (Implicit)', description: 'Let Prisma auto-manage the join table.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1064, title: 'Many-to-Many (Explicit)', description: 'Define your own join model for extra relationship fields.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1065, title: 'Nested Writes', description: 'Create/update related records in one call via create/connect/disconnect.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1066, title: 'Relation Filters', description: 'Query models based on related-record conditions (some, every, none).', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1067, title: 'Cascading Deletes', description: 'Configure onDelete: Cascade and referential actions.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1068, title: 'Enums in Prisma Schema', description: 'Constrained fields like status or role.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1069, title: 'Composite IDs and Unique Constraints', description: 'Use @@id and @@unique.', difficulty: 'EASY', link: PRISMA_BASE },
  { id: 1070, title: 'Indexes in Prisma Schema', description: 'Add @@index for frequently filtered columns.', difficulty: 'EASY', link: PRISMA_BASE },

  // Phase 3: Querying (21-30) - MEDIUM
  { id: 1071, title: 'Pagination: Offset-based', description: 'Use skip and take.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1072, title: 'Pagination: Cursor-based', description: 'Use cursor for stable pagination on large datasets.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1073, title: 'Sorting with orderBy', description: 'Sort by one or multiple fields, including relations.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1074, title: 'Aggregations', description: 'count, sum, avg, min, max for reporting queries.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1075, title: 'Group By Queries', description: 'Bucket and aggregate data like SQL GROUP BY.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1076, title: 'Raw SQL Queries', description: '$queryRaw / $executeRaw when the query API isn\'t enough.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1077, title: 'Transactions: Sequential', description: 'prisma.$transaction([...]) for atomic multi-ops.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1078, title: 'Transactions: Interactive', description: 'Callback-based API for logic-dependent writes.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1079, title: 'Middleware / Client Extensions', description: 'Intercept queries globally (soft deletes, auditing).', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1080, title: 'Error Handling', description: 'Catch typed error codes (P2002 unique violation, P2025 not found).', difficulty: 'MEDIUM', link: PRISMA_BASE },

  // Phase 4: Migrations & Advanced (31-40) - MEDIUM
  { id: 1081, title: 'Prisma Migrate in Production', description: 'Use prisma migrate deploy in CI/CD.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1082, title: 'Migration Drift and Shadow Databases', description: 'How Prisma detects schema drift.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1083, title: 'Baselining an Existing Database', description: 'prisma db pull and migration baselining.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1084, title: 'Seeding Data', description: 'Write and run a seed script via prisma db seed.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1085, title: 'Prisma Studio', description: 'Built-in GUI to inspect/edit data during dev.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1086, title: 'Connection Pooling with Prisma', description: 'Prisma\'s pooling vs external poolers like PgBouncer.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1087, title: 'Prisma Accelerate and Data Proxy', description: 'Edge-friendly connection pooling/caching for serverless.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1088, title: 'Optimizing N+1 Queries in Prisma', description: 'Automatic query batching and its limits.', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1089, title: 'Full-Text Search', description: 'Prisma\'s full-text search API (Postgres/MySQL).', difficulty: 'MEDIUM', link: PRISMA_BASE },
  { id: 1090, title: 'JSON Fields', description: 'Store and query semi-structured data.', difficulty: 'MEDIUM', link: PRISMA_BASE },

  // Phase 5: Production & Ecosystem (41-50) - HARD
  { id: 1091, title: 'Prisma with TypeScript Generics', description: 'Use generated types (Prisma.UserGetPayload, etc.) in your own functions.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1092, title: 'Prisma Client Extensions', description: 'Add custom methods/computed fields via $extends.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1093, title: 'Multi-Schema and Multi-File Schemas', description: 'Organize large schemas as projects grow.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1094, title: 'Prisma with Serverless (Lambda, Edge)', description: 'Handle cold starts and connection limits.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1095, title: 'Testing Prisma Code', description: 'Mock the client or use real test DBs with Testcontainers-style setups.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1096, title: 'Row-Level Security Patterns', description: 'Implement tenant isolation at the query layer.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1097, title: 'Optimistic Concurrency Control', description: 'Manual version-based conflict detection (no built-in @Version).', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1098, title: 'Prisma vs Raw SQL Performance Tradeoffs', description: 'When the abstraction costs too much for hot paths.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1099, title: 'Logging and Query Metrics', description: 'Enable query event logging to debug slow queries.', difficulty: 'HARD', link: PRISMA_BASE },
  { id: 1100, title: 'Migrating from Sequelize/TypeORM to Prisma', description: 'Apply everything to a real migration scenario.', difficulty: 'HARD', link: PRISMA_BASE },
];

export default function PrismaPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/orms"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ORMs
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Prisma</h1>
          <p className="text-sm text-zinc-500 mt-1">
            50 modules covering Prisma from schema definition to production deployment. Schema-first ORM for TypeScript.
          </p>
        </div>

        <QuestionsTable
          questions={prismaQuestions}
          storagePrefix="orms-prisma"
          searchPlaceholder="Search Prisma topics..."
        />
      </div>
    </div>
  );
}
