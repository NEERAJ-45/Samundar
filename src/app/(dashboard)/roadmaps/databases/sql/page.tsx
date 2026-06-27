'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Database, FileCode, CheckSquare, Layers } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import dynamic from 'next/dynamic';
import { useProfile } from '@/components/providers/ProfileProvider';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-zinc-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      <p className="text-sm text-zinc-500">Loading topics...</p>
    </div>
  ),
});

const ProblemsTable = dynamic(() => import('@/components/patterns/ProblemsTable').then(mod => mod.ProblemsTable), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-zinc-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      <p className="text-sm text-zinc-500">Loading practice problems...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

// SQL Conceptual/Theory Topics (50 Items)
const sqlTheoryQuestions: QuestionItem[] = [
  { id: 601, title: 'Introduction to Databases and DBMS Architecture', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms-architecture/' },
  { id: 602, title: 'Relational Data Model and Schemas definition', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/relational-model-in-dbms/' },
  { id: 603, title: 'Entity-Relationship (ER) Modeling & Crow\'s Foot Notation', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/introduction-of-er-model/' },
  { id: 604, title: 'Integrity Constraints: Entity, Referential, and Domain Integrity', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/dbms-integrity-constraints/' },
  { id: 605, title: 'SQL Basics: DDL (Data Definition Language) vs DML (Data Manipulation Language)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql-ddl-dml-tcl-dcl/' },
  { id: 606, title: 'SQL Data Selection, Filtering (WHERE) and Sorting (ORDER BY)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql-where-clause/' },
  { id: 607, title: 'SQL Joins: Inner, Left, Right, Full Outer, Cross, and Self Joins', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/' },
  { id: 608, title: 'SQL Aggregation functions and GROUP BY with HAVING clause', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql-group-by/' },
  { id: 609, title: 'Subqueries: Nested, Correlated, and EXISTS/NOT EXISTS operators', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql-subquery/' },
  { id: 610, title: 'Common Table Expressions (CTEs) & Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/sql-window-functions-in-sql/' },
  { id: 611, title: 'SQL Transaction Control Language (TCL): Commit, Rollback, and Savepoints', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql-tcl-commands/' },
  { id: 612, title: 'Database Normalization: 1NF, 2NF, 3NF and Boyce-Codd Normal Form (BCNF)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/introduction-of-database-normalization/' },
  { id: 613, title: 'Advanced Normalization: 4NF, 5NF and Multivalued Dependencies', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dbms-fourth-normal-form-4nf/' },
  { id: 614, title: 'Denormalization Strategies and Read-Write Performance Trade-offs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/denormalization-in-databases/' },
  { id: 615, title: 'Indexes: B-Tree and B+ Tree Indexing Structures', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-b-tree-and-b-tree/' },
  { id: 616, title: 'Advanced Indexes: Hash, GiST, GIN, and Bitmap Indexes', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/bitmap-indexing-in-dbms/' },
  { id: 617, title: 'Query Execution Plans, Cost-based Optimizers, and EXPLAIN command usage', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/query-optimization-in-dbms/' },
  { id: 618, title: 'ACID Properties and Transaction Life Cycle states', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/' },
  { id: 619, title: 'Concurrency Control: Shared (S) locks, Exclusive (X) locks, and Intent locks', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/lock-based-concurrency-control-protocol-in-dbms/' },
  { id: 620, title: 'Two-Phase Locking (2PL), Strict 2PL, and Rigorous 2PL protocols', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/two-phase-locking-protocol/' },
  { id: 621, title: 'Transaction Isolation Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/transaction-isolation-levels-dbms/' },
  { id: 622, title: 'Concurrency Anomalies: Dirty Reads, Non-repeatable Reads, Phantom Reads, and Write Skew', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/concurrency-problems-in-dbms-transactions/' },
  { id: 623, title: 'Multi-Version Concurrency Control (MVCC) implementation in PostgreSQL/MySQL', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/multi-version-concurrency-control-mvcc/' },
  { id: 624, title: 'Deadlocks: Detection, Prevention (Wait-Die / Wound-Wait), and Resolution', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/deadlock-in-dbms/' },
  { id: 625, title: 'Write-Ahead Logging (WAL) and ARIES Database Recovery algorithm', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/aries-recovery-algorithm-in-dbms/' },
  { id: 626, title: 'Database View vs Materialized View update strategies', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-views-and-materialized-views/' },
  { id: 627, title: 'Stored Procedures, User-Defined Functions, and Triggers', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/stored-procedures-and-triggers-in-sql/' },
  { id: 629, title: 'Database Connection Pooling and Driver performance tuning', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/what-is-database-connection-pooling/' },
  { id: 630, title: 'Database Replication topologies: Master-Replica and Multi-Master systems', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/data-replication-in-dbms/' },
  { id: 632, title: 'Database Sharding, Hash Partitioning, and Range Partitioning designs', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/database-sharding-a-system-design-concept/' },
  { id: 646, title: 'Object-Relational Mapping (ORM) vs Query Builders vs Raw SQL performance', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/orm-object-relational-mapping/' },
  { id: 647, title: 'Database Migrations and Schema evolution best practices', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/database-migration/' },
  { id: 650, title: 'Distributed Transactions: Two-Phase Commit (2PC) vs Saga pattern', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/two-phase-commit-protocol/' },
  { id: 651, title: 'Database Backups: Logical vs Physical backups and Point-in-Time Recovery (PITR)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/types-of-database-backups/' },
  { id: 652, title: 'Database Clustered vs Non-Clustered Indexes performance differences', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-clustered-and-non-clustered-index/' },
  { id: 653, title: 'Relational Algebra: Selection, Projection, Join, Division, and Set operations', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/introduction-of-relational-algebra-in-dbms/' },
  { id: 654, title: 'SQL CTEs (Common Table Expressions) vs Subqueries query optimization', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/cte-vs-subquery/' },
  { id: 655, title: 'SQL Truncate vs Delete vs Drop commands under transaction logs', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/difference-between-drop-truncate-and-delete-in-sql/' },
  { id: 656, title: 'Database Cursor Types (Static, Dynamic, Keyset-driven) and performance impact', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/sql-cursors/' },
  { id: 657, title: 'Relational Tuple Calculus vs Domain Calculus concepts', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/tuple-relational-calculus/' },
  { id: 658, title: 'SQL Window Functions: Lead, Lag, First_Value, and Last_Value usage', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql-lead-and-lag-functions/' },
  { id: 659, title: 'Database Partition Pruning and query execution performance', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/database-partitioning/' },
  { id: 660, title: 'Database Isolation Anomalies: Write Skew and Lost Updates in depth', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/write-skew-and-lost-updates-in-dbms/' },
  { id: 661, title: 'Database Locking: Optimistic vs Pessimistic Locking concurrency trade-offs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/optimistic-and-pessimistic-locking-in-dbms/' },
  { id: 662, title: 'Database Storage: Row-oriented vs Column-oriented storage engines', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/row-oriented-vs-column-oriented-databases/' },
  { id: 663, title: 'SQL Injection (SQLi) prevention, prepared statements, and query sanitization', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sql-injection-prevention/' },
  { id: 664, title: 'Database Connection Pools sizing rules (HikariCP / pgBouncer)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/connection-pooling-in-java/' },
  { id: 665, title: 'Database Failover topologies: Active-Passive vs Active-Active structures', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/database-failover-mechanisms/' },
  { id: 666, title: 'Database WAL (Write-Ahead Logging) checkpoints and data flushing', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/write-ahead-logging-wal-in-dbms/' },
  { id: 667, title: 'Database Statistics, Histograms, and Query Optimizer cardinality estimation', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cardinality-estimation-in-dbms/' }
];

// LeetCode Database Practice SQL Questions (50 Items)
const sqlLeetcodeQuestions = [
  { id: 175, title: 'Combine Two Tables', difficulty: 'EASY', link: 'https://leetcode.com/problems/combine-two-tables/' },
  { id: 176, title: 'Second Highest Salary', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/second-highest-salary/' },
  { id: 177, title: 'Nth Highest Salary', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/nth-highest-salary/' },
  { id: 178, title: 'Rank Scores', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/rank-scores/' },
  { id: 180, title: 'Consecutive Numbers', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/consecutive-numbers/' },
  { id: 181, title: 'Employees Earning More Than Their Managers', difficulty: 'EASY', link: 'https://leetcode.com/problems/employees-earning-more-than-their-managers/' },
  { id: 182, title: 'Duplicate Emails', difficulty: 'EASY', link: 'https://leetcode.com/problems/duplicate-emails/' },
  { id: 183, title: 'Customers Who Never Order', difficulty: 'EASY', link: 'https://leetcode.com/problems/customers-who-never-order/' },
  { id: 184, title: 'Department Highest Salary', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/department-highest-salary/' },
  { id: 185, title: 'Department Top Three Salaries', difficulty: 'HARD', link: 'https://leetcode.com/problems/department-top-three-salaries/' },
  { id: 196, title: 'Delete Duplicate Emails', difficulty: 'EASY', link: 'https://leetcode.com/problems/delete-duplicate-emails/' },
  { id: 197, title: 'Rising Temperature', difficulty: 'EASY', link: 'https://leetcode.com/problems/rising-temperature/' },
  { id: 262, title: 'Trips and Users', difficulty: 'HARD', link: 'https://leetcode.com/problems/trips-and-users/' },
  { id: 511, title: 'Game Play Analysis I', difficulty: 'EASY', link: 'https://leetcode.com/problems/game-play-analysis-i/' },
  { id: 512, title: 'Game Play Analysis II', difficulty: 'EASY', link: 'https://leetcode.com/problems/game-play-analysis-ii/' },
  { id: 550, title: 'Game Play Analysis IV', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/game-play-analysis-iv/' },
  { id: 570, title: 'Managers with at Least 5 Direct Reports', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/managers-with-at-least-5-direct-reports/' },
  { id: 577, title: 'Employee Bonus', difficulty: 'EASY', link: 'https://leetcode.com/problems/employee-bonus/' },
  { id: 584, title: 'Find Customer Referee', difficulty: 'EASY', link: 'https://leetcode.com/problems/find-customer-referee/' },
  { id: 585, title: 'Investments in 2016', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/investments-in-2016/' },
  { id: 586, title: 'Customer Placing the Largest Number of Orders', difficulty: 'EASY', link: 'https://leetcode.com/problems/customer-placing-the-largest-number-of-orders/' },
  { id: 595, title: 'Big Countries', difficulty: 'EASY', link: 'https://leetcode.com/problems/big-countries/' },
  { id: 596, title: 'Classes More Than 5 Students', difficulty: 'EASY', link: 'https://leetcode.com/problems/classes-more-than-5-students/' },
  { id: 601, title: 'Human Traffic of Stadium', difficulty: 'HARD', link: 'https://leetcode.com/problems/human-traffic-of-stadium/' },
  { id: 602, title: 'Friend Requests II: Who Has the Most Friends', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/' },
  { id: 607, title: 'Sales Person', difficulty: 'EASY', link: 'https://leetcode.com/problems/sales-person/' },
  { id: 608, title: 'Tree Node', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/tree-node/' },
  { id: 610, title: 'Triangle Judgement', difficulty: 'EASY', link: 'https://leetcode.com/problems/triangle-judgement/' },
  { id: 619, title: 'Biggest Single Number', difficulty: 'EASY', link: 'https://leetcode.com/problems/biggest-single-number/' },
  { id: 620, title: 'Not Boring Movies', difficulty: 'EASY', link: 'https://leetcode.com/problems/not-boring-movies/' },
  { id: 626, title: 'Exchange Seats', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/exchange-seats/' },
  { id: 627, title: 'Swap Salary', difficulty: 'EASY', link: 'https://leetcode.com/problems/swap-salary/' },
  { id: 1045, title: 'Customers Who Bought All Products', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/customers-who-bought-all-products/' },
  { id: 1050, title: 'Actors and Directors Who Cooperated At Least Three Times', difficulty: 'EASY', link: 'https://leetcode.com/problems/actors-and-directors-who-cooperated-at-least-three-times/' },
  { id: 1068, title: 'Product Sales Analysis I', difficulty: 'EASY', link: 'https://leetcode.com/problems/product-sales-analysis-i/' },
  { id: 1070, title: 'Product Sales Analysis III', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/product-sales-analysis-iii/' },
  { id: 1075, title: 'Project Employees I', difficulty: 'EASY', link: 'https://leetcode.com/problems/project-employees-i/' },
  { id: 1084, title: 'Sales Analysis III', difficulty: 'EASY', link: 'https://leetcode.com/problems/sales-analysis-iii/' },
  { id: 1141, title: 'User Activity for the Past 30 Days I', difficulty: 'EASY', link: 'https://leetcode.com/problems/user-activity-for-the-past-30-days-i/' },
  { id: 1148, title: 'Article Views I', difficulty: 'EASY', link: 'https://leetcode.com/problems/article-views-i/' },
  { id: 1158, title: 'Market Analysis I', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/market-analysis-i/' },
  { id: 1164, title: 'Product Price at a Given Date', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/product-price-at-a-given-date/' },
  { id: 1173, title: 'Immediate Food Delivery I', difficulty: 'EASY', link: 'https://leetcode.com/problems/immediate-food-delivery-i/' },
  { id: 1174, title: 'Immediate Food Delivery II', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/immediate-food-delivery-ii/' },
  { id: 1193, title: 'Monthly Transactions I', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/monthly-transactions-i/' },
  { id: 1204, title: 'Last Person to Fit in the Bus', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/' },
  { id: 1211, title: 'Queries Quality and Percentage', difficulty: 'EASY', link: 'https://leetcode.com/problems/queries-quality-and-percentage/' },
  { id: 1251, title: 'Average Selling Price', difficulty: 'EASY', link: 'https://leetcode.com/problems/average-selling-price/' },
  { id: 1280, title: 'Students and Examinations', difficulty: 'EASY', link: 'https://leetcode.com/problems/students-and-examinations/' },
  { id: 1321, title: 'Restaurant Growth', difficulty: 'MEDIUM', link: 'https://leetcode.com/problems/restaurant-growth/' }
];

export default function SQLRoadmapPage() {
  const [activeTab, setActiveTab] = useState<'theory' | 'leetcode'>('theory');
  const [sqlTheorySolved, setSqlTheorySolved] = useState(0);
  const [sqlLeetcodeSolved, setSqlLeetcodeSolved] = useState(0);

  useEffect(() => {
    const getSolvedCount = (prefix: string) => {
      try {
        const raw = localStorage.getItem(`${prefix}-completed`);
        if (!raw) return 0;
        const data = JSON.parse(raw);
        return Object.keys(data).length;
      } catch {
        return 0;
      }
    };
    setSqlTheorySolved(getSolvedCount('databases-sql'));
    setSqlLeetcodeSolved(getSolvedCount('databases-leetcode'));
  }, [activeTab]);

  const easyPractice = useMemo(() => sqlLeetcodeQuestions.filter(q => q.difficulty === 'EASY'), []);
  const mediumPractice = useMemo(() => sqlLeetcodeQuestions.filter(q => q.difficulty === 'MEDIUM'), []);
  const hardPractice = useMemo(() => sqlLeetcodeQuestions.filter(q => q.difficulty === 'HARD'), []);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Back navigation & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/roadmaps/databases"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-3 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Database
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Layers className="h-6 w-6 text-indigo-400" />
              SQL Database
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
              Focus on entity relations, constraints, indexing strategies (B+ Trees), concurrency anomalies, transaction isolation, and query parsing.
            </p>
          </div>

          {/* Quick Metrics display */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-zinc-900/30 border border-zinc-800 p-3 rounded-xl shrink-0">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">SQL Theory</span>
              <span className="text-xs font-semibold text-zinc-300">{sqlTheorySolved} / 50 Solved</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">SQL LeetCode</span>
              <span className="text-xs font-semibold text-zinc-300">{sqlLeetcodeSolved} / 50 Solved</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 mb-6 gap-2 select-none overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'theory'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            SQL Relational Concepts
          </button>
          <button
            onClick={() => setActiveTab('leetcode')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'leetcode'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode className="h-4 w-4" />
            LeetCode SQL Practice (50)
          </button>
        </div>

        {/* Render Tab Contents */}
        <div className="space-y-4">
          {activeTab === 'theory' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 bg-indigo-950/5 border border-indigo-900/10 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">SQL Relational Syllabus</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Focus on entity relations, constraints, indexing strategies (B+ Trees), concurrency anomalies, transaction isolation, deadlocks, and relational query parsing.
                </p>
              </div>
              <QuestionsTable
                questions={sqlTheoryQuestions}
                storagePrefix="databases-sql"
                searchPlaceholder="Search SQL theory topics..."
              />
            </div>
          )}

          {activeTab === 'leetcode' && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="p-4 bg-indigo-950/5 border border-indigo-900/10 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">LeetCode SQL Practice Wall</h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Solve 50 database query optimization problems. Covers aggregations, inner joins, subqueries, self-joins, window rank functions, and custom CTE implementations.
                </p>
              </div>
              <ProblemsTable
                patternName="databases-leetcode"
                easy={easyPractice}
                medium={mediumPractice}
                hard={hardPractice}
                onBack={() => setActiveTab('theory')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
