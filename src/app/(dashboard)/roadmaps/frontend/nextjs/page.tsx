'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const QuestionsTable = dynamic(() => import('@/components/roadmaps/QuestionsTable'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-sm text-zinc-500">Loading Next.js topics...</p>
    </div>
  ),
});

interface QuestionItem {
  id: number;
  title: string;
  difficulty: string;
  link: string;
}

const nextjsQuestions: QuestionItem[] = [
  { id: 851, title: 'Next.js Foundations: Evolution from client-side React to Server-First Frameworks', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/nextjs-introduction/' },
  { id: 852, title: 'Page Router vs App Router layout paradigms and directory routing structures', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/next-js-app-routing-system/' },
  { id: 853, title: 'React Server Components (RSC) vs Client Components (RCC) execution model and serialization boundaries', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/react-server-components/' },
  { id: 854, title: 'Server-Side Rendering (SSR): request-time rendering flow and hydration lifecycle', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/difference-between-ssr-and-ssg-in-next-js/' },
  { id: 855, title: 'Static Site Generation (SSG): build-time pre-rendering and server delivery advantages', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/difference-between-ssr-and-ssg-in-next-js/' },
  { id: 856, title: 'Dynamic Rendering: automatic detection of dynamic functions (cookies(), headers(), searchParams)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/nextjs-dynamic-routes/' },
  { id: 857, title: 'Custom layouts (layout.js) vs nested pages (page.js) and structural rendering', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/next-js-app-routing-system/' },
  { id: 858, title: 'Templates (template.js): DOM node recreation, state resets, and page animations', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/templates-in-nextjs/' },
  { id: 859, title: 'Static Route Generation: using generateStaticParams() to pre-render dynamic segments', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-generatestaticparams/' },
  { id: 860, title: 'Dynamic Routing: catch-all ([[...slug]]) and optional catch-all routing patterns', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-dynamic-routing/' },
  { id: 861, title: 'Route Handlers: custom API endpoints creation (GET, POST, PUT, DELETE) inside App Router', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/route-handlers-in-next-js/' },
  { id: 862, title: 'Parallel Routes (@folder): rendering multiple pages conditionally in the same layout', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/next-js-parallel-routes/' },
  { id: 863, title: 'Intercepting Routes ((.)folder): contextual route overlays and modals routing', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/next-js-intercepting-routes/' },
  { id: 864, title: 'Suspense-based Streaming: progressive page rendering, chunked HTML transfers, and skeletons', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/reactjs-suspense/' },
  { id: 865, title: 'Built-in error handling: localizing exceptions via error.js and global-error.js', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-error-handling/' },
  { id: 866, title: 'Server Actions: executing secure server-side logic from form actions without API routes', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/server-actions-in-next-js/' },
  { id: 867, title: 'Server Actions: Progressive enhancement and optimistic UI updates using useOptimistic hook', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/react-useoptimistic-hook/' },
  { id: 868, title: 'Form Validation: schema verification (Zod/HookForm) inside Server Actions and returning errors', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/next-js-form-validation/' },
  { id: 869, title: 'Route Middleware: intercepts requests, handles redirects, rewrites, and CORS headers', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/next-js-middleware/' },
  { id: 870, title: 'Internationalized (i18n) routing: dynamic locale resolution and subpath routing', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/internationalization-i18n-in-next-js/' },
  { id: 871, title: 'next/image Component: layout shifts prevention, modern format encoding, srcSets generation', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/next-js-image-component/' },
  { id: 872, title: 'next/font Component: zero Cumulative Layout Shift (CLS) font loading, Google/local font caching', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/next-js-font-optimization/' },
  { id: 873, title: 'next/script Component: script loading strategies (beforeInteractive, afterInteractive, lazyOnload)', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/nextjs-script-component/' },
  { id: 874, title: 'Advanced Caching: Request Memoization (deduplicating fetch requests within a single render pass)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-caching/' },
  { id: 875, title: 'Advanced Caching: Data Cache (persisting fetch data across requests and user sessions)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-caching/' },
  { id: 876, title: 'Advanced Caching: Full Route Cache (caching static HTML & RSC payload at build/revalidation time)', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-caching/' },
  { id: 877, title: 'Advanced Caching: Router Cache (client-side memory cache of routes during navigation)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/nextjs-caching/' },
  { id: 878, title: 'Incremental Static Regeneration (ISR): Time-based revalidation and on-demand cache purge', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/incremental-static-regeneration-isr-in-next-js/' },
  { id: 879, title: 'Database connectivity: server-side pooling and prisma/mongoose clients instantiation in RSCs', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/connecting-next-js-to-mongodb/' },
  { id: 880, title: 'Security: preventing SQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF)', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-security/' },
  { id: 881, title: 'Metadata API: dynamic title, description, open graph tags generation in layout/page headers', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/nextjs-metadata/' },
  { id: 882, title: 'Draft Mode: previewing unpublished CMS content dynamically by bypassing caching', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-draft-mode/' },
  { id: 883, title: 'Next.js Configurations: custom redirects, rewrites, headers, and webpack adjustments in next.config.js', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-configuration/' },
  { id: 884, title: 'Standalone build mode: compiling Next.js into a minimal production-ready server folder', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/deploying-next-js-application/' },
  { id: 885, title: 'Deployment: Vercel serverless functions vs hosting inside self-managed Docker containers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/deploying-next-js-application/' },
  { id: 886, title: 'Web Vitals tracking: profiling and reporting LCP, FID, CLS, and INP metrics in Next.js', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/react-web-vitals/' },
  { id: 887, title: 'Next.js testing setup: configuring Jest, React Testing Library, and testing API route handlers', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-testing/' },
  { id: 888, title: 'Server Component Mocking: testing server actions and RSC inputs with mock databases', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-mocking/' },
  { id: 889, title: 'Third-party integrations: configuring MSW (Mock Service Worker) for API mock testing', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/mock-service-worker-msw/' },
  { id: 890, title: 'Dynamic imports: code-splitting using next/dynamic and bundle chunk optimization', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/code-splitting-in-reactjs/' },
  { id: 891, title: 'Middleware Authentication: validating session tokens and redirecting unauthenticated traffic', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-middleware/' },
  { id: 892, title: 'Next.js Monorepo architectures: setting up workspaces using Turborepo and pnpm', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/turborepo-monorepo-setup/' },
  { id: 893, title: 'Build caching: optimizing compilation pipelines with remote caching in Turborepo', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/turborepo-monorepo-setup/' },
  { id: 894, title: 'Dynamic routing fallback: configuring fallback: true vs fallback: blocking in Page Router', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-dynamic-routing/' },
  { id: 895, title: 'Dynamic imports: load-on-demand patterns for modular component assets', difficulty: 'EASY', link: 'https://www.geeksforgeeks.org/code-splitting-in-reactjs/' },
  { id: 896, title: 'Security headers: configuring CSP (Content Security Policy), HSTS, and X-Content-Type-Options', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/next-js-security/' },
  { id: 897, title: 'Edge Runtime: executing light, fast middleware and APIs on Vercel Edge networks', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-edge-runtime/' },
  { id: 898, title: 'Vercel KV and Vercel Postgres integration inside server routes and actions', difficulty: 'MEDIUM', link: 'https://www.geeksforgeeks.org/nextjs-integration/' },
  { id: 899, title: 'Route Segments configs: configuring revalidate, dynamic, fetchCache, and preferredRegion', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/nextjs-route-segment-configs/' },
  { id: 900, title: 'Next.js Schema migrations: coordinating DB schemas update alongside zero-downtime server updates', difficulty: 'HARD', link: 'https://www.geeksforgeeks.org/database-migrations/' }
];

export default function NextjsQuestionsPage() {
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Next.js Development</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Deep dive into server components caching, middleware routing, layouts, and Vercel Edge Runtime.
            </p>
          </div>
        </div>

        <QuestionsTable
          questions={nextjsQuestions}
          storagePrefix="frontend-nextjs"
          searchPlaceholder="Search Next.js topics..."
        />
      </div>
    </div>
  );
}
