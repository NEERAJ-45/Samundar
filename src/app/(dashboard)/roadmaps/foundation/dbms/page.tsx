'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading DBMS roadmap topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const USER_NAME = 'NEERAJ';
const STORAGE_PREFIX = 'foundation-dbms';

const dbmsQuestions: QuestionItem[] = [
  { id: 301, title: 'What is a Database Management System (DBMS) and what are its advantages over File Systems?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/dbms-introduction/' },
  { id: 302, title: 'Explain the 3-schema Architecture (Internal, Conceptual, External) and Data Independence.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/three-schema-architecture/' },
  { id: 303, title: 'What is an Entity-Relationship (ER) model? Explain Entity, Attribute, and Relationship.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/introduction-of-er-model/' },
  { id: 304, title: 'Explain weak entity sets and how they are represented in ER diagrams.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/weak-entity-sets-in-dbms/' },
  { id: 305, title: 'Explain Super Key, Candidate Key, Primary Key, and Alternate Key.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/types-of-keys-in-relational-model-candidate-super-primary-alternate-and-foreign/' },
  { id: 306, title: 'What is a Foreign Key and how does it enforce Referential Integrity?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/foreign-key-constraint-in-sql/' },
  { id: 307, title: 'Explain the differences between DDL, DML, DCL, and TCL commands in SQL.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/sql-ddl-dml-tcl-dcl/' },
  { id: 308, title: 'What are Joins in SQL? Explain Inner, Left, Right, Full, and Self Joins.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql/sql-join-set-1-inner-left-right-and-full-joins/' },
  { id: 309, title: 'What is the difference between WHERE and HAVING clauses in SQL?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/difference-between-where-and-having-clause/' },
  { id: 310, title: 'Explain SQL Subqueries (Nested, Correlated Subqueries).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql/sql-subquery/' },
  { id: 311, title: 'What are SQL Common Table Expressions (CTEs) and recursive CTEs?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql/cte-in-sql/' },
  { id: 312, title: 'Explain Window Functions in SQL (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG).', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/sql/window-functions-in-sql/' },
  { id: 313, title: 'What is Database Normalization and why is it performed?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/introduction-of-database-normalization/' },
  { id: 314, title: 'Explain First Normal Form (1NF) with examples.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/first-normal-form-1nf/' },
  { id: 315, title: 'Explain Second Normal Form (2NF) and the concept of Partial Dependency.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/second-normal-form-2nf/' },
  { id: 316, title: 'Explain Third Normal Form (3NF) and the concept of Transitive Dependency.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/third-normal-form-3nf/' },
  { id: 317, title: 'Explain Boyce-Codd Normal Form (BCNF) and how it differs from 3NF.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/boyce-codd-normal-form-bcnf/' },
  { id: 318, title: 'What is Fourth Normal Form (4NF) and Multivalued Dependency?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/multivalued-dependency-in-dbms/' },
  { id: 319, title: 'What is Lossless Join Decomposition and Dependency Preservation?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/lossless-join-and-dependency-preserving-decomposition/' },
  { id: 320, title: 'What are ACID properties in Database Transactions? Explain each.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/acid-properties-in-dbms/' },
  { id: 321, title: 'Explain transaction states and state transitions.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/transaction-states-in-dbms/' },
  { id: 322, title: 'What is Conflict Serializability and how is it tested using Precedence Graphs?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/conflict-serializability-in-dbms/' },
  { id: 323, title: 'What is View Serializability and how does it compare to Conflict Serializability?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/view-serializability-in-dbms/' },
  { id: 324, title: 'What are Concurrency Control problems (Dirty Read, Unrepeatable Read, Lost Update, Phantom Read)?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/concurrency-problems-in-dbms-transactions/' },
  { id: 325, title: 'What is Transaction Isolation levels in SQL (Read Uncommitted, Read Committed, Repeatable Read, Serializable)?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/transaction-isolation-levels-dbms/' },
  { id: 326, title: 'Explain Lock-Based Protocols: Shared (S) and Exclusive (X) locks.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/lock-based-concurrency-control-protocol-in-dbms/' },
  { id: 327, title: 'Explain Two-Phase Locking (2PL), Strict 2PL, and Rigorous 2PL.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/two-phase-locking-protocol/' },
  { id: 328, title: 'Explain Timestamp-Ordering Protocol for concurrency control.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/timestamp-based-concurrency-control/' },
  { id: 329, title: 'How is Deadlock handled in transactions? Explain Wait-Die and Wound-Wait schemes.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/deadlock-in-dbms/' },
  { id: 330, title: 'What is Log-Based Recovery? Explain Deferred database modification vs Immediate modification.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/log-based-recovery-in-dbms/' },
  { id: 331, title: 'What is the role of Checkpoints in database recovery systems?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/dbms-checkpoint/' },
  { id: 332, title: 'What is Database Indexing and why does it speed up queries?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/indexing-in-databases/' },
  { id: 333, title: 'Explain Primary Index, Secondary Index, and Clustered Index.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/difference-between-clustered-and-non-clustered-index/' },
  { id: 334, title: 'Explain B-Tree and B+ Tree indexing structures.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dsa/difference-between-b-tree-and-b-tree/' },
  { id: 335, title: 'What is Hashing in DBMS? Explain Static vs Dynamic Hashing.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/hashing-in-dbms/' },
  { id: 336, title: 'Explain the difference between SQL (Relational) and NoSQL (Non-Relational) databases.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/sql-vs-nosql-which-one-is-better-to-use/' },
  { id: 337, title: 'What is a View in SQL and what are Inline Views and Materialized Views?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql/sql-views/' },
  { id: 338, title: 'What are Triggers in SQL and when should they be used?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql/sql-trigger-student-database/' },
  { id: 339, title: 'What are Stored Procedures and how do they differ from SQL Functions?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/difference-between-stored-procedure-and-function-in-sql/' },
  { id: 340, title: 'Explain SQL injection and standard practices to prevent it.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/sql-injection/' },
  { id: 341, title: 'What is database sharding vs partitioning?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/database-sharding-a-system-design-concept/' },
  { id: 342, title: 'What is replication? Explain Master-Slave and Master-Master replication.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/data-replication-in-dbms/' },
  { id: 343, title: 'What is a Data Warehouse and how does it differ from an Operational Database (OLTP vs OLAP)?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms/difference-between-oltp-and-olap-in-dbms/' },
  { id: 344, title: 'Explain the CAP Theorem and its application in distributed databases.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/the-cap-theorem-in-dbms/' },
  { id: 345, title: 'Explain the difference between DELETE, TRUNCATE, and DROP commands in SQL.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/difference-between-delete-drop-and-truncate/' },
  { id: 346, title: 'What is Database Pooling (Connection Pooling) and why is it needed?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/what-is-database-connection-pooling/' },
  { id: 347, title: 'Explain functional dependencies and how to find candidate keys using attribute closures.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms/functional-dependency-and-attribute-closure/' },
  { id: 348, title: 'What is RAID? Explain the major RAID levels and write performance.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/raid-redundant-arrays-of-independent-disks/' },
  { id: 349, title: 'Explain Star Schema vs Snowflake Schema in Data Warehouses.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dbms/difference-between-star-schema-and-snowflake-schema/' },
  { id: 350, title: 'What is a Cursor in SQL and when should we avoid using it?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql/sql-cursor/' }
];

export default function DBMSQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/foundation"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Foundation Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">DBMS roadmap</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Foundational and advanced topics in Relational model, Normalization, Transactions, Concurrency control, and Indexing.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={dbmsQuestions}
          storagePrefix="foundation-dbms"
          searchPlaceholder="Search DBMS topics..."
        />
      </div>
    </div>
  );
}
