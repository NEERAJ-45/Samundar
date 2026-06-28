'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading React topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const reactQuestions: QuestionItem[] = Array.from({ length: 50 }, (_, index) => {
  const id = 801 + index;
  let title = '';
  let difficulty = 'MEDIUM';
  let link = 'https://www.geeksforgeeks.org/reactjs/';

  // 1-30 Core React, 31-50 Ecosystem & Next.js
  if (index < 30) {
    const coreTopics = [
      'What is React and what are its key features?',
      'Understanding Virtual DOM and the Reconciliation process',
      'React Elements vs React Components',
      'Functional Components vs Class Components in React',
      'State vs Props in React: How data flows',
      'The React Component Lifecycle: Mounting, Updating, Unmounting',
      'Handling Events in React & SyntheticEvent overview',
      'Conditional Rendering in React: Ternary operators & short-circuiting',
      'Understanding Lists & Keys in React: Why keys matter',
      'Controlled vs Uncontrolled Components & ref usages',
      'React Hooks: useState for state management',
      'React Hooks: useEffect & cleaning up side effects',
      'React Hooks: useContext and sharing global state',
      'React Hooks: useRef for persistent values and DOM access',
      'React Hooks: useMemo for memoizing expensive calculations',
      'React Hooks: useCallback for preventing function recreation',
      'React Hooks: useReducer for complex state machines',
      'Writing Custom Hooks in React for code reuse',
      'Rules of Hooks in React: Execution order constraints',
      'Forms Handling in React: Handling multiple inputs',
      'React Context API vs Prop Drilling',
      'Error Boundaries in React Class Components',
      'React Fragments: Why they are used over extra divs',
      'Higher-Order Components (HOC) pattern in React',
      'Render Props pattern in React',
      'React.memo for performance optimization',
      'Code Splitting in React using React.lazy and Suspense',
      'Strict Mode in React: What features it flags',
      'Lifting State Up: Sharing state between siblings',
      'CSS in React: Inline styles, CSS Modules & TailwindCSS integration'
    ];
    title = coreTopics[index % coreTopics.length];
    difficulty = index % 3 === 0 ? 'EASY' : 'MEDIUM';
    if (title.includes('Virtual DOM')) link = 'https://www.geeksforgeeks.org/reactjs-virtual-dom/';
    else if (title.includes('Elements vs Components')) link = 'https://www.geeksforgeeks.org/react-js-elements-vs-components/';
    else if (title.includes('State vs Props')) link = 'https://www.geeksforgeeks.org/reactjs-state-vs-props/';
    else if (title.includes('Lifecycle')) link = 'https://www.geeksforgeeks.org/reactjs-lifecycle-of-components/';
    else if (title.includes('useState')) link = 'https://www.geeksforgeeks.org/reactjs-usestate-hook/';
    else if (title.includes('useEffect')) link = 'https://www.geeksforgeeks.org/reactjs-useeffect-hook/';
    else if (title.includes('useContext')) link = 'https://www.geeksforgeeks.org/reactjs-usecontext-hook/';
    else if (title.includes('useRef')) link = 'https://www.geeksforgeeks.org/reactjs-useref-hook/';
    else if (title.includes('useMemo')) link = 'https://www.geeksforgeeks.org/react-js-usememo-hook/';
    else if (title.includes('useCallback')) link = 'https://www.geeksforgeeks.org/react-usecallback-hook/';
    else if (title.includes('custom hooks')) link = 'https://www.geeksforgeeks.org/creating-a-custom-react-hook/';
    else if (title.includes('React.memo')) link = 'https://www.geeksforgeeks.org/react-memo/';
    else if (title.includes('Suspense')) link = 'https://www.geeksforgeeks.org/reactjs-suspense/';
    else link = 'https://www.geeksforgeeks.org/react-hooks-tutorial/';
  } else {
    const advTopics = [
      'Next.js Overview: Why Next.js over vanilla React?',
      'Next.js Routing: App Router (folders structure) vs Pages Router',
      'React Server Components (RSC) vs Client Components',
      'Data Fetching in Server Components: fetch() cache options',
      'Server-Side Rendering (SSR) vs Static Site Generation (SSG) in Next.js',
      'Incremental Static Regeneration (ISR) mechanics in Next.js',
      'Dynamic Routing and Route Parameters in Next.js App Router',
      'Special files in Next.js: layout.js, template.js, loading.js, error.js',
      'Route Handlers (API Routes) in Next.js App Router',
      'Server Actions in Next.js: Mutating data directly from form submit',
      'Next.js Optimizations: next/image, next/font, and next/script',
      'State Management: Redux Toolkit core (Store, Slice, Actions, Reducers)',
      'State Management: Zustand for lightweight global state',
      'State Management: React Query (TanStack Query) for server state caching',
      'Optimizing Web Vitals (LCP, FID, CLS) in React & Next.js applications',
      'SEO Best Practices in Next.js: Metadata APIs and sitemaps generation',
      'Internationalization (i18n) routing in Next.js',
      'React Testing: React Testing Library & Jest setups',
      'Component Testing: Mocking props, API calls & user interactions',
      'Deploying React & Next.js to Vercel, Netlify, or Docker container'
    ];
    title = advTopics[(index - 30) % advTopics.length];
    difficulty = 'HARD';
    if (title.includes('App Router')) link = 'https://www.geeksforgeeks.org/next-js-app-routing-system/';
    else if (title.includes('Server Components')) link = 'https://www.geeksforgeeks.org/react-server-components/';
    else if (title.includes('SSR vs SSG')) link = 'https://www.geeksforgeeks.org/difference-between-ssr-and-ssg-in-next-js/';
    else if (title.includes('ISR')) link = 'https://www.geeksforgeeks.org/incremental-static-regeneration-isr-in-next-js/';
    else if (title.includes('Redux')) link = 'https://www.geeksforgeeks.org/redux-toolkit-tutorial/';
    else if (title.includes('React Query')) link = 'https://www.geeksforgeeks.org/react-query-tutorial/';
    else if (title.includes('SEO')) link = 'https://www.geeksforgeeks.org/next-js-seo/';
    else link = 'https://www.geeksforgeeks.org/next-js-tutorials/';
  }

  return { id, title, difficulty, link };
});

export default function ReactQuestionsPage() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <Link
            href="/roadmaps/frontend"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Frontend Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">React & Next.js Roadmap</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Virtual DOM, state management, hooks, suspense, SSR, server components, and layout files.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={reactQuestions}
          storagePrefix="frontend-react"
          searchPlaceholder="Search React & Next.js topics..."
        />
      </div>
    </div>
  );
}
