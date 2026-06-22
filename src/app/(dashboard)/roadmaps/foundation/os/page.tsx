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
      <p className="text-sm text-zinc-500">Loading OS roadmap topics...</p>
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
const STORAGE_PREFIX = 'foundation-os';

const osQuestions: QuestionItem[] = [
  { id: 101, title: 'What is an Operating System and what are its primary functions?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/functions-of-operating-system/' },
  { id: 102, title: 'Explain the difference between a process and a thread.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/videos/process-vs-threads-in-operating-system/' },
  { id: 103, title: 'What are the various states of a process during its lifecycle?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/videos/process-states-in-operating-system/' },
  { id: 104, title: 'What is a Process Control Block (PCB) and what information does it hold?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/process-control-block-in-os/' },
  { id: 105, title: 'Explain Context Switching and the overheads associated with it.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/context-switch-in-operating-system/' },
  { id: 106, title: 'What is CPU Scheduling and why is it necessary?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/videos/scheduling-algorithms-in-operating-system/' },
  { id: 107, title: 'Explain First-Come, First-Served (FCFS) CPU scheduling algorithm.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/program-for-fcfs-cpu-scheduling-set-1/' },
  { id: 108, title: 'Explain Shortest Job First (SJF) scheduling (Preemptive and Non-Preemptive).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/shortest-job-first-or-sjf-cpu-scheduling/' },
  { id: 109, title: 'Explain Round Robin (RR) CPU scheduling algorithm with time quanta.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/round-robin-scheduling-in-operating-system/' },
  { id: 110, title: 'Explain Priority Scheduling and the problem of starvation (with aging solution).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/starvation-and-aging-in-operating-systems/' },
  { id: 111, title: 'What is Multi-level Queue and Multi-level Feedback Queue Scheduling?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/difference-between-multilevel-queue-mlq-and-multi-level-feedback-queue-mlfq-cpu-scheduling-algorithms/' },
  { id: 112, title: 'What is Inter-Process Communication (IPC)? Explain Shared Memory vs Message Passing.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/inter-process-communication-ipc/' },
  { id: 113, title: 'What is the Critical Section Problem? What are the three requirements to solve it?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/critical-section-in-synchronization/' },
  { id: 114, title: 'Explain Peterson\'s Solution for two-process synchronization.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/videos/peterson-solution-in-operating-systems/' },
  { id: 115, title: 'What are Mutexes and Semaphores? Explain Binary vs Counting Semaphores.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/mutex-vs-semaphore/' },
  { id: 116, title: 'Explain the Producer-Consumer (Bounded Buffer) synchronization problem.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/producer-consumer-problem-using-semaphores-set-1/' },
  { id: 117, title: 'Explain the Readers-Writers classic synchronization problem.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/readers-writers-problem-set-1-introduction-and-readers-preference-solution/' },
  { id: 118, title: 'Explain the Dining Philosophers classic synchronization problem.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/dining-philosopher-problem-using-semaphores/' },
  { id: 119, title: 'What is a Deadlock? What are the four necessary Coffman conditions for a deadlock?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/introduction-of-deadlock-in-operating-system/' },
  { id: 120, title: 'Explain Resource Allocation Graphs (RAG) and how they detect deadlocks.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/resource-allocation-graph-rag-in-operating-system/' },
  { id: 121, title: 'Explain Deadlock Avoidance and the Banker\'s Algorithm in detail.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/dsa/bankers-algorithm-in-operating-system/' },
  { id: 122, title: 'What are the methods for handling deadlocks (Prevention, Avoidance, Detection, Ignorance)?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/deadlock-prevention/' },
  { id: 123, title: 'What is logical vs physical address space and what is the role of the MMU?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/logical-and-physical-address-in-operating-system/' },
  { id: 124, title: 'Explain Contiguous Memory Allocation and Partition Allocation (First Fit, Best Fit, Worst Fit).', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/partition-allocation-methods-in-memory-management/' },
  { id: 125, title: 'Explain Fragmentation (Internal vs External Fragmentation) and how compaction helps.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/difference-between-internal-and-external-fragmentation/' },
  { id: 126, title: 'What is Paging? Explain page tables, pages, frames, and translation mechanisms.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/paging-in-operating-system/' },
  { id: 127, title: 'What is a Translation Lookaside Buffer (TLB) and how does it speed up address translation?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/translation-lookaside-buffer-tlb-in-paging/' },
  { id: 128, title: 'What is Hierarchical (Multi-level) Paging and Inverted Page Tables?', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/two-level-paging-and-multi-level-paging-in-os/' },
  { id: 129, title: 'What is Segmentation? How is it different from Paging?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/difference-between-paging-and-segmentation/' },
  { id: 130, title: 'What is Virtual Memory? Explain Demand Paging and Page Faults.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/what-is-demand-paging-in-operating-system/' },
  { id: 131, title: 'Explain the FIFO (First-In-First-Out) Page Replacement Algorithm and Belady\'s Anomaly.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/dsa/program-page-replacement-algorithms-set-2-fifo/' },
  { id: 132, title: 'Explain the Optimal Page Replacement Algorithm (OPT/MIN).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/optimal-page-replacement-algorithm/' },
  { id: 133, title: 'Explain the Least Recently Used (LRU) Page Replacement Algorithm.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/videos/least-recently-used-lru-page-replacement-algorithm-in-os/' },
  { id: 134, title: 'What is Thrashing? Explain working-set model and page-fault frequency to control thrashing.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/techniques-to-handle-thrashing/' },
  { id: 135, title: 'What is a File System? Explain File allocation methods (Contiguous, Linked, Indexed).', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/file-allocation-methods/' },
  { id: 136, title: 'Explain Directory Structures (Single level, Two-level, Tree-structured, Acyclic Graph).', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/structures-of-directory-in-operating-system/' },
  { id: 137, title: 'What is Disk Scheduling? Explain FCFS and SSTF Disk Scheduling algorithms.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/disk-scheduling-algorithms/' },
  { id: 138, title: 'Explain SCAN, C-SCAN, LOOK, and C-LOOK Disk Scheduling algorithms.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/scan-elevator-disk-scheduling-algorithms/' },
  { id: 139, title: 'Explain Raid Levels (RAID 0, RAID 1, RAID 5, RAID 6, RAID 10) and their trade-offs.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/raid-redundant-arrays-of-independent-disks/' },
  { id: 140, title: 'What are System Calls? Explain user mode vs kernel mode protection.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/introduction-of-system-call/' },
  { id: 141, title: 'What is a Spooling and how does it differ from Buffering?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/difference-between-spooling-and-buffering/' },
  { id: 142, title: 'What is the Fork System Call? Explain child and parent process creation.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/fork-system-call/' },
  { id: 143, title: 'Explain Zombie processes vs Orphan processes in Linux.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/zombie-and-orphan-processes-in-c/' },
  { id: 144, title: 'What is cache memory and explain temporal vs spatial locality.', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/locality-of-reference-and-cache-operation-in-cache-memory/' },
  { id: 145, title: 'Explain how virtual address is translated in a system with cache and TLB.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/translation-lookaside-buffer-tlb-in-paging/' },
  { id: 146, title: 'What is dynamic loading vs dynamic linking and shared libraries?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/static-and-dynamic-linking-in-operating-systems/' },
  { id: 147, title: 'Explain the working of UNIX Inodes and file lookup resolution.', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/operating-systems/inode-in-operating-system/' },
  { id: 148, title: 'What is memory-mapped I/O vs isolated I/O?', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/memory-mapped-i-o-and-isolated-i-o/' },
  { id: 149, title: 'What is DMA (Direct Memory Access) and why is it important?', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/operating-systems/direct-memory-access-dma-in-computer-architecture/' },
  { id: 150, title: 'Explain the difference between Monolithic, Microkernel, and Hybrid OS architectures.', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/operating-systems/difference-between-microkernel-and-monolithic-kernel/' }
];

export default function OSQuestionsPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Operating Systems roadmap</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Foundational and advanced topics in CPU scheduling, memory management, synchronization, and storage.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={osQuestions}
          storagePrefix="foundation-os"
          searchPlaceholder="Search OS questions..."
        />
      </div>
    </div>
  );
}
