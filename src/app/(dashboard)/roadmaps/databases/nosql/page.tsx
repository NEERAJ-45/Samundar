'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ArrowLeft, Database, Layers } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-zinc-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      <p className="text-sm text-zinc-500">Loading topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

// NoSQL Conceptual/Theory Topics (50 Items)
const nosqlTheoryQuestions: QuestionItem[] = [
  { id: 628, title: 'Full-Text Search Indexing, Tokenizers, and Document vectors', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/what-is-full-text-search/' },
  { id: 631, title: 'Consensus in Distributed Databases: Paxos and Raft protocols', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/consensus-algorithms-paxos-and-raft/' },
  { id: 633, title: 'CAP Theorem and Distributed Database trade-offs', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/the-cap-theorem-in-dbms/' },
  { id: 634, title: 'PACELC Theorem: Latency vs Consistency trade-offs under partition and normal states', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/pacelc-theorem-in-distributed-systems/' },
  { id: 635, title: 'Introduction to NoSQL categories: Key-Value, Document, Wide-Column, Graph', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/introduction-to-nosql/' },
  { id: 636, title: 'Document Databases: MongoDB CRUD, Indexes, and Aggregation framework', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/mongodb-introduction/' },
  { id: 637, title: 'Key-Value Stores: Redis data structures, memory eviction, and replication', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/redis-introduction/' },
  { id: 638, title: 'Wide-Column Stores: Cassandra storage model, LSM-Trees, and CQL', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/apache-cassandra-introduction/' },
  { id: 639, title: 'Graph Databases: Neo4j Cypher queries, nodes, and relationships model', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/introduction-to-neo4j-and-graph-databases/' },
  { id: 640, title: 'Consistent Hashing and Distributed Hash Tables (DHT)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/consistent-hashing/' },
  { id: 641, title: 'Dynamo Paper Architecture: Gossip Protocol, Sloppy Quorums, and Hinted Handoff', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dynamo-a-distributed-key-value-storage-system/' },
  { id: 642, title: 'Eventual Consistency, Conflict-free Replicated Data Types (CRDTs), and Vector Clocks', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/eventual-consistency-in-distributed-systems/' },
  { id: 643, title: 'Time-Series Databases: InfluxDB and Prometheus storage layout', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/time-series-database/' },
  { id: 644, title: 'Vector Databases: Milvus, Pinecone, pgvector and HNSW search indexing', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/vector-database/' },
  { id: 645, title: 'Search Engines: Elasticsearch Inverted Index and Shard allocation', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/elasticsearch-introduction/' },
  { id: 648, title: 'Database Caching Patterns: Cache-Aside, Write-Through, Write-Behind', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/caching-system-design-concept/' },
  { id: 668, title: 'BASE Properties (Basically Available, Soft State, Eventual Consistency) in NoSQL', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/acid-vs-base-comparison-in-dbms/' },
  { id: 669, title: 'Document Stores vs Key-Value Stores vs Graph Databases design trade-offs', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/difference-between-document-database-and-key-value-database/' },
  { id: 670, title: 'DynamoDB Partition Keys, Sort Keys, and Local/Global Secondary Indexes', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/amazon-dynamodb-indexes/' },
  { id: 671, title: 'Cassandra Write Path: Memtable, Commit Log, and SSTable flush mechanics', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/apache-cassandra-write-path/' },
  { id: 672, title: 'Cassandra Read Path: Bloom Filters, Row Cache, Partition Summary, and SSTables', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/apache-cassandra-read-path/' },
  { id: 673, title: 'LSM-Trees (Log-Structured Merge-Trees) vs B-Trees write amplification comparison', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/log-structured-merge-tree-lsm-tree/' },
  { id: 674, title: 'ScyllaDB and Cassandra peer-to-peer replication ring topology', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/data-replication-in-cassandra/' },
  { id: 675, title: 'Gossip Protocol and Node failure detection in Cassandra/DynamoDB', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/gossip-protocol/' },
  { id: 676, title: 'Redis Persistence Models: RDB snapshots vs AOF append-only log files', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/redis-persistence-rdb-and-aof/' },
  { id: 677, title: 'Redis Clustering, Sentinel high availability, and hash slots hashing', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/redis-cluster-and-sentinel/' },
  { id: 678, title: 'Vector Databases Similarity metrics: Cosine, Dot Product, and L2 Distance', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/similarity-metrics-in-vector-databases/' },
  { id: 679, title: 'Hierarchical Navigable Small World (HNSW) graphs index in Vector DBs', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/hierarchical-navigable-small-world-hnsw/' },
  { id: 680, title: 'Inverted Indexes in Document Search: TF-IDF vs BM25 scoring algorithms', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/tf-idf-model-for-information-retrieval/' },
  { id: 681, title: 'Eventual Consistency models: Read-Your-Writes and Monotonic Read consistency', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/eventual-consistency/' },
  { id: 682, title: 'Conflict resolution in NoSQL: Last-Write-Wins (LWW) vs Vector Clocks', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/conflict-resolution-in-distributed-systems/' },
  { id: 683, title: 'Time-to-Live (TTL) expiration strategies in Key-Value and Document DBs', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/time-to-live-ttl-in-nosql/' },
  { id: 684, title: 'Graph Databases Cypher/Gremlin traversal optimization and index lookups', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/neo4j-cypher-query-optimization/' },
  { id: 685, title: 'Neo4j Double-degree freedom, relationships, and property graphs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/neo4j-graph-relationships/' },
  { id: 686, title: 'Time-Series Databases: TSM (Time Structured Merge) files', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/time-series-databases-tsdb/' },
  { id: 687, title: 'Prometheus Pull-based collection model vs Pushgateway setups', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/prometheus-monitoring-tool/' },
  { id: 688, title: 'Elasticsearch Shard Allocation, replicas, and index split strategies', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/elasticsearch-shards-and-replicas/' },
  { id: 689, title: 'Saga Pattern Orchestration vs Choreography in distributed transactions', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/saga-pattern-in-microservices/' },
  { id: 690, title: 'Outbox Pattern for reliable database state events microservices messaging', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/transactional-outbox-pattern/' },
  { id: 691, title: 'CAP Theorem Proof and Network Partition definition', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cap-theorem-proof/' },
  { id: 692, title: 'Single-Leader vs Multi-Leader replication conflict resolution strategies', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/replication-conflict-resolution/' },
  { id: 693, title: 'Leaderless replication write/read quorums (W + R > N)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/leaderless-replication/' },
  { id: 694, title: 'Replication Lag anomalies: Read-after-write and Monotonic reads', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/replication-lag/' },
  { id: 695, title: 'CQRS (Command Query Responsibility Segregation) pattern with NoSQL reads', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/cqrs-design-pattern/' },
  { id: 696, title: 'Distributed Lock managers: Redlock algorithm using Redis', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/redis-redlock/' },
  { id: 697, title: 'Vector Embeddings pipelines, text chunking, and metadata filtering', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/vector-embeddings/' },
  { id: 698, title: 'MongoDB Sharded Cluster: Config Servers, Query Routers (mongos), Shards', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/sharding-in-mongodb/' },
  { id: 699, title: 'DynamoDB Streams and change-data-capture (CDC) event streaming', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dynamodb-streams/' },
  { id: 700, title: 'Cassandra Lightweight Transactions (LWT) and Paxos consensus protocol', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/cassandra-lightweight-transactions/' },
  { id: 701, title: 'Redis Pub/Sub vs Redis Streams log-based message queues', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/redis-streams/' }
];

export default function NoSQLRoadmapPage() {
  const [nosqlSolved, setNosqlSolved] = useState(0);

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
    setNosqlSolved(getSolvedCount('databases-nosql'));
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
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
              <Database className="h-6 w-6 text-purple-400" />
              NoSQL Database
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
              Focus on distributed datastores, CAP and PACELC trade-offs, consensus algorithms (Paxos & Raft), consistent hashing rings, document formats (MongoDB), and vector databases.
            </p>
          </div>

          {/* Quick Metrics display */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-zinc-900/30 border border-zinc-800 p-3 rounded-xl shrink-0">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">NoSQL Theory</span>
              <span className="text-xs font-semibold text-zinc-300">{nosqlSolved} / 50 Solved</span>
            </div>
          </div>
        </div>

        {/* Content Syllabus */}
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="p-4 bg-purple-950/5 border border-purple-900/10 rounded-xl">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider">NoSQL Syllabus</h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              Focus on distributed datastores, CAP and PACELC trade-offs, consensus algorithms (Paxos & Raft), consistent hashing rings, document formats (MongoDB), keyspaces (Redis), and vector databases.
            </p>
          </div>
          <QuestionsTable
            questions={nosqlTheoryQuestions}
            storagePrefix="databases-nosql"
            searchPlaceholder="Search NoSQL architecture topics..."
          />
        </div>
      </div>
    </div>
  );
}
