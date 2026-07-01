'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Hibernate topics...</p>
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

const HIBERNATE_BASE = 'https://docs.jboss.org/hibernate/orm/6.6/userguide/html_single/Hibernate_User_Guide.html';

const hibernateQuestions: QuestionItem[] = [
  // Phase 1: Fundamentals (1-10) - EASY
  { id: 1001, title: 'JPA vs Hibernate: What Problem ORMs Solve', description: 'Understand the impedance mismatch between OOP and relational tables, and why Hibernate exists as a JPA implementation.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1002, title: 'Entity Basics — @Entity, @Table, @Id', description: 'Mark a POJO as a persistent entity and map it to a table with a primary key.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1003, title: 'Primary Key Generation Strategies', description: 'AUTO, IDENTITY, SEQUENCE, TABLE — learn how Hibernate generates PKs and which fits SQL Server vs Oracle vs Postgres.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1004, title: 'Basic Column Mapping (@Column)', description: 'Control column name, nullability, length, and precision explicitly.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1005, title: 'EntityManager and Persistence Context', description: 'Understand the first-level cache and entity states (transient, managed, detached, removed).', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1006, title: 'SessionFactory vs EntityManagerFactory', description: 'See how Hibernate\'s native API maps onto JPA\'s standard API.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1007, title: 'Configuring Hibernate with Spring Boot', description: 'Set up spring-boot-starter-data-jpa with datasource and dialect config.', difficulty: 'EASY', link: 'https://spring.io/projects/spring-data-jpa' },
  { id: 1008, title: 'Hibernate Dialects', description: 'Configure the correct dialect for SQL Server/Oracle/Postgres and understand why it matters.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1009, title: 'DDL Auto and Schema Generation', description: 'Understand ddl-auto options and why "validate" is the only safe one in production.', difficulty: 'EASY', link: HIBERNATE_BASE },
  { id: 1010, title: 'Basic CRUD with Spring Data JPA Repositories', description: 'Use JpaRepository to get save/find/delete without boilerplate.', difficulty: 'EASY', link: 'https://spring.io/projects/spring-data-jpa' },

  // Phase 2: Mappings & Associations (11-20) - MEDIUM
  { id: 1011, title: 'One-to-One Mapping', description: 'Model a strict 1:1 relationship with @OneToOne and understand owning vs inverse side.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1012, title: 'One-to-Many / Many-to-One', description: 'Model parent-child relationships and understand which side owns the FK.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1013, title: 'Many-to-Many Mapping', description: 'Use a join table with @ManyToMany; learn why two @OneToMany relations is often better.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1014, title: 'Cascade Types', description: 'Learn PERSIST, MERGE, REMOVE, ALL and how operations cascade.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1015, title: 'Fetch Types: EAGER vs LAZY', description: 'Understand default fetch strategies per association type.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1016, title: 'Bidirectional vs Unidirectional Associations', description: 'Decide when to expose both sides of a relationship.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1017, title: 'Embeddable Types', description: 'Use @Embeddable/@Embedded to model value objects like Address or Money.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1018, title: 'Inheritance Mapping Strategies', description: 'Compare SINGLE_TABLE, JOINED, TABLE_PER_CLASS.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1019, title: 'Composite Keys', description: 'Use @EmbeddedId or @IdClass for multi-column primary keys.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1020, title: 'Enums and Custom Type Mapping', description: 'Map Java enums with @Enumerated and write custom AttributeConverters.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },

  // Phase 3: Querying (21-30) - MEDIUM
  { id: 1021, title: 'JPQL Basics', description: 'Write queries that operate on entities, not tables.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1022, title: 'Named Queries', description: 'Define reusable JPQL queries with @NamedQuery.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1023, title: 'Criteria API', description: 'Build type-safe, programmatic queries for dynamic filtering.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1024, title: 'Native SQL Queries', description: 'Fall back to raw SQL with @Query(nativeQuery = true).', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1025, title: 'Spring Data Derived Query Methods', description: 'Use method-name conventions to auto-generate queries.', difficulty: 'MEDIUM', link: 'https://spring.io/projects/spring-data-jpa' },
  { id: 1026, title: 'Pagination and Sorting', description: 'Use Pageable and Sort to page through large result sets.', difficulty: 'MEDIUM', link: 'https://spring.io/projects/spring-data-jpa' },
  { id: 1027, title: 'Projections and DTOs', description: 'Fetch only needed fields via interface/class-based projections.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1028, title: 'Specifications API', description: 'Compose dynamic, reusable query predicates.', difficulty: 'MEDIUM', link: 'https://spring.io/projects/spring-data-jpa' },
  { id: 1029, title: 'Subqueries and Joins in JPQL', description: 'Write correlated subqueries and JOIN FETCH clauses.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },
  { id: 1030, title: 'Native Stored Procedure Calls', description: 'Call stored procedures — relevant to your Payment Switch\'s SQL Server backend.', difficulty: 'MEDIUM', link: HIBERNATE_BASE },

  // Phase 4: Performance & Caching (31-40) - HARD
  { id: 1031, title: 'The N+1 Query Problem', description: 'Understand how lazy loading causes N+1 query storms.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1032, title: 'Solving N+1 with JOIN FETCH', description: 'Eagerly load associations in a single query.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1033, title: 'Solving N+1 with EntityGraphs', description: 'Use @EntityGraph to declaratively control fetch plans.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1034, title: 'Batch Fetching', description: 'Configure default_batch_fetch_size to reduce query count.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1035, title: 'First-Level Cache Deep Dive', description: 'Understand persistence-context-scoped caching limits.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1036, title: 'Second-Level Cache', description: 'Enable a shared cache (Ehcache/Redis) across sessions.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1037, title: 'Query Cache', description: 'Cache query result sets; understand invalidation risks.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1038, title: 'Dirty Checking and Flush Modes', description: 'Understand when flushes happen (AUTO, COMMIT, MANUAL).', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1039, title: 'Optimistic Locking with @Version', description: 'Prevent lost updates in concurrent writes — critical for payment systems.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1040, title: 'Pessimistic Locking', description: 'Use SELECT ... FOR UPDATE for critical financial transaction paths.', difficulty: 'HARD', link: HIBERNATE_BASE },

  // Phase 5: Advanced & Production (41-50) - HARD
  { id: 1041, title: 'Transaction Management with @Transactional', description: 'Understand propagation, isolation, and rollback rules.', difficulty: 'HARD', link: 'https://spring.io/projects/spring-data-jpa' },
  { id: 1042, title: 'Isolation Levels and Phantom Reads', description: 'Map SQL isolation levels to real concurrency bugs.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1043, title: 'Connection Pooling with HikariCP', description: 'Tune pool size, timeout, and leak detection.', difficulty: 'HARD', link: 'https://github.com/brettwooldridge/HikariCP' },
  { id: 1044, title: 'Batch Inserts/Updates', description: 'Configure jdbc.batch_size for true batched writes.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1045, title: 'Auditing with Hibernate Envers', description: 'Track entity history for compliance-sensitive data.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1046, title: 'Multi-tenancy Strategies', description: 'Schema-per-tenant vs discriminator-column approaches.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1047, title: 'Testing with Testcontainers', description: 'Run real Postgres/SQL Server in integration tests.', difficulty: 'HARD', link: 'https://testcontainers.com/' },
  { id: 1048, title: 'Flyway/Liquibase Migrations alongside Hibernate', description: 'Manage schema changes safely.', difficulty: 'HARD', link: 'https://www.baeldung.com/liquibase-refactoring-documents' },
  { id: 1049, title: 'Profiling Hibernate SQL', description: 'Use show_sql, p6spy, or datasource-proxy to optimize generated SQL.', difficulty: 'HARD', link: HIBERNATE_BASE },
  { id: 1050, title: 'Migrating a JdbcTemplate Codebase to Hibernate', description: 'Apply everything to incrementally introduce Hibernate into a service like your payment portal.', difficulty: 'HARD', link: 'https://www.baeldung.com/hibernate' },
];

export default function HibernatePage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Hibernate (JPA)</h1>
          <p className="text-sm text-zinc-500 mt-1">
            50 modules covering JPA/Hibernate from fundamentals to production-grade patterns. Each phase builds on the last.
          </p>
        </div>

        <QuestionsTable
          questions={hibernateQuestions}
          storagePrefix="orms-hibernate"
          searchPlaceholder="Search Hibernate topics..."
        />
      </div>
    </div>
  );
}
