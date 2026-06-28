'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading system design concepts...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const DEFAULT_COMPLETED_IDS = Array.from({ length: 37 }, (_, i) => 401 + i); // 401 to 437 inclusive

const conceptsQuestions: QuestionItem[] = [
  // 1. Databases
  { id: 401, title: 'Introduction to Relational Databases & Storage Engines', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/introduction-to-relational-databases/' },
  { id: 402, title: 'B+ Tree Indexing Node Structure (internal vs leaf nodes)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/b-tree-set-1-introduction-2/' },
  { id: 403, title: 'B+ Tree Indexing: Branching Factor & Disk I/O Reduction logic', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/b-tree-insert-2/' },
  { id: 404, title: 'Clustered vs Non-Clustered Index: Storage layout differences', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-clustered-and-non-clustered-index/' },
  { id: 405, title: 'Clustered vs Non-Clustered Index: Performance implications', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/how-indexes-work-in-database/' },
  { id: 406, title: 'Covering Index: Index-only scan mechanics', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/what-is-covering-index-in-sql/' },
  { id: 407, title: 'Covering Index: When it avoids table lookup entirely', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/sql-covering-indexes/' },
  { id: 408, title: 'Query Execution Plan: Reading EXPLAIN outputs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/how-to-read-a-database-execution-plan/' },
  { id: 409, title: 'Query Execution Plan: Identifying Full Table Scan vs Index Scan', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/difference-between-table-scan-and-index-scan/' },
  { id: 410, title: 'Write-Ahead Logging (WAL): Log-first write principle', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/write-ahead-logging-wal-in-dbms/' },
  { id: 411, title: 'Write-Ahead Logging (WAL): Database crash recovery flow', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/crash-recovery-in-dbms/' },
  { id: 412, title: 'Checkpointing: Why checkpoints exist & performance trade-offs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/checkpoint-in-dbms/' },
  { id: 413, title: 'ACID Implementation: Atomicity via WAL & Durability via fsync', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/' },
  { id: 414, title: 'ACID Implementation: Isolation via Locking vs MVCC', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/multi-version-concurrency-control-mvcc/' },
  { id: 415, title: 'ACID Implementation: Consistency via Schema Constraints & Triggers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/' },
  { id: 416, title: 'Database Locking vs MVCC: Read/write blocking behavior', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-locking-and-mvcc/' },
  { id: 417, title: 'Database Isolation Levels: Dirty Reads, Non-Repeatable Reads & Phantom Reads', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/transaction-isolation-levels-dbms/' },
  { id: 418, title: 'MVCC Mechanics: Version chains, snapshot creation & Visibility rules', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/mvcc-in-postgresql/' },
  { id: 419, title: 'MVCC Mechanics: Repeatable Read vs Serializable Isolation & Write Skew', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/write-skew-problem-in-dbms/' },
  { id: 420, title: 'Database Replication: Leader-Follower Sync vs Async Architecture', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/database-replication/' },
  { id: 421, title: 'Replication Lag: Dealing with Read-After-Write Inconsistency', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/challenges-in-database-replication/' },
  { id: 422, title: 'Failover Process: Leader failure, consensus & split-brain issues', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/what-is-split-brain-in-distributed-systems/' },
  { id: 423, title: 'Scaling Databases: Vertical vs Horizontal Scaling limits', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/difference-between-horizontal-and-vertical-scaling-in-databases/' },
  { id: 424, title: 'Scaling Databases: Read Replica limits & Write bottlenecks', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/how-to-scale-database-reads-and-writes/' },
  { id: 425, title: 'Scaling Databases: Cross-Region replication trade-offs', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cross-region-replication-in-cloud/' },
  { id: 426, title: 'Consistency Models: Strong vs Eventual Consistency in scaling', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/eventual-consistency-in-distributed-systems/' },
  { id: 427, title: 'Database Sharding: Range-Based vs Hash-Based Sharding', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/database-sharding-a-system-design-concept/' },
  { id: 428, title: 'Database Sharding: Directory-Based Sharding mechanics', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/directory-based-sharding-in-dbms/' },
  { id: 429, title: 'Consistent Hashing: Hash ring & server rebalancing strategy', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/consistent-hashing-system-design/' },
  { id: 430, title: 'Database Sharding: Mitigating Hot Partitions (Celebrity problem)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/hot-partition-issue-in-sharding/' },
  { id: 431, title: 'Database Sharding: Solving Cross-Shard Joins', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cross-shard-joins-in-database-sharding/' },
  { id: 432, title: 'Database Sharding: Designing Global Secondary Indexes', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/global-secondary-index-in-nosql-databases/' },
  { id: 433, title: 'NoSQL: Key-Value Stores vs Document Databases', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/introduction-to-nosql/' },
  { id: 434, title: 'NoSQL: Column Stores (Wide-Column) vs Graph Databases', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/types-of-nosql-databases/' },
  { id: 435, title: 'NoSQL Trade-offs: Denormalization & Eventual consistency behavior', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/denormalization-in-databases/' },
  { id: 436, title: 'NoSQL Trade-offs: Secondary Index Limitations in distributed stores', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nosql-secondary-indexes/' },
  { id: 437, title: 'Database Replication: Multi-Leader Conflicts & Conflict Resolution', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/conflict-resolution-in-multi-leader-replication/' },
  // 2. Caching
  { id: 438, title: 'Caching Core Patterns: Cache-Aside vs Write-Through Patterns', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/caching-system-design-interview-concept/' },
  { id: 439, title: 'Caching Core Patterns: Write-Back vs Write-Around Patterns', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/write-back-and-write-around-caching/' },
  { id: 440, title: 'Caching Operations: TTL Strategy Design & Stale Data window', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/how-to-choose-optimal-cache-ttl/' },
  { id: 441, title: 'Caching Operations: Cache Warming strategies', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/cache-warming-strategies/' },
  { id: 442, title: 'Eviction Policies: LRU vs LFU vs FIFO Eviction algorithm', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/cache-eviction-policies-system-design/' },
  { id: 443, title: 'Memory Fragmentation: Internal vs External Fragmentation in caching', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/difference-between-internal-and-external-fragmentation/' },
  { id: 444, title: 'Cache Consistency: Cache Invalidation strategies & Double Delete pattern', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cache-invalidation-in-system-design/' },
  { id: 445, title: 'Cache Inconsistency: Read-After-Write Inconsistency & Stale Data windows', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/cache-consistency-problems/' },
  { id: 446, title: 'Caching Failure Scenarios: Cache Stampede & Thundering Herd mitigation', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cache-stampede-prevention-techniques/' },
  { id: 447, title: 'Caching Failure Scenarios: Hot Key problem & Cache Penetration', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/how-to-handle-hot-key-issue-in-redis/' },
  { id: 448, title: 'Caching Failure Scenarios: Cold Start & Cache Avalanche prevention', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/cache-penetration-avalanche-and-breakdown/' },
  { id: 449, title: 'Redis Internals: Single-Threaded Event Loop & why Redis is fast', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/why-redis-is-single-threaded/' },
  { id: 450, title: 'Redis Persistence: RDB vs AOF Persistence modes', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/redis-persistence-demystified-rdb-vs-aof/' },
  { id: 451, title: 'Redis Clustering: Replication Model, Sentinel & Cluster Mode', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/redis-sentinel-and-redis-cluster/' },
  { id: 452, title: 'Redis Clustering: Slot-Based Sharding mechanics', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/redis-cluster-architecture/' },
  // 3. Async Processing
  { id: 453, title: 'Messaging Delivery Guarantees: At-Most-Once, At-Least-Once & Exactly-Once', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/message-delivery-guarantees-in-distributed-systems/' },
  { id: 454, title: 'Idempotency: Achieving Exactly-Once processing in messaging consumers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/idempotent-consumer-pattern/' },
  { id: 455, title: 'Resiliency in Message Queues: Dead Letter Queues (DLQ) & retry strategies', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/what-is-a-dead-letter-queue-dlq/' },
  { id: 456, title: 'Messaging Flow: Backpressure Handling & Throttling in consumers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/backpressure-in-reactive-systems/' },
  { id: 457, title: 'Kafka Internals: Topic Architecture & Partition strategies', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/apache-kafka-architecture/' },
  { id: 458, title: 'Kafka Consumer Groups: Partition key selection, ordering & offset management', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/consumer-groups-in-apache-kafka/' },
  { id: 459, title: 'Kafka High Availability: ISR (In-Sync Replicas) & Leader Election', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/replication-in-apache-kafka/' },
  { id: 460, title: 'Kafka Operations: Log Compaction & Retention policies', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/log-compaction-in-apache-kafka/' },
  { id: 461, title: 'Kafka Communication: Pull Model Rationale vs Push messaging', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/push-vs-pull-communication-model-in-system-design/' },
  { id: 462, title: 'Messaging Failures: Producer retry duplication, Consumer crash, Broker fail & network partition', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/fault-tolerance-in-message-queues/' },
  // 4. Load Balancing & Resiliency
  { id: 463, title: 'Load Balancers: Layer 4 (L4) vs Layer 7 (L7) Load Balancing', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-l4-and-l7-load-balancing/' },
  { id: 464, title: 'Load Balancing Algorithms: Round Robin, Least Connections & Consistent Hashing', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/load-balancer-algorithms-in-system-design/' },
  { id: 465, title: 'Load Balancing Features: Health Checks & Sticky Sessions', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/sticky-session-load-balancer/' },
  { id: 466, title: 'Resiliency Patterns: Circuit Breaker States (Closed, Open, Half-Open)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/circuit-breaker-pattern-in-system-design/' },
  { id: 467, title: 'Resiliency Patterns: Fail Fast Principle & Cascading Failure Prevention', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/cascading-failures-in-distributed-systems/' },
  { id: 468, title: 'Consensus Concept: Leader Election, Quorum & Raft basics', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/raft-consensus-algorithm/' },
  // 5. Estimation Practice
  { id: 469, title: 'Back-of-the-envelope estimation: QPS, Storage & Bandwidth calculations', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/back-of-the-envelope-estimation-system-design/' },
  // 6. API Design Principles
  { id: 470, title: 'API Protocols: gRPC vs REST vs GraphQL Trade-offs & Protobuf', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/rest-vs-grpc-vs-graphql-system-design/' },
  { id: 471, title: 'API Design: URL versioning, Header versioning & Query parameters', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/api-versioning-best-practices/' },
  { id: 472, title: 'API Design: Idempotency-Key header design', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/idempotency-key-in-rest-api/' },
  { id: 473, title: 'API Pagination: Offset-based vs Cursor-based Pagination', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/offset-vs-cursor-based-pagination/' },
  // 7. DNS & Traffic Routing
  { id: 474, title: 'DNS Resolution Flow: Recursive vs Iterative resolution, Anycast & Geo DNS', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/how-dns-works/' },
  // 8. CDN
  { id: 475, title: 'Content Delivery Network (CDN): Push vs Pull CDN & Cache Invalidation', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/content-delivery-network-cdn-system-design/' },
  // 9. Proxies
  { id: 476, title: 'Proxies: Forward Proxy vs Reverse Proxy vs VPN', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/difference-between-forward-proxy-and-reverse-proxy/' },
  // 10. Distributed Systems
  { id: 477, title: 'CAP Theorem vs PACELC Theorem in Distributed Systems', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/pacelc-theorem-in-system-design/' }
];

export default function SystemDesignConceptsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/system-design"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to System Design Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">System Design Concepts</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Theoretical building blocks, caching structures, database scaling protocols, and queue strategies.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={conceptsQuestions}
          storagePrefix="system-design-concepts"
          searchPlaceholder="Search concepts..."
          defaultCompletedIds={DEFAULT_COMPLETED_IDS}
        />
      </div>
    </div>
  );
}
