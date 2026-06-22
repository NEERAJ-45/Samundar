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
      <p className="text-sm text-zinc-500">Loading Java topics...</p>
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
const STORAGE_PREFIX = 'backend-java';

const javaQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 601 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/java/';

  // 1-35 Core Java, 36-50 Advanced Java
  if (index < 35) {
    const coreTopics = [
      'OOP Concept: Inheritance in Java',
      'OOP Concept: Polymorphism in Java',
      'OOP Concept: Encapsulation in Java',
      'OOP Concept: Abstraction in Java',
      'Abstract Class vs Interface in Java',
      'Java Access Modifiers (private, default, protected, public)',
      'Method Overriding vs Method Overloading in Java',
      'Constructor in Java & Constructor Chaining',
      'The "this" and "super" keywords in Java',
      'String, StringBuffer, and StringBuilder in Java',
      'String Constant Pool (SCP) in Java',
      'Exception Handling: Checked vs Unchecked Exceptions',
      'Try-Catch-Finally block & Try-with-resources in Java',
      'Custom Exceptions in Java',
      'Java Collections Framework Overview',
      'ArrayList vs LinkedList in Java',
      'HashSet vs TreeSet in Java',
      'HashMap Internals & Hashing Collision resolution',
      'LinkedHashMap and WeakHashMap in Java',
      'TreeMap and SortedMap in Java',
      'Comparable vs Comparator in Java',
      'Vector vs ArrayList in Java',
      'Java Generics: Wildcards and Type Erasure',
      'Multithreading: Lifecycle of a Thread in Java',
      'Creating Threads: Runnable interface vs Thread class',
      'Thread Synchronization & Lock Synchronization',
      'Inter-thread Communication: wait(), notify(), and notifyAll()',
      'Volatile Keyword in Java Memory Model',
      'ReentrantLock vs Synchronized block in Java',
      'Thread Safety: AtomicVariables and CAS operations',
      'Executor Framework: ThreadPoolExecutor & ScheduledExecutorService',
      'Callable vs Runnable in Java',
      'Concurrent Collections: ConcurrentHashMap Internals',
      'CopyOnWriteArrayList & BlockingQueue in Java',
      'Java Streams API: Intermediate vs Terminal Operations'
    ];
    title = coreTopics[index % coreTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Inheritance')) link = 'https://www.geeksforgeeks.org/inheritance-in-java/';
    else if (title.includes('Polymorphism')) link = 'https://www.geeksforgeeks.org/polymorphism-in-java/';
    else if (title.includes('Encapsulation')) link = 'https://www.geeksforgeeks.org/encapsulation-in-java/';
    else if (title.includes('Abstraction')) link = 'https://www.geeksforgeeks.org/abstraction-in-java-2/';
    else if (title.includes('Interface')) link = 'https://www.geeksforgeeks.org/difference-between-abstract-class-and-interface-in-java/';
    else if (title.includes('Access Modifiers')) link = 'https://www.geeksforgeeks.org/access-modifiers-java/';
    else if (title.includes('Overriding')) link = 'https://www.geeksforgeeks.org/difference-between-method-overloading-and-method-overriding-in-java/';
    else if (title.includes('Constructor')) link = 'https://www.geeksforgeeks.org/constructors-in-java/';
    else if (title.includes(' SCP')) link = 'https://www.geeksforgeeks.org/string-constant-pool-in-java/';
    else if (title.includes('String')) link = 'https://www.geeksforgeeks.org/string-vs-stringbuilder-vs-stringbuffer-in-java/';
    else if (title.includes('Checked vs Unchecked')) link = 'https://www.geeksforgeeks.org/checked-vs-unchecked-exceptions-in-java/';
    else if (title.includes('Collections')) link = 'https://www.geeksforgeeks.org/collections-in-java-2/';
    else if (title.includes('ArrayList vs LinkedList')) link = 'https://www.geeksforgeeks.org/arraylist-vs-linkedlist-in-java/';
    else if (title.includes('HashSet vs TreeSet')) link = 'https://www.geeksforgeeks.org/hashset-vs-treeset-in-java/';
    else if (title.includes('HashMap Internals')) link = 'https://www.geeksforgeeks.org/internal-working-of-hashmap-java/';
    else if (title.includes('Generics')) link = 'https://www.geeksforgeeks.org/generics-in-java/';
    else if (title.includes('Thread Lifecycle')) link = 'https://www.geeksforgeeks.org/lifecycle-and-states-of-a-thread-in-java/';
    else if (title.includes('wait()')) link = 'https://www.geeksforgeeks.org/inter-thread-communication-java/';
    else if (title.includes('Volatile')) link = 'https://www.geeksforgeeks.org/volatile-keyword-in-java/';
    else if (title.includes('ConcurrentHashMap')) link = 'https://www.geeksforgeeks.org/concurrenthashmap-in-java/';
    else if (title.includes('Streams')) link = 'https://www.geeksforgeeks.org/java-8-streams-with-examples/';
    else link = 'https://www.geeksforgeeks.org/java-collections-framework/';
  } else {
    const advTopics = [
      'JVM Architecture: ClassLoader, Memory Area & Execution Engine',
      'Java ClassLoaders Hierarchy & Bootstrap ClassLoader',
      'Garbage Collection Algorithms in Java (G1 vs CMS)',
      'Z Garbage Collector (ZGC) & low-latency GC design',
      'Java Memory Model (JMM): Happens-Before relationship',
      'Java Memory Tuning: Heap Size vs Stack Size setting',
      'Java Serialization & Deserialization process',
      'The "transient" and "volatile" modifiers in serialization',
      'Reflection API in Java: Dynamic class loading & method invocation',
      'Java Annotations: Custom runtime annotations creation',
      'Functional Interfaces & Lambda expression compiler details',
      'ForkJoinPool and Parallel Streams in Java',
      'CompletableFuture in Java: Async programming primitives',
      'Design Patterns: Singleton implementation (Double-checked locking)',
      'Design Patterns: Factory vs Abstract Factory patterns in Java'
    ];
    title = advTopics[(index - 35) % advTopics.length];
    difficulty = 'HARD';
    if (title.includes('JVM Architecture')) link = 'https://www.geeksforgeeks.org/jvm-works-jvm-architecture-explained/';
    else if (title.includes('ClassLoader')) link = 'https://www.geeksforgeeks.org/classloaders-in-java/';
    else if (title.includes('Garbage Collection')) link = 'https://www.geeksforgeeks.org/garbage-collection-in-java/';
    else if (title.includes('Memory Model')) link = 'https://www.geeksforgeeks.org/java-memory-model-happens-before-relation/';
    else if (title.includes('Serialization')) link = 'https://www.geeksforgeeks.org/serialization-in-java/';
    else if (title.includes('Reflection')) link = 'https://www.geeksforgeeks.org/reflection-in-java/';
    else if (title.includes('CompletableFuture')) link = 'https://www.geeksforgeeks.org/completablefuture-in-java-with-examples/';
    else if (title.includes('Singleton')) link = 'https://www.geeksforgeeks.org/singleton-class-java/';
    else link = 'https://www.geeksforgeeks.org/advanced-java-tutorials/';
  }

  return { id, title, difficulty, link };
});

export default function JavaQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <Navbar />
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/backend"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Backend Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Java Programming Roadmap</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Core syntax, Collections, Streams API, Concurrency, and advanced JVM memory tuning.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={javaQuestions}
          storagePrefix="backend-java"
          searchPlaceholder="Search Java topics..."
        />
      </div>
    </div>
  );
}
