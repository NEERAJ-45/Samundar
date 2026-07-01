'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Drizzle topics...</p>
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

const DRIZZLE_BASE = 'https://orm.drizzle.team/docs/overview';

const drizzleQuestions: QuestionItem[] = [
  // Phase 1: Setup & Schema (1-10) - MEDIUM
  { id: 1101, title: 'What Drizzle Is: SQL-First, Lightweight, Type-Safe', description: 'Staying close to SQL instead of abstracting it away.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1102, title: 'Installing Drizzle and Setting Up a Project', description: 'Install drizzle-orm, drizzle-kit, and a driver.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1103, title: 'Defining a Schema with pg-core', description: 'Declare tables as plain TS objects using pgTable/mysqlTable.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1104, title: 'Columns and Types', description: 'Define types, defaults, nullability, PKs directly in TypeScript.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1105, title: 'Drizzle Kit: Generating Migrations', description: 'drizzle-kit generate produces SQL migration files.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1106, title: 'Applying Migrations', description: 'Run generated migrations via drizzle-kit migrate or a custom runner.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1107, title: 'Connecting Drizzle to Postgres/MySQL/SQLite', description: 'Configure a driver and wrap it with drizzle().', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1108, title: 'Basic Select Queries', description: 'db.select().from(table) — mirrors SQL closely.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1109, title: 'Basic Insert, Update, Delete', description: 'Full type inference on returned rows.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1110, title: 'Type Inference from Schema', description: 'Types inferred automatically, no codegen step.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },

  // Phase 2: Queries (11-20) - EASY
  { id: 1111, title: 'Where Clauses and Operators', description: 'eq, gt, lt, and, or, like.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1112, title: 'Ordering and Limiting Results', description: 'orderBy, limit, offset.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1113, title: 'Joins: Inner and Left', description: 'Explicit SQL-style joins.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1114, title: 'Aggregate Functions', description: 'count, sum, avg, min, max with groupBy.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1115, title: 'Relational Queries API (db.query)', description: 'Higher-level builder for nested data fetching.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1116, title: 'Defining Relations for the Query API', description: 'relations() helper for one-to-many/many-to-many.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1117, title: 'Prepared Statements', description: '.prepare() for precompiled repeated queries.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1118, title: 'Subqueries', description: 'Nest a select query inside another.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1119, title: 'Transactions', description: 'db.transaction() for atomic multi-op writes — critical for financial writes.', difficulty: 'EASY', link: DRIZZLE_BASE },
  { id: 1120, title: 'Raw SQL with sql Template Tag', description: 'Drop into raw SQL safely when needed.', difficulty: 'EASY', link: DRIZZLE_BASE },

  // Phase 3: Relations & Joins (21-30) - MEDIUM
  { id: 1121, title: 'Many-to-Many with Join Tables', description: 'Manually define and query through a join table.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1122, title: 'Self-Referencing Relations', description: 'Hierarchical data like org charts/category trees.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1123, title: 'Composite Primary Keys', description: 'primaryKey({ columns: [...] }).', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1124, title: 'Foreign Keys and Cascading Actions', description: 'onDelete/onUpdate behavior.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1125, title: 'Indexes', description: 'Single and composite indexes via index().', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1126, title: 'Enums in Drizzle', description: 'Postgres enums or TS unions with check constraints.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1127, title: 'JSON and JSONB Columns', description: 'Store/query semi-structured data.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1128, title: 'Views', description: 'Define and query database views.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1129, title: 'Schema Introspection', description: 'drizzle-kit introspect to generate schema from an existing DB.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },
  { id: 1130, title: 'Zod Integration for Validation', description: 'Auto-generate Zod schemas from table definitions.', difficulty: 'MEDIUM', link: DRIZZLE_BASE },

  // Phase 4: Migrations & Types (31-40) - HARD
  { id: 1131, title: 'Connection Pooling', description: 'Pool size and limits for postgres.js/node-postgres.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1132, title: 'Drizzle with Serverless/Edge (Neon, PlanetScale, D1)', description: 'HTTP-based drivers for serverless.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1133, title: 'Optimistic Locking Pattern', description: 'Manual version-based concurrency control.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1134, title: 'Soft Deletes Pattern', description: 'deletedAt column pattern with query helpers.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1135, title: 'Batch Inserts', description: 'Insert large arrays efficiently in one statement.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1136, title: 'Upserts', description: 'onConflictDoUpdate — relevant to idempotent payment writes.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1137, title: 'Query Performance: EXPLAIN ANALYZE', description: 'Inspect and optimize predictable Drizzle SQL output.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1138, title: 'Testing Drizzle Code with Testcontainers', description: 'Real Postgres containers in tests.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1139, title: 'Multi-Schema Support (Postgres schemas)', description: 'Organize tables for multi-tenant designs.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1140, title: 'Drizzle Studio', description: 'Built-in local GUI to browse/edit data.', difficulty: 'HARD', link: DRIZZLE_BASE },

  // Phase 5: Advanced & Production (41-50) - HARD
  { id: 1141, title: 'Comparing Drizzle vs Prisma vs Hibernate Query Philosophy', description: 'SQL-close vs abstracted tradeoffs.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1142, title: 'Custom Column Types', description: '.$type<T>() for domain values like Money or Currency.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1143, title: 'Computed/Generated Columns', description: 'Postgres-maintained derived values.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1144, title: 'Row-Level Security Patterns', description: 'Tenant isolation at the query layer.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1145, title: 'Read Replicas Pattern', description: 'Route reads to replicas, writes to primary — common for high-TPS systems.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1146, title: 'Integrating Drizzle in a Hexagonal/Clean Architecture', description: 'Isolate schema/queries behind a repository layer.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1147, title: 'Drizzle in a Monorepo (Shared Schema Package)', description: 'Share one schema across services.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1148, title: 'Outbox Pattern with Drizzle', description: 'Transactional outbox writes for reliable Kafka publishing — directly relevant to RevPay.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1149, title: 'Logging and Query Debugging', description: 'Enable the logger option to see every generated SQL statement.', difficulty: 'HARD', link: DRIZZLE_BASE },
  { id: 1150, title: 'Migrating a Prisma/TypeORM Project to Drizzle', description: 'Apply everything to swap out a heavier ORM.', difficulty: 'HARD', link: DRIZZLE_BASE },
];

export default function DrizzlePage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Drizzle</h1>
          <p className="text-sm text-zinc-500 mt-1">
            50 modules covering Drizzle ORM from SQL-first schema design to production patterns. Lightweight and type-safe.
          </p>
        </div>

        <QuestionsTable
          questions={drizzleQuestions}
          storagePrefix="orms-drizzle"
          searchPlaceholder="Search Drizzle topics..."
        />
      </div>
    </div>
  );
}
